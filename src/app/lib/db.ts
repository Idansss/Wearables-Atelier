import {
  DEFAULT_COLLECTIONS,
  DEFAULT_STOREFRONT_SETTINGS,
  normalizeCollections,
  normalizeSimplePages,
  normalizeStorefrontSettings,
  type SiteCollection,
  type SimplePagesSettings,
  type StorefrontSettings,
} from "./siteSettings";
import { supabase } from "./supabase";
import { AppError } from "./errors";
import { logger } from "./logger";

// ─── Pagination types ─────────────────────────────────────────────────────────

/**
 * Standard cursor-based pagination options.
 * Pass `cursor` from the previous page's `nextCursor` to fetch the next page.
 */
export type PaginationOptions = {
  /** Number of records per page (default: 50, max: 200) */
  limit?: number;
  /** Opaque cursor from the previous response's `nextCursor` */
  cursor?: string | null;
};

export type PaginatedResult<T> = {
  data: T[];
  meta: {
    /** Total items in full result set (where available) */
    total?: number;
    hasNext: boolean;
    /** Pass as `cursor` on the next request */
    nextCursor: string | null;
    limit: number;
  };
};

function clampLimit(limit?: number): number {
  const l = limit ?? 50;
  return Math.min(Math.max(1, l), 200);
}

