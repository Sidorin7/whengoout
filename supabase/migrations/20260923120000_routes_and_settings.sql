create table public.routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  travel_minutes integer not null,
  buffer_minutes integer,
  schedule jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index routes_user_id_idx on public.routes (user_id);

alter table public.routes enable row level security;

create policy "routes_select_own" on public.routes
  for select using ((select auth.uid()) = user_id);

create policy "routes_insert_own" on public.routes
  for insert with check ((select auth.uid()) = user_id);

create policy "routes_update_own" on public.routes
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "routes_delete_own" on public.routes
  for delete using ((select auth.uid()) = user_id);

create table public.settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  default_buffer_minutes integer not null default 10
);

alter table public.settings enable row level security;

create policy "settings_select_own" on public.settings
  for select using ((select auth.uid()) = user_id);

create policy "settings_insert_own" on public.settings
  for insert with check ((select auth.uid()) = user_id);

create policy "settings_update_own" on public.settings
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
