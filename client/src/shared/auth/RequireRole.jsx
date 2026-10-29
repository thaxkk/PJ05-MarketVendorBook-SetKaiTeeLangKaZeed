import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export default function RequireRole({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p>กำลังตรวจสอบการเข้าสู่ระบบ...</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/spots" replace />;
  return children;
}
