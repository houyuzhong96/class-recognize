create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.textbooks (
  id text not null,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  edition text not null,
  display_order integer not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, id)
);

create table if not exists public.chapters (
  id text not null,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  textbook_id text not null,
  name text not null,
  display_order integer not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, id),
  foreign key (owner_id, textbook_id)
    references public.textbooks(owner_id, id) on delete cascade
);

create table if not exists public.sections (
  id text not null,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  chapter_id text not null,
  name text not null,
  display_order integer not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, id),
  foreign key (owner_id, chapter_id)
    references public.chapters(owner_id, id) on delete cascade
);

create table if not exists public.lesson_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  section_id text not null,
  teaching_summary text not null default '',
  student_mistakes text not null default '',
  teaching_reflection text not null default '',
  classic_example text not null default '',
  version integer not null default 1,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (owner_id, section_id)
    references public.sections(owner_id, id) on delete restrict
);

create index if not exists lesson_records_owner_section_idx
on public.lesson_records (owner_id, section_id);

create index if not exists lesson_records_owner_updated_idx
on public.lesson_records (owner_id, updated_at desc);

create table if not exists public.record_revisions (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.lesson_records(id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists textbooks_set_updated_at on public.textbooks;
create trigger textbooks_set_updated_at
before update on public.textbooks
for each row execute function public.set_updated_at();

drop trigger if exists chapters_set_updated_at on public.chapters;
create trigger chapters_set_updated_at
before update on public.chapters
for each row execute function public.set_updated_at();

drop trigger if exists sections_set_updated_at on public.sections;
create trigger sections_set_updated_at
before update on public.sections
for each row execute function public.set_updated_at();

drop trigger if exists lesson_records_set_updated_at on public.lesson_records;
create trigger lesson_records_set_updated_at
before update on public.lesson_records
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.textbooks enable row level security;
alter table public.chapters enable row level security;
alter table public.sections enable row level security;
alter table public.lesson_records enable row level security;
alter table public.record_revisions enable row level security;

create policy "profiles_owner_all"
on public.profiles for all
using (id = auth.uid())
with check (id = auth.uid());

create policy "textbooks_owner_all"
on public.textbooks for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "chapters_owner_all"
on public.chapters for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "sections_owner_all"
on public.sections for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "lesson_records_owner_all"
on public.lesson_records for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "record_revisions_owner_all"
on public.record_revisions for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
