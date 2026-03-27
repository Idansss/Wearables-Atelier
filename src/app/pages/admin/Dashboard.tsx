import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getOrders,
  getSubscribers,
  getContactMessages,
  getWholesaleLeads,
  type Order,
  type NewsletterSubscriber,
} from "../../lib/db";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG");
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  received: { bg: "rgba(59,130,246,0.12)", color: "#1d4ed8" },
  confirmed: { bg: "rgba(99,102,241,0.12)", color: "#4338ca" },
  processing: { bg: "rgba(245,158,11,0.12)", color: "#b45309" },
  dispatched: { bg: "rgba(249,115,22,0.12)", color: "#c2410c" },
  delivered: { bg: "rgba(34,197,94,0.12)", color: "#15803d" },
  cancelled: { bg: "rgba(239,68,68,0.12)", color: "#b91c1c" },
  refunded: { bg: "rgba(107,114,128,0.12)", color: "#374151" },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_COLORS[status] ?? STATUS_COLORS.received;
  return (
    <span
      className="inline-block px-2.5 py-1 text-[11px] font-semibold capitalize tracking-wide"
      style={{
        backgroundColor: style.bg,
        color: style.color,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {status}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div
      className="p-5 animate-pulse"
      style={{ backgroundColor: "#ffffff", border: "1px solid rgba(13,13,13,0.08)" }}
    >
      <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
      <div className="h-7 w-32 bg-gray-200 rounded" />
    </div>
  );
}

type StatCard = {
  label: string;
  value: string;
  sub?: string;
};

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [ordersData, subsData, messagesData, wholesaleData] = await Promise.all([
          getOrders(),
          getSubscribers(),
          getContactMessages(),
          getWholesaleLeads(),
        ]);
        setOrders(ordersData);
        setSubscribers(subsData);

        const unreadContact = messagesData.filter((m) => m.status === "unread").length;
        const newWholesale = wholesaleData.filter((w) => w.status === "new").length;
        setUnreadMessages(unreadContact + newWholesale);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const revenueToday = orders
    .filter((o) => o.createdAt >= todayStart && o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.total, 0);

  const revenueMonth = orders
    .filter((o) => o.createdAt >= monthStart && o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter((o) =>
    ["received", "confirmed", "processing"].includes(o.status)
  ).length;

  const activeSubscribers = subscribers.filter((s) => s.status === "active").length;

  const stats: StatCard[] = [
    { label: "Revenue Today", value: formatAmount(revenueToday) },
    { label: "Revenue This Month", value: formatAmount(revenueMonth) },
    { label: "Total Orders", value: String(orders.length) },
    { label: "Pending Orders", value: String(pendingOrders), sub: "received / confirmed / processing" },
    { label: "Active Subscribers", value: String(activeSubscribers) },
    { label: "Unread Messages", value: String(unreadMessages), sub: "contact + wholesale" },
  ];

  // Last 14 days revenue chart data
  const chartData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (13 - i));
    const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    const revenue = orders
      .filter((o) => o.createdAt >= d && o.createdAt < dayEnd && o.paymentStatus === "paid")
      .reduce((sum, o) => sum + o.total, 0);
    const count = orders.filter((o) => o.createdAt >= d && o.createdAt < dayEnd).length;
    return {
      day: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      revenue,
      orders: count,
    };
  });

  const recentOrders = orders.slice(0, 5);
  const recentSubscribers = subscribers.filter((s) => s.status === "active").slice(0, 5);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : stats.map((s) => (
              <div
                key={s.label}
                className="p-5"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(13,13,13,0.08)",
                  boxShadow: "0 1px 4px rgba(13,13,13,0.04)",
                }}
              >
                <p
                  className="text-[11px] uppercase tracking-[0.15em] mb-2"
                  style={{ color: "#6B6560" }}
                >
                  {s.label}
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: "#0D0D0D", fontVariantNumeric: "tabular-nums" }}
                >
                  {s.value}
                </p>
                {s.sub && (
                  <p className="text-[10px] mt-1" style={{ color: "#9B9590" }}>
                    {s.sub}
                  </p>
                )}
              </div>
            ))}
      </div>

      {/* Revenue Chart */}
      <div
        className="mb-8 p-5"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid rgba(13,13,13,0.08)",
          boxShadow: "0 1px 4px rgba(13,13,13,0.04)",
        }}
      >
        <h2
          className="mb-4"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "20px",
            color: "#0D0D0D",
          }}
        >
          Revenue — Last 14 Days
        </h2>
        {loading ? (
          <div className="h-48 bg-gray-100 rounded animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(13,13,13,0.06)" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "#9B9590", fontFamily: "'DM Sans', sans-serif" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => v === 0 ? "0" : `₦${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 10, fill: "#9B9590", fontFamily: "'DM Sans', sans-serif" }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip
                formatter={(value: number) => [formatAmount(value), "Revenue"]}
                contentStyle={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  border: "1px solid rgba(13,13,13,0.12)",
                  borderRadius: 0,
                  backgroundColor: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#C9A84C"
                strokeWidth={2}
                fill="url(#revenueGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#C9A84C" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid rgba(13,13,13,0.08)",
            boxShadow: "0 1px 4px rgba(13,13,13,0.04)",
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: "rgba(13,13,13,0.08)" }}
          >
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontSize: "20px",
                color: "#0D0D0D",
              }}
            >
              Recent Orders
            </h2>
            <a
              href="/admin/orders"
              className="text-xs tracking-wide"
              style={{ color: "#C9A84C" }}
            >
              View all →
            </a>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-8 text-center text-sm" style={{ color: "#9B9590" }}>
              No orders yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(13,13,13,0.06)" }}>
                    {["Ref", "Customer", "Total", "Status", "Date"].map((h) => (
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
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="transition-colors"
                      style={{ borderBottom: "1px solid rgba(13,13,13,0.04)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "rgba(201,168,76,0.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: "#C9A84C" }}>
                        {order.ref}
                      </td>
                      <td className="px-4 py-3" style={{ color: "#0D0D0D" }}>
                        {order.customer.firstName} {order.customer.lastName}
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: "#0D0D0D" }}>
                        {formatAmount(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#6B6560" }}>
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Subscribers */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid rgba(13,13,13,0.08)",
            boxShadow: "0 1px 4px rgba(13,13,13,0.04)",
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: "rgba(13,13,13,0.08)" }}
          >
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontSize: "20px",
                color: "#0D0D0D",
              }}
            >
              New Subscribers
            </h2>
            <a
              href="/admin/newsletter"
              className="text-xs tracking-wide"
              style={{ color: "#C9A84C" }}
            >
              View all →
            </a>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : recentSubscribers.length === 0 ? (
            <div className="p-8 text-center text-sm" style={{ color: "#9B9590" }}>
              No subscribers yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(13,13,13,0.06)" }}>
                    {["Email", "Source", "Date"].map((h) => (
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
                  {recentSubscribers.map((sub) => (
                    <tr
                      key={sub.id}
                      style={{ borderBottom: "1px solid rgba(13,13,13,0.04)" }}
                    >
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: "#0D0D0D" }}
                      >
                        {sub.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide capitalize"
                          style={{
                            backgroundColor:
                              sub.source === "popup"
                                ? "rgba(99,102,241,0.1)"
                                : "rgba(34,197,94,0.1)",
                            color:
                              sub.source === "popup" ? "#4338ca" : "#15803d",
                          }}
                        >
                          {sub.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#6B6560" }}>
                        {formatDate(sub.subscribedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
