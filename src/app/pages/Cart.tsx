import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { AnnouncementBar } from "../components/AnnouncementBar";
import { WhatsAppFAB } from "../components/WhatsAppFAB";
import { Trash2, ShoppingBag, Check, X } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useCart } from "../context/CartContext";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { validateCoupon } from "../lib/db";
import { buildWhatsAppHref } from "../lib/siteSettings";

const upsellPool = [
  { slug: "embellished-lace-boubou", name: "Embellished Lace Boubou", category: "Ready to Wear", price: 120000, img: "/images/collection/look-01.png" },
  { slug: "woven-turban-set", name: "Woven Turban Set", category: "Turbans", price: 25000, img: "/images/collection/look-04.png" },
  { slug: "gold-statement-necklace", name: "Gold Statement Necklace", category: "Jewellery", price: 45000, img: "/images/collection/look-05.png" },
  { slug: "ashabi-signature-dress", name: "Ashabi Signature Dress", category: "Ashabi", price: 110000, img: "/images/collection/look-06.png" },
  { slug: "velvet-evening-kaftan", name: "Velvet Evening Kaftan", category: "Ready to Wear", price: 105000, salePrice: 63000, img: "/images/collection/look-09.png" },
  { slug: "bridal-aso-oke", name: "Bridal Aso Oke Collection", category: "New In", price: 130000, img: "/images/collection/look-10.png" },
];

