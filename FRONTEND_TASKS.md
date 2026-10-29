# แผนงาน Frontend สำหรับสมาชิก 2 คน

เอกสารนี้แบ่งงานพัฒนา frontend จากข้อกำหนดใน `2026-PJ05-Init.md` และ `2026-PJ05.md` โดย backend API มีอยู่แล้วใน repository นี้ ส่วน `client/` เป็นโครง React + Vite เริ่มต้น ยังมีหน้า placeholder ที่ต้องพัฒนาต่อ

## ข้อตกลงร่วมกันก่อนเริ่ม

1. **ขอบเขตและหน้าตา UI:** ตกลงภาษาที่ใช้บนหน้าจอ, wireframe อย่างง่ายของหน้า login/register, รายการและรายละเอียดพื้นที่, รายการและฟอร์มการจอง, รวมถึงสีและรูปแบบ component ก่อนลงมือ เพื่อให้สองส่วนต่อกันได้
2. **สัญญา API:** ใช้ `api(path, options)` จาก `client/src/shared/api/client.js` เท่านั้นสำหรับ API หลัก ฟังก์ชันนี้คืนค่า `data` จาก `{ success, data }` และโยน `ApiError` ที่มี `status` เมื่อผิดพลาด รายการคืนเป็น array ส่วน backend ใช้ `_id` เป็น ID ของ spot/booking
3. **Authentication:** `useAuth()` คืน `{ user, loading, signIn, signOut }`; หลัง login/register เรียก `signIn(data)` โดย `data` ต้องมี `token` และ `role` การ refresh หน้าจะเรียก `/api/v1/auth/me` เอง ทุก protected request แนบ Bearer token จากส่วนกลาง ห้ามใช้ cookie เพียงอย่างเดียว
4. **เส้นทางหน้า:** `/login`, `/register`, `/spots`, `/spots/:id`, `/admin/spots/*`, `/bookings`, `/bookings/new`, `/bookings/:id` หากจะเพิ่มหรือเปลี่ยน path ให้คุยกันก่อน เพราะอาจกระทบลิงก์ข้ามส่วน
5. **ข้อมูลและวันที่:** Booking request ใช้ `{ spot: <spot._id>, bookingDate: "YYYY-MM-DD", productType }`; วันในระบบอ้างอิง UTC และ response เป็น ISO timestamp เที่ยงคืน UTC ให้แปลงเป็นวันที่ `YYYY-MM-DD` โดยใช้ส่วนวันที่ของ ISO ไม่แปลงเป็น local date แบบที่อาจเลื่อนวัน
6. **การตรวจสิทธิ์และความว่าง:** UI ซ่อนหรือป้องกัน action ตาม role แต่ backend เป็นผู้ตัดสินขั้นสุดท้าย การดู `/spots` ยังไม่ยืนยันว่าพื้นที่ว่างในวันจอง ต้องจัดการข้อผิดพลาด `409` จากการสร้าง/แก้ไข booking
7. **รูปแบบการรวมงาน:** แยก branch/PR คนละชุด ไม่แก้ไฟล์ที่อีกคนเป็นเจ้าของโดยตรง หากจำเป็นต้องแก้ไฟล์ร่วม ให้เปิด issue หรือคุยกันและระบุผู้แก้เพียงคนเดียวในรอบนั้น รวมงานทีละ PR แล้วทดสอบ flow ร่วมกัน

## สมาชิก 1: โครงแอป, Auth, Spots

**เจ้าของไฟล์หลัก:** `client/src/features/auth/**`, `client/src/features/spots/**`, `client/src/shared/**`, `client/src/App.jsx`, `client/src/styles.css`, `client/package.json`, `client/vite.config.js`

- [ ] ทำหน้า register (`name`, `email`, `tel`, `password`, `role`) และ login (`email`, `password`) พร้อม validation และ error state
- [ ] หลังสำเร็จ เรียก `signIn(data)` และพาไปหน้าที่เหมาะสม; ทำ logout ผ่าน `signOut()` และแสดงเมนูตาม role
- [ ] ทำหน้า `/spots` และ `/spots/:id` จาก `GET /api/v1/spots` และ `GET /api/v1/spots/:id` สำหรับทุกคน
- [ ] ทำหน้า admin สำหรับเพิ่ม/แก้ไข/ปิดใช้งาน spot ด้วย `POST/PUT/DELETE /api/v1/spots` และข้อมูล `spotNumber`, `zone`, `spotSize`, `locationDescription`, `rentalFee`
- [ ] ดูแล component/style กลาง, loading/empty/error state และ responsive layout โดยแจ้งสมาชิก 2 เมื่อเปลี่ยน interface ที่ใช้งานร่วมกัน

