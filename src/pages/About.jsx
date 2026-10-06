import { Link } from "react-router-dom";
import { useI18n, Trans } from "../i18n/I18nContext";
import PageHead from "../components/PageHead";
import Reveal from "../components/Reveal";

const CARDS = [
  ["🚚", "about.c1_t", "about.c1_d"],
  ["💵", "about.c2_t", "about.c2_d"],
  ["✅", "about.c3_t", "about.c3_d"],
  ["📞", "about.c4_t", "about.c4_d"],
];

export default function About() {
  const { t } = useI18n();
  return (
    <>
      <PageHead title={t("about.head_t")} subtitle={t("about.head_s")} />
      <section className="section">
        <div className="wrap">
          <Reveal className="prose" y={24}>
            <p><Trans k="about.p1" /></p>
            <h2>{t("about.h_mission")}</h2>
            <p>{t("about.mission")}</p>
            <h2>{t("about.h_why")}</h2>
            <ul className="dots">
              <li>{t("about.why1")}</li>
              <li>{t("about.why2")}</li>
              <li>{t("about.why3")}</li>
              <li>{t("about.why4")}</li>
              <li>{t("about.why5")}</li>
            </ul>
            <h2>{t("about.h_commit")}</h2>
            <p>{t("about.commit")}</p>
          </Reveal>

          <div className="section-sm" />
          <div className="info-grid">
            {CARDS.map(([ic, tt, dd], i) => (
              <Reveal key={tt} className="info-card" delay={i * 0.06}>
                <div className="ic">{ic}</div>
                <h3>{t(tt)}</h3>
                <p style={{ color: "var(--muted)" }}>{t(dd)}</p>
              </Reveal>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 34 }}>
            <Link to="/shop" className="btn btn-primary btn-lg">{t("about.cta")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
