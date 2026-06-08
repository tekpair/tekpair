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

const VALID_ACTIONS = ["created", "cancelled", "rescheduled", "admin_cancelled", "admin_rescheduled", "completed", "zoom_link"];

// deno-lint-ignore no-explicit-any
type Booking = Record<string, any>;

// ── RATE LIMITING ─────────────────────────────────────────────────────────────

async function isRateLimited(sb: ReturnType<typeof createClient>, bookingId: string, action: string): Promise<boolean> {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data } = await sb
    .from("booking_email_log")
    .select("id")
    .eq("booking_id", bookingId)
    .eq("action", action)
    .gte("sent_at", since)
    .limit(1);
  return !!(data && data.length > 0);
}

async function logSent(sb: ReturnType<typeof createClient>, bookingId: string, action: string): Promise<void> {
  await sb.from("booking_email_log").insert({ booking_id: bookingId, action });
}

// ── TEMPLATE HELPERS ──────────────────────────────────────────────────────────

const LOGO = `<img src="https://tekpair.com/logo-email.png" width="220" height="48" alt="Tekpair" style="display:block;border:0;" />`;

function emailShell(title: string, cardInner: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#0d0f14;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0d0f14;">
    <tr>
      <td align="center" style="padding:48px 20px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              ${LOGO}
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#181b24;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:40px 40px 36px;">
              ${cardInner}
            </td>
          </tr>

          <!-- Footer -->
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

function ctaBtn(url: string, label: string): string {
  return `<table cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="background-color:#29d4f5;border-radius:10px;">
      <a href="${url}" style="display:inline-block;padding:14px 32px;font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#0d0f14;text-decoration:none;border-radius:10px;">${label}</a>
    </td>
  </tr>
</table>`;
}

function detailTable(rows: [string, string][]): string {
  const inner = rows.map(([label, value], i) => {
    const isLast = i === rows.length - 1;
    const border = isLast ? "" : "border-bottom:1px solid rgba(255,255,255,0.06);";
    return `<tr>
      <td style="padding:11px 16px;font-family:Arial,sans-serif;font-size:12px;color:#7f8699;${border}white-space:nowrap;width:110px;vertical-align:top;">${label}</td>
      <td style="padding:11px 16px;font-family:Arial,sans-serif;font-size:13px;color:#eef1f8;${border}line-height:1.5;">${value}</td>
    </tr>`;
  }).join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#13161d;border:1px solid rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;">${inner}</table>`;
}

function issueBlock(desc: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;background:#13161d;border:1px solid rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;">
  <tr><td style="padding:10px 16px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#7f8699;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid rgba(255,255,255,0.06);">Issue Description</td></tr>
  <tr><td style="padding:12px 16px;font-family:Arial,sans-serif;font-size:13px;color:#8a95b0;line-height:1.6;">${desc}</td></tr>
</table>`;
}

function noteText(text: string): string {
  return `<p style="margin:28px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#7f8699;line-height:1.6;">${text}</p>`;
}

function typeLabel(b: Booking): string {
  return b.type === "inhome" ? "In-Home Visit" : "Remote Session";
}

function statusLabel(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── CUSTOMER EMAILS ───────────────────────────────────────────────────────────

function emailCreated(b: Booking): string {
  const rows: [string, string][] = [
    ["Type", typeLabel(b)],
    ["Service", b.service || "—"],
    ["Date", b.preferred_date],
    ["Time", b.preferred_time],
    ...(b.address ? [["Address", b.address] as [string, string]] : []),
    ["Status", statusLabel(b.status)],
  ];

  const card = `
    <h1 style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:22px;font-weight:800;color:#eef1f8;line-height:1.3;">
      We've got you booked!
    </h1>
    <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:15px;color:#8a95b0;line-height:1.7;">
      Hi ${b.first_name || "there"}, your request is in. We'll review it and follow up to confirm your appointment. Reply to this email or give us a call if you need anything in the meantime.
    </p>
    ${detailTable(rows)}
    ${b.issue_description ? issueBlock(b.issue_description) : ""}
    <p style="margin:28px 0 0;font-family:Arial,sans-serif;font-size:14px;color:#8a95b0;line-height:1.7;">
      Need to make changes? Visit your account page anytime.
    </p>
    <p style="margin:16px 0 0;">${ctaBtn("https://tekpair.com/account/", "View Your Booking")}</p>`;

  return emailShell("Booking Confirmed — Tekpair", card);
}

function emailCancelled(b: Booking): string {
  const rows: [string, string][] = [
    ["Type", typeLabel(b)],
    ["Service", b.service || "—"],
    ["Date", b.preferred_date],
    ["Time", b.preferred_time],
    ["Status", "Cancelled"],
  ];

  const card = `
    <h1 style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:22px;font-weight:800;color:#eef1f8;line-height:1.3;">
      Booking Cancelled
    </h1>
    <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:15px;color:#8a95b0;line-height:1.7;">
      Hi ${b.first_name || "there"}, your booking has been cancelled. If this was a mistake or you'd like to rebook, it only takes a minute.
    </p>
    ${detailTable(rows)}
    <p style="margin:28px 0 0;">${ctaBtn("https://tekpair.com/#booking", "Book Again")}</p>`;

  return emailShell("Booking Cancelled — Tekpair", card);
}

function emailRescheduled(b: Booking): string {
  const rows: [string, string][] = [
    ["Type", typeLabel(b)],
    ["Service", b.service || "—"],
    ["Date", b.preferred_date],
    ["Time", b.preferred_time],
    ...(b.address ? [["Address", b.address] as [string, string]] : []),
    ["Status", "Rescheduled"],
  ];

  const card = `
    <h1 style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:22px;font-weight:800;color:#eef1f8;line-height:1.3;">
      Booking Rescheduled
    </h1>
    <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:15px;color:#8a95b0;line-height:1.7;">
      Hi ${b.first_name || "there"}, your new date and time are confirmed below. We'll reach out shortly to lock things in. Need to adjust again? Your account page is always open.
    </p>
    ${detailTable(rows)}
    ${b.issue_description ? issueBlock(b.issue_description) : ""}
    <p style="margin:28px 0 0;">${ctaBtn("https://tekpair.com/account/", "Manage Your Booking")}</p>`;

  return emailShell("Booking Rescheduled — Tekpair", card);
}

function emailAdminCancelled(b: Booking): string {
  const rows: [string, string][] = [
    ["Type", typeLabel(b)],
    ["Service", b.service || "—"],
    ["Date", b.preferred_date],
    ["Time", b.preferred_time],
    ["Status", "Cancelled"],
  ];

  const card = `
    <h1 style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:22px;font-weight:800;color:#eef1f8;line-height:1.3;">
      Your Appointment Has Been Cancelled
    </h1>
    <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:15px;color:#8a95b0;line-height:1.7;">
      Hi ${b.first_name || "there"}, unfortunately we've had to cancel your upcoming appointment. We apologize for the inconvenience — please feel free to rebook at a time that works for you, or reply to this email if you have questions.
    </p>
    ${detailTable(rows)}
    <p style="margin:28px 0 0;">${ctaBtn("https://tekpair.com/#booking", "Book a New Appointment")}</p>`;

  return emailShell("Your Appointment Has Been Cancelled — Tekpair", card);
}

function emailAdminRescheduled(b: Booking, newDate?: string, newTime?: string): string {
  const rows: [string, string][] = [
    ["Type", typeLabel(b)],
    ["Service", b.service || "—"],
    ["New Date", newDate || b.preferred_date],
    ["New Time", newTime || b.preferred_time],
    ...(b.address ? [["Address", b.address] as [string, string]] : []),
    ["Status", "Rescheduled"],
  ];

  const card = `
    <h1 style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:22px;font-weight:800;color:#eef1f8;line-height:1.3;">
      Your Appointment Has Been Rescheduled
    </h1>
    <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:15px;color:#8a95b0;line-height:1.7;">
      Hi ${b.first_name || "there"}, we've updated your appointment to a new date and time. The details are below. If this doesn't work for you, reply to this email or manage your booking online.
    </p>
    ${detailTable(rows)}
    ${b.issue_description ? issueBlock(b.issue_description) : ""}
    <p style="margin:28px 0 0;">${ctaBtn("https://tekpair.com/account/", "Manage Your Booking")}</p>`;

  return emailShell("Your Appointment Has Been Rescheduled — Tekpair", card);
}

function emailCompleted(b: Booking): string {
  const card = `
    <h1 style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:22px;font-weight:800;color:#eef1f8;line-height:1.3;">
      Thanks for choosing Tekpair
    </h1>
    <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:15px;color:#8a95b0;line-height:1.7;">
      Hi ${b.first_name || "there"}, your session is complete. We hope everything went smoothly! If you have a moment, a quick Google review means the world to a local business — it really helps us out.
    </p>
    <!-- Review highlight box -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#13161d;border:1px solid rgba(255,255,255,0.08);border-radius:10px;margin-bottom:28px;">
      <tr>
        <td style="padding:22px 20px;text-align:center;">
          <p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:14px;color:#8a95b0;">How was your experience?</p>
          <p style="margin:0 0 18px;font-family:Arial,sans-serif;font-size:26px;letter-spacing:4px;">&#11088;&#11088;&#11088;&#11088;&#11088;</p>
          <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
            <tr>
              <td style="background-color:#29d4f5;border-radius:10px;">
                <a href="https://g.page/r/tekpair/review" style="display:inline-block;padding:14px 32px;font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#0d0f14;text-decoration:none;border-radius:10px;">Leave a Google Review</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#7f8699;line-height:1.6;">
      Need us again? <a href="https://tekpair.com/#booking" style="color:#29d4f5;text-decoration:none;">Book another service</a> anytime. We're always happy to help.
    </p>`;

  return emailShell("How Did We Do? — Tekpair", card);
}

function emailZoomLink(b: Booking, zoomUrl: string): string {
  const rows: [string, string][] = [
    ["Service", b.service || "—"],
    ["Date", b.preferred_date],
    ["Time", b.preferred_time],
    ["Session Type", "Remote — Zoom"],
  ];

  const card = `
    <h1 style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:22px;font-weight:800;color:#eef1f8;line-height:1.3;">
      Your Zoom Link is Ready
    </h1>
    <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:15px;color:#8a95b0;line-height:1.7;">
      Hi ${b.first_name || "there"}, everything is set for your remote session. Click the button below to join at the scheduled time. Make sure Zoom is installed and your device is ready before we start.
    </p>
    ${detailTable(rows)}
    <!-- Big join button -->
    <p style="margin:28px 0 16px;">${ctaBtn(zoomUrl, "Join Zoom Meeting")}</p>
    <!-- Fallback link -->
    <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#7f8699;line-height:1.6;">
      Or paste this link into your browser:
    </p>
    <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#29d4f5;line-height:1.6;word-break:break-all;">
      ${zoomUrl}
    </p>`;

  return emailShell("Your Zoom Link — Tekpair Remote Session", card);
}

// ── ADMIN NOTIFICATION ────────────────────────────────────────────────────────

function buildAdminEmail(b: Booking, action: string, extras: { newDate?: string; newTime?: string; zoomUrl?: string } = {}): string {
  const labels: Record<string, string> = {
    created: "New Booking",
    cancelled: "Customer Cancelled",
    rescheduled: "Customer Rescheduled",
    admin_cancelled: "Admin Cancelled — Customer Notified",
    admin_rescheduled: "Admin Rescheduled — Customer Notified",
    completed: "Marked Complete — Review Email Sent",
    zoom_link: "Zoom Link Sent to Customer",
  };
  const accents: Record<string, string> = {
    created: "#29d4f5",
    cancelled: "#f54e4e",
    admin_cancelled: "#f54e4e",
    completed: "#34c76f",
    zoom_link: "#29d4f5",
  };
  const actionLabel = labels[action] || "Booking Update";
  const accent = accents[action] || "#f5c518";

  const rows: [string, string][] = [
    ["Name", `${b.first_name || ""} ${b.last_name || ""}`.trim()],
    ["Email", b.email || "—"],
    ...(b.phone ? [["Phone", b.phone] as [string, string]] : []),
    ["Type", typeLabel(b)],
    ["Service", b.service || "—"],
    ...(extras.newDate ? [["New Date", extras.newDate] as [string, string]] : [["Date", b.preferred_date] as [string, string]]),
    ...(extras.newTime ? [["New Time", extras.newTime] as [string, string]] : [["Time", b.preferred_time] as [string, string]]),
    ...(b.address ? [["Address", b.address] as [string, string]] : []),
    ["Status", statusLabel(b.status)],
    ...(b.referral_source ? [["Referral", b.referral_source] as [string, string]] : []),
    ["Booking ID", b.id],
    ...(extras.zoomUrl ? [["Zoom URL", extras.zoomUrl] as [string, string]] : []),
  ];

  const rowsHtml = rows.map(([label, value], i) => {
    const isLast = i === rows.length - 1;
    const border = isLast ? "" : "border-bottom:1px solid rgba(255,255,255,0.06);";
    return `<tr>
      <td style="padding:11px 16px;font-family:Arial,sans-serif;font-size:12px;color:#7f8699;${border}white-space:nowrap;width:110px;vertical-align:top;">${label}</td>
      <td style="padding:11px 16px;font-family:Arial,sans-serif;font-size:13px;color:#eef1f8;${border}line-height:1.5;word-break:break-all;">${value}</td>
    </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin: ${actionLabel}</title>
</head>
<body style="margin:0;padding:0;background-color:#0d0f14;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0d0f14;">
    <tr>
      <td align="center" style="padding:48px 20px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              ${LOGO}
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#181b24;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
              <!-- Accent bar -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="background:${accent};height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>
              <div style="padding:32px 40px 36px;">
                <!-- Admin badge -->
                <p style="margin:0 0 16px;">
                  <span style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;background:rgba(41,212,245,0.14);color:#29d4f5;padding:3px 10px;border-radius:100px;letter-spacing:0.06em;text-transform:uppercase;">Admin Notification</span>
                </p>
                <h1 style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:20px;font-weight:800;color:#eef1f8;line-height:1.3;">${actionLabel}</h1>
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#13161d;border:1px solid rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;">${rowsHtml}</table>
                ${b.issue_description ? `
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;background:#13161d;border:1px solid rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;">
                  <tr><td style="padding:10px 16px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#7f8699;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid rgba(255,255,255,0.06);">Issue Description</td></tr>
                  <tr><td style="padding:12px 16px;font-family:Arial,sans-serif;font-size:13px;color:#8a95b0;line-height:1.6;">${b.issue_description}</td></tr>
                </table>` : ""}
                <table cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
                  <tr>
                    <td style="background-color:#29d4f5;border-radius:10px;">
                      <a href="https://tekpair.com/admin/" style="display:inline-block;padding:12px 24px;font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:#0d0f14;text-decoration:none;border-radius:10px;">Open Admin Panel</a>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:28px 0 0;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#7f8699;line-height:1.7;">
                Tekpair Admin Notification &mdash; Do not share this email
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

// ── SEND ──────────────────────────────────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
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
}

// ── HANDLER ───────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }

  try {
    const { booking_id, action, new_date, new_time, zoom_code } = await req.json();

    if (!booking_id || !action) {
      return new Response(JSON.stringify({ error: "Missing booking_id or action" }), {
        status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (!VALID_ACTIONS.includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const limited = await isRateLimited(sb, booking_id, action);
    if (limited) {
      return new Response(JSON.stringify({ error: "Rate limited: this email was already sent within the last 60 minutes." }), {
        status: 429, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const { data: booking, error } = await sb
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .single();

    if (error || !booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    let zoomUrl = "";
    if (action === "zoom_link") {
      if (!zoom_code) {
        return new Response(JSON.stringify({ error: "zoom_code required for zoom_link action" }), {
          status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }
      zoomUrl = zoom_code.startsWith("http") ? zoom_code : `https://zoom.us/j/${zoom_code.replace(/\D/g, "")}`;
    }

    const tLabel = booking.type === "inhome" ? "In-Home Visit" : "Remote Session";
    let customerSubject = "";
    let customerHtml = "";
    let notifyAdmin = false;

    switch (action) {
      case "created":
        customerSubject = `Booking Confirmed — Your ${tLabel}`;
        customerHtml = emailCreated(booking);
        notifyAdmin = true;
        break;
      case "cancelled":
        customerSubject = `Booking Cancelled — Your ${tLabel}`;
        customerHtml = emailCancelled(booking);
        notifyAdmin = true;
        break;
      case "rescheduled":
        customerSubject = `Booking Rescheduled — Your ${tLabel}`;
        customerHtml = emailRescheduled(booking);
        notifyAdmin = true;
        break;
      case "admin_cancelled":
        customerSubject = `Your Tekpair Appointment Has Been Cancelled`;
        customerHtml = emailAdminCancelled(booking);
        break;
      case "admin_rescheduled":
        customerSubject = `Your Tekpair Appointment Has Been Rescheduled`;
        customerHtml = emailAdminRescheduled(booking, new_date, new_time);
        break;
      case "completed":
        customerSubject = `How Did We Do? — Tekpair`;
        customerHtml = emailCompleted(booking);
        break;
      case "zoom_link":
        customerSubject = `Your Zoom Link — Tekpair Remote Session`;
        customerHtml = emailZoomLink(booking, zoomUrl);
        break;
    }

    const sends: Promise<void>[] = [sendEmail(booking.email, customerSubject, customerHtml)];
    if (notifyAdmin) {
      sends.push(sendEmail(
        ADMIN_EMAIL,
        `[Admin] ${customerSubject}`,
        buildAdminEmail(booking, action, { newDate: new_date, newTime: new_time, zoomUrl }),
      ));
    }

    await Promise.all(sends);
    await logSent(sb, booking_id, action);

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
