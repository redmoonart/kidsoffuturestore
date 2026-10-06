import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useSubcategories } from "../data/SubcategoriesContext";

const BLANK = {
  id: "",
  category: "toys",
  subCategory: "",
  emoji: "",
  image: "",
  images: [],
  name: "",
  nameFr: "",
  nameEn: "",
  desc: "",
  descFr: "",
  descEn: "",
  price: "",
  oldPrice: "",
  badge: "",
  ageGroup: "",
  stock: true,
  stockQty: "",
};

function toRow(f) {
  return {
    id: Number(f.id),
    category: f.category,
    sub_category: f.subCategory || null,
    emoji: f.emoji || null,
    image: f.image || null,
    images: f.images || [],
    name: f.name,
    name_fr: f.nameFr || null,
    name_en: f.nameEn || null,
    description: f.desc || null,
    description_fr: f.descFr || null,
    description_en: f.descEn || null,
    price: Number(f.price),
    old_price: f.oldPrice ? Number(f.oldPrice) : null,
    badge: f.badge || null,
    age_group: f.ageGroup || null,
    stock: !!f.stock,
    stock_qty: f.stockQty === "" || f.stockQty == null ? null : Number(f.stockQty),
  };
}

export default function ProductForm({ initial, nextId, onCancel, onSaved }) {
  const isEdit = !!initial;
  const [f, setF] = useState(() => (initial ? { ...BLANK, ...initial } : { ...BLANK, id: nextId }));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { subcategories } = useSubcategories();
  const subcatOptions = subcategories.filter((s) => s.category === f.category);

  function set(key) {
    return (e) => {
      const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setF((prev) => ({ ...prev, [key]: v }));
    };
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage.from("product-images").upload(path, file);
    if (upErr) {
      setUploading(false);
      setError("فشل رفع الصورة: " + upErr.message);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setF((prev) => ({ ...prev, image: data.publicUrl }));
    setUploading(false);
  }

  async function handleGalleryFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage.from("product-images").upload(path, file);
    if (upErr) {
      setUploading(false);
      setError("فشل رفع الصورة: " + upErr.message);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setF((prev) => ({ ...prev, images: [...(prev.images || []), data.publicUrl] }));
    setUploading(false);
  }

  function removeGalleryImage(i) {
    setF((prev) => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!f.id || !f.name || !f.price) {
      setError("الرقم التعريفي والاسم والسعر مطلوبون");
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.from("products").upsert(toRow(f));
    setBusy(false);
    if (err) setError(err.message);
    else onSaved();
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit} dir="rtl">
      <h3>{isEdit ? `تعديل المنتج #${f.id}` : "إضافة منتج جديد"}</h3>

      <div className="admin-form-grid">
        <label>
          الرقم التعريفي (id)
          <input type="number" value={f.id} onChange={set("id")} disabled={isEdit} required />
        </label>
        <label>
          الفئة
          <select
            value={f.category}
            onChange={(e) => {
              const category = e.target.value;
              setF((prev) => ({
                ...prev,
                category,
                subCategory: subcategories.some((s) => s.category === category && s.slug === prev.subCategory)
                  ? prev.subCategory
                  : "",
              }));
            }}
          >
            <option value="toys">ألعاب</option>
            <option value="school">أدوات مدرسية</option>
          </select>
        </label>
        <label>
          الفئة الفرعية
          <select value={f.subCategory} onChange={set("subCategory")}>
            <option value="">— بدون —</option>
            {subcatOptions.map((s) => (
              <option key={s.slug} value={s.slug}>{s.labelAr}</option>
            ))}
          </select>
        </label>
        <label>
          الإيموجي
          <input type="text" value={f.emoji} onChange={set("emoji")} placeholder="🧸" />
        </label>
        <label className="admin-span-2">
          صورة المنتج (اختياري — إن تُركت فارغة يظهر الإيموجي)
          <div className="admin-image-row">
            {f.image && <img src={f.image} alt="" className="admin-image-preview" />}
            <div className="admin-image-controls">
              <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
              {uploading && <span className="admin-uploading">جارٍ الرفع...</span>}
              {f.image && !uploading && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setF((prev) => ({ ...prev, image: "" }))}>
                  إزالة الصورة
                </button>
              )}
              <input
                type="text"
                value={f.image}
                onChange={set("image")}
                placeholder="أو الصق رابط صورة مباشرة"
                className="admin-image-url"
              />
            </div>
          </div>
        </label>
        <label className="admin-span-2">
          صور إضافية (معرض المنتج — اختياري)
          <div className="admin-gallery-row">
            {(f.images || []).map((src, i) => (
              <div key={i} className="admin-gallery-item">
                <img src={src} alt="" className="admin-thumb" />
                <button type="button" className="admin-gallery-remove" onClick={() => removeGalleryImage(i)} aria-label="إزالة">×</button>
              </div>
            ))}
            <label className="admin-gallery-add">
              <input type="file" accept="image/*" onChange={handleGalleryFileChange} disabled={uploading} hidden />
              + صورة
            </label>
          </div>
        </label>
      </div>

      <div className="admin-form-grid">
        <label>
          الاسم (عربي)
          <input type="text" value={f.name} onChange={set("name")} required />
        </label>
        <label>
          الاسم (فرنسي)
          <input type="text" value={f.nameFr} onChange={set("nameFr")} />
        </label>
        <label>
          الاسم (إنجليزي)
          <input type="text" value={f.nameEn} onChange={set("nameEn")} />
        </label>
      </div>

      <div className="admin-form-grid">
        <label className="admin-span-3">
          الوصف (عربي)
          <textarea rows={2} value={f.desc} onChange={set("desc")} />
        </label>
        <label className="admin-span-3">
          الوصف (فرنسي)
          <textarea rows={2} value={f.descFr} onChange={set("descFr")} />
        </label>
        <label className="admin-span-3">
          الوصف (إنجليزي)
          <textarea rows={2} value={f.descEn} onChange={set("descEn")} />
        </label>
      </div>

      <div className="admin-form-grid">
        <label>
          السعر (دج)
          <input type="number" value={f.price} onChange={set("price")} required min="0" />
        </label>
        <label>
          السعر قبل الخصم (اختياري)
          <input type="number" value={f.oldPrice} onChange={set("oldPrice")} min="0" />
        </label>
        <label>
          شارة (اختياري)
          <input type="text" value={f.badge} onChange={set("badge")} placeholder="جديد / عرض / الأكثر مبيعاً" />
        </label>
        <label>
          الفئة العمرية (اختياري)
          <input type="text" value={f.ageGroup} onChange={set("ageGroup")} placeholder="3+" />
        </label>
        <label>
          الكمية المتبقية (اختياري — لعرض "باقي X فقط")
          <input type="number" value={f.stockQty} onChange={set("stockQty")} min="0" placeholder="بدون تتبّع كمية" />
        </label>
        <label className="admin-checkbox">
          <input type="checkbox" checked={f.stock} onChange={set("stock")} />
          متوفر في المخزون
        </label>
      </div>

      {error && <p className="admin-auth-error">{error}</p>}

      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "جارٍ الحفظ..." : "حفظ"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          إلغاء
        </button>
      </div>
    </form>
  );
}
