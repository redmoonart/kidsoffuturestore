import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { restSelect } from "../lib/rest";
import { isStoreCategory } from "./categories";

const SubcategoriesContext = createContext(null);

function fromRow(row) {
  return {
    slug: row.slug,
    category: row.category,
    emoji: row.emoji || undefined,
    labelAr: row.label_ar,
    labelFr: row.label_fr || undefined,
    labelEn: row.label_en || undefined,
    sortOrder: row.sort_order ?? 0,
  };
}

export function SubcategoriesProvider({ children }) {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await restSelect("subcategories", "select=*&order=sort_order.asc");
    if (err) {
      setError(err);
    } else {
      setError(null);
      setSubcategories(data.map(fromRow));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ subcategories: subcategories.filter((s) => isStoreCategory(s.category)), loading, error, refresh }),
    [subcategories, loading, error, refresh]
  );

  return <SubcategoriesContext.Provider value={value}>{children}</SubcategoriesContext.Provider>;
}

export function useSubcategories() {
  const ctx = useContext(SubcategoriesContext);
  if (!ctx) throw new Error("useSubcategories must be used within SubcategoriesProvider");
  return ctx;
}

export function subcatLabel(sub, lang) {
  if (!sub) return "";
  if (lang === "fr") return sub.labelFr || sub.labelAr;
  if (lang === "en") return sub.labelEn || sub.labelAr;
  return sub.labelAr;
}
