import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "./AdminAuthContext";
import RequireAdmin from "./RequireAdmin";
import { setupAdminPwa } from "./pwa";

const AdminLogin = lazy(() => import("../pages/AdminLogin"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));

// لوحة الإدارة بالكامل في حزمة منفصلة: مكتبة Supabase الكاملة لا تُحمَّل لزوار المتجر
export default function AdminApp() {
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
