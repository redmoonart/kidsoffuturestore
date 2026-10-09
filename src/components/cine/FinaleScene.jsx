import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useI18n } from "../../i18n/I18nContext";
import Icon from "../Icon";
import scene from "../../assets/finale-scene.webp";
import sceneMobile from "../../assets/finale-scene-m.webp";

// الخاتمة: داني بين الألعاب تحت بقعة الضوء (صورة كاملة) مع دعوة واضحة للتسوّق
export default function FinaleScene() {
  const { t } = useI18n();
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // تقريب بطيء أثناء المرور (Ken Burns) لإحساس سينمائي
  const scale = useTransform(p, [0, 1], [1.12, 1]);
  const y = useTransform(p, [0, 1], ["-4%", "4%"]);

  return (
    <section className="cine-finale" ref={ref}>
      <div className="cine-finale-blur" style={{ backgroundImage: `url(${scene})` }} aria-hidden="true" />
      <motion.picture className="cine-finale-bg" style={reduce ? undefined : { scale, y }} aria-hidden="true">
        <source media="(max-width: 760px)" srcSet={sceneMobile} />
        <img src={scene} alt="" width="1112" height="960" loading="lazy" decoding="async" />
      </motion.picture>
      <div className="cine-finale-shade" />
      <div className="wrap cine-finale-inner">
        <div className="cine-finale-copy">
          <h2>{t("cine.ft")}</h2>
          <p>{t("cine.fs")}</p>
          <Link to="/shop" className="btn btn-primary btn-lg glow"><Icon name="bag" size={20} />{t("cine.fb")}</Link>
          <div className="cine-delivery-chips light">
            <span><Icon name="cash" size={17} />{t("cine.cod")}</span>
            <span><Icon name="exchange" size={17} />{t("cine.ex")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
