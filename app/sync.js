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
const SY = { url: SY_URL, user: '', token: '', auto: true, rev: -1, mod: 0, last: 0, dev: '' };
const SYNC = { busy: false, base: null, st: 'off', msg: '', timer: null, LV: 0, retry: null, lastSnap: 0, again: false };
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
  if (!SY.dev) { SY.dev = Math.random().toString(36).slice(2, 6); syncPersist(true); }
  if (SY.token) { try { const b = await KV.get('syncbase'); SYNC.base = b ? JSON.parse(b) : null; } catch { SYNC.base = null; } SYNC.st = 'idle'; }
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
  if (!syncOn()) return ['off', 'همگام‌سازی: خاموش (آفلاین)'];
  const t = SY.last ? ' ' + fnum(new Date(SY.last).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })) : '';
  switch (SYNC.st) {
    case 'syncing': return ['busy', 'در حال همگام‌سازی…'];
    case 'offline': return ['warn', 'آفلاین — با اتصال اینترنت همگام می‌شود'];
    case 'err': return ['bad', 'خطای همگام‌سازی: ' + (SYNC.msg || '')];
    case 'auth': return ['bad', 'برای ادامه همگام‌سازی دوباره وارد شوید'];
    case 'ok': return ['ok', 'همگام ✓' + t];
    default: return [SY.auto ? 'ok' : 'warn', SY.auto ? 'همگام‌سازی فعال' + (t ? ' · آخرین:' + t : '') : 'همگام‌سازی دستی'];
  }
}
function syncStatus() {
  const e = document.getElementById('syncSt'); if (!e) return;
  const [c, t] = syncLabel(); e.className = 'savest sy ' + c; e.textContent = t;
}

