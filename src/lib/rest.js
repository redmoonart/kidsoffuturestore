// وصول مباشر وخفيف لواجهة Supabase REST للمتجر (قراءة المنتجات/الأصناف وإرسال الطلب).
// مكتبة @supabase/supabase-js الكاملة (~220KB) تُحمَّل فقط في لوحة الإدارة.
const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = () => ({ apikey: KEY, Authorization: `Bearer ${KEY}` });

export async function restSelect(table, query) {
  if (!URL || !KEY) return { data: null, error: "Supabase env vars are missing" };
  try {
    const res = await fetch(`${URL}/rest/v1/${table}?${query}`, { headers: headers() });
    if (!res.ok) return { data: null, error: `HTTP ${res.status}` };
    return { data: await res.json(), error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

export async function restInsert(table, row) {
  if (!URL || !KEY) return { error: "Supabase env vars are missing" };
  try {
    const res = await fetch(`${URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...headers(), "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(row),
    });
    if (!res.ok) return { error: `HTTP ${res.status}: ${await res.text()}` };
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}
