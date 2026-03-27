import { useState, useEffect } from "react";
import { Users, Search, Loader2 } from "lucide-react";
import { getCustomers, type CustomerSummary } from "../../lib/db";

function fmt(n: number) {
  return "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function Customers() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getCustomers()
      .then(setCustomers)
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpend, 0);
  const totalOrders = customers.reduce((sum, c) => sum + c.orderCount, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

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
          Customers
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}>
          Customer summaries derived from order history.
        </p>
      </div>

      {/* Stats bar */}
      {!loading && customers.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Customers", value: customers.length.toString() },
            { label: "Total Revenue", value: fmt(totalRevenue) },
            { label: "Avg Order Value", value: fmt(avgOrderValue) },
          ].map((stat) => (
            <div
              key={stat.label}
              className="px-5 py-4 border"
              style={{ borderColor: "rgba(13,13,13,0.1)", backgroundColor: "#fff" }}
            >
              <p
                className="text-xs tracking-[0.1em] uppercase mb-1 font-semibold"
                style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}
              >
                {stat.label}
              </p>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: "26px",
                  fontWeight: 300,
                  color: "#0D0D0D",
                  lineHeight: 1.1,
                }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      {!loading && customers.length > 0 && (
        <div
          className="relative mb-6 max-w-sm"
        >
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "#6B6560" }}
          />
          <input
            type="search"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2.5 text-sm border outline-none focus:border-[#C9A84C] bg-white"
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
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Users size={36} style={{ color: "rgba(13,13,13,0.15)" }} />
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "20px",
              fontWeight: 300,
              color: "#6B6560",
            }}
          >
            No customers yet
          </p>
          <p className="text-xs" style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}>
            Customer data will appear here once orders are placed.
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
            No customers match your search.
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
                {["Name", "Email", "Phone", "Orders", "Total Spend", "Last Order"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs tracking-[0.1em] uppercase font-semibold"
                    style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr
                  key={c.email}
                  style={{
                    borderBottom: i < filtered.length - 1 ? "1px solid rgba(13,13,13,0.07)" : "none",
                  }}
                >
                  <td
                    className="px-4 py-3 font-semibold"
                    style={{ color: "#0D0D0D", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {c.name || <span className="italic font-normal" style={{ color: "#6B6560" }}>—</span>}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}>
                    {c.email}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}>
                    {c.phone || <span className="italic text-xs">—</span>}
                  </td>
                  <td
                    className="px-4 py-3 font-semibold text-center"
                    style={{ color: "#0D0D0D", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {c.orderCount}
                  </td>
                  <td
                    className="px-4 py-3 font-semibold"
                    style={{ color: "#0D0D0D", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {fmt(c.totalSpend)}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}>
                    {c.lastOrderAt.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
