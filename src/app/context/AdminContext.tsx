import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { checkIsAdmin } from "../lib/db";
import { supabase } from "../lib/supabase";

export type AdminRole = "owner" | "manager" | "editor" | null;

type AdminContextValue = {
  user: User | null;
  isAdmin: boolean;
  role: AdminRole;
  loading: boolean;
};

const AdminContext = createContext<AdminContextValue>({
  user: null,
  isAdmin: false,
  role: null,
  loading: true,
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<AdminRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function applySession(sessionUser: User | null) {
      setUser(sessionUser);
      if (sessionUser) {
        try {
          const adminStatus = await checkIsAdmin(sessionUser.id, sessionUser.email);
          if (!cancelled) {
            setIsAdmin(adminStatus);
            if (adminStatus && sessionUser.email) {
              const { data } = await supabase
                .from("admins")
                .select("role")
                .eq("email", sessionUser.email.toLowerCase())
                .maybeSingle();
              const r = (data as { role?: string } | null)?.role;
              if (!cancelled) {
                setRole(r === "owner" || r === "manager" || r === "editor" ? r : "editor");
              }
            } else {
              if (!cancelled) setRole(null);
            }
          }
        } catch {
          if (!cancelled) { setIsAdmin(false); setRole(null); }
        }
      } else {
        setIsAdmin(false);
        setRole(null);
      }
      if (!cancelled) setLoading(false);
    }

    void supabase.auth.getSession().then(({ data: { session } }) => {
      void applySession(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AdminContext.Provider value={{ user, isAdmin, role, loading }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextValue {
  return useContext(AdminContext);
}
