import { Resend } from "resend";
import { DEFAULT_STOREFRONT_SETTINGS } from "./siteSettings";

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY as string | undefined;
const FROM_NAME = "Wearables Atelier";
const FROM_EMAIL = DEFAULT_STOREFRONT_SETTINGS.contactEmail;
const ADMIN_EMAIL = DEFAULT_STOREFRONT_SETTINGS.contactEmail;

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

async function sendMail(opts: { to: string; subject: string; html: string }) {
  if (!RESEND_API_KEY) {
    console.warn("[Resend] VITE_RESEND_API_KEY not set — email skipped.");
    return;
  }
  const resend = new Resend(RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
  if (error) console.error("[Resend]", error);
}

/** Contact form → admin notification */
export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  return sendMail({
    to: ADMIN_EMAIL,
    subject: data.subject || "New contact message",
    html: wrapHtml(`
      <div><strong>From:</strong> ${escapeHtml(data.name)} (${escapeHtml(data.email)})</div>
      <div style="margin-top: 10px;"><strong>Message:</strong></div>
      <div style="margin-top: 6px; white-space: pre-wrap;">${escapeHtml(data.message)}</div>
    `),
  });
}

/** Custom order form → admin notification */
export async function sendCustomOrderEmail(data: {
  name: string;
  email: string;
  phone: string;
  occasion: string;
  garment: string;
  budget: string;
  eventDate: string;
  bust: string;
  waist: string;
  hips: string;
  height: string;
  inspiration: string;
  notes: string;
}) {
  return sendMail({
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
  });
}

/** Newsletter signup → welcome to subscriber + admin notification */
export async function sendNewsletterSignup(subscriberEmail: string) {
  return Promise.all([
    sendMail({
      to: ADMIN_EMAIL,
      subject: "New newsletter subscriber",
      html: wrapHtml(`
        <p style="margin: 0 0 10px;">A new subscriber just joined:</p>
        <div style="padding: 10px 12px; background: rgba(201,168,76,0.12);">
          <strong>${escapeHtml(subscriberEmail)}</strong>
        </div>
      `),
    }),
    sendMail({
      to: subscriberEmail,
      subject: "Welcome to Wearables Atelier",
      html: wrapHtml(`
        <p style="margin: 0 0 10px;">Thanks for joining the Inner Circle.</p>
        <p style="margin: 0;">Watch your inbox for new drops, private sales, and styling notes.</p>
      `),
    }),
  ]);
}

/** Broadcast newsletter to a list of emails */
export async function sendBroadcast(opts: {
  subject: string;
  body: string;
  recipients: string[];
}): Promise<{ sent: number; failed: number }> {
  if (!RESEND_API_KEY) {
    console.warn("[Resend] VITE_RESEND_API_KEY not set — broadcast skipped.");
    return { sent: 0, failed: 0 };
  }
  const resend = new Resend(RESEND_API_KEY);
  let sent = 0;
  let failed = 0;
  for (const email of opts.recipients) {
    try {
      const { error } = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: email,
        subject: opts.subject,
        html: wrapHtml(`<div style="white-space: pre-wrap;">${escapeHtml(opts.body)}</div>`),
      });
      if (error) { failed++; console.error("[Resend broadcast]", email, error); }
      else sent++;
    } catch (err) {
      failed++;
      console.error("[Resend broadcast]", email, err);
    }
  }
  return { sent, failed };
}

/** Order confirmed → customer confirmation email */
export async function sendOrderConfirmation(data: {
  customerName: string;
  customerEmail: string;
  orderRef: string;
  total: string;
}) {
  return sendMail({
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
  });
}
