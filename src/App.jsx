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
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { AdminAuthProvider } from "./admin/AdminAuthContext";
import RequireAdmin from "./admin/RequireAdmin";
import { setupAdminPwa } from "./admin/pwa";

const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

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
    setupAdminPwa(); // تطبيق "إدارة متجري" (مرة واحدة فقط)
    return (
      <AdminAuthProvider>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminDashboard />
                </RequireAdmin>
              }
            />
          </Routes>
        </Suspense>
      </AdminAuthProvider>
    );
  }

  return (
    <>
      <ScrollProgressBar />
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
      <CartDrawer />
      <BackToTop />
      <WhatsAppButton />
    </>
  );
}
