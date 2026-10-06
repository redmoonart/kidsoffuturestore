import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const BLANK = { code: "", type: "percent", value: "", min_order: "", expires_at: "" };

export default function CouponsManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [f, setF] = useState(BLANK);
  const [busy, setBusy] = useState(false);
  const [toggleBusy, setToggleBusy] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(null);

  async function load() {
    setLoading(true);
    const { data, error: err } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setLoading(false);
    if (err) setError(err.message);
    else {
      setError("");
      setCoupons(data || []);
    }
  }

  useEffect(() => { load(); }, []);

  function set(key) {
    return (e) => setF((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!f.code.trim() || !f.value) {
      setError("الكود والقيمة مطلوبان");
      return;
    }
    setBusy(true);
    setError("");
    const { error: err } = await supabase.from("coupons").insert({
      code: f.code.trim().toUpperCase(),
      type: f.type,
      value: Number(f.value),
      min_order: f.min_order ? Number(f.min_order) : null,
      expires_at: f.expires_at ? new Date(f.expires_at).toISOString() : null,
    });
    setBusy(false);
    if (err) setError(err.message);
    else {
      setF(BLANK);
      load();
    }
  }

  async function toggleActive(code, active) {
    setToggleBusy(code);
    const { error: err } = await supabase.from("coupons").update({ active: !active }).eq("code", code);
    setToggleBusy(null);
    if (err) setError(err.message);
    else load();
  }

  async function handleDelete(code) {
    if (!window.confirm(`حذف الكود "${code}"؟`)) return;
    setDeleteBusy(code);
    const { error: err } = await supabase.from("coupons").delete().eq("code", code);
    setDeleteBusy(null);
    if (err) setError(err.message);
    else load();
  }

  return (
    <div dir="rtl">
      <form className="admin-form" onSubmit={handleSubmit}>
        <h3>+ كود خصم جديد</h3>
        <div className="admin-form-grid">
          <label>
            الكود
            <input type="text" value={f.code} onChange={set("code")} placeholder="WELCOME10" required />
          </label>
          <label>
            النوع
            <select value={f.type} onChange={set("type")}>
              <option value="percent">نسبة مئوية %</option>
              <option value="fixed">مبلغ ثابت (دج)</option>
            </select>
          </label>
          <label>
            القيمة
            <input type="number" value={f.value} onChange={set("value")} min="1" required placeholder={f.type === "percent" ? "10" : "500"} />
          </label>
          <label>
            الحد الأدنى للطلب (اختياري)
            <input type="number" value={f.min_order} onChange={set("min_order")} min="0" placeholder="بدون حد أدنى" />
          </label>
          <label>
            تاريخ الانتهاء (اختياري)
            <input type="date" value={f.expires_at} onChange={set("expires_at")} />
          </label>
        </div>
        {error && <p className="admin-auth-error">{error}</p>}
        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "جارٍ الحفظ..." : "إضافة الكود"}</button>
        </div>
      </form>

      <div className="section-sm" />

      {loading ? (
        <p>جارٍ التحميل...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>الكود</th>
                <th>الخصم</th>
                <th>الحد الأدنى</th>
                <th>الانتهاء</th>
                <th>الحالة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.code}>
                  <td dir="ltr" style={{ fontWeight: 700 }}>{c.code}</td>
                  <td>{c.type === "percent" ? `${c.value}%` : `${c.value} دج`}</td>
                  <td>{c.min_order ? `${c.min_order} دج` : "—"}</td>
                  <td>{c.expires_at ? new Date(c.expires_at).toLocaleDateString("ar-DZ") : "—"}</td>
                  <td>
                    <button
                      className={`admin-chip${c.active ? " active" : ""}`}
                      onClick={() => toggleActive(c.code, c.active)}
                      disabled={toggleBusy === c.code}
                    >
                      {c.active ? "✅ فعّال" : "⏸ معطّل"}
                    </button>
                  </td>
                  <td className="admin-row-actions">
                    <button className="btn btn-ghost btn-sm admin-danger" onClick={() => handleDelete(c.code)} disabled={deleteBusy === c.code}>
                      {deleteBusy === c.code ? "..." : "حذف"}
                    </button>
                  </td>
                </tr>
              ))}
              {!coupons.length && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 24 }}>لا توجد أكواد خصم بعد</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
