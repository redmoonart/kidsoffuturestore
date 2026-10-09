import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import { STORE_CONFIG } from "../data/config";
import { POLICIES, POLICY_SECTIONS, POLICIES_UPDATED } from "../data/policies";
import PageHead from "../components/PageHead";
import Reveal from "../components/Reveal";
import SEO from "../components/SEO";
import Icon from "../components/Icon";
import Icon3D from "../components/Icon3D";

const ICONS = { terms: "file", delivery: "truck", returns: "exchange", privacy: "lock" };
const ICONS3D = { terms: "doc", delivery: "van", returns: "exchange", privacy: "lock" };

export default function Policies() {
  const { lang } = useI18n();
  const { hash } = useLocation();
  const P = POLICIES[lang] || POLICIES.ar;
  const fill = (s) => s.replace("{free}", STORE_CONFIG.freeShippingThreshold.toLocaleString("fr-DZ")).replace("{store}", STORE_CONFIG.name);

  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }, [hash]);

  const legalRows = [
    [lang === "ar" ? "الاسم التجاري" : lang === "fr" ? "Raison sociale" : "Business name", STORE_CONFIG.legalName || STORE_CONFIG.name],
    [lang === "ar" ? "السجل التجاري" : lang === "fr" ? "N° RC" : "Trade register (RC)", STORE_CONFIG.rc],
    [lang === "ar" ? "رقم التعريف الجبائي" : "NIF", STORE_CONFIG.nif],
    [lang === "ar" ? "العنوان" : lang === "fr" ? "Adresse" : "Address", STORE_CONFIG.address],
    [lang === "ar" ? "الهاتف" : lang === "fr" ? "Téléphone" : "Phone", STORE_CONFIG.phoneDisplay],
    ["Email", STORE_CONFIG.email],
  ].filter(([, v]) => v);

  return (
    <>
      <SEO title={`${P.title} — ${STORE_CONFIG.name}`} description={P.sub} path="policies" />
      <PageHead title={P.title} subtitle={P.sub} />
      <section className="section">
        <div className="wrap policies">
          <nav className="policy-tabs" aria-label={P.title}>
            {POLICY_SECTIONS.map((k) => (
              <a key={k} href={`#${k}`} onClick={(e) => { e.preventDefault(); document.getElementById(k)?.scrollIntoView({ behavior: "smooth", block: "start" }); history.replaceState(null, "", `#${k}`); }}>
                <Icon name={ICONS[k]} size={17} /> {P[k].t}
              </a>
            ))}
          </nav>

          {POLICY_SECTIONS.map((k) => (
            <Reveal key={k} as="article" className="prose policy-block" y={18}>
              <h2 id={k} className="ic-head"><Icon3D name={ICONS3D[k]} size={52} />{P[k].t}</h2>
              <ul className="dots">
                {P[k].p.map((line, i) => <li key={i}>{fill(line)}</li>)}
              </ul>
            </Reveal>
          ))}

          <Reveal className="prose policy-block" y={18}>
            <h2 id="seller" className="ic-head"><Icon name="store" size={22} />{P.legal_t}</h2>
            <dl className="legal-dl">
              {legalRows.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd dir="auto">{v}</dd></div>
              ))}
            </dl>
            <p className="policy-updated">{P.updated}: {POLICIES_UPDATED}</p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
