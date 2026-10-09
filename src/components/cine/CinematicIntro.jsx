import { useEffect, useRef, useState } from "react";
import { useI18n } from "../../i18n/I18nContext";
import dani from "../../assets/hero-dani.webp";
import dani420 from "../../assets/hero-dani-420.webp";

const KEY = "kof_intro_seen";
const DURATION = 3600;

function shouldPlay() {
  if (typeof window === "undefined") return false;
  const q = new URLSearchParams(window.location.search).get("intro");
  if (q === "0") return false;
  if (q === "1") return true;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  try { return !sessionStorage.getItem(KEY); } catch { return false; }
}

// افتتاحية سينمائية قصيرة (مرة واحدة في كل زيارة). الموقع محمّل تحتها، وأي نقرة/تمرير/زر يتخطاها.
export default function CinematicIntro() {
  const { t, lang } = useI18n();
  const [phase, setPhase] = useState(() => (shouldPlay() ? "play" : "done"));
  // لا يبدأ المشهد قبل تحميل صورة داني (أو 1.5 ثانية كحد أقصى) حتى لا تُعرض سماء فارغة على الاتصال البطيء
  const [ready, setReady] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (phase !== "play" || ready) return undefined;
    if (imgRef.current?.complete) { setReady(true); return undefined; }
    const id = window.setTimeout(() => setReady(true), 1500);
    return () => window.clearTimeout(id);
  }, [phase, ready]);

  useEffect(() => {
    if (phase !== "play") return undefined;
    try { sessionStorage.setItem(KEY, "1"); } catch { /* تخزين غير متاح */ }
    const finish = () => setPhase((p) => (p === "play" ? "out" : p));
    const timer = ready ? window.setTimeout(finish, DURATION) : 0;
    const evs = ["pointerdown", "wheel", "touchmove", "keydown"];
    evs.forEach((e) => window.addEventListener(e, finish, { passive: true, once: true }));
    return () => {
      window.clearTimeout(timer);
      evs.forEach((e) => window.removeEventListener(e, finish));
    };
  }, [phase, ready]);

  useEffect(() => {
    if (phase !== "out") return undefined;
    const id = window.setTimeout(() => setPhase("done"), 650);
    return () => window.clearTimeout(id);
  }, [phase]);

  if (phase === "done") return null;
  const brand = t("cine.brand");
  return (
    <div className={`cine-intro${ready ? " ready" : ""}${phase === "out" ? " out" : ""}`} aria-hidden="true">
      <div className="cine-intro-sky" />
      <div className="cine-dust" />
      <div className="cine-beam" />
      <div className="cine-intro-stage">
        <img
          ref={imgRef}
          onLoad={() => setReady(true)}
          className="cine-intro-dani"
          src={dani}
          srcSet={`${dani420} 420w, ${dani} 765w`}
          sizes="(max-width: 640px) 60vw, 30vw"
          alt=""
          width="765"
          height="1165"
        />
        <div className="cine-intro-title">
          {/* كشف بمسح ضوئي للاسم كاملاً (تقطيع الحروف العربية يكسر اتصالها) */}
          <p className="cine-intro-brand">{brand}</p>
          {lang === "ar" && <p className="cine-intro-latin" dir="ltr">KIDS OF THE FUTURE</p>}
          <p className="cine-intro-tag">{t("cine.tagline")}</p>
        </div>
      </div>
      <div className="cine-bar top" />
      <div className="cine-bar bottom" />
      <div className="cine-grain" />
      <span className="cine-skip">{t("cine.skip")} ›</span>
    </div>
  );
}
