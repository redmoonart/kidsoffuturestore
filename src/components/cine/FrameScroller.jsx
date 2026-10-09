import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from "framer-motion";

// مشغّل إطارات مع التمرير: يرسم إطارات فيديو مقطّعة مسبقاً (public/seq/<name>-d|m) على canvas
// حسب موضع التمرير — نفس تقنية مواقع المنتجات السينمائية. نسخة أفقية للحاسوب وعمودية للهاتف.
const isPortrait = () => typeof window !== "undefined" && window.innerWidth / window.innerHeight < 0.85;
const frameSrc = (dir, i) => `${import.meta.env.BASE_URL}seq/${dir}/${String(i).padStart(3, "0")}.webp`;

// تحميل تدريجي: إطار كل 8 ثم كل 4 ثم كل 2 ثم الباقي
function loadOrder(n) {
  const seen = new Set(); const order = [];
  for (const step of [8, 4, 2, 1]) for (let i = 0; i < n; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
  if (!seen.has(n - 1)) order.push(n - 1);
  return order;
}

export function Caption({ progress, range, children, className = "" }) {
  const [a, b] = range;
  const first = a <= 0;
  const opacity = useTransform(progress, first ? [0, b - 0.05, b] : [a, a + 0.05, b - 0.05, b],
    first ? [1, 1, 0] : [0, 1, 1, b >= 1 ? 1 : 0]);
  const y = useTransform(progress, first ? [b - 0.05, b] : [a, a + 0.06], first ? [0, -20] : [26, 0]);
  const blur = useTransform(progress, first ? [b - 0.05, b] : [a, a + 0.05], first ? [0, 8] : [8, 0]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);
  const pointerEvents = useTransform(opacity, (v) => (v > 0.5 ? "auto" : "none"));
  return <motion.div className={`seq-cap ${className}`} style={{ opacity, y, filter, pointerEvents }}>{children}</motion.div>;
}

export default function FrameScroller({ name, n, heightVh = 300, eager = false, className = "", staticFrame = 0, renderStatic, children }) {
  const ref = useRef(null);
  const canvasRef = useRef(null);
  const reduce = useReducedMotion();
  const [dir] = useState(() => `${name}-${isPortrait() ? "m" : "d"}`);
  const frames = useRef([]);
  const want = useRef(reduce ? staticFrame : 0);
  const drawnKey = useRef("");
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const draw = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ok = (im) => im && im.complete && im.naturalWidth;
    let img = frames.current[want.current];
    for (let d = 1; !ok(img) && d < n; d++) {
      const a = frames.current[want.current - d], b = frames.current[want.current + d];
      img = ok(a) ? a : ok(b) ? b : null;
    }
    if (!ok(img)) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; drawnKey.current = ""; }
    if (drawnKey.current === img.src) return;
    drawnKey.current = img.src;
    const ctx = cv.getContext("2d");
    const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
    ctx.fillStyle = "#08070d";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  };

  useEffect(() => {
    frames.current = new Array(n);
    const firstIdx = reduce ? staticFrame : 0;
    const first = new Image();
    if (eager) first.fetchPriority = "high";
    first.onload = draw;
    first.src = frameSrc(dir, firstIdx);
    frames.current[firstIdx] = first;
    if (reduce) return undefined;

    let started = false, cancelled = false;
    const start = () => {
      if (started) return; started = true;
      const order = loadOrder(n); let k = 0;
      const next = () => {
        if (cancelled || k >= order.length) return;
        const i = order[k++];
        if (frames.current[i]) { next(); return; }
        const img = new Image();
        img.onload = img.onerror = () => { if (Math.abs(i - want.current) < 6) draw(); next(); };
        img.src = frameSrc(dir, i);
        frames.current[i] = img;
      };
      for (let c = 0; c < 4; c++) next();
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) start(); }, { rootMargin: "120% 0px" });
    io.observe(ref.current);
    const onResize = () => { drawnKey.current = ""; draw(); };
    window.addEventListener("resize", onResize);
    return () => { cancelled = true; io.disconnect(); window.removeEventListener("resize", onResize); };
  }, [dir, n, reduce, eager, staticFrame]);

  useMotionValueEvent(p, "change", (v) => {
    if (reduce) return;
    want.current = Math.min(n - 1, Math.max(0, Math.round(v * (n - 1))));
    requestAnimationFrame(draw);
  });

  const hint = useTransform(p, [0, 0.05], [1, 0]);
  const bar = useTransform(p, [0, 1], ["0%", "100%"]);

  if (reduce) {
    return (
      <section className={`seq seq-static ${className}`}>
        <div className="seq-sticky">
          <canvas ref={canvasRef} className="seq-canvas" aria-hidden="true" />
          <div className="seq-scrim" />
          <div className="seq-caps">{renderStatic?.()}</div>
        </div>
      </section>
    );
  }

  return (
    <section className={`seq ${className}`} ref={ref} style={{ "--seq-h": heightVh }}>
      <div className="seq-sticky">
        <canvas ref={canvasRef} className="seq-canvas" aria-hidden="true" />
        <div className="seq-scrim" />
        <div className="seq-caps">{children(p)}</div>
        <motion.div className="seq-hint" style={{ opacity: hint }} aria-hidden="true">
          <span className="seq-mouse" />
        </motion.div>
        <div className="seq-progress" aria-hidden="true"><motion.span style={{ width: bar }} /></div>
      </div>
    </section>
  );
}
