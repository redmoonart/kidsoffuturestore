import { restInsert } from "./rest";

// رقم طلب قصير يظهر للزبون بعد الطلب وفي تطبيق "إدارة متجري" (مثال: KF-M3X9A7-4Q)
export function makeOrderRef() {
  const time = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 4).toUpperCase();
  return `KF-${time}-${rand}`;
}

// يحفظ الطلب في جدول orders. لا نطلب .select() لأن الزائر لا يملك صلاحية القراءة.
// يرجع true عند النجاح و false عند الفشل (لا يرمي خطأ).
export async function saveOrder(order) {
  const { error } = await restInsert("orders", order);
  if (error) {
    console.error("Order save failed:", error);
    return false;
  }
  return true;
}

export const ORDER_STATUSES = [
  { value: "new", label: "🆕 جديد" },
  { value: "confirmed", label: "✅ مؤكد" },
  { value: "shipped", label: "🚚 مشحون" },
  { value: "delivered", label: "📦 تم التسليم" },
  { value: "refused", label: "↩️ رُفض عند الاستلام" },
  { value: "cancelled", label: "❌ ملغى" },
];

// توحيد رقم الهاتف لمقارنة الزبائن: 0555 12 34 56 و +213555123456 و 213555123456 → 0555123456
export function normPhone(p) {
  let d = String(p || "").replace(/\D/g, "");
  if (d.startsWith("00213")) d = d.slice(5);
  else if (d.startsWith("213") && d.length >= 12) d = d.slice(3);
  if (d.length === 9) d = "0" + d;
  return d;
}
