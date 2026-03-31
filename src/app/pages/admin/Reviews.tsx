import { useEffect, useState, useCallback } from "react";
import { Search, Check, Trash2, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  getAllReviews,
  updateReviewStatus,
  deleteReview,
  type ProductReview,
} from "../../lib/db";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={n <= rating ? "#C9A84C" : "none"}
          stroke="#C9A84C"
          strokeWidth="1.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function Reviews() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved">("pending");
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setReviews(await getAllReviews());
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleApprove = async (review: ProductReview) => {
    setActionId(review.id);
    try {
      await updateReviewStatus(review.id, "approved");
      setReviews((cur) =>
        cur.map((r) => (r.id === review.id ? { ...r, status: "approved" } : r))
      );
      toast.success("Review approved — now visible on the product page");
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve review");
    } finally {
      setActionId(null);
    }
  };

  const handleUnapprove = async (review: ProductReview) => {
    setActionId(review.id);
    try {
      await updateReviewStatus(review.id, "pending");
      setReviews((cur) =>
        cur.map((r) => (r.id === review.id ? { ...r, status: "pending" } : r))
      );
      toast.success("Review set back to pending");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update review");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (review: ProductReview) => {
    if (!window.confirm(`Delete this review by ${review.name}?`)) return;
    setActionId(review.id);
    try {
      await deleteReview(review.id);
      setReviews((cur) => cur.filter((r) => r.id !== review.id));
      toast.success("Review deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete review");
    } finally {
      setActionId(null);
    }
  };

  const filtered = reviews
    .filter((r) => activeTab === "all" || r.status === activeTab)
    .filter((r) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.productSlug.toLowerCase().includes(q) ||
        r.body.toLowerCase().includes(q)
      );
    });

  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const approvedCount = reviews.filter((r) => r.status === "approved").length;

  const tabs = [
    { key: "pending" as const, label: "Pending", count: pendingCount },
    { key: "approved" as const, label: "Approved", count: approvedCount },
    { key: "all" as const, label: "All", count: reviews.length },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div
          className="flex items-center gap-2 flex-1 min-w-[220px] px-3 py-2 border bg-white"
          style={{ borderColor: "rgba(13,13,13,0.2)" }}
        >
          <Search size={14} style={{ color: "#9B9590", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search reviewer, product or review text…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "#0D0D0D" }}
          />
        </div>
        <p className="text-sm" style={{ color: "#6B6560" }}>
          {filtered.length} review{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex flex-wrap gap-1 mb-5 p-1"
        style={{ backgroundColor: "rgba(13,13,13,0.04)" }}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1.5"
              style={{
                backgroundColor: active ? "#0D0D0D" : "transparent",
                color: active ? "#C9A84C" : "#6B6560",
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className="px-1.5 py-0.5 text-[10px] font-bold rounded-full"
                  style={{
                    backgroundColor: tab.key === "pending" && !active ? "rgba(229,57,53,0.12)" : "rgba(13,13,13,0.08)",
                    color: tab.key === "pending" && !active ? "#b91c1c" : "inherit",
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid rgba(13,13,13,0.08)",
        }}
      >
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm" style={{ color: "#9B9590" }}>
            {activeTab === "pending"
              ? "No pending reviews — you're all caught up."
              : "No reviews found"}
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(13,13,13,0.06)" }}>
            {filtered.map((review) => (
              <div
                key={review.id}
                className="p-5 flex flex-col md:flex-row md:items-start gap-4"
                style={{
                  backgroundColor:
                    review.status === "pending" ? "rgba(245,158,11,0.03)" : "transparent",
                }}
              >
                {/* Left: rating + meta */}
                <div className="flex-shrink-0 w-full md:w-48">
                  <StarDisplay rating={review.rating} />
                  <p className="mt-1.5 font-semibold text-sm" style={{ color: "#0D0D0D" }}>
                    {review.name}
                  </p>
                  {review.location && (
                    <p className="text-xs" style={{ color: "#6B6560" }}>{review.location}</p>
                  )}
                  <p className="text-xs mt-1" style={{ color: "#9B9590" }}>
                    {formatDate(review.createdAt)}
                  </p>
                  <a
                    href={`/product/${review.productSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-[10px] uppercase tracking-[0.12em] px-2 py-1 font-semibold"
                    style={{ backgroundColor: "rgba(201,168,76,0.1)", color: "#C9A84C" }}
                  >
                    {review.productSlug.replace(/-/g, " ")}
                  </a>
                </div>

                {/* Middle: review body */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm leading-relaxed"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "#0D0D0D", fontSize: "15px" }}
                  >
                    "{review.body}"
                  </p>
                </div>

                {/* Right: status + actions */}
                <div className="flex-shrink-0 flex flex-row md:flex-col items-center md:items-end gap-2">
                  <span
                    className="px-2.5 py-1 text-[11px] font-semibold capitalize"
                    style={{
                      backgroundColor:
                        review.status === "approved"
                          ? "rgba(34,197,94,0.12)"
                          : "rgba(245,158,11,0.12)",
                      color:
                        review.status === "approved" ? "#15803d" : "#b45309",
                    }}
                  >
                    {review.status}
                  </span>

                  <div className="flex gap-1">
                    {review.status === "pending" ? (
                      <button
                        type="button"
                        onClick={() => handleApprove(review)}
                        disabled={actionId === review.id}
                        title="Approve review"
                        className="w-8 h-8 flex items-center justify-center border disabled:opacity-40 transition-opacity hover:opacity-70"
                        style={{ borderColor: "rgba(34,197,94,0.4)", color: "#15803d" }}
                      >
                        <Check size={14} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUnapprove(review)}
                        disabled={actionId === review.id}
                        title="Unpublish review"
                        className="w-8 h-8 flex items-center justify-center border disabled:opacity-40 transition-opacity hover:opacity-70"
                        style={{ borderColor: "rgba(13,13,13,0.2)", color: "#6B6560" }}
                      >
                        <EyeOff size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(review)}
                      disabled={actionId === review.id}
                      title="Delete review"
                      className="w-8 h-8 flex items-center justify-center border disabled:opacity-40 transition-opacity hover:opacity-70"
                      style={{ borderColor: "rgba(239,68,68,0.3)", color: "#e53935" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
