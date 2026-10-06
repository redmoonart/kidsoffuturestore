import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useI18n, Trans } from "../i18n/I18nContext";
import { isNarrowViewport } from "../lib/deviceCapability";
import heroBgScene from "../assets/hero-bg-scene.webp";
import heroDani from "../assets/hero-dani.webp";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

export default function Hero3D() {
  const { t } = useI18n();
  const sectionRef = useRef(null);
  const [narrow] = useState(isNarrowViewport);
  const reduceMotion = useReducedMotion();
  const amp = reduceMotion ? 0.35 : narrow ? 0.55 : 1;

  const { scrollYProgress: heroScroll } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });

  // الخلفية — تتحرك ببطء شديد (أبطأ طبقة في المشهد)
  const bgY = useTransform(heroScroll, [0, 1], [0, -18 * amp]);

  // Dani — يرتفع تدريجياً، يكبر قليلاً ثم يستقر، دوران خفيف جداً، يخف فقط قرب خروج الهيرو من الشاشة
  const daniY = useTransform(heroScroll, [0, 0.5, 1], [0, -30 * amp, -60 * amp]);
  const daniScale = useTransform(heroScroll, [0, 0.5, 1], [1, 1 + 0.04 * amp, 1 + 0.02 * amp]);
  const daniRotate = useTransform(heroScroll, [0, 0.5, 1], [0, 2 * amp, 0]);
  const daniOpacity = useTransform(heroScroll, [0, 0.7, 1], [1, 1, 1 - 0.2 * amp]);
  const shadowScale = useTransform(daniScale, (v) => 2 - v);

  // طبقة أمامية زخرفية (عشب) — حركة معاكسة خفيفة لإحساس أعمق بالعمق
  const foreY = useTransform(heroScroll, [0, 1], [0, 10 * amp]);

  return (
    <section className="hero-scene-full" ref={sectionRef}>
      <motion.div className="hero-bg-layer" style={{ y: bgY }} aria-hidden="true">
        <img
          className="hero-bg-img"
          src={heroBgScene}
          alt=""
          fetchPriority="high"
          width="1672"
          height="941"
        />
      </motion.div>

      <div className="hero-ribbon">{t("ribbon")}</div>

      <div className="wrap hero-scene-wrap">
        <motion.div className="hero-copy hero-copy-glass" variants={container} initial="hidden" animate="show">
          <motion.h1 variants={fadeUp}>
            <Trans k="hero.title" />
          </motion.h1>
          <motion.p className="lead" variants={fadeUp}>{t("hero.lead")}</motion.p>
          <motion.div className="hero-cta" variants={fadeUp}>
            <Link to="/shop" className="btn btn-primary btn-lg glow">{t("hero.cta_shop")}</Link>
            <Link to="/shop?cat=school" className="btn btn-ghost btn-lg">{t("hero.cta_school")}</Link>
          </motion.div>
          <motion.div className="hero-trust" variants={fadeUp}>
            <span>🚚 <span>{t("hero.badge_delivery")}</span></span>
            <span>💵 <span>{t("hero.badge_cod")}</span></span>
            <span>✅ <span>{t("hero.badge_guarantee")}</span></span>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="hero-dani-wrap"
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: reduceMotion ? 0.1 : 0.3 }}
        style={{ y: daniY, scale: daniScale, rotate: daniRotate, opacity: daniOpacity }}
      >
        <motion.div className="hero-dani-shadow" style={{ scale: shadowScale }} aria-hidden="true" />
        <motion.img
          className="hero-dani-img"
          src={heroDani}
          alt="Dani"
          fetchPriority="high"
          width="755"
          height="1165"
          animate={
            reduceMotion
              ? {}
              : { y: [0, -9, 0], rotate: [0, 0, -5, 6, -5, 6, -2, 0, 0] }
          }
          transition={{
            y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 7, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" },
          }}
        />
        <motion.div
          className="hero-dani-bubble"
          initial={{ opacity: 0, scale: 0.4, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 18, delay: reduceMotion ? 0.3 : 1.1 }}
        >
          {t("hero.dani_greeting")}
        </motion.div>
      </motion.div>

      <motion.div className="hero-foreground-grass" style={{ y: foreY }} aria-hidden="true" />

      <motion.div
        className="hero-brand-badge"
        initial={{ opacity: 0, scale: 0.7, y: -14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 20, delay: reduceMotion ? 0.35 : 0.9 }}
      >
        <span className="hbb-rocket" aria-hidden="true">🚀</span>
        <span className="hbb-text">
          <strong>Kids</strong>
          <em>of the Future</em>
        </span>
      </motion.div>

      <motion.div
        className="hero-chip"
        initial={{ opacity: 0, scale: 0.7, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: reduceMotion ? 0.3 : 1.05 }}
      >
        <span className="hero-chip-ic">✅</span>
        <span>{t("hero.badge_guarantee")}</span>
      </motion.div>
    </section>
  );
}
