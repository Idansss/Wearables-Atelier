import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { AnnouncementBar } from "../components/AnnouncementBar";
import { WhatsAppFAB } from "../components/WhatsAppFAB";
import { useLocation } from "react-router";
import { usePageTitle } from "../hooks/usePageTitle";
import { useSiteSettings } from "../context/SiteSettingsContext";
import type { SimplePagePath } from "../lib/siteSettings";

export default function SimplePage() {
  const location = useLocation();
  const { settings } = useSiteSettings();
  const page = settings.simplePages[location.pathname as SimplePagePath];
  usePageTitle(page ? `${page.title} | Wearables Atelier` : "Wearables Atelier");

  if (!page) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: "#F8F5F0", minHeight: "100vh" }}>
        <AnnouncementBar />
        <Navbar />
        <main className="pt-32 pb-20 px-6 text-center">
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "32px", color: "#0D0D0D" }}>Page coming soon</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: "#F8F5F0", minHeight: "100vh" }}>
      <AnnouncementBar />
      <Navbar />
      <main id="main-content" className="pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <div className="text-center py-12 mb-12 border-b" style={{ borderColor: "rgba(13,13,13,0.1)" }}>
            <p className="text-xs tracking-[0.3em] mb-3 uppercase" style={{ fontFamily: "'DM Sans', sans-serif", color: "#C9A84C" }}>
              Wearables Atelier
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(36px, 4vw, 56px)", color: "#0D0D0D", lineHeight: 1.1 }}>
              {page.title}
            </h1>
            <p className="mt-4 text-sm" style={{ fontFamily: "'DM Sans', sans-serif", color: "#6B6560" }}>{page.subtitle}</p>
          </div>

          <div className="flex flex-col gap-10">
            {page.content.map((section, index) => (
              <div key={index} className="border-l-2 pl-6" style={{ borderColor: "#C9A84C" }}>
                <h2 className="mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 400, fontSize: "22px", color: "#0D0D0D" }}>
                  {section.heading}
                </h2>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#6B6560", lineHeight: 1.8 }}>
                  {section.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
