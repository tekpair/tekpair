// Appointment reminder function — sends a 24-hour reminder to clients with bookings tomorrow.
//
// Schedule this function daily in Supabase Dashboard → Edge Functions → send-reminders → Schedule
// Recommended cron: "0 14 * * *"  (2 PM UTC = 10 AM ET)
//
// Or via pg_cron (run in Supabase SQL editor):
//   select cron.schedule(
//     'send-appointment-reminders',
//     '0 14 * * *',
//     $$
//     select net.http_post(
//       url:='https://lfsuntijzbdoswbremaw.supabase.co/functions/v1/send-reminders',
//       headers:='{"Content-Type":"application/json","Authorization":"Bearer <SERVICE_ROLE_KEY>"}'::jsonb,
//       body:='{}'::jsonb
//     );
//     $$
//   );
//
// Required env vars (same as send-booking-email):
//   RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FROM = "Tekpair <connor@tekpair.com>";
const LOGO = `<img src="https://tekpair.com/logo-email.png" width="220" height="48" alt="Tekpair" style="display:block;border:0;" />`;

// deno-lint-ignore no-explicit-any
type Booking = Record<string, any>;

const MONTH_MAP: Record<string, number> = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};

function parsePrefDate(dateStr: string): Date | null {
  const m = (dateStr || "").match(/^(\w+)\s+(\d+),\s+(\d+)$/);
  if (!m) return null;
  const month = MONTH_MAP[m[1]];
  if (month === undefined) return null;
  return new Date(parseInt(m[3]), month, parseInt(m[2]));
}

function emailReminder(b: Booking): string {
  const isRemote = b.type !== "inhome";
  const typeLabel = isRemote ? "Remote Session" : "In-Home Visit";

  const rows: [string, string][] = [
    ["Service", b.service || "—"],
    ["Date", b.preferred_date],
    ["Time", b.preferred_time],
    ["Type", typeLabel],
    ...(!isRemote && b.address ? [["Address", b.address] as [string, string]] : []),
  ];

  const rowsHtml = rows.map(([label, value], i) => {
    const border = i < rows.length - 1 ? "border-bottom:1px solid rgba(255,255,255,0.06);" : "";
    return `<tr>
      <td style="padding:11px 16px;font-family:Arial,sans-serif;font-size:12px;color:#7f8699;${border}white-space:nowrap;width:110px;vertical-align:top;">${label}</td>
      <td style="padding:11px 16px;font-family:Arial,sans-serif;font-size:13px;color:#eef1f8;${border}line-height:1.5;">${value}</td>
    </tr>`;
  }).join("");

  const remoteNote = isRemote ? `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;background:#13161d;border:1px solid rgba(41,212,245,0.2);border-radius:10px;overflow:hidden;">
      <tr><td style="padding:10px 16px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#29d4f5;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid rgba(255,255,255,0.06);">Remote Session</td></tr>
      <tr><td style="padding:12px 16px;font-family:Arial,sans-serif;font-size:13px;color:#8a95b0;line-height:1.65;">If you haven't received your Zoom link yet, you'll get it shortly before your session. Make sure Zoom is installed and you're ready at the scheduled time.</td></tr>
    </table>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Appointment Reminder — Tekpair</title>
</head>
<body style="margin:0;padding:0;background-color:#0d0f14;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0d0f14;">
    <tr>
      <td align="center" style="padding:48px 20px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
          <tr><td align="center" style="padding-bottom:28px;">${LOGO}</td></tr>
          <tr>
            <td style="background-color:#181b24;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:40px 40px 36px;">
              <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#7f8699;">Appointment Reminder</p>
              <h1 style="margin:0 0 18px;font-family:Arial,sans-serif;font-size:22px;font-weight:800;color:#eef1f8;line-height:1.3;">Your appointment is tomorrow</h1>
              <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:15px;color:#8a95b0;line-height:1.7;">
                Hi ${b.first_name || "there"}, just a heads-up that your Tekpair appointment is scheduled for tomorrow. We look forward to seeing you!
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#13161d;border:1px solid rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;">${rowsHtml}</table>
              ${remoteNote}
              <p style="margin:24px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#7f8699;line-height:1.7;">
                Need to reschedule or cancel? Please contact us at least 24 hours in advance to avoid a cancellation fee —
                reply to this email or call <a href="tel:+15182796823" style="color:#29d4f5;text-decoration:none;">(518) 279-6823</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 0 0;">
              <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:12px;color:#7f8699;line-height:1.7;">
                &copy; 2026 Tekpair &middot; Cohoes, NY &middot; Capital Region
              </p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;line-height:1.7;">
                <a href="mailto:connor@tekpair.com" style="color:#8a95b0;text-decoration:none;">connor@tekpair.com</a>
                &nbsp;&middot;&nbsp;
                <a href="tel:+15182796823" style="color:#8a95b0;text-decoration:none;">(518) 279-6823</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
}

serve(async (_req) => {
  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Tomorrow's date (midnight, used for string comparison)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // Fetch all pending/confirmed bookings
    const { data: bookings, error } = await sb
      .from("bookings")
      .select("*")
      .in("status", ["pending", "confirmed"]);
    if (error) throw new Error(error.message);

    // Filter for tomorrow's date
    const tomorrowBookings = (bookings || []).filter((b) => {
      const d = parsePrefDate(b.preferred_date);
      return d && d.toDateString() === tomorrow.toDateString();
    });

    if (tomorrowBookings.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No reminders needed today" }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    // Deduplicate: skip any that already got a reminder today
    const { data: alreadySent } = await sb
      .from("booking_email_log")
      .select("booking_id")
      .eq("action", "reminder")
      .in("booking_id", tomorrowBookings.map((b) => b.id));

    const sentIds = new Set((alreadySent || []).map((r) => r.booking_id));
    const toRemind = tomorrowBookings.filter((b) => !sentIds.has(b.id));

    // Send and log each reminder
    await Promise.all(
      toRemind.map(async (b) => {
        await sendEmail(
          b.email,
          `Reminder: Your Tekpair Appointment is Tomorrow`,
          emailReminder(b),
        );
        await sb.from("booking_email_log").insert({ booking_id: b.id, action: "reminder" });
      }),
    );

    return new Response(
      JSON.stringify({ sent: toRemind.length, skipped: tomorrowBookings.length - toRemind.length }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
});
