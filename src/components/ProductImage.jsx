import { useState, useEffect } from "react";

// صورة المنتج مع رجوع تلقائي للإيموجي إذا لم تُحمَّل الصورة (رابط معطوب أو شبكة ضعيفة)،
// بدل أن يظهر نص alt بخط ضخم داخل البطاقة
export default function ProductImage({ src, emoji, alt, ...rest }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return <span>{emoji || "🎁"}</span>;
  return <img src={src} alt={alt} onError={() => setFailed(true)} {...rest} />;
}
