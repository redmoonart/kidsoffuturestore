import { useI18n } from "../i18n/I18nContext";
import { STORE_CONFIG } from "../data/config";
import { money } from "../lib/format";

// شريط تقدّم نحو التوصيل المجاني
export default function FreeShippingBar({ subtotal }) {
  const { t } = useI18n();
  const goal = STORE_CONFIG.freeShippingThreshold;
  if (!goal) return null;
  const pct = Math.min(100, Math.round((subtotal / goal) * 100));
  const done = subtotal >= goal;
  return (
    <div className={`free-bar${done ? " done" : ""}`}>
      <p className="free-bar-text" aria-live="polite">
        {done ? t("cart.free_congrats") : <>{t("cart.free_add_pre")}<strong>{money(goal - subtotal, STORE_CONFIG.currency)}</strong>{t("cart.free_add_post")}</>}
      </p>
      <div className="free-bar-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <div className="free-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
