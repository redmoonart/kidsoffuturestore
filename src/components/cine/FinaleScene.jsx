import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useI18n } from "../../i18n/I18nContext";
import Icon from "../Icon";
import mp4 from "../../assets/finale-d.mp4";
import mp4Mobile from "../../assets/finale-m.mp4";
import webm from "../../assets/finale-d.webm";
import webmMobile from "../../assets/finale-m.webm";
import poster from "../../assets/finale-poster.webp";
import posterMobile from "../../assets/finale-poster-m.webp";

const isMobile = () => typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches;

// الخاتمة: فيديو داني والساعة السحرية بين الألعاب (حلقة صامتة) مع دعوة واضحة للتسوّق
export default function FinaleScene() {
  const { t } = useI18n();
  const ref = useRef(null);
  const videoRef = useRef(null);
  const reduce = useReducedMotion();
  const [mobile] = useState(isMobile);
  const [load, setLoad] = useState(false);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // تقريب بطيء أثناء المرور (Ken Burns) لإحساس سينمائي
  const scale = useTransform(p, [0, 1], [1.12, 1]);
  const y = useTransform(p, [0, 1], ["-4%", "4%"]);

  const visible = useRef(false);
  const sync = () => {
    const v = videoRef.current;
    if (!v || !v.firstChild) return;
    if (visible.current) { v.muted = true; v.play().catch(() => {}); } else v.pause();
  };

  // لا نحمّل الفيديو إلا عند الاقتراب منه، ويشتغل فقط وهو ظاهر على الشاشة
  useEffect(() => {
    if (reduce) return undefined;
    const near = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setLoad(true); near.disconnect(); } }, { rootMargin: "100% 0px" });
    const seen = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; sync(); }, { threshold: 0.15 });
    near.observe(ref.current);
    seen.observe(ref.current);
    return () => { near.disconnect(); seen.disconnect(); };
  }, [reduce]);
  useEffect(sync, [load]);

  const still = mobile ? posterMobile : poster;

  return (
    <section className="cine-finale" ref={ref}>
      <div className="cine-finale-blur" style={{ backgroundImage: `url(${poster})` }} aria-hidden="true" />
      <motion.div className="cine-finale-bg" style={reduce ? undefined : { scale, y }} aria-hidden="true">
        {reduce ? (
          <img className="cine-finale-media" src={still} alt="" loading="lazy" decoding="async" />
        ) : (
          <video
            ref={videoRef}
            className="cine-finale-media"
            poster={still}
            muted
            loop
            playsInline
            preload="none"
            disablePictureInPicture
            tabIndex={-1}
          >
            {load && <source src={mobile ? mp4Mobile : mp4} type="video/mp4" />}
            {load && <source src={mobile ? webmMobile : webm} type="video/webm" />}
          </video>
        )}
      </motion.div>
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
