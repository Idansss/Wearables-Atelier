import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_NAME = "Wearables Atelier";
const FROM_EMAIL = "hello@wearablesatelier.com";
const ADMIN_EMAIL = "hello@wearablesatelier.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function wrapHtml(body: string) {
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

async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  apiKey: string;
}) {
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

  return res.json();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { type, data } = await req.json();

    switch (type) {
      case "contact": {
        await sendMail({
          to: ADMIN_EMAIL,
          subject: data.subject || "New contact message",
          html: wrapHtml(`
            <div><strong>From:</strong> ${escapeHtml(data.name)} (${escapeHtml(data.email)})</div>
            <div style="margin-top: 10px;"><strong>Message:</strong></div>
            <div style="margin-top: 6px; white-space: pre-wrap;">${escapeHtml(data.message)}</div>
          `),
          apiKey,
        });
        break;
      }

      case "custom_order": {
        await sendMail({
          to: ADMIN_EMAIL,
          subject: "New custom order request",
          html: wrapHtml(`
            <div><strong>Customer:</strong> ${escapeHtml(data.name)} (${escapeHtml(data.email)})</div>
            <div><strong>Phone:</strong> ${escapeHtml(data.phone)}</div>
            <div style="margin-top: 12px;"><strong>Occasion:</strong> ${escapeHtml(data.occasion)}</div>
            <div><strong>Garment:</strong> ${escapeHtml(data.garment)}</div>
            <div><strong>Budget:</strong> ${escapeHtml(data.budget)}</div>
            <div><strong>Event Date:</strong> ${escapeHtml(data.eventDate || "Not specified")}</div>
            <div style="margin-top: 12px;"><strong>Measurements (cm):</strong></div>
            <div style="margin-top: 6px;">
              Bust: ${escapeHtml(data.bust || "—")}<br/>
              Waist: ${escapeHtml(data.waist || "—")}<br/>
              Hips: ${escapeHtml(data.hips || "—")}<br/>
              Height: ${escapeHtml(data.height || "—")}
            </div>
            <div style="margin-top: 12px;"><strong>Inspiration:</strong></div>
            <div style="margin-top: 6px; white-space: pre-wrap;">${escapeHtml(data.inspiration || "None")}</div>
            <div style="margin-top: 12px;"><strong>Notes:</strong></div>
            <div style="margin-top: 6px; white-space: pre-wrap;">${escapeHtml(data.notes || "None")}</div>
          `),
          apiKey,
        });
        break;
      }

      case "newsletter": {
        await Promise.all([
          // Admin notification
          sendMail({
            to: ADMIN_EMAIL,
            subject: "New newsletter subscriber",
            html: wrapHtml(`
              <p style="margin: 0 0 10px;">A new subscriber just joined:</p>
              <div style="padding: 10px 12px; background: rgba(201,168,76,0.12);">
                <strong>${escapeHtml(data.email)}</strong>
              </div>
            `),
            apiKey,
          }),
          // Welcome to subscriber
          sendMail({
            to: data.email,
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
        await sendMail({
          to: data.customerEmail,
          subject: `Order Confirmed — ${data.orderRef}`,
          html: wrapHtml(`
            <p style="margin: 0 0 10px;">Hello ${escapeHtml(data.customerName)},</p>
            <p style="margin: 0 0 10px;">We've received your order and it's being processed.</p>
            <div style="margin: 10px 0; padding: 12px 14px; background: rgba(201,168,76,0.10); border-left: 3px solid #C9A84C;">
              <div><strong>Order Ref:</strong> ${escapeHtml(data.orderRef)}</div>
              <div><strong>Total:</strong> ${escapeHtml(data.total)}</div>
            </div>
            <p style="margin: 10px 0 0;">You'll hear from us via WhatsApp shortly with next steps.</p>
          `),
          apiKey,
        });
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown email type: ${type}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[send-email]", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
