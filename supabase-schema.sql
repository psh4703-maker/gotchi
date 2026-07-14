create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'Founder',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists is_admin boolean not null default false;

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
  join_process text not null default '',
  work_type text not null default '',
  team_members jsonb not null default '[]',
  created_at timestamptz not null default now()
);

alter table public.alliances add column if not exists join_process text not null default '';
alter table public.alliances add column if not exists work_type text not null default '';
alter table public.alliances add column if not exists team_members jsonb not null default '[]';

alter table public.profiles enable row level security;
alter table public.quests enable row level security;
alter table public.alliances enable row level security;

drop policy if exists "Profiles are readable by everyone" on public.profiles;
create policy "Profiles are readable by everyone"
on public.profiles for select
using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id);

drop policy if exists "Quests are readable by everyone" on public.quests;
create policy "Quests are readable by everyone"
on public.quests for select
using (true);

drop policy if exists "Logged-in users can create quests" on public.quests;
create policy "Logged-in users can create quests"
on public.quests for insert
with check (auth.uid() = owner_id);

drop policy if exists "Owners can update their quests" on public.quests;
create policy "Owners can update their quests"
on public.quests for update
using (auth.uid() = owner_id);

drop policy if exists "Owners can delete their quests" on public.quests;
create policy "Owners can delete their quests"
on public.quests for delete
using (auth.uid() = owner_id);

drop policy if exists "Alliances are readable by everyone" on public.alliances;
create policy "Alliances are readable by everyone"
on public.alliances for select
using (true);

drop policy if exists "Logged-in users can create alliances" on public.alliances;
create policy "Logged-in users can create alliances"
on public.alliances for insert
with check (auth.uid() = owner_id);

drop policy if exists "Owners can update their alliances" on public.alliances;
create policy "Owners can update their alliances"
on public.alliances for update
using (auth.uid() = owner_id);

drop policy if exists "Owners can delete their alliances" on public.alliances;
create policy "Owners can delete their alliances"
on public.alliances for delete
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
  payment_note text not null default '',
  payment_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applications_target_check check (
    (type = 'quest' and quest_id is not null and alliance_id is null) or
    (type = 'alliance' and alliance_id is not null and quest_id is null)
  )
);

alter table public.applications add column if not exists payment_note text not null default '';
alter table public.applications add column if not exists payment_confirmed boolean not null default false;

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

-- helper: checks whether the current user is an admin (used by dispute-resolution policies)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- applications: only the two participants can see or touch a match
drop policy if exists "Participants can read their applications" on public.applications;
create policy "Participants can read their applications"
on public.applications for select
using (auth.uid() = applicant_id or auth.uid() = owner_id or public.is_admin());

drop policy if exists "Logged-in users can apply" on public.applications;
create policy "Logged-in users can apply"
on public.applications for insert
with check (auth.uid() = applicant_id and auth.uid() <> owner_id);

drop policy if exists "Participants can update application status" on public.applications;
create policy "Participants can update application status"
on public.applications for update
using (auth.uid() = applicant_id or auth.uid() = owner_id or public.is_admin());

-- messages: only participants of the parent application
drop policy if exists "Participants can read messages" on public.application_messages;
create policy "Participants can read messages"
on public.application_messages for select
using (
  exists (
    select 1 from public.applications a
    where a.id = application_id
      and (a.applicant_id = auth.uid() or a.owner_id = auth.uid())
  )
  or public.is_admin()
);

drop policy if exists "Participants can send messages" on public.application_messages;
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
drop policy if exists "Public reviews are readable by everyone, private by participants" on public.reviews;
create policy "Public reviews are readable by everyone, private by participants"
on public.reviews for select
using (
  is_public = true or auth.uid() = reviewer_id or auth.uid() = reviewee_id or public.is_admin()
);

drop policy if exists "Participants can leave one review after closing" on public.reviews;
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

-- ============================================================
-- 무응답 자동 처리: 48시간 응답 없는 지원은 자동 만료,
-- 72시간 확인 없는 제출은 자동 종료. pg_cron으로 매시간 실행.
-- ============================================================

alter table public.applications drop constraint if exists applications_status_check;
alter table public.applications add constraint applications_status_check
  check (status in ('pending', 'accepted', 'rejected', 'submitted', 'closed', 'disputed', 'expired'));

create extension if not exists pg_cron;

