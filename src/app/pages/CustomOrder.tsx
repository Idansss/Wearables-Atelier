import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { AnnouncementBar } from "../components/AnnouncementBar";
import { WhatsAppFAB } from "../components/WhatsAppFAB";
import { MessageCircle, Calendar, ChevronDown, Check, Loader2 } from "lucide-react";
import { usePageTitle } from "../hooks/usePageTitle";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { sendCustomOrderEmail } from "../lib/email";
import { saveCustomOrder } from "../lib/db";
import { buildWhatsAppHref } from "../lib/siteSettings";

const steps = [
  { n: "01", title: "Share Your Vision", body: "Fill in the form below with your style preferences, occasion, and measurements." },
  { n: "02", title: "Design Consultation", body: "We'll send fabric swatches and sketch options via WhatsApp within 48 hours." },
  { n: "03", title: "Confirm & Deposit", body: "Approve the design, pay the 50% deposit, and we begin production." },
  { n: "04", title: "Fitted & Delivered", body: "Your piece is handcrafted and delivered within 3–5 weeks, worldwide." },
];

const occasions = ["Wedding / Owambe", "Corporate Event", "Birthday", "Naming Ceremony", "Graduation", "Everyday Luxury", "Other"];
const garments = ["Iro & Buba", "Boubou", "Kaftan", "Aso Oke Set", "Jumpsuit", "Co-ord Set", "Fabric only", "Other"];

