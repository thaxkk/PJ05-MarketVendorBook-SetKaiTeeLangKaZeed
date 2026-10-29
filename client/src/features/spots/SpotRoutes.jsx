import { Route } from "react-router-dom";
import RequireRole from "../../shared/auth/RequireRole.jsx";

export default [
  <Route key="spots" path="/spots" element={<section><h1>พื้นที่ขายสินค้า</h1><p>รายการพื้นที่ขายและรายละเอียด: งานของสมาชิก 1</p></section>} />,
  <Route key="spot-detail" path="/spots/:id" element={<section><h1>รายละเอียดพื้นที่</h1><p>พื้นที่ทำงานของสมาชิก 1</p></section>} />,
  <Route key="admin-spots" path="/admin/spots/*" element={<RequireRole roles={["admin"]}><section><h1>จัดการพื้นที่ขาย</h1><p>พื้นที่ทำงานของสมาชิก 1</p></section></RequireRole>} />,
];
