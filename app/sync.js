'use strict';
/* =====================================================================
   kelasam sync — اختیاری و «آفلاین‌اول»
   برنامه همیشه روی همین دستگاه کامل کار می‌کند؛ همگام‌سازی فقط وقتی وارد حساب شده باشید
   و اینترنت باشد انجام می‌شود. ادغام با روش سه‌طرفه (نسخه قبلی همگام + نسخه این دستگاه + نسخه سرور) است:
   تغییرهای غیرهمپوشان هر دو طرف حفظ می‌شوند، فقط برای یک مقدار که هر دو عوض کرده‌اند «جدیدترین ویرایش» می‌ماند.
   ===================================================================== */

/* ---------- pure merge helpers (unit-tested in node) ---------- */
const isO = v => v !== null && typeof v === 'object' && !Array.isArray(v);
function deq(a, b) {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
  const aa = Array.isArray(a);
  if (aa !== Array.isArray(b)) return false;
  if (aa) { if (a.length !== b.length) return false; for (let i = 0; i < a.length; i++) if (!deq(a[i], b[i])) return false; return true; }
  const ka = Object.keys(a); if (ka.length !== Object.keys(b).length) return false;
  for (const k of ka) { if (!(k in b) || !deq(a[k], b[k])) return false; }
  return true;
}
const idList = a => Array.isArray(a) && a.every(x => isO(x) && typeof x.id === 'string');
const primList = a => Array.isArray(a) && a.every(x => x === null || typeof x !== 'object');
/* B = نسخه پایه (آخرین همگام موفق)، L = این دستگاه، S = سرور. pl = آیا این دستگاه جدیدتر ویرایش شده؟ st = آمار */
function merge3(B, L, S, pl, st) {
  if (deq(L, S)) return L;
  if (deq(B, L)) return S;
  if (deq(B, S)) return L;
  if (isO(L) && isO(S)) {
    const Bo = isO(B) ? B : {}, out = {};
    const keys = [...Object.keys(S)]; Object.keys(L).forEach(k => { if (!keys.includes(k)) keys.push(k); });
    for (const k of keys) {
      const inL = k in L, inS = k in S, inB = k in Bo;
      if (inL && inS) out[k] = merge3(Bo[k], L[k], S[k], pl, st);
      else if (inL) { if (inB && deq(Bo[k], L[k])) st.del++; else out[k] = L[k]; }
      else { if (inB && deq(Bo[k], S[k])) st.del++; else out[k] = S[k]; }
    }
    return out;
  }
  if (idList(L) && idList(S) && (B === undefined || idList(B))) {
    const mp = a => { const m = new Map(); (a || []).forEach(x => m.set(x.id, x)); return m; };
    const bm = mp(B), lm = mp(L), sm = mp(S), out = [], seen = new Set();
    const one = id => {
      if (seen.has(id)) return; seen.add(id);
      const inB = bm.has(id), inL = lm.has(id), inS = sm.has(id);
      if (inL && inS) out.push(merge3(bm.get(id), lm.get(id), sm.get(id), pl, st));
      else if (inL) { if (inB && deq(bm.get(id), lm.get(id))) st.del++; else out.push(lm.get(id)); }
      else if (inS) { if (inB && deq(bm.get(id), sm.get(id))) st.del++; else out.push(sm.get(id)); }
    };
    S.forEach(x => one(x.id)); L.forEach(x => one(x.id));
    return out;
  }
  if (primList(L) && primList(S) && (B === undefined || primList(B))) { // مجموعه‌ها (مثلاً اعضای یک فعالیت)
    const bs = new Set(B || []), ls = new Set(L), ss = new Set(S), out = [];
    [...S, ...L].forEach(x => { if (out.includes(x)) return; if (ls.has(x) && ss.has(x)) out.push(x); else if (!bs.has(x)) out.push(x); });
    return out;
  }
  st.conf++; return pl ? L : S; // هر دو عوض کرده‌اند: جدیدترین ویرایش
}

/* ---------- state ---------- */
const SY_URL = 'https://www.dabiran7.ir/kelasam-sync/';
const SY = { url: SY_URL, user: '', token: '', auto: true, ask: false, rev: -1, mod: 0, last: 0, dev: '', off: 0, epoch: '', v: 3 };
const SY_POLL = 5000, SY_SNAP_EVERY = 30 * 60e3; // هر ۵ ثانیه یک پرسش سبک از سرور (وقتی برنامه باز و دیده می‌شود)
const nowS = () => Date.now() + (SY.off || 0); // ساعت هماهنگ با سرور؛ ساعت اشتباه کامپیوتر دیگر روی «جدیدترین ویرایش» اثر نمی‌گذارد
const noteNow = r => { if (r && r.now) SY.off = r.now - Date.now(); };
const SYNC = { busy: false, base: null, st: 'off', msg: '', timer: null, LV: 0, retry: null, lastSnap: 0, again: false, tried: 0, dirtyAt: 0, rr: false };
const devName = () => (typeof SERVER !== 'undefined' && SERVER ? 'ویندوز' : (typeof CAPP !== 'undefined' && CAPP ? 'اندروید' : 'مرورگر')) + '-' + (SY.dev || '').slice(0, 4);

