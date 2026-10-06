import { useState, useEffect } from "react";
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
import { pName, pDesc } from "../lib/product";
import { money } from "../lib/format";

export default function Product() {
  const { id } = useParams();
  const { t, lang } = useI18n();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const [qty, setQty] = useState(1);

  const p = products.find((x) => x.id === Number(id));

  useEffect(() => {
    setQty(1);
    if (p) document.title = `${pName(p, lang)} — ${STORE_CONFIG.name}`;
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

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

  function handleAdd() {
    addToCart(p.id, qty);
  }
  function handleBuy() {
    addToCart(p.id, qty);
    navigate("/cart");
  }

  return (
    <section className="section">
      <div className="wrap">
        <p className="breadcrumb">
          <Link to="/">{t("nav.home")}</Link> / <Link to={`/shop?cat=${p.category}`}>{catLabel}</Link> / {pName(p, lang)}
        </p>
        <div className="pdp">
          <Reveal className="product-stage" y={28}>
            <div className="stage-glow" />
            <TiltCard className="gallery">
              {p.image ? <img src={p.image} alt={pName(p, lang)} /> : <span>{p.emoji || "🎁"}</span>}
              {disc > 0 && !out && <span className="disc">-{disc}%</span>}
            </TiltCard>
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
            </div>
            <p>
              {out ? <span className="out-stock">{t("pdp.out_stock")}</span> : <span className="in-stock">{t("pdp.in_stock")}</span>}
            </p>
            {!out && (
              <div className="pdp-actions">
                <div className="qty">
                  <button type="button" onClick={() => setQty((v) => Math.max(1, v - 1))}>−</button>
                  <input type="text" value={qty} inputMode="numeric" readOnly />
                  <button type="button" onClick={() => setQty((v) => v + 1)}>+</button>
                </div>
                <button className="btn btn-primary btn-lg" onClick={handleAdd}>{t("pdp.add")}</button>
                <button className="btn btn-accent btn-lg" onClick={handleBuy} disabled={out}>{t("pdp.buy")}</button>
              </div>
            )}
          </Reveal>
        </div>
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
