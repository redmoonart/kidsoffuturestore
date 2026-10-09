import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useI18n } from "../../i18n/I18nContext";
import { WILAYAS } from "../../data/wilayas";
import { STORE_CONFIG } from "../../data/config";
import { money } from "../../lib/format";
import Icon from "../Icon";
import dani from "../../assets/hero-dani-420.webp";

// ولايات من كل جهات الوطن تمرّ كلافتات على الطريق، بأسعار التوصيل للمنزل الحقيقية
const ROUTE = [16, 9, 6, 18, 19, 25, 23, 5, 7, 39, 30, 47, 1, 11, 13, 31];
const SIGNS = ROUTE.map((c) => WILAYAS.find((w) => w.code === c)).filter((w) => w && w.available !== false);

function Truck({ wheelRotate }) {
  // الشاحنة متجهة لليسار (اتجاه السير في العربية). داني يطلّ من نافذة المقصورة.
  // صورة داني 420×640: مركز الرأس تقريباً (250, 217) ونصف قطره ~105
  const s = 36 / 105;
  return (
    <svg className="cine-truck" viewBox="0 0 420 220" role="img" aria-label="Kids of the Future">
      <defs>
        <clipPath id="cine-win"><circle cx="80" cy="88" r="33" /></clipPath>
        <linearGradient id="cine-box" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F08A52" />
          <stop offset="1" stopColor="#D8693A" />
        </linearGradient>
      </defs>
      <ellipse cx="210" cy="206" rx="190" ry="10" fill="rgba(0,0,0,.22)" />
      {/* الصندوق */}
      <rect x="150" y="26" width="252" height="146" rx="18" fill="url(#cine-box)" />
      <rect x="150" y="26" width="252" height="146" rx="18" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2" />
      <text x="276" y="92" textAnchor="middle" fill="#fff" fontWeight="900" fontSize="30" fontFamily="Outfit, Tajawal, sans-serif">Kids</text>
      <text x="276" y="120" textAnchor="middle" fill="#FFF3E6" fontWeight="800" fontSize="15" letterSpacing="2" fontFamily="Outfit, sans-serif">OF THE FUTURE</text>
      <rect x="196" y="136" width="160" height="8" rx="4" fill="#3F9A90" />
      {/* المقصورة */}
      <path d="M150 60 H70 Q40 60 30 92 L18 128 Q14 140 14 152 V172 H150 Z" fill="#FFF5E8" />
      <path d="M150 60 H70 Q40 60 30 92 L18 128 Q14 140 14 152 V172 H150 Z" fill="none" stroke="rgba(0,0,0,.08)" strokeWidth="2" />
      <circle cx="80" cy="88" r="36" fill="#3B8EE6" />
      <g clipPath="url(#cine-win)">
        <rect x="40" y="48" width="80" height="80" fill="#BFE0FF" />
        <image href={dani} width={420 * s} height={640 * s} x={80 - 250 * s} y={92 - 217 * s} />
      </g>
      <circle cx="80" cy="88" r="36" fill="none" stroke="#3F9A90" strokeWidth="6" />
      <rect x="10" y="150" width="20" height="10" rx="4" fill="#F7B52C" />
      {/* العجلات */}
      {[92, 330].map((cx) => (
        <motion.g key={cx} style={{ rotate: wheelRotate, originX: `${cx}px`, originY: "176px" }}>
          <circle cx={cx} cy="176" r="28" fill="#1F2430" />
          <circle cx={cx} cy="176" r="13" fill="#E9EDF3" />
          <rect x={cx - 2.5} y="150" width="5" height="52" rx="2" fill="#1F2430" opacity=".55" />
          <rect x={cx - 26} y="173.5" width="52" height="5" rx="2" fill="#1F2430" opacity=".55" />
        </motion.g>
      ))}
    </svg>
  );
}

export default function DeliveryScene() {
  const { t, lang } = useI18n();
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const signsX = useTransform(p, [0, 1], ["-78%", "8%"]);
  const farX = useTransform(p, [0, 1], ["-10%", "6%"]);
  const nearX = useTransform(p, [0, 1], ["-30%", "12%"]);
  const dash = useTransform(p, [0, 1], [0, 2600]);
  const dashPos = useTransform(dash, (v) => `${v}px 0`);
  const wheelRotate = useTransform(p, [0, 1], [0, -1800]);
  const bob = useTransform(p, (v) => Math.sin(v * 120) * 1.6);

  const name = (w) => (lang === "ar" ? w.name : w.latin);
  const signsRow = (
    <div className="cine-signs-row">
      {SIGNS.map((w) => (
        <div key={w.code} className="cine-sign">
          <div className="cine-sign-board">
            <span className="cine-sign-name"><b dir="ltr">{String(w.code).padStart(2, "0")}</b> {name(w)}</span>
            <span className="cine-sign-price">{money(w.home, STORE_CONFIG.currency)} <small>{t("cine.home")}</small></span>
          </div>
          <div className="cine-sign-post" />
        </div>
      ))}
    </div>
  );

  const head = (
    <div className="cine-delivery-head">
      <span className="cine-kicker">{t("cine.dk")}</span>
      <h2>{t("cine.dt")}</h2>
      <p>{t("cine.ds")}</p>
    </div>
  );
  const chips = (
    <div className="cine-delivery-chips">
      <span><Icon name="cash" size={18} />{t("cine.cod")}</span>
      <span><Icon name="exchange" size={18} />{t("cine.ex")}</span>
    </div>
  );

  if (reduce) {
    return (
      <section className="cine-delivery static">
        <div className="wrap">{head}<div className="cine-signs-static">{signsRow}</div>{chips}</div>
      </section>
    );
  }

  return (
    <section className="cine-delivery" ref={ref}>
      <div className="cine-sticky cine-delivery-sticky">
        <div className="cine-day-sky" />
        <div className="cine-day-sun" aria-hidden="true" />
        <motion.div className="cine-clouds" style={{ x: farX }} aria-hidden="true">
          <span className="c1" /><span className="c2" /><span className="c3" /><span className="c4" />
        </motion.div>
        <motion.svg className="cine-hills far" viewBox="0 0 1600 200" preserveAspectRatio="none" style={{ x: farX }} aria-hidden="true">
          <path d="M0 200 V120 Q120 60 260 110 T560 90 T880 115 T1200 80 T1600 110 V200 Z" fill="#A9D3A0" />
        </motion.svg>
        <motion.svg className="cine-hills near" viewBox="0 0 1600 200" preserveAspectRatio="none" style={{ x: nearX }} aria-hidden="true">
          <path d="M0 200 V140 Q160 90 340 140 T700 120 T1060 150 T1400 115 T1600 140 V200 Z" fill="#78BE6E" />
        </motion.svg>
        {head}
        <div className="cine-road-wrap">
          <motion.div className="cine-signs" style={{ x: signsX }}>{signsRow}</motion.div>
          <div className="cine-road"><motion.div className="cine-road-dash" style={{ backgroundPosition: dashPos }} /></div>
          <motion.div className="cine-truck-wrap" style={{ y: bob }}>
            <Truck wheelRotate={wheelRotate} />
          </motion.div>
        </div>
        {chips}
      </div>
    </section>
  );
}
