import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/I18nContext";
import FrameScroller, { Caption } from "./FrameScroller";
import Icon from "../Icon";

// مشهد الهدية: الصندوق ينفتح والألعاب تدور حول داني مع التمرير
export default function GiftScene() {
  const { t } = useI18n();
  const last = (
    <>
      <span className="seq-kicker">{t("cine.brand")}</span>
      <h2>{t("seq.t4")}</h2>
      <div className="seq-ctas"><Link to="/shop" className="btn btn-primary btn-lg glow"><Icon name="bag" size={19} />{t("seq.b4")}</Link></div>
    </>
  );
  return (
    <FrameScroller name="gift" n={96} heightVh={300} staticFrame={95} renderStatic={() => <div className="seq-cap">{last}</div>}>
      {(p) => (
        <>
          <Caption progress={p} range={[0.02, 0.3]}>
            <span className="seq-kicker">{t("seq.k1")}</span>
            <h2>{t("seq.t1")}</h2>
          </Caption>
          <Caption progress={p} range={[0.36, 0.66]}>
            <span className="seq-kicker">{t("seq.k3")}</span>
            <h2>{t("seq.t3")}</h2>
          </Caption>
          <Caption progress={p} range={[0.72, 1]}>{last}</Caption>
        </>
      )}
    </FrameScroller>
  );
}
