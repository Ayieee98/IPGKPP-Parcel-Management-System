create table if not exists public.profiles (
  username text primary key,
  auth_user_id uuid references auth.users(id) on delete set null,
  email text unique not null,
  name text not null,
  id_no text,
  phone text,
  role text not null default 'student' check (role in ('student', 'staff', 'admin')),
  profile_pic text,
  created_at timestamptz not null default now()
);

create table if not exists public.app_state (
  id text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.app_state enable row level security;

drop policy if exists "profiles can be read by app users" on public.profiles;
create policy "profiles can be read by app users"
on public.profiles for select
using (true);

drop policy if exists "profiles can be created during signup" on public.profiles;
create policy "profiles can be created during signup"
on public.profiles for insert
with check (true);

drop policy if exists "profiles can be updated by signed in users" on public.profiles;
create policy "profiles can be updated by signed in users"
on public.profiles for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "app state can be read by app users" on public.app_state;
create policy "app state can be read by app users"
on public.app_state for select
using (true);

drop policy if exists "app state can be created by signed in users" on public.app_state;
create policy "app state can be created by signed in users"
on public.app_state for insert
with check (auth.role() = 'authenticated');

drop policy if exists "app state can be updated by signed in users" on public.app_state;
create policy "app state can be updated by signed in users"
on public.app_state for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');