create or replace function public.auto_resolve_stale_applications()
returns void
language plpgsql
security definer
as $$
begin
  -- 48시간 넘게 수락/거절 응답이 없는 지원은 자동 만료
  update public.applications
  set status = 'expired', updated_at = now()
  where status = 'pending'
    and created_at < now() - interval '48 hours';

  -- 72시간 넘게 완료 확인이 없는 제출은 자동 종료
  update public.applications
  set status = 'closed', updated_at = now()
  where status = 'submitted'
    and updated_at < now() - interval '72 hours';
end;
$$;

do $$
begin
  perform cron.unschedule('auto-resolve-stale-applications');
exception when others then
  null;
end;
$$;

select cron.schedule(
  'auto-resolve-stale-applications',
  '0 * * * *',
  $$select public.auto_resolve_stale_applications();$$
);

-- ============================================================
-- 스팸/어뷰징 방지: 하루 업로드·지원 개수 제한 (DB 레벨, 우회 불가)
-- ============================================================

create or replace function public.enforce_quest_rate_limit()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.quests where owner_id = new.owner_id and created_at > now() - interval '24 hours') >= 10 then
    raise exception 'RATE_LIMIT: 하루에 올릴 수 있는 팝업 미션은 최대 10개예요. 내일 다시 시도해주세요.';
  end if;
  return new;
end;
$$;

drop trigger if exists quests_rate_limit on public.quests;
create trigger quests_rate_limit
before insert on public.quests
for each row execute function public.enforce_quest_rate_limit();

create or replace function public.enforce_alliance_rate_limit()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.alliances where owner_id = new.owner_id and created_at > now() - interval '24 hours') >= 5 then
    raise exception 'RATE_LIMIT: 하루에 올릴 수 있는 팀 모집글은 최대 5개예요. 내일 다시 시도해주세요.';
  end if;
  return new;
end;
$$;

drop trigger if exists alliances_rate_limit on public.alliances;
create trigger alliances_rate_limit
before insert on public.alliances
for each row execute function public.enforce_alliance_rate_limit();

create or replace function public.enforce_application_rate_limit()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.applications where applicant_id = new.applicant_id and created_at > now() - interval '24 hours') >= 20 then
    raise exception 'RATE_LIMIT: 하루에 지원할 수 있는 횟수는 최대 20건이에요. 내일 다시 시도해주세요.';
  end if;
  return new;
end;
$$;

drop trigger if exists applications_rate_limit on public.applications;
create trigger applications_rate_limit
before insert on public.applications
for each row execute function public.enforce_application_rate_limit();

-- ============================================================
-- 이메일 알림: Resend API를 Postgres(pg_net)에서 직접 호출.
-- app_config에 실제 Resend API 키를 넣기 전까지는 조용히 무시됨(에러 없음).
-- ============================================================

create extension if not exists pg_net;

create table if not exists public.app_config (
  key text primary key,
  value text not null
);

alter table public.app_config enable row level security;
-- 의도적으로 정책을 하나도 안 둠: anon/authenticated 역할은 이 테이블을 절대 못 읽음.
-- security definer 함수(postgres 소유)만 내부적으로 접근 가능.

insert into public.app_config (key, value) values
  ('resend_api_key', 'REPLACE_WITH_YOUR_RESEND_API_KEY'),
  ('from_email', 'gotchi <onboarding@resend.dev>')
on conflict (key) do nothing;

create or replace function public.send_email(to_email text, subject text, html text)
returns void
language plpgsql
security definer
as $$
declare
  api_key text;
  sender text;
begin
  if to_email is null then
    return;
  end if;

  select value into api_key from public.app_config where key = 'resend_api_key';
  select value into sender from public.app_config where key = 'from_email';

  if api_key is null or api_key = 'REPLACE_WITH_YOUR_RESEND_API_KEY' then
    return; -- 아직 API 키 설정 전이면 조용히 스킵
  end if;

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || api_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', sender,
      'to', to_email,
      'subject', subject,
      'html', html
    )
  );
end;
$$;

create or replace function public.notify_new_application()
returns trigger
language plpgsql
security definer
as $$
declare
  owner_email text;
  mission_title text;
begin
  select email into owner_email from auth.users where id = new.owner_id;

  if new.type = 'quest' then
    select title into mission_title from public.quests where id = new.quest_id;
  else
    select team_name into mission_title from public.alliances where id = new.alliance_id;
  end if;

  perform public.send_email(
    owner_email,
    'gotchi: 새 지원이 도착했어요',
    '<p>"' || coalesce(mission_title, '') || '"에 새 지원이 도착했어요. gotchi Workspace 탭에서 확인해주세요.</p>'
  );
  return new;