/** Wraps any Supabase error (or unknown) into a typed AppError */
function handleDbError(err: unknown, context: string): never {
  const appErr = AppError.from(err, `Database error in ${context}`);
  logger.error(`db.${context}`, { code: appErr.code, message: appErr.message });
  throw appErr;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type OrderItem = {
  id: string;
  name: string;
  category: string;
  size: string;
  price: number;
  salePrice?: number;
  qty: number;
  img: string;
};

export type Order = {
  id: string;
  ref: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  total: number;
  status: "received" | "confirmed" | "processing" | "dispatched" | "delivered" | "cancelled" | "refunded";
  paymentStatus: "paid" | "pending" | "failed";
  paystackRef: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  trackingCode?: string;
};

export type CustomOrder = {
  id: string;
  name: string;
  email: string;
  phone: string;
  occasion: string;
  garment: string;
  budget: string;
  eventDate: string;
  measurements: { bust: string; waist: string; hips: string; height: string };
  inspiration: string;
  notes: string;
  status: "new" | "in_discussion" | "quoted" | "confirmed" | "in_production" | "delivered";
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  source: "footer" | "popup";
  status: "active" | "unsubscribed";
  subscribedAt: Date;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied";
  createdAt: Date;
};

export type WholesaleLead = {
  id: string;
  business: string;
  name: string;
  email: string;
  phone: string;
  categories: string;
  quantity: string;
  message: string;
  status: "new" | "contacted" | "quoted" | "converted" | "closed";
  createdAt: Date;
};

export type AdminUser = {
  id: string;
  email: string;
  role: "owner" | "manager" | "editor";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminUserInput = Omit<AdminUser, "id" | "createdAt" | "updatedAt">;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseDate(value: string | null | undefined): Date {
  if (!value) return new Date();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number;
  description: string;
  sizes: string[];
  details: string[];
  images: string[];
  badge?: string;
  badgeColor?: string;
  inStock: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

function rowToProduct(row: Record<string, unknown>): Product {
  const slug = String(row.slug);
  return {
    id: slug,
    slug,
    name: String(row.name ?? ""),
    category: String(row.category ?? ""),
    price: Number(row.price ?? 0),
    salePrice: row.sale_price !== null && row.sale_price !== undefined ? Number(row.sale_price) : undefined,
    description: String(row.description ?? ""),
    sizes: (row.sizes as string[]) ?? [],
    details: (row.details as string[]) ?? [],
    images: (row.images as string[]) ?? [],
    badge: row.badge !== null && row.badge !== undefined ? String(row.badge) : undefined,
    badgeColor: row.badge_color !== null && row.badge_color !== undefined ? String(row.badge_color) : undefined,
    inStock: Boolean(row.in_stock),
    featured: Boolean(row.featured),
    createdAt: parseDate(row.created_at as string),
    updatedAt: parseDate(row.updated_at as string),
  };
}

function productInputToRow(data: ProductInput | Partial<ProductInput>) {
  return {
    slug: data.slug,
    name: data.name,
    category: data.category,
    price: data.price,
    sale_price: data.salePrice ?? null,
    description: data.description,
    sizes: data.sizes,
    details: data.details,
    images: data.images,
    badge: data.badge ?? null,
    badge_color: data.badgeColor ?? null,
    in_stock: data.inStock,
    featured: data.featured,
  };
}

export async function saveProduct(data: ProductInput): Promise<string> {
  const now = new Date().toISOString();
  const { data: existing } = await supabase.from("products").select("created_at").eq("slug", data.slug).maybeSingle();
  const createdAt = (existing as { created_at?: string } | null)?.created_at ?? now;
  const { error } = await supabase.from("products").upsert(
    {
      ...productInputToRow(data),
      created_at: createdAt,
      updated_at: now,
    },
    { onConflict: "slug" }
  );
  if (error) handleDbError(error, "saveProduct");
  return data.slug;
}

export async function updateProduct(slug: string, data: Partial<ProductInput>): Promise<void> {
  const row = productInputToRow(data as ProductInput);
  const cleaned = Object.fromEntries(
    Object.entries(row).filter(([, v]) => v !== undefined)
  ) as Record<string, unknown>;
  const { error } = await supabase
    .from("products")
    .update({ ...cleaned, updated_at: new Date().toISOString() })
    .eq("slug", slug);
  if (error) handleDbError(error, "updateProduct");
}

export async function deleteProduct(slug: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("slug", slug);
  if (error) handleDbError(error, "deleteProduct");
}

/**
 * Returns all products — suitable for the admin product list (expected < 1000 rows).
 * For the public storefront use `getProductsPaginated` to avoid unbounded queries.
 */
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500); // safety cap
  if (error) handleDbError(error, "getProducts");
  return (data ?? []).map((row) => rowToProduct(row as Record<string, unknown>));
}

/**
 * Paginated product list for the public storefront.
 * Supports cursor-based navigation and optional category filtering.
 */
export async function getProductsPaginated(
  opts: PaginationOptions & { category?: string; featured?: boolean; inStock?: boolean } = {}
): Promise<PaginatedResult<Product>> {
  const limit = clampLimit(opts.limit);

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(limit + 1); // fetch one extra to detect hasNext

  if (opts.cursor) query = query.lt("created_at", opts.cursor);
  if (opts.category) query = query.eq("category", opts.category);
  if (opts.featured !== undefined) query = query.eq("featured", opts.featured);
  if (opts.inStock !== undefined) query = query.eq("in_stock", opts.inStock);

  const { data, error, count } = await query;
  if (error) handleDbError(error, "getProductsPaginated");

  const rows = data ?? [];
  const hasNext = rows.length > limit;
  const items = hasNext ? rows.slice(0, -1) : rows;
  const products = items.map((row) => rowToProduct(row as Record<string, unknown>));

  return {
    data: products,
    meta: {
      total: count ?? undefined,
      hasNext,
      nextCursor: hasNext ? (items[items.length - 1] as Record<string, unknown>).created_at as string : null,
      limit,
    },
  };
}

export async function getProduct(slug: string): Promise<Product | null> {
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  if (error) handleDbError(error, "getProduct");
  if (!data) return null;
  return rowToProduct(data as Record<string, unknown>);
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function saveOrder(
  data: Omit<Order, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  const now = new Date().toISOString();
  const { error } = await supabase.from("orders").insert({
    id,
    ref: data.ref,
    customer: data.customer,
    items: data.items,
    subtotal: data.subtotal,
    discount_amount: data.discountAmount,
    coupon_code: data.couponCode ?? null,
    total: data.total,
    status: data.status,
    payment_status: data.paymentStatus,
    paystack_ref: data.paystackRef,
    notes: data.notes ?? null,
    tracking_code: data.trackingCode ?? null,
    created_at: now,
    updated_at: now,
  });
  if (error) handleDbError(error, "saveOrder");
  logger.info("order.created", { id, ref: data.ref });
  return id;
}

function rowToOrder(row: Record<string, unknown>): Order {
  return {
    id: String(row.id),
    ref: String(row.ref),
    customer: row.customer as Order["customer"],
    items: row.items as OrderItem[],
    subtotal: Number(row.subtotal),
    discountAmount: Number(row.discount_amount ?? 0),
    couponCode: row.coupon_code !== null && row.coupon_code !== undefined ? String(row.coupon_code) : undefined,
    total: Number(row.total),
    status: row.status as Order["status"],
    paymentStatus: row.payment_status as Order["paymentStatus"],
    paystackRef: String(row.paystack_ref ?? ""),
    notes: row.notes !== null && row.notes !== undefined ? String(row.notes) : undefined,
    trackingCode: row.tracking_code !== null && row.tracking_code !== undefined ? String(row.tracking_code) : undefined,
    createdAt: parseDate(row.created_at as string),
    updatedAt: parseDate(row.updated_at as string),
  };
}

/**
 * Returns all orders for the admin panel (capped at 1000 for safety).
 * Use `getOrdersPaginated` for large datasets.
 */
export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) handleDbError(error, "getOrders");
  return (data ?? []).map((row) => rowToOrder(row as Record<string, unknown>));
}

