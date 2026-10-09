import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import { useCart } from "../cart/CartContext";
import { STORE_CONFIG } from "../data/config";
import { pName } from "../lib/product";
import { money } from "../lib/format";
import ProductImage from "./ProductImage";
import FreeShippingBar from "./FreeShippingBar";
import Icon from "./Icon";

export default function CartDrawer() {
  const { t, lang, meta } = useI18n();
  const { cart, byId, setQty, removeFromCart, subtotal, drawerOpen, closeDrawer } = useCart();

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // نقل التركيز إلى السلة عند فتحها وإرجاعه لمكانه عند الإغلاق (لوحة المفاتيح وقارئ الشاشة)
  const closeBtnRef = useRef(null);
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.activeElement;
    const id = setTimeout(() => closeBtnRef.current?.focus(), 60);
    return () => {
      clearTimeout(id);
      if (prev && typeof prev.focus === "function") prev.focus();
    };
  }, [drawerOpen]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") closeDrawer();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeDrawer]);

  const closedX = meta.dir === "rtl" ? "-100%" : "100%";

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            className="cart-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDrawer}
          />
          <motion.aside
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={t("aria.cart")}
            initial={{ x: closedX }}
            animate={{ x: "0%" }}
            exit={{ x: closedX }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="cart-drawer-head">
              <h3>{t("aria.cart")}</h3>
              <button ref={closeBtnRef} className="cart-drawer-close" onClick={closeDrawer} aria-label={t("aria.close")}><Icon name="x" size={20} /></button>
            </div>

            {cart.length ? (
              <>
                <div className="cart-drawer-list">
                  {cart.map((i) => {
                    const p = byId(i.id);
                    if (!p) return null;
                    return (
                      <div className="cart-drawer-row" key={i.id}>
                        <Link to={`/product/${p.id}`} className="thumb" onClick={closeDrawer}>
                          <ProductImage src={p.image} emoji={p.emoji} alt={pName(p, lang)} />
                        </Link>
                        <div className="cart-drawer-info">
                          <h4>{pName(p, lang)}</h4>
                          <div className="unit">{money(p.price, STORE_CONFIG.currency)}</div>
                          <div className="qty">
                            <button type="button" onClick={() => setQty(p.id, i.qty - 1)}>−</button>
                            <input type="text" value={i.qty} readOnly />
                            <button type="button" onClick={() => setQty(p.id, i.qty + 1)}>+</button>
                          </div>
                        </div>
                        <button className="remove" onClick={() => removeFromCart(p.id)} aria-label={t("cart.remove")}><Icon name="trash" size={17} /></button>
                      </div>
                    );
                  })}
                </div>
                <div className="cart-drawer-foot">
                  <FreeShippingBar subtotal={subtotal} />
                  <div className="line">
                    <span>{t("cart.subtotal")}</span>
                    <span>{money(subtotal, STORE_CONFIG.currency)}</span>
                  </div>
                  <p className="cart-drawer-note">{t("cart.by_wilaya")}</p>
                  <Link to="/cart" className="btn btn-primary btn-block btn-lg" onClick={closeDrawer}>
                    {t("cart.summary")}
                  </Link>
                </div>
              </>
            ) : (
              <div className="cart-drawer-empty">
                <div className="em em-ic"><Icon name="bag" size={36} stroke={1.5} /></div>
                <p>{t("cart.empty_t")}</p>
                <Link to="/shop" className="btn btn-primary" onClick={closeDrawer}>{t("cart.empty_btn")}</Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
