import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion, useMotionValue, useSpring } from "framer-motion";
import { useI18n, Trans } from "../i18n/I18nContext";
import { isNarrowViewport, hasFinePointer } from "../lib/deviceCapability";
import HeroToys from "./HeroToys";
import heroBgScene from "../assets/hero-bg-scene.webp";
import heroDani from "../assets/hero-dani.webp";
import heroDani420 from "../assets/hero-dani-420.webp";
import Icon from "./Icon";

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

  // اتجاه النظر: الفأرة على الكمبيوتر، وميلان الهاتف على الموبايل (-1..1)
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  useEffect(() => {
    if (reduceMotion) return undefined;
    if (hasFinePointer()) {
      const onMove = (e) => {
        pointerX.set((e.clientX / window.innerWidth) * 2 - 1);
        pointerY.set((e.clientY / window.innerHeight) * 2 - 1);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    }
    const onTilt = (e) => {
      if (e.gamma == null || e.beta == null) return;
      pointerX.set(Math.max(-1, Math.min(1, e.gamma / 30)));
      pointerY.set(Math.max(-1, Math.min(1, (e.beta - 45) / 30)));
    };
    window.addEventListener("deviceorientation", onTilt, { passive: true });
    return () => window.removeEventListener("deviceorientation", onTilt);
  }, [reduceMotion, pointerX, pointerY]);

  // داني بعمق: يميل نحو المؤشر كأنه مجسّم، وظله يتحرك عكسه
  const spring = { stiffness: 110, damping: 18, mass: 0.6 };
  const tiltY = useSpring(useTransform(pointerX, [-1, 1], [-10, 10]), spring);
  const tiltX = useSpring(useTransform(pointerY, [-1, 1], [5, -5]), spring);
  const daniShiftX = useSpring(useTransform(pointerX, [-1, 1], [-10, 10]), spring);
  const shadowX = useSpring(useTransform(pointerX, [-1, 1], [12, -12]), spring);

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

      <div className="hero-ribbon"><Icon name="truck" size={16} /><span>{t("ribbon")}</span></div>

      <div className="wrap hero-scene-wrap">
        <motion.div className="hero-copy hero-copy-glass" variants={container} initial="hidden" animate="show">
          <motion.h1 variants={fadeUp}>
            <Trans k="hero.title" />
          </motion.h1>
          <motion.p className="lead" variants={fadeUp}>{t("hero.lead")}</motion.p>
          <motion.div className="hero-cta" variants={fadeUp}>
            <Link to="/shop" className="btn btn-primary btn-lg glow"><Icon name="bag" size={19} />{t("hero.cta_shop")}</Link>
            <Link to="/shop?cat=kids" className="btn btn-ghost btn-lg"><Icon name="baby" size={19} />{t("hero.cta_kids")}</Link>
          </motion.div>
          <motion.div className="hero-trust" variants={fadeUp}>
            <span><Icon name="truck" size={17} /> <span>{t("hero.badge_delivery")}</span></span>
            <span><Icon name="cash" size={17} /> <span>{t("hero.badge_cod")}</span></span>
            <span><Icon name="shield" size={17} /> <span>{t("hero.badge_guarantee")}</span></span>
          </motion.div>
        </motion.div>
      </div>

      <HeroToys sectionRef={sectionRef} pointerX={pointerX} pointerY={pointerY} scroll={heroScroll} />

      <motion.div
        className="hero-dani-wrap"
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: reduceMotion ? 0.1 : 0.3 }}
        style={{ y: daniY, scale: daniScale, rotate: daniRotate, opacity: daniOpacity }}
      >
        <motion.div className="hero-dani-shadow" style={{ scale: shadowScale, x: shadowX }} aria-hidden="true" />
        <motion.div className="hero-dani-tilt" style={{ rotateX: tiltX, rotateY: tiltY, x: daniShiftX, transformPerspective: 900 }}>
        <img
          className={`hero-dani-img${reduceMotion ? "" : " breathe"}`}
          src={heroDani}
          srcSet={`${heroDani420} 420w, ${heroDani} 755w`}
          sizes="(max-width: 1024px) 40vw, 26vw"
          alt="Dani"
          fetchPriority="high"
          width="755"
          height="1165"
        />
        </motion.div>
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
        className="hero-chip"
        initial={{ opacity: 0, scale: 0.7, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: reduceMotion ? 0.3 : 1.05 }}
      >
        <span className="hero-chip-ic"><Icon name="shield" size={18} /></span>
        <span>{t("hero.badge_guarantee")}</span>
      </motion.div>
    </section>
  );
}
