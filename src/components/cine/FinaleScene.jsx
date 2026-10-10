import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/I18nContext";
import FrameScroller, { Caption } from "./FrameScroller";
import Icon from "../Icon";

// الخاتمة: داني والساعة السحرية بين الألعاب — الفيديو يتقدّم مع التمرير مثل المشاهد السابقة
export default function FinaleScene() {
  const { t } = useI18n();
  const last = (
    <>
      <span className="seq-kicker">{t("cine.brand")}</span>
      <h2>{t("cine.ft")}</h2>
      <p>{t("cine.fs")}</p>
      <div className="seq-ctas"><Link to="/shop" className="btn btn-primary btn-lg glow"><Icon name="bag" size={19} />{t("cine.fb")}</Link></div>
      <div className="seq-chips">
        <span><Icon name="cash" size={17} />{t("cine.cod")}</span>
        <span><Icon name="exchange" size={17} />{t("cine.ex")}</span>
      </div>
    </>
  );
  return (
    <FrameScroller name="finale" n={96} heightVh={280} staticFrame={95} renderStatic={() => <div className="seq-cap">{last}</div>}>
      {(p) => <Caption progress={p} range={[0.62, 1]}>{last}</Caption>}
    </FrameScroller>
  );
}
