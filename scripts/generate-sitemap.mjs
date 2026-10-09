// يولّد public/sitemap.xml قبل البناء: الصفحات الثابتة دائماً + روابط المنتجات
// الحقيقية من Supabase إن توفّرت بيانات الاتصال (متوفرة في CI عبر GitHub Secrets).
// بدون بيانات اتصال (مثلاً أثناء التطوير المحلي) يكتفي بالصفحات الثابتة فقط.
import { writeFileSync } from "node:fs";
import { STORE_CONFIG } from "../src/data/config.js";

const STATIC_PATHS = ["", "shop", "about", "contact", "policies"];

async function fetchProductIds() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.log("⚠ لا توجد بيانات اتصال Supabase — sitemap.xml سيحتوي الصفحات الثابتة فقط.");
    return [];
  }
  try {
    const res = await fetch(`${url}/rest/v1/products?select=id&category=in.(toys,kids)`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    return rows.map((r) => r.id);
  } catch (err) {
    console.log("⚠ فشل جلب المنتجات من Supabase لملف sitemap.xml:", err.message);
    return [];
  }
}

const ids = await fetchProductIds();
const paths = [...STATIC_PATHS, ...ids.map((id) => `product/${id}`)];
const today = new Date().toISOString().slice(0, 10);

const urls = paths
  .map((p) => `  <url>\n    <loc>${STORE_CONFIG.siteUrl}/${p}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

writeFileSync("public/sitemap.xml", xml);
console.log(`✓ Created public/sitemap.xml (${paths.length} URLs, ${ids.length} products)`);
