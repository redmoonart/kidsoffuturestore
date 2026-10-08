// الولاية التي يختارها الزبون في صفحة المنتج تُحفظ وتُملأ تلقائياً في السلة
const KEY = "kof_wilaya";

export function getSavedWilaya() {
  try {
    return localStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
}

export function saveWilaya(code) {
  try {
    if (code) localStorage.setItem(KEY, String(code));
  } catch {
    /* localStorage unavailable */
  }
}

// الولايات البعيدة (أغلى تعريفة توصيل) تأخذ وقتاً أطول
export const isFarWilaya = (w) => (w?.home ?? 0) >= 1100;
