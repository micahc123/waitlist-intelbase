-- ============================================================================
-- Intelbase AI OS - application data backbone (work-surface entities)
-- ============================================================================
-- Run this in the Supabase SQL editor (Dashboard -> SQL -> New query), AFTER
-- schema.sql (it depends on public.organizations and the public.is_org_owner
-- helper). It is IDEMPOTENT: safe to run multiple times.
--
-- These are the real entities behind the product work surfaces:
--   contacts         - people the business talks to (CRM root record)
--   leads            - sales pipeline rows with a stage + value + score
--   conversations    - inbox threads across channels (web/email/whatsapp/ig)
--   messages         - individual turns inside a conversation
--   actions          - the approvals queue AND the audit log of agent activity
--   agent_configs    - per-agent settings (enabled / autonomy / guardrails)
--   knowledge_docs   - documents ingested into the knowledge base
--
-- Security model: same as schema.sql. RLS is enabled on every table and access
-- is restricted to the owner of the parent organization via is_org_owner(org_id).
-- For messages (no direct org_id) we join through the parent conversation.
-- ============================================================================

-- Needed for gen_random_uuid() (also created by schema.sql; harmless to repeat).
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- contacts  - the CRM root record for a person/business we talk to
-- ----------------------------------------------------------------------------
create table if not exists public.contacts (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  name        text not null,
  company     text,
  email       text,
  phone       text,
  channel     text,                                   -- where we first met them
  created_at  timestamptz not null default now()
);

create index if not exists contacts_org_id_idx     on public.contacts (org_id);
create index if not exists contacts_created_at_idx on public.contacts (org_id, created_at desc);

-- ----------------------------------------------------------------------------
-- leads  - one pipeline row; the CRM / Leads surface
-- ----------------------------------------------------------------------------
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  name        text not null,
  company     text,
  value_cents bigint not null default 0,              -- deal value in cents (HK$)
  stage       text not null default 'new'
                check (stage in ('new','qualified','booked','won','lost')),
  source      text,                                   -- Web / Ads / WhatsApp / Referral
  score       numeric not null default 0,             -- 0..100 lead score
  owner       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists leads_org_id_idx     on public.leads (org_id);
create index if not exists leads_stage_idx       on public.leads (org_id, stage);
create index if not exists leads_created_at_idx  on public.leads (org_id, created_at desc);

-- ----------------------------------------------------------------------------
-- conversations  - an inbox thread; the Inbox surface
-- ----------------------------------------------------------------------------
create table if not exists public.conversations (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations (id) on delete cascade,
  contact_name  text,
  channel       text not null default 'web'
                  check (channel in ('web','email','whatsapp','ig')),
  subject       text,
  status        text not null default 'open'
                  check (status in ('open','waiting','closed')),
  last_at       timestamptz not null default now(),   -- last activity, for sorting
  created_at    timestamptz not null default now()
);

create index if not exists conversations_org_id_idx  on public.conversations (org_id);
create index if not exists conversations_status_idx   on public.conversations (org_id, status);
create index if not exists conversations_last_at_idx  on public.conversations (org_id, last_at desc);

-- ----------------------------------------------------------------------------
-- messages  - turns inside a conversation (no direct org_id; via conversation)
-- ----------------------------------------------------------------------------
create table if not exists public.messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations (id) on delete cascade,
  role             text not null check (role in ('visitor','agent','human')),
  body             text not null,
  created_at       timestamptz not null default now()
);

create index if not exists messages_conversation_idx
  on public.messages (conversation_id, created_at asc);

-- ----------------------------------------------------------------------------
-- actions  - the Approvals queue AND the audit log of agent activity
-- ----------------------------------------------------------------------------
-- A 'pending' action is awaiting human decision. 'approved'/'rejected' are
-- human decisions (decided_at/decided_by set). 'auto' means the agent acted on
-- its own (autonomy=auto) and the row is purely an audit trail entry.
create table if not exists public.actions (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  agent_id    text not null,                          -- concierge / inbox / ...
  type        text not null,                          -- short machine type slug
  summary     text not null,                          -- human-readable one-liner
  detail      jsonb not null default '{}'::jsonb,     -- structured context
  status      text not null default 'pending'
                check (status in ('pending','approved','rejected','auto')),
  created_at  timestamptz not null default now(),
  decided_at  timestamptz,
  decided_by  text
);

create index if not exists actions_org_id_idx     on public.actions (org_id);
create index if not exists actions_status_idx      on public.actions (org_id, status);
create index if not exists actions_created_at_idx  on public.actions (org_id, created_at desc);

