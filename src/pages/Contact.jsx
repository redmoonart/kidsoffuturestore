import { useI18n } from "../i18n/I18nContext";
import { STORE_CONFIG } from "../data/config";
import PageHead from "../components/PageHead";
import Reveal from "../components/Reveal";
import FAQItem from "../components/FAQItem";
import SEO from "../components/SEO";
import Icon from "../components/Icon";

export default function Contact() {
  const { t } = useI18n();
  const tel = (STORE_CONFIG.phoneDisplay || "").replace(/\s/g, "");

  return (
    <>
      <SEO title={`${t("contact.head_t")} — Kids of the Future`} description={t("contact.head_s")} path="contact" />
      <PageHead title={t("contact.head_t")} subtitle={t("contact.head_s")} />
      <section className="section">
        <div className="wrap">
          <div className="info-grid">
            <Reveal className="info-card">
              <div className="ic"><Icon name="mail" size={26} /></div>
              <h3>{t("contact.email_t")}</h3>
              <p style={{ color: "var(--muted)", margin: "6px 0 14px" }}>{t("contact.email_d")}</p>
              <a className="btn btn-ghost" href={`mailto:${STORE_CONFIG.email}`}>{t("contact.email_btn")}</a>
            </Reveal>
            <Reveal className="info-card" delay={0.12}>
              <div className="ic"><Icon name="phone" size={26} /></div>
              <h3>{t("contact.phone_t")}</h3>
              <p style={{ color: "var(--muted)", margin: "6px 0 14px" }}>{t("contact.phone_d")}</p>
              <a href={`tel:${tel}`} dir="ltr" style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--primary)" }}>{STORE_CONFIG.phoneDisplay}</a>
            </Reveal>
            <Reveal className="info-card" delay={0.18}>
              <div className="ic"><Icon name="pin" size={26} /></div>
              <h3>{t("contact.addr_t")}</h3>
              <p style={{ color: "var(--muted)", margin: "6px 0 14px" }}>{t("contact.addr_d")}</p>
              <p style={{ fontWeight: 700 }}>{t("contact.addr_v")}</p>
            </Reveal>
          </div>

          <div className="section-sm" />

          <div id="faq" className="prose">
            <h2 className="ic-head" style={{ marginTop: 0 }}><Icon name="help" size={22} />{t("contact.faq_t")}</h2>
            <FAQItem qKey="faq.q1" aKey="faq.a1" defaultOpen />
            <FAQItem qKey="faq.q2" aKey="faq.a2" />
            <FAQItem qKey="faq.q3" aKey="faq.a3" />
            <FAQItem qKey="faq.q4" aKey="faq.a4" />
            <FAQItem qKey="faq.q5" aKey="faq.a5" />
            <FAQItem qKey="faq.q6" aKey="faq.a6" />
          </div>
        </div>
      </section>
    </>
  );
}
