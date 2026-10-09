import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useInView } from "framer-motion";
import { useI18n } from "../i18n/I18nContext";
import { useProducts } from "../data/ProductsContext";
import { useSubcategories, subcatLabel } from "../data/SubcategoriesContext";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";
import RevealLink from "../components/RevealLink";
import ScrollReveal from "../components/ScrollReveal";
import StaggerGrid from "../components/StaggerGrid";
import DaniOrbitHero from "../components/cine/DaniOrbitHero";
import GiftScene from "../components/cine/GiftScene";
import DriveScene from "../components/cine/DriveScene";
import FinaleScene from "../components/cine/FinaleScene";
import { AGE_BANDS, inBand } from "../lib/ages";
import { getRecent } from "../lib/recent";
import Icon from "../components/Icon";

export default function Home() {
  const { t, lang, meta } = useI18n();
  const { products } = useProducts();
  const { subcategories } = useSubcategories();
  const catStrip = [
    { emoji: "🧸", label: t("catstrip.toys"), to: "/shop?cat=toys" },
    { emoji: "👶", label: t("nav.kids"), to: "/shop?cat=kids" },
    ...subcategories.map((s) => ({ emoji: s.emoji || "🎁", label: subcatLabel(s, lang), to: `/shop?subcat=${s.slug}` })),
  ];
  const stripRef = useRef(null);
  const stripSeen = useInView(stripRef, { once: true, amount: 0.6 });
  // كل منتج يظهر في قسم واحد فقط من الصفحة الرئيسية
  const bestSellers = products.filter((p) => p.badge === "الأكثر مبيعاً").slice(0, 4);
  const kidsProducts = products.filter((p) => p.category === "kids" && !bestSellers.includes(p)).slice(0, 4);
  const shown = new Set([...bestSellers, ...kidsProducts]);
  const rest = products.filter((p) => !shown.has(p));
  const picks = rest.filter((p) => p.badge || p.oldPrice);
  const featured = [...picks, ...rest.filter((p) => !picks.includes(p))].slice(0, 8);

  const ageBands = AGE_BANDS.map((b) => ({ ...b, count: products.filter((p) => inBand(p, b)).length })).filter((b) => b.count > 0);
  const [recentIds] = useState(getRecent);
  const recent = recentIds.map((id) => products.find((p) => p.id === id)).filter(Boolean).slice(0, 4);




  return (
    <>
      <DaniOrbitHero />


      {/* الفئات — أول محطة سردية بعد الهيرو: العالم يستمر بالتحرك */}
      <section className="section">
        <div className="wrap">
          <ScrollReveal className="section-head" scale={0.94}>
            <span className="kicker">{t("cats.kicker")}</span>
            <h2>{t("cats.title")}</h2>
            <p>{t("cats.sub")}</p>
          </ScrollReveal>
          <div className={`cat-strip${stripSeen ? " wave" : ""}`} ref={stripRef} style={{ "--n": Math.min(catStrip.length, 10) }}>
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

      <GiftScene />

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

      <DriveScene />

      {/* منتجات الأطفال */}
      {kidsProducts.length > 0 && (
        <section className="section">
          <div className="wrap">
            <ScrollReveal className="section-head">
              <span className="kicker">{t("kidssec.kicker")}</span>
              <h2>{t("kidssec.title")}</h2>
              <p>{t("kidssec.sub")}</p>
            </ScrollReveal>
            <StaggerGrid className="products-grid">
              {kidsProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </StaggerGrid>
            <div style={{ textAlign: "center", marginTop: 30 }}>
              <Link to="/shop?cat=kids" className="btn btn-ghost btn-lg">{t("kidssec.viewall")}</Link>
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
              <h2 className="ic-head" style={{ fontSize: "1.4rem" }}><Icon name="eye" size={22} />{t("recent.title")}</h2>
            </ScrollReveal>
            <StaggerGrid className="products-grid">
              {recent.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </StaggerGrid>
          </div>
        </section>
      )}

      <FinaleScene />
    </>
  );
}
