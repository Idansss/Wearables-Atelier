import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useSiteSettings } from "../context/SiteSettingsContext";

const fallbackMessages = [
  "Free Worldwide Shipping on orders over \u20a680,000",
  "Use code IDANGANGAN for 40% off \u2014 Limited time!",
  "New Drops Every Friday \u2014 Shop the latest Iro & Buba, Aso Oke & Kaftans",
];

const STORAGE_KEY = "wba_announcement_closed";

export function AnnouncementBar() {
  const { settings } = useSiteSettings();
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [fade, setFade] = useState(true);
  const messages = settings.announcementMessages?.length
    ? settings.announcementMessages
    : fallbackMessages;

  // Restore dismissed state across navigation
  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") setVisible(false);
  }, []);

  // Keep index in range after message updates.
  useEffect(() => {
    setCurrent(0);
  }, [messages.length]);

  useEffect(() => {
    if (messages.length <= 1) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % messages.length);
        setFade(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, [messages.length]);

  function dismiss() {
    setVisible(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
  }

  if (!visible) return null;

  return (
    <div
      className="relative flex items-center justify-center px-10 py-2.5 text-center"
      style={{ backgroundColor: "#0D0D0D" }}
    >
      <p
        className="text-xs tracking-widest uppercase transition-opacity duration-400"
        style={{ fontFamily: "'DM Sans', sans-serif", color: "#C9A84C", opacity: fade ? 1 : 0 }}
      >
        {messages[current]}
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Close announcement"
        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
        style={{ color: "#C9A84C" }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
