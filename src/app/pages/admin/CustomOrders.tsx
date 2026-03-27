import { useEffect, useState, useCallback } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import {
  getCustomOrders,
  updateCustomOrderStatus,
  logAdminAction,
  type CustomOrder,
} from "../../lib/db";
import { useAdmin } from "../../context/AdminContext";

type CustomOrderStatus = CustomOrder["status"];

const ALL_STATUSES: CustomOrderStatus[] = [
  "new",
  "in_discussion",
  "quoted",
  "confirmed",
  "in_production",
  "delivered",
];

const STATUS_LABELS: Record<CustomOrderStatus, string> = {
  new: "New",
  in_discussion: "In Discussion",
  quoted: "Quoted",
  confirmed: "Confirmed",
  in_production: "In Production",
  delivered: "Delivered",
};

const STATUS_STYLES: Record<CustomOrderStatus, { bg: string; color: string }> = {
  new: { bg: "rgba(59,130,246,0.12)", color: "#1d4ed8" },
  in_discussion: { bg: "rgba(245,158,11,0.12)", color: "#b45309" },
  quoted: { bg: "rgba(99,102,241,0.12)", color: "#4338ca" },
  confirmed: { bg: "rgba(34,197,94,0.12)", color: "#15803d" },
  in_production: { bg: "rgba(249,115,22,0.12)", color: "#c2410c" },
  delivered: { bg: "rgba(107,114,128,0.12)", color: "#374151" },
};

function StatusBadge({ status }: { status: CustomOrderStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="inline-block px-2.5 py-1 text-[11px] font-semibold"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.12em] mb-0.5" style={{ color: "#9B9590" }}>
        {label}
      </p>
      <p className="text-sm" style={{ color: "#0D0D0D" }}>
        {value}
      </p>
    </div>
  );
}

function ExpandedRow({
  order,
  onStatusChange,
  onNotesChange,
  saving,
}: {
  order: CustomOrder;
  onStatusChange: (id: string, status: CustomOrderStatus) => void;
  onNotesChange: (id: string, notes: string) => Promise<void>;
  saving: boolean;
}) {
  const [notes, setNotes] = useState(order.adminNotes ?? "");
  const { bust, waist, hips, height } = order.measurements;

  return (
    <tr>
      <td
        colSpan={6}
        style={{ backgroundColor: "rgba(201,168,76,0.04)", borderBottom: "1px solid rgba(13,13,13,0.06)" }}
      >
        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-3">
            <DetailRow label="Occasion" value={order.occasion} />
            <DetailRow label="Garment" value={order.garment} />
            <DetailRow label="Budget" value={order.budget} />
            <DetailRow label="Event Date" value={order.eventDate} />
            <DetailRow label="Inspiration" value={order.inspiration} />
            <DetailRow label="Notes" value={order.notes} />
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: "#9B9590" }}>
                Measurements
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: "#0D0D0D" }}>
                {bust && <span>Bust: {bust}</span>}
                {waist && <span>Waist: {waist}</span>}
                {hips && <span>Hips: {hips}</span>}
                {height && <span>Height: {height}</span>}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: "#9B9590" }}>
                Update Status
              </p>
              <select
                title="Update status"
                value={order.status}
                onChange={(e) => onStatusChange(order.id, e.target.value as CustomOrderStatus)}
                className="text-xs px-2 py-1.5 border outline-none"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  borderColor: "rgba(13,13,13,0.2)",
                  backgroundColor: "#fff",
                  color: "#0D0D0D",
                }}
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: "#9B9590" }}>
                Admin Notes
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full text-xs px-3 py-2 border outline-none resize-none"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  borderColor: "rgba(13,13,13,0.2)",
                  backgroundColor: "#fff",
                  color: "#0D0D0D",
                }}
                placeholder="Internal notes…"
              />
              <button
                onClick={() => onNotesChange(order.id, notes)}
                disabled={saving}
                className="mt-1.5 px-4 py-1.5 text-[11px] uppercase tracking-wider font-semibold disabled:opacity-50"
                style={{ backgroundColor: "#0D0D0D", color: "#C9A84C" }}
              >
                {saving ? "Saving…" : "Save Notes"}
              </button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function CustomOrders() {
  const { user } = useAdmin();
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | CustomOrderStatus>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setOrders(await getCustomOrders());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: string, status: CustomOrderStatus) => {
    const prev = orders.find((o) => o.id === id);
    try {
      await updateCustomOrderStatus(id, status);
      setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, status } : o)));
      toast.success("Status updated");
      if (user) {
        void logAdminAction(user.id, user.email ?? "", "custom_order_status_changed", {
          orderId: id, from: prev?.status, to: status,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleNotesSave = async (id: string, notes: string) => {
    setSavingId(id);
    try {
      await updateCustomOrderStatus(id, orders.find((o) => o.id === id)!.status, notes);
      setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, adminNotes: notes } : o)));
      toast.success("Notes saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save notes");
    } finally {
      setSavingId(null);
    }
  };

  const filtered = orders
    .filter((o) => activeTab === "all" || o.status === activeTab)
    .filter((o) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        o.name.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.garment.toLowerCase().includes(q)
      );
    });

  const tabs: Array<"all" | CustomOrderStatus> = ["all", ...ALL_STATUSES];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div
          className="flex items-center gap-2 flex-1 min-w-[220px] px-3 py-2 border bg-white"
          style={{ borderColor: "rgba(13,13,13,0.2)" }}
        >
          <Search size={14} style={{ color: "#9B9590", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search name, email or garment…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "#0D0D0D" }}
          />
        </div>
        <p className="text-sm" style={{ color: "#6B6560" }}>
          {filtered.length} request{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex flex-wrap gap-1 mb-5 p-1"
        style={{ backgroundColor: "rgba(13,13,13,0.04)" }}
      >
        {tabs.map((tab) => {
          const count = tab === "all" ? orders.length : orders.filter((o) => o.status === tab).length;
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-3 py-2 text-xs font-medium transition-colors"
              style={{
                backgroundColor: active ? "#0D0D0D" : "transparent",
                color: active ? "#C9A84C" : "#6B6560",
              }}
            >
              {tab === "all" ? "All" : STATUS_LABELS[tab]}{" "}
              {count > 0 && <span className="opacity-60">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid rgba(13,13,13,0.08)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm" style={{ color: "#9B9590" }}>
            No custom order requests found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(13,13,13,0.08)", backgroundColor: "rgba(13,13,13,0.02)" }}>
                  {["", "Customer", "Garment / Occasion", "Budget", "Status", "Date"].map((h) => (
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
                {filtered.map((order) => {
                  const isExpanded = expandedId === order.id;
                  return (
                    <>
                      <tr
                        key={order.id}
                        style={{ borderBottom: "1px solid rgba(13,13,13,0.04)", cursor: "pointer" }}
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(201,168,76,0.04)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <td className="px-4 py-3" style={{ color: "#6B6560" }}>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </td>
                        <td className="px-4 py-3" style={{ color: "#0D0D0D" }}>
                          <div className="font-medium">{order.name}</div>
                          <div className="text-xs" style={{ color: "#6B6560" }}>{order.email}</div>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: "#6B6560" }}>
                          <div style={{ color: "#0D0D0D" }}>{order.garment}</div>
                          <div>{order.occasion}</div>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: "#6B6560" }}>
                          {order.budget || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: "#6B6560" }}>
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                      {isExpanded && (
                        <ExpandedRow
                          key={`${order.id}-expanded`}
                          order={order}
                          onStatusChange={handleStatusChange}
                          onNotesChange={handleNotesSave}
                          saving={savingId === order.id}
                        />
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