/**
 * Paginated order list with optional status filter and search.
 */
export async function getOrdersPaginated(
  opts: PaginationOptions & { status?: Order["status"]; search?: string } = {}
): Promise<PaginatedResult<Order>> {
  const limit = clampLimit(opts.limit);

  let query = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (opts.cursor) query = query.lt("created_at", opts.cursor);
  if (opts.status) query = query.eq("status", opts.status);

  const { data, error, count } = await query;
  if (error) handleDbError(error, "getOrdersPaginated");

  const rows = data ?? [];
  const hasNext = rows.length > limit;
  const items = hasNext ? rows.slice(0, -1) : rows;
  const orders = items.map((row) => rowToOrder(row as Record<string, unknown>));

  // Client-side search filter (Supabase free tier doesn't include full-text on jsonb)
  const filtered = opts.search
    ? orders.filter((o) => {
        const q = opts.search!.toLowerCase();
        return (
          o.ref.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase().includes(q)
        );
      })
    : orders;

  return {
    data: filtered,
    meta: {
      total: count ?? undefined,
      hasNext,
      nextCursor: hasNext ? (items[items.length - 1] as Record<string, unknown>).created_at as string : null,
      limit,
    },
  };
}

export async function getOrder(id: string): Promise<Order | null> {
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (error) handleDbError(error, "getOrder");
  if (!data) return null;
  return rowToOrder(data as Record<string, unknown>);
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"],
  extra?: { notes?: string; trackingCode?: string }
): Promise<void> {
  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (extra?.notes !== undefined) updates.notes = extra.notes;
  if (extra?.trackingCode !== undefined) updates.tracking_code = extra.trackingCode;
  const { error } = await supabase.from("orders").update(updates).eq("id", id);
  if (error) handleDbError(error, "updateOrderStatus");
  logger.info("order.status_updated", { orderId: id, newStatus: status });
}

// ─── Custom Orders ────────────────────────────────────────────────────────────

export async function saveCustomOrder(
  data: Omit<CustomOrder, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  const now = new Date().toISOString();
  const { error } = await supabase.from("custom_orders").insert({
    id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    occasion: data.occasion,
    garment: data.garment,
    budget: data.budget,
    event_date: data.eventDate,
    measurements: data.measurements,
    inspiration: data.inspiration,
    notes: data.notes,
    status: data.status,
    admin_notes: data.adminNotes ?? null,
    created_at: now,
    updated_at: now,
  });
  if (error) handleDbError(error, "saveCustomOrder");
  logger.info("custom_order.created", { id, email: data.email });
  return id;
}