/** Branded dropdown — replaces native <select> */
function SelectField({
  value,
  onChange,
  options,
  placeholder = "Select...",
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Hidden native select for form validation */}
      {required && (
        <select
          tabIndex={-1}
          title="selection"
          required={required}
          value={value}
          onChange={() => {}}
          aria-hidden
          style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", top: 0, left: 0, pointerEvents: "none" }}
        >
          <option value="" />
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3 text-sm border flex items-center justify-between"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          borderColor: "rgba(13,13,13,0.2)",
          backgroundColor: "transparent",
          color: value ? "#0D0D0D" : "#9B9590",
          textAlign: "left",
        }}
      >
        <span>{value || placeholder}</span>
        <ChevronDown
          size={15}
          style={{
            color: "#C9A84C",
            flexShrink: 0,
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 2px)",
            left: 0,
            right: 0,
            zIndex: 50,
            backgroundColor: "#FDFAF6",
            border: "1px solid rgba(13,13,13,0.12)",
            boxShadow: "0 8px 24px rgba(13,13,13,0.1)",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className="w-full px-4 py-3 text-sm flex items-center justify-between text-left transition-colors"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                backgroundColor: value === opt ? "rgba(201,168,76,0.12)" : "transparent",
                color: value === opt ? "#0D0D0D" : "#3D3A36",
                borderBottom: "1px solid rgba(13,13,13,0.06)",
              }}
              onMouseEnter={(e) => {
                if (value !== opt) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(201,168,76,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  value === opt ? "rgba(201,168,76,0.12)" : "transparent";
              }}
            >
              <span>{opt}</span>
              {value === opt && <Check size={13} style={{ color: "#C9A84C", flexShrink: 0 }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Branded date picker — replaces the native <input type="date"> */
function DatePickerField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = value ? new Date(value + "T12:00:00") : undefined;
  const formatted = selected
    ? selected.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {/* Scoped CSS overrides for react-day-picker */}
      <style>{`
        .wba-dp { font-family: 'DM Sans', sans-serif; padding: 16px; }
        .wba-dp .rdp-caption_label {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 18px;
          font-weight: 400;
          color: #0D0D0D;
        }
        .wba-dp .rdp-nav_button { border-radius: 0; color: #6B6560; }
        .wba-dp .rdp-nav_button:hover { background-color: rgba(201,168,76,0.18) !important; color: #0D0D0D; }
        .wba-dp .rdp-head_cell {
          font-size: 10px; letter-spacing: 0.12em;
          text-transform: uppercase; color: #9B9590; font-weight: 600;
        }
        .wba-dp .rdp-day { border-radius: 0 !important; font-family: 'DM Sans', sans-serif; color: #0D0D0D; }
        .wba-dp .rdp-day:hover:not([disabled]):not(.rdp-day_selected) {
          background-color: rgba(201,168,76,0.18) !important;
        }
        .wba-dp .rdp-day_today:not(.rdp-day_selected) { color: #C9A84C !important; font-weight: 700; }
        .wba-dp .rdp-day_selected,
        .wba-dp .rdp-day_selected:hover,
        .wba-dp .rdp-day_selected:focus {
          background-color: #0D0D0D !important;
          color: #C9A84C !important;
          border-radius: 0 !important;
        }
        .wba-dp .rdp-day_outside { color: rgba(13,13,13,0.25); }
        .wba-dp .rdp-day_disabled { color: rgba(13,13,13,0.2); }
      `}</style>

      <div ref={ref} style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full px-4 py-3 text-sm border flex items-center justify-between"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            borderColor: "rgba(13,13,13,0.2)",
            backgroundColor: "transparent",
            color: formatted ? "#0D0D0D" : "#9B9590",
            textAlign: "left",
          }}
        >
          <span>{formatted || "Select a date"}</span>
          <Calendar size={15} style={{ color: "#C9A84C", flexShrink: 0 }} />
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              zIndex: 50,
              backgroundColor: "#FDFAF6",
              border: "1px solid rgba(13,13,13,0.12)",
              boxShadow: "0 8px 32px rgba(13,13,13,0.12)",
            }}
          >
            <DayPicker
              className="wba-dp"
              mode="single"
              selected={selected}
              disabled={{ before: new Date() }}
              onSelect={(day) => {
                if (day) {
                  // Store as YYYY-MM-DD string
                  const yyyy = day.getFullYear();
                  const mm = String(day.getMonth() + 1).padStart(2, "0");
                  const dd = String(day.getDate()).padStart(2, "0");
                  onChange(`${yyyy}-${mm}-${dd}`);
                  setOpen(false);
                }
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default function CustomOrder() {
  usePageTitle("Custom Order | Wearables Atelier");
  const { settings } = useSiteSettings();
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    occasion: "", garment: "", budget: "", eventDate: "",
    bust: "", waist: "", hips: "", height: "",
    inspiration: "", notes: "",
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value })),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSubmitError("");
    try {
      await Promise.all([
        sendCustomOrderEmail(form),
        saveCustomOrder({
          name: form.name,
          email: form.email,
          phone: form.phone,
          occasion: form.occasion,
          garment: form.garment,
          budget: form.budget,
          eventDate: form.eventDate,
          measurements: {
            bust: form.bust,
            waist: form.waist,
            hips: form.hips,
            height: form.height,
          },
          inspiration: form.inspiration,
          notes: form.notes,
          status: "new",
        }),
      ]);
      setSent(true);
    } catch {
      setSubmitError("Could not send your request. Please try WhatsApp below.");
    } finally {
      setSending(false);
    }
  };

  const inputStyle = { fontFamily: "'DM Sans', sans-serif", borderColor: "rgba(13,13,13,0.2)", backgroundColor: "transparent", color: "#0D0D0D" };
  const labelStyle = { fontFamily: "'DM Sans', sans-serif", fontWeight: 600 as const, color: "#0D0D0D" };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: "#F8F5F0", minHeight: "100vh" }}>
      <AnnouncementBar />
      <Navbar />
      <main id="main-content" className="pt-28 pb-20">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10">

          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] mb-3 uppercase" style={{ fontFamily: "'DM Sans', sans-serif", color: "#C9A84C" }}>Bespoke Atelier</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(40px, 5vw, 64px)", color: "#0D0D0D" }}>Custom Order</h1>
            <p className="mt-4 max-w-xl mx-auto text-sm leading-relaxed" style={{ color: "#6B6560" }}>
              Every woman deserves a piece made exactly for her. Tell us your vision and we'll craft it by hand in Lagos.
            </p>
          </div>

          {/* Process */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {steps.map((s) => (
              <div key={s.n} className="p-6" style={{ borderTop: "2px solid #C9A84C" }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 600, fontSize: "40px", color: "rgba(201,168,76,0.7)", lineHeight: 1 }}>{s.n}</span>
                <p className="text-xs tracking-[0.15em] uppercase mt-2 mb-2" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#0D0D0D" }}>{s.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "#6B6560" }}>{s.body}</p>
              </div>
            ))}
          </div>

          {sent ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(201,168,76,0.12)" }}>
                <MessageCircle size={32} style={{ color: "#C9A84C" }} />
              </div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "32px", color: "#0D0D0D" }}>Request received!</p>
              <p className="mt-3 mb-8 text-sm max-w-sm" style={{ color: "#6B6560" }}>We'll review your details and reach out within 48 hours with fabric options and a sketch.</p>
              <a
                href={buildWhatsAppHref(
                  settings.storefront,
                  `Hello! I just submitted a custom order request for ${form.garment || "a piece"} for ${form.occasion || "an occasion"}.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 text-xs tracking-[0.2em] uppercase"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, backgroundColor: "#25D366", color: "#fff" }}
              >
                <MessageCircle size={16} /> Follow up on WhatsApp
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left — personal & style */}
              <div className="flex flex-col gap-5">
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 400, fontSize: "24px", color: "#0D0D0D" }}>Your Details</h2>
                <div>
                  <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={labelStyle}>Full Name *</label>
                  <input type="text" required placeholder="Your name" {...field("name")} className="w-full px-4 py-3 text-sm outline-none border" style={inputStyle} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={labelStyle}>Email *</label>
                    <input type="email" required placeholder="your@email.com" {...field("email")} className="w-full px-4 py-3 text-sm outline-none border" style={inputStyle} />
                  </div>
                  <div>
                    <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={labelStyle}>WhatsApp *</label>
                    <input type="tel" required placeholder="+234..." {...field("phone")} className="w-full px-4 py-3 text-sm outline-none border" style={inputStyle} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={labelStyle}>Occasion *</label>
                    <SelectField
                      required
                      value={form.occasion}
                      onChange={(v) => setForm((p) => ({ ...p, occasion: v }))}
                      options={occasions}
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={labelStyle}>Garment Type *</label>
                    <SelectField
                      required
                      value={form.garment}
                      onChange={(v) => setForm((p) => ({ ...p, garment: v }))}
                      options={garments}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={labelStyle}>Budget (₦)</label>
                    <SelectField
                      value={form.budget}
                      onChange={(v) => setForm((p) => ({ ...p, budget: v }))}
                      options={["₦25,000 – ₦50,000", "₦50,000 – ₦80,000", "₦80,000 – ₦120,000", "₦120,000+"]}
                      placeholder="Select range"
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={labelStyle}>Event Date</label>
                    <DatePickerField
                      value={form.eventDate}
                      onChange={(v) => setForm((p) => ({ ...p, eventDate: v }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={labelStyle}>Style Inspiration</label>
                  <textarea placeholder="Describe your dream look, or share a colour/style reference..." {...field("inspiration")} rows={3} className="w-full px-4 py-3 text-sm outline-none border resize-none" style={inputStyle} />
                </div>
              </div>

              {/* Right — measurements & notes */}
              <div className="flex flex-col gap-5">
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 400, fontSize: "24px", color: "#0D0D0D" }}>Your Measurements</h2>
                <p className="text-xs leading-relaxed" style={{ color: "#6B6560" }}>
                  All measurements in centimetres. Not sure? Leave blank — we'll guide you via WhatsApp. See our{" "}
                  <a href="/size-guide" className="underline" style={{ color: "#C9A84C" }}>size guide</a> for instructions.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {(["bust", "waist", "hips", "height"] as const).map((m) => (
                    <div key={m}>
                      <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={labelStyle}>{m.charAt(0).toUpperCase() + m.slice(1)} (cm)</label>
                      <input type="number" min="0" placeholder="e.g. 90" {...field(m)} className="w-full px-4 py-3 text-sm outline-none border" style={inputStyle} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={labelStyle}>Additional Notes</label>
                  <textarea placeholder="Fabric preferences, allergies, special requirements..." {...field("notes")} rows={5} className="w-full px-4 py-3 text-sm outline-none border resize-none" style={inputStyle} />
                </div>
                {submitError && (
                  <p className="text-xs text-center" style={{ color: "#e53935", fontFamily: "'DM Sans', sans-serif" }}>{submitError}</p>
                )}
                <button type="submit" disabled={sending} className="mt-auto py-4 text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, backgroundColor: "#0D0D0D", color: "#C9A84C" }}>
                  {sending && <Loader2 size={14} className="animate-spin" />}
                  {sending ? "SENDING…" : "SUBMIT CUSTOM ORDER REQUEST"}
                </button>
                <p className="text-[11px] text-center" style={{ color: "#6B6560" }}>
                  No payment required yet. We'll reach out within 48 hours.
                </p>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
