import { useEffect, useState, useCallback } from "react";
import { Search, ChevronDown, ChevronUp, Download } from "lucide-react";
import { toast } from "sonner";
import {
  getWholesaleLeads,
  updateWholesaleStatus,
  logAdminAction,
  type WholesaleLead,
} from "../../lib/db";
import { useAdmin } from "../../context/AdminContext";

type LeadStatus = WholesaleLead["status"];

const ALL_STATUSES: LeadStatus[] = ["new", "contacted", "quoted", "converted", "closed"];

const STATUS_STYLES: Record<LeadStatus, { bg: string; color: string }> = {
  new: { bg: "rgba(59,130,246,0.12)", color: "#1d4ed8" },
  contacted: { bg: "rgba(245,158,11,0.12)", color: "#b45309" },
  quoted: { bg: "rgba(99,102,241,0.12)", color: "#4338ca" },
  converted: { bg: "rgba(34,197,94,0.12)", color: "#15803d" },
  closed: { bg: "rgba(107,114,128,0.12)", color: "#374151" },
};

function StatusBadge({ status }: { status: LeadStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="inline-block px-2.5 py-1 text-[11px] font-semibold capitalize"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function exportCSV(leads: WholesaleLead[]) {
  const headers = ["Business", "Name", "Email", "Phone", "Categories", "Quantity", "Message", "Status", "Date"];
  const rows = leads.map((l) => [
    l.business, l.name, l.email, l.phone, l.categories, l.quantity, l.message, l.status, formatDate(l.createdAt),
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wholesale-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function WholesaleLeads() {
  const { user } = useAdmin();
  const [leads, setLeads] = useState<WholesaleLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | LeadStatus>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLeads(await getWholesaleLeads());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    const prev = leads.find((l) => l.id === id);
    try {
      await updateWholesaleStatus(id, status);
      setLeads((cur) => cur.map((l) => (l.id === id ? { ...l, status } : l)));
      toast.success("Status updated");
      if (user) {
        void logAdminAction(user.id, user.email ?? "", "wholesale_status_changed", {
          leadId: id, email: prev?.email, from: prev?.status, to: status,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const filtered = leads
    .filter((l) => activeTab === "all" || l.status === activeTab)
    .filter((l) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        l.business.toLowerCase().includes(q) ||
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q)
      );
    });

  const tabs: Array<"all" | LeadStatus> = ["all", ...ALL_STATUSES];

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
            placeholder="Search business, name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "#0D0D0D" }}
          />
        </div>
        <p className="text-sm" style={{ color: "#6B6560" }}>
          {filtered.length} lead{filtered.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => exportCSV(filtered)}
          className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider transition-opacity hover:opacity-80"
          style={{ backgroundColor: "#0D0D0D", color: "#C9A84C", fontWeight: 600 }}
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex flex-wrap gap-1 mb-5 p-1"
        style={{ backgroundColor: "rgba(13,13,13,0.04)" }}
      >
        {tabs.map((tab) => {
          const count = tab === "all" ? leads.length : leads.filter((l) => l.status === tab).length;
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-3 py-2 text-xs capitalize font-medium transition-colors"
              style={{
                backgroundColor: active ? "#0D0D0D" : "transparent",
                color: active ? "#C9A84C" : "#6B6560",
              }}
            >
              {tab}{" "}
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
            No wholesale leads found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(13,13,13,0.08)", backgroundColor: "rgba(13,13,13,0.02)" }}>
                  {["", "Business", "Contact", "Categories", "Status", "Update Status", "Date"].map((h) => (
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
                {filtered.map((lead) => {
                  const isExpanded = expandedId === lead.id;
                  return (
                    <>
                      <tr
                        key={lead.id}
                        style={{ borderBottom: "1px solid rgba(13,13,13,0.04)", cursor: "pointer" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(201,168,76,0.04)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <td
                          className="px-4 py-3"
                          style={{ color: "#6B6560" }}
                          onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </td>
                        <td
                          className="px-4 py-3 font-medium"
                          style={{ color: "#0D0D0D" }}
                          onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                        >
                          {lead.business}
                        </td>
                        <td
                          className="px-4 py-3"
                          style={{ color: "#0D0D0D" }}
                          onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                        >
                          <div>{lead.name}</div>
                          <div className="text-xs" style={{ color: "#6B6560" }}>{lead.email}</div>
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "#6B6560" }}
                          onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                        >
                          {lead.categories || "—"}
                        </td>
                        <td
                          className="px-4 py-3"
                          onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                        >
                          <StatusBadge status={lead.status} />
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            title="Update lead status"
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                            className="text-xs px-2 py-1.5 border outline-none"
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              borderColor: "rgba(13,13,13,0.2)",
                              backgroundColor: "transparent",
                              color: "#0D0D0D",
                            }}
                          >
                            {ALL_STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "#6B6560" }}
                          onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                        >
                          {formatDate(lead.createdAt)}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${lead.id}-expanded`}>
                          <td
                            colSpan={7}
                            style={{ backgroundColor: "rgba(201,168,76,0.04)", borderBottom: "1px solid rgba(13,13,13,0.06)" }}
                          >
                            <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="flex flex-col gap-2">
                                <div>
                                  <p className="text-[10px] uppercase tracking-[0.12em] mb-0.5" style={{ color: "#9B9590" }}>Phone</p>
                                  <p style={{ color: "#0D0D0D" }}>{lead.phone || "—"}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-[0.12em] mb-0.5" style={{ color: "#9B9590" }}>Order Quantity</p>
                                  <p style={{ color: "#0D0D0D" }}>{lead.quantity || "—"}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.12em] mb-0.5" style={{ color: "#9B9590" }}>Message</p>
                                <p className="text-xs leading-relaxed" style={{ color: "#0D0D0D" }}>
                                  {lead.message || "—"}
                                </p>
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
        )}
      </div>
    </div>
  );
}
