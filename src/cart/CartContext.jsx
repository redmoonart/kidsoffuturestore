import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useProducts } from "../data/ProductsContext";
import { useI18n } from "../i18n/I18nContext";
import { useToast } from "../toast/ToastContext";
import { pName } from "../lib/product";
import { flyToCart, CART_HIT_EVENT } from "../lib/cartFx";
import { track } from "../lib/pixel";

const CART_KEY = "kof_cart_v1";
const CartContext = createContext(null);

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const { lang } = useI18n();
  const showToast = useToast();
  const { products } = useProducts();
  const byId = useCallback((id) => products.find((p) => p.id === Number(id)), [products]);
  const [cart, setCart] = useState(loadCart);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* localStorage unavailable */
    }
  }, [cart]);

  // fromEl: العنصر الذي ضُغط (زر الإضافة) لتطير منه صورة المنتج نحو أيقونة السلة
  const addToCart = useCallback(
    (id, qty = 1, fromEl) => {
      const p = byId(id);
      if (!p || p.stock === false) return;
      setCart((prev) => {
        const line = prev.find((i) => i.id === id);
        if (line) return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i));
        return [...prev, { id, qty }];
      });
      showToast(`✓ ${pName(p, lang)}`);
      track("AddToCart", { content_ids: [String(p.id)], content_type: "product", content_name: p.name, value: p.price * qty, currency: "DZD" });
      if (fromEl) flyToCart(fromEl, p.image, p.emoji);
      else window.dispatchEvent(new Event(CART_HIT_EVENT));
    },
    [byId, lang, showToast]
  );

  const setQty = useCallback((id, qty) => {
    qty = Math.max(0, qty);
    setCart((prev) =>
      qty === 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty } : i))
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const count = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  const subtotal = useMemo(
    () => cart.reduce((s, i) => {
      const p = byId(i.id);
      return p ? s + p.price * i.qty : s;
    }, 0),
    [cart, byId]
  );

  const value = useMemo(
    () => ({ cart, addToCart, setQty, removeFromCart, clearCart, count, subtotal, byId, drawerOpen, openDrawer, closeDrawer }),
    [cart, addToCart, setQty, removeFromCart, clearCart, count, subtotal, byId, drawerOpen, openDrawer, closeDrawer]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