function rowToCustomOrder(row: Record<string, unknown>): CustomOrder {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    phone: String(row.phone ?? ""),
    occasion: String(row.occasion ?? ""),
    garment: String(row.garment ?? ""),
    budget: String(row.budget ?? ""),
    eventDate: String(row.event_date ?? ""),
    measurements: (row.measurements ?? {}) as CustomOrder["measurements"],
    inspiration: String(row.inspiration ?? ""),
    notes: String(row.notes ?? ""),
    status: row.status as CustomOrder["status"],
    adminNotes: row.admin_notes !== null && row.admin_notes !== undefined ? String(row.admin_notes) : undefined,
    createdAt: parseDate(row.created_at as string),
    updatedAt: parseDate(row.updated_at as string),
  };
}

export async function getCustomOrders(): Promise<CustomOrder[]> {
  const { data, error } = await supabase
    .from("custom_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) handleDbError(error, "getCustomOrders");
  return (data ?? []).map((row) => rowToCustomOrder(row as Record<string, unknown>));
}

export async function getCustomOrdersPaginated(
  opts: PaginationOptions & { status?: CustomOrder["status"] } = {}
): Promise<PaginatedResult<CustomOrder>> {
  const limit = clampLimit(opts.limit);

  let query = supabase
    .from("custom_orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (opts.cursor) query = query.lt("created_at", opts.cursor);
  if (opts.status) query = query.eq("status", opts.status);

  const { data, error, count } = await query;
  if (error) handleDbError(error, "getCustomOrdersPaginated");

  const rows = data ?? [];
  const hasNext = rows.length > limit;
  const items = hasNext ? rows.slice(0, -1) : rows;

  return {
    data: items.map((row) => rowToCustomOrder(row as Record<string, unknown>)),
    meta: {
      total: count ?? undefined,
      hasNext,
      nextCursor: hasNext ? (items[items.length - 1] as Record<string, unknown>).created_at as string : null,
      limit,
    },
  };
}

export async function updateCustomOrderStatus(
  id: string,
  status: CustomOrder["status"],
  adminNotes?: string
): Promise<void> {
  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (adminNotes !== undefined) updates.admin_notes = adminNotes;
  const { error } = await supabase.from("custom_orders").update(updates).eq("id", id);
  if (error) handleDbError(error, "updateCustomOrderStatus");
}

// ─── Newsletter Subscribers ───────────────────────────────────────────────────

export async function saveSubscriber(
  email: string,
  source: "footer" | "popup"
): Promise<string | null> {
  const { data, error } = await supabase.rpc("subscribe_newsletter", {
    p_email: email.trim().toLowerCase(),
    p_source: source,
  });
  if (error) handleDbError(error, "saveSubscriber");
  logger.info("newsletter.subscribed", { source });
  return data ?? null;
}

function rowToSubscriber(row: Record<string, unknown>): NewsletterSubscriber {
  return {
    id: String(row.id),
    email: String(row.email),
    source: row.source as NewsletterSubscriber["source"],
    status: row.status as NewsletterSubscriber["status"],
    subscribedAt: parseDate(row.subscribed_at as string),
  };
}

export async function getSubscribers(): Promise<NewsletterSubscriber[]> {
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false })
    .limit(2000);
  if (error) handleDbError(error, "getSubscribers");
  return (data ?? []).map((row) => rowToSubscriber(row as Record<string, unknown>));
}

export async function removeSubscriber(id: string): Promise<void> {
  const { error } = await supabase.from("newsletter_subscribers").update({ status: "unsubscribed" }).eq("id", id);
  if (error) handleDbError(error, "removeSubscriber");
}

// ─── Contact Messages ─────────────────────────────────────────────────────────