/* ---------- engine ---------- */
const clone = o => JSON.parse(JSON.stringify(o));
const syncSoon = () => { if (!syncOn() || !SY.auto) return; clearTimeout(SYNC.timer); SYNC.timer = setTimeout(() => syncNow(false), 7000); };
const userBusy = () => { if (document.querySelector('dialog[open]:not(#dlg[data-sync])')) return true; const a = document.activeElement; return !!(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.id !== 'fq' && !a.closest('dialog')); };
async function syncNow(manual) {
  if (!syncOn()) return false;
  if (SYNC.busy) { SYNC.again = true; return false; }
  SYNC.busy = true; SYNC.st = 'syncing'; syncStatus();
  let result = false;
  try {
    for (let attempt = 0; attempt < 5; attempt++) {
      const lv = SYNC.LV;
      const resp = await syApi('pull', { rev: SY.rev });
      if (!resp.ok) throw { server: true, msg: resp.msg || 'خطا' };
      let merged, S = null;
      const st = { del: 0, conf: 0 };
      if (!resp.changed) { // سرور از آخرین همگام تغییری نکرده
        if (SYNC.base && deq(SYNC.base, R)) { SY.last = Date.now(); SYNC.st = 'ok'; result = true; break; }
        merged = R;
      } else {
        S = resp.data ? migrate(resp.data) : null;
        if (!S) merged = R;
        else merged = merge3(SYNC.base || {}, R, S, SY.mod >= (resp.mod || 0), st);
      }
      if (lv !== SYNC.LV) continue; // وسط کار ویرایش شد؛ دوباره
      if (!deq(merged, R)) {
        if (!manual && userBusy()) { SYNC.st = 'idle'; syncStatus(); clearTimeout(SYNC.retry); SYNC.retry = setTimeout(() => syncNow(false), 12000); return false; }
        if (Date.now() - SYNC.lastSnap > 30 * 60e3) { SYNC.lastSnap = Date.now(); try { await snapNow('قبل از همگام‌سازی'); } catch { } }
        const cur = db && db.id; R = merged; try { R.classes.forEach(syncAbsent); } catch { } setCur(cur); persist(); render(true);
        if (st.conf) toast(`همگام‌سازی انجام شد؛ ${fa(st.conf, 0)} مورد تداخل به نفع جدیدترین ویرایش حل شد`); else toast('اطلاعات از حساب شما به‌روز شد');
      }
      if (S && deq(merged, S)) { // چیزی برای فرستادن نیست
        SY.rev = resp.rev; SYNC.base = clone(merged); await syncPersistBase(); SY.last = Date.now(); SYNC.st = 'ok'; result = true; break;
      }
      const pr = await syApi('push', { base: resp.rev, mod: Math.max(SY.mod, resp.mod || 0) || Date.now(), data: R });
      if (pr.conflict) continue; // همزمان کس دیگری فرستاد؛ دوباره ادغام
      if (!pr.ok) throw { server: true, msg: pr.msg || 'خطا' };
      SY.rev = pr.rev; SYNC.base = clone(R); await syncPersistBase(); SY.last = Date.now(); SYNC.st = 'ok'; result = true; break;
    }
    if (!result && SYNC.st === 'syncing') { SYNC.st = 'err'; SYNC.msg = 'تداخل پیاپی؛ کمی بعد دوباره تلاش می‌شود'; }
  } catch (e) {
    if (e && e.offline) { SYNC.st = 'offline'; if (manual) toast('اینترنت یا سرور در دسترس نیست؛ اطلاعات فعلاً روی همین دستگاه ذخیره است'); }
    else if (e && e.auth) { SYNC.st = 'auth'; if (manual) toast('نشست منقضی شده؛ دوباره وارد شوید'); }
    else { SYNC.st = 'err'; SYNC.msg = (e && e.msg) || 'نامشخص'; }
  } finally {
    SYNC.busy = false; syncPersist(true); syncStatus();
    if (SYNC.again) { SYNC.again = false; setTimeout(() => syncNow(false), 800); }
    const dd = document.getElementById('dlg'); if (dd && dd.dataset.sync && dd.open && !dd.querySelector('[data-c]') && !dd.querySelector('[data-rv]')) syncDialog();
  }
  return result;
}
/* ورود/ثبت‌نام و اتصال اولیه */
async function syncLogin(mode, user, pass, invite) {
  const r = await syApi(mode, { user: user.trim().toLowerCase(), pass, invite, token: '' });
  if (!r.ok) throw { msg: r.msg || 'ناموفق' };
  SY.user = r.user; SY.token = r.token; SY.rev = -1; SYNC.base = null; SY.last = 0; SYNC.st = 'idle';
  await syncPersist(true); await KV.set('syncbase', 'null');
  const s = await syApi('pull', { rev: -1, force: true });
  const S = s.data ? migrate(s.data) : null, hasS = !!S && (S.classes.length > 0), hasL = R.classes.length > 0;
  let ch = 'merge';
  if (!hasS && !hasL) ch = 'upload';
  else if (!hasS) ch = 'upload';
  else if (!hasL) ch = 'server';
  else ch = await linkChoice(S, s);
  if (!ch) { SY.token = ''; SY.user = ''; await syncPersist(true); throw { msg: 'اتصال لغو شد؛ اطلاعات هیچ‌کدام تغییری نکرد' }; }
  if (ch === 'upload') { SY.rev = s.rev; SYNC.base = emptyRoot(); }
  else if (ch === 'local') { SY.rev = s.rev; SYNC.base = clone(S); }
  else if (ch === 'server') { SY.rev = -1; SYNC.base = clone(R); }
  else { SY.rev = -1; SYNC.base = {}; }
  await syncPersistBase(); await syncPersist(true);
  return syncNow(true);
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
  SY.token = ''; SY.user = ''; SY.rev = -1; SY.last = 0; SYNC.base = null; SYNC.st = 'off';
  await syncPersist(true); await KV.set('syncbase', 'null'); syncStatus();
}

