import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useSiteSettings } from "../context/SiteSettingsContext";

const SLIDES = [
  {
    image: "/images/collection/look-01.png",
    label: "Ashabi Collection",
    name: "Embellished Lace Boubou",
    price: "₦120,000",
    link: "/shop/ashabi",
  },
  {
    image: "/images/collection/look-02.png",
    label: "Ready to Wear",
    name: "Iro & Buba Set — Jade",
    price: "₦85,000",
    link: "/shop/ready-to-wear",
  },
  {
    image: "/images/collection/look-03.png",
    label: "New In",
    name: "Aso Oke Kaftan",
    price: "₦95,000",
    link: "/shop/new-in",
  },
];

const SLIDE_INTERVAL = 5000;

export function Hero() {
  const [loaded, setLoaded] = useState(false);
  const [slide, setSlide] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { settings } = useSiteSettings();
  const s = settings.storefront;

  const stats = [
    { value: s.heroStat1Value, label: s.heroStat1Label },
    { value: s.heroStat2Value, label: s.heroStat2Label },
    { value: s.heroStat3Value, label: s.heroStat3Label },
  ];

  function goToSlide(index: number) {
    if (index === slide) return;
    setFading(true);
    setTimeout(() => {
      setSlide(index);
      setFading(false);
    }, 400);
  }

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      goToSlide((slide + 1) % SLIDES.length);
    }, SLIDE_INTERVAL);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [slide]);

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

      {/* Right Panel — slideshow */}
      <div className="hidden lg:block relative flex-1 overflow-hidden">
        {/* Left fade */}
        <div
          className="absolute inset-y-0 left-0 w-32 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #0D0D0D, transparent)" }}
        />

        {/* Slides */}
        {SLIDES.map((s, i) => (
          <img
            key={s.image}
            src={s.image}
            alt={s.name}
            fetchPriority={i === 0 ? "high" : "auto"}
            className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500"
            style={{ opacity: i === slide ? (fading ? 0 : 1) : 0 }}
          />
        ))}

        {/* Floating trending card */}
        <div
          className="absolute bottom-10 right-8 z-20 p-5 min-w-[180px] transition-opacity duration-400"
          style={{
            backgroundColor: "#0D0D0D",
            border: "1px solid rgba(201,168,76,0.3)",
            opacity: fading ? 0 : 1,
          }}
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
            {SLIDES[slide].name}
          </p>
          <p
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "13px", color: "#C9A84C" }}
          >
            {SLIDES[slide].price}
          </p>
          <Link
            to={SLIDES[slide].link}
            className="mt-3 flex items-center gap-1 text-[10px] tracking-[0.15em] uppercase transition-opacity hover:opacity-70"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(248,245,240,0.5)" }}
          >
            View <ArrowUpRight size={10} />
          </Link>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="transition-all duration-300"
              style={{
                width: i === slide ? "24px" : "8px",
                height: "8px",
                borderRadius: "4px",
                backgroundColor: i === slide ? "#C9A84C" : "rgba(201,168,76,0.35)",
                border: "none",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>

      {/* Mobile hero image strip — also slides */}
      <div className="lg:hidden absolute inset-0 -z-0">
        {SLIDES.map((s, i) => (
          <img
            key={s.image}
            src={s.image}
            alt={s.name}
            className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500"
            style={{ opacity: i === slide ? (fading ? 0 : 0.2) : 0 }}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, #0D0D0D 40%, rgba(13,13,13,0.85))" }}
        />
      </div>
    </section>
  );
}
