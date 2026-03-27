/** Shimmer placeholder — matches the product card layout used in Shop, Cart upsell, and Related Products. */
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Image */}
      <div className="w-full bg-[#E8E3DB]" style={{ aspectRatio: "3/4" }} />
      {/* Category label */}
      <div className="mt-3 h-2.5 w-16 rounded bg-[#E8E3DB]" />
      {/* Name */}
      <div className="mt-2 h-4 w-3/4 rounded bg-[#E8E3DB]" />
      {/* Price */}
      <div className="mt-2 h-3.5 w-20 rounded bg-[#E8E3DB]" />
    </div>
  );
}

/** Generic shimmer block — use for any arbitrary placeholder. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-[#E8E3DB] ${className}`} />;
}
