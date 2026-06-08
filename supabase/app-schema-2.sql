-- ============================================================================
-- Intelbase AI OS - application data backbone, part 2 (work-surface entities)
-- ============================================================================
-- Run this in the Supabase SQL editor (Dashboard -> SQL -> New query), AFTER
-- schema.sql AND app-schema.sql (it depends on public.organizations and the
-- public.is_org_owner helper). It is IDEMPOTENT: safe to run multiple times.
--
-- These are the real entities behind the next wave of product work surfaces:
--   contacts (extended)  - CRM record gains type / tags / value / last contact
--   tasks                - the Tasks board (todo / doing / done)
--   calendar_events      - the Calendar surface (bookings + meetings)
--   automations          - the Automations / workflow rules surface
--   notifications        - the in-app notifications feed
--   team_members         - the Team / members surface
--
-- Security model: same as app-schema.sql. RLS is enabled on every table and
-- access is restricted to the owner of the parent organization via
-- is_org_owner(org_id).
-- ============================================================================

-- Needed for gen_random_uuid() (also created earlier; harmless to repeat).
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- contacts (extended)  - add CRM fields onto the table from app-schema.sql.
-- Uses add-column-if-not-exists so this runs cleanly whether the base table is
-- fresh or already populated.
-- ----------------------------------------------------------------------------
alter table public.contacts
  add column if not exists type            text not null default 'lead';
alter table public.contacts
  add column if not exists tags            text[] not null default '{}'::text[];
alter table public.contacts
  add column if not exists last_contact_at timestamptz;
alter table public.contacts
  add column if not exists value_cents     bigint not null default 0;

-- CHECK enum for contacts.type (drop-then-add so it is idempotent).
alter table public.contacts drop constraint if exists contacts_type_check;
alter table public.contacts
  add constraint contacts_type_check
  check (type in ('customer','vendor','partner','team','lead'));

create index if not exists contacts_type_idx on public.contacts (org_id, type);

-- ----------------------------------------------------------------------------
-- tasks  - the Tasks board; human + agent created work items
-- ----------------------------------------------------------------------------
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  title       text not null,
  detail      text,
  status      text not null default 'todo'
                check (status in ('todo','doing','done')),
  priority    text not null default 'med'
                check (priority in ('low','med','high')),
  due_at      timestamptz,
  assignee    text,
  source      text not null default 'human'
                check (source in ('human','agent')),
  agent_id    text,                                   -- set when source = agent
  created_at  timestamptz not null default now()
);

create index if not exists tasks_org_id_idx     on public.tasks (org_id);
create index if not exists tasks_status_idx       on public.tasks (org_id, status);
create index if not exists tasks_due_at_idx       on public.tasks (org_id, due_at);
create index if not exists tasks_created_at_idx   on public.tasks (org_id, created_at desc);

-- ----------------------------------------------------------------------------
-- calendar_events  - the Calendar surface; bookings + meetings
-- ----------------------------------------------------------------------------
create table if not exists public.calendar_events (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  title       text not null,
  start_at    timestamptz not null,
  end_at      timestamptz not null,
  attendee    text,
  channel     text,                                   -- web / phone / in-person ...
  status      text not null default 'confirmed'
                check (status in ('confirmed','tentative','cancelled')),
  location    text,
  booked_by   text,                                   -- e.g. 'scheduler' or 'You'
  created_at  timestamptz not null default now()
);

create index if not exists calendar_events_org_id_idx   on public.calendar_events (org_id);
create index if not exists calendar_events_start_at_idx on public.calendar_events (org_id, start_at);
create index if not exists calendar_events_status_idx   on public.calendar_events (org_id, status);

