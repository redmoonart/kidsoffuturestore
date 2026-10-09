import { useState } from "react";
import { Link } from "react-router-dom";
import TiltCard from "./TiltCard";
import { useI18n } from "../i18n/I18nContext";
import { useCart } from "../cart/CartContext";
import { STORE_CONFIG } from "../data/config";
import { pName } from "../lib/product";
import { fmt } from "../lib/format";
import ProductImage from "./ProductImage";
import Icon from "./Icon";

export default function ProductCard({ product }) {
  const { t, lang } = useI18n();
  const { addToCart } = useCart();
  const [pulse, setPulse] = useState(false);
  const disc = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const out = product.stock === false;
  const lowStock = !out && typeof product.stockQty === "number" && product.stockQty > 0 && product.stockQty <= 5;
  const catLabel = t(product.category === "toys" ? "card.toys" : "card.kids");

  function handleAdd(e) {
    addToCart(product.id, 1, e.currentTarget.closest(".pcard")?.querySelector(".thumb") || e.currentTarget);
    setPulse(true);
    setTimeout(() => setPulse(false), 500);
  }

  return (
    <TiltCard className="pcard" as="article">
      <Link to={`/product/${product.id}`} className={`thumb t-${product.category}${product.image ? "" : " no-img"}`} tabIndex={-1} aria-hidden="true">
        <ProductImage src={product.image} emoji={product.emoji} alt={pName(product, lang)} loading="lazy" />
        {product.badge && !out && !lowStock && <span className="badge">{product.badge}</span>}
        {lowStock && <span className="badge low-stock">{t("pdp.low_stock", { v: product.stockQty })}</span>}
        {out && <span className="badge out">{t("card.out")}</span>}
        {disc > 0 && !out && <span className="disc">-{disc}%</span>}
      </Link>
      <div className="body">
        <span className="cat-tag">{catLabel}</span>
        <h3><Link to={`/product/${product.id}`}>{pName(product, lang)}</Link></h3>
        <div className="price">
          <span className="now">{fmt(product.price)}</span>
          <span className="cur">{STORE_CONFIG.currency}</span>
          {product.oldPrice ? <span className="old">{fmt(product.oldPrice)}</span> : null}
        </div>
        <div className="actions">
          {out ? (
            <button className="btn btn-ghost btn-sm" disabled>{t("card.unavailable")}</button>
          ) : (
            <button className={`btn btn-primary btn-sm${pulse ? " added" : ""}`} onClick={handleAdd}>
              <Icon name="plus" size={17} stroke={2.2} />
              {t("card.add")}
            </button>
          )}
        </div>
      </div>
    </TiltCard>
  );
}
