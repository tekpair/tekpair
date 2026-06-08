-- ── FUNCTION: email_has_account ───────────────────────────────────────────────
-- Returns true if the given email belongs to an existing auth user.
-- Called from the booking form (anon key) to prevent booking with another
-- user's registered email address.
-- Run this in the Supabase SQL editor.

create or replace function public.email_has_account(p_email text)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from auth.users where lower(email) = lower(p_email)
  )
$$;

grant execute on function public.email_has_account(text) to anon, authenticated;
