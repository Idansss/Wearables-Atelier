import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  const handleBackToTop = () => {
    // Primary smooth scroll for modern browsers.
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    // Fallbacks for browsers/pages that may ignore the smooth option.
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={handleBackToTop}
      aria-label="Back to top"
      className="fixed bottom-36 sm:bottom-24 right-6 z-[120] w-11 h-11 flex items-center justify-center transition-all duration-300 hover:opacity-90 shadow-lg"
      style={{ backgroundColor: "#0D0D0D", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)" }}
    >
      <ArrowUp size={18} />
    </button>
  );
}
