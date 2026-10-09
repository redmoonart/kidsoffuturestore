import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import Icon from "./Icon";

// مشاركة المنتج: قائمة المشاركة الأصلية للهاتف إن توفّرت، وإلا واتساب/فيسبوك/نسخ الرابط
export default function ShareButtons({ title }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const canNative = typeof navigator !== "undefined" && !!navigator.share;

  async function nativeShare() {
    try {
      await navigator.share({ title, url });
    } catch {
      /* user cancelled */
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="share-row">
      <span className="share-label">{t("pdp.share")}:</span>
      {canNative && (
        <button type="button" className="share-btn" onClick={nativeShare} aria-label={t("pdp.share")}><Icon name="share" size={17} /></button>
      )}
      <a className="share-btn wa" href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.45 1.27 4.9L2 22l5.25-1.38a9.96 9.96 0 0 0 4.79 1.22c5.52 0 10-4.48 10-10S17.57 2 12.04 2zm4.47 12.02c-.24-.12-1.45-.72-1.68-.8-.22-.08-.39-.12-.55.12-.17.24-.63.8-.77.96-.14.17-.28.19-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.11-.49.11-.11.24-.28.37-.42.12-.14.16-.24.24-.4.08-.17.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.24-.86.84-.86 2.04s.88 2.36 1 2.52c.12.17 1.73 2.65 4.2 3.71.59.25 1.05.4 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.45-.59 1.66-1.17.2-.57.2-1.06.14-1.17-.06-.11-.22-.17-.46-.29z"/></svg>
      </a>
      <a className="share-btn fb" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" aria-label="Facebook">f</a>
      <button type="button" className="share-btn" onClick={copy} aria-label={t("pdp.copy_link")}>{copied ? <Icon name="check" size={17} stroke={2.4} /> : <Icon name="link" size={17} />}</button>
      {copied && <span className="share-copied" role="status">{t("pdp.copied")}</span>}
    </div>
  );
}
