import { useState, useEffect, useRef } from "react";
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
import { burstConfetti } from "../lib/cartFx";
import { getSavedWilaya, saveWilaya } from "../lib/wilayaPref";
import { track } from "../lib/pixel";
import { storeWaLink } from "../lib/whatsapp";
import ProductImage from "../components/ProductImage";
import FreeShippingBar from "../components/FreeShippingBar";
import Icon from "../components/Icon";
import Icon3D from "../components/Icon3D";

export default function Cart() {
  const { t, lang } = useI18n();
  const { cart, byId, setQty, removeFromCart, clearCart, subtotal } = useCart();

  const [deliveryType, setDeliveryType] = useState("home");
  const [wilayaCode, setWilayaCode] = useState(() => {
    const saved = getSavedWilaya();
    return WILAYAS.some((w) => String(w.code) === saved && w.available !== false) ? saved : "";
  });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [commune, setCommune] = useState("");
  const [communes, setCommunes] = useState(null);

  // قائمة البلديات (1541 بلدية) تُحمَّل فقط عند فتح السلة
  useEffect(() => {
    let alive = true;
    import("../data/communes.json").then((m) => alive && setCommunes(m.default)).catch(() => {});
    return () => { alive = false; };
  }, []);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});

  const wilaya = WILAYAS.find((w) => w.code === Number(wilayaCode));
  const wilayaCommunes = (wilaya && communes?.[String(wilaya.code)]) || [];
  const officeAvailable = !!(wilaya && wilaya.office != null);
  const effectiveType = deliveryType === "office" && !officeAvailable ? "home" : deliveryType;
  const isFree = STORE_CONFIG.freeShippingThreshold && subtotal >= STORE_CONFIG.freeShippingThreshold;
  const deliveryPrice = wilaya ? (effectiveType === "office" ? wilaya.office : wilaya.home) : 0;
  const finalDelivery = isFree ? 0 : deliveryPrice;

  const total = subtotal + (wilaya ? finalDelivery : 0);

  const [sending, setSending] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [placedRef, setPlacedRef] = useState(null);
  const [placed, setPlaced] = useState(null);
  const [honey, setHoney] = useState("");
  const submittingRef = useRef(false);
  const successEmojiRef = useRef(null);
  const checkoutTracked = useRef(false);

  useEffect(() => {
    if (checkoutTracked.current || !cart.length || !subtotal) return;
    checkoutTracked.current = true;
    track("InitiateCheckout", { value: subtotal, currency: "DZD", num_items: cart.reduce((n, i) => n + i.qty, 0) });
  }, [cart, subtotal]);

  useEffect(() => {
    if (!placedRef) return;
    const t = setTimeout(() => {
      const r = successEmojiRef.current?.getBoundingClientRect();
      if (r) burstConfetti(r.left + r.width / 2, r.top + r.height / 2);
    }, 450);
    return () => clearTimeout(t);
  }, [placedRef]);

  async function handleSubmit(e) {
    e.preventDefault();
    const phoneOk = /^0[5-7]\d{8}$/.test(phone.replace(/\s/g, ""));
    const nameOk = name.trim().length > 1;
    const wilayaOk = !!wilaya && wilaya.available !== false;
    const communeOk = !wilayaOk || !wilayaCommunes.length || !!commune;
    setErrors({ name: !nameOk, phone: !phoneOk, wilaya: !wilayaOk, commune: !communeOk });
    if (!nameOk || !phoneOk || !wilayaOk || !communeOk || submittingRef.current) return;
    submittingRef.current = true;

    const price = effectiveType === "office" ? wilaya.office : wilaya.home;
    const delFinal = isFree ? 0 : price;
    const grandTotal = subtotal + delFinal;
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
    // حقل الفخ مخفي عن البشر: إن عُبّئ فالمُرسِل روبوت، نُظهر نجاحاً شكلياً بدون حفظ الطلب
    const ok = honey ? true : await saveOrder({
      ref,
      customer_name: name.trim(),
      phone: phone.replace(/\s/g, ""),
      wilaya: `${wilaya.code} - ${wilaya.name}`,
      address: [commune, city.trim()].filter(Boolean).join(" — ") || null,
      delivery_type: effectiveType,
      delivery_price: delFinal,
      items,
      total: grandTotal,
      notes: notes.trim() || null,
    });
    setSending(false);
    submittingRef.current = false;

    if (!ok) {
      setSaveError(true);
      return;
    }
    setPlaced({
      ref,
      total: grandTotal,
      delivery: delFinal,
      wilaya: `${wilaya.code} - ${wName(wilaya, lang)}`,
      commune,
      lines: cart.map((i) => { const p = byId(i.id); return p ? { id: p.id, name: pName(p, lang), qty: i.qty, price: p.price } : null; }).filter(Boolean),
    });
    if (!honey) track("Purchase", { value: grandTotal, currency: "DZD", content_ids: items.map((i) => String(i.id)), content_type: "product", num_items: items.reduce((n, i) => n + i.qty, 0) }, ref);
    setPlacedRef(ref);
    clearCart();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (placedRef) {
    return (
      <>
        <PageHead title={t("cart.head_title")} subtitle={t("cart.head_sub")} chips={[<Icon key="c" name="cash" size={24} />, <Icon key="t" name="truck" size={24} />, <Icon key="s" name="shield" size={24} />, <Icon key="p" name="package" size={24} />]} />
        <section className="section">
          <div className="wrap">
            <Reveal className="empty-state order-success" y={28}>
              <div className="em em-3d" ref={successEmojiRef}><Icon3D name="boxok" size={120} /></div>
              <h3>{t("cart.ok_t")}</h3>
              <p>{t("cart.ok_p")}</p>
              <p className="order-ref">{t("cart.ok_ref")}: <strong dir="ltr">{placedRef}</strong></p>
              {placed && (
                <div className="order-summary">
                  <h4>{t("cart.ok_summary")}</h4>
                  <ul>
                    {placed.lines.map((l) => (
                      <li key={l.id}><span>{l.name} × {l.qty}</span><span>{money(l.price * l.qty, STORE_CONFIG.currency)}</span></li>
                    ))}
                    <li><span>{t("cart.delivery")} ({placed.wilaya}{placed.commune ? ` — ${placed.commune}` : ""})</span><span>{placed.delivery ? money(placed.delivery, STORE_CONFIG.currency) : t("cart.free")}</span></li>
                    <li className="total"><span>{t("cart.total")}</span><span>{money(placed.total, STORE_CONFIG.currency)}</span></li>
                  </ul>
                </div>
              )}
              <div className="order-success-actions">
                {placed && storeWaLink("x") && (
                  <a className="btn btn-wa btn-lg" href={storeWaLink(t("cart.ok_wa_msg", { ref: placed.ref, store: STORE_CONFIG.name, total: money(placed.total, STORE_CONFIG.currency) }))} target="_blank" rel="noopener noreferrer">
                    <Icon name="chat" size={19} />
                    {t("cart.ok_wa")}
                  </a>
                )}
                <Link className="btn btn-primary btn-lg" to="/shop">{t("cart.ok_btn")}</Link>
              </div>
            </Reveal>
          </div>
        </section>
      </>
    );
  }

  if (!cart.length) {
    return (
      <>
        <PageHead title={t("cart.head_title")} subtitle={t("cart.head_sub")} chips={[<Icon key="c" name="cash" size={24} />, <Icon key="t" name="truck" size={24} />, <Icon key="s" name="shield" size={24} />, <Icon key="p" name="package" size={24} />]} />
        <section className="section">
          <div className="wrap">
            <Reveal className="empty-state" y={28}>
              <div className="em em-3d"><Icon3D name="cartempty" size={110} /></div>
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
      <PageHead title={t("cart.head_title")} subtitle={t("cart.head_sub")} chips={[<Icon key="c" name="cash" size={24} />, <Icon key="t" name="truck" size={24} />, <Icon key="s" name="shield" size={24} />, <Icon key="p" name="package" size={24} />]} />
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
                          <ProductImage src={p.image} emoji={p.emoji} alt={pName(p, lang)} />
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
                          <button className="remove" onClick={() => removeFromCart(p.id)}><Icon name="trash" size={15} />{t("cart.remove")}</button>
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
              <div className="line total">
                <span>{t("cart.total")}</span>
                <span className="amount-flash">{money(total, STORE_CONFIG.currency)}</span>
              </div>
              <FreeShippingBar subtotal={subtotal} />

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
                    <select value={wilayaCode} onChange={(e) => { setWilayaCode(e.target.value); saveWilaya(e.target.value); setCommune(""); }}>
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
                    <label>{t("cart.f_commune")} {wilayaCommunes.length > 0 && <span className="req">*</span>}</label>
                    <select value={commune} onChange={(e) => { setCommune(e.target.value); setErrors((er) => ({ ...er, commune: false })); }} disabled={!wilayaCommunes.length}>
                      <option value="">{wilaya ? t("cart.choose_commune") : t("cart.choose_wilaya_first")}</option>
                      {wilayaCommunes.map(([ar, latin]) => (
                        <option key={latin} value={ar}>{lang === "ar" ? ar : latin}</option>
                      ))}
                    </select>
                    <div className={`field-error${errors.commune ? " show" : ""}`}>{t("cart.err_commune")}</div>
                  </div>
                  <div className="form-row">
                    <label>{t("cart.f_address")}</label>
                    <input type="text" placeholder={t("cart.ph_address")} value={city} onChange={(e) => setCity(e.target.value)} autoComplete="street-address" />
                  </div>
                  <div className="form-row">
                    <label>{t("cart.dtype")}</label>
                    <div className="radio-cards">
                      <div className={`radio-card${effectiveType === "home" ? " active" : ""}`} onClick={() => setDeliveryType("home")}>
                        <Icon3D name="home" size={40} />
                        {t("cart.dtype_home")}
                      </div>
                      {officeAvailable && (
                        <div className={`radio-card${effectiveType === "office" ? " active" : ""}`} onClick={() => setDeliveryType("office")}>
                          <Icon3D name="route" size={40} />
                          {t("cart.dtype_office")}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-row">
                    <label>{t("cart.f_notes")}</label>
                    <textarea rows={2} placeholder={t("cart.ph_notes")} value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </div>
                  <div className="hp-field" aria-hidden="true">
                    <label>Website<input type="text" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} /></label>
                  </div>
                  {saveError && <p className="field-error show" role="alert" style={{ marginBottom: 10 }}>{t("cart.save_err")}</p>}
                  <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={sending}>{sending ? t("cart.sending") : <><Icon name="checkCircle" size={19} />{t("cart.submit")}</>}</button>
                  <p style={{ textAlign: "center", color: "var(--muted)", fontSize: ".82rem", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon name="cash" size={16} />{t("cart.cod_note")}</p>
                  <p className="checkout-policies">
                    {t("cart.agree_pre")} <Link to="/policies#terms">{t("footer.terms")}</Link> · <Link to="/policies#returns">{t("footer.returns")}</Link>
                  </p>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
