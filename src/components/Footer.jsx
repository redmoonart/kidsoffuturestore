import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import { STORE_CONFIG } from "../data/config";
import Icon from "./Icon";

export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  const tel = (STORE_CONFIG.phoneDisplay || "").replace(/\s/g, "");

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="brand">
              <span className="logo logo-img">🧸</span>
              <span>{STORE_CONFIG.name}</span>
            </div>
            <p style={{ marginTop: 12, fontSize: ".9rem" }}>{t("footer.about")}</p>
            <div className="socials">
              {STORE_CONFIG.facebook && <a href={STORE_CONFIG.facebook} aria-label="facebook">f</a>}
              {STORE_CONFIG.instagram && <a href={STORE_CONFIG.instagram} aria-label="instagram"><Icon name="instagram" size={18} /></a>}
              {STORE_CONFIG.tiktok && <a href={STORE_CONFIG.tiktok} aria-label="tiktok"><Icon name="music" size={18} /></a>}
            </div>
          </div>
          <div>
            <h4>{t("footer.quicklinks")}</h4>
            <Link to="/shop">{t("nav.shop")}</Link>
            <Link to="/shop?cat=toys">{t("nav.toys")}</Link>
            <Link to="/shop?cat=kids">{t("nav.kids")}</Link>
            <Link to="/cart">{t("footer.cart")}</Link>
          </div>
          <div>
            <h4>{t("footer.store")}</h4>
            <Link to="/about">{t("nav.about")}</Link>
            <Link to="/contact">{t("nav.contact")}</Link>
            <Link to="/contact#faq">{t("footer.faq")}</Link>
            <Link to="/policies#delivery">{t("footer.delivery")}</Link>
            <Link to="/policies#returns">{t("footer.returns")}</Link>
            <Link to="/policies#terms">{t("footer.terms")}</Link>
            <Link to="/policies#privacy">{t("footer.privacy")}</Link>
          </div>
          <div>
            <h4>{t("footer.contact_us")}</h4>
            {tel && <a href={`tel:${tel}`} className="ic-link"><Icon name="phone" size={16} />{t("footer.wa")}</a>}
            <a href={`mailto:${STORE_CONFIG.email}`} className="ic-link"><Icon name="mail" size={16} />{t("footer.email")}</a>
            <p className="ic-link" style={{ fontSize: ".85rem", marginTop: 8 }}><Icon name="clock" size={16} />{t("footer.hours")}</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© <span>{year}</span> {STORE_CONFIG.name} — {t("footer.rights")}</span>
          <span>{t("footer.madewith")}</span>
        </div>
      </div>
    </footer>
  );
}
