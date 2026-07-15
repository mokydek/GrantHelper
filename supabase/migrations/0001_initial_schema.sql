-- GrantHelper initial schema

-- 1. profiles: one row per user, created automatically on signup
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  citizenship text,
  current_level text check (current_level in ('high_school','bachelor','master','phd')),
  target_level text check (target_level in ('bachelor','master','phd','exchange','summer_school')),
  field_of_study text,
  gpa numeric(4,2),
  gpa_scale numeric(5,2) default 4.0,
  volunteer_hours integer not null default 0,
  date_of_birth date,
  ui_language text not null default 'en' check (ui_language in ('en','ru')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. test_scores: standardized test results, one row per test type per user
create table public.test_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  test_type text not null check (test_type in ('SAT','IELTS','TOEFL','ACT','GRE','GMAT','DUOLINGO','NUET','OTHER')),
  score numeric not null,
  taken_at date,
  created_at timestamptz not null default now(),
  unique (user_id, test_type)
);

-- 3. activities: volunteering, projects, awards, olympiads and similar
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_type text not null check (activity_type in ('volunteering','project','work','award','olympiad','leadership','research','other')),
  title text not null,
  organization text,
  description text,
  hours integer,
  started_at date,
  ended_at date,
  created_at timestamptz not null default now()
);

-- 4. documents: essays and application documents
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  doc_type text not null check (doc_type in ('essay','motivation_letter','recommendation_letter','transcript','cv','passport','certificate','other')),
  title text not null,
  content text,
  storage_path text,
  status text not null default 'draft' check (status in ('draft','ready')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. grants: the catalog, eligibility requirements live as columns here
create table public.grants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  provider text not null,
  description text not null,
  country text not null,
  degree_levels text[] not null,
  fields_of_study text[],
  funding_type text not null check (funding_type in ('full','partial','one_time')),
  amount_note text,
  deadline date,
  website_url text not null,
  is_active boolean not null default true,
  min_gpa numeric(4,2),
  min_ielts numeric(3,1),
  min_toefl integer,
  min_sat integer,
  requires_essay boolean not null default false,
  requires_recommendation boolean not null default false,
  min_volunteer_hours integer,
  allowed_citizenships text[],
  age_min integer,
  age_max integer,
  created_at timestamptz not null default now()
);

-- 6. applications: user application tracker, also acts as saved grants
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  grant_id uuid not null references public.grants(id) on delete cascade,
  status text not null default 'planned' check (status in ('planned','in_progress','submitted','accepted','rejected')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, grant_id)
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.test_scores enable row level security;
alter table public.activities enable row level security;
alter table public.documents enable row level security;
alter table public.grants enable row level security;
alter table public.applications enable row level security;

create policy "users manage own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "users manage own test scores" on public.test_scores
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage own activities" on public.activities
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage own documents" on public.documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "authenticated users read active grants" on public.grants
  for select to authenticated using (is_active = true);

create policy "users manage own applications" on public.applications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
