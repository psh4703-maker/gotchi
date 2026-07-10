create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'Founder',
  created_at timestamptz not null default now()
);

create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  mission text not null,
  period text not null,
  reward text not null,
  skills text[] not null default '{}',
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.alliances (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  team_name text not null,
  vision text not null,
  roles text[] not null default '{}',
  equity text not null,
  values text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.quests enable row level security;
alter table public.alliances enable row level security;

create policy "Profiles are readable by everyone"
on public.profiles for select
using (true);

create policy "Users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id);

create policy "Quests are readable by everyone"
on public.quests for select
using (true);

create policy "Logged-in users can create quests"
on public.quests for insert
with check (auth.uid() = owner_id);

create policy "Owners can update their quests"
on public.quests for update
using (auth.uid() = owner_id);

create policy "Alliances are readable by everyone"
on public.alliances for select
using (true);

create policy "Logged-in users can create alliances"
on public.alliances for insert
with check (auth.uid() = owner_id);

create policy "Owners can update their alliances"
on public.alliances for update
using (auth.uid() = owner_id);
