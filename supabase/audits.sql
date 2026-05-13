create extension if not exists pgcrypto;

create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  team_size integer not null check (team_size > 0),
  use_case text not null,
  tool_selections jsonb not null default '[]'::jsonb,
  findings jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  chart_data jsonb not null default '[]'::jsonb,
  monthly_spend integer not null default 0,
  monthly_savings integer not null default 0,
  yearly_savings integer not null default 0,
  primary_savings_driver text not null default '',
  generated_summary text not null default '',
  audit_payload jsonb not null
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  email text not null check (position('@' in email) > 1),
  company_name text,
  role text,
  team_size integer check (team_size is null or team_size > 0),
  email_status text not null default 'skipped'
    check (email_status in ('sent', 'skipped', 'failed'))
);

create index if not exists audits_created_at_idx
  on public.audits (created_at desc);

create index if not exists leads_audit_id_idx
  on public.leads (audit_id);

create index if not exists leads_created_at_idx
  on public.leads (created_at desc);

alter table public.audits enable row level security;
alter table public.leads enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'audits'
      and policyname = 'Allow public audit creation'
  ) then
    create policy "Allow public audit creation"
      on public.audits
      for insert
      to anon
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'audits'
      and policyname = 'Allow public audit reports'
  ) then
    create policy "Allow public audit reports"
      on public.audits
      for select
      to anon
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'leads'
      and policyname = 'Allow public lead capture'
  ) then
    create policy "Allow public lead capture"
      on public.leads
      for insert
      to anon
      with check (true);
  end if;
end
$$;

notify pgrst, 'reload schema';
