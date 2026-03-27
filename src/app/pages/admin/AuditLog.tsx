import { useState, useEffect } from "react";
import { ScrollText, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { getAuditLogs, type AuditEntry } from "../../lib/db";

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    getAuditLogs(200)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const filtered = filter.trim()
    ? entries.filter((e) => e.action.toLowerCase().includes(filter.toLowerCase()))
    : entries;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "32px",
            color: "#0D0D0D",
            lineHeight: 1.2,
          }}
        >
          Audit Log
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}>
          Full history of every admin action — who changed what and when.
        </p>
      </div>

      {/* Filter */}
      {!loading && entries.length > 0 && (
        <div className="mb-6 max-w-sm">
          <input
            type="search"
            placeholder="Filter by action type…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border outline-none focus:border-[#C9A84C] bg-white"
            style={{
              borderColor: "rgba(13,13,13,0.2)",
              color: "#0D0D0D",
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin" style={{ color: "#C9A84C" }} />
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <ScrollText size={36} style={{ color: "rgba(13,13,13,0.15)" }} />
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "20px",
              fontWeight: 300,
              color: "#6B6560",
            }}
          >
            No audit entries yet
          </p>
          <p className="text-xs" style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}>
            Admin actions will be recorded here automatically.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "18px",
              fontWeight: 300,
              color: "#6B6560",
            }}
          >
            No entries match that filter.
          </p>
        </div>
      ) : (
        <div
          className="border overflow-x-auto"
          style={{ borderColor: "rgba(13,13,13,0.1)", backgroundColor: "#fff" }}
        >
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(13,13,13,0.1)" }}>
                {["", "Timestamp", "Admin Email", "Action", "Details"].map((h, i) => (
                  <th
                    key={i}
                    className="text-left px-4 py-3 text-xs tracking-[0.1em] uppercase font-semibold"
                    style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, i) => {
                const isExpanded = expanded.has(entry.id);
                const hasDetails = Object.keys(entry.details ?? {}).length > 0;
                return (
                  <>
                    <tr
                      key={entry.id}
                      style={{
                        borderBottom: "1px solid rgba(13,13,13,0.07)",
                        backgroundColor: isExpanded ? "rgba(201,168,76,0.04)" : i % 2 === 0 ? "#fff" : "rgba(13,13,13,0.01)",
                      }}
                    >
                      {/* Expand toggle */}
                      <td className="pl-3 pr-1 py-3 w-6">
                        {hasDetails ? (
                          <button
                            type="button"
                            onClick={() => toggleExpand(entry.id)}
                            title={isExpanded ? "Collapse" : "Expand details"}
                            className="w-5 h-5 flex items-center justify-center hover:opacity-60"
                          >
                            {isExpanded
                              ? <ChevronDown size={13} style={{ color: "#6B6560" }} />
                              : <ChevronRight size={13} style={{ color: "#6B6560" }} />
                            }
                          </button>
                        ) : null}
                      </td>

                      {/* Timestamp */}
                      <td
                        className="px-4 py-3 text-xs whitespace-nowrap"
                        style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {entry.timestamp.toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Email */}
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: "#0D0D0D", fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {entry.email}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        <span
                          className="text-xs tracking-[0.08em] uppercase font-semibold px-2 py-1"
                          style={{
                            backgroundColor: "rgba(201,168,76,0.12)",
                            color: "#0D0D0D",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {entry.action}
                        </span>
                      </td>

                      {/* Details summary */}
                      <td
                        className="px-4 py-3 text-xs max-w-[240px] truncate"
                        style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {hasDetails
                          ? Object.entries(entry.details)
                              .slice(0, 2)
                              .map(([k, v]) => `${k}: ${String(v)}`)
                              .join(" · ")
                          : <span className="italic">—</span>
                        }
                      </td>
                    </tr>

                    {/* Expanded details row */}
                    {isExpanded && hasDetails && (
                      <tr
                        key={entry.id + "-expanded"}
                        style={{ borderBottom: "1px solid rgba(13,13,13,0.07)" }}
                      >
                        <td />
                        <td colSpan={4} className="px-4 pb-4 pt-1">
                          <pre
                            className="text-xs p-3 overflow-x-auto"
                            style={{
                              backgroundColor: "#EDE8DF",
                              color: "#0D0D0D",
                              fontFamily: "monospace",
                              borderRadius: 2,
                              lineHeight: 1.6,
                            }}
                          >
                            {JSON.stringify(entry.details, null, 2)}
                          </pre>
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

      {!loading && filtered.length > 0 && (
        <p
          className="mt-3 text-xs"
          style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}
        >
          Showing {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
          {filter ? ` matching "${filter}"` : ""}.
        </p>
      )}
    </div>
  );
}
