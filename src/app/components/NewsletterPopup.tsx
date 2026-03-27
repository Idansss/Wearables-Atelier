import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { sendNewsletterSignup } from "../lib/email";
import { saveSubscriber } from "../lib/db";

const STORAGE_KEY = "wba_newsletter_dismissed";

export function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;

    // Exit-intent: mouse leaves through the top of the viewport
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };

    // Fallback: show after 30 seconds
    const timer = setTimeout(show, 30000);

    document.addEventListener("mouseleave", onMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", onMouseLeave);
      clearTimeout(timer);
    };
  }, []);

  function show() {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    sendNewsletterSignup(email.trim()).catch(() => {/* silent */});
    saveSubscriber(email.trim(), "popup").catch(() => {/* silent */});
    setSubmitted(true);
    setTimeout(dismiss, 2500);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: "rgba(13,13,13,0.6)", backdropFilter: "blur(4px)" }}
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-lg"
        style={{ backgroundColor: "#F8F5F0" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          aria-label="Close"
          onClick={dismiss}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-opacity hover:opacity-60"
          style={{ color: "#6B6560" }}
        >
          <X size={18} />
        </button>

        <div className="flex flex-col sm:flex-row">
          {/* Decorative side strip */}
          <div
            className="hidden sm:flex flex-col items-center justify-center w-32 flex-shrink-0 py-10"
            style={{ backgroundColor: "#0D0D0D" }}
          >
            <p
              className="text-xs tracking-[0.25em] uppercase"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: "#C9A84C",
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                letterSpacing: "0.3em",
              }}
            >
              Wearables Atelier
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 p-8 sm:p-10">
            <p
              className="text-xs tracking-[0.3em] uppercase mb-3"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "#C9A84C" }}
            >
              Exclusive Access
            </p>

            {submitted ? (
              <div className="py-6">
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: "32px",
                    color: "#0D0D0D",
                    lineHeight: 1.2,
                  }}
                >
                  Welcome to the inner circle.
                </h2>
                <p
                  className="mt-3 text-sm"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: "#6B6560", lineHeight: 1.8 }}
                >
                  You're now among the first to know about new arrivals, private sales, and
                  exclusive Wearables Atelier events.
                </p>
              </div>
            ) : (
              <>
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: "clamp(28px, 4vw, 36px)",
                    color: "#0D0D0D",
                    lineHeight: 1.2,
                  }}
                >
                  Join the Atelier.
                  <br />
                  Shop before anyone else.
                </h2>
                <p
                  className="mt-3 mb-6 text-sm"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: "#6B6560", lineHeight: 1.8 }}
                >
                  Subscribe for early access to new collections, members-only discounts, and
                  styling inspiration from @wearablesbyashabi.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full px-4 py-3 text-sm outline-none border transition-colors focus:border-[#C9A84C]"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      backgroundColor: "#fff",
                      borderColor: "rgba(13,13,13,0.2)",
                      color: "#0D0D0D",
                    }}
                  />
                  <button
                    type="submit"
                    className="w-full py-3.5 text-xs tracking-[0.25em] uppercase transition-opacity hover:opacity-80"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      backgroundColor: "#0D0D0D",
                      color: "#C9A84C",
                    }}
                  >
                    Subscribe — Get 10% Off Your First Order
                  </button>
                </form>

                <button
                  type="button"
                  onClick={dismiss}
                  className="mt-4 text-xs transition-colors hover:text-[#0D0D0D]"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: "#6B6560" }}
                >
                  No thanks, I'll pay full price
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
