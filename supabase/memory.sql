-- ============================================================================
-- Intelbase MEMORY layer - pgvector long-term memory for the AI OS
-- ============================================================================
-- Run this in the Supabase SQL editor (Dashboard -> SQL -> New query), AFTER
-- schema.sql (it depends on public.organizations and the is_org_owner helper).
-- It is IDEMPOTENT: safe to run multiple times.
--
-- What this creates:
--   extension  vector            - pgvector, for embedding similarity search
--   table      memories          - one row per remembered conversation/record,
--                                   with a 1536-dim embedding (OpenAI
--                                   text-embedding-3-small)
--   index      ivfflat (cosine)  - approximate nearest-neighbour index
--   RLS        org-owner select/insert policies
--   function   match_memories()  - top-k cosine-similarity search for an org
--
-- The app layer (src/lib/memory) writes via the service-role key (bypasses
-- RLS) and reads similarity through match_memories (SECURITY DEFINER, org-scoped).
-- ============================================================================

-- pgvector: provides the `vector` type and cosine distance operators.
create extension if not exists vector;

-- ----------------------------------------------------------------------------
-- memories
-- ----------------------------------------------------------------------------
-- embedding is nullable: rows can be stored without a vector when OpenAI is not
-- configured (they just will not surface in similarity search until embedded).
create table if not exists public.memories (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  kind        text,
  source      text,
  title       text,
  content     text not null,
  embedding   vector(1536),
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- Fast org-scoped recent listing (Cortex list) and per-org filtering.
create index if not exists memories_org_id_created_at_idx
  on public.memories (org_id, created_at desc);

create index if not exists memories_org_id_kind_idx
  on public.memories (org_id, kind);

-- ----------------------------------------------------------------------------
-- Similarity index (ivfflat, cosine)
-- ----------------------------------------------------------------------------
-- ivfflat builds clusters from EXISTING data, so it is most effective once the
-- table holds a meaningful number of rows. It is safe to create on an empty
-- table, but for best recall you may prefer to (re)create it after seeding data.
-- `lists` is a tuning knob (~ rows/1000, min 1); 100 is a sane default.
-- To rebuild later:
--   drop index if exists public.memories_embedding_ivfflat_idx;
--   create index memories_embedding_ivfflat_idx on public.memories
--     using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists memories_embedding_ivfflat_idx
  on public.memories
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- ============================================================================
-- Row Level Security
-- ============================================================================
-- Reuses the public.is_org_owner(uuid) helper installed by schema.sql. If that
-- helper is absent, the policies below would error; run schema.sql first.
alter table public.memories enable row level security;

-- Owners of the parent org can read their org's memories.
drop policy if exists "memories_select_org_owner" on public.memories;
create policy "memories_select_org_owner"
  on public.memories for select
  using (public.is_org_owner(org_id));

-- Owners of the parent org can insert memories for their org.
-- (App writes typically use the service-role key, which bypasses RLS; this
-- policy covers any user-scoped inserts.)
drop policy if exists "memories_insert_org_owner" on public.memories;
create policy "memories_insert_org_owner"
  on public.memories for insert
  with check (public.is_org_owner(org_id));

-- ============================================================================
-- match_memories: top-k cosine-similarity search, scoped to one org
-- ============================================================================
-- SECURITY DEFINER so the service-role / RPC path can run it, but it ALWAYS
-- filters by the caller-supplied p_org_id, so it can never leak cross-org rows.
-- similarity = 1 - cosine_distance, so higher is more similar (range ~0..1).
-- Rows without an embedding are excluded (they cannot be compared).
create or replace function public.match_memories(
  p_org_id uuid,
  p_query  vector(1536),
  p_k      int
)
returns table (
  id          uuid,
  kind        text,
  source      text,
  title       text,
  content     text,
  metadata    jsonb,
  created_at  timestamptz,
  similarity  float
)
language sql
security definer
set search_path = public
stable
as $$
  select
    m.id,
    m.kind,
    m.source,
    m.title,
    m.content,
    m.metadata,
    m.created_at,
    1 - (m.embedding <=> p_query) as similarity
  from public.memories m
  where m.org_id = p_org_id
    and m.embedding is not null
  order by m.embedding <=> p_query
  limit greatest(coalesce(p_k, 6), 1);
$$;

-- ============================================================================
-- Done. Verify in: Table editor (memories) and Authentication -> Policies
-- (RLS enabled). Test search:
--   select * from public.match_memories('<org-uuid>', '[0,0,...]'::vector, 6);
-- ============================================================================