export async function saveContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<string> {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  const { error } = await supabase.from("contact_messages").insert({
    id,
    ...data,
    status: "unread",
    created_at: new Date().toISOString(),
  });
  if (error) handleDbError(error, "saveContactMessage");
  logger.info("contact_message.received", { id });
  return id;
}

function rowToContact(row: Record<string, unknown>): ContactMessage {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    subject: String(row.subject),
    message: String(row.message),
    status: row.status as ContactMessage["status"],
    createdAt: parseDate(row.created_at as string),
  };
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) handleDbError(error, "getContactMessages");
  return (data ?? []).map((row) => rowToContact(row as Record<string, unknown>));
}

export async function updateContactStatus(
  id: string,
  status: ContactMessage["status"]
): Promise<void> {
  const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
  if (error) handleDbError(error, "updateContactStatus");
}

// ─── Wholesale Leads ──────────────────────────────────────────────────────────

export async function saveWholesaleLead(
  data: Omit<WholesaleLead, "id" | "createdAt" | "status">
): Promise<string> {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  const { error } = await supabase.from("wholesale_leads").insert({
    id,
    business: data.business,
    name: data.name,
    email: data.email,
    phone: data.phone,
    categories: data.categories,
    quantity: data.quantity,
    message: data.message,
    status: "new",
    created_at: new Date().toISOString(),
  });
  if (error) handleDbError(error, "saveWholesaleLead");
  logger.info("wholesale_lead.created", { id });
  return id;
}

function rowToWholesale(row: Record<string, unknown>): WholesaleLead {
  return {
    id: String(row.id),
    business: String(row.business),
    name: String(row.name),
    email: String(row.email),
    phone: String(row.phone ?? ""),
    categories: String(row.categories ?? ""),
    quantity: String(row.quantity ?? ""),
    message: String(row.message ?? ""),
    status: row.status as WholesaleLead["status"],
    createdAt: parseDate(row.created_at as string),
  };
}

export async function getWholesaleLeads(): Promise<WholesaleLead[]> {
  const { data, error } = await supabase
    .from("wholesale_leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) handleDbError(error, "getWholesaleLeads");
  return (data ?? []).map((row) => rowToWholesale(row as Record<string, unknown>));
}

export async function updateWholesaleStatus(
  id: string,
  status: WholesaleLead["status"]
): Promise<void> {
  const { error } = await supabase.from("wholesale_leads").update({ status }).eq("id", id);
  if (error) handleDbError(error, "updateWholesaleStatus");
}

// ─── Admin Helpers ────────────────────────────────────────────────────────────

export async function checkIsAdmin(_uid: string, _email?: string | null): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_admin");
  if (error) {
    logger.error("db.is_admin.failed", { error });
    return false;
  }
  return Boolean(data);
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase.from("admins").select("*").order("created_at", { ascending: false });
  if (error) handleDbError(error, "getAdminUsers");
  return (data ?? [])
    .map((row) => {
      const r = row as Record<string, unknown>;
      const email = typeof r.email === "string" ? r.email : null;
      if (!email) return null;
      return {
        id: email,
        email,
        role:
          r.role === "owner" || r.role === "manager" || r.role === "editor"
            ? r.role
            : "editor",
        isActive: r.is_active === true,
        createdAt: parseDate(r.created_at as string),
        updatedAt: parseDate(r.updated_at as string),
      } satisfies AdminUser;
    })
    .filter((entry): entry is AdminUser => entry !== null);
}