const KVF = k => 'kelasam/sy-' + k + '.json';
const KV = {
  async get(k) {
    try {
      if (SERVER) { const r = await fetch('api/kv?k=' + k, { cache: 'no-store' }); return r.ok ? (await r.text()) || null : null; }
      if (CAPP) { const r = await FS.readFile({ path: KVF(k), directory: 'DATA', encoding: 'utf8' }); return r.data || null; }
      if (k === 'sync') return localStorage.getItem(KEY + '-sync');
      return await idbTx('readonly', st => st.get('sy:' + k)) || null;
    } catch { return null; }
  },
  async set(k, v) {
    try {
      if (SERVER) { await fetch('api/kv?k=' + k, { method: 'PUT', body: v }); return; }
      if (CAPP) { await FS.writeFile({ path: KVF(k), data: v, directory: 'DATA', encoding: 'utf8', recursive: true }); return; }
      if (k === 'sync') { localStorage.setItem(KEY + '-sync', v); return; }
      await idbTx('readwrite', st => st.put(v, 'sy:' + k));
    } catch { }
  }
};
let syPersistT = null;
const syncPersist = (now) => { clearTimeout(syPersistT); const go = () => KV.set('sync', JSON.stringify(SY)); if (now) return go(); syPersistT = setTimeout(go, 1500); };
const syncPersistBase = () => KV.set('syncbase', JSON.stringify(SYNC.base));
async function syncLoad() {
  try { const t = await KV.get('sync'); if (t) Object.assign(SY, JSON.parse(t)); } catch { }
  if (!SY.v || SY.v < 3) { SY.ask = false; SY.v = 3; syncPersist(true); } // نسخه ۲٫۲: همگام‌سازی آنی و بدون پرسش (مگر برای حذف‌های بزرگ)
  if (!SY.dev) { SY.dev = Math.random().toString(36).slice(2, 6); syncPersist(true); }
  if (SY.token) { try { const b = await KV.get('syncbase'); SYNC.base = b ? fixShapes(JSON.parse(b)) : null; } catch { SYNC.base = null; } SYNC.st = 'idle'; }
  syncStatus();
}
const syncOn = () => !!SY.token;

/* ---------- network ---------- */
const syBase = () => { let u = String(SY.url || SY_URL).trim(); if (!/^https?:\/\//i.test(u)) u = 'https://' + u; return u.replace(/api\.php.*$/i, '').replace(/index\.php.*$/i, '').replace(/\/*$/, '/'); };
async function syApi(action, body = {}, ms = 90000) {
  const ac = new AbortController(), tm = setTimeout(() => ac.abort(), ms);
  let r;
  try {
    r = await fetch(syBase() + 'api.php?a=' + action, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify({ user: SY.user, token: SY.token, dev: devName(), ...body }), signal: ac.signal, cache: 'no-store' });
  } catch (e) { throw { offline: true, msg: 'اتصال به سرور برقرار نشد' }; } finally { clearTimeout(tm); }
  let j; try { j = await r.json(); } catch { throw { server: true, msg: 'پاسخ سرور درست نیست (آدرس سرور را بررسی کنید)' }; }
  if (j && j.ok === false && j.err === 'auth') { SY.token = ''; syncPersist(true); SYNC.st = 'auth'; syncStatus(); throw { auth: true, msg: j.msg }; }
  return j;
}

/* ---------- status ---------- */
function syncLabel() {
  if (!syncOn()) return ['off', 'رسا: خاموش (آفلاین)'];
  const t = SY.last ? ' ' + fnum(new Date(SY.last).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })) : '';
  switch (SYNC.st) {
    case 'syncing': return ['busy', 'در حال همگام‌سازی…'];
    case 'offline': return ['warn', 'آفلاین — با اتصال اینترنت همگام می‌شود'];
    case 'err': return ['bad', 'خطای همگام‌سازی: ' + (SYNC.msg || '')];
    case 'auth': return ['bad', 'برای ادامه همگام‌سازی دوباره وارد شوید'];
    case 'pending': return ['warn', 'تغییرات منتظر تأیید شماست — برای مرور کلیک کنید'];
    case 'ok': return ['ok', 'همگام ✓' + t];
    default: return [SY.auto ? 'ok' : 'warn', SY.auto ? (SY.ask ? 'همگام‌سازی با تأیید شما' : 'همگام‌سازی خودکار') + (t ? ' · آخرین:' + t : '') : 'همگام‌سازی دستی'];
  }
}
function syncStatus() {
  const e = document.getElementById('syncSt'); if (!e) return;
  const [c, t] = syncLabel(); e.className = 'savest sy ' + c; e.textContent = t;
}

