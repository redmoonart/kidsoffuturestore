// أيقونات طين ثلاثية الأبعاد (تيراكوتا وزيتوني) للمساحات الكبيرة: الفئات، الأعمار، البطاقات، الحالات الفارغة.
// الأزرار الصغيرة تبقى بالأيقونات الخطّية (Icon) لأن هذه تفقد وضوحها تحت ~32px.
const FILES = import.meta.glob("../assets/icons3d/*.webp", { eager: true, import: "default" });
const SRC = Object.fromEntries(Object.entries(FILES).map(([p, url]) => [p.split("/").pop().replace(".webp", ""), url]));

export const has3D = (name) => Boolean(SRC[name]);

export default function Icon3D({ name, size = 72, className = "" }) {
  const src = SRC[name];
  if (!src) return null;
  return (
    <span className={`ic3d-box ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <img className="ic3d" src={src} alt="" loading="lazy" decoding="async" />
    </span>
  );
}