export async function saveAdminUser(data: AdminUserInput): Promise<string> {
  const normalizedEmail = data.email.trim().toLowerCase();
  const { data: existing } = await supabase
    .from("admins")
    .select("created_at")
    .eq("email", normalizedEmail)
    .maybeSingle();
  const createdAt = (existing as { created_at?: string } | null)?.created_at ?? new Date().toISOString();
  const { error } = await supabase.from("admins").upsert(
    {
      email: normalizedEmail,
      role: data.role,
      is_active: data.isActive,
      created_at: createdAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" }
  );
  if (error) handleDbError(error, "saveAdminUser");
  return normalizedEmail;
}

export async function updateAdminUser(id: string, data: Partial<AdminUserInput>): Promise<void> {
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (data.email !== undefined) updates.email = data.email.trim().toLowerCase();
  if (data.role !== undefined) updates.role = data.role;
  if (data.isActive !== undefined) updates.is_active = data.isActive;
  const { error } = await supabase.from("admins").update(updates).eq("email", id.toLowerCase());
  if (error) handleDbError(error, "updateAdminUser");
}

export async function deleteAdminUser(id: string): Promise<void> {
  const { error } = await supabase.from("admins").delete().eq("email", id.toLowerCase());
  if (error) handleDbError(error, "deleteAdminUser");
}

export async function logAdminAction(
  uid: string,
  email: string,
  action: string,
  details?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase.from("audit_logs").insert({
    uid,
    email,
    action,
    details: details ?? {},
    timestamp: new Date().toISOString(),
  });
  // Audit log failures should not block the main operation — log but don't throw
  if (error) logger.error("audit_log.write_failed", { action, uid });
}

// ─── Coupons ──────────────────────────────────────────────────────────────────

export type Coupon = {
  id: string;
  code: string;
  discount: number;
  description?: string;
  maxUses?: number;
  usedCount: number;
  expiresAt?: Date;
  active: boolean;
  createdAt: Date;
};

export type CouponInput = Omit<Coupon, "id" | "usedCount" | "createdAt">;

function rowToCoupon(row: Record<string, unknown>): Coupon {
  return {
    id: String(row.id),
    code: String(row.code),
    discount: Number(row.discount),
    description: row.description !== null && row.description !== undefined ? String(row.description) : undefined,
    maxUses: row.max_uses !== null && row.max_uses !== undefined ? Number(row.max_uses) : undefined,
    usedCount: Number(row.used_count ?? 0),
    expiresAt: row.expires_at !== null && row.expires_at !== undefined ? parseDate(row.expires_at as string) : undefined,
    active: Boolean(row.active),
    createdAt: parseDate(row.created_at as string),
  };
}

export async function saveCoupon(data: CouponInput): Promise<string> {
  const { data: inserted, error } = await supabase
    .from("coupons")
    .insert({
      code: data.code.toUpperCase(),
      discount: data.discount,
      description: data.description ?? null,
      max_uses: data.maxUses ?? null,
      used_count: 0,
      expires_at: data.expiresAt ? data.expiresAt.toISOString() : null,
      active: data.active,
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) handleDbError(error, "saveCoupon");
  return inserted!.id as string;
}

export async function getCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) handleDbError(error, "getCoupons");
  return (data ?? []).map((row) => rowToCoupon(row as Record<string, unknown>));
}

export async function updateCoupon(id: string, data: Partial<CouponInput>): Promise<void> {
  const updates: Record<string, unknown> = {};
  if (data.code !== undefined) updates.code = data.code.toUpperCase();
  if (data.discount !== undefined) updates.discount = data.discount;
  if (data.description !== undefined) updates.description = data.description;
  if (data.maxUses !== undefined) updates.max_uses = data.maxUses;
  if (data.expiresAt !== undefined) updates.expires_at = data.expiresAt ? data.expiresAt.toISOString() : null;
  if (data.active !== undefined) updates.active = data.active;
  const { error } = await supabase.from("coupons").update(updates).eq("id", id);
  if (error) handleDbError(error, "updateCoupon");
}

export async function deleteCoupon(id: string): Promise<void> {
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) handleDbError(error, "deleteCoupon");
}

export async function validateCoupon(code: string): Promise<Coupon | null> {
  const upper = code.toUpperCase();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", upper)
    .eq("active", true)
    .maybeSingle();
  if (error) handleDbError(error, "validateCoupon");
  if (!data) return null;
  const coupon = rowToCoupon(data as Record<string, unknown>);
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return null;
  if (coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) return null;
  return coupon;
}

