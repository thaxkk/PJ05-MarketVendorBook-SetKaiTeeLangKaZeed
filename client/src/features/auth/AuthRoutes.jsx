import { Link, Route } from "react-router-dom";

export default [
  <Route key="login" path="/login" element={<section><h1>เข้าสู่ระบบ</h1><p>พื้นที่ทำงานของสมาชิก 1</p><Link to="/spots">ดูพื้นที่ขาย</Link></section>} />,
  <Route key="register" path="/register" element={<section><h1>สมัครสมาชิก</h1><p>พื้นที่ทำงานของสมาชิก 1</p><Link to="/spots">ดูพื้นที่ขาย</Link></section>} />,
];
