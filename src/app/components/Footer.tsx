import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router";
import { sendNewsletterSignup } from "../lib/email";
import { saveSubscriber } from "../lib/db";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { buildWhatsAppHref, getCollectionHref } from "../lib/siteSettings";

type BrandIconProps = { className?: string };

const staticLinks = {
  "About Us": [
    { label: "Our Story", href: "/about" },
    { label: "Ashabi", href: "/shop/ashabi" },
    { label: "Contact Us", href: "/contact" },
    { label: "Wholesale", href: "/wholesale" },
    { label: "Custom Order", href: "/custom-order" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Returns Policy", href: "/returns" },
    { label: "Size Guide", href: "/size-guide" },
  ],
  "Client Services": [
    { label: "FAQs", href: "/faq" },
    { label: "Shipping Info", href: "/shipping" },
    { label: "Order Tracking", href: "/track" },
    { label: "My Account", href: "/account" },
    { label: "Cart", href: "/cart" },
  ],
};

function InstagramIcon({ className }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5.25" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4.15" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.25" cy="6.75" r="1.15" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon({ className }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M14.3 3.25c.45 1.84 1.9 3.05 3.95 3.2v2.5c-1.37.04-2.73-.33-3.95-1.1v5.16a5.07 5.07 0 1 1-5.07-5.07c.33 0 .67.03.99.1v2.56a3.1 3.1 0 0 0-.99-.16 2.56 2.56 0 1 0 2.56 2.56V3.25h2.5Z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.53.15-.17.2-.29.3-.49.1-.2.05-.38-.03-.53-.07-.15-.67-1.61-.91-2.21-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.08-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35ZM12.06 21.8h-.01a9.78 9.78 0 0 1-4.97-1.35l-.36-.21-3.7.97.99-3.61-.23-.37a9.8 9.8 0 1 1 8.28 4.57Zm8.4-18.28A11.72 11.72 0 0 0 12.08 0 11.9 11.9 0 0 0 .16 11.92c0 2.1.55 4.14 1.6 5.96L.04 24l6.34-1.66a11.84 11.84 0 0 0 5.69 1.45h.01A11.92 11.92 0 0 0 24 11.88c0-3.18-1.24-6.16-3.54-8.36Z" />
    </svg>
  );
}

function YouTubeIcon({ className }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M21.59 7.2a2.94 2.94 0 0 0-2.06-2.08C17.72 4.6 12 4.6 12 4.6s-5.72 0-7.53.52A2.94 2.94 0 0 0 2.41 7.2 30.5 30.5 0 0 0 1.9 12c0 1.63.17 3.24.51 4.8a2.94 2.94 0 0 0 2.06 2.08c1.81.52 7.53.52 7.53.52s5.72 0 7.53-.52a2.94 2.94 0 0 0 2.06-2.08A30.5 30.5 0 0 0 22.1 12c0-1.63-.17-3.24-.51-4.8ZM9.7 15.31V8.7L15.5 12l-5.8 3.31Z" />
    </svg>
  );
}

// All connect icons in one flat list
type ConnectItem =
  | { kind: "a"; label: string; href: string; Icon: React.ComponentType<BrandIconProps> | typeof MapPin }
  | { kind: "span"; label: string; Icon: typeof MapPin };

function IconBtn({ item }: { item: ConnectItem }) {
  const iconEl = (
    <item.Icon className="h-[18px] w-[18px]" />
  );

  const base =
    "group relative flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 hover:border-[#C9A84C]/60 hover:text-[#C9A84C]";
  const baseStyle = { borderColor: "rgba(201,168,76,0.18)", color: "rgba(248,245,240,0.6)" };

  const tooltip = (
    <span
      className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-[10px] uppercase tracking-widest opacity-0 transition-opacity group-hover:opacity-100"
      style={{ backgroundColor: "#0D0D0D", color: "#C9A84C", fontFamily: "'DM Sans', sans-serif", border: "1px solid rgba(201,168,76,0.2)" }}
    >
      {item.label}
    </span>
  );

  if (item.kind === "a") {
    return (
      <a
        href={item.href}
        target={item.href.startsWith("http") ? "_blank" : undefined}
        rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
        aria-label={item.label}
        className={base}
        style={baseStyle}
      >
        {iconEl}
        {tooltip}
      </a>
    );
  }

  return (
    <span aria-label={item.label} className={base} style={baseStyle} title={item.label}>
      {iconEl}
      {tooltip}
    </span>
  );
}

