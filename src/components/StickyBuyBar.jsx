import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "../i18n/I18nContext";
import { STORE_CONFIG } from "../data/config";
import { money } from "../lib/format";

// شريط شراء ثابت أسفل الشاشة على الموبايل، يظهر فقط بعد تجاوز أزرار الشراء الأصلية
export default function StickyBuyBar({ targetRef, price, onAdd, onBuy }) {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, [targetRef]);

  useEffect(() => {
    document.body.classList.toggle("buybar-open", show);
    return () => document.body.classList.remove("buybar-open");
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="sticky-buybar"
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          exit={{ y: "110%" }}
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
        >
          <span className="sticky-buybar-price">{money(price, STORE_CONFIG.currency)}</span>
          <button type="button" className="btn btn-primary" onClick={onAdd}>{t("pdp.add")}</button>
          <button type="button" className="btn btn-accent" onClick={onBuy}>{t("pdp.buy")}</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
