import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useSiteSettings } from "../context/SiteSettingsContext";

const HERO_IMAGE = "/images/collection/look-01.png";

export function Hero() {
  const [loaded, setLoaded] = useState(false);
  const { settings } = useSiteSettings();
  const s = settings.storefront;

  const stats = [
    { value: s.heroStat1Value, label: s.heroStat1Label },
    { value: s.heroStat2Value, label: s.heroStat2Label },
    { value: s.heroStat3Value, label: s.heroStat3Label },
  ];

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative w-full min-h-screen flex overflow-hidden" style={{ backgroundColor: "#0D0D0D" }}>
      {/* Left Panel */}
      <div
        className="relative z-10 flex flex-col justify-center px-8 md:px-12 lg:px-16 xl:px-20 pt-28 pb-10 w-full lg:w-1/2"
        style={{ backgroundColor: "#0D0D0D" }}
      >
        {/* Location tag */}
        <div
          className="flex items-center gap-2 mb-8 transition-all duration-700"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(20px)",
            transitionDelay: "0.1s",
          }}
        >
          <span className="w-6 h-px" style={{ backgroundColor: "#C9A84C" }} />
          <span
            className="text-xs tracking-[0.25em] uppercase"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "#C9A84C" }}
          >
            Lagos · Nigeria
          </span>
        </div>

        {/* Headline */}
        <div className="mb-8 overflow-hidden">
          <h1
            className="transition-all duration-700"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(72px, 9vw, 132px)",
              lineHeight: 0.9,
              color: "#F8F5F0",
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(40px)",
              transitionDelay: "0.25s",
            }}
          >
            Wearables
          </h1>
          <div
            className="mt-2 transition-all duration-700"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(40px)",
              transitionDelay: "0.5s",
            }}
          >
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: "clamp(14px, 1.5vw, 20px)",
                letterSpacing: "0.35em",
                color: "#C9A84C",
                textTransform: "uppercase",
              }}
            >
              ATELIER
            </span>
          </div>
        </div>

        {/* Divider */}
        <div
          className="flex items-center gap-4 mb-6 transition-all duration-700"
          style={{ opacity: loaded ? 1 : 0, transitionDelay: "0.6s" }}
        >
          <span className="flex-1 h-px" style={{ backgroundColor: "#C9A84C", opacity: 0.5 }} />
          <span
            className="text-[10px] tracking-[0.25em]"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "#C9A84C" }}
          >
            CULTURE · LUXURY · ELEGANCE
          </span>
          <span className="flex-1 h-px" style={{ backgroundColor: "#C9A84C", opacity: 0.5 }} />
        </div>

        {/* Subtext */}
        <p
          className="mb-10 max-w-sm transition-all duration-700"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: "#6B6560",
            fontSize: "15px",
            lineHeight: 1.7,
            opacity: loaded ? 1 : 0,
            transitionDelay: "0.68s",
          }}
        >
          Premium Nigerian womenswear — Iro & Buba, Aso Oke, Kaftan, Boubou, Turbans & Jewellery. Crafted in Lagos, worn worldwide.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-wrap gap-4 mb-12 transition-all duration-700"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(20px)",
            transitionDelay: "0.76s",
          }}
        >
          <Link
            to="/shop"
            className="px-8 py-4 text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:opacity-90"
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, backgroundColor: "#C9A84C", color: "#0D0D0D" }}
          >
            SHOP NOW
          </Link>
          <Link
            to="/shop/ashabi"
            className="flex items-center gap-2 px-8 py-4 text-xs tracking-[0.2em] uppercase border transition-all duration-300 hover:border-[#C9A84C] hover:text-[#C9A84C]"
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, borderColor: "rgba(248,245,240,0.4)", color: "#F8F5F0" }}
          >
            ASHABI COLLECTION
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Stats Row */}
        <div
          className="flex gap-8 transition-all duration-700"
          style={{ opacity: loaded ? 1 : 0, transitionDelay: "0.85s" }}
        >
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col">
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: "28px",
                  color: "#C9A84C",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </span>
              <span
                className="text-[10px] tracking-[0.2em] uppercase mt-1"
                style={{ fontFamily: "'DM Sans', sans-serif", color: "#6B6560" }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — editorial image */}
      <div className="hidden lg:block relative flex-1">
        <div
          className="absolute inset-y-0 left-0 w-32 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #0D0D0D, transparent)" }}
        />
        <img
          src={HERO_IMAGE}
          alt="Wearables Atelier editorial"
          className="w-full h-full object-cover object-center"
          fetchPriority="high"
        />

        {/* Floating trending card */}
        <div
          className="absolute bottom-10 right-8 z-20 p-5 min-w-[180px]"
          style={{ backgroundColor: "#0D0D0D", border: "1px solid rgba(201,168,76,0.3)" }}
        >
          <p
            className="text-[10px] tracking-[0.2em] mb-2"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "#C9A84C" }}
          >
            NOW TRENDING
          </p>
          <p
            className="text-sm mb-1"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "#F8F5F0" }}
          >
            {s.heroTrendingName}
          </p>
          <p
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "13px", color: "#C9A84C" }}
          >
            {s.heroTrendingPrice}
          </p>
        </div>
      </div>

      {/* Mobile hero image strip */}
      <div className="lg:hidden absolute inset-0 -z-0">
        <img
          src={HERO_IMAGE}
          alt="Wearables Atelier editorial"
          className="w-full h-full object-cover object-top opacity-20"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, #0D0D0D 40%, rgba(13,13,13,0.85))" }}
        />
      </div>
    </section>
  );
}
