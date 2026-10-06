import { useEffect } from "react";
import { STORE_CONFIG } from "../data/config";

function setMeta(selector, attr, value) {
  if (!value) return;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement(selector.startsWith("link") ? "link" : "meta");
    const [, key, keyValue] = selector.match(/\[(\w+)="([^"]+)"\]/);
    el.setAttribute(key, keyValue);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

// مكوّن بدون واجهة — يحدّث عنوان الصفحة، الوصف، Open Graph/Twitter، canonical،
// وبيانات Schema.org JSON-LD (اختياري) في <head> عند تغيّر الصفحة.
// الموقع SPA بدون SSR، فهذا التحديث يحصل بعد تحميل JS — جوجل يقرأه، لكن
// روبوتات معاينة الروابط (واتساب/فيسبوك) التي لا تُنفّذ JS تبقى تعرض بيانات index.html الثابتة.
export default function SEO({ title, description, path = "", jsonLd }) {
  useEffect(() => {
    if (title) document.title = title;
    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);

    const url = `${STORE_CONFIG.siteUrl}/${path}`;
    setMeta('meta[property="og:url"]', "content", url);
    setMeta('link[rel="canonical"]', "href", url);

    const scriptId = "seo-page-jsonld";
    let script = document.getElementById(scriptId);
    if (jsonLd) {
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = scriptId;
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    } else if (script) {
      script.remove();
    }

    return () => {
      const s = document.getElementById(scriptId);
      if (s) s.remove();
    };
  }, [title, description, path, jsonLd]);

  return null;
}
