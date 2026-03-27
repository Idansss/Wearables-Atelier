import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./routes";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { CookieConsent } from "./components/CookieConsent";
import { BackToTop } from "./components/BackToTop";
import { NewsletterPopup } from "./components/NewsletterPopup";
import { SiteSettingsProvider } from "./context/SiteSettingsContext";

export default function App() {
  return (
    <ErrorBoundary>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:px-4 focus:py-2 focus:text-xs focus:uppercase focus:tracking-widest"
        style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, backgroundColor: "#C9A84C", color: "#0D0D0D" }}
      >
        Skip to content
      </a>
      <CartProvider>
        <WishlistProvider>
          <SiteSettingsProvider>
            <RouterProvider router={router} />
            <CookieConsent />
            <BackToTop />
            <NewsletterPopup />
            <Toaster position="bottom-right" richColors closeButton />
          </SiteSettingsProvider>
        </WishlistProvider>
      </CartProvider>
    </ErrorBoundary>
  );
}