/* ---------- dialog ---------- */
function syncDialog(tab) {
  const d = $('#dlg'); d.dataset.sync = '1'; d.onclose = () => { delete d.dataset.sync; };
  const close = () => { delete d.dataset.sync; d.close(); };
  const msgBox = '<div id="syMsg" class="sub" style="color:var(--bad);min-height:1.4em"></div>';
  if (!syncOn()) {
    tab = tab || 'login'; const reg = tab === 'reg';
    d.innerHTML = `<form onsubmit="return false"><h3>🔄 همگام‌سازی بین ویندوز و گوشی</h3>
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
  d.innerHTML = `<form onsubmit="return false"><h3>🔄 همگام‌سازی</h3>
  <div class="card" style="padding:12px"><div class="row" style="justify-content:space-between"><span>حساب: <b dir="ltr">${esc(SY.user)}</b></span><span class="pill ${c === 'ok' ? 'ok' : c === 'bad' ? 'bad' : 'warn'}">${esc(t)}</span></div>
  <div class="sub" style="margin-top:4px">این دستگاه: ${esc(devName())} · ${SY.last ? 'آخرین همگام‌سازی: ' + when(SY.last) : 'هنوز همگام نشده'}</div></div>
  <label class="ck"><input type="checkbox" id="syAuto" ${SY.auto ? 'checked' : ''}><span><b>همگام‌سازی خودکار</b><small>چند ثانیه بعد از هر تغییر و هر بار که اینترنت وصل شد. اگر خاموش باشد فقط با دکمه زیر همگام می‌شود.</small></span></label>
  <div class="row"><button type="button" class="btn" id="syNow">همگام‌سازی همین الان</button><button type="button" class="btn sec" id="syHist">نسخه‌های ذخیره‌شده در سرور</button></div>
  <details><summary class="sub" style="cursor:pointer">گزینه‌های پیشرفته</summary><div class="row" style="margin-top:8px">
  <button type="button" class="btn sec sm" id="syDown">جایگزینی اطلاعات این دستگاه با سرور</button><button type="button" class="btn sec sm" id="syUp">جایگزینی اطلاعات سرور با این دستگاه</button><button type="button" class="btn sec sm" id="syPw">تغییر رمز</button></div>
  <label class="f" style="margin-top:8px">آدرس سرور<input id="syUrl" dir="ltr" value="${esc(SY.url)}"></label></details>
  <div id="syMsg" class="sub" style="min-height:1.4em"></div>
  <div class="row"><button type="button" class="btn bad" id="syOut">خروج از حساب</button><button type="button" class="btn sec" data-x>بستن</button></div>
  <p class="sub" style="margin:0">خروج از حساب هیچ اطلاعاتی را از این دستگاه پاک نمی‌کند.</p></form>`;
  d.querySelector('[data-x]').onclick = close;
  const msg = x => { const m = $('#syMsg'); if (m) m.textContent = x; };
  $('#syAuto').onchange = e => { SY.auto = e.target.checked; syncPersist(true); syncStatus(); if (SY.auto) syncSoon(); };
  $('#syUrl').onchange = e => { SY.url = e.target.value.trim() || SY_URL; syncPersist(true); };
  $('#syNow').onclick = async () => { $('#syNow').disabled = true; msg('در حال همگام‌سازی…'); const ok = await syncNow(true); if (ok) toast('همگام‌سازی کامل شد'); };
  $('#syOut').onclick = async () => { if (confirm('از حساب خارج شوید؟ اطلاعات این دستگاه سر جایش می‌ماند و برنامه آفلاین ادامه می‌دهد.')) { await syncLogout(); syncDialog(); } };
  $('#syDown').onclick = async () => {
    if (!confirm('اطلاعات این دستگاه با نسخه سرور جایگزین شود؟ (از وضعیت فعلی یک پشتیبان گرفته می‌شود)')) return;
    try { const s = await syApi('pull', { rev: -1, force: true }); if (!s.data) return msg('روی سرور اطلاعاتی نیست.'); await snapNow('قبل از جایگزینی با سرور'); SYNC.lastSnap = Date.now(); const cur = db && db.id; R = migrate(s.data); setCur(cur); SY.rev = s.rev; SYNC.base = clone(R); await syncPersistBase(); persist(); SY.last = Date.now(); SYNC.st = 'ok'; syncStatus(); render(true); syncDialog(); toast('اطلاعات از سرور جایگزین شد'); } catch (e) { msg(e.msg || 'خطا'); }
  };
  $('#syUp').onclick = async () => {
    if (!confirm('اطلاعات سرور با اطلاعات این دستگاه جایگزین شود؟ (نسخه قبلی سرور در «نسخه‌های ذخیره‌شده در سرور» می‌ماند)')) return;
    try { const s = await syApi('pull', { rev: -1 }); const p = await syApi('push', { base: s.rev, force: true, mod: Date.now(), data: R }); if (!p.ok) return msg(p.msg || 'خطا'); SY.rev = p.rev; SYNC.base = clone(R); await syncPersistBase(); SY.last = Date.now(); SYNC.st = 'ok'; syncStatus(); syncDialog(); toast('اطلاعات سرور با این دستگاه یکی شد'); } catch (e) { msg(e.msg || 'خطا'); }
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
        try { const g = await syApi('getver', { rev: +b.dataset.rv }); if (!g.ok) return toast(g.msg); await snapNow('قبل از بازگردانی از سرور'); const cur = db && db.id; R = migrate(g.data); setCur(cur); save(); render(true); toast('نسخه بازگردانی شد'); close(); } catch (e) { toast(e.msg || 'خطا'); }
      });
    } catch (e) { msg(e.msg || 'خطا'); }
  };
  if (!d.open) d.showModal();
}

/* ---------- triggers ---------- */
function syncBoot() {
  syncLoad().then(() => { if (syncOn() && SY.auto) setTimeout(() => syncNow(false), 3500); });
  addEventListener('online', () => { if (syncOn() && SY.auto) syncNow(false); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && syncOn() && SY.auto && Date.now() - SY.last > 30000) syncNow(false); });
  addEventListener('focus', () => { if (syncOn() && SY.auto && Date.now() - SY.last > 30000) syncNow(false); });
  setInterval(() => { if (syncOn() && SY.auto && !document.hidden && Date.now() - SY.last > 120000) syncNow(false); }, 60000);
}
