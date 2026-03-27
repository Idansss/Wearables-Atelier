import { AnnouncementBar } from "../components/AnnouncementBar";
import { Navbar } from "../components/Navbar";
import { usePageTitle } from "../hooks/usePageTitle";
import { Hero } from "../components/Hero";
import { MarqueeTicker } from "../components/MarqueeTicker";
import { CategoryGrid } from "../components/CategoryGrid";
import { FeaturedProducts } from "../components/FeaturedProducts";
import { PromoBanner } from "../components/PromoBanner";
import { BrandStory } from "../components/BrandStory";
import { InstagramGrid } from "../components/InstagramGrid";
import { Footer } from "../components/Footer";
import { WhatsAppFAB } from "../components/WhatsAppFAB";

export default function Home() {
  usePageTitle("Wearables Atelier — Culture · Luxury · Elegance");
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="sticky top-0 z-50">
        <AnnouncementBar />
      </div>
      <Navbar />
      <main id="main-content">
        <Hero />
        <MarqueeTicker />
        <CategoryGrid />
        <FeaturedProducts />
        <PromoBanner />
        <BrandStory />
        <InstagramGrid />
      </main>
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}