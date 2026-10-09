import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { useI18n } from "../../i18n/I18nContext";
import Icon from "../Icon";

// مشهد "صندوق الهدية": إطارات مصيّرة مسبقاً (scripts/render-sequence) تُرسم على canvas حسب التمرير،
// بنفس تقنية مواقع المنتجات السينمائية. نسخة أفقية للحاسوب ونسخة عمودية للهاتف.
const SETS = {
  d: { n: 120, dir: "seq/d/" },
  m: { n: 90, dir: "seq/m/" },
};
const pickSet = () => (typeof window !== "undefined" && window.innerWidth / window.innerHeight < 0.85 ? "m" : "d");
const src = (set, i) => `${import.meta.env.BASE_URL}${SETS[set].dir}${String(i).padStart(3, "0")}.webp`;

// ترتيب تحميل تدريجي: إطار كل 8 ثم كل 4 ثم كل 2 ثم الباقي — المشهد يعمل مبكراً ويتنعّم تدريجياً
function loadOrder(n) {
  const seen = new Set(); const order = [];
  for (const step of [8, 4, 2, 1]) for (let i = 0; i < n; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
  if (!seen.has(n - 1)) order.push(n - 1);
  return order;
}

function Caption({ progress, range, children, className = "" }) {
  const [a, b] = range;
  const opacity = useTransform(progress, [a, a + 0.05, b - 0.05, b], [0, 1, 1, b >= 1 ? 1 : 0]);
  const y = useTransform(progress, [a, a + 0.06], [26, 0]);
  const blur = useTransform(progress, [a, a + 0.05], [8, 0]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);
  return <motion.div className={`seq-cap ${className}`} style={{ opacity, y, filter }}>{children}</motion.div>;
}

export default function ScrollSequence() {
  const { t } = useI18n();
  const ref = useRef(null);
  const canvasRef = useRef(null);
  const reduce = useReducedMotion();
  const [set] = useState(pickSet);
  const frames = useRef([]);
  const want = useRef(0);
  const drawn = useRef(-1);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const n = SETS[set].n;

  const draw = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    // أقرب إطار محمّل للإطار المطلوب
    let i = want.current, img = frames.current[i];
    for (let d = 1; (!img || !img.complete || !img.naturalWidth) && d < n; d++) {
      img = frames.current[i - d] || frames.current[i + d];
      if (img && img.complete && img.naturalWidth) break;
      img = null;
    }
    if (!img || !img.naturalWidth) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; drawn.current = -1; }
    const key = img.src;
    if (drawn.current === key) return;
    drawn.current = key;
    const ctx = cv.getContext("2d");
    const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
    ctx.fillStyle = "#08070d";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  };

  useEffect(() => {
    const total = reduce ? 1 : n;
    frames.current = new Array(total);
    const first = new Image();
    first.decoding = "async";
    first.src = src(set, reduce ? n - 1 : 0);
    first.onload = draw;
    frames.current[0] = first;
    if (reduce) return undefined;

    let started = false, cancelled = false;
    const startLoading = () => {
      if (started) return; started = true;
      const order = loadOrder(n);
      let k = 0;
      const next = () => {
        if (cancelled || k >= order.length) return;
        const i = order[k++];
        if (frames.current[i]) return next();
        const img = new Image();
        img.decoding = "async";
        img.onload = img.onerror = () => { if (Math.abs(i - want.current) < 6) draw(); next(); };
        img.src = src(set, i);
        frames.current[i] = img;
      };
      for (let c = 0; c < 4; c++) next(); // 4 طلبات متوازية
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) startLoading(); }, { rootMargin: "150% 0px" });
    io.observe(ref.current);
    const onResize = () => { drawn.current = -1; draw(); };
    window.addEventListener("resize", onResize);
    return () => { cancelled = true; io.disconnect(); window.removeEventListener("resize", onResize); };
  }, [set, n, reduce]);

  useMotionValueEvent(p, "change", (v) => {
    if (reduce) return;
    want.current = Math.min(n - 1, Math.max(0, Math.round(v * (n - 1))));
    requestAnimationFrame(draw);
  });

  const hint = useTransform(p, [0, 0.06], [1, 0]);
  const bar = useTransform(p, [0, 1], ["0%", "100%"]);

  const finale = (
    <>
      <span className="seq-kicker">{t("cine.brand")}</span>
      <h2>{t("seq.t4")}</h2>
      <Link to="/shop" className="btn btn-primary btn-lg glow"><Icon name="bag" size={19} />{t("seq.b4")}</Link>
    </>
  );

  if (reduce) {
    return (
      <section className="seq seq-static">
        <canvas ref={canvasRef} className="seq-canvas" aria-hidden="true" />
        <div className="seq-caps"><div className="seq-cap last">{finale}</div></div>
      </section>
    );
  }

  return (
    <section className="seq" ref={ref}>
      <div className="seq-sticky">
        <canvas ref={canvasRef} className="seq-canvas" aria-hidden="true" />
        <div className="seq-scrim" />
        <div className="seq-caps">
          <Caption progress={p} range={[0, 0.2]}>
            <span className="seq-kicker">{t("seq.k1")}</span>
            <h2>{t("seq.t1")}</h2>
          </Caption>
          <Caption progress={p} range={[0.22, 0.44]}><h2 className="seq-big">{t("seq.t2")}</h2></Caption>
          <Caption progress={p} range={[0.48, 0.74]}>
            <span className="seq-kicker">{t("seq.k3")}</span>
            <h2>{t("seq.t3")}</h2>
          </Caption>
          <Caption progress={p} range={[0.8, 1]} className="last">{finale}</Caption>
        </div>
        <motion.div className="seq-hint" style={{ opacity: hint }}>{t("seq.hint")} <span aria-hidden="true">↓</span></motion.div>
        <div className="seq-progress"><motion.span style={{ width: bar }} /></div>
        <div className="cine-grain" />
      </div>
    </section>
  );
}
