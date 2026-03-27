import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { getCollectionHref } from "../lib/siteSettings";

type HomeCollection = {
  id: string;
  label: string;
  href: string;
  img: string;
  span: string;
  large: boolean;
  isSale: boolean;
  badge?: string;
};

function CategoryTile({ cat }: { cat: HomeCollection }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={cat.href}
      className={`relative overflow-hidden group cursor-pointer ${cat.span}`}
      style={{ minHeight: cat.large ? 400 : cat.span.includes("col-span-2") ? 200 : 200 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={cat.img}
        alt={cat.label}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-700"
        style={{
          transform: hovered ? "scale(1.07)" : "scale(1)",
          position: "absolute",
          inset: 0,
        }}
      />
      {/* Overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-400"
        style={{
          background: "linear-gradient(to top, rgba(13,13,13,0.75) 0%, rgba(13,13,13,0.1) 60%)",
          opacity: hovered ? 0.95 : 0.5,
        }}
      />

      {/* Sale badge */}
      {(cat.isSale || cat.badge) && (
        <div
          className="absolute top-4 left-4 px-3 py-1"
          style={{ backgroundColor: cat.isSale ? "#e53935" : "#0D0D0D" }}
        >
          <span
            className="text-[10px] tracking-[0.2em] text-white"
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}
          >
            {cat.badge ?? "UP TO 40% OFF"}
          </span>
        </div>
      )}

      {/* Label + arrow */}
      <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
        <span
          style={{
            fontFamily: cat.large ? "'Cormorant Garamond', serif" : "'DM Sans', sans-serif",
            fontStyle: cat.large ? "italic" : "normal",
            fontWeight: cat.large ? 300 : 500,
            fontSize: cat.large ? "clamp(24px, 5vw, 52px)" : "clamp(11px, 2.8vw, 13px)",
            letterSpacing: cat.large ? "-0.01em" : "0.15em",
            textTransform: cat.large ? "none" : "uppercase",
            color: "#F8F5F0",
          }}
        >
          {cat.label}
        </span>
        <div
          className="transition-all duration-300 flex items-center gap-2"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateX(0)" : "translateX(10px)",
          }}
        >
          <span
            className="text-[10px] tracking-[0.2em] uppercase"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "#C9A84C",
            }}
          >
            Shop Now
          </span>
          <ArrowRight size={14} color="#C9A84C" />
        </div>
      </div>
    </Link>
  );
}

export function CategoryGrid() {
  const { settings } = useSiteSettings();
  const categories: HomeCollection[] = settings.collections
    .filter((collection) => collection.showOnHomepage)
    .map((collection) => {
      const isHero = collection.homeLayout === "hero";
      const isWide = collection.homeLayout === "wide";
      return {
        id: collection.slug,
        label: collection.label,
        href: getCollectionHref(collection.slug),
        img: collection.image,
        span: isHero
          ? "col-span-2 row-span-2"
          : isWide
          ? "col-span-2 row-span-1"
          : "col-span-1 row-span-1",
        large: isHero,
        isSale: collection.navAccent === "sale",
        badge: collection.homeBadge,
      };
    });

  return (
    <section className="py-16 lg:py-24 px-6 lg:px-10" style={{ backgroundColor: "#F8F5F0" }}>
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p
            className="text-xs tracking-[0.3em] mb-3 uppercase"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "#C9A84C",
            }}
          >
            Discover
          </p>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(36px, 4vw, 56px)",
              color: "#0D0D0D",
              lineHeight: 1.1,
            }}
          >
            Every Occasion, Every Style
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 auto-rows-[clamp(140px,30vw,200px)]">
          {categories.map((cat) => <CategoryTile key={cat.id} cat={cat} />)}
        </div>
      </div>
    </section>
  );
}
