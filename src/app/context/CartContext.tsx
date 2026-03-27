import { createContext, useContext, useEffect, useReducer, useState } from "react";
import { supabase } from "../lib/supabase";

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  size: string;
  price: number;
  salePrice?: number;
  img: string;
  qty: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD"; item: Omit<CartItem, "qty"> }
  | { type: "REMOVE"; id: string; size: string }
  | { type: "UPDATE_QTY"; id: string; size: string; qty: number }
  | { type: "CLEAR" }
  | { type: "LOAD"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const key = `${action.item.id}-${action.item.size}`;
      const existing = state.items.find((i) => `${i.id}-${i.size}` === key);
      if (existing) {
        return {
          items: state.items.map((i) =>
            `${i.id}-${i.size}` === key ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...action.item, qty: 1 }] };
    }
    case "REMOVE":
      return {
        items: state.items.filter(
          (i) => !(i.id === action.id && i.size === action.size)
        ),
      };
    case "UPDATE_QTY":
      return {
        items: state.items.map((i) =>
          i.id === action.id && i.size === action.size
            ? { ...i, qty: action.qty }
            : i
        ),
      };
    case "CLEAR":
      return { items: [] };
    case "LOAD":
      return { items: action.items };
    default:
      return state;
  }
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: string, size: string) => void;
  updateQty: (id: string, size: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

function storageKey(uid: string | null) {
  return uid ? `wba_cart_${uid}` : "wba_cart_guest";
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [uid, setUid] = useState<string | null>(null);

  // Track auth state and reload cart when user changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const newUid = session?.user?.id ?? null;
      setUid(newUid);
      try {
        const saved = localStorage.getItem(storageKey(newUid));
        dispatch({ type: "LOAD", items: saved ? JSON.parse(saved) : [] });
      } catch {
        dispatch({ type: "LOAD", items: [] });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUid = session?.user?.id ?? null;
      setUid(newUid);
      try {
        const saved = localStorage.getItem(storageKey(newUid));
        dispatch({ type: "LOAD", items: saved ? JSON.parse(saved) : [] });
      } catch {
        dispatch({ type: "LOAD", items: [] });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Persist to localStorage on every change (keyed by uid)
  useEffect(() => {
    localStorage.setItem(storageKey(uid), JSON.stringify(state.items));
  }, [state.items, uid]);

  const addItem = (item: Omit<CartItem, "qty">) => dispatch({ type: "ADD", item });
  const removeItem = (id: string, size: string) => dispatch({ type: "REMOVE", id, size });
  const updateQty = (id: string, size: string, qty: number) => {
    if (qty < 1) removeItem(id, size);
    else dispatch({ type: "UPDATE_QTY", id, size, qty });
  };
  const clearCart = () => dispatch({ type: "CLEAR" });

  const cartCount = state.items.reduce((acc, i) => acc + i.qty, 0);
  const subtotal = state.items.reduce(
    (acc, i) => acc + (i.salePrice ?? i.price) * i.qty,
    0
  );

  return (
    <CartContext.Provider value={{ items: state.items, addItem, removeItem, updateQty, clearCart, cartCount, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
