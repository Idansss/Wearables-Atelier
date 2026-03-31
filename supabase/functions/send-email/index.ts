import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_NAME = "Wearables Atelier";
const FROM_EMAIL = "hello@wearablesatelier.com";
const ADMIN_EMAIL = "hello@wearablesatelier.com";

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Restrict to your production domain. Add staging/dev origins as needed.
const ALLOWED_ORIGINS = [
  "https://wearablesatelier.com",
  "https://www.wearablesatelier.com",
  // Allow local dev
  "http://localhost:5173",
  "http://localhost:4173",
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

// ─── Rate Limiting (in-memory, per Edge Function instance) ───────────────────
// For production, use Upstash Redis. This covers the common case.
const ipHits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000; // 1 minute
const MAX_PER_WINDOW = 10; // max 10 emails per IP per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= MAX_PER_WINDOW) return true;
  entry.count++;
  return false;
}

// ─── HTML helpers ─────────────────────────────────────────────────────────────
function escapeHtml(input: string): string {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function wrapHtml(body: string): string {
  return `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height: 1.5; color: #0D0D0D; max-width: 560px; margin: 0 auto;">
      <h2 style="margin: 0 0 12px; font-size: 16px; letter-spacing: 0.05em;">WEARABLES ATELIER</h2>
      <hr style="border: none; border-top: 1px solid #EDE8DF; margin-bottom: 16px;" />
      ${body}
      <p style="margin-top: 24px; font-size: 11px; color: #6B6560; border-top: 1px solid #EDE8DF; padding-top: 12px;">
        You received this email because of an action on wearablesatelier.com.
      </p>
    </div>
  `;
}

// ─── Mailer ───────────────────────────────────────────────────────────────────
async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  apiKey: string;
}): Promise<void> {
  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
}

// ─── Input validation helpers ─────────────────────────────────────────────────
function requireString(val: unknown, field: string, maxLen = 2000): string {
  if (typeof val !== "string" || val.trim().length === 0) {
    throw new Error(`Missing required field: ${field}`);
  }
  if (val.length > maxLen) {
    throw new Error(`Field too long: ${field} (max ${maxLen} chars)`);
  }
  return val.trim();
}

function requireEmail(val: unknown, field = "email"): string {
  const s = requireString(val, field, 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) {
    throw new Error(`Invalid email: ${field}`);
  }
  return s.toLowerCase();
}

function optionalString(val: unknown, maxLen = 2000): string {
  if (val == null || val === "") return "";
  return requireString(val, "optional", maxLen);
}

