import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import { useCart } from "../cart/CartContext";
import { CART_HIT_EVENT } from "../lib/cartFx";
import SearchOverlay from "./SearchOverlay";

const LANGS = [
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
];

export default function Header() {
  const { t, setLang, meta } = useI18n();
  const { count, openDrawer } = useCart();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const cartIcRef = useRef(null);
  const badgeRef = useRef(null);

  // ارتداد أيقونة السلة لحظة وصول المنتج الطائر إليها
  useEffect(() => {
    function onHit() {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      cartIcRef.current?.animate(
        [
          { transform: "translateY(0) rotate(0) scale(1)" },
          { transform: "translateY(3px) rotate(0) scale(1.15, .8)", offset: 0.15 },
          { transform: "translateY(-7px) rotate(-14deg) scale(.95, 1.1)", offset: 0.4 },
          { transform: "translateY(0) rotate(10deg) scale(1)", offset: 0.62 },
          { transform: "rotate(-5deg)", offset: 0.8 },
          { transform: "translateY(0) rotate(0) scale(1)" },
        ],
        { duration: 620, easing: "ease-out" }
      );
      const badge = badgeRef.current;
      if (badge) {
        badge.classList.remove("bump");
        void badge.offsetWidth;
        badge.classList.add("bump");
      }
    }
    window.addEventListener(CART_HIT_EVENT, onHit);
    return () => window.removeEventListener(CART_HIT_EVENT, onHit);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth > 760) setMenuOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setLangOpen(false);
        setSearchOpen(false);
      }
    }
    window.addEventListener("resize", onResize);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const current = location.pathname + location.search;

  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/shop", label: t("nav.shop") },
    { to: "/shop?cat=toys", label: t("nav.toys") },
    { to: "/shop?cat=school", label: t("nav.school") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ];

  return (
    <header className={`header${scrolled ? " scrolled" : ""}`}>
      <div className="wrap header-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="logo logo-img">
            <span className="logo-rocket" aria-hidden="true">🚀</span>
          </span>
          <span className="brand-word">
            <span className="brand-line1">Kids</span>
            <span className="brand-line2">of the Future</span>
          </span>
        </Link>
        <nav className={`nav${menuOpen ? " open" : ""}`}>
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className={current === l.to ? "active" : undefined} onClick={closeMenu}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className={`nav-scrim${menuOpen ? " open" : ""}`} onClick={closeMenu} />
        <div className="header-actions">
          <div className={`lang-switch${langOpen ? " open" : ""}`}>
            <button
              className="lang-btn"
              aria-label={t("aria.lang")}
              onClick={(e) => {
                e.stopPropagation();
                setLangOpen((o) => !o);
              }}
            >
              🌐 <span>{meta.short}</span>
            </button>
            <div className="lang-menu">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code);
                    setLangOpen(false);
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="search-bar-trigger"
            aria-label={t("aria.search")}
            onClick={() => {
              closeMenu();
              setSearchOpen(true);
            }}
          >
            <span className="ph">{t("shop.search_ph")}</span>
            <span className="ic" aria-hidden="true">🔍</span>
          </button>
          <button
            type="button"
            className="search-btn"
            aria-label={t("aria.search")}
            onClick={() => {
              closeMenu();
              setSearchOpen(true);
            }}
          >
            🔍
          </button>
          <button
            type="button"
            className="cart-btn"
            aria-label={t("aria.cart")}
            onClick={() => {
              closeMenu();
              openDrawer();
            }}
          >
            <span className="cart-ic" ref={cartIcRef}>🛒</span>
            <span ref={badgeRef} className="count cart-count" style={{ display: count > 0 ? "grid" : "none" }}>{count}</span>
          </button>
          <button className="menu-toggle" aria-label={t("aria.menu")} onClick={() => setMenuOpen((o) => !o)}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
