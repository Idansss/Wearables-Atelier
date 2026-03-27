import { useState } from "react";
import { MessageCircle, X, ShoppingBag, HelpCircle, Package } from "lucide-react";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { buildWhatsAppHref } from "../lib/siteSettings";

const MENU_ITEMS = [
  {
    icon: ShoppingBag,
    label: "Place an Order",
    message: "Hello Wearables Atelier! I'd like to place an order.",
  },
  {
    icon: HelpCircle,
    label: "Ask a Question",
    message: "Hello Wearables Atelier! I have a question about one of your pieces.",
  },
  {
    icon: Package,
    label: "Track My Order",
    message: "Hello Wearables Atelier! I'd like to track my order.",
  },
];

export function WhatsAppFAB() {
  const { settings } = useSiteSettings();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Mini-menu */}
      <div
        className="flex flex-col items-end gap-2 transition-all duration-300 origin-bottom-right"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "scale(1) translateY(0)" : "scale(0.9) translateY(12px)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {MENU_ITEMS.map(({ icon: Icon, label, message }) => (
          <a
            key={label}
            href={buildWhatsAppHref(settings.storefront, message)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 pl-4 pr-5 py-3 shadow-lg transition-transform hover:scale-105"
            style={{ backgroundColor: "#0D0D0D", border: "1px solid rgba(201,168,76,0.25)" }}
            onClick={() => setOpen(false)}
          >
            <Icon size={15} style={{ color: "#C9A84C", flexShrink: 0 }} />
            <span
              className="text-xs whitespace-nowrap"
              style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, color: "#F8F5F0" }}
            >
              {label}
            </span>
          </a>
        ))}
      </div>

      {/* FAB toggle button */}
      <button
        type="button"
        aria-label={open ? "Close WhatsApp menu" : "Open WhatsApp menu"}
        aria-expanded={open ? "true" : "false"}
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110"
        style={{ backgroundColor: "#25D366" }}
      >
        <span
          className="transition-all duration-200"
          style={{ transform: open ? "rotate(0deg)" : "rotate(0deg)" }}
        >
          {open ? (
            <X size={24} color="#fff" />
          ) : (
            <MessageCircle size={26} color="#fff" fill="white" />
          )}
        </span>
      </button>
    </div>
  );
}
