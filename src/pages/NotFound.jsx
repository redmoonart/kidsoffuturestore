import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import SEO from "../components/SEO";
import Icon from "../components/Icon";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <section className="section">
      <SEO title={`${t("nf.title")} — Kids of the Future`} description={t("nf.text")} path="" />
      <div className="wrap">
        <div className="empty-state not-found">
          <div className="em em-ic" aria-hidden="true"><Icon name="search" size={40} stroke={1.5} /></div>
          <h1>{t("nf.title")}</h1>
          <p>{t("nf.text")}</p>
          <div className="order-success-actions">
            <Link className="btn btn-primary btn-lg" to="/shop"><Icon name="bag" size={19} />{t("nf.shop")}</Link>
            <Link className="btn btn-ghost btn-lg" to="/">{t("nav.home")}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