export default function Cart() {
  usePageTitle("Your Bag | Wearables Atelier");
  const { items, removeItem, updateQty, subtotal } = useCart();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [discount, setDiscount] = useState(0);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const discountAmount = Math.round(subtotal * discount);
  const total = subtotal - discountAmount;
  const orderSummary = items
    .map((item) => `${item.name} (${item.size}) x${item.qty}`)
    .join(", ");

  const applyCode = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const normalizedCoupon = coupon.trim().toUpperCase();

    if (!normalizedCoupon) {
      setDiscount(0);
      setAppliedCoupon("");
      setCouponStatus("idle");
      return;
    }

    setCheckingCoupon(true);
    setCouponStatus("idle");
    try {
      const validCoupon = await validateCoupon(normalizedCoupon);
      if (!validCoupon) {
        setDiscount(0);
        setAppliedCoupon("");
        setCouponStatus("invalid");
        return;
      }

      setDiscount(validCoupon.discount);
      setAppliedCoupon(validCoupon.code);
      setCoupon(normalizedCoupon);
      setCouponStatus("valid");
    } catch (err) {
      console.error("Coupon validation failed:", err);
      setDiscount(0);
      setAppliedCoupon("");
      setCouponStatus("invalid");
    } finally {
      setCheckingCoupon(false);
    }
  };

  const handleCheckout = () => {
    const params = new URLSearchParams();
    if (discount > 0) {
      params.set("discount", String(discount));
      params.set("coupon", coupon.trim().toUpperCase());
    }
    navigate(`/checkout${discount > 0 ? `?${params.toString()}` : ""}`);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: "#F8F5F0", minHeight: "100vh" }}>
      <AnnouncementBar />
      <Navbar />
      <main id="main-content" className="pt-28 pb-20">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
          <h1 className="mb-10" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(36px, 4vw, 56px)", color: "#0D0D0D" }}>Your Bag</h1>

          {items.length === 0 ? (
            <div className="text-center py-24">
              <ShoppingBag size={48} className="mx-auto mb-6" style={{ color: "#C9A84C" }} />
              <p className="mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "28px", color: "#0D0D0D" }}>Your bag is empty</p>
              <p className="mb-8 text-sm" style={{ color: "#6B6560" }}>Discover our latest pieces and add them to your bag</p>
              <Link to="/shop" className="px-10 py-4 text-xs tracking-[0.2em] uppercase inline-block" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, backgroundColor: "#0D0D0D", color: "#C9A84C" }}>Shop Now</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Items */}
              <div className="lg:col-span-2">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-5 py-6 border-b" style={{ borderColor: "rgba(13,13,13,0.1)" }}>
                    <div className="w-24 h-32 flex-shrink-0 overflow-hidden">
                      <img src={item.img} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: "#6B6560" }}>{item.category}</p>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "18px", color: "#0D0D0D" }}>{item.name}</p>
                        <p className="text-xs mt-1" style={{ color: "#6B6560" }}>Size: {item.size}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border" style={{ borderColor: "rgba(13,13,13,0.2)" }}>
                          <button type="button" onClick={() => updateQty(item.id, item.size, item.qty - 1)} className="w-8 h-8 flex items-center justify-center text-sm hover:bg-black/5 transition-colors">−</button>
                          <span className="w-8 text-center text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>{item.qty}</span>
                          <button type="button" onClick={() => updateQty(item.id, item.size, item.qty + 1)} className="w-8 h-8 flex items-center justify-center text-sm hover:bg-black/5 transition-colors">+</button>
                        </div>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "15px", color: "#0D0D0D" }}>
                          ₦{((item.salePrice ?? item.price) * item.qty).toLocaleString()}
                        </span>
                        <button type="button" onClick={() => removeItem(item.id, item.size)} className="transition-colors hover:text-red-500" style={{ color: "#6B6560" }} aria-label="Remove item">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="p-6 sticky top-28" style={{ backgroundColor: "#EDE8DF" }}>
                  <h2 className="mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 400, fontSize: "24px", color: "#0D0D0D" }}>Order Summary</h2>

                  <div className="flex flex-col gap-3 mb-6 text-sm" style={{ color: "#6B6560" }}>
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span style={{ color: "#0D0D0D", fontWeight: 600 }}>₦{subtotal.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between" style={{ color: "#e53935" }}>
                        <span>Discount ({appliedCoupon})</span>
                        <span>−₦{discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{subtotal >= 80000 ? <span style={{ color: "#1a6e2e" }}>Free</span> : "Calculated at checkout"}</span>
                    </div>
                    <div className="flex justify-between border-t pt-3" style={{ borderColor: "rgba(13,13,13,0.15)", fontWeight: 600, color: "#0D0D0D", fontSize: "16px" }}>
                      <span>Total</span>
                      <span>₦{total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Coupon */}
                  <div className="mb-6">
                    {couponStatus === "valid" && (
                      <div
                        className="mb-3 rounded-lg border px-3 py-2.5"
                        style={{
                          borderColor: "rgba(26,110,46,0.18)",
                          backgroundColor: "rgba(26,110,46,0.06)",
                        }}
                      >
                        <div
                          className="flex items-center justify-between gap-3 text-xs"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          <span className="flex items-center gap-1.5" style={{ color: "#1a6e2e", fontWeight: 600 }}>
                            <Check size={12} />
                            Coupon applied
                          </span>
                          <span style={{ color: "#0D0D0D", fontWeight: 600 }}>
                            {appliedCoupon} - {Math.round(discount * 100)}% off
                          </span>
                        </div>
                      </div>
                    )}
                    <form onSubmit={applyCode} className="flex">
                      <input
                        type="text"
                        placeholder="Coupon code"
                        value={coupon}
                        onChange={(e) => {
                          setCoupon(e.target.value);
                          setCouponStatus("idle");
                          setAppliedCoupon("");
                          setDiscount(0);
                        }}
                        className="flex-1 px-3 py-2.5 text-xs outline-none border"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          borderColor:
                            couponStatus === "invalid"
                              ? "#e53935"
                              : couponStatus === "valid"
                              ? "#1a6e2e"
                              : "rgba(13,13,13,0.2)",
                          backgroundColor: "transparent",
                          color: "#0D0D0D",
                        }}
                      />
                      <button
                        type="submit"
                        disabled={checkingCoupon}
                        className="min-w-[112px] px-4 py-2.5 text-xs tracking-[0.12em] uppercase transition-colors"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 600,
                          backgroundColor: couponStatus === "valid" ? "#1a6e2e" : "#0D0D0D",
                          color: couponStatus === "valid" ? "#F8F5F0" : "#C9A84C",
                        }}
                      >
                        {checkingCoupon ? "Checking…" : couponStatus === "valid" ? "Applied" : "Apply"}
                      </button>
                    </form>
                    {couponStatus === "valid" && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs" style={{ color: "#1a6e2e", fontFamily: "'DM Sans', sans-serif" }}>
                        <Check size={12} /> Code applied — {Math.round(discount * 100)}% off
                      </p>
                    )}
                    {couponStatus === "invalid" && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs" style={{ color: "#e53935", fontFamily: "'DM Sans', sans-serif" }}>
                        <X size={12} /> Invalid coupon code
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full py-4 text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-90 mb-3"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, backgroundColor: "#C9A84C", color: "#0D0D0D" }}
                  >
                    PROCEED TO CHECKOUT
                  </button>
                  <p className="text-[11px] text-center" style={{ fontFamily: "'DM Sans', sans-serif", color: "#6B6560" }}>
                    or{" "}
                    <a
                      href={buildWhatsAppHref(
                        settings.storefront,
                        `Hello Wearables Atelier! I'd like to order: ${orderSummary}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      style={{ color: "#25D366" }}
                    >
                      order via WhatsApp
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upsell — You May Also Like */}
          {(() => {
            const cartSlugs = new Set(items.map((i) => i.slug));
            const picks = upsellPool.filter((p) => !cartSlugs.has(p.slug)).slice(0, 4);
            if (picks.length === 0) return null;
            return (
              <div className="mt-20 border-t pt-14" style={{ borderColor: "rgba(13,13,13,0.1)" }}>
                <div className="text-center mb-10">
                  <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ fontFamily: "'DM Sans', sans-serif", color: "#C9A84C" }}>Complete Your Look</p>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(26px, 3vw, 38px)", color: "#0D0D0D" }}>You May Also Like</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                  {picks.map((p) => (
                    <Link key={p.slug} to={`/product/${p.slug}`} className="group block">
                      <div className="relative overflow-hidden mb-3" style={{ aspectRatio: "3/4" }}>
                        <img
                          src={p.img}
                          alt={p.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div
                          className="absolute bottom-0 left-0 right-0 flex items-center justify-center py-3 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: "#0D0D0D" }}
                        >
                          <span className="text-xs tracking-[0.2em] uppercase" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#C9A84C" }}>View Piece</span>
                        </div>
                      </div>
                      <p className="text-[10px] tracking-[0.2em] uppercase mb-1" style={{ fontFamily: "'DM Sans', sans-serif", color: "#6B6560" }}>{p.category}</p>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "16px", color: "#0D0D0D" }}>{p.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "13px", color: p.salePrice ? "#e53935" : "#0D0D0D" }}>
                          ₦{(p.salePrice ?? p.price).toLocaleString()}
                        </span>
                        {p.salePrice && (
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#6B6560", textDecoration: "line-through" }}>
                            ₦{p.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </main>
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
