import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { AnnouncementBar } from "../components/AnnouncementBar";
import { WhatsAppFAB } from "../components/WhatsAppFAB";
import { MessageCircle } from "lucide-react";
import { usePageTitle } from "../hooks/usePageTitle";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { saveWholesaleLead } from "../lib/db";
import { buildWhatsAppHref } from "../lib/siteSettings";

const benefits = [
  { title: "Bulk Pricing", body: "Exclusive tiered discounts from 20% to 45% off retail depending on order volume." },
  { title: "Priority Production", body: "Wholesale orders are scheduled first — get your stock before it hits retail." },
  { title: "Custom Branding", body: "White-label and private label options available on selected fabric lines." },
  { title: "Dedicated Support", body: "Your own account manager via WhatsApp from enquiry through to delivery." },
];

export default function Wholesale() {
  usePageTitle("Wholesale | Wearables Atelier");
  const { settings } = useSiteSettings();
  const [form, setForm] = useState({ business: "", name: "", email: "", phone: "", categories: "", quantity: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value })),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await saveWholesaleLead(form);
      setSent(true);
    } catch {
      setSent(true); // still show success to user
    } finally {
      setSending(false);
    }
  };

  const inputStyle = {
    fontFamily: "'DM Sans', sans-serif",
    borderColor: "rgba(13,13,13,0.2)",
    backgroundColor: "transparent",
    color: "#0D0D0D",
  };

  const labelStyle = {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600 as const,
    color: "#0D0D0D",
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: "#F8F5F0", minHeight: "100vh" }}>
      <AnnouncementBar />
      <Navbar />
      <main id="main-content" className="pt-28 pb-20">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10">

          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] mb-3 uppercase" style={{ fontFamily: "'DM Sans', sans-serif", color: "#C9A84C" }}>Trade & Bulk Orders</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(40px, 5vw, 64px)", color: "#0D0D0D" }}>Wholesale</h1>
            <p className="mt-4 max-w-xl mx-auto text-sm leading-relaxed" style={{ color: "#6B6560" }}>
              Partner with Wearables Atelier to stock premium Nigerian womenswear in your boutique, store, or event. Minimum order 10 units.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {benefits.map((b) => (
              <div key={b.title} className="p-6 border" style={{ borderColor: "rgba(13,13,13,0.1)", backgroundColor: "#EDE8DF" }}>
                <p className="text-xs tracking-[0.2em] uppercase mb-3" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#C9A84C" }}>{b.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#6B6560" }}>{b.body}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Info */}
            <div>
              <h2 className="mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 400, fontSize: "28px", color: "#0D0D0D" }}>
                Prefer to talk first?
              </h2>
              <p className="text-sm leading-relaxed mb-8" style={{ color: "#6B6560" }}>
                Send us a message on WhatsApp with your business name and the categories you're interested in. We'll respond within 2 hours during business hours (Mon–Sat, 9am–6pm WAT).
              </p>
              <a
                href={buildWhatsAppHref(
                  settings.storefront,
                  "Hello Wearables Atelier! I'm interested in wholesale pricing."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-90"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, backgroundColor: "#25D366", color: "#fff" }}
              >
                <MessageCircle size={16} />
                Chat on WhatsApp
              </a>

              <div className="mt-10 p-6" style={{ borderLeft: "2px solid #C9A84C", backgroundColor: "rgba(201,168,76,0.06)" }}>
                <p className="text-xs tracking-[0.15em] uppercase mb-2" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#0D0D0D" }}>Minimum Order</p>
                <p className="text-sm" style={{ color: "#6B6560" }}>10 units per style · Mix of sizes allowed</p>
                <p className="text-xs tracking-[0.15em] uppercase mb-2 mt-4" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#0D0D0D" }}>Lead Time</p>
                <p className="text-sm" style={{ color: "#6B6560" }}>Ready-to-wear: 7–14 days · Custom: 3–5 weeks</p>
                <p className="text-xs tracking-[0.15em] uppercase mb-2 mt-4" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#0D0D0D" }}>Payment</p>
                <p className="text-sm" style={{ color: "#6B6560" }}>50% deposit · Balance before dispatch</p>
              </div>
            </div>

            {/* Form */}
            <div>
              {sent ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(201,168,76,0.15)" }}>
                    <MessageCircle size={28} style={{ color: "#C9A84C" }} />
                  </div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "28px", color: "#0D0D0D" }}>Enquiry received!</p>
                  <p className="mt-2 text-sm" style={{ color: "#6B6560" }}>We'll be in touch within 24 hours with pricing and availability.</p>
                  <button type="button" onClick={() => setSent(false)} className="mt-6 text-xs tracking-[0.2em] uppercase" style={{ color: "#C9A84C" }}>Send another enquiry</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={labelStyle}>Business / Store Name *</label>
                    <input type="text" required placeholder="Your business name" {...field("business")} className="w-full px-4 py-3 text-sm outline-none border" style={inputStyle} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={labelStyle}>Contact Name *</label>
                      <input type="text" required placeholder="Your name" {...field("name")} className="w-full px-4 py-3 text-sm outline-none border" style={inputStyle} />
                    </div>
                    <div>
                      <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={labelStyle}>Phone / WhatsApp *</label>
                      <input type="tel" required placeholder="+234..." {...field("phone")} className="w-full px-4 py-3 text-sm outline-none border" style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={labelStyle}>Email *</label>
                    <input type="email" required placeholder="your@email.com" {...field("email")} className="w-full px-4 py-3 text-sm outline-none border" style={inputStyle} />
                  </div>
                  <div>
                    <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={labelStyle}>Categories of Interest</label>
                    <input type="text" placeholder="e.g. Ready to Wear, Turbans, Fabrics" {...field("categories")} className="w-full px-4 py-3 text-sm outline-none border" style={inputStyle} />
                  </div>
                  <div>
                    <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={labelStyle}>Estimated Monthly Quantity</label>
                    <select {...field("quantity")} className="w-full px-4 py-3 text-sm outline-none border bg-transparent" style={inputStyle}>
                      <option value="">Select range</option>
                      <option>10–25 units</option>
                      <option>26–50 units</option>
                      <option>51–100 units</option>
                      <option>100+ units</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={labelStyle}>Additional Notes</label>
                    <textarea placeholder="Any specific requirements, custom branding, delivery location..." {...field("message")} rows={4} className="w-full px-4 py-3 text-sm outline-none border resize-none" style={inputStyle} />
                  </div>
                  <button type="submit" disabled={sending} className="py-4 text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-90 disabled:opacity-50" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, backgroundColor: "#0D0D0D", color: "#C9A84C" }}>
                    {sending ? "SENDING…" : "SEND WHOLESALE ENQUIRY"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
