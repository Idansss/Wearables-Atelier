import { Link, useLocation } from "react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { AnnouncementBar } from "../components/AnnouncementBar";
import { WhatsAppFAB } from "../components/WhatsAppFAB";
import { usePageTitle } from "../hooks/usePageTitle";

const QUICK_LINKS = [
  { label: "New In", href: "/shop/new-in" },
  { label: "Ready to Wear", href: "/shop/ready-to-wear" },
  { label: "Ashabi Collection", href: "/shop/ashabi" },
  { label: "Turbans", href: "/shop/turbans" },
  { label: "Jewellery", href: "/shop/jewellery" },
  { label: "Custom Order", href: "/custom-order" },
];

export default function NotFound() {
  usePageTitle("Page Not Found | Wearables Atelier");
  const { pathname } = useLocation();

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: "#F8F5F0", minHeight: "100vh" }}>
      <AnnouncementBar />
      <Navbar />
      <main id="main-content" className="pt-28 pb-20">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10">

          {/* Hero block */}
          <div className="text-center py-20 border-b" style={{ borderColor: "rgba(13,13,13,0.1)" }}>
            <p
              className="select-none"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(100px, 18vw, 200px)",
                color: "rgba(13,13,13,0.06)",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              404
            </p>

            <p
              className="-mt-6 mb-4 text-xs tracking-[0.3em] uppercase"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "#C9A84C" }}
            >
              Page Not Found
            </p>

            <h1
              className="mb-5"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(28px, 4vw, 48px)",
                color: "#0D0D0D",
                lineHeight: 1.2,
              }}
            >
              This page has stepped out.
            </h1>

            <p
              className="mb-10 max-w-md mx-auto text-sm"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "#6B6560", lineHeight: 1.8 }}
            >
              {pathname !== "/" && (
                <>The page <span style={{ color: "#0D0D0D" }}>{pathname}</span> couldn't be found. </>
              )}
              Perhaps it was moved, renamed, or never existed. Let us guide you back to something beautiful.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/"
                className="px-10 py-4 text-xs tracking-[0.2em] uppercase"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, backgroundColor: "#0D0D0D", color: "#C9A84C" }}
              >
                Return Home
              </Link>
              <Link
                to="/shop"
                className="px-10 py-4 text-xs tracking-[0.2em] uppercase border transition-all hover:bg-[#0D0D0D] hover:text-[#C9A84C] hover:border-[#0D0D0D]"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, borderColor: "rgba(13,13,13,0.3)", color: "#0D0D0D" }}
              >
                Browse the Collection
              </Link>
            </div>
          </div>

          {/* Quick links */}
          <div className="pt-16 text-center">
            <p
              className="text-xs tracking-[0.3em] uppercase mb-8"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "#6B6560" }}
            >
              Or explore these
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-5 py-2.5 border text-xs tracking-[0.15em] uppercase transition-all hover:bg-[#0D0D0D] hover:text-[#C9A84C] hover:border-[#0D0D0D]"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 500,
                    borderColor: "rgba(13,13,13,0.2)",
                    color: "#0D0D0D",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
