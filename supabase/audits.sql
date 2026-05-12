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

alter table public.audits enable row level security;

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
end
$$;