/* ---------- engine ---------- */
const clone = o => JSON.parse(JSON.stringify(o));
/* ---------- عکس‌ها همگام نمی‌شوند؛ فقط روی همان دستگاه می‌مانند ---------- */
function stripPh(r) { if (!r || !Array.isArray(r.classes)) return r; return { ...r, classes: r.classes.map(c => ({ ...c, students: (c.students || []).map(s => { const { photo, ...t } = s; return t; }) })) }; }
function withPhotos(m, loc) {
  const ph = new Map(); ((loc && loc.classes) || []).forEach(c => (c.students || []).forEach(s => ph.set(c.id + '|' + s.id, s.photo || '')));
  return { ...m, classes: (m.classes || []).map(c => ({ ...c, students: (c.students || []).map(s => ({ ...s, photo: ph.get(c.id + '|' + s.id) || '' })) })) };
}
/* ---------- خلاصه تغییرها برای تأیید کاربر ---------- */
function syDiff(a, b) {
  const d = { cAdd: 0, cDel: 0, sAdd: 0, sDel: 0, chg: 0, other: 0 };
  const A = new Map(((a && a.classes) || []).map(c => [c.id, c])), Bm = new Map(((b && b.classes) || []).map(c => [c.id, c]));
  Bm.forEach((c, id) => {
    const o = A.get(id); if (!o) { d.cAdd++; d.sAdd += (c.students || []).length; return; }
    const os = new Set((o.students || []).map(s => s.id)), ns = new Set((c.students || []).map(s => s.id));
    ns.forEach(i => { if (!os.has(i)) d.sAdd++; }); os.forEach(i => { if (!ns.has(i)) d.sDel++; });
    if (!deq(o, c)) d.chg++;
  });
  A.forEach((c, id) => { if (!Bm.has(id)) { d.cDel++; d.sDel += (c.students || []).length; } });
  if (!(d.cAdd || d.cDel || d.sAdd || d.sDel || d.chg) && !deq(a || {}, b || {})) d.other = 1;
  return d;
}
const syHas = d => !!(d.cAdd || d.cDel || d.sAdd || d.sDel || d.chg || d.other);
const syTotal = r => ((r && r.classes) || []).reduce((a, c) => a + (c.students || []).length, 0);
const syDanger = (d, total) => d.cDel > 0 || d.sDel >= Math.max(3, Math.ceil(total * .2));
function syTxt(d) {
  const p = [];
  if (d.cAdd) p.push(`${fa(d.cAdd, 0)} کلاس جدید`); if (d.sAdd) p.push(`${fa(d.sAdd, 0)} دانش‌آموز جدید`);
  if (d.chg) p.push(`${fa(d.chg, 0)} کلاس با اطلاعات تغییرکرده (نمره، حضور، تکلیف و…)`);
  if (d.sDel) p.push(`حذف ${fa(d.sDel, 0)} دانش‌آموز`); if (d.cDel) p.push(`حذف ${fa(d.cDel, 0)} کلاس`);
  if (d.other && !p.length) p.push('تغییر در تنظیمات یا اطلاعات مدرسه');
  return p.join('، ') || 'بدون تغییر';
}
function syConfirm(inc, out, danger) {
  return new Promise(res => {
    const d = $('#dlg'); d.dataset.sync = '1';
    d.innerHTML = `<form onsubmit="return false"><h3>🔄 تأیید همگام‌سازی</h3>
    ${danger ? '<div class="card" style="padding:10px;border:2px solid var(--bad);color:var(--bad)"><b>⚠️ توجه:</b> این همگام‌سازی شامل حذف اطلاعات است. اگر مطمئن نیستید «فعلاً نه» را بزنید و اول نسخه‌ها را بررسی کنید.</div>' : ''}
    <div class="card" style="padding:10px"><b>⬇️ از سرور به این دستگاه:</b><br>${esc(syHas(inc) ? syTxt(inc) : 'بدون تغییر')}</div>
    <div class="card" style="padding:10px"><b>⬆️ از این دستگاه به سرور:</b><br>${esc(syHas(out) ? syTxt(out) : 'بدون تغییر')}</div>
    <p class="sub" style="margin:0">قبل از اعمال، از اطلاعات فعلی یک پشتیبان خودکار گرفته می‌شود. عکس دانش‌آموزان همگام نمی‌شود.</p>
    <div class="row"><button type="button" class="btn" data-y="1">✅ بله، همگام کن</button><button type="button" class="btn sec" data-y="">فعلاً نه</button></div></form>`;
    d.querySelectorAll('[data-y]').forEach(b => b.onclick = () => { delete d.dataset.sync; d.close(); res(!!b.dataset.y); });
    d.oncancel = () => { delete d.dataset.sync; res(false); };
    if (!d.open) d.showModal();
  });
}

/* ---------- اعمال نتیجه ادغام «در همان اشیای قبلی» (پایداری ارجاع‌ها: دستگیره‌های صفحه به داده‌ی قدیمی اشاره نمی‌کنند) ---------- */
function applyInPlace(t, s) {
  if (Array.isArray(s)) {
    if (!Array.isArray(t)) return s;
    if (idList(s) && idList(t)) {
      const m = new Map(t.map(x => [x.id, x])), out = s.map(x => m.has(x.id) ? applyInPlace(m.get(x.id), x) : x);
      t.length = 0; out.forEach(x => t.push(x)); return t;
    }
    if (!deq(t, s)) { t.length = 0; s.forEach(x => t.push(x)); }
    return t;
  }
  if (isO(s)) {
    if (!isO(t)) return s;
    Object.keys(t).forEach(k => { if (!(k in s) && k !== 'photo') delete t[k]; });
    Object.keys(s).forEach(k => { if (k === 'photo') return; t[k] = (k in t) ? applyInPlace(t[k], s[k]) : s[k]; });
    return t;
  }
  return s;
}
function applyMerged(m) { // همگام (بدون await): بین خواندن R و نوشتن آن هیچ ویرایشی گم نمی‌شود
  const changed = !deq(stripPh(R), m);
  if (changed) { const cur = db && db.id; applyInPlace(R, clone(m)); try { R.classes.forEach(syncAbsent); } catch { } setCur(cur); persist(); }
  return changed;
}
function softRender() { if (userBusy()) { SYNC.rr = true; return; } render(true); }
document.addEventListener('focusout', () => { if (SYNC.rr) setTimeout(() => { if (SYNC.rr && !userBusy()) { SYNC.rr = false; render(true); } }, 200); });

