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
  { value: "cancelled", label: "❌ ملغى" },
];
