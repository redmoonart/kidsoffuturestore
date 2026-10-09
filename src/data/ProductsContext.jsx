import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { restSelect } from "../lib/rest";
import { isStoreCategory } from "./categories";

const ProductsContext = createContext(null);

function fromRow(row) {
  return {
    id: row.id,
    category: row.category,
    subCategory: row.sub_category || undefined,
    emoji: row.emoji || undefined,
    image: row.image || undefined,
    images: Array.isArray(row.images) ? row.images : [],
    stockQty: row.stock_qty ?? undefined,
    name: row.name,
    nameFr: row.name_fr || undefined,
    nameEn: row.name_en || undefined,
    desc: row.description || undefined,
    descFr: row.description_fr || undefined,
    descEn: row.description_en || undefined,
    price: row.price,
    oldPrice: row.old_price || undefined,
    badge: row.badge || undefined,
    ageGroup: row.age_group || undefined,
    stock: row.stock !== false,
  };
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await restSelect("products", "select=*&order=id.asc");
    if (err) {
      setError(err);
    } else {
      setError(null);
      setProducts(data.map(fromRow));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // المتجر يرى فئاته الحالية فقط؛ لوحة الإدارة تستعمل allProducts لترى القديم وتحذفه
  const value = useMemo(
    () => ({ products: products.filter((p) => isStoreCategory(p.category)), allProducts: products, loading, error, refresh }),
    [products, loading, error, refresh]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
