import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_EMAIL = "connor@tekpair.com";
const FROM = "Tekpair <connor@tekpair.com>";

function statusLabel(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function actionSubject(action: string, type: string) {
  const t = type === "inhome" ? "In-Home Visit" : "Remote Session";
  if (action === "created") return `Booking Confirmed — Your ${t}`;
  if (action === "cancelled") return `Booking Cancelled — Your ${t}`;
  if (action === "rescheduled") return `Booking Rescheduled — Your ${t}`;
  return `Booking Update — Tekpair`;
}

function actionHeading(action: string) {
  if (action === "created") return "Your booking has been received!";
  if (action === "cancelled") return "Your booking has been cancelled.";
  if (action === "rescheduled") return "Your booking has been rescheduled.";
  return "Your booking has been updated.";
}

function actionBlurb(action: string) {
  if (action === "created")
    return "We'll review your request and follow up to confirm the appointment. If you need to reach us directly, reply to this email or call us.";
  if (action === "cancelled")
    return "Your appointment has been cancelled as requested. If this was a mistake or you'd like to rebook, please visit <a href='https://tekpair.com/#booking' style='color:#29d4f5;text-decoration:none;'>tekpair.com</a>.";
  if (action === "rescheduled")
    return "Your appointment has been rescheduled. We'll confirm the new time shortly. If you need to make further changes, visit your <a href='https://tekpair.com/account/' style='color:#29d4f5;text-decoration:none;'>account page</a>.";
  return "";
}

// deno-lint-ignore no-explicit-any
function buildCustomerEmail(booking: any, action: string): string {
  const typeLabel = booking.type === "inhome" ? "In-Home Visit" : "Remote Session";
  const heading = actionHeading(action);
  const blurb = actionBlurb(action);

  const rows = [
    ["Type", typeLabel],
    ["Service", booking.service || "—"],
    ["Date", booking.preferred_date],
    ["Time", booking.preferred_time],
    ...(booking.address ? [["Address", booking.address]] : []),
    ["Status", statusLabel(booking.status)],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:10px 16px;color:#8a95b0;font-size:13px;font-family:Arial,sans-serif;border-bottom:1px solid rgba(255,255,255,0.06);white-space:nowrap;width:140px;">${label}</td>
        <td style="padding:10px 16px;color:#eef1f8;font-size:13px;font-family:Arial,sans-serif;border-bottom:1px solid rgba(255,255,255,0.06);">${value}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${actionSubject(action, booking.type)}</title></head>
<body style="margin:0;padding:0;background:#0d0f14;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0f14;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#181b24;border-top:3px solid #29d4f5;border-radius:12px 12px 0 0;padding:28px 32px 20px;">
            <span style="font-family:Arial,sans-serif;font-size:22px;font-weight:800;color:#eef1f8;letter-spacing:-0.5px;">Tek<span style="color:#29d4f5;">pair</span></span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:#181b24;padding:8px 32px 28px;">
            <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#eef1f8;font-family:Arial,sans-serif;">${heading}</h1>
            <p style="margin:0 0 24px;font-size:14px;color:#8a95b0;line-height:1.6;font-family:Arial,sans-serif;">Hi ${booking.first_name || "there"},<br/><br/>${blurb}</p>
            <!-- Detail table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#13161d;border:1px solid rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;">
              ${rowsHtml}
            </table>
            ${
              booking.issue_description
                ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;background:#13161d;border:1px solid rgba(255,255,255,0.08);border-radius:10px;">
              <tr><td style="padding:12px 16px;color:#8a95b0;font-size:12px;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid rgba(255,255,255,0.06);">Issue Description</td></tr>
              <tr><td style="padding:12px 16px;color:#eef1f8;font-size:13px;font-family:Arial,sans-serif;line-height:1.5;">${booking.issue_description}</td></tr>
            </table>`
                : ""
            }
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#13161d;border-top:1px solid rgba(255,255,255,0.08);border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
            <p style="margin:0 0 8px;font-size:12px;color:#7f8699;font-family:Arial,sans-serif;">Tekpair &mdash; Capital Region, NY</p>
            <p style="margin:0;font-size:12px;font-family:Arial,sans-serif;"><a href="https://tekpair.com/account/" style="color:#29d4f5;text-decoration:none;">Manage your bookings</a> &nbsp;&bull;&nbsp; <a href="mailto:connor@tekpair.com" style="color:#29d4f5;text-decoration:none;">connor@tekpair.com</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// deno-lint-ignore no-explicit-any
function buildAdminEmail(booking: any, action: string): string {
  const typeLabel = booking.type === "inhome" ? "In-Home Visit" : "Remote Session";
  const actionLabel = action === "created" ? "New Booking" : action === "cancelled" ? "Booking Cancelled" : "Booking Rescheduled";

  const rows = [
    ["Name", `${booking.first_name} ${booking.last_name}`.trim()],
    ["Email", booking.email],
    ...(booking.phone ? [["Phone", booking.phone]] : []),
    ["Type", typeLabel],
    ["Service", booking.service || "—"],
    ["Date", booking.preferred_date],
    ["Time", booking.preferred_time],
    ...(booking.address ? [["Address", booking.address]] : []),
    ["Status", statusLabel(booking.status)],
    ...(booking.referral_source ? [["Referral", booking.referral_source]] : []),
    ["Booking ID", booking.id],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:9px 16px;color:#8a95b0;font-size:13px;font-family:Arial,sans-serif;border-bottom:1px solid rgba(255,255,255,0.06);white-space:nowrap;width:140px;">${label}</td>
        <td style="padding:9px 16px;color:#eef1f8;font-size:13px;font-family:Arial,sans-serif;border-bottom:1px solid rgba(255,255,255,0.06);">${value}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Admin: ${actionLabel}</title></head>
<body style="margin:0;padding:0;background:#0d0f14;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0f14;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:#181b24;border-top:3px solid #29d4f5;border-radius:12px 12px 0 0;padding:28px 32px 20px;">
            <span style="font-family:Arial,sans-serif;font-size:22px;font-weight:800;color:#eef1f8;">Tek<span style="color:#29d4f5;">pair</span></span>
            <span style="margin-left:12px;font-size:12px;background:rgba(41,212,245,0.12);color:#29d4f5;padding:3px 10px;border-radius:100px;font-weight:600;">Admin</span>
          </td>
        </tr>
        <tr>
          <td style="background:#181b24;padding:8px 32px 28px;">
            <h1 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#eef1f8;font-family:Arial,sans-serif;">${actionLabel}</h1>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#13161d;border:1px solid rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;">
              ${rowsHtml}
            </table>
            ${
              booking.issue_description
                ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;background:#13161d;border:1px solid rgba(255,255,255,0.08);border-radius:10px;">
              <tr><td style="padding:12px 16px;color:#8a95b0;font-size:12px;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid rgba(255,255,255,0.06);">Issue Description</td></tr>
              <tr><td style="padding:12px 16px;color:#eef1f8;font-size:13px;font-family:Arial,sans-serif;line-height:1.5;">${booking.issue_description}</td></tr>
            </table>`
                : ""
            }
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
              <tr><td>
                <a href="https://lfsuntijzbdoswbremaw.supabase.co" style="display:inline-block;background:#29d4f5;color:#0e1117;font-size:13px;font-weight:700;padding:10px 20px;border-radius:8px;text-decoration:none;font-family:Arial,sans-serif;">Open Admin Dashboard</a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#13161d;border-top:1px solid rgba(255,255,255,0.08);border-radius:0 0 12px 12px;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#7f8699;font-family:Arial,sans-serif;">Tekpair Admin Notification &mdash; Do not share this email</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
  return res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }

  try {
    const { booking_id, action } = await req.json();

    if (!booking_id || !action) {
      return new Response(JSON.stringify({ error: "Missing booking_id or action" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: booking, error } = await sb
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .single();

    if (error || !booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const subject = actionSubject(action, booking.type);

    await Promise.all([
      sendEmail(booking.email, subject, buildCustomerEmail(booking, action)),
      sendEmail(ADMIN_EMAIL, `[Admin] ${subject}`, buildAdminEmail(booking, action)),
    ]);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
