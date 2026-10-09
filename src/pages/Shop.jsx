import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import { useProducts } from "../data/ProductsContext";
import { useSubcategories, subcatLabel } from "../data/SubcategoriesContext";
import ProductCard from "../components/ProductCard";
import PageHead from "../components/PageHead";
import Reveal from "../components/Reveal";
import StaggerGrid from "../components/StaggerGrid";
import SEO from "../components/SEO";
import { pName } from "../lib/product";
import { searchProducts } from "../lib/search";
import { isStoreCategory } from "../data/categories";
import Icon from "../components/Icon";
import { AGE_BANDS, minAge, inBand } from "../lib/ages";

const PRICE_BANDS = [
  { id: "lt1000", min: 0, max: 999 },
  { id: "1000-2500", min: 1000, max: 2500 },
  { id: "2500-5000", min: 2501, max: 5000 },
  { id: "gt5000", min: 5001, max: Infinity },
];


// فئة غير معروفة (مثل رابط قديم ?cat=school) تُعرض كـ"الكل"
const readCat = (sp) => (isStoreCategory(sp.get("cat")) ? sp.get("cat") : "all");
export default function Shop() {
  const { t, lang } = useI18n();
  const { products } = useProducts();
  const { subcategories } = useSubcategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cat, setCat] = useState(() => readCat(searchParams));
  const subcat = searchParams.get("subcat") || "";
  const age = searchParams.get("age") || "";
  const price = searchParams.get("price") || "";
  const onlySale = searchParams.get("sale") === "1";
  const onlyStock = searchParams.get("instock") === "1";
  const [q, setQ] = useState("");

  // تحديث فلتر واحد في الرابط مع الإبقاء على الباقي (حتى يمكن مشاركة رابط المتجر مفلتراً)
  function setFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  }
  function clearFilters() {
    const next = new URLSearchParams(searchParams);
    ["age", "price", "sale", "instock"].forEach((k) => next.delete(k));
    setSearchParams(next, { replace: true });
  }
  const hasFilters = !!(age || price || onlySale || onlyStock);
  const [sort, setSort] = useState("default");

  useEffect(() => {
    setCat(readCat(searchParams));
  }, [searchParams]);

  // تغيير الفئة/الصنف يحافظ على فلاتر العمر والسعر المختارة
  function withFilters(base) {
    const next = new URLSearchParams(base);
    ["age", "price", "sale", "instock"].forEach((k) => {
      const v = searchParams.get(k);
      if (v) next.set(k, v);
    });
    return next;
  }

  function handleCat(c) {
    setCat(c);
    setSearchParams(withFilters(c === "all" ? {} : { cat: c }));
  }

  function handleSub(slug) {
    if (!slug) {
      setSearchParams(withFilters(cat === "all" ? {} : { cat }));
      return;
    }
    const sub = subcategories.find((s) => s.slug === slug);
    setSearchParams(withFilters(sub ? { cat: sub.category, subcat: slug } : { subcat: slug }));
  }

  // الأصناف الظاهرة: أصناف الفئة المختارة (أو كل الأصناف)، مع إخفاء الأصناف الفارغة
  const visibleSubs = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      if (p.subCategory) counts[p.subCategory] = (counts[p.subCategory] || 0) + 1;
    });
    return subcategories
      .filter((s) => (cat === "all" || s.category === cat) && counts[s.slug])
      .map((s) => ({ ...s, count: counts[s.slug] }));
  }, [subcategories, products, cat]);

  const list = useMemo(() => {
    let l = products.slice();
    if (cat !== "all") l = l.filter((p) => p.category === cat);
    if (subcat) l = l.filter((p) => p.subCategory === subcat);
    if (age) {
      const b = AGE_BANDS.find((x) => x.id === age);
      if (b) l = l.filter((p) => inBand(p, b));
    }
    if (price) {
      const b = PRICE_BANDS.find((x) => x.id === price);
      if (b) l = l.filter((p) => p.price >= b.min && p.price <= b.max);
    }
    if (onlySale) l = l.filter((p) => p.oldPrice && p.oldPrice > p.price);
    if (onlyStock) l = l.filter((p) => p.stock !== false);
    if (q.trim()) l = searchProducts(l, q);
    if (sort === "price-asc") l.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") l.sort((a, b) => b.price - a.price);
    else if (sort === "name") l.sort((a, b) => pName(a, lang).localeCompare(pName(b, lang), lang));
    return l;
  }, [products, cat, subcat, q, sort, lang, age, price, onlySale, onlyStock]);

  const hasAges = useMemo(() => products.some((p) => minAge(p) != null), [products]);

  return (
    <>
      <SEO title={`${t("shop.head_title")} — Kids of the Future`} description={t("shop.head_sub")} path="shop" />
      <PageHead title={t("shop.head_title")} subtitle={t("shop.head_sub")} chips={["🧸", "🍼", "🚗", "👕"]} />
      <section className="section">
        <div className="wrap">
          <Reveal className="shop-toolbar">
            <div className="chips">
              <button className={`chip${cat === "all" ? " active" : ""}`} onClick={() => handleCat("all")}>
                {t("shop.chip_all")}
              </button>
              <button className={`chip${cat === "toys" ? " active" : ""}`} onClick={() => handleCat("toys")}>
                {t("shop.chip_toys")}
              </button>
              <button className={`chip${cat === "kids" ? " active" : ""}`} onClick={() => handleCat("kids")}>
                {t("shop.chip_kids")}
              </button>
            </div>
            {visibleSubs.length > 0 && (
              <div className="chips subchips" role="group" aria-label={t("shop.subcats")}>
                <button className={`chip chip-sm${!subcat ? " active" : ""}`} onClick={() => handleSub("")}>
                  {t("shop.chip_all")}
                </button>
                {visibleSubs.map((s) => (
                  <button
                    key={s.slug}
                    className={`chip chip-sm${subcat === s.slug ? " active" : ""}`}
                    onClick={() => handleSub(s.slug)}
                  >
                    {s.emoji ? `${s.emoji} ` : ""}{subcatLabel(s, lang)} <span className="chip-count">{s.count}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="filter-rows">
              {hasAges && (
                <div className="filter-row" role="group" aria-label={t("shop.f_age")}>
                  <span className="filter-label"><Icon name="baby" size={16} />{t("shop.f_age")}</span>
                  {AGE_BANDS.map((b) => (
                    <button key={b.id} className={`chip chip-sm${age === b.id ? " active" : ""}`} aria-pressed={age === b.id} onClick={() => setFilter("age", age === b.id ? "" : b.id)}>
                      {t("shop.age_band", { v: b.id })}
                    </button>
                  ))}
                </div>
              )}
              <div className="filter-row" role="group" aria-label={t("shop.f_price")}>
                <span className="filter-label"><Icon name="wallet" size={16} />{t("shop.f_price")}</span>
                {PRICE_BANDS.map((b) => (
                  <button key={b.id} className={`chip chip-sm${price === b.id ? " active" : ""}`} aria-pressed={price === b.id} onClick={() => setFilter("price", price === b.id ? "" : b.id)}>
                    {t(`shop.price_${b.id}`)}
                  </button>
                ))}
              </div>
              <div className="filter-row">
                <button className={`chip chip-sm${onlySale ? " active" : ""}`} aria-pressed={onlySale} onClick={() => setFilter("sale", onlySale ? "" : "1")}><Icon name="tag" size={15} />{t("shop.f_sale")}</button>
                <button className={`chip chip-sm${onlyStock ? " active" : ""}`} aria-pressed={onlyStock} onClick={() => setFilter("instock", onlyStock ? "" : "1")}><Icon name="check" size={15} stroke={2.4} />{t("shop.f_instock")}</button>
                {hasFilters && <button className="filter-clear" onClick={clearFilters}><Icon name="x" size={14} />{t("shop.f_clear")}</button>}
              </div>
            </div>
            <div className="toolbar-tools">
              <div className="search-box">
                <input type="search" placeholder={t("shop.search_ph")} value={q} onChange={(e) => setQ(e.target.value)} />
                <span className="ic" aria-hidden="true"><Icon name="search" size={18} /></span>
              </div>
              <div className="sort-control">
                <span className="sort-ic" aria-hidden="true"><Icon name="sort" size={16} /></span>
                <select className="select" aria-label="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="default">{t("shop.sort_default")}</option>
                  <option value="price-asc">{t("shop.sort_price_asc")}</option>
                  <option value="price-desc">{t("shop.sort_price_desc")}</option>
                  <option value="name">{t("shop.sort_name")}</option>
                </select>
              </div>
            </div>
          </Reveal>
          <p style={{ color: "var(--muted)", marginBottom: 16 }}>
            <span>{list.length} {t("shop.count_unit")}</span>
          </p>
          {list.length ? (
            <StaggerGrid className="products-grid">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </StaggerGrid>
          ) : (
            <div className="empty-state" style={{ gridColumn: "1/-1" }}>
              <div className="em em-ic"><Icon name="search" size={36} stroke={1.5} /></div>
              <h3>{t("shop.no_results_t")}</h3>
              <p>{t("shop.no_results_p")}</p>
              {hasFilters && <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={clearFilters}><Icon name="x" size={16} />{t("shop.f_clear")}</button>}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