end;
$$;

drop trigger if exists on_application_created on public.applications;
create trigger on_application_created
after insert on public.applications
for each row execute function public.notify_new_application();

create or replace function public.notify_application_status_change()
returns trigger
language plpgsql
security definer
as $$
declare
  target_email text;
  mission_title text;
  subject text;
  body text;
begin
  if new.status = old.status then
    return new;
  end if;

  if new.type = 'quest' then
    select title into mission_title from public.quests where id = new.quest_id;
  else
    select team_name into mission_title from public.alliances where id = new.alliance_id;
  end if;

  if new.status = 'accepted' then
    select email into target_email from auth.users where id = new.applicant_id;
    subject := 'gotchi: 지원이 수락됐어요';
    body := '<p>"' || coalesce(mission_title, '') || '" 지원이 수락됐어요. Workspace에서 진행해주세요.</p>';
  elsif new.status = 'submitted' then
    select email into target_email from auth.users where id = new.owner_id;
    subject := 'gotchi: 제출물이 도착했어요';
    body := '<p>"' || coalesce(mission_title, '') || '" 제출물을 확인해주세요.</p>';
  elsif new.status = 'closed' then
    select email into target_email from auth.users where id = new.applicant_id;
    perform public.send_email(target_email, 'gotchi: 미션이 종료됐어요', '<p>"' || coalesce(mission_title, '') || '"가 종료됐어요. 리뷰를 남겨주세요.</p>');
    select email into target_email from auth.users where id = new.owner_id;
    subject := 'gotchi: 미션이 종료됐어요';
    body := '<p>"' || coalesce(mission_title, '') || '"가 종료됐어요. 리뷰를 남겨주세요.</p>';
  elsif new.status = 'rejected' then
    select email into target_email from auth.users where id = new.applicant_id;
    subject := 'gotchi: 지원 결과 안내';
    body := '<p>"' || coalesce(mission_title, '') || '" 지원이 아쉽게 거절됐어요.</p>';
  elsif new.status = 'expired' then
    select email into target_email from auth.users where id = new.applicant_id;
    subject := 'gotchi: 지원이 자동 만료됐어요';
    body := '<p>"' || coalesce(mission_title, '') || '" 지원에 48시간 동안 응답이 없어 자동 만료됐어요.</p>';
  else
    return new;
  end if;

  perform public.send_email(target_email, subject, body);
  return new;
end;
$$;

drop trigger if exists on_application_status_change on public.applications;
create trigger on_application_status_change
after update on public.applications
for each row execute function public.notify_application_status_change();

create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
as $$
declare
  recipient_id uuid;
  recipient_email text;
begin
  select case when new.sender_id = a.applicant_id then a.owner_id else a.applicant_id end
  into recipient_id
  from public.applications a where a.id = new.application_id;

  select email into recipient_email from auth.users where id = recipient_id;

  perform public.send_email(
    recipient_email,
    'gotchi: 새 메시지가 도착했어요',
    '<p>워크스페이스에 새 메시지가 도착했어요: "' || left(new.body, 80) || '"</p>'
  );
  return new;
end;
$$;

drop trigger if exists on_message_created on public.application_messages;
create trigger on_message_created
after insert on public.application_messages
for each row execute function public.notify_new_message();

-- ============================================================
-- 회원 탈퇴: 본인 계정을 삭제. auth.users 삭제 시 profiles/quests/
-- alliances/applications/reviews/messages가 on delete cascade로 자동 정리됨.
-- ============================================================

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_own_account() to authenticated;

-- ============================================================
-- 프로필 사진: Storage 버킷 + 프로필 컬럼
-- ============================================================

alter table public.profiles add column if not exists avatar_url text not null default '';

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatar images are publicly accessible" on storage.objects;
create policy "Avatar images are publicly accessible"
on storage.objects for select
using (bucket_id = 'avatars');

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
on storage.objects for insert
with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar"
on storage.objects for update
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
on storage.objects for delete
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- 인앱 알림: 이메일과 같은 트리거에서 함께 기록되는 알림 테이블
-- ============================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  title text not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

drop policy if exists "Users can read their own notifications" on public.notifications;
create policy "Users can read their own notifications"
on public.notifications for select
using (auth.uid() = user_id);

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications"
on public.notifications for update
using (auth.uid() = user_id);

