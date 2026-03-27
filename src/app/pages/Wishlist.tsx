import { Link } from "react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { AnnouncementBar } from "../components/AnnouncementBar";
import { WhatsAppFAB } from "../components/WhatsAppFAB";
import { useWishlist } from "../context/WishlistContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { Heart, ShoppingBag, X } from "lucide-react";

export default function Wishlist() {
  usePageTitle("Wishlist | Wearables Atelier");
  const { items, toggle } = useWishlist();

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: "#F8F5F0", minHeight: "100vh" }}>
      <AnnouncementBar />
      <Navbar />
      <main id="main-content" className="pt-28 pb-20">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] mb-3 uppercase" style={{ fontFamily: "'DM Sans', sans-serif", color: "#C9A84C" }}>
              Saved Items
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(40px, 5vw, 64px)", color: "#0D0D0D" }}>
              Your Wishlist
            </h1>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-24">
              <Heart size={48} className="mx-auto mb-6" style={{ color: "rgba(13,13,13,0.15)" }} />
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "26px", color: "#0D0D0D" }}>
                Your wishlist is empty
              </p>
              <p className="mt-2 mb-8 text-sm" style={{ fontFamily: "'DM Sans', sans-serif", color: "#6B6560" }}>
                Save pieces you love while you browse — they'll wait here for you.
              </p>
              <Link
                to="/shop"
                className="px-10 py-4 text-xs tracking-[0.2em] uppercase inline-block"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, backgroundColor: "#0D0D0D", color: "#C9A84C" }}
              >
                Browse the Collection
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm mb-8" style={{ fontFamily: "'DM Sans', sans-serif", color: "#6B6560" }}>
                {items.length} saved {items.length === 1 ? "piece" : "pieces"}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                {items.map((item) => (
                  <div key={item.slug} className="group relative">
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => toggle(item)}
                      aria-label="Remove from wishlist"
                      className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: "rgba(248,245,240,0.95)", color: "#6B6560" }}
                    >
                      <X size={14} />
                    </button>

                    <Link to={`/product/${item.slug}`} className="block">
                      <div className="relative overflow-hidden mb-3" style={{ aspectRatio: "3/4" }}>
                        <img
                          src={item.img}
                          alt={item.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <p className="text-[10px] tracking-[0.2em] uppercase mb-1" style={{ fontFamily: "'DM Sans', sans-serif", color: "#6B6560" }}>
                        {item.category}
                      </p>
                      <p className="mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 400, fontSize: "17px", color: "#0D0D0D" }}>
                        {item.name}
                      </p>
                      <div className="flex items-center gap-3">
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "13px", color: item.salePrice ? "#e53935" : "#0D0D0D" }}>
                          ₦{(item.salePrice ?? item.price).toLocaleString()}
                        </span>
                        {item.salePrice && (
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#6B6560", textDecoration: "line-through" }}>
                            ₦{item.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </Link>

                    <Link
                      to={`/product/${item.slug}`}
                      className="mt-3 flex items-center justify-center gap-2 py-3 text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-80"
                      style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, backgroundColor: "#0D0D0D", color: "#C9A84C" }}
                    >
                      <ShoppingBag size={13} />
                      View & Add to Bag
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