**เกณฑ์เสร็จ:** ผู้ใช้สมัคร/เข้าสู่ระบบได้, refresh แล้วยังตรวจ session ได้, ทุกคนดู spot ที่เปิดใช้งานได้, admin จัดการ spot ได้, member เข้า action ของ admin ไม่ได้

## สมาชิก 2: Bookings และตรวจ flow

**เจ้าของไฟล์หลัก:** `client/src/features/bookings/**` (สร้างไฟล์ย่อยภายใน folder นี้ได้) ไม่แก้ `App.jsx` เพื่อเพิ่ม route; ให้เพิ่ม route ภายใน `BookingRoutes.jsx`

- [ ] ทำหน้า `/bookings`: member เห็นเฉพาะของตน, admin เห็นทั้งหมดตาม API; แสดงข้อมูล spot/user ที่ populate และสถานะว่าง/โหลด/ผิดพลาด
- [ ] ทำหน้า `/bookings/new` สำหรับ member โดยรับ spot ID (รองรับลิงก์จากหน้ารายละเอียด spot), วัน และ `productType`; ส่ง `POST /api/v1/bookings`
- [ ] ทำหน้า `/bookings/:id` เพื่อดูรายละเอียด แก้ไข `spot`, `bookingDate`, `productType` ผ่าน `PUT` และลบผ่าน `DELETE` โดย owner หรือ admin
- [ ] แสดงข้อความที่เข้าใจได้เมื่อ backend ตอบ `400`, `401`, `403`, `404`, `409`, `429` โดยเฉพาะ spot ถูกจองแล้วและเกิน 3 spots ต่อสมาชิกต่อวัน
- [ ] ตรวจ flow ด้วยบัญชี member และ admin และบันทึก bug ที่เกี่ยวกับส่วนกลางให้สมาชิก 1 แก้หรือคุยกันก่อนแก้ร่วม

**เกณฑ์เสร็จ:** member สร้าง/ดู/แก้/ลบการจองของตนได้, admin ดู/แก้/ลบของทุกคนได้แต่สร้างไม่ได้, การจองซ้ำและเกินเพดานแสดง error ที่เหมาะสม

## ลำดับการทำงานและจุดส่งต่องาน

1. สมาชิก 1 ยืนยัน interface ของ `api()`/`useAuth()`, route และ layout ในโครงเริ่มต้นนี้; ทั้งคู่ตกลง wireframe และ branch ก่อนเริ่ม
2. ทำงานคู่ขนานใน folder ที่รับผิดชอบ สมาชิก 2 ใช้ `api()`/`useAuth()` ที่มีอยู่และแจ้งความต้องการเปลี่ยน shared code ก่อนแก้
3. รวมงานแล้วทดสอบ: admin สมัครและสร้าง spot → member สมัครและจอง → member แก้/ลบ → admin ดู/แก้/ลบ booking → ทดสอบ 409, role restriction และ refresh/login/logout
4. ตรวจ frontend ด้วย `npm run build` ใน `client/`; ทดสอบกับ MongoDB จริง เพราะ `npm test` ที่ root ตรวจ syntax backend เท่านั้น

## สิ่งที่ต้องเตรียมสำหรับทดสอบร่วมกัน

- Backend ที่ `http://localhost:5001`, frontend ที่ `http://localhost:3000`; Vite proxy `/api` ไป backend (เครื่องนี้มี macOS Control Center ใช้ port 5000)
- คัดลอก `config/config.example.env` เป็น `config/config.env` แล้วตั้ง `MONGO_URI` ให้เชื่อมต่อ test database ก่อนทดสอบ API ที่ใช้ข้อมูล; ไฟล์จริงถูก ignore โดย Git
- ข้อมูลทดสอบ: บัญชี `admin` และ `member` แยกกัน, spot อย่างน้อย 4 จุด, วันที่วันนี้/อนาคตหลายวัน
- Backend อนุญาตเลือก role `admin` ในการ register ตามข้อกำหนดปัจจุบัน; สำหรับระบบใช้งานจริงควรตกลงวิธีให้สิทธิ์ admin ก่อน deploy
