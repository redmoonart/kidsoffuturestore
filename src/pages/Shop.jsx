import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import { useProducts } from "../data/ProductsContext";
import { useSubcategories, subcatLabel } from "../data/SubcategoriesContext";
import ProductCard from "../components/ProductCard";
import PageHead from "../components/PageHead";
import Reveal from "../components/Reveal";
import StaggerGrid from "../components/StaggerGrid";
import { pName } from "../lib/product";

export default function Shop() {
  const { t, lang } = useI18n();
  const { products } = useProducts();
  const { subcategories } = useSubcategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cat, setCat] = useState(searchParams.get("cat") || "all");
  const subcat = searchParams.get("subcat") || "";
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("default");

  useEffect(() => {
    setCat(searchParams.get("cat") || "all");
  }, [searchParams]);

  function handleCat(c) {
    setCat(c);
    setSearchParams(c === "all" ? {} : { cat: c });
  }

  function handleSub(slug) {
    if (!slug) {
      setSearchParams(cat === "all" ? {} : { cat });
      return;
    }
    const sub = subcategories.find((s) => s.slug === slug);
    setSearchParams(sub ? { cat: sub.category, subcat: slug } : { subcat: slug });
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
    if (q) {
      const qq = q.trim().toLowerCase();
      l = l.filter((p) =>
        [p.name, p.nameFr, p.nameEn, p.desc, p.descFr, p.descEn].some((s) => (s || "").toLowerCase().includes(qq))
      );
    }
    if (sort === "price-asc") l.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") l.sort((a, b) => b.price - a.price);
    else if (sort === "name") l.sort((a, b) => pName(a, lang).localeCompare(pName(b, lang), lang));
    return l;
  }, [products, cat, subcat, q, sort, lang]);

  return (
    <>
      <PageHead title={t("shop.head_title")} subtitle={t("shop.head_sub")} chips={["🧸", "🎒", "🚗", "✏️"]} />
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
              <button className={`chip${cat === "school" ? " active" : ""}`} onClick={() => handleCat("school")}>
                {t("shop.chip_school")}
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
            <div className="toolbar-tools">
              <div className="search-box">
                <input type="search" placeholder={t("shop.search_ph")} value={q} onChange={(e) => setQ(e.target.value)} />
                <span className="ic" aria-hidden="true">🔍</span>
              </div>
              <div className="sort-control">
                <span className="sort-ic" aria-hidden="true">⇅</span>
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
              <div className="em">🔍</div>
              <h3>{t("shop.no_results_t")}</h3>
              <p>{t("shop.no_results_p")}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
