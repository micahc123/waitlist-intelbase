-- Run this once in your Supabase project:
-- Dashboard → SQL Editor → New query → paste → Run.

create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  created_at  timestamptz not null default now()
);

-- Lock the table down. The API route uses the service_role key, which
-- bypasses RLS, so no public policies are needed. With RLS on and no
-- policies, the public anon key cannot read or write this table.
alter table public.waitlist enable row level security;
