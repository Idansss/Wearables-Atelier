import { createBrowserRouter, Navigate, useLocation } from "react-router";
import { lazy, Suspense, useEffect, type ReactNode } from "react";
import AdminShell from "./pages/admin/AdminShell";

const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Account = lazy(() => import("./pages/Account"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const SimplePage = lazy(() => import("./pages/SimplePage"));
const Wholesale = lazy(() => import("./pages/Wholesale"));
const CustomOrder = lazy(() => import("./pages/CustomOrder"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OrderConfirmed = lazy(() => import("./pages/OrderConfirmed"));
const Checkout = lazy(() => import("./pages/Checkout"));

// Admin pages (lazy)
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminOrderDetail = lazy(() => import("./pages/admin/OrderDetail"));
const AdminNewsletter = lazy(() => import("./pages/admin/Newsletter"));
const AdminMessages = lazy(() => import("./pages/admin/Messages"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminMedia = lazy(() => import("./pages/admin/Media"));
const AdminCollections = lazy(() => import("./pages/admin/Collections"));
const AdminCoupons = lazy(() => import("./pages/admin/Coupons"));
const AdminCustomers = lazy(() => import("./pages/admin/Customers"));
const AdminContent = lazy(() => import("./pages/admin/Content"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminAuditLog = lazy(() => import("./pages/admin/AuditLog"));
const AdminCustomOrders = lazy(() => import("./pages/admin/CustomOrders"));
const AdminWholesaleLeads = lazy(() => import("./pages/admin/WholesaleLeads"));
const AdminReviews = lazy(() => import("./pages/admin/Reviews"));

function AdminRedirect() {
  return <Navigate to="/admin/dashboard" replace />;
}

function PageLoader({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: "#0D0D0D" }}
        >
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: "rgba(201,168,76,0.2)", borderTopColor: "#C9A84C" }}
          />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

function wrap(Component: React.ComponentType) {
  return () => (
    <PageLoader>
      <RouteWithScrollTop>
        <Component />
      </RouteWithScrollTop>
    </PageLoader>
  );
}

function RouteWithScrollTop({ children }: { children: ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return <>{children}</>;
}


export const router = createBrowserRouter([
  { path: "/", Component: wrap(Home) },
  { path: "/shop", Component: wrap(Shop) },
  { path: "/shop/:category", Component: wrap(Shop) },
  { path: "/product/:slug", Component: wrap(ProductDetail) },
  { path: "/cart", Component: wrap(Cart) },
  { path: "/account", Component: wrap(Account) },
  { path: "/about", Component: wrap(About) },
  { path: "/contact", Component: wrap(Contact) },
  { path: "/wholesale", Component: wrap(Wholesale) },
  { path: "/custom-order", Component: wrap(CustomOrder) },
  { path: "/track", Component: wrap(TrackOrder) },
  { path: "/wishlist", Component: wrap(Wishlist) },
  { path: "/checkout", Component: wrap(Checkout) },
  { path: "/order-confirmed", Component: wrap(OrderConfirmed) },
  { path: "/faq", Component: wrap(SimplePage) },
  { path: "/shipping", Component: wrap(SimplePage) },
  { path: "/size-guide", Component: wrap(SimplePage) },
  { path: "/returns", Component: wrap(SimplePage) },
  { path: "/terms", Component: wrap(SimplePage) },
  { path: "/privacy", Component: wrap(SimplePage) },
  {
    path: "/admin",
    Component: AdminShell,
    children: [
      { index: true, Component: AdminRedirect },
      { path: "dashboard", Component: AdminDashboard },
      { path: "orders", Component: AdminOrders },
      { path: "orders/:id", Component: AdminOrderDetail },
      { path: "newsletter", Component: AdminNewsletter },
      { path: "messages", Component: AdminMessages },
      { path: "products", Component: AdminProducts },
      { path: "media", Component: AdminMedia },
      { path: "collections", Component: AdminCollections },
      { path: "coupons", Component: AdminCoupons },
      { path: "customers", Component: AdminCustomers },
      { path: "content", Component: AdminContent },
      { path: "settings", Component: AdminSettings },
      { path: "users", Component: AdminUsers },
      { path: "audit", Component: AdminAuditLog },
      { path: "custom-orders", Component: AdminCustomOrders },
      { path: "wholesale", Component: AdminWholesaleLeads },
      { path: "reviews", Component: AdminReviews },
    ],
  },
  { path: "*", Component: wrap(NotFound) },
]);
