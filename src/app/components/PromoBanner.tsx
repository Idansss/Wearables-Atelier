import { Link } from "react-router";

export function PromoBanner() {
  return (
    <section
      className="relative overflow-hidden py-20 px-6 lg:px-10 flex items-center justify-center"
      style={{ backgroundColor: "#C9A84C" }}
    >
      {/* Giant ghost text */}
      <span
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: "clamp(80px, 14vw, 180px)",
          color: "rgba(13,13,13,0.08)",
          letterSpacing: "-0.02em",
          whiteSpace: "nowrap",
        }}
      >
        IDANGANGAN
      </span>

      {/* Content */}
      <div className="relative z-10 text-center max-w-xl">
        <p
          className="text-xs tracking-[0.3em] uppercase mb-4"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            color: "#0D0D0D",
            opacity: 0.7,
          }}
        >
          Limited Time Offer
        </p>
        <h2
          className="mb-4"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: "clamp(48px, 6vw, 80px)",
            color: "#0D0D0D",
            lineHeight: 1,
          }}
        >
          Up to 40% Off
        </h2>
        <p
          className="mb-8"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "15px",
            fontWeight: 600,
            color: "rgba(13,13,13,0.75)",
          }}
        >
          Use code{" "}
          <span
            className="px-2 py-1 mx-1"
            style={{
              fontWeight: 800,
              backgroundColor: "#0D0D0D",
              color: "#C9A84C",
              letterSpacing: "0.1em",
            }}
          >
            IDANGANGAN
          </span>{" "}
          at checkout
        </p>
        <Link
          to="/shop/sale"
          className="inline-flex items-center px-10 py-4 text-xs tracking-[0.25em] uppercase transition-all hover:opacity-90"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            backgroundColor: "#0D0D0D",
            color: "#C9A84C",
          }}
        >
          SHOP THE SALE
        </Link>
      </div>
    </section>
  );
}