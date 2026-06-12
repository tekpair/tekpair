-- ── claim_guest_bookings() ───────────────────────────────────────────────────
-- Called client-side after every sign-in so that bookings made as a guest
-- before an account existed (or before this feature was deployed) get linked.
-- Safe to call repeatedly — it only touches rows not yet claimed (user_id IS NULL).

create or replace function public.claim_guest_bookings()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_email text;
begin
  if v_uid is null then return; end if;

  select email into v_email from auth.users where id = v_uid;
  if v_email is null then return; end if;

  -- Link unclaimed bookings whose email matches this account
  update public.bookings
  set user_id = v_uid
  where lower(email) = lower(v_email)
    and user_id is null;

  -- Backfill address (and phone if empty) from the most recent linked booking
  update public.profiles p
  set
    phone   = case when p.phone   = '' then coalesce(b.phone,   '') else p.phone   end,
    address = case when p.address = '' then coalesce(b.address, '') else p.address end
  from (
    select phone, address
    from   public.bookings
    where  user_id = v_uid
      and  (phone is not null or address is not null)
    order  by created_at desc
    limit  1
  ) b
  where p.id = v_uid;
end;
$$;

grant execute on function public.claim_guest_bookings() to authenticated;