-- ----------------------------------------------------------------------------
-- agent_configs  - per-agent settings; the Agents config surface
-- ----------------------------------------------------------------------------
create table if not exists public.agent_configs (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  agent_id     text not null,                         -- concierge / inbox / ...
  enabled      boolean not null default true,
  autonomy     text not null default 'approve'
                 check (autonomy in ('manual','approve','auto')),
  instructions text,
  guardrails   jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now(),
  unique (org_id, agent_id)
);

create index if not exists agent_configs_org_id_idx on public.agent_configs (org_id);

-- ----------------------------------------------------------------------------
-- knowledge_docs  - documents in the knowledge base; the Knowledge surface
-- ----------------------------------------------------------------------------
create table if not exists public.knowledge_docs (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  title       text not null,
  source      text,                                   -- upload / url / faq / ...
  status      text not null default 'processing'
                check (status in ('processing','ready','failed')),
  chunks      int not null default 0,                 -- number of embedded chunks
  created_at  timestamptz not null default now()
);

create index if not exists knowledge_docs_org_id_idx    on public.knowledge_docs (org_id);
create index if not exists knowledge_docs_status_idx      on public.knowledge_docs (org_id, status);
create index if not exists knowledge_docs_created_at_idx  on public.knowledge_docs (org_id, created_at desc);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.contacts       enable row level security;
alter table public.leads          enable row level security;
alter table public.conversations  enable row level security;
alter table public.messages       enable row level security;
alter table public.actions        enable row level security;
alter table public.agent_configs  enable row level security;
alter table public.knowledge_docs enable row level security;

-- Drop-then-create so re-running the file updates policies cleanly (idempotent).

-- contacts
drop policy if exists "contacts_select_org_owner" on public.contacts;
create policy "contacts_select_org_owner"
  on public.contacts for select using (public.is_org_owner(org_id));
drop policy if exists "contacts_modify_org_owner" on public.contacts;
create policy "contacts_modify_org_owner"
  on public.contacts for all
  using (public.is_org_owner(org_id)) with check (public.is_org_owner(org_id));

-- leads
drop policy if exists "leads_select_org_owner" on public.leads;
create policy "leads_select_org_owner"
  on public.leads for select using (public.is_org_owner(org_id));
drop policy if exists "leads_modify_org_owner" on public.leads;
create policy "leads_modify_org_owner"
  on public.leads for all
  using (public.is_org_owner(org_id)) with check (public.is_org_owner(org_id));

-- conversations
drop policy if exists "conversations_select_org_owner" on public.conversations;
create policy "conversations_select_org_owner"
  on public.conversations for select using (public.is_org_owner(org_id));
drop policy if exists "conversations_modify_org_owner" on public.conversations;
create policy "conversations_modify_org_owner"
  on public.conversations for all
  using (public.is_org_owner(org_id)) with check (public.is_org_owner(org_id));

-- messages: no org_id column, so authorize through the parent conversation.
drop policy if exists "messages_select_via_conversation" on public.messages;
create policy "messages_select_via_conversation"
  on public.messages for select
  using (exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and public.is_org_owner(c.org_id)
  ));
drop policy if exists "messages_modify_via_conversation" on public.messages;
create policy "messages_modify_via_conversation"
  on public.messages for all
  using (exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and public.is_org_owner(c.org_id)
  ))
  with check (exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and public.is_org_owner(c.org_id)
  ));

-- actions
drop policy if exists "actions_select_org_owner" on public.actions;
create policy "actions_select_org_owner"
  on public.actions for select using (public.is_org_owner(org_id));
drop policy if exists "actions_modify_org_owner" on public.actions;
create policy "actions_modify_org_owner"
  on public.actions for all
  using (public.is_org_owner(org_id)) with check (public.is_org_owner(org_id));

-- agent_configs
drop policy if exists "agent_configs_select_org_owner" on public.agent_configs;
create policy "agent_configs_select_org_owner"
  on public.agent_configs for select using (public.is_org_owner(org_id));
drop policy if exists "agent_configs_modify_org_owner" on public.agent_configs;
create policy "agent_configs_modify_org_owner"
  on public.agent_configs for all
  using (public.is_org_owner(org_id)) with check (public.is_org_owner(org_id));

-- knowledge_docs
drop policy if exists "knowledge_docs_select_org_owner" on public.knowledge_docs;
create policy "knowledge_docs_select_org_owner"
  on public.knowledge_docs for select using (public.is_org_owner(org_id));
drop policy if exists "knowledge_docs_modify_org_owner" on public.knowledge_docs;
create policy "knowledge_docs_modify_org_owner"
  on public.knowledge_docs for all
  using (public.is_org_owner(org_id)) with check (public.is_org_owner(org_id));

-- ============================================================================
-- Done. Verify in: Table editor (contacts, leads, conversations, messages,
-- actions, agent_configs, knowledge_docs) and Authentication -> Policies
-- (RLS enabled on all seven).
-- ============================================================================
