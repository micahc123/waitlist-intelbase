-- ============================================================================
-- Intelbase SaaS - Supabase schema (auth + multi-tenant foundation)
-- ============================================================================
-- Run this in the Supabase SQL editor (Dashboard -> SQL -> New query).
-- It is IDEMPOTENT: safe to run multiple times. It creates the core tables,
-- enables Row Level Security, defines policies, and installs the new-user
-- trigger that provisions a profile + a default organization for every signup.
--
-- Tables:
--   profiles        - one row per auth user (mirror of basic profile fields)
--   organizations   - tenant; each user owns at least one (created on signup)
--   subscriptions   - Stripe billing state (populated later by the Stripe agent)
--   connections     - integration state per org (populated during onboarding)
--
-- Security model (v1): a user can read/update their OWN profile, and can
-- read/write rows belonging to organizations they OWN (owner_id = auth.uid()).
-- Subscription/plan based gating is layered in later by the Stripe agent.
-- ============================================================================

-- Needed for gen_random_uuid().
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- organizations
-- ----------------------------------------------------------------------------
create table if not exists public.organizations (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  slug        text unique,
  onboarded   boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists organizations_owner_id_idx
  on public.organizations (owner_id);

-- ----------------------------------------------------------------------------
-- subscriptions  (populated by the Stripe agent / webhooks)
-- ----------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  org_id                  uuid not null references public.organizations (id) on delete cascade,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  plan                    text,
  status                  text,
  trial_end               timestamptz,
  current_period_end      timestamptz,
  updated_at              timestamptz not null default now()
);

create index if not exists subscriptions_org_id_idx
  on public.subscriptions (org_id);

-- ----------------------------------------------------------------------------
-- connections  (integration state, set during onboarding)
-- ----------------------------------------------------------------------------
create table if not exists public.connections (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  provider    text not null,
  connected   boolean not null default false,
  meta        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

create index if not exists connections_org_id_idx
  on public.connections (org_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles      enable row level security;
alter table public.organizations enable row level security;
alter table public.subscriptions enable row level security;
alter table public.connections   enable row level security;

-- Drop-then-create so re-running the file updates policies cleanly (idempotent).

-- profiles: a user can see and edit only their own profile row.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- (Insert is handled by the SECURITY DEFINER trigger below, not by clients.)

-- organizations: a user can see/insert/update/delete orgs they own.
drop policy if exists "organizations_select_owner" on public.organizations;
create policy "organizations_select_owner"
  on public.organizations for select
  using (auth.uid() = owner_id);

drop policy if exists "organizations_insert_owner" on public.organizations;
create policy "organizations_insert_owner"
  on public.organizations for insert
  with check (auth.uid() = owner_id);

drop policy if exists "organizations_update_owner" on public.organizations;
create policy "organizations_update_owner"
  on public.organizations for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "organizations_delete_owner" on public.organizations;
create policy "organizations_delete_owner"
  on public.organizations for delete
  using (auth.uid() = owner_id);

-- Helper: does the current user own this org?
create or replace function public.is_org_owner(target_org uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.organizations o
    where o.id = target_org
      and o.owner_id = auth.uid()
  );
$$;

-- subscriptions: readable/writable by the owner of the parent org.
-- (Stripe writes typically use the service role key, which bypasses RLS.)
drop policy if exists "subscriptions_select_org_owner" on public.subscriptions;
create policy "subscriptions_select_org_owner"
  on public.subscriptions for select
  using (public.is_org_owner(org_id));

drop policy if exists "subscriptions_modify_org_owner" on public.subscriptions;
create policy "subscriptions_modify_org_owner"
  on public.subscriptions for all
  using (public.is_org_owner(org_id))
  with check (public.is_org_owner(org_id));

-- connections: readable/writable by the owner of the parent org.
drop policy if exists "connections_select_org_owner" on public.connections;
create policy "connections_select_org_owner"
  on public.connections for select
  using (public.is_org_owner(org_id));

drop policy if exists "connections_modify_org_owner" on public.connections;
create policy "connections_modify_org_owner"
  on public.connections for all
  using (public.is_org_owner(org_id))
  with check (public.is_org_owner(org_id));

-- ============================================================================
-- New-user trigger: provision profile + default organization on signup
-- ============================================================================
-- Standard Supabase pattern. SECURITY DEFINER so it can insert into tables
-- that RLS would otherwise block for the brand-new user. Name comes from the
-- full_name metadata (set during email signup) or falls back to the email.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
  base_slug    text;
  unique_slug  text;
begin
  display_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, display_name)
  on conflict (id) do nothing;

  -- Build a URL-safe, unique slug for the default org.
  base_slug := regexp_replace(lower(coalesce(split_part(new.email, '@', 1), 'workspace')), '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  if base_slug = '' then
    base_slug := 'workspace';
  end if;
  unique_slug := base_slug || '-' || substr(replace(new.id::text, '-', ''), 1, 6);

  insert into public.organizations (owner_id, name, slug)
  values (new.id, display_name || '''s workspace', unique_slug);

  return new;
end;
$$;

-- Re-create the trigger (idempotent).
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Done. Verify in: Table editor (profiles, organizations, subscriptions,
-- connections) and Authentication -> Policies (RLS enabled on all four).
-- ============================================================================