export function Footer() {
  const { settings } = useSiteSettings();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const storefront = settings.storefront;
  const whatsappHref = buildWhatsAppHref(storefront);
  const emailAddress = storefront.contactEmail;
  const links = {
    Explore: settings.collections
      .filter((collection) => collection.showInFooter)
      .map((collection) => ({
        label: collection.label,
        href: getCollectionHref(collection.slug),
      })),
    ...staticLinks,
  };
  const connectItems: ConnectItem[] = [
    { kind: "a", label: "Instagram", href: storefront.instagramUrl, Icon: InstagramIcon },
    { kind: "a", label: "TikTok", href: storefront.tiktokUrl, Icon: TikTokIcon },
    { kind: "a", label: "YouTube", href: storefront.youtubeUrl, Icon: YouTubeIcon },
    { kind: "a", label: "WhatsApp", href: whatsappHref, Icon: WhatsAppIcon },
    { kind: "a", label: "Email us", href: `mailto:${emailAddress}`, Icon: Mail },
    { kind: "a", label: storefront.locationLabel, href: storefront.locationMapUrl, Icon: MapPin },
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    sendNewsletterSignup(email.trim()).catch(() => {/* silent */});
    saveSubscriber(email.trim(), "footer").catch(() => {/* silent */});
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0D0D0D 0%, #080808 100%)" }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.35), transparent)" }}
      />

      <div className="mx-auto max-w-[1560px] px-6 py-10 lg:px-10 lg:py-12">
        <div className="grid gap-10 xl:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.6fr)]">

          {/* Left col — logo + tagline + newsletter */}
          <div className="max-w-sm">
            <img
              src="/logo-transparent.png"
              alt="Wearables by Ashabi"
              className="block h-12 w-auto max-w-full object-contain sm:h-14"
            />
            <p
              className="mt-4 text-[11px] uppercase tracking-[0.3em]"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "#C9A84C" }}
            >
              Culture | Luxury | Elegance
            </p>
            <p
              className="mt-3 text-sm leading-7"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(248,245,240,0.5)" }}
            >
              Occasionwear, custom pieces, and statement silhouettes crafted for women who want tradition to look elevated.
            </p>

            {/* Newsletter */}
            <div
              className="mt-6 rounded-2xl border p-4"
              style={{ borderColor: "rgba(201,168,76,0.12)", backgroundColor: "rgba(248,245,240,0.02)" }}
            >
              {subscribed ? (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.26em]" style={{ fontFamily: "'DM Sans', sans-serif", color: "#C9A84C" }}>
                    Subscription Confirmed
                  </p>
                  <p className="mt-2 text-2xl leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "#F8F5F0" }}>
                    You are on the list.
                  </p>
                  <p className="mt-1.5 text-sm leading-6" style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(248,245,240,0.48)" }}>
                    Watch your inbox for new drops and sale alerts.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-[10px] uppercase tracking-[0.26em]" style={{ fontFamily: "'DM Sans', sans-serif", color: "#C9A84C" }}>
                    The Inner Circle
                  </p>
                  <h3 className="mt-2 text-[28px] leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, color: "#F8F5F0" }}>
                    Join the Atelier
                  </h3>
                  <p className="mt-2 text-sm leading-6" style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(248,245,240,0.44)" }}>
                    Sale-first access, new drops, and styling notes in one elegant edit.
                  </p>
                  <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
                    <input
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 min-w-0 flex-1 rounded-xl border px-4 text-sm outline-none transition-colors focus:border-[#C9A84C]"
                      style={{ backgroundColor: "rgba(248,245,240,0.03)", borderColor: "rgba(201,168,76,0.16)", color: "#F8F5F0", fontFamily: "'DM Sans', sans-serif" }}
                    />
                    <button
                      type="submit"
                      className="h-11 rounded-xl px-5 text-xs uppercase tracking-[0.2em] transition-opacity hover:opacity-80 shrink-0"
                      style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, backgroundColor: "#C9A84C", color: "#0D0D0D" }}
                    >
                      Join
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Right col — nav links + connect icons */}
          <div className="space-y-8">
            {/* Nav columns */}
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
              {Object.entries(links).map(([group, items]) => (
                <div key={group}>
                  <p
                    className="mb-4 text-[11px] uppercase tracking-[0.3em]"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: "#F8F5F0" }}
                  >
                    {group}
                  </p>
                  <ul className="flex flex-col gap-3">
                    {items.map((item) => (
                      <li key={item.label}>
                        <Link
                          to={item.href}
                          className="text-sm transition-colors duration-200 hover:text-[#C9A84C]"
                          style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(248,245,240,0.52)" }}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Connect row */}
            <div
              className="border-t pt-6"
              style={{ borderColor: "rgba(201,168,76,0.12)" }}
            >
              <div className="flex items-center justify-between gap-4 mb-4">
                <p
                  className="text-[10px] uppercase tracking-[0.22em]"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(248,245,240,0.36)" }}
                >
                  Connect
                </p>
                <Link
                  to="/contact"
                  className="text-[11px] uppercase tracking-[0.2em] transition-colors duration-200 hover:text-[#C9A84C]"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(248,245,240,0.38)" }}
                >
                  Contact page →
                </Link>
              </div>
              <div className="flex flex-wrap gap-3">
                {connectItems.map((item) => (
                  <IconBtn key={item.label} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t" style={{ borderColor: "rgba(201,168,76,0.1)" }}>
        <div className="mx-auto flex max-w-[1560px] flex-col gap-3 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <p
            className="text-xs"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(248,245,240,0.3)" }}
          >
            © {new Date().getFullYear()} Wearables Atelier. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#C9A84C]" style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(248,245,240,0.34)" }}>WhatsApp</a>
            <span style={{ color: "rgba(248,245,240,0.14)" }}>|</span>
            <a href={`mailto:${emailAddress}`} className="transition-colors hover:text-[#C9A84C]" style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(248,245,240,0.34)" }}>{emailAddress}</a>
            <span style={{ color: "rgba(248,245,240,0.14)" }}>|</span>
            <a href={storefront.locationMapUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#C9A84C]" style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(248,245,240,0.34)" }}>{storefront.locationLabel}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
