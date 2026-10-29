import { Link, Route, Routes } from "react-router-dom";
import RequireRole from "../../shared/auth/RequireRole.jsx";

export default function BookingRoutes() {
  return (
    <Routes>
      <Route index element={<section><h1>การจอง</h1><p>รายการจองและการจัดการ: งานของสมาชิก 2</p><Link to="/bookings/new">สร้างการจอง</Link></section>} />
      <Route path="new" element={<RequireRole roles={["member"]}><section><h1>สร้างการจอง</h1><p>พื้นที่ทำงานของสมาชิก 2</p></section></RequireRole>} />
      <Route path=":id" element={<section><h1>รายละเอียดการจอง</h1><p>พื้นที่ทำงานของสมาชิก 2</p></section>} />
    </Routes>
  );
}
