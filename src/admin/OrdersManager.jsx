import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ORDER_STATUSES, normPhone } from "../lib/orders";

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
  const [blocked, setBlocked] = useState(() => new Map()); // رقم موحّد → السبب
  const [blockReady, setBlockReady] = useState(true); // false إذا لم يُشغَّل ملف SQL بعد
  const [showStats, setShowStats] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) setError(error.message);
    else setOrders(data || []);
    const bl = await supabase.from("blocked_phones").select("phone, reason");
    if (bl.error) setBlockReady(false);
    else {
      setBlockReady(true);
      setBlocked(new Map(bl.data.map((r) => [r.phone, r.reason || ""])));
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [refreshSignal]);

  // سجلّ كل زبون حسب رقمه: كم طلب، كم استلم، كم رفض
  const history = useMemo(() => {
    const h = new Map();
    for (const o of orders) {
      const k = normPhone(o.phone);
      const r = h.get(k) || { total: 0, delivered: 0, refused: 0, cancelled: 0 };
      r.total += 1;
      if (o.status === "delivered") r.delivered += 1;
      if (o.status === "refused") r.refused += 1;
      if (o.status === "cancelled") r.cancelled += 1;
      h.set(k, r);
    }
    return h;
  }, [orders]);

  // سجلّ الزبون بدون الطلب الحالي نفسه
  const pastOf = (o) => {
    const r = history.get(normPhone(o.phone)) || { total: 0, delivered: 0, refused: 0, cancelled: 0 };
    return {
      total: r.total - 1,
      delivered: r.delivered - (o.status === "delivered" ? 1 : 0),
      refused: r.refused - (o.status === "refused" ? 1 : 0),
    };
  };
  const isRisky = (o) => blocked.has(normPhone(o.phone)) || pastOf(o).refused > 0;

  // نسبة الاستلام حسب الولاية (من الطلبيات التي انتهت: مستلمة أو مرفوضة)
  const wilayaStats = useMemo(() => {
    const m = new Map();
    for (const o of orders) {
      const k = o.wilaya || "—";
      const r = m.get(k) || { wilaya: k, total: 0, delivered: 0, refused: 0 };
      r.total += 1;
      if (o.status === "delivered") r.delivered += 1;
      if (o.status === "refused") r.refused += 1;
      m.set(k, r);
    }
    return [...m.values()].sort((a, b) => b.total - a.total);
  }, [orders]);
  const overall = useMemo(() => {
    const d = orders.filter((o) => o.status === "delivered").length;
    const r = orders.filter((o) => o.status === "refused").length;
    return { d, r, rate: d + r ? Math.round((d / (d + r)) * 100) : null };
  }, [orders]);

  const counts = useMemo(() => {
    const c = { all: orders.length };
    ORDER_STATUSES.forEach((s) => { c[s.value] = orders.filter((o) => o.status === s.value).length; });
    c.risky = orders.filter((o) => (o.status === "new" || o.status === "confirmed") && isRisky(o)).length;
    return c;
  }, [orders, history, blocked]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter === "risky") { if (!((o.status === "new" || o.status === "confirmed") && isRisky(o))) return false; }
      else if (filter !== "all" && o.status !== filter) return false;
      if (!qq) return true;
      return [o.ref, o.customer_name, o.phone, o.wilaya, String(o.id)]
        .some((s) => (s || "").toString().toLowerCase().includes(qq));
    });
  }, [orders, filter, q, history, blocked]);

  async function setStatus(id, status) {
    setBusy(id);
    setError("");
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    setBusy(null);
    if (error) setError(error.message);
    else {
      const o = orders.find((x) => x.id === id);
      setOrders((list) => list.map((x) => (x.id === id ? { ...x, status } : x)));
      onChanged?.();
      // زبون رفض طلبيتين أو أكثر → نقترح حظر رقمه
      if (status === "refused" && o && blockReady && !blocked.has(normPhone(o.phone))) {
        const refusedBefore = pastOf(o).refused;
        if (refusedBefore >= 1 && window.confirm(`هذا الرقم (${o.phone}) رفض ${refusedBefore + 1} طلبيات. تحب تحظره؟`)) {
          toggleBlock(o, `رفض ${refusedBefore + 1} طلبيات`);
        }
      }
    }
  }

  async function toggleBlock(o, presetReason) {
    const phone = normPhone(o.phone);
    if (!phone) return;
    setBusy(o.id);
    setError("");
    if (blocked.has(phone)) {
      const { error } = await supabase.from("blocked_phones").delete().eq("phone", phone);
      if (error) setError(error.message);
      else setBlocked((m) => { const n = new Map(m); n.delete(phone); return n; });
    } else {
      const reason = presetReason ?? window.prompt("سبب الحظر (اختياري):", "رفض الاستلام");
      if (reason === null) { setBusy(null); return; }
      const { error } = await supabase.from("blocked_phones").insert({ phone, reason: reason.slice(0, 200) });
      if (error) setError(error.message);
      else setBlocked((m) => new Map(m).set(phone, reason));
    }
    setBusy(null);
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
        <button className={`btn btn-ghost${showStats ? " active" : ""}`} onClick={() => setShowStats((v) => !v)}>📊 إحصائيات الولايات</button>
      </div>

      {!blockReady && !loading && (
        <p className="admin-note">⚠️ لتفعيل حظر الأرقام وحالة «رُفض عند الاستلام»، شغّل الملف <code>supabase/migrate-order-protection.sql</code> مرة واحدة في Supabase.</p>
      )}

      {showStats && (
        <div className="admin-stats">
          <p className="admin-stats-head">
            نسبة الاستلام الإجمالية: <strong>{overall.rate == null ? "—" : `${overall.rate}%`}</strong>
            <span className="admin-sub"> ({overall.d} مستلمة · {overall.r} مرفوضة)</span>
          </p>
          <div className="admin-table-wrap">
            <table className="admin-table admin-stats-table">
              <thead>
                <tr><th>الولاية</th><th>الطلبيات</th><th>مستلمة</th><th>مرفوضة</th><th>نسبة الاستلام</th></tr>
              </thead>
              <tbody>
                {wilayaStats.map((w) => {
                  const done = w.delivered + w.refused;
                  const rate = done ? Math.round((w.delivered / done) * 100) : null;
                  return (
                    <tr key={w.wilaya}>
                      <td>{w.wilaya}</td>
                      <td>{w.total}</td>
                      <td>{w.delivered}</td>
                      <td>{w.refused}</td>
                      <td>
                        {rate == null ? "—" : (
                          <span className={`admin-rate ${rate >= 80 ? "good" : rate >= 60 ? "mid" : "bad"}`}>{rate}%</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
        {counts.risky > 0 && (
          <button className={`admin-chip admin-chip-risk${filter === "risky" ? " active" : ""}`} onClick={() => setFilter("risky")}>
            ⚠️ تحتاج تأكيد ({counts.risky})
          </button>
        )}
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
                  onBlock={blockReady ? () => toggleBlock(o) : null}
                  blockedReason={blocked.get(normPhone(o.phone))}
                  past={pastOf(o)}
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

function CustomerBadges({ past, blockedReason }) {
  return (
    <div className="admin-cbadges">
      {blockedReason !== undefined && (
        <span className="admin-cbadge bad" title={blockedReason || ""}>⛔ رقم محظور{blockedReason ? ` — ${blockedReason}` : ""}</span>
      )}
      {past.refused > 0 && <span className="admin-cbadge bad">رفض {past.refused} {past.refused === 1 ? "طلبية" : "طلبيات"} قبل</span>}
      {past.delivered > 0 && <span className="admin-cbadge good">استلم {past.delivered} {past.delivered === 1 ? "طلبية" : "طلبيات"}</span>}
      {past.total > 0 && !past.refused && !past.delivered && <span className="admin-cbadge">طلب {past.total} {past.total === 1 ? "مرة" : "مرات"} قبل</span>}
    </div>
  );
}

function FragmentRow({ o, isOpen, onToggle, onStatus, onDelete, onBlock, blockedReason, past, busy }) {
  const risky = blockedReason !== undefined || past.refused > 0;
  return (
    <>
      <tr className={`admin-order-row status-${o.status}${risky ? " risky" : ""}`}>
        <td><button className="admin-link" onClick={onToggle}>{isOpen ? "▾" : "▸"} {o.ref || `#${o.id}`}</button></td>
        <td>{fmtDate(o.created_at)}</td>
        <td>
          {o.customer_name}
          <div className="admin-sub"><bdi dir="ltr">{o.phone}</bdi></div>
          <CustomerBadges past={past} blockedReason={blockedReason} />
        </td>
        <td>{o.wilaya}</td>
        <td>{o.total} دج</td>
        <td>
          <select value={o.status} onChange={(e) => onStatus(e.target.value)} disabled={busy} className="admin-status-select">
            {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </td>
        <td>
          <div className="admin-row-actions">
            <a className="btn btn-ghost btn-sm" href={`tel:${o.phone}`}>📞 اتصال</a>
            {onBlock && (
              <button className="btn btn-ghost btn-sm" onClick={onBlock} disabled={busy}>
                {blockedReason !== undefined ? "✅ إلغاء الحظر" : "⛔ حظر"}
              </button>
            )}
            <button className="btn btn-ghost btn-sm admin-danger" onClick={onDelete} disabled={busy}>
              {busy ? "..." : "حذف"}
            </button>
          </div>
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
