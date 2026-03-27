import { Navigate } from "react-router";
import { Loader2 } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import type { ReactNode } from "react";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { loading, isAdmin, user } = useAdmin();

  if (loading) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ backgroundColor: "#0D0D0D" }}
      >
        <Loader2
          size={36}
          className="animate-spin"
          style={{ color: "#C9A84C" }}
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/account" replace />;
  }

  if (!isAdmin) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6"
        style={{ backgroundColor: "#0D0D0D", fontFamily: "'DM Sans', sans-serif" }}
      >
        <div
          className="text-center max-w-md px-6"
          style={{ color: "#F8F5F0" }}
        >
          <p
            className="text-xs tracking-[0.3em] uppercase mb-4"
            style={{ color: "#C9A84C" }}
          >
            Access Denied
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "42px",
              color: "#F8F5F0",
              lineHeight: 1.2,
            }}
          >
            Restricted Area
          </h1>
          <p
            className="mt-4 text-sm leading-relaxed"
            style={{ color: "rgba(248,245,240,0.55)" }}
          >
            You do not have permission to access the admin panel. If you believe
            this is an error, please contact the site administrator.
          </p>
          <a
            href="/"
            className="inline-block mt-8 px-8 py-3 text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-80"
            style={{
              backgroundColor: "#C9A84C",
              color: "#0D0D0D",
              fontWeight: 600,
            }}
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
