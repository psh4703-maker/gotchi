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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'Founder')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- ============================================================
-- Matching workflow: 지원 -> 수락 -> 워크스페이스 -> 완료 -> 리뷰
-- ============================================================

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('quest', 'alliance')),
  quest_id uuid references public.quests(id) on delete cascade,
  alliance_id uuid references public.alliances(id) on delete cascade,
  applicant_id uuid not null references auth.users(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  note text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'submitted', 'closed', 'disputed')),
  submission_note text not null default '',
  submission_link text not null default '',
  applicant_reviewed boolean not null default false,
  owner_reviewed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applications_target_check check (
    (type = 'quest' and quest_id is not null and alliance_id is null) or
    (type = 'alliance' and alliance_id is not null and quest_id is null)
  )
);

create table if not exists public.application_messages (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  reviewee_id uuid not null references auth.users(id) on delete cascade,
  tags text[] not null default '{}',
  comment text not null default '',
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  unique (application_id, reviewer_id, is_public)
);

alter table public.applications enable row level security;
alter table public.application_messages enable row level security;
alter table public.reviews enable row level security;

-- applications: only the two participants can see or touch a match
create policy "Participants can read their applications"
on public.applications for select
using (auth.uid() = applicant_id or auth.uid() = owner_id);

create policy "Logged-in users can apply"
on public.applications for insert
with check (auth.uid() = applicant_id and auth.uid() <> owner_id);

create policy "Participants can update application status"
on public.applications for update
using (auth.uid() = applicant_id or auth.uid() = owner_id);

-- messages: only participants of the parent application
create policy "Participants can read messages"
on public.application_messages for select
using (
  exists (
    select 1 from public.applications a
    where a.id = application_id
      and (a.applicant_id = auth.uid() or a.owner_id = auth.uid())
  )
);

create policy "Participants can send messages"
on public.application_messages for insert
with check (
  auth.uid() = sender_id
  and exists (
    select 1 from public.applications a
    where a.id = application_id
      and (a.applicant_id = auth.uid() or a.owner_id = auth.uid())
  )
);

-- reviews: public reviews are readable by everyone (portfolio display),
-- private ones only by the two people involved. Only participants of a
-- closed application can write a review, one per person.
create policy "Public reviews are readable by everyone, private by participants"
on public.reviews for select
using (
  is_public = true or auth.uid() = reviewer_id or auth.uid() = reviewee_id
);

create policy "Participants can leave one review after closing"
on public.reviews for insert
with check (
  auth.uid() = reviewer_id
  and exists (
    select 1 from public.applications a
    where a.id = application_id
      and a.status = 'closed'
      and (a.applicant_id = auth.uid() or a.owner_id = auth.uid())
      and reviewee_id in (a.applicant_id, a.owner_id)
      and reviewee_id <> auth.uid()
  )
);
