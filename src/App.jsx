import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import ScrollProgressBar from "./components/ScrollProgressBar";
import BackToTop from "./components/BackToTop";
import WhatsAppButton from "./components/WhatsAppButton";
import { useCart } from "./cart/CartContext";
import Home from "./pages/Home";

const Shop = lazy(() => import("./pages/Shop"));
const Product = lazy(() => import("./pages/Product"));
const Cart = lazy(() => import("./pages/Cart"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Policies = lazy(() => import("./pages/Policies"));
const AdminApp = lazy(() => import("./admin/AdminApp"));

function ScrollToTop() {
  const { pathname } = useLocation();
  const { closeDrawer } = useCart();
  useEffect(() => {
    window.scrollTo(0, 0);
    closeDrawer();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function App() {
  const { pathname } = useLocation();
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
      <Header />
      <Suspense fallback={<div className="route-loading" aria-hidden="true" />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/policies" element={<Policies />} />
      </Routes>
      </Suspense>
      <Footer />
      <CartDrawer />
      <BackToTop />
      <WhatsAppButton />
    </>
  );
}
