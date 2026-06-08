-- Run this in the Supabase SQL editor before using the Data Breach Notification feature.
-- Also set BREACH_NOTIFY_SECRET in Supabase Dashboard → Edge Functions → send-booking-email → Secrets.

create table if not exists public.breach_notification_log (
  id             uuid        primary key default gen_random_uuid(),
  sent_at        timestamptz not null default now(),
  breach_description text,
  affected_data  text,
  recipient_count int
);

-- Only service role can access — no public reads or writes
alter table public.breach_notification_log enable row level security;