create or replace function public.create_notification(
  target_user_id uuid,
  target_application_id uuid,
  notif_title text,
  notif_body text
)
returns void
language plpgsql
security definer
as $$
begin
  if target_user_id is null then
    return;
  end if;

  insert into public.notifications (user_id, application_id, title, body)
  values (target_user_id, target_application_id, notif_title, notif_body);
end;
$$;

-- 기존 알림 트리거 함수들을 확장해서, 이메일과 함께 인앱 알림도 같이 기록

create or replace function public.notify_new_application()
returns trigger
language plpgsql
security definer
as $$
declare
  owner_email text;
  mission_title text;
begin
  select email into owner_email from auth.users where id = new.owner_id;

  if new.type = 'quest' then
    select title into mission_title from public.quests where id = new.quest_id;
  else
    select team_name into mission_title from public.alliances where id = new.alliance_id;
  end if;

  perform public.send_email(
    owner_email,
    'gotchi: 새 지원이 도착했어요',
    '<p>"' || coalesce(mission_title, '') || '"에 새 지원이 도착했어요. gotchi Workspace 탭에서 확인해주세요.</p>'
  );

  perform public.create_notification(
    new.owner_id,
    new.id,
    '새 지원이 도착했어요',
    '"' || coalesce(mission_title, '') || '"에 새 지원이 도착했어요.'
  );

  return new;
end;
$$;

create or replace function public.notify_application_status_change()
returns trigger
language plpgsql
security definer
as $$
declare
  target_email text;
  target_user_id uuid;
  mission_title text;
  subject text;
  body text;
begin
  if new.status = old.status then
    return new;
  end if;

  if new.type = 'quest' then
    select title into mission_title from public.quests where id = new.quest_id;
  else
    select team_name into mission_title from public.alliances where id = new.alliance_id;
  end if;

  if new.status = 'accepted' then
    target_user_id := new.applicant_id;
    subject := 'gotchi: 지원이 수락됐어요';
    body := '"' || coalesce(mission_title, '') || '" 지원이 수락됐어요. Workspace에서 진행해주세요.';
  elsif new.status = 'submitted' then
    target_user_id := new.owner_id;
    subject := 'gotchi: 제출물이 도착했어요';
    body := '"' || coalesce(mission_title, '') || '" 제출물을 확인해주세요.';
  elsif new.status = 'closed' then
    perform public.send_email(
      (select email from auth.users where id = new.applicant_id),
      'gotchi: 미션이 종료됐어요',
      '<p>"' || coalesce(mission_title, '') || '"가 종료됐어요. 리뷰를 남겨주세요.</p>'
    );
    perform public.create_notification(
      new.applicant_id, new.id, '미션이 종료됐어요',
      '"' || coalesce(mission_title, '') || '"가 종료됐어요. 리뷰를 남겨주세요.'
    );
    target_user_id := new.owner_id;
    subject := 'gotchi: 미션이 종료됐어요';
    body := '"' || coalesce(mission_title, '') || '"가 종료됐어요. 리뷰를 남겨주세요.';
  elsif new.status = 'rejected' then
    target_user_id := new.applicant_id;
    subject := 'gotchi: 지원 결과 안내';
    body := '"' || coalesce(mission_title, '') || '" 지원이 아쉽게 거절됐어요.';
  elsif new.status = 'expired' then
    target_user_id := new.applicant_id;
    subject := 'gotchi: 지원이 자동 만료됐어요';
    body := '"' || coalesce(mission_title, '') || '" 지원에 48시간 동안 응답이 없어 자동 만료됐어요.';
  else
    return new;
  end if;

  select email into target_email from auth.users where id = target_user_id;
  perform public.send_email(target_email, subject, '<p>' || body || '</p>');
  perform public.create_notification(target_user_id, new.id, subject, body);

  return new;
end;
$$;

create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
as $$
declare
  recipient_id uuid;
  recipient_email text;
begin
  select case when new.sender_id = a.applicant_id then a.owner_id else a.applicant_id end
  into recipient_id
  from public.applications a where a.id = new.application_id;

  select email into recipient_email from auth.users where id = recipient_id;

  perform public.send_email(
    recipient_email,
    'gotchi: 새 메시지가 도착했어요',
    '<p>워크스페이스에 새 메시지가 도착했어요: "' || left(new.body, 80) || '"</p>'
  );

  perform public.create_notification(
    recipient_id,
    new.application_id,
    '새 메시지가 도착했어요',
    left(new.body, 80)
  );

  return new;
end;
$$;
