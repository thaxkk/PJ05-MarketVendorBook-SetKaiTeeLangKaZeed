import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../shared/api/client.js";
import { useAuth } from "../../shared/auth/AuthContext.jsx";
import { formatBaht, formatSpotSize } from "../../shared/format.js";
import { EmptyState, ErrorNotice, Loading, PageHeading, SuccessNotice } from "../../shared/ui.jsx";
import MarketCollage from "../../components/MarketCollage.jsx";
import SelectOrCreate from "../../components/SelectOrCreate.jsx";
import DeleteZoneDialog from "../../components/DeleteZoneDialog.jsx";

function SpotCard({ spot }) {
  return (
    <Link className={`spot-card${spot.zone.trim() === "เสื้อผ้า" ? " spot-card--clothing" : ""}`} to={`/spots/${spot._id}`} aria-label={`ดูรายละเอียดพื้นที่ ${spot.spotNumber} โซน ${spot.zone}`}>
      <div className="spot-art" aria-hidden="true"><span className="art-zone">NIGHT MARKET / {spot.zone}</span><span className="art-number-label">VENDOR SPOT</span><strong>{spot.spotNumber}</strong><span className="art-caption">A SPACE FOR YOUR STORY</span><span className="art-barcode" /></div>
      <div className="spot-card-body"><div className="spot-card-top"><span className="zone-tag"><span className="online-dot" />{spot.zone}</span></div><h3>พื้นที่ {spot.spotNumber}</h3><p>{spot.locationDescription}</p><div className="spot-meta"><span>◫ &nbsp;{formatSpotSize(spot.spotSize)}</span><span>โซน {spot.zone}</span></div><div className="spot-card-footer"><div><small>ค่าเช่าต่อวัน</small><strong>{formatBaht(spot.rentalFee)}<span> / วัน</span></strong></div><span className="round-link" aria-hidden="true">↗</span></div></div>
    </Link>
  );
}