-- ----------------------------------------------------------------------------
-- automations  - the Automations / workflow rules surface
-- ----------------------------------------------------------------------------
create table if not exists public.automations (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  name        text not null,
  enabled     boolean not null default true,
  trigger     jsonb not null default '{}'::jsonb,     -- e.g. {event, source}
  steps       jsonb not null default '[]'::jsonb,     -- ordered list of step objs
  last_run_at timestamptz,
  runs        int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists automations_org_id_idx  on public.automations (org_id);
create index if not exists automations_enabled_idx  on public.automations (org_id, enabled);

-- ----------------------------------------------------------------------------
-- notifications  - the in-app notifications feed
-- ----------------------------------------------------------------------------
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  kind        text not null default 'system'
                check (kind in ('approval','lead','inbox','agent','system')),
  title       text not null,
  body        text,
  read        boolean not null default false,
  link        text,                                   -- relative surface slug
  created_at  timestamptz not null default now()
);

create index if not exists notifications_org_id_idx     on public.notifications (org_id);
create index if not exists notifications_read_idx         on public.notifications (org_id, read);
create index if not exists notifications_created_at_idx   on public.notifications (org_id, created_at desc);

-- ----------------------------------------------------------------------------
-- team_members  - the Team / members surface
-- ----------------------------------------------------------------------------
create table if not exists public.team_members (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  email       text not null,
  name        text,
  role        text not null default 'member'
                check (role in ('owner','admin','member','viewer')),
  status      text not null default 'invited'
                check (status in ('active','invited')),
  invited_at  timestamptz,
  created_at  timestamptz not null default now(),
  unique (org_id, email)
);

create index if not exists team_members_org_id_idx on public.team_members (org_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.tasks           enable row level security;
alter table public.calendar_events enable row level security;
alter table public.automations     enable row level security;
alter table public.notifications   enable row level security;
alter table public.team_members    enable row level security;

-- Drop-then-create so re-running the file updates policies cleanly (idempotent).

-- tasks
drop policy if exists "tasks_select_org_owner" on public.tasks;
create policy "tasks_select_org_owner"
  on public.tasks for select using (public.is_org_owner(org_id));
drop policy if exists "tasks_modify_org_owner" on public.tasks;
create policy "tasks_modify_org_owner"
  on public.tasks for all
  using (public.is_org_owner(org_id)) with check (public.is_org_owner(org_id));

-- calendar_events
drop policy if exists "calendar_events_select_org_owner" on public.calendar_events;
create policy "calendar_events_select_org_owner"
  on public.calendar_events for select using (public.is_org_owner(org_id));
drop policy if exists "calendar_events_modify_org_owner" on public.calendar_events;
create policy "calendar_events_modify_org_owner"
  on public.calendar_events for all
  using (public.is_org_owner(org_id)) with check (public.is_org_owner(org_id));

-- automations
drop policy if exists "automations_select_org_owner" on public.automations;
create policy "automations_select_org_owner"
  on public.automations for select using (public.is_org_owner(org_id));
drop policy if exists "automations_modify_org_owner" on public.automations;
create policy "automations_modify_org_owner"
  on public.automations for all
  using (public.is_org_owner(org_id)) with check (public.is_org_owner(org_id));

-- notifications
drop policy if exists "notifications_select_org_owner" on public.notifications;
create policy "notifications_select_org_owner"
  on public.notifications for select using (public.is_org_owner(org_id));
drop policy if exists "notifications_modify_org_owner" on public.notifications;
create policy "notifications_modify_org_owner"
  on public.notifications for all
  using (public.is_org_owner(org_id)) with check (public.is_org_owner(org_id));

-- team_members
drop policy if exists "team_members_select_org_owner" on public.team_members;
create policy "team_members_select_org_owner"
  on public.team_members for select using (public.is_org_owner(org_id));
drop policy if exists "team_members_modify_org_owner" on public.team_members;
create policy "team_members_modify_org_owner"
  on public.team_members for all
  using (public.is_org_owner(org_id)) with check (public.is_org_owner(org_id));

-- ============================================================================
-- Done. Verify in: Table editor (tasks, calendar_events, automations,
-- notifications, team_members; contacts gains type/tags/value_cents/
-- last_contact_at) and Authentication -> Policies (RLS enabled on all five new).
-- ============================================================================
