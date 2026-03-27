import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

const pillars = [
  {
    label: "THE CRAFT",
    text:
      "Every piece is meticulously handcrafted by skilled Nigerian artisans using the finest Aso Oke, damask, and lace fabrics sourced directly from master weavers.",
  },
  {
    label: "THE CULTURE",
    text:
      "Rooted in centuries of Yoruba elegance, our designs celebrate heritage — honouring the ceremonies, the colour, and the stories that make Nigerian fashion extraordinary.",
  },
  {
    label: "THE COMMUNITY",
    text:
      "With 364K followers and counting, Wearables Atelier is a global movement of women who wear their culture with pride — from Lagos to London, Lagos to New York.",
  },
];

const tags = [
  "Custom Fabrics",
  "Iro & Buba",
  "Aso Oke",
  "Velvet & Suede",
  "Damask",
  "Kaftan & Boubou",
];

const stats = [
  { value: "364K+", label: "Instagram Followers" },
  { value: "16K+", label: "Posts" },
  { value: "₦25k–₦135k", label: "Price Range" },
  { value: "Worldwide", label: "Delivery" },
];

export function BrandStory() {
  return (
    <section
      className="relative overflow-hidden py-20 lg:py-32"
      style={{ backgroundColor: "#0D0D0D" }}
    >
      {/* Background editorial image with overlay */}
      <div className="relative max-w-[1440px] mx-auto px-6 lg:px-10">
        {/* Top editorial image */}
        <div className="relative mb-16 overflow-hidden" style={{ height: "420px" }}>
          <img
            src="/images/collection/look-10.png"
            alt="Ashabi editorial"
            loading="lazy"
            className="w-full h-full object-cover object-top"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(13,13,13,0.3) 0%, rgba(13,13,13,0.7) 100%)",
            }}
          />
          {/* Giant ghost "Ashabi" */}
          <span
            className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(80px, 16vw, 200px)",
              color: "rgba(201,168,76,0.12)",
              letterSpacing: "-0.03em",
            }}
          >
            Ashabi
          </span>
        </div>

        {/* Centre text */}
        <div className="text-center mb-16">
          <p
            className="text-xs tracking-[0.3em] mb-4 uppercase"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "#C9A84C",
            }}
          >
            Our Story
          </p>
          <h2
            className="mb-6"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(36px, 5vw, 64px)",
              color: "#F8F5F0",
              lineHeight: 1.1,
            }}
          >
            Born in Lagos, Worn Worldwide
          </h2>
          <p
            className="max-w-xl mx-auto"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "15px",
              color: "#6B6560",
              lineHeight: 1.8,
            }}
          >
            Wearables Atelier was founded with a singular vision — to elevate Nigerian fashion onto the world stage. Sub-brand Wearables by Ashabi (@wearablesbyashabi) brings designer craftsmanship to every woman.
          </p>
        </div>

        {/* Three Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
          {pillars.map((p) => (
            <div key={p.label} className="border-t pt-8" style={{ borderColor: "rgba(201,168,76,0.25)" }}>
              <p
                className="text-xs tracking-[0.3em] mb-4 uppercase"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  color: "#C9A84C",
                }}
              >
                {p.label}
              </p>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  color: "#6B6560",
                  lineHeight: 1.8,
                }}
              >
                {p.text}
              </p>
            </div>
          ))}
        </div>

        {/* Specialty tags */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-4 py-2 border text-xs tracking-[0.15em] uppercase"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                borderColor: "rgba(201,168,76,0.3)",
                color: "#C9A84C",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Ghost CTA button */}
        <div className="flex justify-center mb-16">
          <Link
            to="/about"
            className="flex items-center gap-3 px-10 py-4 border text-xs tracking-[0.25em] uppercase transition-all duration-300 hover:border-[#C9A84C] hover:text-[#C9A84C]"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              borderColor: "rgba(248,245,240,0.25)",
              color: "#F8F5F0",
            }}
          >
            OUR STORY
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Stats bar */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t pt-10"
          style={{ borderColor: "rgba(201,168,76,0.2)" }}
        >
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: "clamp(28px, 3vw, 40px)",
                  color: "#C9A84C",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </p>
              <p
                className="text-[11px] tracking-[0.2em] uppercase mt-2"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: "#6B6560",
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}