// ─── JSON response helper ─────────────────────────────────────────────────────
function json(body: unknown, status = 200, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ─── Main handler ─────────────────────────────────────────────────────────────
serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, corsHeaders);
  }

  // Rate limiting by IP
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(clientIp)) {
    return json(
      { success: false, error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests — try again later" } },
      429,
      { ...corsHeaders, "Retry-After": "60" }
    );
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("[send-email] RESEND_API_KEY not configured");
      return json({ success: false, error: { code: "CONFIGURATION_ERROR", message: "Email service unavailable" } }, 503, corsHeaders);
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return json({ success: false, error: { code: "BAD_REQUEST", message: "Invalid JSON body" } }, 400, corsHeaders);
    }

    const { type, data } = body as { type?: unknown; data?: unknown };

    if (typeof type !== "string") {
      return json({ success: false, error: { code: "BAD_REQUEST", message: "Missing email type" } }, 400, corsHeaders);
    }

    const d = (data ?? {}) as Record<string, unknown>;

    switch (type) {
      case "contact": {
        const name = requireString(d.name, "name", 100);
        const email = requireEmail(d.email);
        const subject = requireString(d.subject, "subject", 200);
        const message = requireString(d.message, "message");

        await sendMail({
          to: ADMIN_EMAIL,
          subject: subject || "New contact message",
          html: wrapHtml(`
            <div><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</div>
            <div style="margin-top: 10px;"><strong>Message:</strong></div>
            <div style="margin-top: 6px; white-space: pre-wrap;">${escapeHtml(message)}</div>
          `),
          apiKey,
        });
        break;
      }

      case "custom_order": {
        const name = requireString(d.name, "name", 100);
        const email = requireEmail(d.email);
        const phone = requireString(d.phone, "phone", 30);
        const occasion = requireString(d.occasion, "occasion", 200);
        const garment = requireString(d.garment, "garment", 200);
        const budget = requireString(d.budget, "budget", 100);
        const eventDate = optionalString(d.eventDate, 50);
        const bust = optionalString(d.bust, 20);
        const waist = optionalString(d.waist, 20);
        const hips = optionalString(d.hips, 20);
        const height = optionalString(d.height, 20);
        const inspiration = optionalString(d.inspiration);
        const notes = optionalString(d.notes);

        await sendMail({
          to: ADMIN_EMAIL,
          subject: "New custom order request",
          html: wrapHtml(`
            <div><strong>Customer:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</div>
            <div><strong>Phone:</strong> ${escapeHtml(phone)}</div>
            <div style="margin-top: 12px;"><strong>Occasion:</strong> ${escapeHtml(occasion)}</div>
            <div><strong>Garment:</strong> ${escapeHtml(garment)}</div>
            <div><strong>Budget:</strong> ${escapeHtml(budget)}</div>
            <div><strong>Event Date:</strong> ${escapeHtml(eventDate || "Not specified")}</div>
            <div style="margin-top: 12px;"><strong>Measurements (cm):</strong></div>
            <div style="margin-top: 6px;">
              Bust: ${escapeHtml(bust || "—")}<br/>
              Waist: ${escapeHtml(waist || "—")}<br/>
              Hips: ${escapeHtml(hips || "—")}<br/>
              Height: ${escapeHtml(height || "—")}
            </div>
            <div style="margin-top: 12px;"><strong>Inspiration:</strong></div>
            <div style="margin-top: 6px; white-space: pre-wrap;">${escapeHtml(inspiration || "None")}</div>
            <div style="margin-top: 12px;"><strong>Notes:</strong></div>
            <div style="margin-top: 6px; white-space: pre-wrap;">${escapeHtml(notes || "None")}</div>
          `),
          apiKey,
        });
        break;
      }

      case "newsletter": {
        const email = requireEmail(d.email);

        await Promise.all([
          sendMail({
            to: ADMIN_EMAIL,
            subject: "New newsletter subscriber",
            html: wrapHtml(`
              <p style="margin: 0 0 10px;">A new subscriber just joined:</p>
              <div style="padding: 10px 12px; background: rgba(201,168,76,0.12);">
                <strong>${escapeHtml(email)}</strong>
              </div>
            `),
            apiKey,
          }),
          sendMail({
            to: email,
            subject: "Welcome to Wearables Atelier",
            html: wrapHtml(`
              <p style="margin: 0 0 10px;">Thanks for joining the Inner Circle.</p>
              <p style="margin: 0;">Watch your inbox for new drops, private sales, and styling notes.</p>
            `),
            apiKey,
          }),
        ]);
        break;
      }

      case "order_confirmation": {
        const customerName = requireString(d.customerName, "customerName", 100);
        const customerEmail = requireEmail(d.customerEmail);
        const orderRef = requireString(d.orderRef, "orderRef", 50);
        const total = requireString(d.total, "total", 50);

        await sendMail({
          to: customerEmail,
          subject: `Order Confirmed — ${escapeHtml(orderRef)}`,
          html: wrapHtml(`
            <p style="margin: 0 0 10px;">Hello ${escapeHtml(customerName)},</p>
            <p style="margin: 0 0 10px;">We've received your order and it's being processed.</p>
            <div style="margin: 10px 0; padding: 12px 14px; background: rgba(201,168,76,0.10); border-left: 3px solid #C9A84C;">
              <div><strong>Order Ref:</strong> ${escapeHtml(orderRef)}</div>
              <div><strong>Total:</strong> ${escapeHtml(total)}</div>
            </div>
            <p style="margin: 10px 0 0;">You'll hear from us via WhatsApp shortly with next steps.</p>
          `),
          apiKey,
        });
        break;
      }

      case "broadcast": {
        // Only authenticated admin users should reach this path.
        // RLS + JWT verification happens at the Supabase gateway level.
        const subject = requireString(d.subject, "subject", 200);
        const broadcastBody = requireString(d.body, "body");
        const recipients = d.recipients;

        if (!Array.isArray(recipients) || recipients.length === 0) {
          return json({ success: false, error: { code: "BAD_REQUEST", message: "recipients must be a non-empty array" } }, 400, corsHeaders);
        }
        if (recipients.length > 500) {
          return json({ success: false, error: { code: "BAD_REQUEST", message: "Batch limited to 500 recipients at a time" } }, 400, corsHeaders);
        }

        let sent = 0;
        let failed = 0;

        for (const recipient of recipients) {
          try {
            const recipientEmail = requireEmail(recipient);
            await sendMail({
              to: recipientEmail,
              subject,
              html: wrapHtml(`<div style="white-space: pre-wrap;">${escapeHtml(broadcastBody)}</div>`),
              apiKey,
            });
            sent++;
          } catch (err) {
            failed++;
            console.error("[send-email] broadcast recipient failed:", err);
          }
        }

        return json({ success: true, data: { sent, failed } }, 200, corsHeaders);
      }

      default:
        return json({ success: false, error: { code: "BAD_REQUEST", message: `Unknown email type: ${type}` } }, 400, corsHeaders);
    }

    return json({ success: true }, 200, corsHeaders);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Validation errors are operational (safe to expose)
    const isValidation = message.startsWith("Missing required field") ||
      message.startsWith("Invalid email") ||
      message.startsWith("Field too long");

    console.error("[send-email]", { error: message, ip: req.headers.get("x-forwarded-for") });

    if (isValidation) {
      return json({ success: false, error: { code: "VALIDATION_ERROR", message } }, 400, corsHeaders);
    }

    return json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to send email" } }, 500, corsHeaders);
  }
});