const syncSoon = () => {
  if (!syncOn() || !SY.auto) return;
  const t = Date.now(); if (!SYNC.dirtyAt) SYNC.dirtyAt = t;
  clearTimeout(SYNC.timer);
  SYNC.timer = setTimeout(() => { SYNC.dirtyAt = 0; syncNow(false); }, Math.max(0, Math.min(1000, SYNC.dirtyAt + 3000 - t)));
};
const userBusy = () => { if (document.querySelector('dialog[open]:not(#dlg[data-sync])')) return true; const a = document.activeElement; return !!(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.id !== 'fq' && !a.closest('dialog')); };
const syBusyShow = () => { SYNC.st = 'syncing'; syncStatus(); };
async function syTakeOver(resp) { // دستگاه دیگری «همگام‌سازی اجباری» زده: این دستگاه عین سرور می‌شود (پشتیبان قبلی گرفته می‌شود)
  let S = resp.data;
  if (!S) { const f = await syApi('pull', { rev: -1, force: true }); S = f.data; resp = { ...resp, rev: f.rev, mod: f.mod }; }
  if (S) {
    try { await snapNow('قبل از جایگزینی با نسخه اجباری دستگاه دیگر'); SYNC.lastSnap = Date.now(); } catch { }
    const m = stripPh(migrate(S)); const cur = db && db.id;
    applyInPlace(R, clone(m)); try { R.classes.forEach(syncAbsent); } catch { } setCur(cur); persist();
    SY.rev = resp.rev; SYNC.base = clone(stripPh(R)); await syncPersistBase(); softRender();
    toast('این دستگاه با نسخه «همگام‌سازی اجباری» دستگاه دیگر یکی شد');
  }
  SY.epoch = resp.epoch; SY.last = Date.now(); SYNC.st = 'ok';
}
async function syncNow(manual, force) {
  if (!manual && !SY.auto) return false;
  if (!syncOn()) return false;
  if (SYNC.busy) { SYNC.again = true; return false; }
  SYNC.busy = true; SYNC.tried = Date.now(); if (manual) syBusyShow();
  const lv0 = SYNC.LV; let result = false, confirmed = !!force, resp = null;
  try {
    for (let attempt = 0; attempt < 6; attempt++) {
      const L0 = stripPh(R), baseOk = !!SYNC.base && SY.rev >= 0;
      if (!resp && baseOk && !SY.ask && !deq(L0, stripPh(SYNC.base))) { // مسیر سریع: فقط تغییر محلی داریم؛ مستقیم بفرست (یک درخواست)
        const dOut = syDiff(stripPh(SYNC.base), L0);
        if (confirmed || !syDanger(dOut, syTotal(L0))) {
          syBusyShow(); const Ls = clone(L0);
          const pr = await syApi('push', { base: SY.rev, mod: nowS(), devid: SY.dev, data: Ls }); noteNow(pr);
          if (pr.ok) { SY.rev = pr.rev; SYNC.base = Ls; await syncPersistBase(); SY.last = Date.now(); SYNC.st = 'ok'; result = true; break; }
          if (!pr.conflict) throw { server: true, msg: pr.msg || 'خطا' };
          resp = { ok: true, changed: true, rev: pr.rev, mod: pr.mod, data: pr.data, epoch: pr.epoch, epochDev: pr.epochDev };
        }
      }
      if (!resp) { resp = await syApi('pull', { rev: SY.rev }); noteNow(resp); if (!resp.ok) throw { server: true, msg: resp.msg || 'خطا' }; }
      if (resp.epoch && resp.epoch !== SY.epoch && resp.epochDev !== SY.dev) { syBusyShow(); await syTakeOver(resp); result = true; break; }
      const S = resp.changed && resp.data ? stripPh(migrate(resp.data)) : null;
      if (!resp.changed && SYNC.base && deq(stripPh(SYNC.base), stripPh(R))) { SY.last = Date.now(); SYNC.st = 'ok'; result = true; break; }
      const compute = () => { const st = { del: 0, conf: 0 }, Lc = stripPh(R); return { st, Lc, m: S ? merge3(stripPh(SYNC.base || {}), Lc, S, SY.mod >= (resp.mod || 0), st) : Lc }; };
      let c = compute();
      if (!deq(c.m, c.Lc) && Date.now() - SYNC.lastSnap > SY_SNAP_EVERY) { SYNC.lastSnap = Date.now(); try { await snapNow('قبل از همگام‌سازی'); } catch { } c = compute(); }
      const ref = S || (SYNC.base ? stripPh(SYNC.base) : null), dInc = syDiff(c.Lc, c.m), dOut = syDiff(ref, c.m);
      const danger = syDanger(dInc, syTotal(c.Lc)) || syDanger(dOut, syTotal(ref || c.m));
      if (!confirmed && (SY.ask || danger) && (syHas(dInc) || syHas(dOut))) {
        if (!manual) { SYNC.st = 'pending'; SYNC.pend = { inc: dInc, out: dOut, danger }; syncStatus(); return false; }
        const okc = await syConfirm(dInc, dOut, danger);
        if (!okc) { SYNC.st = 'pending'; SYNC.pend = { inc: dInc, out: dOut, danger }; syncStatus(); return false; }
        confirmed = true; SYNC.lastSnap = 0; continue; // ویرایش‌های لحظه‌ی تأیید را هم دوباره در نظر بگیر
      }
      if (applyMerged(c.m)) { softRender(); if (c.st.conf) toast(`همگام‌سازی انجام شد؛ ${fa(c.st.conf, 0)} مورد تداخل به نفع جدیدترین ویرایش حل شد`); else if (S) toast('اطلاعات از حساب شما به‌روز شد'); }
      if (S && deq(c.m, S)) { SY.rev = resp.rev; SYNC.base = clone(c.m); await syncPersistBase(); SY.last = Date.now(); SYNC.st = 'ok'; result = true; break; }
      syBusyShow();
      const pr = await syApi('push', { base: resp.rev, mod: Math.max(SY.mod, resp.mod || 0) || nowS(), devid: SY.dev, data: c.m }); noteNow(pr);
      if (pr.conflict) { resp = { ok: true, changed: true, rev: pr.rev, mod: pr.mod, data: pr.data, epoch: pr.epoch, epochDev: pr.epochDev }; continue; }
      if (!pr.ok) throw { server: true, msg: pr.msg || 'خطا' };
      SY.rev = pr.rev; SYNC.base = clone(c.m); await syncPersistBase(); SY.last = Date.now(); SYNC.st = 'ok'; result = true; break;
    }
    if (!result && SYNC.st === 'syncing') { SYNC.st = 'err'; SYNC.msg = 'تداخل پیاپی؛ کمی بعد دوباره تلاش می‌شود'; }
  } catch (e) {
    if (e && e.offline) { SYNC.st = 'offline'; if (manual) toast('اینترنت یا سرور در دسترس نیست؛ اطلاعات فعلاً روی همین دستگاه ذخیره است'); }
    else if (e && e.auth) { SYNC.st = 'auth'; if (manual) toast('نشست منقضی شده؛ دوباره وارد شوید'); }
    else { SYNC.st = 'err'; SYNC.msg = (e && e.msg) || 'نامشخص'; }
  } finally {
    SYNC.busy = false; syncPersist(true); syncStatus();
    if (result && SYNC.LV !== lv0) SYNC.again = true; // در حین ارسال ویرایش تازه‌ای شد
    if (SYNC.again) { SYNC.again = false; setTimeout(() => syncNow(false), 300); }
    const dd = document.getElementById('dlg'); if (dd && dd.dataset.sync && dd.open && !dd.querySelector('[data-c]') && !dd.querySelector('[data-rv]')) syncDialog();
  }
  return result;
}
/* «همگام‌سازی اجباری»: نسخه همین دستگاه روی سرور و همه دستگاه‌ها می‌نشیند و با خواندن دوباره از سرور تأیید می‌شود */
async function syncForce() {
  if (!syncOn()) { toast('اول وارد حساب رسا شوید'); syncDialog(); return; }
  if (!confirm('همگام‌سازی اجباری:\nاطلاعات همین دستگاه به‌عنوان نسخه نهایی روی سرور و همه دستگاه‌های دیگر می‌نشیند.\n(نسخه قبلی سرور در «نسخه‌های ذخیره‌شده در سرور» می‌ماند و از دستگاه‌های دیگر هم پشتیبان گرفته می‌شود.)\n\nادامه می‌دهید؟')) return;
  const fs = await forceSave(true); if (!fs.ok) return;
  for (let i = 0; i < 40 && SYNC.busy; i++) await new Promise(r => setTimeout(r, 250));
  SYNC.busy = true; syBusyShow(); let msgOk = '';
  try {
    const cur = await syApi('pull', { rev: -1 }); noteNow(cur); if (!cur.ok) throw { msg: cur.msg };
    const epoch = Math.random().toString(36).slice(2, 10) + Date.now().toString(36), L = clone(stripPh(R));
    const p = await syApi('push', { base: cur.rev, force: true, epoch, devid: SY.dev, mod: nowS(), data: L });
    if (!p.ok) throw { msg: p.msg || 'ارسال به سرور انجام نشد' };
    const v = await syApi('pull', { rev: -1, force: true });
    if (!v.data || !deq(stripPh(migrate(clone(v.data))), L)) throw { msg: 'ارسال شد ولی تأیید نهایی با سرور ناموفق بود؛ یک بار دیگر بزنید.' };
    SY.rev = p.rev; SYNC.base = L; SY.epoch = p.epoch || ''; await syncPersistBase(); SY.last = Date.now(); SYNC.st = 'ok';
    const n = L.classes.reduce((a, c) => a + c.students.length, 0);
    msgOk = `✓ همگام‌سازی اجباری انجام و تأیید شد: سرور اکنون دقیقاً برابر این دستگاه است (${fa(L.classes.length, 0)} کلاس، ${fa(n, 0)} دانش‌آموز).` + (p.epoch ? '' : '\nتوجه: سرور شما هنوز نسخه قدیمی است؛ دستگاه‌های دیگر خودشان آن را می‌گیرند اما برای جایگزینی اجباری، فایل‌های سرور را به‌روز کنید.');
  } catch (e) { SYNC.st = e && e.offline ? 'offline' : 'err'; SYNC.msg = (e && e.msg) || 'خطا'; msgOk = '⚠️ همگام‌سازی اجباری کامل نشد: ' + SYNC.msg; }
  finally { SYNC.busy = false; syncPersist(true); syncStatus(); }
  alert(msgOk);
}
/* ورود/ثبت‌نام و اتصال اولیه */
async function syncLogin(mode, user, pass, invite) {
  const r = await syApi(mode, { user: user.trim().toLowerCase(), pass, invite, token: '' });
  if (!r.ok) throw { msg: r.msg || 'ناموفق' };
  SY.user = r.user; SY.token = r.token; SY.rev = -1; SYNC.base = null; SY.last = 0; SYNC.st = 'idle';
  await syncPersist(true); await KV.set('syncbase', 'null');
  const s = await syApi('pull', { rev: -1, force: true });
  noteNow(s); SY.epoch = s.epoch || '';
  const S = s.data ? migrate(s.data) : null, hasS = !!S && (S.classes.length > 0), hasL = R.classes.length > 0;
  let ch = 'merge';
  if (!hasS && !hasL) ch = 'upload';
  else if (!hasS) ch = 'upload';
  else if (!hasL) ch = 'server';
  else ch = await linkChoice(S, s);
  if (!ch) { SY.token = ''; SY.user = ''; await syncPersist(true); throw { msg: 'اتصال لغو شد؛ اطلاعات هیچ‌کدام تغییری نکرد' }; }
  if (ch === 'upload') { SY.rev = s.rev; SYNC.base = emptyRoot(); }
  else if (ch === 'local') { SY.rev = s.rev; SYNC.base = stripPh(clone(S)); }
  else if (ch === 'server') { SY.rev = -1; SYNC.base = stripPh(R); }
  else { SY.rev = -1; SYNC.base = {}; }
  await syncPersistBase(); await syncPersist(true);
  return syncNow(true, true);
}
function linkChoice(S, meta) {
  return new Promise(res => {
    const d = $('#dlg'), cnt = x => `${fa(x.classes.length, 0)} کلاس · ${fa(x.classes.reduce((a, c) => a + c.students.length, 0), 0)} دانش‌آموز`;
    d.dataset.sync = '1';
    d.innerHTML = `<form onsubmit="return false"><h3>🔗 اتصال این دستگاه به حساب</h3>
    <p class="sub" style="margin:0">هم روی این دستگاه و هم روی حساب شما اطلاعات وجود دارد. چه کار کنیم؟ (در همه حالت‌ها از اطلاعات فعلی یک پشتیبان گرفته می‌شود و چیزی بی‌صدا پاک نمی‌شود.)</p>
    <div class="card" style="padding:10px"><b>این دستگاه:</b> ${cnt(R)}<br><b>حساب (سرور):</b> ${cnt(S)}${meta.mod ? ' · آخرین ویرایش ' + when(meta.mod) : ''}</div>
    <button type="button" class="btn" data-c="merge">🔀 ادغام هوشمند (پیشنهادی)<br><small>هر دو را کنار هم نگه می‌دارد؛ فقط اگر یک مورد را در هر دو عوض کرده باشید، جدیدترین ویرایش می‌ماند</small></button>
    <button type="button" class="btn sec" data-c="server">⬇️ استفاده از اطلاعات حساب<br><small>اطلاعات این دستگاه با نسخه سرور جایگزین می‌شود (نسخه فعلی در پشتیبان‌ها می‌ماند)</small></button>
    <button type="button" class="btn sec" data-c="local">⬆️ استفاده از اطلاعات این دستگاه<br><small>اطلاعات حساب با این دستگاه جایگزین می‌شود (نسخه قبلی سرور در تاریخچه سرور می‌ماند)</small></button>
    <button type="button" class="btn bad" data-c="">انصراف</button></form>`;
    d.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { b.dataset.c ? 0 : 0; delete d.dataset.sync; const v = b.dataset.c || null; d.close(); res(v); });
    d.oncancel = () => { delete d.dataset.sync; res(null); };
    if (!d.open) d.showModal();
  });
}
async function syncLogout() {
  try { await syApi('logout'); } catch { }
  SY.token = ''; SY.user = ''; SY.rev = -1; SY.last = 0; SY.epoch = ''; SYNC.base = null; SYNC.st = 'off';
  await syncPersist(true); await KV.set('syncbase', 'null'); syncStatus();
}

