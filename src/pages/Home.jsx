import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useScroll, useInView } from "framer-motion";
import { useI18n } from "../i18n/I18nContext";
import { useProducts } from "../data/ProductsContext";
import { useSubcategories, subcatLabel } from "../data/SubcategoriesContext";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";
import RevealLink from "../components/RevealLink";
import ScrollReveal from "../components/ScrollReveal";
import StaggerGrid from "../components/StaggerGrid";
import FloatIcon from "../components/FloatIcon";
import Hero3D from "../components/Hero3D";
import { AGE_BANDS, inBand } from "../lib/ages";
import { getRecent } from "../lib/recent";

export default function Home() {
  const { t, lang, meta } = useI18n();
  const { products } = useProducts();
  const { subcategories } = useSubcategories();
  const catStrip = [
    { emoji: "🧸", label: t("catstrip.toys"), to: "/shop?cat=toys" },
    ...subcategories.map((s) => ({ emoji: s.emoji || "🎁", label: subcatLabel(s, lang), to: `/shop?subcat=${s.slug}` })),
  ];
  const stripRef = useRef(null);
  const stripSeen = useInView(stripRef, { once: true, amount: 0.6 });
  const picks = products.filter((p) => p.badge || p.oldPrice).slice(0, 8);
  const featured = picks.length ? picks : products.slice(0, 8);
  const schoolSupplies = products.filter((p) => p.category === "school").slice(0, 4);
  const bestSellers = products.filter((p) => p.badge === "الأكثر مبيعاً").slice(0, 4);

  const ageBands = AGE_BANDS.map((b) => ({ ...b, count: products.filter((p) => inBand(p, b)).length })).filter((b) => b.count > 0);
  const [recentIds] = useState(getRecent);
  const recent = recentIds.map((id) => products.find((p) => p.id === id)).filter(Boolean).slice(0, 4);


  const schoolRef = useRef(null);
  const { scrollYProgress: schoolScroll } = useScroll({ target: schoolRef, offset: ["start 90%", "end 20%"] });


  return (
    <>
      <Hero3D />

      <section className="section-sm">
        <div className="wrap">
          <Reveal className="stat-strip">
            <div className="stat-card c1">
              <span className="num">58</span>
              <span className="lbl">{t("feat.delivery_d")}</span>
            </div>
            <div className="stat-card c2">
              <span className="num">48h</span>
              <span className="lbl">{t("feat.exchange_d")}</span>
            </div>
            <div className="stat-card c3">
              <span className="num">100%</span>
              <span className="lbl">{t("feat.cod_d")}</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* الفئات — أول محطة سردية بعد الهيرو: العالم يستمر بالتحرك */}
      <section className="section">
        <div className="wrap">
          <ScrollReveal className="section-head" scale={0.94}>
            <span className="kicker">{t("cats.kicker")}</span>
            <h2>{t("cats.title")}</h2>
            <p>{t("cats.sub")}</p>
          </ScrollReveal>
          <div className={`cat-strip${stripSeen ? " wave" : ""}`} ref={stripRef}>
            {catStrip.map((c, i) => (
              <RevealLink key={c.to} to={c.to} className="cat-chip" delay={i * 0.05} y={16}>
                <span className="ic"><span className="ic-emoji">{c.emoji}</span></span>
                <h3>{c.label}</h3>
                <span className="go">{meta.dir === "rtl" ? "←" : "→"}</span>
              </RevealLink>
            ))}
          </div>
        </div>
      </section>

      {/* تسوّق حسب العمر */}
      {ageBands.length > 1 && (
        <section className="section-sm">
          <div className="wrap">
            <ScrollReveal className="section-head">
              <span className="kicker">{t("age.kicker")}</span>
              <h2>{t("age.title")}</h2>
            </ScrollReveal>
            <div className="age-grid">
              {ageBands.map((b, i) => (
                <RevealLink key={b.id} to={`/shop?age=${encodeURIComponent(b.id)}`} className={`age-card a${i + 1}`} delay={i * 0.06} y={16}>
                  <span className="age-emoji" aria-hidden="true">{b.emoji}</span>
                  <span className="age-range">{t("shop.age_band", { v: b.id })}</span>
                  <span className="age-count">{b.count} {t("shop.count_unit")}</span>
                </RevealLink>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* منتجات مختارة */}
      <section className="section" style={{ background: "#fff" }}>
        <div className="wrap">
          <ScrollReveal className="section-head">
            <span className="kicker">{t("picks.kicker")}</span>
            <h2>{t("picks.title")}</h2>
            <p>{t("picks.sub")}</p>
          </ScrollReveal>
          <StaggerGrid className="products-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </StaggerGrid>
          <div style={{ textAlign: "center", marginTop: 30 }}>
            <Link to="/shop" className="btn btn-primary btn-lg">{t("picks.viewall")}</Link>
          </div>
        </div>
      </section>

      {/* الأدوات المدرسية — عالم مختلف بصرياً: أدوات مدرسية طافية حول المنتجات */}
      {schoolSupplies.length > 0 && (
        <section className="section icon-stage" ref={schoolRef}>
          <FloatIcon emoji="✏️" scrollYProgress={schoolScroll} range={[60, -60]} depth="fg"
            top="4%" left="2%" size="2.2rem" />
          <FloatIcon emoji="📚" scrollYProgress={schoolScroll} range={[40, -80]} depth="mid"
            top="10%" right="3%" size="2.1rem" className="decor-icon-extra" />
          <FloatIcon emoji="🎒" scrollYProgress={schoolScroll} range={[70, -40]} depth="bg"
            bottom="6%" left="5%" size="1.9rem" className="decor-icon-extra" />
          <FloatIcon emoji="🖍️" scrollYProgress={schoolScroll} range={[30, -70]} depth="mid"
            bottom="8%" right="2%" size="2rem" />
          <div className="wrap">
            <ScrollReveal className="section-head">
              <span className="kicker">{t("schoolsec.kicker")}</span>
              <h2>{t("schoolsec.title")}</h2>
              <p>{t("schoolsec.sub")}</p>
            </ScrollReveal>
            <StaggerGrid className="products-grid">
              {schoolSupplies.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </StaggerGrid>
            <div style={{ textAlign: "center", marginTop: 30 }}>
              <Link to="/shop?cat=school" className="btn btn-ghost btn-lg">{t("schoolsec.viewall")}</Link>
            </div>
          </div>
        </section>
      )}

      {/* الأكثر مبيعاً */}
      {bestSellers.length > 0 && (
        <section className="section" style={{ background: "#fff" }}>
          <div className="wrap">
            <ScrollReveal className="section-head">
              <span className="kicker">{t("best.kicker")}</span>
              <h2>{t("best.title")}</h2>
              <p>{t("best.sub")}</p>
            </ScrollReveal>
            <StaggerGrid className="products-grid">
              {bestSellers.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </StaggerGrid>
          </div>
        </section>
      )}

      {recent.length >= 2 && (
        <section className="section-sm">
          <div className="wrap">
            <ScrollReveal className="section-head section-head-start">
              <h2 style={{ fontSize: "1.4rem" }}>👀 {t("recent.title")}</h2>
            </ScrollReveal>
            <StaggerGrid className="products-grid">
              {recent.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </StaggerGrid>
          </div>
        </section>
      )}

      {/* CTA نهائي */}
      <section className="section-sm">
        <div className="wrap">
          <Reveal className="cod-banner" delay={0.4}>
            <span className="em">💵</span>
            <div style={{ flex: 1, minWidth: 220 }}>
              <h3>{t("cod.title")}</h3>
              <p>{t("cod.text")}</p>
            </div>
            <Link to="/shop" className="btn" style={{ background: "#fff", color: "var(--teal)" }}>
              {t("cod.btn")}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
