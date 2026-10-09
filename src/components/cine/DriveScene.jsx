import { useEffect, useRef, useState } from "react";
import { motion, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/I18nContext";
import { WILAYAS } from "../../data/wilayas";
import { STORE_CONFIG } from "../../data/config";
import { money } from "../../lib/format";
import FrameScroller, { Caption } from "./FrameScroller";
import Icon from "../Icon";

// ولايات من كل جهات الوطن — الأسعار تُقرأ من wilayas.js فتبقى صحيحة دائماً
const ROUTE = [16, 9, 6, 18, 19, 25, 23, 5, 7, 39, 30, 47, 1, 11, 13, 31];
const SIGNS = ROUTE.map((c) => WILAYAS.find((w) => w.code === c)).filter((w) => w && w.available !== false);

function Ticker({ progress }) {
  const { t, lang, meta } = useI18n();
  const rtl = meta.dir === "rtl";
  const boxRef = useRef(null);
  const rowRef = useRef(null);
  const [dims, setDims] = useState({ cw: 1, rw: 1 });
  useEffect(() => {
    const measure = () => setDims({ cw: boxRef.current?.clientWidth || 1, rw: rowRef.current?.scrollWidth || 1 });
    measure();
    const id = requestAnimationFrame(measure); // بعد تحميل الخط
    window.addEventListener("resize", measure);
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", measure); };
  }, [lang]);
  useEffect(() => { progress.set(progress.get()); }, [dims, progress]);
  // أول لافتة تدخل من جهة، وآخرها يصل منتصف الشاشة في نهاية المشهد — مهما كان عرض الشاشة
  const geo = useRef({ from: 0, to: 0 });
  geo.current = rtl
    ? { from: -0.4 * dims.cw, to: dims.rw - 0.6 * dims.cw }
    : { from: 0.4 * dims.cw, to: 0.6 * dims.cw - dims.rw };
  const x = useTransform(progress, (v) => geo.current.from + (geo.current.to - geo.current.from) * v);
  const opacity = useTransform(progress, [0, 0.06, 0.94, 1], [0, 1, 1, 0.85]);
  return (
    <motion.div className="seq-ticker" ref={boxRef} style={{ opacity }} aria-hidden="true">
      <motion.div className="seq-ticker-row" ref={rowRef} style={{ x }}>
        {SIGNS.map((w) => (
          <span key={w.code} className="seq-sign">
            <b dir="ltr">{String(w.code).padStart(2, "0")}</b>
            <span>{lang === "ar" ? w.name : w.latin}</span>
            <em>{money(w.home, STORE_CONFIG.currency)} <small>{t("cine.home")}</small></em>
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}

// مشهد التوصيل: داني يقود شاحنة المتجر من التلال الخضراء إلى الصحراء مع التمرير
export default function DriveScene() {
  const { t } = useI18n();
  const copy = (
    <>
      <span className="seq-kicker">{t("cine.dk")}</span>
      <h2>{t("cine.dt")}</h2>
      <p>{t("cine.ds")}</p>
    </>
  );
  return (
    <FrameScroller name="drive" n={96} heightVh={280} staticFrame={40} className="seq-drive"
      renderStatic={() => <div className="seq-cap">{copy}</div>}>
      {(p) => (
        <>
          <Ticker progress={p} />
          <Caption progress={p} range={[0.04, 0.5]}>{copy}</Caption>
          <Caption progress={p} range={[0.56, 1]}>
            <h2>{t("cine.cod")}</h2>
            <div className="seq-chips">
              <span><Icon name="exchange" size={17} />{t("cine.ex")}</span>
            </div>
            <div className="seq-ctas"><Link to="/policies#delivery" className="btn btn-glass btn-lg"><Icon name="truck" size={19} />{t("footer.delivery")}</Link></div>
          </Caption>
        </>
      )}
    </FrameScroller>
  );
}
