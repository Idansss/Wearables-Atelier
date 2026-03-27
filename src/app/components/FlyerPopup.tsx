import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getActiveFlyer, type Flyer } from "../lib/db";

export function FlyerPopup() {
  const [flyer, setFlyer] = useState<Flyer | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    getActiveFlyer()
      .then((active) => {
        if (!active) return;
        const key = `wba_flyer_dismissed_${active.id}`;
        if (localStorage.getItem(key)) return;
        setFlyer(active);
        const timer = setTimeout(() => setVisible(true), active.delaySeconds * 1000);
        return () => clearTimeout(timer);
      })
      .catch(() => {/* silent — don't break the site if flyers fail to load */});
  }, []);

  function dismiss() {
    if (flyer) localStorage.setItem(`wba_flyer_dismissed_${flyer.id}`, "1");
    setVisible(false);
  }

  if (!visible || !flyer) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: "rgba(13,13,13,0.7)", backdropFilter: "blur(4px)" }}
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          aria-label="Close"
          onClick={dismiss}
          className="absolute -top-3 -right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full shadow-lg transition-opacity hover:opacity-80"
          style={{ backgroundColor: "#0D0D0D", color: "#F8F5F0" }}
        >
          <X size={16} />
        </button>

        {/* Flyer image */}
        <img
          src={flyer.imageUrl}
          alt={flyer.title || "Promotion"}
          className="w-full block"
          style={{ display: "block", maxHeight: "85vh", objectFit: "contain" }}
        />

        {flyer.title && (
          <p
            className="text-center py-2 text-xs tracking-[0.2em] uppercase"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              backgroundColor: "#0D0D0D",
              color: "#C9A84C",
            }}
          >
            {flyer.title}
          </p>
        )}
      </div>
    </div>
  );
}