export async function incrementCouponUse(id: string): Promise<void> {
  const { error } = await supabase.rpc("increment_coupon_use", { p_id: id });
  if (error) handleDbError(error, "incrementCouponUse");
}

// ─── Site Settings ────────────────────────────────────────────────────────────

export type SiteSettings = {
  announcementMessages: string[];
  collections: SiteCollection[];
  storefront: StorefrontSettings;
  simplePages: SimplePagesSettings;
  updatedAt?: Date;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", "site").maybeSingle();
  if (error) handleDbError(error, "getSiteSettings");
  if (!data) {
    return {
      announcementMessages: [],
      collections: DEFAULT_COLLECTIONS,
      storefront: DEFAULT_STOREFRONT_SETTINGS,
      simplePages: normalizeSimplePages(undefined, DEFAULT_STOREFRONT_SETTINGS.contactEmail),
    };
  }
  const row = data as Record<string, unknown>;
  const storefront = normalizeStorefrontSettings(row.storefront);
  return {
    announcementMessages: (row.announcement_messages as string[]) ?? [],
    collections: normalizeCollections(row.collections),
    storefront,
    simplePages: normalizeSimplePages(row.simple_pages, storefront.contactEmail),
    updatedAt: row.updated_at !== null && row.updated_at !== undefined ? parseDate(row.updated_at as string) : undefined,
  };
}

export async function saveSiteSettings(
  data: Partial<Omit<SiteSettings, "updatedAt">>
): Promise<void> {
  const current = await getSiteSettings();
  const merged: SiteSettings = {
    announcementMessages: data.announcementMessages ?? current.announcementMessages,
    collections: data.collections ?? current.collections,
    storefront: data.storefront ?? current.storefront,
    simplePages: data.simplePages ?? current.simplePages,
  };
  const { error } = await supabase.from("site_settings").upsert(
    {
      id: "site",
      announcement_messages: merged.announcementMessages,
      collections: merged.collections as unknown as Record<string, unknown>,
      storefront: merged.storefront as unknown as Record<string, unknown>,
      simple_pages: merged.simplePages as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) handleDbError(error, "saveSiteSettings");
  logger.info("site_settings.saved");
}

// ─── Audit Log Reader ─────────────────────────────────────────────────────────

export type AuditEntry = {
  id: string;
  uid: string;
  email: string;
  action: string;
  details: Record<string, unknown>;
  timestamp: Date;
};

export async function getAuditLogs(limitCount = 100): Promise<AuditEntry[]> {
  const limit = Math.min(limitCount, 500); // hard cap
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit);
  if (error) handleDbError(error, "getAuditLogs");
  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: String(r.id),
      uid: String(r.uid ?? ""),
      email: String(r.email ?? ""),
      action: String(r.action),
      details: (r.details as Record<string, unknown>) ?? {},
      timestamp: parseDate(r.timestamp as string),
    };
  });
}

// ─── Customers (from orders) ──────────────────────────────────────────────────

export type CustomerSummary = {
  email: string;
  name: string;
  phone: string;
  orderCount: number;
  totalSpend: number;
  lastOrderAt: Date;
};

export async function getCustomers(): Promise<CustomerSummary[]> {
  const orders = await getOrders();
  const map = new Map<string, CustomerSummary>();
  for (const o of orders) {
    const email = o.customer.email;
    const existing = map.get(email);
    if (existing) {
      existing.orderCount++;
      existing.totalSpend += o.total;
      if (o.createdAt > existing.lastOrderAt) existing.lastOrderAt = o.createdAt;
    } else {
      map.set(email, {
        email,
        name: `${o.customer.firstName} ${o.customer.lastName}`.trim(),
        phone: o.customer.phone,
        orderCount: 1,
        totalSpend: o.total,
        lastOrderAt: o.createdAt,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.lastOrderAt.getTime() - a.lastOrderAt.getTime());
}

// ─── Product Reviews ──────────────────────────────────────────────────────────

export type ProductReview = {
  id: string;
  productSlug: string;
  name: string;
  location: string;
  rating: number;
  body: string;
  status: "pending" | "approved";
  createdAt: Date;
};

export async function getProductReviews(slug: string): Promise<ProductReview[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_slug", slug)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) handleDbError(error, "getProductReviews");
  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: String(r.id),
      productSlug: String(r.product_slug),
      name: String(r.name),
      location: String(r.location ?? ""),
      rating: Number(r.rating),
      body: String(r.body),
      status: r.status as ProductReview["status"],
      createdAt: parseDate(r.created_at as string),
    };
  });
}

