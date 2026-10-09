import { Link } from "react-router-dom";
import { useI18n, Trans } from "../../i18n/I18nContext";
import FrameScroller, { Caption } from "./FrameScroller";
import Icon from "../Icon";

// الواجهة الرئيسية: داني تحت بقعة الضوء والكاميرا تدور حوله مع التمرير (فيديو مقطّع إلى إطارات)
export default function DaniOrbitHero() {
  const { t } = useI18n();
  const intro = (
    <>
      <span className="seq-kicker">{t("cine.brand")}</span>
      <h1><Trans k="hero.title" /></h1>
      <p>{t("hero.lead")}</p>
      <div className="seq-ctas">
        <Link to="/shop" className="btn btn-primary btn-lg glow"><Icon name="bag" size={19} />{t("hero.cta_shop")}</Link>
        <Link to="/shop?cat=kids" className="btn btn-glass btn-lg"><Icon name="baby" size={19} />{t("hero.cta_kids")}</Link>
      </div>
    </>
  );
  return (
    <FrameScroller name="orbit" n={96} heightVh={200} eager className="seq-hero" renderStatic={() => <div className="seq-cap">{intro}</div>}>
      {(p) => (
        <>
          <Caption progress={p} range={[0, 0.3]}>{intro}</Caption>
          <Caption progress={p} range={[0.36, 0.66]}>
            <span className="seq-kicker">{t("orb.k2")}</span>
            <h2>{t("orb.t2")}</h2>
            <p>{t("orb.p2")}</p>
          </Caption>
          <Caption progress={p} range={[0.72, 1]}>
            <h2>{t("orb.t3")}</h2>
            <div className="seq-chips">
              <span><Icon name="cash" size={17} />{t("cine.cod")}</span>
              <span><Icon name="exchange" size={17} />{t("cine.ex")}</span>
            </div>
            <div className="seq-ctas"><Link to="/shop" className="btn btn-primary btn-lg glow"><Icon name="bag" size={19} />{t("orb.b3")}</Link></div>
          </Caption>
        </>
      )}
    </FrameScroller>
  );
}
