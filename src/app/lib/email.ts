/**
 * Email service — ALL email sending goes through the Supabase Edge Function.
 * The Resend API key lives server-side only (never in VITE_ env vars).
 */
import { supabase } from "./supabase";

const FROM_NAME = "Wearables Atelier";

// Edge Function URL is derived from the Supabase project URL
function getEdgeFunctionUrl(name: string): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!supabaseUrl) throw new Error("VITE_SUPABASE_URL is not set");
  return `${supabaseUrl}/functions/v1/${name}`;
}

async function callEdgeFunction(
  fnName: string,
  payload: Record<string, unknown>
): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(getEdgeFunctionUrl(fnName), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      ...(session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Edge Function ${fnName} failed (${res.status}): ${body}`);
  }
}

/** Contact form → admin notification */
export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  return callEdgeFunction("send-email", { type: "contact", data });
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
}): Promise<void> {
  return callEdgeFunction("send-email", { type: "custom_order", data });
}

/** Newsletter signup → welcome email to subscriber + admin notification */
export async function sendNewsletterSignup(subscriberEmail: string): Promise<void> {
  return callEdgeFunction("send-email", {
    type: "newsletter",
    data: { email: subscriberEmail },
  });
}

/** Order confirmed → customer confirmation email */
export async function sendOrderConfirmation(data: {
  customerName: string;
  customerEmail: string;
  orderRef: string;
  total: string;
}): Promise<void> {
  return callEdgeFunction("send-email", { type: "order_confirmation", data });
}

/** Broadcast newsletter to a list of emails — admin only, goes through Edge Function */
export async function sendBroadcast(opts: {
  subject: string;
  body: string;
  recipients: string[];
}): Promise<{ sent: number; failed: number }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(getEdgeFunctionUrl("send-email"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      ...(session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}),
    },
    body: JSON.stringify({ type: "broadcast", data: opts }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Broadcast failed (${res.status}): ${body}`);
  }

  const json = (await res.json()) as { sent?: number; failed?: number };
  return { sent: json.sent ?? 0, failed: json.failed ?? 0 };
}

export { FROM_NAME };
