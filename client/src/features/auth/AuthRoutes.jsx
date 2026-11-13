import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { api } from "../../shared/api/client.js";
import { useAuth } from "../../shared/auth/AuthContext.jsx";
import { ErrorNotice } from "../../shared/ui.jsx";
import MarketCollage from "../../components/MarketCollage.jsx";

const emailPattern = /^[A-Za-z0-9_%+\x2d]+(?:\.[A-Za-z0-9_%+\x2d]+)*@(?:(?![Xx][Nn]--)[A-Za-z0-9](?:[A-Za-z0-9\x2d]*[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;
const emailMessage = "กรุณากรอกอีเมลให้ถูกต้อง เช่น name@example.com โดยไม่ใช้ภาษาไทยหรือช่องว่าง";

export function AuthPage({ mode }) {
  const register = mode === "register";
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", tel: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/spots" replace />;

  function update(event) {
    const { name, value } = event.target;
    event.target.setCustomValidity("");
    setForm((current) => ({ ...current, [name]: name === "tel" ? value.replace(/[^0-9]/g, "").slice(0, 10) : value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError(null);
    const email = form.email.trim().toLowerCase();
    let validation = "";
    if (!emailPattern.test(email) || email.length > 254 || email.split("@")[0].length > 64) validation = emailMessage;
    else if (register && (!form.name.trim() || form.name.trim().length > 100)) validation = "กรุณากรอกชื่อผู้ใช้งาน ไม่เกิน 100 ตัวอักษร";
    else if (register && !/^[0-9]{9,10}$/.test(form.tel)) validation = "เบอร์โทรศัพท์ต้องเป็นตัวเลข 9–10 หลักเท่านั้น";
    else if (register && (form.password.length < 6 || !form.password.trim())) validation = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร และไม่เป็นช่องว่างอย่างเดียว";
    else if (register && new TextEncoder().encode(form.password).length > 72) validation = "รหัสผ่านยาวเกินไป กรุณาลดจำนวนตัวอักษร";
    if (validation) { setError(new Error(validation)); return; }
    setSubmitting(true);
    try {
      const body = register ? { name: form.name.trim(), email, tel: form.tel, password: form.password } : { email, password: form.password };
      const data = await api(`/api/v1/auth/${register ? "register" : "login"}`, { method: "POST", body });
      signIn(data);
      navigate(location.state?.from?.pathname || "/spots", { replace: true });
    } catch (caught) {
      if (register && /duplicate key|E11000/i.test(caught.message)) {
        setError(new Error("อีเมลนี้ถูกใช้สมัครแล้ว กรุณาใช้อีเมลอื่น"));
      } else if (!register && /invalid credentials/i.test(caught.message)) {
        setError(new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง"));
      } else {
        setError(caught);
      }
    }
    finally { setSubmitting(false); }
  }

  return <div className="container auth-layout"><div className="auth-story"><span className="eyebrow">NIGHT MARKET / VENDOR BOOKING</span><h1>เลือกล็อกที่ชอบ<br /><em>แล้วมาเปิดร้านกัน</em></h1><p>ดูพื้นที่ เลือกวันขาย แล้วจองผ่านเว็บได้เลย</p><MarketCollage compact /><ol className="story-line" aria-label="ขั้นตอนการจอง"><li><span>01</span>เลือกพื้นที่</li><li><span>02</span>เลือกวัน</li><li><span>03</span>เปิดร้าน</li></ol></div>
    <div className="auth-card"><div className="auth-card-top"><span className="eyebrow">{register ? "NEW VENDOR / JOIN US" : "MEMBER ACCESS / WELCOME BACK"}</span><span className="auth-card-monogram" aria-hidden="true">nm</span></div><span className="auth-script" aria-hidden="true">{register ? "Join the club." : "Hello again."}</span><h2>{register ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}</h2><p>{register ? "สร้างบัญชีเพื่อจองพื้นที่ขายของในตลาด" : "เข้าสู่ระบบเพื่อดูและจัดการการจอง"}</p><ErrorNotice error={error} /><form onSubmit={submit} className="form-stack">
      {register && <><label>ชื่อผู้ใช้งาน<input name="name" value={form.name} onChange={update} required maxLength={100} pattern={".*\\S.*"} onInvalid={(event) => event.target.setCustomValidity("กรุณากรอกชื่อผู้ใช้งาน ไม่เกิน 100 ตัวอักษร")} autoComplete="name" placeholder="ชื่อของคุณ" /></label><label>เบอร์โทรศัพท์<input name="tel" type="tel" inputMode="numeric" pattern="[0-9]{9,10}" value={form.tel} onChange={update} onInvalid={(event) => event.target.setCustomValidity("เบอร์โทรศัพท์ต้องเป็นตัวเลข 9–10 หลักเท่านั้น")} required autoComplete="tel" placeholder="0812345678" title="ตัวเลข 9–10 หลักเท่านั้น" /></label></>}
      <label>อีเมล<input name="email" type="email" value={form.email} onChange={update} pattern={emailPattern.source} maxLength={254} onInvalid={(event) => event.target.setCustomValidity(emailMessage)} required autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@example.com" title="เช่น name@example.com ใช้ภาษาอังกฤษ ตัวเลข และสัญลักษณ์ในอีเมล" /></label>
      <label>รหัสผ่าน<input name="password" type="password" minLength={register ? 6 : undefined} maxLength={register ? 72 : undefined} value={form.password} onChange={update} required autoComplete={register ? "new-password" : "current-password"} placeholder={register ? "อย่างน้อย 6 ตัวอักษร" : "••••••••"} /></label>
      <button className="button button-primary button-wide" type="submit" disabled={submitting}>{submitting ? "กำลังดำเนินการ..." : register ? "สร้างบัญชี" : "เข้าสู่ระบบ"}<span aria-hidden="true">↗</span></button>
    </form><div className="auth-switch">{register ? "มีบัญชีอยู่แล้ว?" : "ยังไม่มีบัญชี?"} <Link to={register ? "/login" : "/register"} state={location.state}>{register ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</Link></div><div className="auth-card-bottom" aria-hidden="true"><span>NIGHT MARKET / VENDOR ACCESS</span><span>✧</span></div></div>
  </div>;
}
