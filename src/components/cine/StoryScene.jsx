import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useI18n } from "../../i18n/I18nContext";
import dani from "../../assets/hero-dani.webp";
import dani420 from "../../assets/hero-dani-420.webp";

const LINES = ["cine.l1", "cine.l2", "cine.l3", "cine.l4"];

function Line({ k, i, progress }) {
  const { t } = useI18n();
  // كل سطر يظهر في نافذته من التمرير ثم يخفت قليلاً عندما يأتي الذي بعده
  const a = 0.1 + i * 0.17;
  const opacity = useTransform(progress, [a, a + 0.08, a + 0.2, 0.95], [0, 1, i === 3 ? 1 : 0.4, i === 3 ? 1 : 0.4]);
  const y = useTransform(progress, [a, a + 0.1], [34, 0]);
  const blur = useTransform(progress, [a, a + 0.09], [10, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  return (
    <motion.p className={`cine-line${i === 3 ? " last" : ""}`} style={{ opacity, y, filter }}>
      {t(k)}
    </motion.p>
  );
}

// مشهد سردي مثبّت: ليل يتحول إلى شروق، داني يخرج من الظل إلى الضوء، وجمل تظهر كترجمة فيلم
export default function StoryScene() {
  const { t } = useI18n();
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const warm = useTransform(p, [0.05, 0.85], [0, 1]);
  const bright = useTransform(p, [0.08, 0.8], [0.32, 1]);
  const glow = useTransform(p, [0.08, 0.8], [0.9, 0.35]);
  const daniFilter = useTransform([bright, glow], ([b, g]) =>
    `brightness(${b}) drop-shadow(0 0 28px rgba(255,170,90,${g})) drop-shadow(0 30px 40px rgba(0,0,0,.35))`);
  const daniScale = useTransform(p, [0, 1], [1.06, 0.94]);
  const daniY = useTransform(p, [0, 1], [10, -24]);
  const sunY = useTransform(p, [0.1, 0.9], ["40%", "-8%"]);
  const sunOpacity = useTransform(p, [0.1, 0.5], [0, 1]);

  if (reduce) {
    return (
      <section className="cine-story static">
        <div className="wrap cine-story-static">
          <img src={dani420} alt="" width="420" height="640" loading="lazy" />
          <div>{LINES.map((k) => <p key={k} className="cine-line">{t(k)}</p>)}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="cine-story" ref={ref}>
      <div className="cine-sticky">
        <div className="cine-night" />
        <motion.div className="cine-dawn" style={{ opacity: warm }} />
        <motion.div className="cine-sun" style={{ y: sunY, opacity: sunOpacity }} />
        <div className="cine-dust" />
        <div className="cine-vignette" />
        <div className="wrap cine-story-stage">
          <motion.img
            className="cine-story-dani"
            src={dani}
            srcSet={`${dani420} 420w, ${dani} 765w`}
            sizes="(max-width: 640px) 52vw, 30vw"
            alt=""
            width="765"
            height="1165"
            loading="lazy"
            style={{ scale: daniScale, y: daniY, filter: daniFilter }}
          />
          <div className="cine-lines">
            {LINES.map((k, i) => <Line key={k} k={k} i={i} progress={p} />)}
          </div>
        </div>
        <div className="cine-grain" />
      </div>
    </section>
  );
}
