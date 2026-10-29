import { Link, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./shared/auth/AuthContext.jsx";
import RequireRole from "./shared/auth/RequireRole.jsx";
import AuthRoutes from "./features/auth/AuthRoutes.jsx";
import SpotRoutes from "./features/spots/SpotRoutes.jsx";
import BookingRoutes from "./features/bookings/BookingRoutes.jsx";

export default function App() {
  const { user, signOut } = useAuth();

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/spots">Night Market</Link>
        <nav aria-label="เมนูหลัก">
          <Link to="/spots">พื้นที่ขาย</Link>
          {user && <Link to="/bookings">การจอง</Link>}
          {user?.role === "admin" && <Link to="/admin/spots">จัดการพื้นที่</Link>}
          {!user && <Link to="/login">เข้าสู่ระบบ</Link>}
          {!user && <Link to="/register">สมัครสมาชิก</Link>}
          {user && <button type="button" onClick={() => signOut().catch(() => {})}>ออกจากระบบ</button>}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/spots" replace />} />
          {AuthRoutes}
          {SpotRoutes}
          <Route path="/bookings/*" element={<RequireRole><BookingRoutes /></RequireRole>} />
          <Route path="*" element={<section><h1>ไม่พบหน้านี้</h1><Link to="/spots">กลับไปดูพื้นที่ขาย</Link></section>} />
        </Routes>
      </main>
    </div>
  );
}
