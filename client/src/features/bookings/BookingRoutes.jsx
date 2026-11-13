import { useCallback, useEffect, useId, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "../../shared/api/client.js";
import { useAuth } from "../../shared/auth/AuthContext.jsx";
import RequireRole from "../../shared/auth/RequireRole.jsx";
import { formatBaht, formatSpotSize, formatThaiDate, todayUTC, utcDate } from "../../shared/format.js";
import { EmptyState, ErrorNotice, Loading, PageHeading, SuccessNotice } from "../../shared/ui.jsx";
import BookingCalendar from "./BookingCalendar.jsx";
import BookingPass from "./BookingPass.jsx";

function ownerName(user) {
  return user?.name || "—";
}

function BookingCard({ booking, admin }) {
  const { search } = useLocation();
  return <Link className="booking-card" to={`/bookings/${booking._id}`} state={{ bookingListSearch: search }}><div className="booking-date"><strong>{utcDate(booking.bookingDate).slice(8, 10)}</strong><span>{formatThaiDate(booking.bookingDate).split(" ")[1] || ""}</span></div><div className="booking-card-main"><span className="eyebrow">BOOKING / {booking.spot?.zone || "ZONE"}</span><h3>พื้นที่ {booking.spot?.spotNumber || "ไม่พบพื้นที่"}</h3><p>{booking.storeName ? `${booking.storeName} · ` : ""}{booking.productType}{admin && booking.user?.name ? ` · โดย ${ownerName(booking.user)}` : ""}</p></div><div className="booking-card-end"><span className="status-chip">ยืนยันการจอง</span><span className="card-arrow">↗</span></div></Link>;
}

function BookingList() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const load = useCallback(async () => { setLoading(true); setError(null); try { setBookings(await api("/api/v1/bookings")); } catch (caught) { setError(caught); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const admin = user?.role === "admin";
  const listView = params.get("view") === "list";
  function setView(view) {
    setParams((current) => { const next = new URLSearchParams(current); next.set("view", view); return next; });
  }
  return <div className="container content-section">
    <PageHeading eyebrow={admin ? "ADMIN / ALL BOOKINGS" : "MY MARKET / BOOKINGS"} title={admin ? "การจองทั้งหมด" : "การจองของฉัน"} description={admin ? "ตรวจสอบและจัดการการจองของผู้ค้าทุกคน" : "ทุกพื้นที่และทุกวันที่คุณเตรียมเปิดร้าน อยู่ที่นี่"} action={!admin && <Link className="button button-primary" to="/bookings/new">+ สร้างการจอง</Link>} />
    <div className="booking-summary"><div><span className="eyebrow">TOTAL BOOKINGS</span><strong>{loading ? "—" : String(bookings.length).padStart(2, "0")}</strong><small>{admin ? "การจองในระบบ" : "การจองของคุณ"}</small></div><div className="summary-note"><span>✳</span><p>หนึ่งพื้นที่ต่อหนึ่งผู้ค้าในแต่ละวัน<br />สมาชิกจองได้สูงสุด 3 พื้นที่ต่อวัน</p></div></div>
    {loading ? <Loading /> : error ? <ErrorNotice error={error} onRetry={load} /> : <>
      <div className="booking-view-toolbar"><h2>ดูรายการจอง</h2><div className="booking-view-toggle" role="group" aria-label="รูปแบบรายการจอง"><button type="button" aria-pressed={!listView} onClick={() => setView("calendar")}>ปฏิทิน</button><button type="button" aria-pressed={listView} onClick={() => setView("list")}>รายการทั้งหมด</button></div></div>
      {listView ? bookings.length ? <div className="booking-list">{bookings.map((booking) => <BookingCard key={booking._id} booking={booking} admin={admin} />)}</div> : <EmptyState title={admin ? "ยังไม่มีการจอง" : "ยังไม่มีการจองของคุณ"} description={admin ? "การจองของสมาชิกจะแสดงที่นี่" : "เลือกพื้นที่ที่ใช่และเริ่มจองวันขายของคุณ"} actionLabel={admin ? undefined : "สำรวจพื้นที่"} actionTo={admin ? undefined : "/spots"} /> : <BookingCalendar bookings={bookings} admin={admin} renderBooking={(booking) => <BookingCard key={booking._id} booking={booking} admin={admin} />} />}
    </>}
  </div>;
}

function BookingForm({ initial, spots, onSubmit, busy, submitLabel }) {
  const id = useId();
  const initialSpotId = initial?.spot?._id || initial?.spot || "";
  const [spot, setSpot] = useState(initialSpotId);
  const [zone, setZone] = useState(() => spots.find((item) => item._id === initialSpotId)?.zone || "");
  const [bookingDate, setBookingDate] = useState(utcDate(initial?.bookingDate) || "");
  const [storeName, setStoreName] = useState(initial?.storeName || "");
  const [productType, setProductType] = useState(initial?.productType || "");
  const [validation, setValidation] = useState("");
  const selectedSpot = spots.find((item) => item._id === spot);
  const activeSelected = Boolean(selectedSpot);
  const zones = [...new Set(spots.map((item) => item.zone))].sort((a, b) => a.localeCompare(b, "th"));
  const visibleSpots = zone ? spots.filter((item) => item.zone === zone) : spots;
  function selectZone(event) {
    const nextZone = event.target.value;
    setZone(nextZone);
    if (nextZone && selectedSpot?.zone !== nextZone) setSpot("");
  }
  function submit(event) {
    event.preventDefault();
    setValidation("");
    if (!spot || !activeSelected) { setValidation("กรุณาเลือกพื้นที่ที่เปิดใช้งาน"); return; }
    const parsedDate = new Date(`${bookingDate}T00:00:00Z`);
    if (!bookingDate || bookingDate < todayUTC() || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== bookingDate) { setValidation("กรุณาเลือกวันนี้หรือวันที่จริงในอนาคต"); return; }
    if (!storeName.trim()) { setValidation("กรุณาระบุชื่อร้าน"); return; }
    if (!productType.trim()) { setValidation("กรุณาระบุประเภทสินค้าที่จะขาย"); return; }
    onSubmit({ spot, bookingDate, storeName: storeName.trim(), productType: productType.trim() });
  }
  return (
    <form className="form-stack booking-form" onSubmit={submit}>
      <div className="form-intro"><span className="eyebrow">01 / YOUR SPOT</span><h2>เลือกพื้นที่และวันขาย</h2><p>ความว่างของพื้นที่จะตรวจสอบอีกครั้งเมื่อยืนยันการจอง</p></div>
      {initialSpotId && !selectedSpot && !spots.some((item) => item._id === initialSpotId) && <div className="notice notice-error" role="alert">พื้นที่เดิมไม่อยู่ในรายการที่เปิดใช้งาน กรุณาเลือกพื้นที่ใหม่</div>}
      <div className="choice-field">
        <label htmlFor={`${id}-zone`}>โซนที่ต้องการ</label>
        <select id={`${id}-zone`} value={zone} onChange={selectZone} disabled={busy}>
          <option value="">ทุกโซน</option>
          {zones.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <div className="choice-field">
        <label htmlFor={`${id}-spot`}>พื้นที่ขาย</label>
        <select id={`${id}-spot`} name="spot" value={spot} onChange={(event) => setSpot(event.target.value)} required disabled={busy || !visibleSpots.length}>
          <option value="">เลือกล็อกจากรายการ</option>
          {visibleSpots.map((item) => <option key={item._id} value={item._id}>พื้นที่ {item.spotNumber} · {item.zone} · {formatSpotSize(item.spotSize)} · {formatBaht(item.rentalFee)}/วัน</option>)}
        </select>
      </div>
      {selectedSpot && <div className="selected-spot-summary" aria-live="polite"><div><span className="eyebrow">พื้นที่ที่เลือก</span><strong>ล็อก {selectedSpot.spotNumber}</strong><p>{selectedSpot.zone} · {formatSpotSize(selectedSpot.spotSize)}</p><small>{selectedSpot.locationDescription}</small></div><b>{formatBaht(selectedSpot.rentalFee)}<small>/ วัน</small></b></div>}
      <label>วันที่ต้องการใช้พื้นที่<input type="date" value={bookingDate} min={todayUTC()} onChange={(event) => setBookingDate(event.target.value)} required /></label>
      <div className="form-intro form-intro-second"><span className="eyebrow">02 / YOUR BUSINESS</span><h2>บอกเราเกี่ยวกับร้านคุณ</h2></div>
      <label>ชื่อร้าน<input value={storeName} onChange={(event) => setStoreName(event.target.value)} maxLength={100} required placeholder="เช่น ร้านดาวเหนือ" /></label>
      <label>ประเภทสินค้าที่จะขาย<input value={productType} onChange={(event) => setProductType(event.target.value)} required placeholder="เช่น อาหารและเครื่องดื่ม / งานฝีมือ" /></label>
      {validation && <div className="notice notice-error" role="alert">{validation}</div>}
      <div className="form-actions"><button type="submit" className="button button-primary" disabled={busy || !spots.length}>{busy ? "กำลังบันทึก..." : submitLabel} <span aria-hidden="true">↗</span></button></div>
    </form>
  );
}

function NewBooking() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { setLoading(true); setError(null); try { setSpots(await api("/api/v1/spots")); } catch (caught) { setError(caught); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  async function submit(body) { setBusy(true); setError(null); try { const booking = await api("/api/v1/bookings", { method: "POST", body }); navigate(`/bookings/${booking._id}`, { replace: true, state: { created: true } }); } catch (caught) { setError(caught); } finally { setBusy(false); } }
  return <div className="container content-section"><Link className="back-link" to="/spots">← กลับไปเลือกพื้นที่</Link><PageHeading eyebrow="NEW BOOKING / LET'S GO" title="จองพื้นที่ขาย" description="อีกไม่กี่ขั้นตอน ร้านของคุณก็พร้อมเป็นส่วนหนึ่งของค่ำคืนนี้" /><div className="form-page-layout"><div className="panel form-panel"><ErrorNotice error={error} />{loading ? <Loading /> : spots.length ? <BookingForm key={`${params.get("spot") || "new"}-${params.get("date") || ""}`} initial={{ spot: params.get("spot") || "", bookingDate: params.get("date") || "" }} spots={spots} onSubmit={submit} busy={busy} submitLabel="ยืนยันการจอง" /> : <EmptyState title="ยังไม่มีพื้นที่เปิดให้จอง" description="กรุณาติดต่อผู้ดูแลหรือแวะกลับมาใหม่" actionLabel="ดูพื้นที่" actionTo="/spots" />}</div><aside className="booking-aside"><span className="aside-spark">✳</span><span className="eyebrow">GOOD TO KNOW</span><h2>คืนนี้เป็นของคุณ</h2><p>เลือกพื้นที่ที่เข้ากับร้าน แล้วเจอกันในตลาด!</p><ul><li>จองได้สูงสุด 3 พื้นที่ต่อวัน</li><li>หนึ่งพื้นที่รับผู้ค้าหนึ่งรายต่อวัน</li><li>วันที่จองต้องเป็นวันนี้หรืออนาคต</li></ul><span className="aside-bottom">BANGKOK / NIGHT MARKET</span></aside></div></div>;
}

function BookingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const listSearch = typeof location.state?.bookingListSearch === "string" ? location.state.bookingListSearch : "";
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { setLoading(true); setError(null); try { const [current, activeSpots] = await Promise.all([api(`/api/v1/bookings/${id}`), api("/api/v1/spots")]); setBooking(current); setSpots(activeSpots); } catch (caught) { setError(caught); } finally { setLoading(false); } }, [id]);
  useEffect(() => { load(); }, [load]);
  async function update(body) { setBusy(true); setError(null); setSuccess(""); try { const updated = await api(`/api/v1/bookings/${id}`, { method: "PUT", body }); setBooking(updated); setEditing(false); setSuccess("แก้ไขการจองเรียบร้อยแล้ว"); } catch (caught) { setError(caught); } finally { setBusy(false); } }
  async function remove() { if (!window.confirm("ลบการจองนี้? พื้นที่ในวันดังกล่าวจะกลับมาว่างอีกครั้ง")) return; setBusy(true); setError(null); try { await api(`/api/v1/bookings/${id}`, { method: "DELETE" }); navigate(`/bookings${listSearch}`, { replace: true }); } catch (caught) { setError(caught); setBusy(false); } }
  return <div className="container content-section booking-detail-page"><Link className="back-link" to={`/bookings${listSearch}`}>{user?.role === "admin" ? "← กลับไปการจองทั้งหมด" : "← กลับไปการจองของฉัน"}</Link>{loading ? <Loading /> : error && !booking ? <ErrorNotice error={error} onRetry={load} /> : booking && <><PageHeading eyebrow={`BOOKING / ${booking._id.slice(-6).toUpperCase()}`} title={editing ? "แก้ไขการจอง" : "รายละเอียดการจอง"} description={editing ? "เลือกพื้นที่ วัน ชื่อร้าน และประเภทสินค้าใหม่" : "พร้อมแล้วสำหรับวันเปิดร้านของคุณ"} /><ErrorNotice error={error} /><SuccessNotice>{success}</SuccessNotice><div className="form-page-layout"><div className="panel detail-booking-panel">{editing ? <><BookingForm key={booking._id} initial={booking} spots={spots} onSubmit={update} busy={busy} submitLabel="บันทึกการเปลี่ยนแปลง" /><button className="button button-outline" type="button" onClick={() => { setEditing(false); setError(null); }}>ยกเลิก</button></> : <><div className="booking-detail-banner"><span className="status-chip">✓ ยืนยันการจอง</span><strong>พื้นที่ {booking.spot?.spotNumber || "ไม่พบพื้นที่"}</strong><span>{booking.spot?.zone || "—"}</span></div><div className="detail-facts booking-facts"><div><span>วันที่จอง</span><strong>{formatThaiDate(booking.bookingDate)}</strong></div><div><span>ชื่อร้าน</span><strong>{booking.storeName || "—"}</strong></div><div><span>ประเภทสินค้า</span><strong>{booking.productType}</strong></div><div><span>ขนาดพื้นที่</span><strong>{formatSpotSize(booking.spot?.spotSize) || "—"}</strong></div><div><span>ตำแหน่ง</span><strong>{booking.spot?.locationDescription || "—"}</strong></div><div><span>ค่าเช่าปัจจุบัน</span><strong className="price-accent">{booking.spot ? formatBaht(booking.spot.rentalFee) : "—"}</strong></div>{booking.user?.name && <div><span>ผู้จอง</span><strong>{ownerName(booking.user)}</strong></div>}</div><div className="detail-buttons"><button type="button" className="button button-primary" onClick={() => { setEditing(true); setSuccess(""); }} disabled={busy}>แก้ไขการจอง</button><button type="button" className="button button-danger" onClick={remove} disabled={busy}>{busy ? "กำลังลบ..." : "ลบการจอง"}</button></div></>}</div>{editing ? <aside className="booking-aside"><span className="aside-spark">✳</span><span className="eyebrow">YOUR NIGHT, YOUR SPOT</span><h2>เตรียมพร้อม<br />เปิดร้าน!</h2><p>หากต้องเปลี่ยนพื้นที่หรือวันขาย คุณแก้ไขการจองได้จากหน้านี้</p><span className="aside-bottom">BANGKOK / NIGHT MARKET</span></aside> : <BookingPass booking={booking} />}</div></>}</div>;
}

export default function BookingRoutes() {
  return <Routes><Route index element={<BookingList />} /><Route path="new" element={<RequireRole roles={["member"]}><NewBooking /></RequireRole>} /><Route path=":id" element={<BookingDetail />} /></Routes>;
}
