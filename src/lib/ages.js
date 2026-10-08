// فئات الأعمار المشتركة بين صفحة المتجر والصفحة الرئيسية
export const AGE_BANDS = [
  { id: "0-2", min: 0, max: 2, emoji: "👶" },
  { id: "3-5", min: 3, max: 5, emoji: "🧒" },
  { id: "6-8", min: 6, max: 8, emoji: "👧" },
  { id: "9+", min: 9, max: 99, emoji: "🧑" },
];

export function minAge(p) {
  const m = /(\d+)/.exec(p.ageGroup || "");
  return m ? Number(m[1]) : null;
}

export function inBand(p, band) {
  const a = minAge(p);
  return a != null && a >= band.min && a <= band.max;
}
