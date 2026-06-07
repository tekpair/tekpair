-- ── EXTENSIONS ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── HELPER: update_updated_at() ──────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── TABLE: profiles ──────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  first_name  text        not null default '',
  last_name   text        not null default '',
  phone       text        not null default '',
  address     text        not null default '',
  is_admin    boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function update_updated_at();

-- ── TABLE: bookings ──────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id                uuid        primary key default uuid_generate_v4(),
  user_id           uuid        references auth.users(id) on delete set null,
  type              text        not null check (type in ('inhome', 'remote')),
  first_name        text        not null default '',
  last_name         text        not null default '',
  email             text        not null default '',
  phone             text,
  address           text,
  service           text,
  issue_description text        not null,
  preferred_date    text        not null,
  preferred_time    text        not null,
  payment_method    text,
  referral_source   text,
  status            text        not null default 'pending'
                                check (status in ('pending','confirmed','completed','cancelled','rescheduled')),
  admin_notes       text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger trg_bookings_updated_at
  before update on public.bookings
  for each row execute function update_updated_at();

-- ── HELPER: is_admin() ───────────────────────────────────────────────────────
-- Defined AFTER profiles table so the reference resolves.
-- SECURITY DEFINER bypasses RLS inside policy checks.
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- ── TRIGGER: auto-create profile on sign-up ───────────────────────────────────
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.bookings  enable row level security;

-- profiles policies
create policy "profiles: user reads own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: user updates own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles: admin reads all"
  on public.profiles for select
  using (is_admin());

-- bookings policies
create policy "bookings: anyone can insert"
  on public.bookings for insert
  with check (true);

create policy "bookings: user reads own"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "bookings: user updates own"
  on public.bookings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "bookings: admin reads all"
  on public.bookings for select
  using (is_admin());

create policy "bookings: admin updates all"
  on public.bookings for update
  using (is_admin());

-- ── GRANT ADMIN TO connor@tekpair.com ────────────────────────────────────────
-- After connor signs up at /account/, run this in the SQL editor:
--
--   update public.profiles
--   set is_admin = true
--   where id = (
--     select id from auth.users where email = 'connor@tekpair.com'
--   );
