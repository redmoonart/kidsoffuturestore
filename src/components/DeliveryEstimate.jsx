import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { WILAYAS } from "../data/wilayas";
import { STORE_CONFIG } from "../data/config";
import { wName } from "../lib/product";
import { money } from "../lib/format";
import { getSavedWilaya, saveWilaya, isFarWilaya } from "../lib/wilayaPref";

// تقدير سعر ومدة التوصيل حسب ولاية الزبون، مباشرة في صفحة المنتج
export default function DeliveryEstimate() {
  const { t, lang } = useI18n();
  const [code, setCode] = useState(getSavedWilaya);
  const w = WILAYAS.find((x) => x.code === Number(code));

  function onChange(e) {
    setCode(e.target.value);
    saveWilaya(e.target.value);
  }

  return (
    <div className="delivery-est">
      <label className="delivery-est-head">
        <span>🚚 {t("pdp.deliver_to")}</span>
        <select value={code} onChange={onChange}>
          <option value="">{t("pdp.choose_wilaya")}</option>
          {WILAYAS.map((x) => (
            <option key={x.code} value={x.code} disabled={x.available === false}>
              {x.code} - {wName(x, lang)}
            </option>
          ))}
        </select>
      </label>
      {w && w.available !== false && (
        <ul className="delivery-est-rows">
          <li><span>🏠 {t("pdp.home")}</span><strong>{money(w.home, STORE_CONFIG.currency)}</strong></li>
          {w.office != null && <li><span>🏢 {t("pdp.office")}</span><strong>{money(w.office, STORE_CONFIG.currency)}</strong></li>}
          <li><span>⏱️ {t("pdp.eta_label")}</span><strong>{t(isFarWilaya(w) ? "pdp.eta_far" : "pdp.eta_normal")}</strong></li>
        </ul>
      )}
      {w && w.available === false && <p className="delivery-est-na">{t("cart.wilaya_unavailable_note")}</p>}
      {STORE_CONFIG.freeShippingThreshold > 0 && (
        <p className="delivery-est-free">🎁 {t("pdp.free_over", { v: STORE_CONFIG.freeShippingThreshold.toLocaleString("fr-DZ") })}</p>
      )}
    </div>
  );
}