export async function getAllReviews(): Promise<ProductReview[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) handleDbError(error, "getAllReviews");
  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: String(r.id),
      productSlug: String(r.product_slug),
      name: String(r.name),
      location: String(r.location ?? ""),
      rating: Number(r.rating),
      body: String(r.body),
      status: r.status as ProductReview["status"],
      createdAt: parseDate(r.created_at as string),
    };
  });
}

export async function updateReviewStatus(
  id: string,
  status: ProductReview["status"]
): Promise<void> {
  const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
  if (error) handleDbError(error, "updateReviewStatus");
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) handleDbError(error, "deleteReview");
}

export async function saveProductReview(review: {
  productSlug: string;
  name: string;
  location: string;
  rating: number;
  body: string;
}): Promise<void> {
  const { error } = await supabase.from("reviews").insert({
    product_slug: review.productSlug,
    name: review.name.trim(),
    location: review.location.trim(),
    rating: Math.min(5, Math.max(1, Math.round(review.rating))),
    body: review.body.trim(),
    status: "pending",
  });
  if (error) handleDbError(error, "saveProductReview");
  logger.info("review.submitted", { productSlug: review.productSlug });
}

// ─── Flyers ───────────────────────────────────────────────────────────────────

export type Flyer = {
  id: string;
  imageUrl: string;
  title: string;
  isActive: boolean;
  delaySeconds: number;
  createdAt: Date;
};

function rowToFlyer(row: Record<string, unknown>): Flyer {
  return {
    id: String(row.id),
    imageUrl: String(row.image_url),
    title: String(row.title ?? ""),
    isActive: Boolean(row.is_active),
    delaySeconds: Number(row.delay_seconds ?? 5),
    createdAt: parseDate(row.created_at as string),
  };
}

export async function getFlyers(): Promise<Flyer[]> {
  const { data, error } = await supabase
    .from("flyers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) handleDbError(error, "getFlyers");
  return (data ?? []).map((r) => rowToFlyer(r as Record<string, unknown>));
}

export async function getActiveFlyer(): Promise<Flyer | null> {
  const { data, error } = await supabase
    .from("flyers")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) handleDbError(error, "getActiveFlyer");
  if (!data) return null;
  return rowToFlyer(data as Record<string, unknown>);
}

export async function saveFlyer(input: {
  imageUrl: string;
  title: string;
  delaySeconds: number;
}): Promise<string> {
  const { data, error } = await supabase
    .from("flyers")
    .insert({
      image_url: input.imageUrl,
      title: input.title.trim(),
      delay_seconds: input.delaySeconds,
      is_active: false,
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) handleDbError(error, "saveFlyer");
  return String((data as Record<string, unknown>).id);
}

export async function setFlyerActive(id: string, isActive: boolean): Promise<void> {
  if (isActive) {
    // Deactivate all others first (only one active flyer at a time)
    const { error: deactivateErr } = await supabase
      .from("flyers")
      .update({ is_active: false })
      .neq("id", id);
    if (deactivateErr) handleDbError(deactivateErr, "setFlyerActive.deactivate");
  }
  const { error } = await supabase.from("flyers").update({ is_active: isActive }).eq("id", id);
  if (error) handleDbError(error, "setFlyerActive");
}

export async function deleteFlyer(id: string): Promise<void> {
  const { error } = await supabase.from("flyers").delete().eq("id", id);
  if (error) handleDbError(error, "deleteFlyer");
}
