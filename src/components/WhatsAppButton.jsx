import { motion } from "framer-motion";
import { useI18n } from "../i18n/I18nContext";
import { STORE_CONFIG } from "../data/config";
import { storeWaLink } from "../lib/whatsapp";

export default function WhatsAppButton() {
  const { t } = useI18n();
  const href = storeWaLink(t("wa.generic", { store: STORE_CONFIG.name }));
  if (!href) return null;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-fab"
      aria-label={t("aria.whatsapp")}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.6 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
    >
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.45 1.27 4.9L2 22l5.25-1.38a9.96 9.96 0 0 0 4.79 1.22h.01c5.52 0 10-4.48 10-10s-4.48-9.84-10.01-9.84zm0 18.1h-.01a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.12.82.83-3.04-.19-.31a8.1 8.1 0 0 1-1.24-4.29c0-4.48 3.65-8.12 8.15-8.12 2.18 0 4.22.85 5.76 2.39a8.07 8.07 0 0 1 2.39 5.75c0 4.48-3.65 8.11-8.14 8.11zm4.47-6.08c-.24-.12-1.45-.72-1.68-.8-.22-.08-.39-.12-.55.12-.17.24-.63.8-.77.96-.14.17-.28.19-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.11-.49.11-.11.24-.28.37-.42.12-.14.16-.24.24-.4.08-.17.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.24-.86.84-.86 2.04 0 1.2.88 2.36 1 2.52.12.17 1.73 2.65 4.2 3.71.59.25 1.05.4 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.45-.59 1.66-1.17.2-.57.2-1.06.14-1.17-.06-.11-.22-.17-.46-.29z" />
      </svg>
    </motion.a>
  );
}
