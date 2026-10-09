import { useState, useMemo } from "react";
import { useSubcategories } from "../data/SubcategoriesContext";
import { supabase } from "../lib/supabaseClient";
import SubcategoryForm from "./SubcategoryForm";

function Section({ title, category, items, onEdit, onDelete, onAdd, deleteBusy }) {
  return (
    <div className="admin-subcat-section">
      <div className="admin-subcat-section-head">
        <h3>{title}</h3>
        <button className="btn btn-ghost btn-sm" onClick={() => onAdd(category)}>+ إضافة صنف</button>
      </div>
      {items.length ? (
        <ul className="admin-subcat-list">
          {items.map((s) => (
            <li key={s.slug} className="admin-subcat-row">
              <span className="admin-emoji">{s.emoji || "🎁"}</span>
              <span className="admin-subcat-name">{s.labelAr}</span>
              <span className="admin-subcat-slug">{s.slug}</span>
              <span className="admin-row-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => onEdit(s)}>تعديل</button>
                <button
                  className="btn btn-ghost btn-sm admin-danger"
                  onClick={() => onDelete(s.slug)}
                  disabled={deleteBusy === s.slug}
                >
                  {deleteBusy === s.slug ? "..." : "حذف"}
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="admin-subcat-empty">لا توجد أصناف بعد</p>
      )}
    </div>
  );
}

export default function SubcategoriesManager() {
  const { subcategories, loading, refresh } = useSubcategories();
  const [editing, setEditing] = useState(null); // null | "new:<category>" | subcategory object
  const [deleteBusy, setDeleteBusy] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const toys = useMemo(() => subcategories.filter((s) => s.category === "toys"), [subcategories]);
  const kids = useMemo(() => subcategories.filter((s) => s.category === "kids"), [subcategories]);
  const nextSortOrder = subcategories.length
    ? Math.max(...subcategories.map((s) => s.sortOrder)) + 1
    : 1;

  function handleSaved() {
    setEditing(null);
    refresh();
  }

  async function handleDelete(slug) {
    if (!window.confirm(`حذف الصنف "${slug}"؟ المنتجات المرتبطة به ستبقى لكن لن تظهر تحت أي صنف.`)) return;
    setDeleteError("");
    setDeleteBusy(slug);
    const { error } = await supabase.from("subcategories").delete().eq("slug", slug);
    setDeleteBusy(null);
    if (error) setDeleteError(error.message);
    else refresh();
  }

  if (editing) {
    const isNew = typeof editing === "string";
    return (
      <SubcategoryForm
        initial={isNew ? { category: editing.split(":")[1] } : editing}
        nextSortOrder={nextSortOrder}
        onCancel={() => setEditing(null)}
        onSaved={handleSaved}
      />
    );
  }

  return (
    <div dir="rtl">
      {deleteError && <p className="admin-auth-error">{deleteError}</p>}
      {loading ? (
        <p>جارٍ التحميل...</p>
      ) : (
        <>
          <Section
            title="أصناف الألعاب"
            category="toys"
            items={toys}
            onEdit={setEditing}
            onDelete={handleDelete}
            onAdd={(cat) => setEditing(`new:${cat}`)}
            deleteBusy={deleteBusy}
          />
          <Section
            title="أصناف منتجات الأطفال"
            category="kids"
            items={kids}
            onEdit={setEditing}
            onDelete={handleDelete}
            onAdd={(cat) => setEditing(`new:${cat}`)}
            deleteBusy={deleteBusy}
          />
        </>
      )}
    </div>
  );
}
