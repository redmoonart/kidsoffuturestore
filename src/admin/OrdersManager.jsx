import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ORDER_STATUSES } from "../lib/orders";

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString("ar-DZ", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export default function OrdersManager({ refreshSignal = 0, onChanged }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    setLoading(false);
    if (error) setError(error.message);
    else setOrders(data || []);
  }

  useEffect(() => { load(); }, [refreshSignal]);

  const counts = useMemo(() => {
    const c = { all: orders.length };
    ORDER_STATUSES.forEach((s) => { c[s.value] = orders.filter((o) => o.status === s.value).length; });
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!qq) return true;
      return [o.ref, o.customer_name, o.phone, o.wilaya, String(o.id)]
        .some((s) => (s || "").toString().toLowerCase().includes(qq));
    });
  }, [orders, filter, q]);

  async function setStatus(id, status) {
    setBusy(id);
    setError("");
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    setBusy(null);
    if (error) setError(error.message);
    else {
      setOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)));
      onChanged?.();
    }
  }

  // تصدير CSV بصيغة مبسّطة تصلح للاستيراد اليدوي في منصّة شركة التوصيل
  // (الأعمدة شائعة الاستخدام — تحقّق من أسماء الأعمدة الدقيقة التي تطلبها ZR Express عند فتح حسابك التجاري معهم)
  function exportCsv() {
    const header = ["الاسم", "الهاتف", "الولاية", "البلدية/العنوان", "نوع التوصيل", "سعر التوصيل", "المبلغ الإجمالي", "ملاحظات"];
    const rows = filtered.map((o) => [
      o.customer_name,
      o.phone,
      o.wilaya,
      o.address || "",
      o.delivery_type === "office" ? "مكتب" : "منزل",
      o.delivery_price ?? "",
      o.total,
      o.notes || "",
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `طلبات-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete(o) {
    if (!window.confirm(`حذف الطلب ${o.ref || "#" + o.id}؟ لا يمكن التراجع.`)) return;
    setBusy(o.id);
    setError("");
    const { error } = await supabase.from("orders").delete().eq("id", o.id);
    setBusy(null);
    if (error) setError(error.message);
    else {
      setOrders((list) => list.filter((x) => x.id !== o.id));
      onChanged?.();
    }
  }

  return (
    <div dir="rtl">
      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="بحث برقم الطلب أو الاسم أو الهاتف..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="admin-search"
        />
        <button className="btn btn-ghost" onClick={() => { load(); onChanged?.(); }} disabled={loading}>🔄 تحديث</button>
        <button className="btn btn-ghost" onClick={exportCsv} disabled={!filtered.length}>⬇️ تصدير CSV</button>
      </div>

      <div className="admin-order-filters">
        <button className={`admin-chip${filter === "all" ? " active" : ""}`} onClick={() => setFilter("all")}>
          الكل ({counts.all})
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s.value}
            className={`admin-chip${filter === s.value ? " active" : ""}`}
            onClick={() => setFilter(s.value)}
          >
            {s.label} ({counts[s.value] || 0})
          </button>
        ))}
      </div>

      {error && <p className="admin-auth-error">{error}</p>}
      {loading ? (
        <p>جارٍ التحميل...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>التاريخ</th>
                <th>الزبون</th>
                <th>الولاية</th>
                <th>المجموع</th>
                <th>الحالة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <FragmentRow
                  key={o.id}
                  o={o}
                  isOpen={open === o.id}
                  onToggle={() => setOpen(open === o.id ? null : o.id)}
                  onStatus={(s) => setStatus(o.id, s)}
                  onDelete={() => handleDelete(o)}
                  busy={busy === o.id}
                />
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 24 }}>لا توجد طلبات</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FragmentRow({ o, isOpen, onToggle, onStatus, onDelete, busy }) {
  return (
    <>
      <tr className={`admin-order-row status-${o.status}`}>
        <td><button className="admin-link" onClick={onToggle}>{isOpen ? "▾" : "▸"} {o.ref || `#${o.id}`}</button></td>
        <td>{fmtDate(o.created_at)}</td>
        <td>{o.customer_name}<div className="admin-sub">{o.phone}</div></td>
        <td>{o.wilaya}</td>
        <td>{o.total} دج</td>
        <td>
          <select value={o.status} onChange={(e) => onStatus(e.target.value)} disabled={busy} className="admin-status-select">
            {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </td>
        <td className="admin-row-actions">
          <a className="btn btn-ghost btn-sm" href={`tel:${o.phone}`}>📞 اتصال</a>
          <button className="btn btn-ghost btn-sm admin-danger" onClick={onDelete} disabled={busy}>
            {busy ? "..." : "حذف"}
          </button>
        </td>
      </tr>
      {isOpen && (
        <tr className="admin-order-details">
          <td colSpan={7}>
            <ul>
              {(o.items || []).map((it, i) => (
                <li key={i}>{it.name} × {it.qty} = {it.price * it.qty} دج</li>
              ))}
            </ul>
            <p>
              🚚 {o.delivery_type === "office" ? "توصيل للمكتب" : "توصيل للمنزل"}
              {o.delivery_price != null ? ` — ${o.delivery_price} دج` : ""}
            </p>
            {o.address && <p>📍 {o.address}</p>}
            {o.notes && <p>📝 {o.notes}</p>}
          </td>
        </tr>
      )}
    </>
  );
}
