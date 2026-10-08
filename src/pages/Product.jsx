import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import { useCart } from "../cart/CartContext";
import { useProducts } from "../data/ProductsContext";
import { STORE_CONFIG } from "../data/config";
import ProductCard from "../components/ProductCard";
import TiltCard from "../components/TiltCard";
import Reveal from "../components/Reveal";
import StaggerGrid from "../components/StaggerGrid";
import ScrollReveal from "../components/ScrollReveal";
import SEO from "../components/SEO";
import DeliveryEstimate from "../components/DeliveryEstimate";
import StickyBuyBar from "../components/StickyBuyBar";
import ShareButtons from "../components/ShareButtons";
import { pushRecent } from "../lib/recent";
import { track } from "../lib/pixel";
import { pName, pDesc } from "../lib/product";
import { money } from "../lib/format";
import ProductImage from "../components/ProductImage";

export default function Product() {
  const { id } = useParams();
  const { t, lang } = useI18n();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const [qty, setQty] = useState(1);

  const p = products.find((x) => x.id === Number(id));
  const [activeImg, setActiveImg] = useState(null);
  const actionsRef = useRef(null);

  useEffect(() => {
    setQty(1);
    setActiveImg(null);
  }, [id]);

  useEffect(() => {
    if (!p) return;
    pushRecent(p.id);
    track("ViewContent", { content_ids: [String(p.id)], content_type: "product", content_name: p.name, value: p.price, currency: "DZD" });
  }, [p?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!p) {
    if (loading) return null;
    return (
      <section className="section">
        <div className="wrap">
          <div className="empty-state">
            <div className="em">😕</div>
            <h3>{t("pdp.notfound_t")}</h3>
            <p>{t("pdp.notfound_p")}</p>
            <Link className="btn btn-primary" to="/shop">{t("pdp.notfound_btn")}</Link>
          </div>
        </div>
      </section>
    );
  }

  const catLabel = t(p.category === "toys" ? "card.toys" : "card.school");
  const disc = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const out = p.stock === false;
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const gallery = [p.image, ...(p.images || [])].filter(Boolean);
  const shownImg = activeImg || gallery[0];
  const lowStock = !out && typeof p.stockQty === "number" && p.stockQty > 0 && p.stockQty <= 5;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pName(p, lang),
    description: pDesc(p, lang),
    image: p.image || `${STORE_CONFIG.siteUrl}/og-image.webp`,
    offers: {
      "@type": "Offer",
      priceCurrency: "DZD",
      price: p.price,
      availability: out ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: `${STORE_CONFIG.siteUrl}/product/${p.id}`,
    },
  };

  function handleAdd(e) {
    addToCart(p.id, qty, e.currentTarget.closest(".pdp")?.querySelector(".gallery") || e.currentTarget);
  }
  function handleBuy() {
    addToCart(p.id, qty);
    navigate("/cart");
  }

  return (
    <section className="section">
      <SEO
        title={`${pName(p, lang)} — ${STORE_CONFIG.name}`}
        description={pDesc(p, lang)}
        path={`product/${p.id}`}
        jsonLd={productJsonLd}
      />
      <div className="wrap">
        <p className="breadcrumb">
          <Link to="/">{t("nav.home")}</Link> / <Link to={`/shop?cat=${p.category}`}>{catLabel}</Link> / {pName(p, lang)}
        </p>
        <div className="pdp">
          <Reveal className="product-stage" y={28}>
            <div className="stage-glow" />
            <TiltCard className="gallery">
              <ProductImage src={shownImg} emoji={p.emoji} alt={pName(p, lang)} />
              {disc > 0 && !out && <span className="disc">-{disc}%</span>}
            </TiltCard>
            {gallery.length > 1 && (
              <div className="gallery-thumbs">
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`gallery-thumb${(activeImg || gallery[0]) === src ? " active" : ""}`}
                    onClick={() => setActiveImg(src)}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </Reveal>
          <Reveal className="info" y={28} delay={0.1}>
            <span className="cat-tag" style={{ color: "var(--primary)", fontWeight: 700 }}>{catLabel}</span>
            <h1>{pName(p, lang)}</h1>
            <div className="price">
              <span className="now">{money(p.price, STORE_CONFIG.currency)}</span>
              {p.oldPrice ? <span className="old">{money(p.oldPrice, STORE_CONFIG.currency)}</span> : null}
            </div>
            <p className="desc">{pDesc(p, lang)}</p>
            <div className="meta">
              {p.ageGroup && <span className="tag">{t("pdp.age", { v: p.ageGroup })}</span>}
              <span className="tag">{t("pdp.cod_tag")}</span>
              <span className="tag">{t("pdp.delivery_tag")}</span>
              <span className="tag">{t("pdp.exchange_tag")}</span>
            </div>
            <p>
              {out ? <span className="out-stock">{t("pdp.out_stock")}</span> : <span className="in-stock">{t("pdp.in_stock")}</span>}
              {lowStock && <span className="low-stock-badge">{t("pdp.low_stock", { v: p.stockQty })}</span>}
            </p>
            {!out && (
              <div className="pdp-actions" ref={actionsRef}>
                <div className="qty">
                  <button type="button" onClick={() => setQty((v) => Math.max(1, v - 1))}>−</button>
                  <input type="text" value={qty} inputMode="numeric" readOnly />
                  <button type="button" onClick={() => setQty((v) => v + 1)}>+</button>
                </div>
                <button className="btn btn-primary btn-lg" onClick={handleAdd}>{t("pdp.add")}</button>
                <button className="btn btn-accent btn-lg" onClick={handleBuy} disabled={out}>{t("pdp.buy")}</button>
              </div>
            )}
            {!out && <DeliveryEstimate />}
            <ShareButtons title={pName(p, lang)} />
          </Reveal>
        </div>
        {!out && <StickyBuyBar targetRef={actionsRef} price={p.price * qty} onAdd={handleAdd} onBuy={handleBuy} />}
        {related.length > 0 && (
          <>
            <div className="section-sm" />
            <ScrollReveal className="section-head section-head-start" y={20}>
              <h2 style={{ fontSize: "1.4rem" }}>{t("pdp.related")}</h2>
            </ScrollReveal>
            <StaggerGrid className="products-grid">
              {related.map((r) => (
                <ProductCard key={r.id} product={r} />
              ))}
            </StaggerGrid>
          </>
        )}
      </div>
    </section>
  );
}
