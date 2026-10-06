import { supabase } from "./supabaseClient";

// يتحقق من كود خصم عبر Supabase ويرجع { ok: true, coupon } أو { ok: false, reason, minOrder? }
// reason هو مفتاح ترجمة (يُعرض عبر t(reason)) وليس نصاً جاهزاً
export async function checkCoupon(code, subtotal) {
  try {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .maybeSingle();

    if (error || !data) return { ok: false, reason: "cart.coupon_not_found" };
    if (!data.active) return { ok: false, reason: "cart.coupon_inactive" };
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { ok: false, reason: "cart.coupon_expired" };
    }
    if (data.min_order && subtotal < data.min_order) {
      return { ok: false, reason: "cart.coupon_min_order", minOrder: data.min_order };
    }
    return { ok: true, coupon: { code: data.code, type: data.type, value: data.value } };
  } catch {
    // جدول coupons قد لا يكون موجوداً بعد (قبل تشغيل تحديث supabase/setup.sql)
    return { ok: false, reason: "cart.coupon_unavailable" };
  }
}
