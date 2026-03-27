import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { AnnouncementBar } from "../components/AnnouncementBar";
import { WhatsAppFAB } from "../components/WhatsAppFAB";
import { MapPin, Phone, Mail, MessageCircle, Loader2 } from "lucide-react";
import { usePageTitle } from "../hooks/usePageTitle";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { sendContactEmail } from "../lib/email";
import { saveContactMessage } from "../lib/db";
import { buildWhatsAppHref } from "../lib/siteSettings";

export default function Contact() {
  usePageTitle("Contact Us | Wearables Atelier");
  const { settings } = useSiteSettings();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const storefront = settings.storefront;
  const whatsappHref = buildWhatsAppHref(storefront);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await Promise.all([
        sendContactEmail(form),
        saveContactMessage({ name: form.name, email: form.email, subject: form.subject, message: form.message }),
      ]);
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setError("Something went wrong. Please try WhatsApp or email us directly.");
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
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] mb-3 uppercase" style={{ fontFamily: "'DM Sans', sans-serif", color: "#C9A84C" }}>Get in Touch</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(40px, 5vw, 64px)", color: "#0D0D0D" }}>Contact Us</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Info */}
            <div>
              <h2 className="mb-8" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 400, fontSize: "28px", color: "#0D0D0D" }}>We'd love to hear from you</h2>
              <div className="flex flex-col gap-6">
                {[ 
                  { icon: <MapPin size={18} />, label: "Location", value: storefront.locationLabel },
                  { icon: <Phone size={18} />, label: "Phone / WhatsApp", value: storefront.contactPhone },
                  { icon: <Mail size={18} />, label: "Email", value: storefront.contactEmail },
                ].map((c) => (
                  <div key={c.label} className="flex items-start gap-4">
                    <div className="mt-0.5" style={{ color: "#C9A84C" }}>{c.icon}</div>
                    <div>
                      <p className="text-xs tracking-[0.15em] uppercase mb-1" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#6B6560" }}>{c.label}</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#0D0D0D" }}>{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* WhatsApp CTA */}
              <div className="mt-10 p-6" style={{ backgroundColor: "#EDE8DF" }}>
                <p className="mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "20px", color: "#0D0D0D" }}>Prefer to chat instantly?</p>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-3 w-fit text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-80"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, backgroundColor: "#25D366", color: "#fff" }}
                >
                  <MessageCircle size={16} />
                  WHATSAPP US NOW
                </a>
              </div>
            </div>

            {/* Form */}
            <div>
              {sent ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(201,168,76,0.15)" }}>
                    <Mail size={28} style={{ color: "#C9A84C" }} />
                  </div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "28px", color: "#0D0D0D" }}>Message sent!</p>
                  <p className="mt-2 text-sm" style={{ fontFamily: "'DM Sans', sans-serif", color: "#6B6560" }}>We'll get back to you within 24 hours.</p>
                  <button type="button" onClick={() => setSent(false)} className="mt-6 text-xs tracking-[0.2em] uppercase" style={{ fontFamily: "'DM Sans', sans-serif", color: "#C9A84C" }}>Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {[
                    { key: "name", label: "Full Name", type: "text", placeholder: "Your name" },
                    { key: "email", label: "Email Address", type: "email", placeholder: "your@email.com" },
                    { key: "subject", label: "Subject", type: "text", placeholder: "How can we help?" },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={labelStyle}>{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={(form as Record<string, string>)[f.key]}
                        onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                        required
                        className="w-full px-4 py-3 text-sm outline-none border"
                        style={inputStyle}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={labelStyle}>Message</label>
                    <textarea
                      placeholder="Tell us more..."
                      value={form.message}
                      onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                      required
                      rows={5}
                      className="w-full px-4 py-3 text-sm outline-none border resize-none"
                      style={inputStyle}
                    />
                  </div>
                  {error && (
                    <p className="text-xs text-center" style={{ color: "#e53935", fontFamily: "'DM Sans', sans-serif" }}>{error}</p>
                  )}
                  <button type="submit" disabled={sending} className="py-4 text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, backgroundColor: "#0D0D0D", color: "#C9A84C" }}>
                    {sending && <Loader2 size={14} className="animate-spin" />}
                    {sending ? "SENDING…" : "SEND MESSAGE"}
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
