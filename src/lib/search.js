// بحث يفهم الكتابة العربية بأشكالها المختلفة: أ/إ/آ = ا، ة = ه، ى = ي، بدون تشكيل،
// والفرنسية بدون حركات (é = e). كل كلمات البحث لازم توجد، والنتائج مرتّبة حسب مكان التطابق.
export function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u064B-\u0655\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

function fields(p) {
  return {
    name: normalize([p.name, p.nameFr, p.nameEn].join(" ")),
    rest: normalize([p.desc, p.descFr, p.descEn, p.badge].join(" ")),
  };
}

const cache = new WeakMap();

export function searchProducts(products, query) {
  const tokens = normalize(query).split(" ").filter(Boolean);
  if (!tokens.length) return products;
  const scored = [];
  for (const p of products) {
    let f = cache.get(p);
    if (!f) { f = fields(p); cache.set(p, f); }
    let score = 0;
    let all = true;
    for (const tk of tokens) {
      if (f.name.includes(tk)) score += f.name.startsWith(tk) ? 3 : 2;
      else if (f.rest.includes(tk)) score += 1;
      else { all = false; break; }
    }
    if (all) scored.push([score, p]);
  }
  return scored.sort((a, b) => b[0] - a[0]).map(([, p]) => p);
}
