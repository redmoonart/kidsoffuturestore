import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import ScrollProgressBar from "./components/ScrollProgressBar";
import BackToTop from "./components/BackToTop";
import WhatsAppButton from "./components/WhatsAppButton";
import { useCart } from "./cart/CartContext";
import { initPixel, track } from "./lib/pixel";
import { useI18n } from "./i18n/I18nContext";
import Home from "./pages/Home";

const Shop = lazy(() => import("./pages/Shop"));
const Product = lazy(() => import("./pages/Product"));
const Cart = lazy(() => import("./pages/Cart"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Policies = lazy(() => import("./pages/Policies"));
const AdminApp = lazy(() => import("./admin/AdminApp"));

function ScrollToTop() {
  const { pathname } = useLocation();
  const { closeDrawer } = useCart();
  useEffect(() => {
    window.scrollTo(0, 0);
    closeDrawer();
    initPixel();
    track("PageView");
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function App() {
  const { pathname } = useLocation();
  const { t } = useI18n();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    );
  }

  return (
    <>
      <ScrollProgressBar />
      <ScrollToTop />
      <a href="#main" className="skip-link">{t("aria.skip")}</a>
      <Header />
      <main id="main" tabIndex={-1}>
      <Suspense fallback={<div className="route-loading" aria-hidden="true" />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
      </main>
      <Footer />
      <CartDrawer />
      <BackToTop />
      <WhatsAppButton />
    </>
  );
}
