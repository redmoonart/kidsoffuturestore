import { useState, useMemo, useEffect } from "react";
import { useProducts } from "../data/ProductsContext";
import { useSubcategories } from "../data/SubcategoriesContext";
import { useAdminAuth } from "../admin/AdminAuthContext";
import { supabase } from "../lib/supabaseClient";
import ProductForm from "../admin/ProductForm";
import SubcategoriesManager from "../admin/SubcategoriesManager";
import OrdersManager from "../admin/OrdersManager";
import { useNewOrdersAlert } from "../admin/useNewOrdersAlert";
import { onInstallAvailable, promptInstall, isStandalone } from "../admin/pwa";

export default function AdminDashboard() {
  const { products, loading, refresh } = useProducts();
  const { subcategories } = useSubcategories();
  const { signOut } = useAdminAuth();
  const [tab, setTab] = useState("orders"); // "orders" | "products" | "categories"
  const [editing, setEditing] = useState(null); // null = closed, "new" = new, product = editing
  const [q, setQ] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const { newCount, tick, recheck } = useNewOrdersAlert();
  const [canInstall, setCanInstall] = useState(false);
  const [notifPerm, setNotifPerm] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  useEffect(() => onInstallAvailable(setCanInstall), []);

  async function enableNotifications() {
    if (typeof Notification === "undefined") return;
    const p = await Notification.requestPermission();
    setNotifPerm(p);
  }

  const subcatLabelBySlug = useMemo(
    () => Object.fromEntries(subcategories.map((s) => [s.slug, s.labelAr])),
    [subcategories]
  );

  const nextId = useMemo(() => (products.length ? Math.max(...products.map((p) => p.id)) + 1 : 101), [products]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return products;
    return products.filter((p) =>
      [p.name, p.nameFr, p.nameEn, String(p.id)].some((s) => (s || "").toString().toLowerCase().includes(qq))
    );
  }, [products, q]);

  function handleSaved() {
    setEditing(null);
    refresh();
  }

  async function handleDelete(id) {
    if (!window.confirm(`حذف المنتج #${id}؟ لا يمكن التراجع.`)) return;
    setDeleteError("");
    setDeleteBusy(id);
    const { error } = await supabase.from("products").delete().eq("id", id);
    setDeleteBusy(null);
    if (error) setDeleteError(error.message);
    else refresh();
  }

  return (
    <div className="admin-dashboard" dir="rtl">
      <div className="admin-topbar">
        <h1>🛍️ إدارة متجري</h1>
        <div className="admin-topbar-actions">
          {canInstall && !isStandalone() && (
            <button className="btn btn-primary btn-sm" onClick={promptInstall}>📲 تثبيت التطبيق</button>
          )}
          {notifPerm === "default" && (
            <button className="btn btn-ghost btn-sm" onClick={enableNotifications}>🔔 تفعيل التنبيهات</button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={signOut}>تسجيل الخروج</button>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab${tab === "orders" ? " active" : ""}`}
          onClick={() => { setTab("orders"); setEditing(null); }}
        >
          الطلبات{newCount > 0 && <span className="admin-badge">{newCount}</span>}
        </button>
        <button
          className={`admin-tab${tab === "products" ? " active" : ""}`}
          onClick={() => { setTab("products"); setEditing(null); }}
        >
          المنتجات
        </button>
        <button
          className={`admin-tab${tab === "categories" ? " active" : ""}`}
          onClick={() => { setTab("categories"); setEditing(null); }}
        >
          الأصناف
        </button>
      </div>

      {tab === "orders" ? (
        <OrdersManager refreshSignal={tick} onChanged={recheck} />
      ) : tab === "categories" ? (
        <SubcategoriesManager />
      ) : editing ? (
        <ProductForm
          initial={editing === "new" ? null : editing}
          nextId={nextId}
          onCancel={() => setEditing(null)}
          onSaved={handleSaved}
        />
      ) : (
        <>
          <div className="admin-toolbar">
            <input
              type="search"
              placeholder="بحث بالاسم أو الرقم..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="admin-search"
            />
            <button className="btn btn-primary" onClick={() => setEditing("new")}>+ منتج جديد</button>
          </div>

          {deleteError && <p className="admin-auth-error">{deleteError}</p>}
          {loading ? (
            <p>جارٍ التحميل...</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th></th>
                    <th>الاسم</th>
                    <th>الفئة</th>
                    <th>السعر</th>
                    <th>المخزون</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>
                        {p.image ? <img src={p.image} alt="" className="admin-thumb" /> : <span className="admin-emoji">{p.emoji || "🎁"}</span>}
                      </td>
                      <td>{p.name}</td>
                      <td>
                        {p.category === "toys" ? "ألعاب" : "مدرسي"}
                        {p.subCategory ? ` — ${subcatLabelBySlug[p.subCategory] || p.subCategory}` : ""}
                      </td>
                      <td>
                        {p.price} دج
                        {p.oldPrice ? <span className="admin-old-price"> ({p.oldPrice})</span> : null}
                      </td>
                      <td>{p.stock === false ? "❌ نفذ" : "✅ متوفر"}</td>
                      <td className="admin-row-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(p)}>تعديل</button>
                        <button
                          className="btn btn-ghost btn-sm admin-danger"
                          onClick={() => handleDelete(p.id)}
                          disabled={deleteBusy === p.id}
                        >
                          {deleteBusy === p.id ? "..." : "حذف"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: 24 }}>لا توجد نتائج</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
