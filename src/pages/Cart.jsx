import { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import { useCart } from "../cart/CartContext";
import { WILAYAS } from "../data/wilayas";
import { STORE_CONFIG } from "../data/config";
import PageHead from "../components/PageHead";
import Reveal from "../components/Reveal";
import StaggerGrid from "../components/StaggerGrid";
import { pName, wName } from "../lib/product";
import { money } from "../lib/format";
import { saveOrder, makeOrderRef } from "../lib/orders";
import { checkCoupon } from "../lib/coupons";

export default function Cart() {
  const { t, lang } = useI18n();
  const { cart, byId, setQty, removeFromCart, clearCart, subtotal } = useCart();

  const [deliveryType, setDeliveryType] = useState("home");
  const [wilayaCode, setWilayaCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});

  const wilaya = WILAYAS.find((w) => w.code === Number(wilayaCode));
  const officeAvailable = !!(wilaya && wilaya.office != null);
  const effectiveType = deliveryType === "office" && !officeAvailable ? "home" : deliveryType;
  const isFree = STORE_CONFIG.freeShippingThreshold && subtotal >= STORE_CONFIG.freeShippingThreshold;
  const deliveryPrice = wilaya ? (effectiveType === "office" ? wilaya.office : wilaya.home) : 0;
  const finalDelivery = isFree ? 0 : deliveryPrice;

  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState("");
  const discount = coupon
    ? coupon.type === "percent"
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal)
    : 0;

  const total = subtotal + (wilaya ? finalDelivery : 0) - discount;
  const remain = STORE_CONFIG.freeShippingThreshold ? STORE_CONFIG.freeShippingThreshold - subtotal : 0;

  async function handleApplyCoupon() {
    const code = couponCode.trim();
    if (!code) return;
    setCouponBusy(true);
    setCouponError("");
    const result = await checkCoupon(code, subtotal);
    setCouponBusy(false);
    if (!result.ok) {
      setCoupon(null);
      setCouponError(t(result.reason, { v: result.minOrder }));
      return;
    }
    setCoupon(result.coupon);
  }

  function handleRemoveCoupon() {
    setCoupon(null);
    setCouponCode("");
    setCouponError("");
  }

  const [sending, setSending] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [placedRef, setPlacedRef] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const phoneOk = /^0[5-7]\d{8}$/.test(phone.replace(/\s/g, ""));
    const nameOk = name.trim().length > 1;
    const wilayaOk = !!wilaya && wilaya.available !== false;
    setErrors({ name: !nameOk, phone: !phoneOk, wilaya: !wilayaOk });
    if (!nameOk || !phoneOk || !wilayaOk || sending) return;

    const price = effectiveType === "office" ? wilaya.office : wilaya.home;
    const delFinal = isFree ? 0 : price;
    const grandTotal = subtotal + delFinal - discount;
    const ref = makeOrderRef();
    const items = cart
      .map((i) => {
        const p = byId(i.id);
        return p ? { id: p.id, name: p.name, qty: i.qty, price: p.price } : null;
      })
      .filter(Boolean);

    // الطلب يُحفظ في Supabase ويظهر مباشرة في تطبيق "إدارة متجري"
    setSending(true);
    setSaveError(false);
    const ok = await saveOrder({
      ref,
      customer_name: name.trim(),
      phone: phone.replace(/\s/g, ""),
      wilaya: `${wilaya.code} - ${wilaya.name}`,
      address: city.trim() || null,
      delivery_type: effectiveType,
      delivery_price: delFinal,
      items,
      total: grandTotal,
      notes: notes.trim() || null,
      coupon_code: coupon ? coupon.code : null,
      discount,
    });
    setSending(false);

    if (!ok) {
      setSaveError(true);
      return;
    }
    setPlacedRef(ref);
    clearCart();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (placedRef) {
    return (
      <>
        <PageHead title={t("cart.head_title")} subtitle={t("cart.head_sub")} chips={["💵", "🚚", "✅", "📦"]} />
        <section className="section">
          <div className="wrap">
            <Reveal className="empty-state order-success" y={28}>
              <div className="em">✅</div>
              <h3>{t("cart.ok_t")}</h3>
              <p>{t("cart.ok_p")}</p>
              <p className="order-ref">{t("cart.ok_ref")}: <strong dir="ltr">{placedRef}</strong></p>
              <Link className="btn btn-primary btn-lg" to="/shop">{t("cart.ok_btn")}</Link>
            </Reveal>
          </div>
        </section>
      </>
    );
  }

  if (!cart.length) {
    return (
      <>
        <PageHead title={t("cart.head_title")} subtitle={t("cart.head_sub")} chips={["💵", "🚚", "✅", "📦"]} />
        <section className="section">
          <div className="wrap">
            <Reveal className="empty-state" y={28}>
              <div className="em">🛒</div>
              <h3>{t("cart.empty_t")}</h3>
              <p>{t("cart.empty_p")}</p>
              <Link className="btn btn-primary btn-lg" to="/shop">{t("cart.empty_btn")}</Link>
            </Reveal>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHead title={t("cart.head_title")} subtitle={t("cart.head_sub")} chips={["💵", "🚚", "✅", "📦"]} />
      <section className="section">
        <div className="wrap">
          <div className="cart-layout">
            <div>
              <StaggerGrid className="cart-list">
                {cart
                  .map((i) => {
                    const p = byId(i.id);
                    if (!p) return null;
                    return (
                      <div className="cart-row" key={i.id}>
                        <Link to={`/product/${p.id}`} className="thumb">
                          {p.image ? <img src={p.image} alt={pName(p, lang)} /> : <span>{p.emoji || "🎁"}</span>}
                        </Link>
                        <div>
                          <h4>{pName(p, lang)}</h4>
                          <div className="unit">{money(p.price, STORE_CONFIG.currency)} {t("cart.per_piece")}</div>
                          <div className="qty" style={{ marginTop: 8 }}>
                            <button type="button" onClick={() => setQty(p.id, i.qty - 1)}>−</button>
                            <input type="text" value={i.qty} readOnly />
                            <button type="button" onClick={() => setQty(p.id, i.qty + 1)}>+</button>
                          </div>
                        </div>
                        <div className="right">
                          <span className="line-total">{money(p.price * i.qty, STORE_CONFIG.currency)}</span>
                          <button className="remove" onClick={() => removeFromCart(p.id)}>{t("cart.remove")}</button>
                        </div>
                      </div>
                    );
                  })
                  .filter(Boolean)}
              </StaggerGrid>
            </div>

            <Reveal className="summary" y={24} delay={0.1}>
              <h3>{t("cart.summary")}</h3>
              <div className="line">
                <span>{t("cart.subtotal")}</span>
                <span>{money(subtotal, STORE_CONFIG.currency)}</span>
              </div>
              <div className="line">
                <span>{t("cart.delivery")} {wilaya ? `(${wName(wilaya, lang)})` : ""}</span>
                <span>{isFree ? t("cart.free") : wilaya ? money(finalDelivery, STORE_CONFIG.currency) : t("cart.by_wilaya")}</span>
              </div>
              {coupon && (
                <div className="line coupon-line">
                  <span>{t("cart.coupon_applied")} ({coupon.code})</span>
                  <span>−{money(discount, STORE_CONFIG.currency)}</span>
                </div>
              )}
              <div className="line total">
                <span>{t("cart.total")}</span>
                <span className="amount-flash">{money(total, STORE_CONFIG.currency)}</span>
              </div>
              {STORE_CONFIG.freeShippingThreshold && !isFree && remain > 0 ? (
                <div className="free-note">
                  {t("cart.free_add_pre")}{money(remain, STORE_CONFIG.currency)}{t("cart.free_add_post")}
                </div>
              ) : null}
              {isFree ? <div className="free-note">{t("cart.free_congrats")}</div> : null}

              <div className="coupon-box">
                {coupon ? (
                  <div className="coupon-applied">
                    <span>🏷️ {coupon.code}</span>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={handleRemoveCoupon}>{t("cart.coupon_remove")}</button>
                  </div>
                ) : (
                  <div className="coupon-input-row">
                    <input
                      type="text"
                      placeholder={t("cart.coupon_ph")}
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    />
                    <button type="button" className="btn btn-ghost btn-sm" onClick={handleApplyCoupon} disabled={couponBusy || !couponCode.trim()}>
                      {couponBusy ? "..." : t("cart.coupon_apply")}
                    </button>
                  </div>
                )}
                {couponError && <div className="field-error show">{couponError}</div>}
              </div>

              <div style={{ marginTop: 20 }}>
                <h3 style={{ fontSize: "1.1rem" }}>{t("cart.info_title")}</h3>
                <form onSubmit={handleSubmit} noValidate>
                  <div className="form-row">
                    <label>{t("cart.f_name")} <span className="req">*</span></label>
                    <input type="text" placeholder={t("cart.ph_name")} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
                    <div className={`field-error${errors.name ? " show" : ""}`}>{t("cart.err_name")}</div>
                  </div>
                  <div className="form-row">
                    <label>{t("cart.f_phone")} <span className="req">*</span></label>
                    <input type="tel" placeholder={t("cart.ph_phone")} inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <div className={`field-error${errors.phone ? " show" : ""}`}>{t("cart.err_phone")}</div>
                  </div>
                  <div className="form-row">
                    <label>{t("cart.f_wilaya")} <span className="req">*</span></label>
                    <select value={wilayaCode} onChange={(e) => setWilayaCode(e.target.value)}>
                      <option value="">{t("cart.choose_wilaya")}</option>
                      {WILAYAS.map((w) => (
                        <option key={w.code} value={w.code} disabled={w.available === false}>
                          {w.code} - {wName(w, lang)}{w.available === false ? ` (${t("cart.wilaya_unavailable")})` : ""}
                        </option>
                      ))}
                    </select>
                    <div className={`field-error${errors.wilaya ? " show" : ""}`}>
                      {wilaya && wilaya.available === false ? t("cart.wilaya_unavailable_note") : t("cart.err_wilaya")}
                    </div>
                  </div>
                  <div className="form-row">
                    <label>{t("cart.f_city")}</label>
                    <input type="text" placeholder={t("cart.ph_city")} value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className="form-row">
                    <label>{t("cart.dtype")}</label>
                    <div className="radio-cards">
                      <div className={`radio-card${effectiveType === "home" ? " active" : ""}`} onClick={() => setDeliveryType("home")}>
                        {t("cart.dtype_home")}
                      </div>
                      {officeAvailable && (
                        <div className={`radio-card${effectiveType === "office" ? " active" : ""}`} onClick={() => setDeliveryType("office")}>
                          {t("cart.dtype_office")}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-row">
                    <label>{t("cart.f_notes")}</label>
                    <textarea rows={2} placeholder={t("cart.ph_notes")} value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </div>
                  {saveError && <p className="field-error show" role="alert" style={{ marginBottom: 10 }}>{t("cart.save_err")}</p>}
                  <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={sending}>{sending ? t("cart.sending") : t("cart.submit")}</button>
                  <p style={{ textAlign: "center", color: "var(--muted)", fontSize: ".82rem", marginTop: 10 }}>{t("cart.cod_note")}</p>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