/* ---------- dialog ---------- */
function syncDialog(tab) {
  const d = $('#dlg'); d.dataset.sync = '1'; d.onclose = () => { delete d.dataset.sync; };
  const close = () => { delete d.dataset.sync; d.close(); };
  const msgBox = '<div id="syMsg" class="sub" style="color:var(--bad);min-height:1.4em"></div>';
  if (!syncOn()) {
    tab = tab || 'login'; const reg = tab === 'reg';
    d.innerHTML = `<form onsubmit="return false"><h3>🔄 همگام‌سازی (رسا) بین ویندوز و گوشی</h3>
    <p class="sub" style="margin:0">اختیاری است. بدون ورود هم برنامه مثل همیشه کاملاً آفلاین روی همین دستگاه کار می‌کند. با ورود به حساب خودتان، اطلاعات کلاس‌ها بین دستگاه‌هایتان (هر وقت اینترنت داشتید) همگام می‌شود.</p>
    <div class="seg" style="justify-self:start"><button type="button" class="${reg ? '' : 'on p'}" data-tab="login">ورود</button><button type="button" class="${reg ? 'on p' : ''}" data-tab="reg">ثبت‌نام</button></div>
    <label class="f">شناسه کاربری (انگلیسی)<input id="syU" autocomplete="username" dir="ltr" placeholder="مثلاً ali.rezaei" value="${esc(SY.user)}"></label>
    <label class="f">رمز عبور${reg ? ' (حداقل ۶ نویسه)' : ''}<input id="syP" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}" dir="ltr"></label>
    ${reg ? '<label class="f">کد دعوت (اگر مدیر سرور داده است)<input id="syI" dir="ltr"></label>' : ''}
    <details><summary class="sub" style="cursor:pointer">تنظیمات پیشرفته: آدرس سرور</summary><label class="f">آدرس پوشه سرور همگام‌سازی<input id="syUrl" dir="ltr" value="${esc(SY.url)}"></label></details>
    ${msgBox}
    <div class="row"><button type="button" class="btn" id="syGo">${reg ? 'ساخت حساب و اتصال' : 'ورود و اتصال'}</button><button type="button" class="btn sec" data-x>بستن</button></div></form>`;
    d.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => syncDialog(b.dataset.tab));
    d.querySelector('[data-x]').onclick = close;
    const go = async () => {
      const u = $('#syU').value.trim(), p = $('#syP').value, m = $('#syMsg'), btn = $('#syGo');
      SY.url = $('#syUrl').value.trim() || SY_URL;
      if (!u || !p) { m.textContent = 'شناسه و رمز را وارد کنید.'; return; }
      btn.disabled = true; btn.textContent = 'در حال اتصال…'; m.textContent = '';
      try { await syncLogin(reg ? 'register' : 'login', u, p, reg ? $('#syI').value : ''); syncDialog(); }
      catch (e) { if (!$('#syMsg')) { syncDialog(tab); } const mm = $('#syMsg'); if (mm) mm.textContent = (e && e.msg) || 'خطا'; const b2 = $('#syGo'); if (b2) { b2.disabled = false; b2.textContent = reg ? 'ساخت حساب و اتصال' : 'ورود و اتصال'; } }
    };
    $('#syGo').onclick = go; d.querySelectorAll('#syU,#syP,#syI').forEach(i => i.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
    if (!d.open) d.showModal(); return;
  }
  const [c, t] = syncLabel();
  d.innerHTML = `<form onsubmit="return false"><h3>🔄 همگام‌سازی (رسا)</h3>
  <div class="card" style="padding:12px"><div class="row" style="justify-content:space-between"><span>حساب: <b dir="ltr">${esc(SY.user)}</b></span><span class="pill ${c === 'ok' ? 'ok' : c === 'bad' ? 'bad' : 'warn'}">${esc(t)}</span></div>
  <div class="sub" style="margin-top:4px">این دستگاه: ${esc(devName())} · ${SY.last ? 'آخرین همگام‌سازی: ' + when(SY.last) : 'هنوز همگام نشده'}</div></div>
  <label class="f">روش همگام‌سازی<select id="syMode"><option value="auto" ${SY.auto && !SY.ask ? 'selected' : ''}>خودکار و آنی (پیشنهادی؛ فقط برای حذف‌های بزرگ می‌پرسد)</option><option value="ask" ${SY.auto && SY.ask ? 'selected' : ''}>با تأیید من: قبل از هر تغییر خلاصه نشان بده</option><option value="manual" ${!SY.auto ? 'selected' : ''}>فقط دستی: خودم دکمه را بزنم</option></select></label>
  <p class="sub" style="margin:0">عکس دانش‌آموزان همگام نمی‌شود و فقط روی همان دستگاه می‌ماند. در هر حالت، اگر همگام‌سازی شامل حذف تعداد زیادی اطلاعات باشد، حتماً از شما تأیید می‌گیرد.</p>
  <div class="row"><button type="button" class="btn" id="syNow">همگام‌سازی همین الان</button><button type="button" class="btn sec" id="syHist">نسخه‌های ذخیره‌شده در سرور</button></div>
  <div class="row"><button type="button" class="btn sec" id="syFSave">💾 ذخیره اجباری</button><button type="button" class="btn sec" id="syFSync">🔄 همگام‌سازی اجباری</button></div>
  <details><summary class="sub" style="cursor:pointer">گزینه‌های پیشرفته</summary><div class="row" style="margin-top:8px">
  <button type="button" class="btn sec sm" id="syDown">جایگزینی اطلاعات این دستگاه با سرور</button><button type="button" class="btn sec sm" id="syUp">جایگزینی اطلاعات سرور با این دستگاه</button><button type="button" class="btn sec sm" id="syPw">تغییر رمز</button></div>
  <label class="f" style="margin-top:8px">آدرس سرور<input id="syUrl" dir="ltr" value="${esc(SY.url)}"></label></details>
  <div id="syMsg" class="sub" style="min-height:1.4em"></div>
  <div class="row"><button type="button" class="btn bad" id="syOut">خروج از حساب</button><button type="button" class="btn sec" data-x>بستن</button></div>
  <p class="sub" style="margin:0">خروج از حساب هیچ اطلاعاتی را از این دستگاه پاک نمی‌کند.</p></form>`;
  d.querySelector('[data-x]').onclick = close;
  const msg = x => { const m = $('#syMsg'); if (m) m.textContent = x; };
  $('#syMode').onchange = e => { const v = e.target.value; SY.auto = v !== 'manual'; SY.ask = v !== 'auto'; syncPersist(true); syncStatus(); if (SY.auto) syncSoon(); };
  $('#syUrl').onchange = e => { SY.url = e.target.value.trim() || SY_URL; syncPersist(true); };
  $('#syNow').onclick = async () => { $('#syNow').disabled = true; msg('در حال همگام‌سازی…'); const ok = await syncNow(true); if (ok) toast('همگام‌سازی کامل شد'); };
  $('#syFSave').onclick = () => forceSave(); $('#syFSync').onclick = async () => { await syncForce(); syncDialog(); };
  $('#syOut').onclick = async () => { if (confirm('از حساب خارج شوید؟ اطلاعات این دستگاه سر جایش می‌ماند و برنامه آفلاین ادامه می‌دهد.')) { await syncLogout(); syncDialog(); } };
  $('#syDown').onclick = async () => {
    if (!confirm('اطلاعات این دستگاه با نسخه سرور جایگزین شود؟ (از وضعیت فعلی یک پشتیبان گرفته می‌شود)')) return;
    try { const s = await syApi('pull', { rev: -1, force: true }); if (!s.data) return msg('روی سرور اطلاعاتی نیست.'); await snapNow('قبل از جایگزینی با سرور'); SYNC.lastSnap = Date.now(); const cur = db && db.id; R = withPhotos(stripPh(migrate(s.data)), R); setCur(cur); SY.rev = s.rev; SYNC.base = stripPh(R); await syncPersistBase(); persist(); SY.last = Date.now(); SYNC.st = 'ok'; syncStatus(); render(true); syncDialog(); toast('اطلاعات از سرور جایگزین شد'); } catch (e) { msg(e.msg || 'خطا'); }
  };
  $('#syUp').onclick = async () => {
    if (!confirm('اطلاعات سرور با اطلاعات این دستگاه جایگزین شود؟ (نسخه قبلی سرور در «نسخه‌های ذخیره‌شده در سرور» می‌ماند)')) return;
    try { const s = await syApi('pull', { rev: -1 }); const p = await syApi('push', { base: s.rev, force: true, mod: Date.now(), data: stripPh(R) }); if (!p.ok) return msg(p.msg || 'خطا'); SY.rev = p.rev; SYNC.base = stripPh(R); await syncPersistBase(); SY.last = Date.now(); SYNC.st = 'ok'; syncStatus(); syncDialog(); toast('اطلاعات سرور با این دستگاه یکی شد'); } catch (e) { msg(e.msg || 'خطا'); }
  };
  $('#syPw').onclick = async () => {
    const o = prompt('رمز فعلی:'); if (!o) return; const n = prompt('رمز جدید (حداقل ۶ نویسه):'); if (!n) return;
    try { const r = await syApi('passwd', { old: o, new: n }); msg(r.ok ? 'رمز عوض شد (دستگاه‌های دیگر باید دوباره وارد شوند).' : r.msg); } catch (e) { msg(e.msg || 'خطا'); }
  };
  $('#syHist').onclick = async () => {
    try {
      const h = await syApi('history'); if (!h.ok) return msg(h.msg);
      d.innerHTML = `<form onsubmit="return false"><h3>🕘 نسخه‌های ذخیره‌شده در سرور</h3><p class="sub" style="margin:0">هر بار همگام‌سازی، نسخه قبلی سرور نگه داشته می‌شود. با «بازگردانی» اطلاعات این دستگاه با آن نسخه جایگزین می‌شود (و بعد به حساب هم می‌رود).</p>
      <div style="max-height:320px;overflow:auto">${h.list.map(x => `<div class="li" style="border-top:1px solid var(--line);padding:6px 0"><span>${when(x.mod || x.saved * 1000)}<br><small class="sub">نسخه ${fa(x.rev, 0)} · ${esc(x.dev || '—')}${x.current ? ' · نسخه فعلی' : ''}</small></span>${x.current ? '' : `<button type="button" class="btn sm" data-rv="${x.rev}">بازگردانی</button>`}</div>`).join('') || '<div class="empty">هنوز نسخه‌ای نیست</div>'}</div>
      <div class="row"><button type="button" class="btn sec" data-back>بازگشت</button></div></form>`;
      d.querySelector('[data-back]').onclick = () => syncDialog();
      d.querySelectorAll('[data-rv]').forEach(b => b.onclick = async () => {
        if (!confirm('اطلاعات این دستگاه با این نسخه جایگزین شود؟')) return;
        try { const g = await syApi('getver', { rev: +b.dataset.rv }); if (!g.ok) return toast(g.msg); await snapNow('قبل از بازگردانی از سرور'); const cur = db && db.id; R = withPhotos(stripPh(migrate(g.data)), R); setCur(cur); save(); render(true); toast('نسخه بازگردانی شد'); close(); } catch (e) { toast(e.msg || 'خطا'); }
      });
    } catch (e) { msg(e.msg || 'خطا'); }
  };
  if (!d.open) d.showModal();
}

/* ---------- triggers ---------- */
function syncTick() {
  if (SYNC.rr && !userBusy()) { SYNC.rr = false; render(true); }
  if (!syncOn() || !SY.auto || SYNC.busy || SYNC.st === 'auth' || SYNC.st === 'pending') return;
  const want = document.hidden ? 60000 : (SYNC.st === 'err' || SYNC.st === 'offline') ? 20000 : SY_POLL;
  if (Date.now() - SYNC.tried >= want) syncNow(false);
}
function syncBoot() {
  syncLoad().then(() => { if (syncOn() && SY.auto) setTimeout(() => syncNow(false), 1200); });
  addEventListener('online', () => { if (syncOn() && SY.auto) syncNow(false); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && syncOn() && SY.auto) syncNow(false); });
  addEventListener('focus', () => { if (syncOn() && SY.auto) syncNow(false); });
  setInterval(syncTick, 1500);
}

document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('#syncSt'); if (!t) return; if (SYNC.st === 'pending' && syncOn()) syncNow(true); else syncDialog(); });
