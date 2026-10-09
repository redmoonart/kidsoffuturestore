import { useEffect, useRef } from "react";
import { canRun3D } from "../lib/deviceCapability";

// طبقة الألعاب ثلاثية الأبعاد فوق خلفية الهيرو. لا تُحمَّل three.js إلا بعد جاهزية الصفحة
// وعلى الأجهزة القادرة فقط؛ غير ذلك يبقى الهيرو الثابت كما هو.
export default function HeroToys({ sectionRef, pointerX, pointerY, scroll }) {
  const hostRef = useRef(null);

  useEffect(() => {
    if (!canRun3D()) return undefined;
    let api = null;
    let cancelled = false;
    const unsubs = [];

    const start = () =>
      import("../three/toyScene").then(({ mountToyScene }) => {
        if (cancelled || !hostRef.current) return;
        try {
          api = mountToyScene(hostRef.current);
        } catch {
          return; // WebGL فشل — نبقى على الهيرو الثابت
        }
        hostRef.current.classList.add("on");
        const sync = () => api.setPointer(pointerX.get(), pointerY.get());
        unsubs.push(pointerX.on("change", sync), pointerY.on("change", sync));
        api.setScroll(scroll.get());
        unsubs.push(scroll.on("change", (v) => api.setScroll(v)));

        const section = sectionRef.current;
        const io = new IntersectionObserver(([e]) => api.setActive(e.isIntersecting && !document.hidden));
        io.observe(section);
        const onVis = () => api.setActive(!document.hidden && section.getBoundingClientRect().bottom > 0);
        document.addEventListener("visibilitychange", onVis);
        // نقرة على لعبة تجعلها تقفز وتدور (اللوحة نفسها لا تلتقط النقرات حتى تبقى الأزرار تعمل)
        const onDown = (e) => { if (!e.target.closest("a, button, input, select")) api.poke(e.clientX, e.clientY); };
        section.addEventListener("pointerdown", onDown);
        unsubs.push(() => io.disconnect(), () => document.removeEventListener("visibilitychange", onVis),
          () => section.removeEventListener("pointerdown", onDown));
      }).catch(() => {});

    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(start, { timeout: 2500 })
      : window.setTimeout(start, 900);

    return () => {
      cancelled = true;
      if (window.cancelIdleCallback && window.requestIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      unsubs.forEach((u) => u());
      api?.destroy();
    };
  }, [sectionRef, pointerX, pointerY, scroll]);

  return <div className="hero-toys" ref={hostRef} aria-hidden="true" />;
}