export function SpotList() {
  const { user } = useAuth();
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState("all");
  const load = useCallback(async () => { setLoading(true); setError(null); try { setSpots(await api("/api/v1/spots")); } catch (caught) { setError(caught); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const zones = useMemo(() => [...new Set(spots.map((spot) => spot.zone))], [spots]);
  const visible = spots.filter((spot) => (zone === "all" || spot.zone === zone) && `${spot.spotNumber} ${spot.zone} ${spot.locationDescription}`.toLowerCase().includes(query.toLowerCase()));

  return <>
    <div className="hero">
      <div className="hero-grid container">
        <div className="hero-copy">
          <span className="hero-kicker"><span aria-hidden="true">✦</span> THE NIGHT MARKET SOCIAL CLUB <span className="kicker-edition">BKK / 01</span></span>
          <div className="hero-mini-note">for the dreamers & the doers ↗</div>
          <h1><span>พื้นที่เล็ก</span><br /><em>ฝันไม่เล็ก!</em><span className="headline-spark" aria-hidden="true">✳</span></h1>
          <div className="hero-handwritten" aria-hidden="true">your next big thing.</div>
          <p>เอาไอเดียมาเปิดร้าน เอาความฝันมาเปิดตัว<br />เลือกมุมที่เป็นคุณ แล้วมาเติมสีสันให้ค่ำคืนนี้ด้วยกัน</p>
          <div className="hero-actions"><a className="button button-primary" href="#explore">หาที่ให้ร้านคุณ <span aria-hidden="true">↗</span></a>{!user && <Link className="hero-register" to="/register">มาเป็นชาวตลาด <span aria-hidden="true">→</span></Link>}</div>
          <div className="hero-stats">
            <div><strong>{loading || error ? "—" : String(spots.length).padStart(2, "0")}</strong><span>พื้นที่ให้ปล่อยของ</span></div>
            <div><strong>{loading || error ? "—" : String(zones.length).padStart(2, "0")}</strong><span>โซนที่มีคาแรกเตอร์</span></div>
            <div><strong>03</strong><span>ล็อคสูงสุดต่อวัน</span></div>
            <span className="stats-stamp" aria-hidden="true"><b>SEE YOU</b><em>tonight!</em></span>
          </div>
        </div>
        <div className="hero-visual"><MarketCollage /></div>
      </div>
      <div className="hero-bottom container"><span>13°45′N 100°30′E / BANGKOK, THAILAND</span><span>SCROLL TO FIND YOUR LITTLE CORNER ↓</span></div>
    </div>
    <section id="explore" className="container content-section"><PageHeading eyebrow="FIND YOUR CORNER / 01" title="เลือกมุมที่เป็นคุณ" description="แต่ละพื้นที่มีเสน่ห์ต่างกัน มาหาพื้นที่ที่เข้ากับร้านของคุณ" action={user?.role === "admin" && <Link className="button button-outline" to="/admin/spots">จัดการพื้นที่ ↗</Link>} /><div className="filter-bar"><div className="search-field"><span aria-hidden="true">⌕</span><input aria-label="ค้นหาพื้นที่" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาหมายเลขพื้นที่ โซน หรือตำแหน่ง..." /></div><select aria-label="เลือกโซน" value={zone} onChange={(event) => setZone(event.target.value)}><option value="all">ทุกโซน</option>{zones.map((item) => <option key={item} value={item}>{item}</option>)}</select><span className="result-count">{visible.length} พื้นที่</span></div>
      {loading ? <Loading /> : error ? <ErrorNotice error={error} onRetry={load} /> : visible.length ? <div className="spot-grid">{visible.map((spot) => <SpotCard key={spot._id} spot={spot} />)}</div> : <EmptyState title={spots.length ? "ไม่พบพื้นที่ที่ค้นหา" : "ยังไม่มีพื้นที่เปิดให้จอง"} description={spots.length ? "ลองเปลี่ยนคำค้นหรือเลือกโซนอื่น" : "แวะกลับมาใหม่เร็ว ๆ นี้ หรือให้ผู้ดูแลเพิ่มพื้นที่ก่อน"} />}
    </section><div className="container info-strip"><span aria-hidden="true">✧</span><div><span className="eyebrow">GOOD THINGS START SMALL</span><strong>ร้านในฝัน เริ่มต้นได้จากพื้นที่เล็ก ๆ</strong><p>เลือกพื้นที่ · เลือกวัน · บอกเล่าเรื่องราวร้านคุณ แล้วมาเจอกันที่ตลาด</p></div><span className="info-strip-end">YOUR NEXT<br /><em>chapter.</em></span></div></>;
}

export function SpotDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const load = useCallback(async () => { setLoading(true); setError(null); try { setSpot(await api(`/api/v1/spots/${id}`)); } catch (caught) { setError(caught); } finally { setLoading(false); } }, [id]);
  useEffect(() => { load(); }, [load]);
  return <div className="container content-section"><Link className="back-link" to="/spots">← กลับไปดูพื้นที่ทั้งหมด</Link>{loading ? <Loading /> : error ? <ErrorNotice error={error} onRetry={load} /> : spot && <div className="detail-layout"><div className="detail-art"><span className="eyebrow">VENDOR SPOT / {spot.zone}</span><strong>{spot.spotNumber}</strong><div className="detail-art-orb" /><span className="detail-art-caption">A SPACE FOR YOUR STORY • BANGKOK NIGHT MARKET</span></div><div className="detail-info"><span className="zone-tag"><span className="online-dot" />พื้นที่เปิดใช้งาน</span><h1>พื้นที่ {spot.spotNumber}</h1><p className="lead">{spot.locationDescription}</p><div className="detail-facts"><div><span>โซน</span><strong>{spot.zone}</strong></div><div><span>ขนาดพื้นที่</span><strong>{formatSpotSize(spot.spotSize)}</strong></div><div><span>ค่าเช่าต่อวัน</span><strong className="price-accent">{formatBaht(spot.rentalFee)}</strong></div></div><div className="detail-note">✦ &nbsp; ระบบตรวจสอบพื้นที่ว่างตามวันที่ที่เลือกเมื่อส่งคำขอจอง</div>{user?.role === "member" ? <Link className="button button-primary button-wide" to={`/bookings/new?spot=${spot._id}`}>จองพื้นที่นี้ <span aria-hidden="true">↗</span></Link> : !user ? <Link className="button button-primary button-wide" to="/login" state={{ from: { pathname: `/bookings/new?spot=${spot._id}` } }}>เข้าสู่ระบบเพื่อจอง <span aria-hidden="true">↗</span></Link> : <Link className="button button-outline button-wide" to="/admin/spots">จัดการพื้นที่</Link>}</div></div>}</div>;
}

const blankSpot = { spotNumber: "", zone: "", spotWidth: "", spotLength: "", locationDescription: "", rentalFee: "" };
function SpotForm({ initial, spots, onSave, onDeleteZone, onCancel, busy }) {
  const feeId = useId();
  const [form, setForm] = useState(() => {
    if (!initial) return blankSpot;
    const dimensions = formatSpotSize(initial.spotSize).match(/^(\d+(?:\.\d+)?) × (\d+(?:\.\d+)?) เมตร$/);
    return { ...initial, spotWidth: dimensions?.[1] || "", spotLength: dimensions?.[2] || "", rentalFee: String(initial.rentalFee) };
  });
  const [validation, setValidation] = useState("");
  const [deletingZone, setDeletingZone] = useState(null);
  const optionsFor = (field) => [...new Set([...spots.map((spot) => spot[field]), initial?.[field]].filter(Boolean))].sort((a, b) => a.localeCompare(b, "th"));
  function setField(field, value) { setForm((current) => ({ ...current, [field]: value })); }
  function update(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function removeZone(zone, replacement) {
    await onDeleteZone(zone, replacement);
    setForm((current) => ({ ...current, zone: current.zone === zone ? replacement : current.zone }));
    setDeletingZone(null);
  }
  function adjustRentalFee(amount) {
    setForm((current) => {
      const fee = Number(current.rentalFee);
      return { ...current, rentalFee: String(Math.max(0, Math.round(((Number.isFinite(fee) ? fee : 0) + amount) * 100) / 100)) };
    });
  }
  function submit(event) {
    event.preventDefault();
    setValidation("");
    const width = Number(form.spotWidth);
    const length = Number(form.spotLength);
    if (!Number.isFinite(width) || !Number.isFinite(length) || width <= 0 || length <= 0) { setValidation("กรุณาระบุความกว้างและความยาวมากกว่า 0 เมตร"); return; }
    const body = { spotNumber: form.spotNumber.trim().toUpperCase(), zone: form.zone.trim(), spotSize: `${width} × ${length} เมตร`, locationDescription: form.locationDescription.trim(), rentalFee: Number(form.rentalFee) };
    if (!body.spotNumber || !body.zone || !body.spotSize || !body.locationDescription) { setValidation("กรุณากรอกข้อมูลพื้นที่ให้ครบ โดยไม่ใช้ช่องว่างอย่างเดียว"); return; }
    if (spots.some((spot) => spot._id !== initial?._id && spot.spotNumber.trim().toUpperCase() === body.spotNumber)) { setValidation("รหัสล็อกนี้มีอยู่แล้ว กรุณาใช้รหัสอื่น"); return; }
    onSave(body);
  }
  return (
    <form onSubmit={submit} className="form-stack">
      <label>{initial ? "รหัสล็อก" : "รหัสล็อกใหม่"}<input name="spotNumber" value={form.spotNumber} onChange={update} required placeholder="เช่น G01 หรือ A09" /></label>
      <SelectOrCreate label="โซน" name="zone" value={form.zone} options={optionsFor("zone")} onChange={(value) => setField("zone", value)} onDelete={(value) => { if (spots.some((spot) => spot.zone === value)) setDeletingZone(value); else setField("zone", ""); }} createLabel="เพิ่มโซนใหม่" customLabel="ชื่อโซนใหม่" placeholder="เช่น งานฝีมือ" disabled={busy} />
      {deletingZone && <DeleteZoneDialog zone={deletingZone} zones={optionsFor("zone")} onConfirm={removeZone} onClose={() => setDeletingZone(null)} />}
      <fieldset className="spot-dimensions" disabled={busy}>
        <legend>ขนาดพื้นที่</legend>
        <div className="dimension-fields">
          <label>กว้าง (เมตร)<input name="spotWidth" type="number" inputMode="decimal" min="0" step="any" value={form.spotWidth} onChange={update} required placeholder="เช่น 2" /></label>
          <span className="dimension-times" aria-hidden="true">×</span>
          <label>ยาว (เมตร)<input name="spotLength" type="number" inputMode="decimal" min="0" step="any" value={form.spotLength} onChange={update} required placeholder="เช่น 3" /></label>
        </div>
      </fieldset>
      <label>คำอธิบายตำแหน่ง<textarea name="locationDescription" value={form.locationDescription} onChange={update} required rows="3" placeholder="เช่น ใกล้ทางเข้าหลัก" /></label>
      <div className="choice-field">
        <label htmlFor={feeId}>ค่าเช่าต่อวัน (บาท)</label>
        <div className="fee-control">
          <button type="button" aria-label="ลดค่าเช่า 1 บาท" onClick={() => adjustRentalFee(-1)} disabled={busy || !(Number(form.rentalFee) > 0)}>−</button>
          <input id={feeId} name="rentalFee" type="number" inputMode="decimal" min="0" step="any" value={form.rentalFee} onChange={update} onKeyDown={(event) => { if (event.key === "ArrowUp" || event.key === "ArrowDown") { event.preventDefault(); adjustRentalFee(event.key === "ArrowUp" ? 1 : -1); } }} required disabled={busy} placeholder="300" aria-describedby={`${feeId}-hint`} />
          <button type="button" aria-label="เพิ่มค่าเช่า 1 บาท" onClick={() => adjustRentalFee(1)} disabled={busy}>+</button>
        </div>
        <small className="fee-hint" id={`${feeId}-hint`}>ปุ่ม − / + ปรับครั้งละ 1 บาท หรือพิมพ์ราคาได้เลย</small>
      </div>
      {validation && <div className="notice notice-error" role="alert">{validation}</div>}
      <div className="form-actions"><button type="submit" className="button button-primary" disabled={busy}>{busy ? "กำลังบันทึก..." : initial ? "บันทึกการแก้ไข" : "เพิ่มพื้นที่"}</button>{initial && <button type="button" className="button button-outline" onClick={onCancel}>ยกเลิก</button>}</div>
    </form>
  );
}

export function AdminSpots() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [formVersion, setFormVersion] = useState(0);
  const load = useCallback(async () => { setLoading(true); setError(null); try { setSpots(await api("/api/v1/spots")); } catch (caught) { setError(caught); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  async function save(body) { setBusy(true); setFormError(null); setSuccess(""); try { if (editing) await api(`/api/v1/spots/${editing._id}`, { method: "PUT", body }); else await api("/api/v1/spots", { method: "POST", body }); setSuccess(editing ? "แก้ไขพื้นที่เรียบร้อยแล้ว" : "เพิ่มพื้นที่ใหม่เรียบร้อยแล้ว"); setEditing(null); setFormVersion((value) => value + 1); await load(); } catch (caught) { setFormError(caught); } finally { setBusy(false); } }
  async function removeZone(zone, replacement) {
    await api(`/api/v1/spots/zones/${encodeURIComponent(zone)}`, { method: "DELETE", body: { replacementZone: replacement } });
    setSpots((current) => current.map((spot) => spot.zone === zone ? { ...spot, zone: replacement } : spot));
    setEditing((current) => current?.zone === zone ? { ...current, zone: replacement } : current);
    setSuccess(`ลบหมวดหมู่ ${zone} แล้ว และย้ายพื้นที่ไป ${replacement} เรียบร้อยแล้ว`);
  }
  async function remove(spot) { if (!window.confirm(`ปิดใช้งานพื้นที่ ${spot.spotNumber}? การจองเดิมจะยังอยู่ในระบบ`)) return; setError(null); setSuccess(""); try { await api(`/api/v1/spots/${spot._id}`, { method: "DELETE" }); setSuccess(`ปิดใช้งานพื้นที่ ${spot.spotNumber} แล้ว`); if (editing?._id === spot._id) setEditing(null); await load(); } catch (caught) { setError(caught); } }
  return <div className="container content-section"><PageHeading eyebrow="ADMIN / VENDOR SPOTS" title="จัดการพื้นที่ขาย" description="เพิ่ม แก้ไข และปิดใช้งานพื้นที่ในตลาดกลางคืน" action={<span className="admin-badge">✦ ADMIN CONTROL</span>} /><div className="admin-layout"><div className="panel admin-list"><div className="panel-heading"><h2>พื้นที่ที่เปิดใช้งาน</h2><span className="count-pill">{spots.length} พื้นที่</span></div><SuccessNotice>{success}</SuccessNotice>{loading ? <Loading /> : error ? <ErrorNotice error={error} onRetry={load} /> : spots.length ? <div className="admin-spot-list">{spots.map((spot) => <article key={spot._id} className="admin-spot-row"><div className="mini-art">{spot.spotNumber}</div><div className="admin-spot-info"><strong>พื้นที่ {spot.spotNumber}</strong><span>{spot.zone} · {formatSpotSize(spot.spotSize)}</span><small>{formatBaht(spot.rentalFee)} / วัน</small></div><div className="row-actions"><button type="button" className="text-button" onClick={() => { setEditing(spot); setFormError(null); }}>แก้ไข</button><button type="button" className="text-button danger" onClick={() => remove(spot)}>ปิดใช้งาน</button></div></article>)}</div> : <EmptyState title="ยังไม่มีพื้นที่" description="เพิ่มพื้นที่แรกจากฟอร์มด้านข้างได้เลย" />}</div><div className="panel admin-form"><div className="panel-heading"><div><span className="eyebrow">{editing ? "EDIT SPOT" : "NEW SPOT"}</span><h2>{editing ? `แก้ไขพื้นที่ ${editing.spotNumber}` : "เพิ่มพื้นที่ใหม่"}</h2></div><span className="form-spark">✳</span></div><ErrorNotice error={formError} /><SpotForm key={`${editing?._id || "new"}-${formVersion}`} initial={editing} spots={spots} onSave={save} onDeleteZone={removeZone} onCancel={() => setEditing(null)} busy={busy} /></div></div></div>;
}
