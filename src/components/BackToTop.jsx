import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";

export default function BackToTop() {
  const { t } = useI18n();
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setVisible(y > 600));

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          className="back-to-top"
          aria-label={t("aria.backtotop")}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          initial={{ opacity: 0, y: 16, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.8 }}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        >
          ↑
        </motion.button>
      )}
    </AnimatePresence>
  );
}
