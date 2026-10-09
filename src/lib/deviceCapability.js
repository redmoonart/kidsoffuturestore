/** narrow viewport — used to scale down parallax/scroll-story movement amplitude on phones */
export function isNarrowViewport() {
  return typeof window !== "undefined" && window.innerWidth < 760;
}

/** هل الجهاز قادر على تشغيل مشهد WebGL الخفيف في الهيرو؟ (?3d=0 / ?3d=1 للتجربة) */
export function canRun3D() {
  if (typeof window === "undefined") return false;
  const force = new URLSearchParams(window.location.search).get("3d");
  if (force === "0") return false;
  if (force !== "1") {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
    const c = navigator.connection;
    if (c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || ""))) return false;
    if ((navigator.hardwareConcurrency || 4) < 4) return false;
    if (navigator.deviceMemory && navigator.deviceMemory < 3) return false;
  }
  try {
    const cv = document.createElement("canvas");
    return !!(cv.getContext("webgl2") || cv.getContext("webgl"));
  } catch {
    return false;
  }
}

/** هل المؤشر دقيق (فأرة)؟ */
export function hasFinePointer() {
  return typeof window !== "undefined" && !!window.matchMedia?.("(pointer: fine)").matches;
}
