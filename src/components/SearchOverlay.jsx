import { useState, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import { useProducts } from "../data/ProductsContext";
import { STORE_CONFIG } from "../data/config";
import { pName } from "../lib/product";
import { fmt } from "../lib/format";
import ProductImage from "./ProductImage";
import { searchProducts } from "../lib/search";

export default function SearchOverlay({ open, onClose }) {
  const { t, lang } = useI18n();
  const { products } = useProducts();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQ("");
      const id = setTimeout(() => inputRef.current?.focus(), 150);
      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(id);
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    return searchProducts(products, q).slice(0, 8);
  }, [products, q]);

  function goToProduct(id) {
    onClose();
    navigate(`/product/${id}`);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="search-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <motion.div
            className="search-overlay-panel"
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("aria.search")}
          >
            <div className="search-overlay-bar">
              <span className="ic" aria-hidden="true">🔍</span>
              <input
                ref={inputRef}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("shop.search_ph")}
              />
              <button className="search-overlay-close" onClick={onClose} aria-label={t("aria.close")}>✕</button>
            </div>

            {q.trim() && (
              <div className="search-overlay-results">
                {results.length ? (
                  results.map((p) => (
                    <button key={p.id} className="search-result-row" onClick={() => goToProduct(p.id)}>
                      <span className="thumb">
                        <ProductImage src={p.image} emoji={p.emoji} alt={pName(p, lang)} />
                      </span>
                      <span className="info">
                        <span className="name">{pName(p, lang)}</span>
                        <span className="price">{fmt(p.price)} {STORE_CONFIG.currency}</span>
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="search-overlay-empty">
                    <div className="em">🔍</div>
                    <p>{t("shop.no_results_t")}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
