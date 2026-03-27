import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import {
  getContactMessages,
  getCustomOrders,
  getWholesaleLeads,
  updateContactStatus,
  updateCustomOrderStatus,
  updateWholesaleStatus,
  type ContactMessage,
  type CustomOrder,
  type WholesaleLead,
} from "../../lib/db";

type Tab = "contact" | "custom" | "wholesale";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Contact Tab ────────────────────────────────────────────────────────────────

const CONTACT_STATUS_STYLES: Record<ContactMessage["status"], { bg: string; color: string }> = {
  unread: { bg: "rgba(239,68,68,0.12)", color: "#b91c1c" },
  read: { bg: "rgba(107,114,128,0.12)", color: "#374151" },
  replied: { bg: "rgba(34,197,94,0.12)", color: "#15803d" },
};

function ContactTab() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    getContactMessages()
      .then(setMessages)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id: string, status: ContactMessage["status"]) => {
    setUpdating(id);
    try {
      await updateContactStatus(id, status);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status } : m))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="py-16 text-center text-sm" style={{ color: "#9B9590" }}>
        No contact messages yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[700px]">
        <thead>
          <tr
            style={{
              borderBottom: "1px solid rgba(13,13,13,0.08)",
              backgroundColor: "rgba(13,13,13,0.02)",
            }}
          >
            {["Name", "Email", "Subject", "Date", "Status", ""].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.12em] font-semibold"
                style={{ color: "#6B6560" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {messages.map((msg) => {
            const expanded = expandedId === msg.id;
            const styleMap = CONTACT_STATUS_STYLES[msg.status];
            return (
              <>
                <tr
                  key={msg.id}
                  style={{
                    borderBottom: expanded ? "none" : "1px solid rgba(13,13,13,0.04)",
                    backgroundColor: msg.status === "unread" ? "rgba(239,68,68,0.02)" : "transparent",
                  }}
                >
                  <td className="px-4 py-3 font-medium" style={{ color: "#0D0D0D" }}>
                    {msg.name}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#6B6560" }}>
                    {msg.email}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#0D0D0D" }}>
                    {msg.subject}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#6B6560" }}>
                    {formatDate(msg.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block px-2.5 py-1 text-[11px] font-semibold capitalize"
                      style={{ backgroundColor: styleMap.bg, color: styleMap.color }}
                    >
                      {msg.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setExpandedId(expanded ? null : msg.id)}
                      className="flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
                      style={{ color: "#C9A84C" }}
                    >
                      {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {expanded ? "Collapse" : "View"}
                    </button>
                  </td>
                </tr>
                {expanded && (
                  <tr
                    key={`${msg.id}-expanded`}
                    style={{ borderBottom: "1px solid rgba(13,13,13,0.04)" }}
                  >
                    <td colSpan={6} className="px-4 pb-4">
                      <div
                        className="p-4"
                        style={{
                          backgroundColor: "rgba(13,13,13,0.02)",
                          borderLeft: "3px solid #C9A84C",
                        }}
                      >
                        <p className="text-sm leading-relaxed mb-4" style={{ color: "#0D0D0D" }}>
                          {msg.message}
                        </p>
                        <div className="flex gap-2">
                          {msg.status !== "read" && (
                            <button
                              onClick={() => handleStatus(msg.id, "read")}
                              disabled={updating === msg.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                              style={{
                                backgroundColor: "rgba(107,114,128,0.15)",
                                color: "#374151",
                              }}
                            >
                              {updating === msg.id && <Loader2 size={11} className="animate-spin" />}
                              Mark as Read
                            </button>
                          )}
                          {msg.status !== "replied" && (
                            <button
                              onClick={() => handleStatus(msg.id, "replied")}
                              disabled={updating === msg.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                              style={{
                                backgroundColor: "rgba(34,197,94,0.15)",
                                color: "#15803d",
                              }}
                            >
                              {updating === msg.id && <Loader2 size={11} className="animate-spin" />}
                              Mark as Replied
                            </button>
                          )}
                          <a
                            href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                            className="px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                            style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
                          >
                            Reply via Email
                          </a>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Custom Orders Tab ──────────────────────────────────────────────────────────

const CUSTOM_STATUSES: CustomOrder["status"][] = [
  "new",
  "in_discussion",
  "quoted",
  "confirmed",
  "in_production",
  "delivered",
];

const CUSTOM_STATUS_STYLES: Record<CustomOrder["status"], { bg: string; color: string }> = {
  new: { bg: "rgba(239,68,68,0.12)", color: "#b91c1c" },
  in_discussion: { bg: "rgba(59,130,246,0.12)", color: "#1d4ed8" },
  quoted: { bg: "rgba(245,158,11,0.12)", color: "#b45309" },
  confirmed: { bg: "rgba(99,102,241,0.12)", color: "#4338ca" },
  in_production: { bg: "rgba(249,115,22,0.12)", color: "#c2410c" },
  delivered: { bg: "rgba(34,197,94,0.12)", color: "#15803d" },
};

function CustomOrdersTab() {
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [draftStatus, setDraftStatus] = useState<Record<string, CustomOrder["status"]>>({});

  useEffect(() => {
    getCustomOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (id: string) => {
    setSaving(id);
    const status = draftStatus[id];
    const notes = draftNotes[id];
    try {
      await updateCustomOrderStatus(id, status ?? orders.find((o) => o.id === id)!.status, notes);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                status: draftStatus[id] ?? o.status,
                adminNotes: draftNotes[id] ?? o.adminNotes,
              }
            : o
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center text-sm" style={{ color: "#9B9590" }}>
        No custom orders yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[800px]">
        <thead>
          <tr
            style={{
              borderBottom: "1px solid rgba(13,13,13,0.08)",
              backgroundColor: "rgba(13,13,13,0.02)",
            }}
          >
            {["Name", "Garment", "Occasion", "Budget", "Date", "Status", ""].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.12em] font-semibold"
                style={{ color: "#6B6560" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const expanded = expandedId === order.id;
            const status = draftStatus[order.id] ?? order.status;
            const styleMap = CUSTOM_STATUS_STYLES[order.status];
            return (
              <>
                <tr
                  key={order.id}
                  style={{
                    borderBottom: expanded ? "none" : "1px solid rgba(13,13,13,0.04)",
                  }}
                >
                  <td className="px-4 py-3 font-medium" style={{ color: "#0D0D0D" }}>
                    {order.name}
                    <div className="text-xs" style={{ color: "#6B6560" }}>
                      {order.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#0D0D0D" }}>
                    {order.garment}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#6B6560" }}>
                    {order.occasion}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#6B6560" }}>
                    {order.budget}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#6B6560" }}>
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block px-2.5 py-1 text-[11px] font-semibold capitalize"
                      style={{ backgroundColor: styleMap.bg, color: styleMap.color }}
                    >
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setExpandedId(expanded ? null : order.id);
                        if (!draftStatus[order.id]) {
                          setDraftStatus((p) => ({ ...p, [order.id]: order.status }));
                        }
                        if (draftNotes[order.id] === undefined) {
                          setDraftNotes((p) => ({ ...p, [order.id]: order.adminNotes ?? "" }));
                        }
                      }}
                      className="flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
                      style={{ color: "#C9A84C" }}
                    >
                      {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {expanded ? "Collapse" : "View"}
                    </button>
                  </td>
                </tr>
                {expanded && (
                  <tr
                    key={`${order.id}-expanded`}
                    style={{ borderBottom: "1px solid rgba(13,13,13,0.04)" }}
                  >
                    <td colSpan={7} className="px-4 pb-5">
                      <div
                        className="p-4"
                        style={{ backgroundColor: "rgba(13,13,13,0.02)", borderLeft: "3px solid #C9A84C" }}
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-4">
                          <div>
                            <p className="font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#6B6560" }}>Phone</p>
                            <p style={{ color: "#0D0D0D" }}>{order.phone}</p>
                          </div>
                          <div>
                            <p className="font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#6B6560" }}>Event Date</p>
                            <p style={{ color: "#0D0D0D" }}>{order.eventDate || "—"}</p>
                          </div>
                          <div>
                            <p className="font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#6B6560" }}>Bust</p>
                            <p style={{ color: "#0D0D0D" }}>{order.measurements.bust ? `${order.measurements.bust} cm` : "—"}</p>
                          </div>
                          <div>
                            <p className="font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#6B6560" }}>Waist</p>
                            <p style={{ color: "#0D0D0D" }}>{order.measurements.waist ? `${order.measurements.waist} cm` : "—"}</p>
                          </div>
                          <div>
                            <p className="font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#6B6560" }}>Hips</p>
                            <p style={{ color: "#0D0D0D" }}>{order.measurements.hips ? `${order.measurements.hips} cm` : "—"}</p>
                          </div>
                          <div>
                            <p className="font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#6B6560" }}>Height</p>
                            <p style={{ color: "#0D0D0D" }}>{order.measurements.height ? `${order.measurements.height} cm` : "—"}</p>
                          </div>
                        </div>
                        {order.inspiration && (
                          <div className="mb-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: "#6B6560" }}>Style Inspiration</p>
                            <p className="text-xs leading-relaxed" style={{ color: "#0D0D0D" }}>{order.inspiration}</p>
                          </div>
                        )}
                        {order.notes && (
                          <div className="mb-4">
                            <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: "#6B6560" }}>Customer Notes</p>
                            <p className="text-xs leading-relaxed" style={{ color: "#0D0D0D" }}>{order.notes}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <label
                              className="block text-[10px] font-semibold uppercase tracking-[0.12em] mb-1"
                              style={{ color: "#6B6560" }}
                            >
                              Update Status
                            </label>
                            <select
                              value={status}
                              onChange={(e) =>
                                setDraftStatus((p) => ({
                                  ...p,
                                  [order.id]: e.target.value as CustomOrder["status"],
                                }))
                              }
                              className="w-full px-3 py-2 text-sm outline-none border"
                              style={{
                                fontFamily: "'DM Sans', sans-serif",
                                borderColor: "rgba(13,13,13,0.2)",
                                backgroundColor: "transparent",
                                color: "#0D0D0D",
                              }}
                            >
                              {CUSTOM_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s.replace(/_/g, " ")}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label
                              className="block text-[10px] font-semibold uppercase tracking-[0.12em] mb-1"
                              style={{ color: "#6B6560" }}
                            >
                              Admin Notes
                            </label>
                            <textarea
                              rows={2}
                              value={draftNotes[order.id] ?? ""}
                              onChange={(e) =>
                                setDraftNotes((p) => ({ ...p, [order.id]: e.target.value }))
                              }
                              placeholder="Internal notes..."
                              className="w-full px-3 py-2 text-sm outline-none border resize-none"
                              style={{
                                fontFamily: "'DM Sans', sans-serif",
                                borderColor: "rgba(13,13,13,0.2)",
                                backgroundColor: "transparent",
                                color: "#0D0D0D",
                              }}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleSave(order.id)}
                          disabled={saving === order.id}
                          className="mt-3 flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-80"
                          style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
                        >
                          {saving === order.id && <Loader2 size={12} className="animate-spin" />}
                          Save Notes
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Wholesale Tab ──────────────────────────────────────────────────────────────

const WHOLESALE_STATUSES: WholesaleLead["status"][] = [
  "new",
  "contacted",
  "quoted",
  "converted",
  "closed",
];

const WHOLESALE_STATUS_STYLES: Record<WholesaleLead["status"], { bg: string; color: string }> = {
  new: { bg: "rgba(239,68,68,0.12)", color: "#b91c1c" },
  contacted: { bg: "rgba(59,130,246,0.12)", color: "#1d4ed8" },
  quoted: { bg: "rgba(245,158,11,0.12)", color: "#b45309" },
  converted: { bg: "rgba(34,197,94,0.12)", color: "#15803d" },
  closed: { bg: "rgba(107,114,128,0.12)", color: "#374151" },
};

function WholesaleTab() {
  const [leads, setLeads] = useState<WholesaleLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<Record<string, WholesaleLead["status"]>>({});

  useEffect(() => {
    getWholesaleLeads()
      .then(setLeads)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (id: string) => {
    const status = draftStatus[id];
    if (!status) return;
    setSaving(id);
    try {
      await updateWholesaleStatus(id, status);
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status } : l))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="py-16 text-center text-sm" style={{ color: "#9B9590" }}>
        No wholesale enquiries yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[750px]">
        <thead>
          <tr
            style={{
              borderBottom: "1px solid rgba(13,13,13,0.08)",
              backgroundColor: "rgba(13,13,13,0.02)",
            }}
          >
            {["Business", "Contact", "Email", "Quantity", "Date", "Status", ""].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.12em] font-semibold"
                style={{ color: "#6B6560" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const expanded = expandedId === lead.id;
            const status = draftStatus[lead.id] ?? lead.status;
            const styleMap = WHOLESALE_STATUS_STYLES[lead.status];
            return (
              <>
                <tr
                  key={lead.id}
                  style={{
                    borderBottom: expanded ? "none" : "1px solid rgba(13,13,13,0.04)",
                  }}
                >
                  <td className="px-4 py-3 font-medium" style={{ color: "#0D0D0D" }}>
                    {lead.business}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#0D0D0D" }}>
                    {lead.name}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#6B6560" }}>
                    {lead.email}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#6B6560" }}>
                    {lead.quantity || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#6B6560" }}>
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block px-2.5 py-1 text-[11px] font-semibold capitalize"
                      style={{ backgroundColor: styleMap.bg, color: styleMap.color }}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setExpandedId(expanded ? null : lead.id);
                        if (!draftStatus[lead.id]) {
                          setDraftStatus((p) => ({ ...p, [lead.id]: lead.status }));
                        }
                      }}
                      className="flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
                      style={{ color: "#C9A84C" }}
                    >
                      {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {expanded ? "Collapse" : "View"}
                    </button>
                  </td>
                </tr>
                {expanded && (
                  <tr
                    key={`${lead.id}-expanded`}
                    style={{ borderBottom: "1px solid rgba(13,13,13,0.04)" }}
                  >
                    <td colSpan={7} className="px-4 pb-5">
                      <div
                        className="p-4"
                        style={{ backgroundColor: "rgba(13,13,13,0.02)", borderLeft: "3px solid #C9A84C" }}
                      >
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs mb-4">
                          <div>
                            <p className="font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#6B6560" }}>Phone</p>
                            <p style={{ color: "#0D0D0D" }}>{lead.phone}</p>
                          </div>
                          <div>
                            <p className="font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#6B6560" }}>Categories</p>
                            <p style={{ color: "#0D0D0D" }}>{lead.categories || "—"}</p>
                          </div>
                          <div>
                            <p className="font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#6B6560" }}>Monthly Quantity</p>
                            <p style={{ color: "#0D0D0D" }}>{lead.quantity || "—"}</p>
                          </div>
                        </div>
                        {lead.message && (
                          <div className="mb-4">
                            <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: "#6B6560" }}>Notes</p>
                            <p className="text-xs leading-relaxed" style={{ color: "#0D0D0D" }}>{lead.message}</p>
                          </div>
                        )}

                        <div className="flex flex-wrap items-end gap-3 mt-3">
                          <div>
                            <label
                              className="block text-[10px] font-semibold uppercase tracking-[0.12em] mb-1"
                              style={{ color: "#6B6560" }}
                            >
                              Update Status
                            </label>
                            <select
                              value={status}
                              onChange={(e) =>
                                setDraftStatus((p) => ({
                                  ...p,
                                  [lead.id]: e.target.value as WholesaleLead["status"],
                                }))
                              }
                              className="px-3 py-2 text-sm outline-none border"
                              style={{
                                fontFamily: "'DM Sans', sans-serif",
                                borderColor: "rgba(13,13,13,0.2)",
                                backgroundColor: "transparent",
                                color: "#0D0D0D",
                              }}
                            >
                              {WHOLESALE_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={() => handleSave(lead.id)}
                            disabled={saving === lead.id}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-80"
                            style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
                          >
                            {saving === lead.id && <Loader2 size={12} className="animate-spin" />}
                            Save
                          </button>
                          <a
                            href={`mailto:${lead.email}`}
                            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-80"
                            style={{ backgroundColor: "#0D0D0D", color: "#C9A84C" }}
                          >
                            Email Lead
                          </a>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Messages Page ─────────────────────────────────────────────────────────

export default function Messages() {
  const [tab, setTab] = useState<Tab>("contact");
  const [contactUnread, setContactUnread] = useState(0);
  const [customNew, setCustomNew] = useState(0);
  const [wholesaleNew, setWholesaleNew] = useState(0);

  useEffect(() => {
    getContactMessages()
      .then((msgs) => setContactUnread(msgs.filter((m) => m.status === "unread").length))
      .catch(console.error);
    getCustomOrders()
      .then((orders) => setCustomNew(orders.filter((o) => o.status === "new").length))
      .catch(console.error);
    getWholesaleLeads()
      .then((leads) => setWholesaleNew(leads.filter((l) => l.status === "new").length))
      .catch(console.error);
  }, []);

  const tabs: Array<{ key: Tab; label: string; count: number }> = [
    { key: "contact", label: "Contact", count: contactUnread },
    { key: "custom", label: "Custom Orders", count: customNew },
    { key: "wholesale", label: "Wholesale", count: wholesaleNew },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Tabs */}
      <div
        className="flex gap-0 mb-5 border-b"
        style={{ borderColor: "rgba(13,13,13,0.1)" }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors"
            style={{
              color: tab === t.key ? "#0D0D0D" : "#6B6560",
              borderBottom: tab === t.key ? "2px solid #C9A84C" : "2px solid transparent",
              marginBottom: "-1px",
            }}
          >
            {t.label}
            {t.count > 0 && (
              <span
                className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full"
                style={{ backgroundColor: "#e53935", color: "#fff" }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid rgba(13,13,13,0.08)",
          overflow: "hidden",
        }}
      >
        {tab === "contact" && <ContactTab />}
        {tab === "custom" && <CustomOrdersTab />}
        {tab === "wholesale" && <WholesaleTab />}
      </div>
    </div>
  );
}
