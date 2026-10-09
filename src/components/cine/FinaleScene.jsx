import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useI18n } from "../../i18n/I18nContext";
import Icon from "../Icon";
import dani from "../../assets/hero-dani.webp";
import dani420 from "../../assets/hero-dani-420.webp";

// الخاتمة: بقعة ضوء على داني ودعوة واضحة للتسوّق
export default function FinaleScene() {
  const { t } = useI18n();
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const spot = useTransform(p, [0, 1], [0.2, 1]);
  const daniY = useTransform(p, [0, 1], [80, 0]);
  const daniScale = useTransform(p, [0, 1], [0.86, 1]);

  return (
    <section className="cine-finale" ref={ref}>
      <motion.div className="cine-spot" style={reduce ? undefined : { opacity: spot }} />
      <div className="cine-dust" />
      <div className="wrap cine-finale-inner">
        <motion.img
          className="cine-finale-dani"
          src={dani}
          srcSet={`${dani420} 420w, ${dani} 765w`}
          sizes="(max-width: 640px) 46vw, 22vw"
          alt=""
          width="765"
          height="1165"
          loading="lazy"
          style={reduce ? undefined : { y: daniY, scale: daniScale }}
        />
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
      <div className="cine-grain" />
    </section>
  );
}
