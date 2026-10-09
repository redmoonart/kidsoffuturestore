import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const BLANK = { slug: "", category: "toys", emoji: "", labelAr: "", labelFr: "", labelEn: "", sortOrder: 0 };

function toRow(f) {
  return {
    slug: f.slug.trim(),
    category: f.category,
    emoji: f.emoji || null,
    label_ar: f.labelAr,
    label_fr: f.labelFr || null,
    label_en: f.labelEn || null,
    sort_order: Number(f.sortOrder) || 0,
  };
}

export default function SubcategoryForm({ initial, nextSortOrder, onCancel, onSaved }) {
  const isEdit = !!initial?.slug;
  const [f, setF] = useState(() => ({ ...BLANK, sortOrder: nextSortOrder, ...initial }));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function set(key) {
    return (e) => setF((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const slug = f.slug.trim();
    if (!slug || !f.labelAr) {
      setError("المعرّف (slug) والاسم بالعربية مطلوبان");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError("المعرّف يجب أن يكون حروف إنجليزية صغيرة وأرقام وشرطات فقط، مثال: sport-toys");
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.from("subcategories").upsert(toRow(f));
    setBusy(false);
    if (err) setError(err.message);
    else onSaved();
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit} dir="rtl">
      <h3>{isEdit ? `تعديل الصنف: ${initial.labelAr}` : "إضافة صنف جديد"}</h3>
      <div className="admin-form-grid">
        <label>
          المعرّف (slug — بالإنجليزية، بدون مسافات)
          <input type="text" value={f.slug} onChange={set("slug")} placeholder="sport-toys" disabled={isEdit} required />
        </label>
        <label>
          القسم
          <select value={f.category} onChange={set("category")}>
            <option value="toys">ألعاب</option>
            <option value="kids">منتجات الأطفال</option>
          </select>
        </label>
        <label>
          الإيموجي
          <input type="text" value={f.emoji} onChange={set("emoji")} placeholder="⚽" />
        </label>
      </div>
      <div className="admin-form-grid">
        <label>
          الاسم (عربي)
          <input type="text" value={f.labelAr} onChange={set("labelAr")} required />
        </label>
        <label>
          الاسم (فرنسي)
          <input type="text" value={f.labelFr} onChange={set("labelFr")} />
        </label>
        <label>
          الاسم (إنجليزي)
          <input type="text" value={f.labelEn} onChange={set("labelEn")} />
        </label>
      </div>
      {error && <p className="admin-auth-error">{error}</p>}
      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "جارٍ الحفظ..." : "حفظ"}</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>إلغاء</button>
      </div>
    </form>
  );
}
