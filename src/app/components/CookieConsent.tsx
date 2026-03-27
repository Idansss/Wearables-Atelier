import { useState, useEffect } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "wba_cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[200] px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 shadow-2xl"
      style={{ backgroundColor: "#0D0D0D", borderTop: "1px solid rgba(201,168,76,0.25)" }}
      role="dialog"
      aria-label="Cookie consent"
    >
      <p className="text-sm flex-1" style={{ fontFamily: "'DM Sans', sans-serif", color: "#6B6560", lineHeight: 1.7 }}>
        We use cookies to improve your experience and personalise content. By continuing, you agree to our{" "}
        <a href="/privacy" className="underline hover:text-[#C9A84C] transition-colors" style={{ color: "#F8F5F0" }}>
          Privacy Policy
        </a>
        . (NDPR / GDPR compliant)
      </p>
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={decline}
          className="px-5 py-2.5 border text-xs tracking-[0.15em] uppercase transition-colors hover:border-[#F8F5F0] hover:text-[#F8F5F0]"
          style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, borderColor: "rgba(248,245,240,0.2)", color: "#6B6560" }}
        >
          Decline
        </button>
        <button
          type="button"
          onClick={accept}
          className="px-5 py-2.5 text-xs tracking-[0.15em] uppercase transition-opacity hover:opacity-90"
          style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, backgroundColor: "#C9A84C", color: "#0D0D0D" }}
        >
          Accept
        </button>
        <button
          type="button"
          onClick={decline}
          aria-label="Close cookie notice"
          className="transition-colors hover:text-[#C9A84C]"
          style={{ color: "#6B6560" }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
