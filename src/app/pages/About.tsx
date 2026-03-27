import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { AnnouncementBar } from "../components/AnnouncementBar";
import { WhatsAppFAB } from "../components/WhatsAppFAB";
import { Link } from "react-router";
import { usePageTitle } from "../hooks/usePageTitle";

export default function About() {
  usePageTitle("About Us | Wearables Atelier");
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: "#0D0D0D", minHeight: "100vh" }}>
      <AnnouncementBar />
      <Navbar />
      <main id="main-content">
        {/* Hero */}
        <section className="relative overflow-hidden flex items-center justify-center" style={{ minHeight: "60vh" }}>
          <img
            src="/images/collection/look-10.png"
            alt="Brand story"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(13,13,13,0.3), #0D0D0D)" }} />
          <div className="relative z-10 text-center pt-24 pb-12 px-6">
            <p className="text-xs tracking-[0.35em] mb-4 uppercase" style={{ fontFamily: "'DM Sans', sans-serif", color: "#C9A84C" }}>Our Story</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(44px, 6vw, 80px)", color: "#F8F5F0", lineHeight: 1.05 }}>
              Born in Lagos,<br />Worn Worldwide
            </h1>
          </div>
        </section>

        {/* Story text */}
        <section className="max-w-3xl mx-auto px-6 lg:px-10 py-20">
          <p className="mb-8" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", color: "#6B6560", lineHeight: 1.9 }}>
            Wearables Atelier began with a dream — to take the vibrant, opulent world of Nigerian fashion and share it with the globe. Founded in Lagos by creative director Ashabi, the brand was born from a deep reverence for Yoruba textile traditions and a burning desire to see African women represented at the highest levels of luxury fashion.
          </p>
          <p className="mb-8" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", color: "#6B6560", lineHeight: 1.9 }}>
            From hand-woven Aso Oke sourced directly from master weavers in Iseyin, to damask brought in from the finest mills, every Wearables Atelier piece is a celebration of culture. Our Iro & Buba sets, Kaftans, and Boubous are not merely garments — they are heirlooms in the making.
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", color: "#6B6560", lineHeight: 1.9 }}>
            With over 364,000 Instagram followers and a global customer base spanning Lagos to London, New York to Dubai, Wearables Atelier has become synonymous with a new era of Nigerian luxury. We ship worldwide and offer custom sizing — because every woman deserves to feel like royalty.
          </p>
        </section>

        {/* Values */}
        <section className="px-6 lg:px-10 py-16 max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { title: "Craftsmanship", text: "Every stitch is intentional. We work with Nigeria's most gifted tailors to produce garments of extraordinary quality." },
              { title: "Heritage", text: "We honour the centuries-old textile traditions of Yoruba, Igbo, and Hausa cultures, reinterpreting them for the modern woman." },
              { title: "Community", text: "Our 364K Instagram family is the heart of the brand. We create for women who celebrate themselves and their roots." },
            ].map((v) => (
              <div key={v.title} className="border-t pt-8" style={{ borderColor: "rgba(201,168,76,0.25)" }}>
                <p className="text-xs tracking-[0.25em] uppercase mb-4" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#C9A84C" }}>{v.title}</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#6B6560", lineHeight: 1.8 }}>{v.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-16 px-6">
          <Link to="/shop" className="inline-block px-12 py-4 text-xs tracking-[0.25em] uppercase transition-opacity hover:opacity-90" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, backgroundColor: "#C9A84C", color: "#0D0D0D" }}>
            Shop the Collection
          </Link>
        </section>
      </main>
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}