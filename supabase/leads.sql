-- Leads table for kundankhatri.com contact form
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 80),
  company text not null check (char_length(company) between 2 and 120),
  designation text,
  location text not null,
  whatsapp text not null,
  email text not null,
  problem text not null check (char_length(problem) between 10 and 2000),
  ip text,
  status text not null default 'new' check (status in ('new','replied','qualified','closed'))
);
-- RLS: nobody reads/writes via anon key; only service role (API route) inserts.
alter table public.leads enable row level security;
-- Defense-in-depth: RLS-enabled + zero policies is already deny-all for anon.
-- This makes intent explicit and survives a future accidental permissive policy.
revoke all on public.leads from anon, authenticated, public;
