-- ── TABLE: booking_email_log ─────────────────────────────────────────────────
-- Tracks every email sent per booking+action for rate limiting (60-min window).
-- Run this in the Supabase SQL editor.

create table if not exists public.booking_email_log (
  id         uuid        primary key default uuid_generate_v4(),
  booking_id uuid        not null references public.bookings(id) on delete cascade,
  action     text        not null,
  sent_at    timestamptz not null default now()
);

create index if not exists idx_email_log_lookup
  on public.booking_email_log (booking_id, action, sent_at);

alter table public.booking_email_log enable row level security;

create policy "email_log: admin reads all"
  on public.booking_email_log for select
  using (is_admin());

create policy "email_log: insert allowed"
  on public.booking_email_log for insert
  with check (true);
