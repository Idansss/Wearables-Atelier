import { useEffect, useState } from "react";
import { ExternalLink, Globe, Loader2, Save, Settings as SettingsIcon } from "lucide-react";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { saveSiteSettings } from "../../lib/db";
import { type StorefrontSettings } from "../../lib/siteSettings";

export default function Settings() {
  const { settings, refresh } = useSiteSettings();
  const [form, setForm] = useState<StorefrontSettings>(settings.storefront);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(settings.storefront);
  }, [settings.storefront]);

  function set<K extends keyof StorefrontSettings>(key: K, value: StorefrontSettings[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      await saveSiteSettings({ storefront: form });
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save storefront settings");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full px-3 py-2.5 text-sm border outline-none focus:border-[#C9A84C] bg-white";
  const inputStyle = {
    borderColor: "rgba(13,13,13,0.2)",
    color: "#0D0D0D",
    fontFamily: "'DM Sans', sans-serif",
  };
  const labelCls = "text-xs tracking-[0.12em] uppercase block mb-1.5 font-semibold";
  const labelStyle = { color: "#0D0D0D", fontFamily: "'DM Sans', sans-serif" };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-8">
        <div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "32px",
              color: "#0D0D0D",
              lineHeight: 1.2,
            }}
          >
            Storefront Settings
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}>
            Manage the contact details, WhatsApp links, and social profiles used across the public site.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 text-xs tracking-[0.12em] uppercase font-semibold border"
            style={{
              borderColor: "rgba(13,13,13,0.18)",
              color: "#0D0D0D",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <ExternalLink size={13} />
            Preview Contact
          </a>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 text-xs tracking-[0.12em] uppercase font-semibold border"
            style={{
              borderColor: "rgba(13,13,13,0.18)",
              color: "#0D0D0D",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <ExternalLink size={13} />
            Preview Footer
          </a>
        </div>
      </div>

      <div
        className="flex items-start gap-2.5 px-4 py-3 mb-6 text-xs border-l-2"
        style={{
          borderColor: "#C9A84C",
          backgroundColor: "rgba(201,168,76,0.08)",
          color: "#6B6560",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <SettingsIcon size={13} className="mt-0.5 shrink-0" style={{ color: "#C9A84C" }} />
        <span>
          These settings feed the footer, contact page, WhatsApp actions, and other public
          customer touchpoints.
        </span>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <section
          className="border p-6"
          style={{ borderColor: "rgba(13,13,13,0.1)", backgroundColor: "#fff" }}
        >
          <div className="mb-5">
            <p className="text-xs tracking-[0.2em] uppercase" style={{ color: "#C9A84C", fontFamily: "'DM Sans', sans-serif" }}>
              Contact
            </p>
            <h2
              className="mt-2"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "24px",
                color: "#0D0D0D",
              }}
            >
              Public contact details
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={labelCls} style={labelStyle}>
                Contact Email
              </label>
              <input
                type="email"
                className={inputCls}
                style={inputStyle}
                value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>
                Contact Phone
              </label>
              <input
                className={inputCls}
                style={inputStyle}
                value={form.contactPhone}
                onChange={(e) => set("contactPhone", e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>
                WhatsApp Number
              </label>
              <input
                className={inputCls}
                style={inputStyle}
                value={form.whatsappPhone}
                onChange={(e) => set("whatsappPhone", e.target.value)}
                placeholder="2349067292754"
                required
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>
                Default WhatsApp Message
              </label>
              <input
                className={inputCls}
                style={inputStyle}
                value={form.whatsappText}
                onChange={(e) => set("whatsappText", e.target.value)}
                required
              />
            </div>
          </div>
        </section>

        <section
          className="border p-6"
          style={{ borderColor: "rgba(13,13,13,0.1)", backgroundColor: "#fff" }}
        >
          <div className="mb-5">
            <p className="text-xs tracking-[0.2em] uppercase" style={{ color: "#C9A84C", fontFamily: "'DM Sans', sans-serif" }}>
              Location
            </p>
            <h2
              className="mt-2"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "24px",
                color: "#0D0D0D",
              }}
            >
              Address and map link
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={labelCls} style={labelStyle}>
                Location Label
              </label>
              <input
                className={inputCls}
                style={inputStyle}
                value={form.locationLabel}
                onChange={(e) => set("locationLabel", e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>
                Map URL
              </label>
              <input
                type="url"
                className={inputCls}
                style={inputStyle}
                value={form.locationMapUrl}
                onChange={(e) => set("locationMapUrl", e.target.value)}
                required
              />
            </div>
          </div>
        </section>

        <section
          className="border p-6"
          style={{ borderColor: "rgba(13,13,13,0.1)", backgroundColor: "#fff" }}
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase" style={{ color: "#C9A84C", fontFamily: "'DM Sans', sans-serif" }}>
                Socials
              </p>
              <h2
                className="mt-2"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: "24px",
                  color: "#0D0D0D",
                }}
              >
                Connected storefront channels
              </h2>
            </div>
            <a
              href={form.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs"
              style={{ color: "#C9A84C", fontFamily: "'DM Sans', sans-serif" }}
            >
              <Globe size={13} />
              Open primary social
            </a>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className={labelCls} style={labelStyle}>
                Instagram URL
              </label>
              <input
                type="url"
                className={inputCls}
                style={inputStyle}
                value={form.instagramUrl}
                onChange={(e) => set("instagramUrl", e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>
                TikTok URL
              </label>
              <input
                type="url"
                className={inputCls}
                style={inputStyle}
                value={form.tiktokUrl}
                onChange={(e) => set("tiktokUrl", e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>
                YouTube URL
              </label>
              <input
                type="url"
                className={inputCls}
                style={inputStyle}
                value={form.youtubeUrl}
                onChange={(e) => set("youtubeUrl", e.target.value)}
                required
              />
            </div>
          </div>
        </section>

        <section
          className="border p-6"
          style={{ borderColor: "rgba(13,13,13,0.1)", backgroundColor: "#fff" }}
        >
          <div className="mb-5">
            <p className="text-xs tracking-[0.2em] uppercase" style={{ color: "#C9A84C", fontFamily: "'DM Sans', sans-serif" }}>
              Homepage Hero
            </p>
            <h2
              className="mt-2"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "24px",
                color: "#0D0D0D",
              }}
            >
              Now Trending card &amp; stats
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={labelCls} style={labelStyle}>Trending Product Name</label>
              <input
                className={inputCls}
                style={inputStyle}
                value={form.heroTrendingName}
                onChange={(e) => set("heroTrendingName", e.target.value)}
                placeholder="Embellished Lace Boubou"
                required
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Trending Price (displayed as-is)</label>
              <input
                className={inputCls}
                style={inputStyle}
                value={form.heroTrendingPrice}
                onChange={(e) => set("heroTrendingPrice", e.target.value)}
                placeholder="₦120,000"
                required
              />
            </div>
          </div>

          <p className="mt-5 mb-3 text-xs uppercase tracking-[0.15em] font-semibold" style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}>
            Hero Statistics (3 numbers shown below the headline)
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="border p-4" style={{ borderColor: "rgba(13,13,13,0.08)" }}>
              <label className={labelCls} style={labelStyle}>Stat 1 Value</label>
              <input className={inputCls} style={inputStyle} value={form.heroStat1Value} onChange={(e) => set("heroStat1Value", e.target.value)} placeholder="364K" required />
              <label className={`${labelCls} mt-3`} style={labelStyle}>Stat 1 Label</label>
              <input className={inputCls} style={inputStyle} value={form.heroStat1Label} onChange={(e) => set("heroStat1Label", e.target.value)} placeholder="Followers" required />
            </div>
            <div className="border p-4" style={{ borderColor: "rgba(13,13,13,0.08)" }}>
              <label className={labelCls} style={labelStyle}>Stat 2 Value</label>
              <input className={inputCls} style={inputStyle} value={form.heroStat2Value} onChange={(e) => set("heroStat2Value", e.target.value)} placeholder="16K+" required />
              <label className={`${labelCls} mt-3`} style={labelStyle}>Stat 2 Label</label>
              <input className={inputCls} style={inputStyle} value={form.heroStat2Label} onChange={(e) => set("heroStat2Label", e.target.value)} placeholder="Looks" required />
            </div>
            <div className="border p-4" style={{ borderColor: "rgba(13,13,13,0.08)" }}>
              <label className={labelCls} style={labelStyle}>Stat 3 Value</label>
              <input className={inputCls} style={inputStyle} value={form.heroStat3Value} onChange={(e) => set("heroStat3Value", e.target.value)} placeholder="40%" required />
              <label className={`${labelCls} mt-3`} style={labelStyle}>Stat 3 Label</label>
              <input className={inputCls} style={inputStyle} value={form.heroStat3Label} onChange={(e) => set("heroStat3Label", e.target.value)} placeholder="Off Sale" required />
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-3 text-xs tracking-[0.12em] uppercase font-semibold disabled:opacity-50"
            style={{
              backgroundColor: saved ? "#16a34a" : "#C9A84C",
              color: saved ? "#fff" : "#0D0D0D",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving..." : saved ? "Saved" : "Save Settings"}
          </button>

          {error && (
            <p className="text-xs" style={{ color: "#e53935", fontFamily: "'DM Sans', sans-serif" }}>
              {error}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
