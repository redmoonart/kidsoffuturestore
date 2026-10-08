import { STORE_CONFIG } from "../data/config";

// يحوّل رقماً محلياً (يبدأ بـ 0) إلى صيغة دولية لرابط wa.me
export function toWaNumber(local) {
  const digits = String(local || "").replace(/\D/g, "");
  return digits.startsWith("0") ? `213${digits.slice(1)}` : digits;
}

// رابط محادثة واتساب مع المتجر برسالة جاهزة، أو null إذا لم يُضبط رقم واتساب
export function storeWaLink(text) {
  if (!STORE_CONFIG.whatsapp) return null;
  return `https://wa.me/${toWaNumber(STORE_CONFIG.whatsapp)}?text=${encodeURIComponent(text)}`;
}
