'use strict';
/* ================= helpers ================= */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fa = (x, d = 2) => x == null || x === '' || isNaN(x) ? '—' : Number(x).toLocaleString('fa-IR', { maximumFractionDigits: d });
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
const iso = d => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 6e4); return z.toISOString().slice(0, 10); };
const jd = s => s ? new Date(s + 'T12:00:00').toLocaleDateString('fa-IR-u-ca-persian', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
const jday = s => new Date(s + 'T12:00:00').toLocaleDateString('fa-IR-u-ca-persian', { month: 'numeric', day: 'numeric' });
const jmon = s => new Date(s + 'T12:00:00').toLocaleDateString('fa-IR-u-ca-persian', { year: 'numeric', month: 'long' });
const wd = s => new Date(s + 'T12:00:00').toLocaleDateString('fa-IR-u-ca-persian', { weekday: 'long' });
const ICO = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  idcard: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="11" r="2.5"/><path d="M5.5 17c.6-1.8 2-2.5 3.5-2.5s2.9.7 3.5 2.5"/><path d="M15 9h3M15 12h3"/>',
  check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  beh: '<rect x="7" y="2" width="10" height="20" rx="3"/><circle cx="12" cy="7" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="17" r="1.4"/>',
  tasks: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="m9 14 2 2 4-4"/>',
  exam: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  dice: '<rect x="3" y="3" width="18" height="18" rx="4"/><g fill="currentColor" stroke="none"><circle cx="8.5" cy="8.5" r="1.3"/><circle cx="15.5" cy="8.5" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="8.5" cy="15.5" r="1.3"/><circle cx="15.5" cy="15.5" r="1.3"/></g>',
  table: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  flask: '<path d="M9 2h6M10 2v6L4.5 19a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 8V2"/><path d="M7 15h10"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5"/>',
  ban: '<circle cx="12" cy="12" r="10"/><line x1="4.9" y1="4.9" x2="19.1" y2="19.1"/>',
  print: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  sync: '<path d="M21 12a9 9 0 0 0-15.5-6.2L3 8"/><polyline points="3 3 3 8 8 8"/><path d="M3 12a9 9 0 0 0 15.5 6.2L21 16"/><polyline points="21 21 21 16 16 16"/>',
  right: '<polyline points="9 18 15 12 9 6"/>', left: '<polyline points="15 18 9 12 15 6"/>',
  search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'
};
const ico = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICO[n] || ''}</svg>`;
const nq = x => String(x ?? '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/\u200c/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
const vis = () => { const base = S.view === 'acts' ? actStudents(actOf(S.ak)) : db.students; if (S.fid) { const s = stuOf(S.fid); if (s) return base.filter(x => x.id === s.id); } const q = nq(S.fq); return q ? base.filter(x => nq(x.name).includes(q)) : base; };
const fqBox0 = () => `<span class="fqw noprint">${ico('search')}<input id="fq" class="fq" type="search" autocomplete="off" placeholder="جستجوی نام دانش‌آموز…" value="${esc(S.fq)}"></span>`;
const fqBox = () => S.fid && stuOf(S.fid) ? `<span class="fidc noprint">👤 <b>${esc(stuOf(S.fid).name)}</b> <button type="button" class="btn sec sm" data-act="fidClear">نمایش همه ✕</button></span>` : fqBox0();
const COLORS = ['#0f7c8a', '#f2a516', '#d64545', '#3b7dd8', '#1f9d63', '#8e5bd1', '#e0702d', '#2b9aa8', '#c2478a'];
const colorOf = s => COLORS[[...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];
const ST = { p: 'حاضر', a: 'غایب', l: 'تأخیر', e: 'مجاز' };
const BEH = {
  r: { t: 'قرمز', p: -2, c: '#d64545', bg: '#fde6e6', fg: '#b42626' },
  y: { t: 'زرد', p: -1, c: '#f2c400', bg: '#fff3bf', fg: '#7a5c00' },
  g: { t: 'سبز کمرنگ', p: 1, c: '#8ccf7e', bg: '#e3f5dc', fg: '#2c6b1d' },
  G: { t: 'سبز پررنگ', p: 2, c: '#1f9d63', bg: '#1f9d63', fg: '#ffffff' },
  w: { t: 'یادداشت', p: 0, c: '#ffffff', bg: '#f7f7f7', fg: '#444444', bd: '#b5bcc0' }
};
const BEHD = { r: -2, y: -1, g: 1, G: 2, w: 0 };
const bstepVal = (c = db) => { const s = c && c.bstep; if (s === 'custom') return Math.abs(+(c.bpts && c.bpts.y)) || 1; return s === 0.5 || s === 0.25 ? s : 1; };
function bp(k, c = db) { if (!BEH[k] || k === 'w') return 0; if (c && c.bstep === 'custom' && c.bpts && c.bpts[k] != null && !isNaN(c.bpts[k])) return +c.bpts[k]; return BEHD[k] * bstepVal(c); }
const pt = (k, c = db) => bp(k, c) ? sgn(bp(k, c)) : 'بدون امتیاز';
const chipStyle = t => `background:${BEH[t].bg};color:${BEH[t].fg};${BEH[t].bd ? 'border:1px solid ' + BEH[t].bd : ''}`;
const sgn = n => (n > 0 ? '+' : n < 0 ? '−' : '') + fa(Math.abs(Math.round(n * 100) / 100), 2);
const behPill = t => `<span class="pill" style="${chipStyle(t)}">${BEH[t].t} (${pt(t)})</span>`;

/* ================= data model =================
 root = { v:2, meta:{school,teacher,year,pass}, classes:[ {id,name,grade,students,courses,exams,att,beh} ] } */
const KEY = 'class-office-v1';
const emptyRoot = () => ({ v: 2, meta: { school: '', teacher: '', year: '', pass: 10 }, classes: [] });
const newClass = (name, grade = '') => ({ id: uid(), name, grade, students: [], courses: [], exams: [], att: {}, beh: [], tasks: [], acts: [], draws: [], bstep: 1 });
/* سرور PHP قدیمی هر «{}» خالی را به «[]» تبدیل می‌کرد؛ آن‌وقت نمره‌ی تازه روی آرایه می‌نشست و هنگام ذخیره (JSON) از بین می‌رفت. اینجا شکل درست برمی‌گردد. */
function fixShapes(d) {
  if (!d || !Array.isArray(d.classes)) return d;
  const O = (o, k) => { const v = o[k]; if (!v || typeof v !== 'object') o[k] = {}; else if (Array.isArray(v)) o[k] = Object.assign({}, v); return o[k]; };
  d.classes.forEach(c => {
    O(c, 'att'); Object.keys(c.att).forEach(k => O(c.att, k));
    (c.exams || []).forEach(e => O(e, 'scores'));
    (c.tasks || []).forEach(t => { O(t, 'res'); Object.keys(t.res).forEach(k => O(t.res, k)); });
    (c.acts || []).forEach(a => { O(a, 'res'); Object.keys(a.res).forEach(k => O(a.res, k)); });
  });
  return d;
}
function migrate(d) {
  if (!d || typeof d !== 'object') return null;
  if (Array.isArray(d.classes)) {
    d.meta = Object.assign({ school: '', teacher: '', year: '', pass: 10 }, d.meta);
    d.classes.forEach(c => { c.students ??= []; c.courses ??= []; c.exams ??= []; c.att ??= {}; c.beh ??= []; c.tasks ??= []; c.acts ??= []; c.draws ??= []; c.drawn ??= []; c.bstep ??= 1; c.grade ??= ''; });
    return fixShapes(d);
  }
  if (Array.isArray(d.students)) { // old single-class backup
    const m = d.meta || {};
    const c = { id: uid(), name: m.cls || 'کلاس من', grade: m.grade || '', students: d.students, courses: d.courses || [], exams: d.exams || [], att: d.att || {}, beh: [], tasks: [], acts: [], draws: [], bstep: 1 };
    return { v: 2, meta: { school: m.school || '', teacher: m.teacher || '', year: m.year || '', pass: m.pass ?? 10 }, classes: [c] };
  }
  return null;
}
function sample() {
  const fathers = ['حسین', 'علی', 'مجید', 'احمد', 'رضا', 'جواد', 'مهدی', 'اکبر'];
  const make = (name, grade, list, seed0) => {
    let seed = seed0; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const students = list.map(([f, l], i) => ({ id: uid(), name: f + ' ' + l, father: fathers[i % 8], nid: String(1270000000 + Math.floor(rnd() * 9e6)), birth: `${1390 + (i % 2)}/${1 + (i * 5) % 12}/${1 + (i * 7) % 28}`, phone: '0912' + String(1000000 + Math.floor(rnd() * 8999999)), address: 'تهران', photo: '', ability: 0.55 + rnd() * 0.45 }));
    const courses = [['ریاضی', 4], ['علوم', 3], ['فارسی', 4], ['مطالعات اجتماعی', 2], ['عربی', 2], ['انگلیسی', 2]].map(([n, coef]) => ({ id: uid(), name: n, coef }));
    const today = new Date(), exams = [];
    courses.forEach((c, ci) => { for (let k = 0; k < 4; k++) {
      const d = new Date(today); d.setDate(d.getDate() - (95 - k * 24 - ci * 2)); const scores = {};
      students.forEach(s => { if (rnd() > .04) scores[s.id] = Math.min(20, Math.max(4, Math.round((s.ability * 20 + (rnd() - .5) * 7 + k * .3) * 4) / 4)); });
      exams.push({ id: uid(), courseId: c.id, title: ['آزمون مهر', 'آزمون آبان', 'میان‌ترم', 'پایان‌ماه'][k], date: iso(d), max: 20, scores });
    } });
    const att = {}; let day = new Date(today), n = 0;
    while (n < 24) { day.setDate(day.getDate() - 1); if (day.getDay() === 5) continue; const r = {};
      students.forEach(s => { const x = rnd(); r[s.id] = x < (1 - s.ability) * .22 ? 'a' : x < .96 - s.ability * .02 ? 'p' : x < .975 ? 'l' : 'p'; if (r[s.id] === 'p' && rnd() < .01) r[s.id] = 'e'; });
      att[iso(day)] = r; n++; }
    const dates = Object.keys(att), beh = [];
    const notesP = ['کمک به همکلاسی', 'پاسخ عالی به سؤال', 'تمیز نگه داشتن کلاس', 'تکلیف کامل و مرتب'], notesN = ['صحبت کردن در کلاس', 'بی‌نظمی', 'فراموشی تکلیف', 'تأخیر در ورود'];
    students.forEach(s => { if (rnd() < .3) beh.push({ id: uid(), sid: s.id, date: dates[Math.floor(rnd() * dates.length)], t: 'w', note: ['تماس با ولی انجام شد', 'نیاز به پیگیری درسی', 'علاقه به شرکت در المپیاد'][Math.floor(rnd() * 3)] }); const k = Math.floor(rnd() * 8); for (let i = 0; i < k; i++) {
      const good = rnd() < s.ability - .1, strong = rnd() < .4;
      const t = good ? (strong ? 'G' : 'g') : (strong ? 'r' : 'y');
      beh.push({ id: uid(), sid: s.id, date: dates[Math.floor(rnd() * dates.length)], t, note: (good ? notesP : notesN)[Math.floor(rnd() * 4)] });
    } delete s.ability; });
    const tasks = [['تمرین فصل ۱', 0], ['حل مسائل صفحه ۴۰', 10], ['گزارش کار', 0], ['تمرین فصل ۲', 5]].map(([title, max], k) => { const d = new Date(today); d.setDate(d.getDate() - (40 - k * 9)); const res = {}; students.forEach(s => { const x = rnd(); if (x < .08) return; const done = x > .22; const r = { st: done ? 'y' : 'n' }; if (done && max) r.sc = Math.round(max * (.55 + rnd() * .45) * 4) / 4; res[s.id] = r; }); return { id: uid(), courseId: courses[k % courses.length].id, title, date: iso(d), due: '', max, res }; });
    return { id: uid(), name, grade, students, courses, exams, att, beh, tasks, acts: [], draws: [], bstep: 1 };
  };
  const n1 = [['محراب', 'رضایی'], ['محمد', 'احمدی'], ['سینا', 'کریمی'], ['مهبد', 'حسینی'], ['آرین', 'موسوی'], ['امیرعلی', 'صادقی'], ['پارسا', 'نوری'], ['رضا', 'جعفری'], ['کیان', 'محمدی'], ['بهراد', 'قاسمی']];
  const n2 = [['ماهان', 'رحیمی'], ['علیرضا', 'یوسفی'], ['نیما', 'اکبری'], ['آرمان', 'سلیمانی'], ['یاسین', 'طاهری'], ['هادی', 'فرهادی'], ['امیرحسین', 'زارعی'], ['سجاد', 'عباسی']];
  return { v: 2, meta: { school: 'مدرسه عطاآفرین رشت', teacher: 'آقای/خانم معلم', year: '۱۴۰۵-۱۴۰۶', pass: 10 }, classes: [make('نهم ۱', 'نهم', n1, 7), make('نهم ۲', 'نهم', n2, 13)] };
}
const idb = () => new Promise((res, rej) => { const r = indexedDB.open('class-office', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const idbGet = () => idb().then(d => new Promise(res => { const q = d.transaction('kv').objectStore('kv').get(KEY); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); })).catch(() => null);
const idbPut = v => idb().then(d => { d.transaction('kv', 'readwrite').objectStore('kv').put(v, KEY); }).catch(() => {});
const CAPP = !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform());
const FS = CAPP ? Capacitor.Plugins.Filesystem : null, NFILE = 'kelasam/class-data.json';
let fileChain = Promise.resolve();
const pushFile = (text) => { if (!FS) return Promise.resolve(); fileChain = fileChain.then(() => FS.writeFile({ path: NFILE, data: text, directory: 'DATA', encoding: 'utf8', recursive: true })).catch(() => toast('ذخیره در حافظه گوشی انجام نشد!')); return fileChain; };
const readFile = () => FS.readFile({ path: NFILE, directory: 'DATA', encoding: 'utf8' }).then(r => r.data).catch(() => null);
let SERVER = false, fresh = false, VER = '0', pushing = null, again = false, saveInfo = { ok: true, t: 0 };
const flushServer = () => pushing || Promise.resolve();
function showSave() {
  const e = $('#saveSt'); if (!e) return;
  const busy = !!pushing || again;
  e.className = 'savest ' + (busy ? 'busy' : saveInfo.ok ? 'ok' : 'bad');
  e.textContent = busy ? 'در حال ذخیره…' : saveInfo.ok ? (saveInfo.t ? 'ذخیره شد ✓ ' + fnum(new Date(saveInfo.t).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })) : 'ذخیره در فایل برنامه') : 'ذخیره نشد! دوباره تلاش می‌کند…';
  e.title = saveInfo.ok ? 'همه تغییرات در فایل کنار برنامه ذخیره شده است' : 'برنامه را نبندید؛ پوشه برنامه را بررسی کنید';
}
const pullServer = async (force) => {
  try {
    if (pushing || again) return; // never replace local edits that are not saved yet
    const lv = SYNC.LV;
    const r = await fetch('api/data', { cache: 'no-store' }); if (!r.ok) return;
    const v = r.headers.get('X-Ver') || '0'; if (!force && v === VER) return;
    const j0 = await r.json();
    if (pushing || again || lv !== SYNC.LV) return; // وسط خواندن ویرایش شد: چیزی را جایگزین نکن
    const j = migrate(j0); VER = v;
    if (j) { const cur = db && db.id; R = j; setCur(cur); histReset(); render(true); toast('اطلاعات از فایل برنامه به‌روز شد'); }
  } catch { }
};
async function sendOnce() {
  for (let n = 0; n < 4; n++) {
    try {
      let r = await fetch('api/data', { method: 'PUT', headers: { 'If-Match': VER }, body: JSON.stringify(R) });
      if (r.status === 409) { // the file was changed by someone else: keep OUR edits, the other version is kept in backups
        VER = r.headers.get('X-Ver') || VER;
        r = await fetch('api/data', { method: 'PUT', headers: { 'If-Match': VER, 'X-Force': '1' }, body: JSON.stringify(R) });
        if (r.ok) toast('فایل از جای دیگری تغییر کرده بود؛ نسخه قبلی آن در پوشه پشتیبان‌ها نگه داشته شد');
      }
      if (!r.ok) { let t = ''; try { t = (await r.text()).slice(0, 160); } catch { } throw new Error('HTTP ' + r.status + ' ' + t); }
      try { VER = (await r.json()).v || VER; } catch { }
      saveInfo = { ok: true, t: Date.now() }; return true;
    } catch (e) { saveInfo.ok = false; logErr('ذخیره روی سرور: ' + ((e && e.message) || e)); showSave(); await new Promise(res => setTimeout(res, 800 * (n + 1))); }
  }
  serverDown('ذخیره در فایل برنامه انجام نشد'); return false;
}
/* وقتی برنامه‌ی پشتِ صفحه (kelasam.exe) پاسخ نمی‌دهد: هشدار واضح + یک نسخه‌ی پشتیبان خودکار روی همین رایانه */
let DOWN = false, downAt = 0, mirrorT = null;
function mirrorLocal() { clearTimeout(mirrorT); mirrorT = setTimeout(() => { try { localStorage.setItem(KEY + '-emg', JSON.stringify({ t: Date.now(), d: R })); } catch { } }, 1500); }
function serverDown(why) {
  saveInfo.ok = false; showSave();
  try { localStorage.setItem(KEY + '-emg', JSON.stringify({ t: Date.now(), d: R })); } catch { }
  if (DOWN && Date.now() - downAt < 120000) return;
  DOWN = true; downAt = Date.now();
  try { download('kelasam-emergency-' + new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-') + '.json', JSON.stringify(R), 'application/json'); } catch { }
  toast('⚠️ ' + why + '. یک نسخه‌ی پشتیبان همین الان دانلود شد. پنجره را نبندید و kelasam.exe را دوباره اجرا کنید.');
}
function serverUp() { if (!DOWN) return; DOWN = false; saveInfo.ok = true; toast('اتصال به برنامه برقرار شد؛ ذخیره ادامه دارد'); pushServer(); }
let pingFail = 0;
async function pingServer() {
  try { const r = await fetch('api/ping', { cache: 'no-store' }); if (!r.ok) throw 0; pingFail = 0; serverUp(); }
  catch { if (++pingFail >= 2) serverDown('ارتباط با برنامه‌ی kelasam.exe قطع شده است'); }
}
function pushServer() { // coalesced: always writes the latest data, in order, as soon as possible
  again = true; showSave();
  if (!pushing) pushing = (async () => { try { while (again) { again = false; if (!(await sendOnce())) { again = false; } } } finally { pushing = null; showSave(); } })();
  return pushing;
}
addEventListener('beforeunload', e => { if (SERVER && (pushing || again)) { e.preventDefault(); e.returnValue = ''; } });
let R = null, SINFO = null;
try { R = migrate(JSON.parse(localStorage.getItem(KEY))); } catch { }
if (!R) { R = emptyRoot(); fresh = true; }
let db = null; // current class
const setCur = id => { db = R.classes.find(c => c.id === id) || null; };
const persist = () => { const s = JSON.stringify(R); if (SERVER) mirrorLocal(); if (!SERVER) { try { localStorage.setItem(KEY, s); } catch { } if (!CAPP) idbPut(s); } const f = pushFile(s); return SERVER ? pushServer() : f; };
/* ---- واگرد / بازگرد (Undo / Redo) روی کل اطلاعات؛ ویرایش‌های پشت‌سرهم یک کادر متنی یک مرحله حساب می‌شود ---- */
const HIST = { u: [], r: [], last: null, tt: 0, lt: false, busy: false };
const histSize = a => a.reduce((n, x) => n + x.length, 0);
function histInit() { try { HIST.last = JSON.stringify(R); } catch { HIST.last = null; } }
function histReset() { HIST.u = []; HIST.r = []; histInit(); histUI(); }
function histCapture() {
  if (HIST.busy) return; let s; try { s = JSON.stringify(R); } catch { return; }
  if (HIST.last == null) { HIST.last = s; return; } if (s === HIST.last) return;
  const a = document.activeElement, typing = !!(a && /^(INPUT|TEXTAREA)$/.test(a.tagName)), co = typing && HIST.lt && Date.now() - HIST.tt < 1500 && HIST.u.length;
  if (!co) { HIST.u.push(HIST.last); while (HIST.u.length > 1 && (HIST.u.length > 80 || histSize(HIST.u) > 120e6)) HIST.u.shift(); }
  HIST.lt = typing; HIST.tt = Date.now(); HIST.last = s; HIST.r = []; histUI();
}
function histUI() { const u = $('#bUndo'), r = $('#bRedo'); if (u) { u.disabled = !HIST.u.length; u.title = HIST.u.length ? 'برگرداندن آخرین تغییر (Ctrl+Z) · ' + fa(HIST.u.length, 0) + ' مرحله' : 'تغییری برای واگرد نیست'; } if (r) { r.disabled = !HIST.r.length; r.title = HIST.r.length ? 'انجام دوباره‌ی تغییر برگردانده‌شده (Ctrl+Y) · ' + fa(HIST.r.length, 0) + ' مرحله' : 'چیزی برای بازگرد نیست'; } }
function histGo(dir) {
  const from = dir < 0 ? HIST.u : HIST.r, to = dir < 0 ? HIST.r : HIST.u;
  if (!from.length) return toast(dir < 0 ? 'چیزی برای واگرد نیست' : 'چیزی برای بازگرد نیست');
  try { document.activeElement && document.activeElement.blur && document.activeElement.blur(); } catch { }
  const snap = from[from.length - 1]; let j; try { j = migrate(JSON.parse(snap)); } catch { } if (!j) return toast('بازگردانی انجام نشد');
  from.pop(); to.push(HIST.last); const cur = db && db.id; HIST.busy = true;
  try { R = j; setCur(cur); if (!db && S.view !== 'home' && S.view !== 'about') S.view = 'home'; histInit(); save(); } finally { HIST.busy = false; }
  HIST.lt = false; render(true); histUI(); toast(dir < 0 ? '↶ آخرین تغییر برگردانده شد' : '↷ تغییر دوباره اعمال شد');
}
document.addEventListener('keydown', e => {
  if (!(e.ctrlKey || e.metaKey) || e.altKey) return; const k = e.key.toLowerCase(); if (k !== 'z' && k !== 'y') return;
  const t = e.target; if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return; if (document.querySelector('dialog[open]')) return;
  e.preventDefault(); histGo(k === 'y' || e.shiftKey ? 1 : -1);
});
const save = () => { histCapture(); try { R.classes.forEach(syncAbsent); } catch { } SYNC.LV++; SY.mod = nowS(); syncPersist(); persist(); syncSoon(); };
/* «ذخیره اجباری»: هر کادر نیمه‌تمام ثبت می‌شود، همه‌چیز روی حافظه نوشته و با خواندن دوباره تأیید می‌شود و یک پشتیبان هم ساخته می‌شود */
async function forceSave(quiet) {
  try { const a = document.activeElement; if (a && a.blur && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) a.blur(); } catch { }
  await new Promise(r => setTimeout(r, 40));
  try { R.classes.forEach(syncAbsent); } catch { }
  SYNC.LV++; SY.mod = nowS(); syncPersist(true);
  const text = JSON.stringify(R), nC = R.classes.length, nS = R.classes.reduce((a, c) => a + c.students.length, 0);
  let ok = false, where = '', err = '';
  try {
    if (SERVER) {
      await persist(); await flushServer();
      const r = await fetch('api/data', { cache: 'no-store' }), back = await r.text();
      ok = r.ok && (back === text || deq(JSON.parse(back), JSON.parse(text)));
      where = ((SINFO && SINFO.dir) || 'C:\\kelasamdb') + '\\class-data.json';
    } else if (CAPP) {
      await persist(); await fileChain; ok = (await readFile()) === text; where = 'حافظه داخلی برنامه روی گوشی';
    } else { await persist(); ok = localStorage.getItem(KEY) === text; where = 'حافظه مرورگر'; }
  } catch (e) { err = String((e && e.message) || e); }
  let snap = false; try { snap = !!(await Promise.race([snapNow('ذخیره اجباری'), new Promise(r => setTimeout(r, 8000))])); } catch { }
  if (ok) { saveInfo = { ok: true, t: Date.now() }; showSave && showSave(); }
  if (!quiet || !ok) alert(ok ? `✓ ذخیره اجباری انجام و با خواندن دوباره تأیید شد.\n\nمحل ذخیره: ${where}\nحجم: ${fa(Math.round(text.length / 1024), 0)} کیلوبایت · ${fa(nC, 0)} کلاس · ${fa(nS, 0)} دانش‌آموز${snap ? '\nیک نسخه پشتیبان هم ساخته شد.' : ''}` : '⚠️ ذخیره روی حافظه تأیید نشد' + (err ? ' (' + err + ')' : '') + '.\nبرنامه را نبندید؛ از منوی «ذخیره» یک فایل پشتیبان بگیرید و به پشتیبانی خبر دهید.');
  return { ok };
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist();

/* ================= calculations (class-parametrised) ================= */
const norm = (e, sid) => { const v = e.scores[sid]; return v == null ? null : v / e.max * 20; };
const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const courseOf = (id, c = db) => c.courses.find(x => x.id === id);
const stuOf = (id, c = db) => c.students.find(s => s.id === id);
function stuCourseAvg(sid, cid, c = db) { return mean(c.exams.filter(e => e.courseId === cid).map(e => norm(e, sid)).filter(v => v != null)); }
function stuAvg(sid, c = db) { let w = 0, t = 0; c.courses.forEach(k => { const a = stuCourseAvg(sid, k.id, c); if (a != null) { t += a * k.coef; w += k.coef; } }); return w ? t / w : null; }
function courseStats(cid, c = db) { const v = []; c.exams.filter(e => e.courseId === cid).forEach(e => c.students.forEach(s => { const x = norm(e, s.id); if (x != null) v.push(x); })); return { avg: mean(v), min: v.length ? Math.min(...v) : null, max: v.length ? Math.max(...v) : null, n: v.length }; }
const classAvg = (c = db) => mean(c.students.map(s => stuAvg(s.id, c)).filter(v => v != null));
const ranking = (c = db) => c.students.map(s => ({ s, avg: stuAvg(s.id, c) })).filter(x => x.avg != null).sort((a, b) => b.avg - a.avg);
function attCount(sid, c = db) { const o = { p: 0, a: 0, l: 0, e: 0 }; Object.values(c.att).forEach(d => { if (d[sid]) o[d[sid]]++; }); o.t = o.p + o.a + o.l + o.e; o.pct = o.t ? (o.t - o.a) / o.t * 100 : null; return o; }
function behCount(sid, c = db, from = '', to = '', cid = '') {
  const o = { r: 0, y: 0, g: 0, G: 0, w: 0, neg: 0, pos: 0, score: 0 };
  c.beh.forEach(b => { if (b.sid !== sid || !BEH[b.t]) return; if (from && b.date < from) return; if (to && b.date > to) return; if (cid && b.cid !== cid) return; o[b.t]++; const p = bp(b.t, c); o.score += p; if (p < 0) o.neg++; else if (p > 0) o.pos++; });
  return o;
}
function taskCount(sid, c = db) {
  const o = { y: 0, n: 0, u: 0, t: c.tasks.length, sum: 0, k: 0 };
  c.tasks.forEach(t => { const r = t.res[sid]; if (r && r.st === 'y') o.y++; else if (r && r.st === 'n') o.n++; else o.u++; if (r && r.sc != null && t.max > 0) { o.sum += r.sc / t.max * 20; o.k++; } });
  o.pct = (o.y + o.n) ? o.y / (o.y + o.n) * 100 : null; o.avg = o.k ? o.sum / o.k : null; return o;
}
const taskOf = id => db.tasks.find(t => t.id === id);
const tkPill = r => !r || !r.st ? '<span class="pill warn">ثبت نشده</span>' : r.st === 'y' ? '<span class="pill ok">✓ انجام شد</span>' : '<span class="pill bad">✗ انجام نشد</span>';
const pass = () => R.meta.pass ?? 10;
const gradeCls = v => v == null ? '' : v >= 17 ? 'ok' : v >= pass() ? 'warn' : 'bad';
const pill = v => v == null ? '—' : `<span class="pill ${gradeCls(v)}">${fa(v)}</span>`;
const avatar = (s, cls = '') => s.photo ? `<img class="av ${cls}" src="${s.photo}" alt="${esc(s.name)}">` : `<span class="av ${cls}" style="background:${colorOf(s.id)}">${esc(s.name.trim()[0] || '؟')}</span>`;
const nl = s => `<a href="#" class="nl" data-act="open" data-id="${s.id}" title="باز کردن پروفایل ${esc(s.name)}">${esc(s.name)}</a>`;
const qaBtns = s => `<div class="qa">${[['tasks', 'تکلیف', 'qtk'], ['beh', 'رفتار', 'qbh'], ['exams', 'آزمون', 'qex'], ['acts', 'فعالیت', 'qac']].map(([v, t, c]) => `<button type="button" class="qb ${c}" data-act="goto" data-v="${v}" data-id="${s.id}" title="${t} ${esc(s.name)}">${t}</button>`).join('')}<button type="button" class="qb qsm" data-act="summary" data-id="${s.id}" title="برآیند کلی ${esc(s.name)} (قابل نمایش روی صفحه دوم)">برآیند</button></div>`;
const coursePick = (act, cur, label = 'درس') => `<div class="card noprint" style="margin-bottom:12px;padding:12px 16px"><div class="row" style="margin:0"><b style="font-size:13px">${label}:</b><div class="chips"><button type="button" class="cc ${!cur ? 'on' : ''}" data-act="${act}" data-id="">همه دروس</button>${db.courses.map(k => `<button type="button" class="cc ${cur === k.id ? 'on' : ''}" data-act="${act}" data-id="${k.id}">${esc(k.name)}</button>`).join('')}</div></div></div>`;
const behBadge = c => `<span class="pill ok">${sgn(c.pos).replace('−', '+')}</span> <span class="pill bad">${c.neg ? '−' + fa(c.neg, 0) : '۰'}</span>`;

/* ================= state & ui ================= */
const S = { fid: '', pbt: '', ak: null, actCourse: '', fq: '', bc: '', pbc: '', dr: { n: 3, present: true, norep: true, c: '', low: false, high: false, bad: false, good: false, tk: false, graded: false }, drawn: {}, view: 'home', st: null, ex: null, exCourse: '', q: '', date: iso(new Date()), bf: '', bt: '', bsort: 'score' };
let charts = [];
const NAV = [['cover', 'book', 'مشخصات کلاس'], ['dash', 'chart', 'داشبورد'], ['courses', 'layers', 'درس‌ها'], ['students', 'users', 'دانش‌آموزان'], ['profile', 'idcard', 'پروفایل'], ['att', 'check', 'حضور و غیاب'], ['beh', 'beh', 'رفتار'], ['tasks', 'tasks', 'تکالیف'], ['acts', 'target', 'فعالیت و پروژه'], ['exams', 'exam', 'آزمون‌ها'], ['draw', 'dice', 'قرعه‌کشی']];
const BOT = [['dash', 'chart', 'داشبورد'], ['students', 'users', 'دانش‌آموز'], ['att', 'check', 'حضور'], ['beh', 'beh', 'رفتار'], ['tasks', 'tasks', 'تکالیف'], ['exams', 'exam', 'آزمون']];
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2000); }
function mkChart(id, cfg) {
  const el = document.getElementById(id); if (!el) return;
  Chart.defaults.font.family = 'Vazirmatn'; Chart.defaults.color = '#617479';
  cfg.options = Object.assign({ responsive: true, maintainAspectRatio: false }, cfg.options || {});
  cfg.options.plugins = Object.assign({ legend: { display: false } }, cfg.options.plugins || {});
  charts.push(new Chart(el, cfg));
}
const tickFa = { callback: v => Number(v).toLocaleString('fa-IR') };
function dlgOpen(title, body, onSubmit, okText = 'ذخیره') {
  const d = $('#dlg');
  d.innerHTML = `<form><h3>${title}</h3>${body}<div class="row"><button class="btn">${okText}</button><button type="button" class="btn sec" data-close>انصراف</button></div></form>`;
  d.querySelector('[data-close]').onclick = () => d.close();
  d.querySelector('form').onsubmit = e => { e.preventDefault(); const r = onSubmit(Object.fromEntries(new FormData(e.target)), e.target); if (r !== false) d.close(); };
  d.showModal();
}
const field = (n, label, v = '', t = 'text', x = '') => t === 'date' ? `<label class="f">${label}${jdate(n, v, x)}</label>` : `<label class="f">${label}<input name="${n}" type="${t}" value="${esc(v)}" ${x}></label>`;
const head = (t, sub, actions = '') => `<div class="top"><div><h1>${t}</h1><div class="sub">${sub}</div></div><div class="row noprint">${actions}</div></div>`;
function classBar() {
  return `<div class="clsbar noprint"><span>🏫 کلاس فعال:</span><select id="clsSel">${R.classes.map(c => `<option value="${c.id}" ${c.id === db.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select><span>${fa(db.students.length, 0)} دانش‌آموز</span></div>`;
}
const resetClassFilters = () => { S.st = S.ex = S.tk = S.ak = null; S.fq = ''; S.fid = ''; S.exCourse = S.tkCourse = S.actCourse = S.bc = S.pbc = ''; S.dr.c = ''; S.pbt = ''; S.lastDraw = null; };
function V(h) {
  const tops = V.keep ? [...document.querySelectorAll('#view .tw, #view .exl')].map(e => e.scrollTop) : [];
  $('#view').innerHTML = (db && S.view !== 'home' && S.view !== 'about' ? classBar() : '') + bkBanner() + h;
  if (tops.length) document.querySelectorAll('#view .tw, #view .exl').forEach((e, i) => { if (tops[i]) e.scrollTop = tops[i]; });
  const sel = $('#clsSel'); if (sel) sel.onchange = e => { setCur(e.target.value); resetClassFilters(); render(); };
}
const VIEWS = {};
function setMenu(open) { $('#side').classList.toggle('open', open); $('#scrim').classList.toggle('on', open); }
const deskScroll = () => matchMedia('(min-width:761px)').matches && !matchMedia('print').matches;
const scEl = () => deskScroll() ? document.querySelector('main') : null;
const scY = () => { const m = scEl(); return m ? m.scrollTop : window.scrollY; };
const scTo = y => { const m = scEl(); if (m) m.scrollTop = y; else window.scrollTo(0, y); };
const scBy = dy => { const m = scEl(); if (m) m.scrollTop += dy; else window.scrollBy(0, dy); };
function render(keep = false) {
  const y = scY(); V.keep = keep;
  charts.forEach(c => c.destroy()); charts = [];
  if (S.view !== 'home' && S.view !== 'about' && !db) S.view = 'home';
  $('#brandSub').textContent = db ? db.name : 'مدیریت کلاس‌ها';
  const items = [['home', 'home', 'کلاس‌ها'], ...(db ? NAV : [])];
  $('#nav').innerHTML = items.map(([k, i, t]) => `<button class="nav ${S.view === k ? 'on' : ''}" data-nav="${k}"><span class="ic">${ico(i)}</span>${t}</button>`).join('');
  $('#bAbout').classList.toggle('on', S.view === 'about');
  $('#bExportCls').hidden = !db;
  $('#bottom').innerHTML = [['home', 'home', 'کلاس‌ها'], ...(db ? BOT : [])].map(([k, i, t]) => `<button class="${S.view === k ? 'on' : ''}" data-nav="${k}"><span>${ico(i)}</span>${t}</button>`).join('') + `<button data-more><span>${ico('menu')}</span>بیشتر</button>`;
  setMenu(false);
  VIEWS[S.view]();
  scTo(keep ? y : 0);
}
const emptyHint = () => db.students.length ? '' : `<div class="card" style="margin:0 0 16px;border-color:#f6d98a;background:#fffaf0"><h3>شروع کار با «${esc(db.name)}»</h3><p class="sub" style="margin:0 0 12px">هنوز دانش‌آموزی در این کلاس ثبت نشده است. لیست کلاس را از اکسل یا متن وارد کنید، یا یکی‌یکی اضافه کنید.</p><div class="row"><button class="btn" data-act="importStudents">📥 ایمپورت از اکسل / متن</button><button class="btn sec" data-act="addStudent">+ دانش‌آموز جدید</button></div></div>`;

/* ================= views ================= */
VIEWS.home = function () {
  const m = R.meta;
  const cards = R.classes.map(c => {
    const at = mean(c.students.map(s => attCount(s.id, c).pct).filter(v => v != null)); let neg = 0, pos = 0; c.beh.forEach(b => { const p = bp(b.t, c); if (p < 0) neg++; else if (p > 0) pos++; });
    return `<div class="card ccard"><div class="row" style="justify-content:space-between"><div><h2>${esc(c.name)}</h2><div class="sub">${c.grade ? 'پایه ' + esc(c.grade) : '&nbsp;'}</div></div><div style="font-size:34px">🏫</div></div>
    <div class="mini"><div><small>دانش‌آموز</small><b>${fa(c.students.length, 0)}</b></div><div><small>میانگین</small><b>${fa(classAvg(c), 1)}</b></div><div><small>حضور</small><b>${at == null ? '—' : fa(at, 0) + '٪'}</b></div><div><small>رفتار</small><b style="font-size:13px"><span style="color:var(--ok)">+${fa(pos, 0)}</span> <span style="color:var(--bad)">−${fa(neg, 0)}</span></b></div></div>
    <div class="row"><button class="btn" data-act="openClass" data-id="${c.id}">ورود به کلاس</button><button class="btn sec sm" data-act="editClass" data-id="${c.id}">ویرایش</button><button class="btn bad sm" data-act="delClass" data-id="${c.id}">حذف</button></div></div>`;
  }).join('');
  V(head('kelasam', m.school ? esc(m.school) + (m.year ? ' · سال تحصیلی ' + esc(m.year) : '') : 'کلاس‌های خود را بسازید و هر کدام را جداگانه مدیریت کنید', `<button class="btn" data-act="addClass">+ کلاس جدید</button><button class="btn sec" data-act="importStudents">📥 ایمپورت دانش‌آموزان</button>`) +
    (R.classes.length ? `<div class="cgrid">${cards}</div>` : `<div class="card" style="border-color:#f6d98a;background:#fffaf0"><h3>به kelasam خوش آمدید 👋</h3><p class="sub">برای شروع یک کلاس بسازید (مثلاً «نهم ۱») و دانش‌آموزان آن را از اکسل یا متن وارد کنید. هر کلاس نمرات، حضور و غیاب و رفتار جداگانه دارد.</p><div class="row"><button class="btn" data-act="addClass">+ ساخت اولین کلاس</button><button class="btn sec" data-act="loadSample">دیدن نمونه با دو کلاس</button></div></div>`) +
    `<form class="card" id="schoolForm" style="margin-top:18px"><h3>اطلاعات کلی مدرسه</h3><div class="fg">${field('school', 'نام مدرسه', m.school)}${field('teacher', 'نام معلم', m.teacher)}${field('year', 'سال تحصیلی', m.year)}${field('pass', 'حد نمره قبولی (از ۲۰)', m.pass, 'number', 'min=0 max=20 step=0.25')}</div><div class="row" style="margin-top:14px;justify-content:space-between"><button class="btn">ذخیره</button><span class="row"><button type="button" class="btn sec sm" data-act="loadSample" title="دو کلاس نمونه برای آشنایی با برنامه">${ico('flask')} داده نمونه</button><button type="button" class="btn bad sm" data-act="clearAll" title="پاک‌کردن همه کلاس‌ها (قبلش یک پشتیبان گرفته می‌شود)">${ico('trash')} شروع از صفر</button></span></div></form>`);
  $('#schoolForm').onsubmit = e => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); R.meta = { school: d.school, teacher: d.teacher, year: d.year, pass: +d.pass }; save(); render(true); toast('ذخیره شد'); };
};

VIEWS.cover = function () {
  const m = R.meta;
  V(emptyHint() + `<div class="cover"><div class="sub" style="color:#bfe3e8">دفتر کلاس · سال تحصیلی ${esc(m.year)}</div><h2>${esc(m.school || 'نام مدرسه')}</h2><p>${db.grade ? 'پایه ' + esc(db.grade) + ' — ' : ''}کلاس ${esc(db.name)}</p><p>معلم: ${esc(m.teacher || '—')}</p></div>
  <div class="grid g21" style="margin-top:16px"><form class="card" id="metaForm"><h3>ویرایش مشخصات</h3><div class="fg">${field('name', 'نام کلاس', db.name, 'text', 'required')}${field('grade', 'پایه', db.grade)}${field('school', 'نام مدرسه', m.school)}${field('teacher', 'نام معلم', m.teacher)}${field('year', 'سال تحصیلی', m.year)}${field('pass', 'حد نمره قبولی (از ۲۰)', m.pass, 'number', 'min=0 max=20 step=0.25')}${behStepFields(db)}</div><div style="margin-top:14px"><button class="btn">ذخیره مشخصات</button></div></form>
  <div class="card"><h3>راهنمای سریع</h3><div class="list sub" style="font-size:14px"><div>۱. در «درس‌ها» دروس و ضریب را تعریف کنید.</div><div>۲. در «دانش‌آموزان» لیست را ایمپورت یا ثبت کنید.</div><div>۳. در «حضور و غیاب» وضعیت هر روز را با یک کلیک بزنید.</div><div>۴. در «رفتار» برای هر دانش‌آموز کارت زرد/قرمز یا سبز ثبت کنید.</div><div>۵. در «تکالیف» تکلیف تعریف کنید و انجام/عدم انجام یا نمره را ثبت کنید.</div><div>۶. در «آزمون‌ها» نمرات را وارد کنید.</div><div>۷. داشبورد و پروفایل‌ها خودکار ساخته می‌شوند.</div></div></div></div>`);
  $('#metaForm').onsubmit = e => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); db.name = d.name; db.grade = d.grade; readStep(d, db); R.meta = { school: d.school, teacher: d.teacher, year: d.year, pass: +d.pass }; save(); render(true); toast('مشخصات ذخیره شد'); };
};

VIEWS.dash = function () {
  const r = ranking(), best = r[0], ca = classAvg();
  const totalAtt = db.students.map(s => attCount(s.id).pct).filter(v => v != null);
  const risky = r.filter(x => x.avg < pass()).length;
  const stat = (ic, bg, l, v) => `<div class="card stat"><div class="bub" style="background:${bg}">${ic}</div><div><small>${l}</small><b>${v}</b></div></div>`;
  const dates = Object.keys(db.att).sort().slice(-14);
  const bs = db.students.map(s => ({ s, c: behCount(s.id) }));
  const bt = { r: 0, y: 0, g: 0, G: 0, w: 0 }; db.beh.forEach(b => { if (bt[b.t] != null) bt[b.t]++; });
  const rowsB = (arr, f) => arr.map(x => `<div class="li"><span class="row">${avatar(x.s)} ${esc(x.s.name)}</span>${f(x)}</div>`).join('') || '<div class="empty">بدون داده</div>';
  V(head('داشبورد کلاس', `${esc(R.meta.school)} · ${esc(db.name)}`) + emptyHint() + `
  <div class="grid g4">${stat(ico('users'), '#e1f3f5', 'تعداد دانش‌آموزان', fa(db.students.length, 0))}${stat('🎯', '#fff0d1', 'میانگین کل کلاس', fa(ca))}${stat('📝', '#e8e6fb', 'تعداد آزمون‌ها', fa(db.exams.length, 0))}${stat('✅', '#dff4ea', 'میانگین حضور', fa(mean(totalAtt), 1) + '٪')}</div>
  <div class="grid g21" style="margin-top:16px"><div class="card"><h3>میانگین دروس</h3><div class="chart"><canvas id="c1"></canvas></div></div>
  <div class="grid"><div class="card best">${best ? avatar(best.s, 'xl') : '🏆'}<div><div class="sub">🏆 دانش‌آموز برتر کلاس</div><h3 style="margin:2px 0">${best ? esc(best.s.name) : 'هنوز نمره‌ای ثبت نشده'}</h3>${best ? `<b style="font-size:24px">${fa(best.avg)}</b> <span class="sub">میانگین</span>` : ''}</div></div>
  <div class="card"><h3>توزیع میانگین‌ها</h3><div class="chart" style="height:190px"><canvas id="c2"></canvas></div></div></div></div>
  <div class="grid g3" style="margin-top:16px">
  <div class="card"><h3>۵ دانش‌آموز برتر</h3><div class="list">${rowsB(r.slice(0, 5), x => pill(x.avg))}</div></div>
  <div class="card"><h3>نیازمند توجه ${risky ? `<span class="pill bad">${fa(risky, 0)} نفر زیر ${fa(pass())}</span>` : ''}</h3><div class="list">${rowsB([...r].reverse().slice(0, 5), x => pill(x.avg))}</div></div>
  <div class="card"><h3>بیشترین غیبت</h3><div class="list">${rowsB(db.students.map(s => ({ s, c: attCount(s.id) })).sort((a, b) => b.c.a - a.c.a).slice(0, 5), x => `<span class="pill ${x.c.a > 3 ? 'bad' : x.c.a ? 'warn' : 'ok'}">${fa(x.c.a, 0)} روز</span>`)}</div></div></div>
  <div class="grid g3" style="margin-top:16px">
  <div class="card"><h3>🟢 بیشترین رفتار مثبت</h3><div class="list">${rowsB(bs.filter(x => x.c.score > 0).sort((a, b) => b.c.score - a.c.score).slice(0, 5), x => `<span class="pill ok">${sgn(x.c.score)}</span>`)}</div></div>
  <div class="card"><h3>🔴 بیشترین رفتار منفی</h3><div class="list">${rowsB(bs.filter(x => x.c.score < 0).sort((a, b) => a.c.score - b.c.score).slice(0, 5), x => `<span class="pill bad">${sgn(x.c.score)}</span>`)}</div></div>
  <div class="card"><h3>مجموع رفتارهای ثبت‌شده</h3><div class="chart" style="height:200px"><canvas id="c4"></canvas></div></div></div>
  <div class="grid g2" style="margin-top:16px">
  <div class="card"><h3>📌 بیشترین تکلیف انجام‌نشده ${db.tasks.length ? `<span class="sub">(از ${fa(db.tasks.length, 0)} تکلیف)</span>` : ''}</h3><div class="list">${rowsB(db.students.map(s => ({ s, c: taskCount(s.id) })).filter(x => x.c.n > 0).sort((a, b) => b.c.n - a.c.n).slice(0, 5), x => `<span class="pill bad">${fa(x.c.n, 0)} تکلیف</span>`)}</div></div>
  <div class="card"><h3>📌 آخرین تکالیف</h3><div class="list">${[...db.tasks].sort((a, b) => a.date < b.date ? 1 : -1).slice(0, 5).map(t => { const y = db.students.filter(s => t.res[s.id]?.st === 'y').length, n = db.students.filter(s => t.res[s.id]?.st === 'n').length; return `<div class="li"><span>${esc(t.title)} <small class="sub">${jd(t.date)}</small></span><span class="pill ${n ? 'warn' : 'ok'}">${fa(y, 0)} انجام · ${fa(n, 0)} ناانجام</span></div>`; }).join('') || '<div class="empty">هنوز تکلیفی تعریف نشده</div>'}</div></div></div>
  <div class="card" style="margin-top:16px"><h3>تعداد غایبان در روزهای اخیر</h3><div class="chart" style="height:220px"><canvas id="c3"></canvas></div></div>`);
  mkChart('c1', { type: 'bar', data: { labels: db.courses.map(c => c.name), datasets: [{ data: db.courses.map(c => +(courseStats(c.id).avg ?? 0).toFixed(2)), backgroundColor: db.courses.map((c, i) => COLORS[i % 9]), borderRadius: 8 }] }, options: { scales: { y: { min: 0, max: 20, ticks: tickFa } } } });
  const bins = [0, 0, 0, 0, 0, 0]; r.forEach(x => bins[x.avg < 10 ? 0 : Math.min(5, Math.floor((x.avg - 8) / 2))]++);
  mkChart('c2', { type: 'doughnut', data: { labels: ['زیر ۱۰', '۱۰ تا ۱۲', '۱۲ تا ۱۴', '۱۴ تا ۱۶', '۱۶ تا ۱۸', '۱۸ تا ۲۰'], datasets: [{ data: bins, backgroundColor: ['#d64545', '#e0702d', '#f2a516', '#8ccf7e', '#1f9d63', '#0f7c8a'] }] }, options: { cutout: '58%', plugins: { legend: { display: true, position: 'left', labels: { boxWidth: 10 } } } } });
  mkChart('c3', { type: 'line', data: { labels: dates.map(jday), datasets: [{ data: dates.map(d => Object.values(db.att[d]).filter(x => x === 'a').length), borderColor: '#d64545', backgroundColor: '#d6454522', fill: true, tension: .3 }] }, options: { scales: { y: { beginAtZero: true, ticks: { ...tickFa, precision: 0 } } } } });
  mkChart('c4', { type: 'bar', data: { labels: ['قرمز', 'زرد', 'سبز کمرنگ', 'سبز پررنگ', 'یادداشت'], datasets: [{ data: [bt.r, bt.y, bt.g, bt.G, bt.w], backgroundColor: [BEH.r.c, BEH.y.c, BEH.g.c, BEH.G.c, '#b5bcc0'], borderRadius: 6 }] }, options: { scales: { y: { beginAtZero: true, ticks: { ...tickFa, precision: 0 } } } } });
};

VIEWS.courses = function () {
  V(head('درس‌ها', 'تعریف دروس، ضریب و آمار نمرات', '<button class="btn" data-act="addCourse">+ درس جدید</button>') + `
  <div class="grid g2"><div class="card"><div class="tw"><table><tr><th>درس</th><th class="num">ضریب</th><th class="num">میانگین</th><th class="num">کمترین</th><th class="num">بیشترین</th><th></th></tr>
  ${db.courses.map(c => { const s = courseStats(c.id); return `<tr><td><b>${esc(c.name)}</b></td><td class="num">${fa(c.coef)}</td><td class="num">${pill(s.avg)}</td><td class="num">${fa(s.min)}</td><td class="num">${fa(s.max)}</td><td class="num" style="white-space:nowrap"><button class="btn sec sm" data-act="editCourse" data-id="${c.id}">ویرایش</button> <button class="btn bad sm" data-act="delCourse" data-id="${c.id}">حذف</button></td></tr>`; }).join('') || '<tr><td colspan=6 class="empty">هنوز درسی تعریف نشده است. با «درس جدید» شروع کنید.</td></tr>'}</table></div></div>
  <div class="card"><h3>مقایسه میانگین، کمترین و بیشترین</h3><div class="chart"><canvas id="c1"></canvas></div></div></div>`);
  const st = db.courses.map(c => courseStats(c.id));
  mkChart('c1', { type: 'bar', data: { labels: db.courses.map(c => c.name), datasets: [{ label: 'کمترین', data: st.map(s => s.min), backgroundColor: '#d64545', borderRadius: 5 }, { label: 'میانگین', data: st.map(s => s.avg), backgroundColor: '#0f7c8a', borderRadius: 5 }, { label: 'بیشترین', data: st.map(s => s.max), backgroundColor: '#1f9d63', borderRadius: 5 }] }, options: { plugins: { legend: { display: true } }, scales: { y: { min: 0, max: 20, ticks: tickFa } } } });
};
const courseForm = (c = {}) => field('name', 'نام درس', c.name, 'text', 'required') + field('coef', 'ضریب', c.coef ?? 2, 'number', 'min=1 max=10 step=0.5 required');

VIEWS.students = function () {
  const q = S.q.trim(); const list = db.students.filter(s => !q || (s.name + s.nid + s.father).includes(q));
  V(head('دانش‌آموزان ' + esc(db.name), `${fa(db.students.length, 0)} دانش‌آموز ثبت شده`, `<input id="q" placeholder="جستجوی نام یا کد ملی…" value="${esc(S.q)}"><button class="btn sec" data-act="importStudents">📥 ایمپورت اکسل / متن</button><button class="btn" data-act="addStudent">+ دانش‌آموز جدید</button>`) + emptyHint() + `
  <div class="card"><div class="tw wide" style="max-height:none"><table><tr><th>#</th><th>دانش‌آموز</th><th>کد ملی</th><th>تلفن</th><th class="num">میانگین</th><th class="num">غیبت</th><th class="num">رفتار</th><th class="num">تکالیف</th><th></th></tr>
  ${list.map((s, i) => { const c = attCount(s.id); return `<tr><td>${fa(i + 1, 0)}</td><td><span class="row">${avatar(s)} <b>${esc(s.name)}</b></span></td><td>${esc(s.nid) || '—'}</td><td>${esc(s.phone)}</td><td class="num">${pill(stuAvg(s.id))}</td><td class="num">${fa(c.a, 0)}</td><td class="num">${behBadge(behCount(s.id))}</td><td class="num">${(() => { const t = taskCount(s.id); return t.y + t.n ? fa(t.y, 0) + ' از ' + fa(t.y + t.n, 0) : '—'; })()}</td><td class="num" style="white-space:nowrap"><button class="btn sm" data-act="open" data-id="${s.id}">پروفایل</button> <button class="btn sec sm" data-act="editStudent" data-id="${s.id}">ویرایش</button> <button class="btn bad sm" data-act="delStudent" data-id="${s.id}">حذف</button><div class="qa">${[['tasks', 'تکلیف', 'qtk'], ['beh', 'رفتار', 'qbh'], ['exams', 'آزمون', 'qex'], ['acts', 'فعالیت', 'qac']].map(([v, t, c]) => `<button type="button" class="qb ${c}" data-act="goto" data-v="${v}" data-id="${s.id}" title="${t} ${esc(s.name)}">${t}</button>`).join('')}<button type="button" class="qb qsm" data-act="summary" data-id="${s.id}" title="برآیند کلی ${esc(s.name)} (قابل نمایش روی صفحه دوم)">برآیند</button></div></td></tr>`; }).join('') || '<tr><td colspan=9 class="empty">دانش‌آموزی پیدا نشد.</td></tr>'}</table></div></div>`);
  const q$ = $('#q'); q$.oninput = () => { S.q = q$.value; const p = q$.selectionStart; render(true); const n = $('#q'); n.focus(); n.setSelectionRange(p, p); };
};
const studentForm = (s = {}) => `<div class="fg">${field('name', 'نام و نام خانوادگی', s.name, 'text', 'required')}${field('father', 'نام پدر', s.father)}${field('nid', 'کد ملی', s.nid, 'text', 'inputmode=numeric')}${field('birth', 'تاریخ تولد (مثلاً ۱۳۹۰/۵/۱۲)', s.birth)}${field('phone', 'تلفن ولی', s.phone, 'tel')}${field('address', 'نشانی', s.address)}</div><label class="f">عکس دانش‌آموز<input type="file" name="_photo" accept="image/*"></label>`;
function readPhoto(file) {
  return new Promise(res => { if (!file || !file.size) return res(null); const fr = new FileReader(); fr.onload = () => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'), z = 200, k = Math.max(z / im.width, z / im.height); c.width = c.height = z; c.getContext('2d').drawImage(im, (z - im.width * k) / 2, (z - im.height * k) / 2, im.width * k, im.height * k); res(c.toDataURL('image/jpeg', .8)); }; im.src = fr.result; }; fr.readAsDataURL(file); });
}

VIEWS.profile = function () {
  if (!db.students.length) return V(head('پروفایل', '') + '<div class="card empty">ابتدا یک دانش‌آموز ثبت کنید.</div>');
  if (!stuOf(S.st)) S.st = db.students[0].id;
  const s = stuOf(S.st), idx = db.students.indexOf(s), r = ranking(), rank = r.findIndex(x => x.s.id === s.id) + 1, a = attCount(s.id), avg = stuAvg(s.id), bc = behCount(s.id, db, '', '', S.pbc);
  const exs = db.exams.filter(e => e.scores[s.id] != null).sort((x, y) => x.date < y.date ? -1 : 1);
  const months = {}; Object.keys(db.att).sort().forEach(d => { const m = jmon(d); months[m] ??= { a: 0, l: 0, e: 0, t: 0 }; const v = db.att[d][s.id]; if (v) { months[m].t++; if (v !== 'p') months[m][v]++; } });
  const recs = db.beh.filter(b => b.sid === s.id && (!S.pbc || b.cid === S.pbc) && (!S.pbt || b.t === S.pbt)).sort((x, y) => x.date < y.date ? 1 : -1);
  const info = (l, v) => `<div><div class="sub">${l}</div><b>${esc(v || '—')}</b></div>`;
  const box = t => `<div class="bxc ${S.pbt === t ? 'sel' : ''}" data-act="pbt" data-k="${t}" role="button" tabindex="0" title="نمایش و ویرایش موارد «${BEH[t].t}»" style="${chipStyle(t)}"><b>${fa(bc[t], 0)}</b><small>${BEH[t].t}</small></div>`;
  V(head('پروفایل دانش‌آموز', 'گزارش خودکار عملکرد تحصیلی، حضور و رفتار', `<button class="btn sec sm" data-act="prev">${ico('right')} قبلی</button><select id="stSel">${db.students.map(x => `<option value="${x.id}" ${x.id === s.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select><button class="btn sec sm" data-act="next">بعدی ${ico('left')}</button><button class="btn sec" data-act="summary" data-id="${s.id}">📊 برآیند کلی</button><button class="btn" data-act="print">${ico('print')} چاپ</button>`) + `
  <div class="card row" style="gap:22px;align-items:center">${avatar(s, 'xl')}<div style="flex:1;min-width:240px"><h2 style="margin:0 0 8px">${esc(s.name)}</h2><div class="fg" style="grid-template-columns:repeat(3,1fr)">${info('نام پدر', s.father)}${info('کد ملی', s.nid)}${info('تاریخ تولد', s.birth)}${info('تلفن ولی', s.phone)}${info('نشانی', s.address)}${info('کلاس', db.name)}</div><div class="noprint" style="margin-top:10px;display:flex">${qaBtns(s)}</div></div></div>
  <div class="grid g4" style="margin-top:16px">
  <div class="card stat"><div class="bub" style="background:#fff0d1;color:#b7791f">${ico('target')}</div><div><small>میانگین</small><b>${fa(avg)}</b></div></div>
  <div class="card stat"><div class="bub" style="background:#e1f3f5;color:#0f7c8a">${ico('award')}</div><div><small>رتبه در کلاس</small><b>${rank ? fa(rank, 0) + ' از ' + fa(db.students.length, 0) : '—'}</b></div></div>
  <div class="card stat"><div class="bub" style="background:#fde6e6;color:#d64545">${ico('ban')}</div><div><small>روز غایب / تأخیر</small><b>${fa(a.a, 0)} / ${fa(a.l, 0)}</b></div></div>
  <div class="card stat"><div class="bub" style="background:#dff4ea;color:#1f9d63">${ico('check')}</div><div><small>درصد حضور</small><b>${fa(a.pct, 0)}٪</b></div></div></div>
  <div class="card" style="margin-top:16px"><div class="top" style="margin-bottom:10px"><div><h3 style="margin:0">${ico('beh')} رفتار و انضباط در طول سال</h3><div class="sub">امتیاز رفتاری: <b style="color:${bc.score < 0 ? 'var(--bad)' : 'var(--ok)'}">${sgn(bc.score)}</b> · ${fa(bc.pos, 0)} مثبت، ${fa(bc.neg, 0)} منفی و ${fa(bc.w, 0)} یادداشت</div></div><div class="row noprint"><select id="pbc" title="درس">${'<option value="">همه دروس (تجمیع)</option>'}${db.courses.map(k => `<option value="${k.id}" ${S.pbc === k.id ? 'selected' : ''}>${esc(k.name)}</option>`).join('')}</select><button class="btn sm" data-act="behNote" data-id="${s.id}">+ ثبت رفتار</button></div></div>
  <div class="bx">${box('r')}${box('y')}${box('g')}${box('G')}${box('w')}</div>
  <div class="row" style="margin-top:10px">${S.pbt ? `<span class="pill" style="${chipStyle(S.pbt)}">فقط «${BEH[S.pbt].t}» (${fa(recs.length, 0)} مورد)</span><button class="btn sec sm noprint" data-act="pbt" data-k="${S.pbt}">نمایش همه</button>` : '<span class="sub noprint">برای دیدن و ویرایش موارد هر رنگ، روی کادر رنگی بزنید.</span>'}</div>
  <div class="tw" style="margin-top:12px;max-height:300px"><table><tr><th>تاریخ</th><th>درس</th><th>نوع</th><th>توضیح</th><th></th></tr>${recs.map(b => `<tr><td>${jd(b.date)}</td><td>${esc(courseOf(b.cid)?.name) || '—'}</td><td>${behPill(b.t)}</td><td>${esc(b.note) || '—'}</td><td class="num noprint" style="white-space:nowrap"><button class="btn sec sm" data-act="editBeh" data-id="${b.id}">ویرایش</button> <button class="btn bad sm" data-act="delBeh" data-id="${b.id}">حذف</button></td></tr>`).join('') || '<tr><td colspan=5 class="empty">هنوز رفتاری ثبت نشده است.</td></tr>'}</table></div></div>
  ${profileTasks(s)}${profileActs(s)}
  <div class="card" style="margin-top:16px"><h3>📈 روند کلی آموزشی (ماهانه)</h3><div class="sub" style="margin:0 0 8px">خط‌ها: میانگین نمره آزمون (از ۲۰ به درصد)، درصد تکالیف انجام‌شده و درصد حضور · ستون‌ها: امتیاز خالص رفتار هر ماه (مثبت − منفی)</div><div class="chart" style="height:340px"><canvas id="c3"></canvas></div></div>
  <div class="grid g2" style="margin-top:16px"><div class="card"><h3>میانگین دروس در مقابل کلاس</h3><div class="chart"><canvas id="c1"></canvas></div></div>
  <div class="card"><h3>روند نمرات آزمون‌ها</h3><div class="chart"><canvas id="c2"></canvas></div></div></div>
  <div class="grid g2" style="margin-top:16px"><div class="card"><h3>غیبت‌های ماهانه</h3><div class="tw"><table><tr><th>ماه</th><th class="num">غایب</th><th class="num">تأخیر</th><th class="num">مجاز</th><th class="num">ثبت</th></tr>${Object.entries(months).map(([m, v]) => `<tr><td>${m}</td><td class="num">${fa(v.a, 0)}</td><td class="num">${fa(v.l, 0)}</td><td class="num">${fa(v.e, 0)}</td><td class="num">${fa(v.t, 0)}</td></tr>`).join('') || '<tr><td colspan=5 class="empty">ثبت نشده</td></tr>'}</table></div></div>
  <div class="card"><h3>نمره‌های ثبت‌شده</h3><div class="tw"><table><tr><th>تاریخ</th><th>درس</th><th>آزمون</th><th class="num">نمره از ۲۰</th></tr>${[...exs].reverse().map(e => `<tr><td>${jd(e.date)}</td><td>${esc(courseOf(e.courseId)?.name)}</td><td>${esc(e.title)}</td><td class="num">${pill(norm(e, s.id))}</td></tr>`).join('') || '<tr><td colspan=4 class="empty">ثبت نشده</td></tr>'}</table></div></div></div>`);
  $('#stSel').onchange = e => { S.st = e.target.value; S.pbt = ''; render(); };
  $('#pbc').onchange = e => { S.pbc = e.target.value; render(true); };
  S._n = [db.students[(idx - 1 + db.students.length) % db.students.length].id, db.students[(idx + 1) % db.students.length].id];
  mkChart('c1', { type: 'bar', data: { labels: db.courses.map(c => c.name), datasets: [{ label: s.name, data: db.courses.map(c => stuCourseAvg(s.id, c.id)), backgroundColor: '#0f7c8a', borderRadius: 6 }, { label: 'میانگین کلاس', data: db.courses.map(c => courseStats(c.id).avg), backgroundColor: '#c9d6d9', borderRadius: 6 }] }, options: { plugins: { legend: { display: true } }, scales: { y: { min: 0, max: 20, ticks: tickFa } } } });
  trendChart(s);
  mkChart('c2', { type: 'line', data: { labels: exs.map(e => jday(e.date)), datasets: [{ data: exs.map(e => norm(e, s.id)), borderColor: '#f2a516', backgroundColor: '#f2a516', tension: .25, pointRadius: 4 }] }, options: { scales: { y: { min: 0, max: 20, ticks: tickFa }, x: { ticks: { maxTicksLimit: 8 } } } } });
};

function trendChart(s) {
  const mk = d => { const j = isoJ(d); return j.jy * 100 + j.jm; }, B = {};
  const at = d => B[mk(d)] ??= { ex: [], cx: [], ty: 0, tn: 0, ap: 0, at: 0, bs: 0, bn: 0 };
  db.exams.forEach(e => { if (!e.date) return; const b = at(e.date); const v = norm(e, s.id); if (v != null) b.ex.push(v / 20 * 100); const all = db.students.map(x => norm(e, x.id)).filter(x => x != null); if (all.length) b.cx.push(mean(all) / 20 * 100); });
  db.tasks.forEach(t => { if (!t.date) return; const r = t.res[s.id]; if (r && r.st) { const b = at(t.date); if (r.st === 'y') b.ty++; else b.tn++; } });
  Object.keys(db.att).forEach(d => { const v = db.att[d] && db.att[d][s.id]; if (v) { const b = at(d); b.at++; if (v !== 'a') b.ap++; } });
  db.beh.forEach(x => { if (x.sid === s.id && x.date && BEH[x.t]) { const b = at(x.date); b.bs += bp(x.t); b.bn++; } });
  const keys = Object.keys(B).map(Number).sort((a, b) => a - b); if (!keys.length) return;
  const mx = Math.max(4, ...keys.map(k => Math.abs(B[k].bs))) * 1.2;
  const lab = keys.map(k => JM[k % 100 - 1] + ' ' + fnum(Math.floor(k / 100))), g = k => B[k], avg = a => a.length ? +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : null;
  const line = (label, data, color, extra = {}) => Object.assign({ type: 'line', label, data, borderColor: color, backgroundColor: color, tension: .25, pointRadius: 4, spanGaps: true, yAxisID: 'y' }, extra);
  mkChart('c3', { data: { labels: lab, datasets: [
    { type: 'bar', label: 'امتیاز خالص رفتار', data: keys.map(k => g(k).bn ? +g(k).bs.toFixed(2) : null), backgroundColor: keys.map(k => g(k).bs < 0 ? '#d6454588' : '#1f9d6388'), borderRadius: 5, yAxisID: 'y2', order: 5, maxBarThickness: 34 },
    line('میانگین نمره آزمون (٪)', keys.map(k => avg(g(k).ex)), '#f2a516'),
    line('میانگین کلاس در آزمون (٪)', keys.map(k => avg(g(k).cx)), '#9aa9ad', { borderDash: [6, 5], pointRadius: 2 }),
    line('تکالیف انجام‌شده (٪)', keys.map(k => (g(k).ty + g(k).tn) ? +(g(k).ty / (g(k).ty + g(k).tn) * 100).toFixed(1) : null), '#7048e8'),
    line('حضور (٪)', keys.map(k => g(k).at ? +(g(k).ap / g(k).at * 100).toFixed(1) : null), '#0f7c8a')
  ] }, options: { interaction: { mode: 'index', intersect: false }, plugins: { legend: { display: true, labels: { usePointStyle: true, boxWidth: 8 } } },
    scales: { y: { min: 0, max: 100, ticks: tickFa, title: { display: true, text: 'درصد' } }, y2: { position: 'right', grid: { drawOnChartArea: false }, suggestedMin: -mx, suggestedMax: mx, ticks: tickFa, title: { display: true, text: 'امتیاز رفتار' } }, x: { ticks: { maxTicksLimit: 14 } } } } });
}
VIEWS.att = function () {
  const d = S.date, rec = db.att[d] || {}, dates = Object.keys(db.att).sort();
  V(head('حضور و غیاب', `${wd(d)} ${jd(d)}`, `<button class="btn sec" data-act="attPrev" title="آخرین روز ثبت‌شده‌ی قبل از این روز">▶ روز قبل</button>${jdate('', d, 'id=dsel')}<button class="btn sec" data-act="attNext" title="اولین روز ثبت‌شده‌ی بعد از این روز">روز بعد ◀</button><button class="btn sec" data-act="allP">همه حاضر</button><button class="btn sec" data-act="restP">باقی‌مانده‌ها حاضر</button>${fqBox()}`) + kbHint('att') + `
  <div class="grid g21"><div class="card"><div class="tw" style="max-height:none"><table><tr><th>#</th><th>دانش‌آموز</th><th>وضعیت</th></tr>
  ${vis().map((s, i) => `<tr class="${S.kon && S.kr === i ? 'kr' : ''}"><td>${fa(i + 1, 0)}</td><td><span class="row">${avatar(s)} ${nl(s)}</span></td><td><div class="seg">${Object.entries(ST).map(([k, t]) => `<button class="${k} ${rec[s.id] === k ? 'on' : ''}" data-act="mark" data-id="${s.id}" data-k="${k}">${t}</button>`).join('')}</div></td></tr>`).join('') || `<tr><td colspan=3 class="empty">${S.fq ? 'دانش‌آموزی با این نام پیدا نشد.' : 'ابتدا دانش‌آموز ثبت کنید.'}</td></tr>`}</table></div></div>
  <div class="card"><h3>خلاصه حضور (${fa(dates.length, 0)} روز ثبت‌شده)</h3><div class="tw" style="max-height:480px"><table><tr><th>دانش‌آموز</th><th class="num">غ</th><th class="num">ت</th><th>حضور</th></tr>
  ${db.students.map(s => { const c = attCount(s.id); return `<tr><td>${nl(s)}</td><td class="num">${fa(c.a, 0)}</td><td class="num">${fa(c.l, 0)}</td><td><div class="bar"><i style="width:${c.pct ?? 0}%;background:${c.pct < 85 ? 'var(--bad)' : 'var(--ok)'}"></i></div><small>${fa(c.pct, 0)}٪</small></td></tr>`; }).join('')}</table></div>
  <p class="sub" style="margin:8px 0 0">غ = غایب · ت = تأخیر. فقط روزهایی را که کلاس داشتید ثبت کنید.</p></div></div>`);
  $('#dsel').onchange = e => { if (e.target.value) { S.date = e.target.value; render(true); } };
};

VIEWS.beh = function () {
  const d = S.date, bc = S.bc, inC = b => !bc || b.cid === bc, today = db.beh.filter(b => b.date === d && inC(b)), L = vis();
  const sorted = L.map(s => ({ s, c: behCount(s.id, db, S.bf, S.bt, bc) }));
  if (S.bsort === 'score') sorted.sort((a, b) => b.c.score - a.c.score); else if (S.bsort === 'neg') sorted.sort((a, b) => a.c.score - b.c.score); else sorted.sort((a, b) => a.s.name.localeCompare(b.s.name, 'fa'));
  const tot = { r: 0, y: 0, g: 0, G: 0, w: 0 }; db.beh.forEach(b => { if (tot[b.t] != null && inC(b) && (!S.bf || b.date >= S.bf) && (!S.bt || b.date <= S.bt)) tot[b.t]++; });
  V(head('رفتار و انضباط', `ثبت برای ${wd(d)} ${jd(d)}${bc ? ' · درس ' + esc(courseOf(bc)?.name) : ''}`, `${jdate('', d, 'id=dsel')}${fqBox()}`) + `
  <div class="card"><div class="row" style="margin:0 0 10px"><b style="font-size:13px">درس:</b><div class="chips"><button type="button" class="cc ${!bc ? 'on' : ''}" data-act="bcPick" data-id="">همه دروس</button>${db.courses.map(k => `<button type="button" class="cc ${bc === k.id ? 'on' : ''}" data-act="bcPick" data-id="${k.id}">${esc(k.name)}</button>`).join('')}</div></div><div class="sub" style="margin:0 0 8px">${bc ? `رفتارهایی که الان ثبت می‌کنید برای درس «${esc(courseOf(bc)?.name)}» ذخیره می‌شود و گزارش هم فقط همین درس را نشان می‌دهد.` : 'درس انتخاب نشده: رفتارهای جدید «بدون درس» ثبت می‌شوند و گزارش، جمع همه دروس را نشان می‌دهد. برای ثبت جداگانه، یک درس انتخاب کنید.'}</div><div class="legend" style="margin-bottom:6px">برای ثبت، روی دکمه رنگی کنار نام دانش‌آموز بزنید (دکمه سفید فقط برای نوشتن یادداشت است):
  ${Object.keys(BEH).map(behPill).join(' ')}</div>
  ${L.map(s => { const t = today.filter(b => b.sid === s.id); return `<div class="brow"><span class="row">${avatar(s)} <b>${nl(s)}</b>${t.map(b => `<span class="chip" style="${chipStyle(b.t)}">${BEH[b.t].t}</span>`).join('')}</span>
  <span class="bbs"><button class="bb r" data-act="beh" data-id="${s.id}" data-k="r">− قرمز</button><button class="bb y" data-act="beh" data-id="${s.id}" data-k="y">− زرد</button><button class="bb g" data-act="beh" data-id="${s.id}" data-k="g">+ سبز</button><button class="bb G" data-act="beh" data-id="${s.id}" data-k="G">++ سبز پررنگ</button><button class="bb w" title="فقط یادداشت، بدون امتیاز" data-act="behW" data-id="${s.id}">⚪ یادداشت</button><button class="bb n" title="ثبت با توضیح" data-act="behNote" data-id="${s.id}">📝</button></span></div>`; }).join('') || `<div class="empty">${S.fq ? 'دانش‌آموزی با این نام پیدا نشد.' : 'ابتدا دانش‌آموز ثبت کنید.'}</div>`}</div>
  <div class="card" style="margin-top:16px"><h3>رفتارهای ثبت‌شده در ${jd(d)} (${fa(today.length, 0)})</h3>${today.length ? `<div class="tw" style="max-height:260px"><table><tr><th>دانش‌آموز</th><th>درس</th><th>نوع</th><th>توضیح</th><th></th></tr>${today.map(b => `<tr><td>${esc(stuOf(b.sid)?.name)}</td><td>${esc(courseOf(b.cid)?.name) || '—'}</td><td>${behPill(b.t)}</td><td>${esc(b.note) || '—'}</td><td class="num" style="white-space:nowrap"><button class="btn sec sm" data-act="editBeh" data-id="${b.id}">ویرایش</button> <button class="btn bad sm" data-act="delBeh" data-id="${b.id}">حذف</button></td></tr>`).join('')}</table></div>` : '<div class="empty">در این روز چیزی ثبت نشده است.</div>'}</div>
  <div class="card" style="margin-top:16px"><div class="top" style="margin-bottom:10px"><div><h3 style="margin:0">گزارش رفتار کلاس${bc ? ' — ' + esc(courseOf(bc)?.name) : ' (تجمیع همه دروس)'}</h3><div class="sub">جمع: ${Object.keys(BEH).map(k => `${BEH[k].t} ${fa(tot[k], 0)}`).join(' · ')}</div></div>
  <div class="row noprint"><label class="f" style="display:flex;align-items:center;gap:6px">از ${jdate('', S.bf, 'id=bf data-clear=1')}</label><label class="f" style="display:flex;align-items:center;gap:6px">تا ${jdate('', S.bt, 'id=bt data-clear=1')}</label>
  <select id="bsort"><option value="score" ${S.bsort === 'score' ? 'selected' : ''}>بیشترین امتیاز</option><option value="neg" ${S.bsort === 'neg' ? 'selected' : ''}>بیشترین منفی</option><option value="name" ${S.bsort === 'name' ? 'selected' : ''}>بر اساس نام</option></select></div></div>
  <div class="tw wide" style="max-height:none"><table><tr><th>#</th><th>دانش‌آموز</th><th class="num">قرمز</th><th class="num">زرد</th><th class="num">سبز کمرنگ</th><th class="num">سبز پررنگ</th><th class="num">یادداشت</th><th class="num">منفی</th><th class="num">مثبت</th><th class="num">امتیاز</th></tr>
  ${sorted.map((x, i) => `<tr><td>${fa(i + 1, 0)}</td><td><a href="#" data-act="open" data-id="${x.s.id}" style="color:var(--brand);text-decoration:none;font-weight:700">${esc(x.s.name)}</a></td>${['r', 'y', 'g', 'G', 'w'].map(k => `<td class="num">${x.c[k] ? `<a href="#" class="blk" data-act="behOpen" data-id="${x.s.id}" data-k="${k}">${fa(x.c[k], 0)}</a>` : fa(0, 0)}</td>`).join('')}<td class="num">${fa(x.c.neg, 0)}</td><td class="num">${fa(x.c.pos, 0)}</td><td class="num"><span class="pill ${x.c.score < 0 ? 'bad' : x.c.score > 0 ? 'ok' : 'warn'}">${sgn(x.c.score)}</span></td></tr>`).join('')}</table></div>
  <p class="sub" style="margin:8px 0 0">امتیازها (مبنای این کلاس): ${['r', 'y', 'g', 'G'].map(k => BEH[k].t + ' ' + pt(k)).join(' · ')} · سفید (یادداشت): بدون امتیاز، فقط توضیح — مبنا را در «مشخصات کلاس» می‌توانید عوض کنید.</p></div>${bc || !db.courses.length ? '' : behByCourse(L)}`);
  $('#dsel').onchange = e => { if (e.target.value) { S.date = e.target.value; render(true); } };
  $('#bf').onchange = e => { S.bf = e.target.value; render(true); }; $('#bt').onchange = e => { S.bt = e.target.value; render(true); };
  $('#bsort').onchange = e => { S.bsort = e.target.value; render(true); };
};

function behByCourse(L) {
  const cs = db.courses.filter(k => db.beh.some(b => b.cid === k.id)), gen = db.beh.some(b => !b.cid && BEH[b.t]);
  if (!cs.length) return '';
  const sc = (sid, cid) => behCount(sid, db, '', '', cid).score, cell = v => `<td class="num"><span class="pill ${v < 0 ? 'bad' : v > 0 ? 'ok' : 'warn'}">${sgn(v)}</span></td>`;
  return `<div class="card" style="margin-top:16px"><h3>امتیاز رفتاری به تفکیک درس</h3><div class="tw wide" style="max-height:none"><table><tr><th>دانش‌آموز</th>${cs.map(k => `<th class="num">${esc(k.name)}</th>`).join('')}${gen ? '<th class="num">بدون درس</th>' : ''}<th class="num">جمع</th></tr>
  ${L.map(s => { let tot = 0; const cells = cs.map(k => { const v = sc(s.id, k.id); tot += v; return cell(v); }).join(''); let g = 0; if (gen) { g = db.beh.filter(b => b.sid === s.id && !b.cid).reduce((a, b) => a + bp(b.t), 0); tot += g; } return `<tr><td>${esc(s.name)}</td>${cells}${gen ? cell(g) : ''}${cell(tot)}</tr>`; }).join('')}</table></div></div>`;
}
VIEWS.exams = function () {
  if (S.exCourse && !courseOf(S.exCourse)) S.exCourse = '';
  const list = db.exams.filter(e => !S.exCourse || e.courseId === S.exCourse).sort((a, b) => a.date < b.date ? 1 : -1);
  if (!db.exams.find(e => e.id === S.ex)) S.ex = list[0]?.id;
  const e = db.exams.find(x => x.id === S.ex);
  let detail = '<div class="card empty">آزمونی انتخاب نشده است. یک آزمون جدید بسازید.</div>';
  if (e) {
    const v = db.students.map(s => norm(e, s.id)).filter(x => x != null);
    detail = `<div class="card"><div class="top" style="margin-bottom:10px"><div><h3 style="margin:0">${esc(e.title)} — ${esc(courseOf(e.courseId)?.name)}</h3><div class="sub">${jd(e.date)} · نمره کل ${fa(e.max)}</div></div><div class="row"><button class="btn sec sm" data-act="editExam" data-id="${e.id}">ویرایش</button><button class="btn bad sm" data-act="delExam" data-id="${e.id}">حذف</button></div></div>
    <div class="row" style="margin-bottom:12px"><span class="pill ok">میانگین ${fa(mean(v))}</span><span class="pill warn">کمترین ${fa(v.length ? Math.min(...v) : null)}</span><span class="pill ok">بیشترین ${fa(v.length ? Math.max(...v) : null)}</span><span class="pill bad">مردود ${fa(v.filter(x => x < pass()).length, 0)} نفر</span></div>
    <div class="row noprint" style="margin-bottom:8px">${fqBox()}</div><div class="kbhint noprint">⌨️ داخل کادر نمره: <kbd>↑</kbd><kbd>↓</kbd> یا <kbd>Enter</kbd> = رفتن به نمره نفر بعد/قبل (بدون تغییر عدد)</div><div class="tw"><table><tr><th>#</th><th>دانش‌آموز</th><th class="num">نمره (از ${fa(e.max)})</th><th class="num">از ۲۰</th></tr>
    ${vis().map((s, i) => `<tr><td>${fa(i + 1, 0)}</td><td><span class="row">${avatar(s)} ${nl(s)}</span></td><td class="num"><input type="number" class="sc" data-id="${s.id}" min="0" max="${e.max}" step="0.25" value="${e.scores[s.id] ?? ''}" style="width:90px"></td><td class="num" id="n${s.id}">${pill(norm(e, s.id))}</td></tr>`).join('')}</table></div></div>`;
  }
  V(head('آزمون‌ها', 'ثبت آزمون و ورود نمرات (ذخیره خودکار)', `<button class="btn sec" data-act="gradeImport">📥 ورود نمرات از اکسل</button><button class="btn" data-act="addExam">+ آزمون جدید</button>`) + coursePick('exCPick', S.exCourse) + `
  <div class="grid" style="grid-template-columns:300px 1fr"><div class="card"><h3>فهرست آزمون‌ها (${fa(list.length, 0)})</h3><div class="exl">${list.map(x => `<button class="ex ${x.id === S.ex ? 'on' : ''}" data-act="pickExam" data-id="${x.id}"><b>${esc(x.title)}</b><br><small>${esc(courseOf(x.courseId)?.name)} · ${jd(x.date)}</small></button>`).join('') || '<div class="empty">خالی</div>'}</div></div>${detail}</div>`);
  document.querySelectorAll('.sc').forEach(i => { // با هر تایپ همان لحظه ذخیره می‌شود (نه فقط هنگام خروج از کادر)
    const sid = i.dataset.id, commit = fin => {
      const ex = db && db.exams.find(x => x.id === e.id); if (!ex) return; if (i.validity && i.validity.badInput) return;
      if (i.value === '') delete ex.scores[sid]; else { ex.scores[sid] = Math.min(ex.max, Math.max(0, +i.value)); if (fin) i.value = ex.scores[sid]; }
      save(); const nn = $('#n' + sid); if (nn) nn.innerHTML = pill(norm(ex, sid)); if (fin) toast('ذخیره شد');
    };
    i.oninput = () => commit(false); i.onchange = () => commit(true);
  });
};
const examForm = (e = {}) => `<div class="fg"><label class="f">درس<select name="courseId" required>${db.courses.map(c => `<option value="${c.id}" ${c.id === e.courseId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>${field('title', 'عنوان آزمون', e.title, 'text', 'required')}${field('date', 'تاریخ', e.date || iso(new Date()), 'date', 'required')}${field('max', 'بارم کل', e.max ?? 20, 'number', 'min=1 max=100 step=0.5 required')}</div>`;

/* ================= import students ================= */
const faD = s => String(s ?? '').replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
function hKey(h) {
  h = String(h ?? '').replace(/[\s\u200c_\-ـ.:]/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک'); if (!h) return null;
  if (h.includes('کلاس') && !h.includes('خانوادگی')) return 'cls';
  if (h.includes('پدر')) return 'father';
  if (h.includes('ملی') || h.includes('شناسه') || h === 'کد') return 'nid';
  if (h.includes('تولد')) return 'birth';
  if (/تلفن|موبایل|همراه|شماره|تماس/.test(h)) return 'phone';
  if (/نشانی|آدرس|محل/.test(h)) return 'address';
  if (h.includes('خانوادگی') || h.includes('فامیل')) return /نامو|کامل/.test(h) ? 'name' : 'lname';
  if (/^(نام|اسم|نامدانشآموز|دانشآموز|نامکامل|نامونام)$/.test(h)) return 'fname';
  return null;
}
function parseRows(rows) {
  rows = rows.map(r => r.map(c => String(c ?? '').trim())).filter(r => r.some(Boolean));
  if (!rows.length) return [];
  const map = rows[0].map(hKey), hit = map.filter(Boolean).length;
  const header = hit >= 2 || (hit === 1 && rows[0].filter(Boolean).length === 1);
  if (header) rows = rows.slice(1);
  return rows.map(r => {
    const o = {};
    if (header) map.forEach((k, i) => { if (k && r[i] && !o[k]) o[k] = r[i]; });
    else {
      const rest = [];
      r.forEach(c => { const x = faD(c).replace(/[\s\u200c]/g, '');
        if (/^09\d{9}$/.test(x) && !o.phone) o.phone = x;
        else if (/^9\d{9}$/.test(x) && o.nid && !o.phone) o.phone = x;
        else if (/^\d{7,10}$/.test(x) && !o.nid) o.nid = x;
        else if (/^\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2}$/.test(x) && !o.birth) o.birth = x;
        else if (c) rest.push(c); });
      if (rest[0]) o.fname = rest[0]; if (rest[1]) o.father = rest[1]; if (rest[2]) o.address = rest.slice(2).join(' ');
    }
    let phone = faD(o.phone || '').replace(/\D/g, ''); if (phone.length === 10 && phone[0] === '9') phone = '0' + phone;
    let nid = faD(o.nid || '').replace(/\D/g, ''); if (nid.length >= 7 && nid.length < 10) nid = nid.padStart(10, '0');
    return { name: (o.name || [o.fname, o.lname].filter(Boolean).join(' ')).replace(/\s+/g, ' ').trim(), father: o.father || '', nid, birth: faD(o.birth || ''), phone, address: o.address || '', cls: (o.cls || '').trim() };
  }).filter(o => o.name);
}
function parseText(t) {
  return t.replace(/\r/g, '').split('\n').filter(l => l.trim()).map(l => { const dl = l.includes('\t') ? '\t' : [';', '؛', '،', ',', '|'].find(x => l.includes(x)); return (dl ? l.split(dl) : [l]).map(c => c.replace(/^["']|["']$/g, '')); });
}
async function readImportFile(f) {
  if (/\.(xlsx|xls|xlsm|ods)$/i.test(f.name)) {
    const wb = XLSX.read(await f.arrayBuffer(), { type: 'array' });
    return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false, defval: '' });
  }
  const buf = await f.arrayBuffer(); let t = new TextDecoder('utf-8').decode(buf);
  if (t.includes('\ufffd')) t = new TextDecoder('windows-1256').decode(buf);
  return parseText(t.replace(/^\ufeff/, ''));
}
function templateXlsx() {
  const ws = XLSX.utils.aoa_to_sheet([['نام و نام خانوادگی', 'کد ملی', 'نام پدر', 'تاریخ تولد', 'تلفن ولی', 'کلاس'], ['علی احمدی', '1270000001', 'حسین', '1390/05/12', '09121234567', 'نهم ۱'], ['سارا کریمی', '1270000002', 'مجید', '1390/08/03', '09351234567', 'نهم ۲']]);
  ws['!cols'] = [{ wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 12 }];
  const wb = XLSX.utils.book_new(); wb.Workbook = { Views: [{ RTL: true }] }; XLSX.utils.book_append_sheet(wb, ws, 'دانش‌آموزان'); xlsxOut(wb, 'student-template.xlsx');
}
function importDialog() {
  const d = $('#dlg'); let rows = [], items = [];
  const opts = R.classes.map(c => `<option value="${c.id}" ${db && db.id === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('') + `<option value="__new" ${R.classes.length ? '' : 'selected'}>➕ کلاس جدید…</option>`;
  d.innerHTML = `<form onsubmit="return false"><h3>ایمپورت دانش‌آموزان</h3>
  <div class="sub">فایل اکسل (xlsx/xls) یا CSV/TXT انتخاب کنید، یا لیست را در کادر بچسبانید. فقط نام و کد ملی هم کافی است (مثلاً «علی احمدی، ۱۲۷۰۰۰۰۰۰۱»). اگر سطر اول عنوان ستون‌ها باشد خودکار تشخیص داده می‌شود؛ ستونی به نام «کلاس» هم بگذارید، دانش‌آموزان در همان کلاس‌ها ثبت می‌شوند.</div>
  <div class="fg"><label class="f">کلاس مقصد<select id="impC">${opts}</select></label><label class="f" id="impNW" ${R.classes.length ? 'hidden' : ''}>نام کلاس جدید<input id="impN" placeholder="مثلاً نهم ۱"></label></div>
  <div class="row"><input type="file" id="impF" accept=".xlsx,.xls,.xlsm,.ods,.csv,.txt"><button type="button" class="btn sec sm" id="impT">⬇️ دانلود فایل نمونه اکسل</button></div>
  <label class="f">یا متن را اینجا بچسبانید<textarea id="impTx" rows="4" placeholder="علی احمدی، 1270000001&#10;سارا کریمی؛ ۱۲۷۰۰۰۰۰۰۲"></textarea></label>
  <div id="impPrev"></div><div class="row"><button type="button" class="btn" id="impOk" disabled>افزودن</button><button type="button" class="btn sec" id="impX">بستن</button></div></form>`;
  const target = () => { const v = $('#impC').value; return v === '__new' ? ($('#impN').value.trim() || 'کلاس من') : R.classes.find(c => c.id === v).name; };
  const show = () => {
    $('#impNW').hidden = $('#impC').value !== '__new';
    const list = parseRows(rows), tn = target(), seen = new Set();
    items = list.map(o => { const cn = o.cls || tn, ex = R.classes.find(c => c.name === cn), key = cn + '|' + (o.nid || o.name);
      const dup = seen.has(key) || (ex && ex.students.some(s => (o.nid && s.nid === o.nid) || s.name === o.name)); seen.add(key); return { ...o, cn, dup }; });
    const ok = items.filter(x => !x.dup).length;
    $('#impPrev').innerHTML = items.length ? `<div class="sub" style="margin:6px 0">${fa(items.length, 0)} سطر خوانده شد: <b>${fa(ok, 0)}</b> جدید، ${fa(items.length - ok, 0)} تکراری (اضافه نمی‌شود)</div><div class="tw" style="max-height:220px"><table><tr><th>نام</th><th>کد ملی</th><th>کلاس</th><th></th></tr>${items.map(x => `<tr><td>${esc(x.name)}</td><td>${esc(x.nid)}</td><td>${esc(x.cn)}</td><td>${x.dup ? '<span class="pill warn">تکراری</span>' : '<span class="pill ok">جدید</span>'}</td></tr>`).join('')}</table></div>` : (rows.length ? '<div class="sub" style="color:var(--bad)">هیچ دانش‌آموزی در داده‌ها پیدا نشد. ستون نام را بررسی کنید.</div>' : '');
    $('#impOk').disabled = !ok; $('#impOk').textContent = ok ? `افزودن ${fa(ok, 0)} دانش‌آموز` : 'افزودن';
  };
  $('#impF').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { rows = await readImportFile(f); show(); } catch { $('#impPrev').innerHTML = '<div class="sub" style="color:var(--bad)">خواندن فایل ممکن نشد. آن را به‌صورت xlsx یا CSV ذخیره کنید و دوباره امتحان کنید.</div>'; } };
  $('#impTx').oninput = e => { rows = parseText(e.target.value); show(); };
  $('#impC').onchange = show; $('#impN').oninput = show;
  $('#impT').onclick = templateXlsx; $('#impX').onclick = () => d.close();
  $('#impOk').onclick = () => {
    const add = items.filter(x => !x.dup); let last = null;
    add.forEach(x => { let c = R.classes.find(k => k.name === x.cn); if (!c) { c = newClass(x.cn); R.classes.push(c); } last = c;
      c.students.push({ id: uid(), photo: '', name: x.name, father: x.father, nid: x.nid, birth: x.birth, phone: x.phone, address: x.address }); });
    save(); d.close(); if (last) { setCur(add.some(x => x.cn === (db && db.name)) && db ? db.id : last.id); S.view = 'students'; S.st = null; } render(); toast(fa(add.length, 0) + ' دانش‌آموز اضافه شد');
  };
  d.showModal();
}

/* ---- grade import (bulk scores) ---- */
function gradeImportDialog() {
  if (!db.courses.length) return toast('ابتدا یک درس تعریف کنید');
  const d = $('#dlg'); let rows = [], res = [];
  d.innerHTML = `<form onsubmit="return false"><h3>ورود دسته‌جمعی نمرات</h3><div class="sub">یک آزمون جدید ساخته می‌شود. فایل اکسل/CSV یا متنی با دو ستون «نام (یا کد ملی)، نمره» را انتخاب یا بچسبانید.</div>
  <div class="fg"><label class="f">درس<select id="gC">${db.courses.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></label>${field('gT', 'عنوان آزمون', '', 'text', 'id=gT')}${field('gD', 'تاریخ', iso(new Date()), 'date', 'id=gD')}${field('gM', 'بارم کل', 20, 'number', 'id=gM min=1')}</div>
  <input type="file" id="gF" accept=".xlsx,.xls,.csv,.txt"><label class="f">یا بچسبانید<textarea id="gTx" rows="4" placeholder="علی احمدی، 17.5"></textarea></label><div id="gPrev"></div>
  <div class="row"><button type="button" class="btn" id="gOk" disabled>ثبت آزمون و نمرات</button><button type="button" class="btn sec" id="gX">بستن</button></div></form>`;
  const show = () => {
    const body = rows.map(r => r.map(c => String(c ?? '').trim())).filter(r => r.some(Boolean));
    res = body.map(r => { const sc = [...r].reverse().map(c => faD(c).replace('٫', '.').replace(',', '.')).find(c => /^\d+(\.\d+)?$/.test(c) && !/^\d{7,}$/.test(c)); if (sc == null) return null;
      const keyc = r.map(c => faD(c).replace(/\D/g, '')).find(c => c.length >= 7), nm = r.find(c => /[^\d\s.,٫]/.test(c));
      const s = db.students.find(x => (keyc && x.nid && (x.nid === keyc || x.nid.replace(/^0+/, '') === keyc.replace(/^0+/, ''))) || (nm && x.name === nm.replace(/\s+/g, ' ').trim())); return { s, sc: +sc, label: nm || keyc }; }).filter(Boolean);
    const ok = res.filter(x => x.s).length;
    $('#gPrev').innerHTML = res.length ? `<div class="sub" style="margin:6px 0"><b>${fa(ok, 0)}</b> دانش‌آموز شناسایی شد${res.length - ok ? `، ${fa(res.length - ok, 0)} سطر بدون تطابق (نادیده گرفته می‌شود)` : ''}</div>` : '';
    $('#gOk').disabled = !ok;
  };
  $('#gF').onchange = async e => { const f = e.target.files[0]; if (f) { try { rows = await readImportFile(f); show(); } catch { } } };
  $('#gTx').oninput = e => { rows = parseText(e.target.value); show(); };
  $('#gX').onclick = () => d.close();
  $('#gOk').onclick = () => { const mx = +$('#gM').value || 20, scores = {}; res.filter(x => x.s).forEach(x => scores[x.s.id] = Math.min(mx, x.sc));
    const e = { id: uid(), courseId: $('#gC').value, title: $('#gT').value.trim() || 'آزمون', date: $('#gD').value || iso(new Date()), max: mx, scores }; db.exams.push(e); S.ex = e.id; if (S.exCourse && S.exCourse !== e.courseId) S.exCourse = e.courseId; save(); d.close(); render(); toast('نمرات ثبت شد'); };
  d.showModal();
}

/* ================= excel export ================= */
function sheetOf(aoa) { const ws = XLSX.utils.aoa_to_sheet(aoa), w = []; aoa.forEach(r => r.forEach((v, i) => { w[i] = Math.max(w[i] || 8, Math.min(40, String(v ?? '').length + 2)); })); ws['!cols'] = w.map(x => ({ wch: x })); return ws; }
/* ================= actions ================= */
const BSTEPS = [[1, 'پله‌های یک‌نمره‌ای (قرمز −۲ · زرد −۱ · سبز +۱ · سبز پررنگ +۲)'], [0.5, 'پله‌های نیم‌نمره‌ای (قرمز −۱ · زرد −۰٫۵ · سبز +۰٫۵ · سبز پررنگ +۱)'], [0.25, 'پله‌های ۲۵ صدمی (قرمز −۰٫۵ · زرد −۰٫۲۵ · سبز +۰٫۲۵ · سبز پررنگ +۰٫۵)'], ['custom', 'دلخواه (مقدارها را خودم می‌نویسم)']];
const behStepFields = (c = {}) => { const cur = c.bstep ?? 1; return `<label class="f" style="grid-column:1/-1">مبنای نمره رفتار (پله‌های قرمز، زرد و سبز)<select name="bstep" onchange="this.closest('form').querySelector('.bcus').hidden=this.value!=='custom'">${BSTEPS.map(([v, t]) => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>${t}</option>`).join('')}</select></label><div class="bcus fg" style="grid-column:1/-1" ${cur === 'custom' ? '' : 'hidden'}>${[['r', 'قرمز'], ['y', 'زرد'], ['g', 'سبز کمرنگ'], ['G', 'سبز پررنگ']].map(([k, t]) => field('bp_' + k, 'امتیاز ' + t, bp(k, c.id ? c : null), 'number', 'step=0.05')).join('')}</div><div class="sub" style="grid-column:1/-1">با عوض‌کردن مبنا، امتیاز همه رفتارهای قبلی این کلاس هم با مبنای جدید محاسبه می‌شود.</div>`; };
function readStep(d, c) {
  if (d.bstep === 'custom') { c.bstep = 'custom'; const v = k => { const n = parseFloat(d['bp_' + k]); return isNaN(n) ? BEHD[k] : n; }; c.bpts = { r: -Math.abs(v('r')), y: -Math.abs(v('y')), g: Math.abs(v('g')), G: Math.abs(v('G')) }; }
  else c.bstep = +d.bstep || 1;
}
const classForm = (c = {}) => `<div class="fg">${field('name', 'نام کلاس (مثلاً نهم ۱)', c.name, 'text', 'required')}${field('grade', 'پایه', c.grade)}${behStepFields(c)}</div>`;
function behDialog(sid, t0 = 'y', rec = null) {
  const s = stuOf(sid); if (!s) return;
  dlgOpen((rec ? 'ویرایش رفتار — ' : 'ثبت رفتار — ') + esc(s.name), `<div class="fg"><label class="f">نوع<select name="t" id="bhT">${Object.entries(BEH).map(([k, v]) => `<option value="${k}" ${k === t0 ? 'selected' : ''}>${v.t} (${pt(k)})</option>`).join('')}</select></label>${field('date', 'تاریخ', rec ? rec.date : S.date, 'date')}<label class="f">درس<select name="cid"><option value="">— بدون درس (عمومی) —</option>${db.courses.map(k => `<option value="${k.id}" ${k.id === (rec ? rec.cid : (S.bc || S.pbc)) ? 'selected' : ''}>${esc(k.name)}</option>`).join('')}</select></label></div><label class="f">توضیح <span id="bhReq">${t0 === 'w' ? '(لازم)' : '(اختیاری)'}</span><textarea name="note" id="bhN" rows="3" ${t0 === 'w' ? 'required' : ''} placeholder="مثلاً: صحبت کردن در کلاس / کمک به همکلاسی / تماس با ولی">${rec ? esc(rec.note) : ''}</textarea></label>`, d => { if (rec) { Object.assign(rec, { date: d.date, t: d.t, note: d.note.trim(), cid: d.cid || '' }); save(); render(true); toast('رفتار ویرایش شد'); return; } db.beh.push({ id: uid(), sid, date: d.date, t: d.t, note: d.note.trim(), cid: d.cid || '' }); save(); render(true); toast('رفتار ثبت شد'); });
  const sel = $('#bhT'), n = $('#bhN'); sel.onchange = () => { n.required = sel.value === 'w'; $('#bhReq').textContent = sel.value === 'w' ? '(لازم)' : '(اختیاری)'; };
  n.focus();
}
const A = {
  addClass() { dlgOpen('کلاس جدید', classForm(), d => { const c = newClass(d.name.trim(), d.grade.trim()); readStep(d, c); R.classes.push(c); save(); setCur(c.id); S.view = 'students'; S.st = S.ex = null; render(); toast('کلاس ساخته شد. حالا دانش‌آموزان را اضافه کنید'); }); },
  editClass(id) { const c = R.classes.find(x => x.id === id); dlgOpen('ویرایش کلاس', classForm(c), d => { c.name = d.name.trim(); c.grade = d.grade.trim(); readStep(d, c); save(); render(true); }); },
  delClass(id) { const c = R.classes.find(x => x.id === id); if (confirm(`کلاس «${c.name}» با همه دانش‌آموزان، نمرات، حضور و غیاب و رفتارهایش حذف شود؟\n(پیشنهاد: اول پشتیبان بگیرید)`)) { snapNow('قبل از حذف کلاس'); R.classes = R.classes.filter(x => x.id !== id); if (db && db.id === id) db = null; save(); render(); } },
  openClass(id) { setCur(id); resetClassFilters(); S.view = 'students'; S.q = ''; render(); },
  exCPick(id) { S.exCourse = S.exCourse === id ? '' : id; render(true); }, tkCPick(id) { S.tkCourse = S.tkCourse === id ? '' : id; render(true); }, akCPick(id) { S.actCourse = S.actCourse === id ? '' : id; render(true); },
  importStudents() { importDialog(); }, gradeImport() { gradeImportDialog(); },
  loadSample() { if (R.classes.some(c => c.students.length) && !confirm('همه داده‌های فعلی با داده نمونه جایگزین شود؟')) return; snapNow('قبل از داده نمونه'); R = migrate(sample()); db = null; S.view = 'home'; S.st = S.ex = null; save(); render(); toast('داده نمونه بارگذاری شد'); },
  addCourse() { dlgOpen('درس جدید', courseForm(), d => { db.courses.push({ id: uid(), name: d.name, coef: +d.coef }); save(); render(true); }); },
  editCourse(id) { const c = courseOf(id); dlgOpen('ویرایش درس', courseForm(c), d => { c.name = d.name; c.coef = +d.coef; save(); render(true); }); },
  delCourse(id) { if (confirm('این درس و تمام آزمون‌هایش حذف شود؟')) { db.courses = db.courses.filter(c => c.id !== id); db.exams = db.exams.filter(e => e.courseId !== id); db.tasks.forEach(t => { if (t.courseId === id) t.courseId = ''; }); db.acts.forEach(a => { if (a.courseId === id) a.courseId = ''; }); save(); render(true); } },
  addStudent() { if (!db) return toast('اول یک کلاس انتخاب کنید'); dlgOpen('دانش‌آموز جدید در ' + esc(db.name), studentForm(), async (d, f) => { const p = await readPhoto(f.querySelector('[name=_photo]').files[0]); delete d._photo; db.students.push({ id: uid(), photo: p || '', ...d }); save(); render(true); toast('دانش‌آموز اضافه شد'); }); },
  editStudent(id) { const s = stuOf(id); dlgOpen('ویرایش دانش‌آموز', studentForm(s), async (d, f) => { const p = await readPhoto(f.querySelector('[name=_photo]').files[0]); delete d._photo; Object.assign(s, d); if (p) s.photo = p; save(); render(true); }); },
  delStudent(id) { if (confirm('این دانش‌آموز و همه نمره‌ها، غیبت‌ها و رفتارهایش حذف شود؟')) { db.students = db.students.filter(s => s.id !== id); db.exams.forEach(e => delete e.scores[id]); db.tasks.forEach(t => delete t.res[id]); db.acts.forEach(a => { delete a.res[id]; if (a.ids) a.ids = a.ids.filter(x => x !== id); }); Object.values(db.att).forEach(d => delete d[id]); db.beh = db.beh.filter(b => b.sid !== id); save(); render(true); } },
  summary(id) { summaryOpen(id); },
  goto(id, el) { const s = stuOf(id); if (!s) return; S.view = el.dataset.v; S.fid = id; S.fq = ''; S.kon = false; render(); },
  fidClear() { S.fid = ''; render(true); },
  open(id, el) { S.st = id; S.pbt = ''; S.view = 'profile'; render(); },
  prev() { S.st = S._n[0]; S.pbt = ''; render(); }, next() { S.st = S._n[1]; S.pbt = ''; render(); }, print() { if (CAPP) { toast('چاپ در نسخه اندروید در دسترس نیست؛ از نسخه ویندوز استفاده کنید'); return; } window.print(); },
  mark(id, el) { const r = db.att[S.date] ??= {}; if (r[id] === el.dataset.k) delete r[id]; else r[id] = el.dataset.k; S.kr = vis().findIndex(x => x.id === id); S.kon = true; save(); render(true); },
  clearAll() { if (confirm('همه کلاس‌ها و اطلاعات پاک شود؟ (یک نسخه خودکار از وضعیت فعلی نگه داشته می‌شود)')) { snapNow('قبل از شروع از صفر'); R = emptyRoot(); db = null; S.view = 'home'; S.st = S.ex = null; save(); render(); } },
  restP() { const had = !!db.att[S.date], r = db.att[S.date] ??= {}; let n = 0; db.students.forEach(s => { if (!r[s.id]) { r[s.id] = 'p'; n++; } }); if (!n && !had) delete db.att[S.date]; save(); render(true); toast(n ? `${fa(n, 0)} نفر باقی‌مانده «حاضر» ثبت شدند` : 'وضعیت همه از قبل مشخص بود'); },
  allP() { db.att[S.date] = Object.fromEntries(db.students.map(s => [s.id, 'p'])); save(); render(true); toast('همه حاضر ثبت شدند'); },
  beh(id, el) { db.beh.push({ id: uid(), sid: id, date: S.date, t: el.dataset.k, note: '', cid: S.bc || '' }); save(); render(true); toast(`${stuOf(id).name}: ${BEH[el.dataset.k].t} ثبت شد`); },
  behNote(id) { behDialog(id, 'y'); }, behW(id) { behDialog(id, 'w'); },
  editBeh(id) { const b = db.beh.find(x => x.id === id); if (b) behDialog(b.sid, b.t, b); },
  pbt(_, el) { const k = el.dataset.k; S.pbt = S.pbt === k ? '' : k; render(true); },
  behOpen(id, el) { S.st = id; S.pbt = el.dataset.k; S.pbc = S.bc || ''; S.view = 'profile'; render(); },
  bcPick(id) { S.bc = S.bc === id ? '' : id; render(true); },
  delBeh(id) { db.beh = db.beh.filter(b => b.id !== id); save(); render(true); toast('حذف شد'); },
  addExam() { if (!db.courses.length) return toast('ابتدا یک درس تعریف کنید'); dlgOpen('آزمون جدید', examForm(), d => { const e = { id: uid(), courseId: d.courseId, title: d.title, date: d.date, max: +d.max, scores: {} }; db.exams.push(e); S.ex = e.id; if (S.exCourse && S.exCourse !== e.courseId) S.exCourse = e.courseId; save(); render(true); }); },
  editExam(id) { const e = db.exams.find(x => x.id === id); dlgOpen('ویرایش آزمون', examForm(e), d => { Object.assign(e, d, { max: +d.max }); Object.keys(e.scores).forEach(k => { if (e.scores[k] > e.max) e.scores[k] = e.max; }); save(); render(true); }); },
  delExam(id) { if (confirm('این آزمون حذف شود؟')) { db.exams = db.exams.filter(e => e.id !== id); save(); render(true); } },
  pickExam(id) { S.ex = id; render(true); }
};
document.addEventListener('click', e => {
  if (e.target.closest('[data-more]')) { setMenu(!$('#side').classList.contains('open')); return; }
  const n = e.target.closest('[data-nav]'); if (n) { S.view = n.dataset.nav; S.kon = false; S.fq = ''; S.fid = ''; return render(); }
  const a = e.target.closest('[data-act]'); if (a) { e.preventDefault(); A[a.dataset.act]?.(a.dataset.id, a); }
});
$('#menuBtn').onclick = () => setMenu(!$('#side').classList.contains('open'));
// tapping anywhere outside the open menu just closes it (nothing underneath gets triggered)
document.addEventListener('click', e => { if ($('#side').classList.contains('open') && !e.target.closest('#side, [data-more], #menuBtn')) { e.preventDefault(); e.stopPropagation(); setMenu(false); } }, true);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#side').classList.contains('open')) setMenu(false); });
$('#bAbout').onclick = () => { S.view = 'about'; S.kon = false; render(); };
document.addEventListener('input', e => { if (e.target.id !== 'fq') return; const el = e.target; S.fq = el.value; const p = el.selectionStart; render(true); const n = $('#fq'); if (n) { n.focus(); try { n.setSelectionRange(p, p); } catch { } } });
document.addEventListener('keydown', e => { if (e.target.id !== 'fq') return;
  if (e.key === 'Escape') { e.preventDefault(); S.fq = ''; e.target.blur(); render(true); }
  else if (e.key === 'Enter' || e.key === 'ArrowDown') { e.preventDefault(); e.target.blur(); if (S.view === 'att' || S.view === 'tasks' || S.view === 'acts') { S.kon = true; S.kr = 0; render(true); scrollRow(0); } } });


/* ================= Jalali calendar & date picker ================= */
const fnum = s => String(s).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
const JAL = (() => {
  const div = (a, b) => ~~(a / b), mod = (a, b) => a - ~~(a / b) * b;
  const br = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  function cal(jy) {
    const gy = jy + 621; let leapJ = -14, jp = br[0], jm, jump = 0, leap, n, i;
    for (i = 1; i < br.length; i++) { jm = br[i]; jump = jm - jp; if (jy < jm) break; leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4); jp = jm; }
    n = jy - jp; leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
    if (mod(jump, 33) === 4 && jump - n === 4) leapJ++;
    const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150, march = 20 + leapJ - leapG;
    if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
    leap = mod(mod(n + 1, 33) - 1, 4); if (leap === -1) leap = 4;
    return { leap, gy, march };
  }
  const g2d = (gy, gm, gd) => { let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408; return d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752; };
  const d2g = jdn => { let j = 4 * jdn + 139361631; j += div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908; const i = div(mod(j, 1461), 4) * 5 + 308, gd = div(mod(i, 153), 5) + 1, gm = mod(div(i, 153), 12) + 1; return { gy: div(j, 1461) - 100100 + div(8 - gm, 6), gm, gd }; };
  const j2d = (jy, jm, jd) => { const r = cal(jy); return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1; };
  const d2j = jdn => { const g = d2g(jdn); let jy = g.gy - 621; const r = cal(jy), f = g2d(g.gy, 3, r.march); let k = jdn - f, jm, jd;
    if (k >= 0) { if (k <= 185) return { jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 }; k -= 186; } else { jy--; k += 179; if (r.leap === 1) k++; }
    jm = 7 + div(k, 30); jd = mod(k, 30) + 1; return { jy, jm, jd }; };
  return { toJ: (y, m, d) => d2j(g2d(y, m, d)), toG: (y, m, d) => d2g(j2d(y, m, d)), len: (y, m) => m <= 6 ? 31 : m <= 11 ? 30 : (cal(y).leap === 0 ? 30 : 29) };
})();
const JM = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
const jIso = (y, m, d) => { const g = JAL.toG(y, m, d); return `${g.gy}-${String(g.gm).padStart(2, '0')}-${String(g.gd).padStart(2, '0')}`; };
const isoJ = s => { const [y, m, d] = s.split('-').map(Number); return JAL.toJ(y, m, d); };
const jDisp = s => { if (!s) return ''; const j = isoJ(s); return fnum(`${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`); };
const MARKS = { att: 'حضور و غیاب', beh: 'رفتار', exam: 'آزمون', task: 'تکلیف', act: 'فعالیت' };
function markedDays(kind) {
  const out = new Set(); if (!db) return out;
  const k = kind || ({ att: 'att', beh: 'beh', exams: 'exam', tasks: 'task', acts: 'act' }[S.view] || 'all'), on = x => k === 'all' || k === x;
  if (on('att')) Object.keys(db.att).forEach(d => { if (db.att[d] && Object.values(db.att[d]).some(Boolean)) out.add(d); });
  if (on('beh')) db.beh.forEach(b => { if (b.date && (k === 'all' || !S.bc || b.cid === S.bc)) out.add(b.date); });
  if (on('exam')) db.exams.forEach(e => e.date && out.add(e.date));
  if (on('task')) db.tasks.forEach(t => t.date && out.add(t.date));
  if (on('act')) db.acts.forEach(a => a.date && out.add(a.date));
  return out;
}
const markLabel = kind => { const k = kind || ({ att: 'att', beh: 'beh', exams: 'exam', tasks: 'task', acts: 'act' }[S.view] || 'all'); return k === 'all' ? 'روزهای دارای اطلاعات ثبت‌شده' : 'روزهای دارای ' + MARKS[k] + ' ثبت‌شده'; };
const jdate = (name, v = '', x = '') => `<span class="jdw"><input type="text" class="jdv" readonly value="${jDisp(v)}" placeholder="📅 انتخاب تاریخ"><input type="hidden" ${name ? `name="${name}"` : ''} value="${esc(v)}" ${x}></span>`;
function openPicker(hid) {
  let dlg = $('#jpk'); if (!dlg) { dlg = document.createElement('dialog'); dlg.id = 'jpk'; document.body.appendChild(dlg); }
  const clearable = hid.dataset.clear === '1', todayIso = iso(new Date()), marks = markedDays(hid.dataset.mark), mlabel = markLabel(hid.dataset.mark);
  let f = isoJ(hid.value || todayIso), vy = f.jy, vm = f.jm;
  const shift = (j, n) => { const g = JAL.toG(j.jy, j.jm, j.jd), dt = new Date(g.gy, g.gm - 1, g.gd + n, 12); return JAL.toJ(dt.getFullYear(), dt.getMonth() + 1, dt.getDate()); };
  const draw = () => {
    const g1 = JAL.toG(vy, vm, 1), lead = (new Date(g1.gy, g1.gm - 1, g1.gd, 12).getDay() + 1) % 7, n = JAL.len(vy, vm);
    let cells = '<i></i>'.repeat(lead);
    for (let d = 1; d <= n; d++) { const di = jIso(vy, vm, d), cls = [di === hid.value ? 'sel' : '', di === todayIso ? 'today' : '', (lead + d - 1) % 7 === 6 ? 'fri' : '', marks.has(di) ? 'has' : '', f.jy === vy && f.jm === vm && f.jd === d ? 'fd' : ''].join(' '); cells += `<button type="button" class="${cls}" data-d="${d}">${fnum(d)}</button>`; }
    dlg.innerHTML = `<div class="jp"><div class="jh"><button type="button" class="btn sec sm" data-pm title="ماه قبل">▶</button><select data-m>${JM.map((m, i) => `<option value="${i + 1}" ${i + 1 === vm ? 'selected' : ''}>${m}</option>`).join('')}</select><select data-y>${Array.from({ length: 31 }, (_, i) => vy - 15 + i).map(y => `<option value="${y}" ${y === vy ? 'selected' : ''}>${fnum(y)}</option>`).join('')}</select><button type="button" class="btn sec sm" data-nm title="ماه بعد">◀</button></div>
    <div class="jgrid jw">${['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((w, i) => `<b class="${i === 6 ? 'fri' : ''}">${w}</b>`).join('')}</div><div class="jgrid">${cells}</div>
    ${marks.size ? `<div class="sub jleg"><i></i> ${mlabel}</div>` : ''}
    <div class="row" style="justify-content:space-between"><button type="button" class="btn sm" data-today>امروز</button>${clearable ? '<button type="button" class="btn bad sm" data-clr>پاک کردن</button>' : ''}<button type="button" class="btn sec sm" data-x>بستن</button></div><div class="sub jkb" style="text-align:center">⌨️ جهت‌نما: روز · PageUp/PageDown: ماه · Enter: انتخاب</div></div>`;
    const fd = dlg.querySelector('.fd'); if (fd) fd.focus({ preventScroll: true });
  };
  const pick = iso2 => { hid.value = iso2; const v = hid.parentElement.querySelector('.jdv'); if (v) v.value = jDisp(iso2); hid.dispatchEvent(new Event('change', { bubbles: true })); dlg.close(); };
  dlg.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.d) return pick(jIso(vy, vm, +b.dataset.d));
    if ('pm' in b.dataset) { vm--; if (vm < 1) { vm = 12; vy--; } } else if ('nm' in b.dataset) { vm++; if (vm > 12) { vm = 1; vy++; } }
    else if ('today' in b.dataset) return pick(todayIso); else if ('clr' in b.dataset) return pick(''); else if ('x' in b.dataset) return dlg.close();
    f = { jy: vy, jm: vm, jd: Math.min(f.jd, JAL.len(vy, vm)) }; draw();
  };
  dlg.onchange = e => { if (e.target.dataset.m) vm = +e.target.value; if (e.target.dataset.y) vy = +e.target.value; f = { jy: vy, jm: vm, jd: Math.min(f.jd, JAL.len(vy, vm)) }; draw(); };
  dlg.onkeydown = e => {
    if (e.target.tagName === 'SELECT') return;
    const mv = { ArrowLeft: 1, ArrowRight: -1, ArrowDown: 7, ArrowUp: -7 }[e.key];
    if (mv) { e.preventDefault(); f = shift(f, mv); vy = f.jy; vm = f.jm; draw(); }
    else if (e.key === 'PageDown' || e.key === 'PageUp') { e.preventDefault(); vm += e.key === 'PageDown' ? 1 : -1; if (vm > 12) { vm = 1; vy++; } if (vm < 1) { vm = 12; vy--; } f = { jy: vy, jm: vm, jd: Math.min(f.jd, JAL.len(vy, vm)) }; draw(); }
    else if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') { e.preventDefault(); pick(jIso(f.jy, f.jm, f.jd)); }
  };
  draw(); dlg.showModal(); const fd = dlg.querySelector('.fd'); if (fd) fd.focus();
}
document.addEventListener('click', e => { const v = e.target.closest('.jdv'); if (v) { e.preventDefault(); openPicker(v.parentElement.querySelector('input[type=hidden]')); } });
document.addEventListener('keydown', e => { const v = e.target.closest && e.target.closest('.jdv'); if (v && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) { e.preventDefault(); openPicker(v.parentElement.querySelector('input[type=hidden]')); } });

/* ================= tasks ================= */
const tkStats = (t, list = db.students) => { const rs = list.map(s => t.res[s.id]), y = rs.filter(r => r?.st === 'y').length, n = rs.filter(r => r?.st === 'n').length, sc = rs.map(r => r?.sc).filter(v => v != null);
  return `<span class="pill ok">انجام شد ${fa(y, 0)}</span><span class="pill bad">انجام نشد ${fa(n, 0)}</span><span class="pill warn">ثبت نشده ${fa(list.length - y - n, 0)}</span>${t.max > 0 && sc.length ? `<span class="pill ok">میانگین نمره ${fa(mean(sc))} از ${fa(t.max)}</span>` : ''}`; };
VIEWS.tasks = function () {
  if (S.tkCourse && !courseOf(S.tkCourse)) S.tkCourse = '';
  const list = db.tasks.filter(t => !S.tkCourse || t.courseId === S.tkCourse).sort((a, b) => a.date < b.date ? 1 : -1);
  if (!db.tasks.find(t => t.id === S.tk)) S.tk = list[0]?.id;
  const t = taskOf(S.tk);
  let detail = '<div class="card empty">تکلیفی انتخاب نشده است. با «تکلیف جدید» یکی تعریف کنید.</div>';
  if (t) detail = `<div class="card"><div class="top" style="margin-bottom:10px"><div><h3 style="margin:0">${esc(t.title)}${t.courseId ? ' — ' + esc(courseOf(t.courseId)?.name) : ''}</h3><div class="sub">تاریخ: ${jd(t.date)}${t.due ? ' · مهلت تحویل: ' + jd(t.due) : ''} · ${t.max > 0 ? 'بارم ' + fa(t.max) : 'بدون نمره (فقط انجام/عدم انجام)'}</div></div><div class="row noprint"><button class="btn sec sm" data-act="tkAll">✓ همه انجام شد</button><button class="btn sec sm" data-act="tkRest">✓ باقی‌مانده‌ها انجام شد</button><button class="btn sec sm" data-act="editTask" data-id="${t.id}">ویرایش</button><button class="btn bad sm" data-act="delTask" data-id="${t.id}">حذف</button></div></div>
    <div class="row" id="tkStats" style="margin-bottom:12px">${tkStats(t)}</div><div class="sub" style="margin:0 0 8px">دانش‌آموزانی که در تاریخ این تکلیف غایب بوده‌اند، خودکار «انجام نشد» (و نمره صفر) ثبت می‌شوند؛ هر وقت خواستید می‌توانید تغییرشان بدهید.</div><div class="row noprint" style="margin-bottom:8px">${fqBox()}</div>${kbHint('tasks', t.max > 0)}
    <div class="tw"><table><tr><th>#</th><th>دانش‌آموز</th><th>وضعیت</th>${t.max > 0 ? `<th class="num">نمره (از ${fa(t.max)})</th>` : ''}</tr>
    ${vis().map((s, i) => { const r = t.res[s.id] || {}, ab = (db.att[t.date] || {})[s.id] === 'a'; return `<tr class="${S.kon && S.kr === i ? 'kr' : ''}" data-sid="${s.id}"><td>${fa(i + 1, 0)}</td><td><span class="row">${avatar(s)} ${nl(s)}${ab ? ' <span class="pill bad" title="در تاریخ این تکلیف غایب بوده">غایب' + (r.auto ? ' · خودکار' : '') + '</span>' : ''}</span></td><td><div class="seg"><button class="y ${r.st === 'y' ? 'on' : ''}" data-act="tkMark" data-id="${s.id}" data-k="y">✓ انجام شد</button><button class="n ${r.st === 'n' ? 'on' : ''}" data-act="tkMark" data-id="${s.id}" data-k="n">✗ انجام نشد</button></div></td>${t.max > 0 ? `<td class="num"><input type="number" class="tsc" data-id="${s.id}" min="0" max="${t.max}" step="0.25" value="${r.sc ?? ''}" style="width:90px"></td>` : ''}</tr>`; }).join('') || `<tr><td colspan=4 class="empty">${S.fq ? 'دانش‌آموزی با این نام پیدا نشد.' : 'ابتدا دانش‌آموز ثبت کنید.'}</td></tr>`}</table></div></div>`;
  V(head('تکالیف', 'تعریف تکلیف و ثبت انجام/عدم انجام یا نمره (ذخیره خودکار)', `<button class="btn" data-act="addTask">+ تکلیف جدید</button>`) + coursePick('tkCPick', S.tkCourse) + `
  <div class="grid" style="grid-template-columns:300px 1fr"><div class="card"><h3>فهرست تکالیف (${fa(list.length, 0)})</h3><div class="exl">${list.map(x => { const y = db.students.filter(s => x.res[s.id]?.st === 'y').length, n = db.students.filter(s => x.res[s.id]?.st === 'n').length; return `<button class="ex ${x.id === S.tk ? 'on' : ''}" data-act="pickTask" data-id="${x.id}"><b>${esc(x.title)}</b><br><small>${x.courseId ? esc(courseOf(x.courseId)?.name) + ' · ' : ''}${jd(x.date)} · ✓${fa(y, 0)} ✗${fa(n, 0)}</small></button>`; }).join('') || '<div class="empty">خالی</div>'}</div></div>${detail}</div>`);
  document.querySelectorAll('.tsc').forEach(i => {
    const sid = i.dataset.id, commit = fin => {
      const tt = db && db.tasks.find(x => x.id === t.id); if (!tt) return; if (i.validity && i.validity.badInput) return;
      const r = tt.res[sid] ??= {}; delete r.auto;
      if (i.value === '') delete r.sc; else { r.sc = Math.min(tt.max, Math.max(0, +i.value)); if (fin) i.value = r.sc; if (!r.st) { r.st = 'y'; const row = i.closest('tr'); row.querySelector('.seg .y').classList.add('on'); row.querySelector('.seg .n').classList.remove('on'); } }
      tidy(tt, sid); save(); const ts = $('#tkStats'); if (ts) ts.innerHTML = tkStats(tt); if (fin) toast('ذخیره شد');
    };
    i.oninput = () => commit(false); i.onchange = () => commit(true);
  });
};
const taskForm = (t = {}) => `<div class="fg"><label class="f">درس (اختیاری)<select name="courseId"><option value="">— بدون درس —</option>${db.courses.map(c => `<option value="${c.id}" ${c.id === t.courseId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>${field('title', 'عنوان تکلیف', t.title, 'text', 'required')}${field('date', 'تاریخ تعریف تکلیف', t.date || iso(new Date()), 'date')}${field('due', 'مهلت تحویل (اختیاری)', t.due || '', 'date', 'data-clear=1')}${field('max', 'بارم (۰ = بدون نمره، فقط انجام/عدم انجام)', t.max ?? 0, 'number', 'min=0 max=100 step=0.5')}</div>`;
function profileTasks(s) {
  const c = taskCount(s.id), rows = [...db.tasks].sort((a, b) => a.date < b.date ? 1 : -1);
  return `<div class="card" style="margin-top:16px"><div class="top" style="margin-bottom:10px"><div><h3 style="margin:0">${ico('tasks')} تکالیف</h3><div class="sub">${fa(db.tasks.length, 0)} تکلیف تعریف شده${c.pct != null ? ' · درصد انجام: ' + fa(c.pct, 0) + '٪' : ''}</div></div></div>
  <div class="row" style="margin-bottom:10px"><span class="pill ok">انجام شد ${fa(c.y, 0)}</span><span class="pill bad">انجام نشد ${fa(c.n, 0)}</span><span class="pill warn">ثبت نشده ${fa(c.u, 0)}</span>${c.avg != null ? `<span class="pill ok">میانگین نمره تکالیف ${fa(c.avg)} از ۲۰</span>` : ''}</div>
  <div class="tw" style="max-height:300px"><table><tr><th>تاریخ</th><th>تکلیف</th><th>درس</th><th>وضعیت</th><th class="num">نمره</th></tr>${rows.map(t => { const r = t.res[s.id]; return `<tr><td>${jd(t.date)}</td><td>${esc(t.title)}</td><td>${esc(courseOf(t.courseId)?.name) || '—'}</td><td>${tkPill(r)}</td><td class="num">${t.max > 0 && r && r.sc != null ? fa(r.sc) + ' از ' + fa(t.max) : '—'}</td></tr>`; }).join('') || '<tr><td colspan=5 class="empty">هنوز تکلیفی تعریف نشده است.</td></tr>'}</table></div></div>`;
}
Object.assign(A, {
  addTask() { dlgOpen('تکلیف جدید', taskForm(), d => { const t = { id: uid(), courseId: d.courseId, title: d.title.trim(), date: d.date, due: d.due || '', max: +d.max || 0, res: {} }; db.tasks.push(t); S.tk = t.id; if (S.tkCourse && S.tkCourse !== t.courseId) S.tkCourse = t.courseId; save(); render(true); toast('تکلیف ثبت شد'); }); },
  editTask(id) { const t = taskOf(id); dlgOpen('ویرایش تکلیف', taskForm(t), d => { Object.assign(t, { courseId: d.courseId, title: d.title.trim(), date: d.date, due: d.due || '', max: +d.max || 0 }); if (t.max > 0) Object.values(t.res).forEach(r => { if (r.sc > t.max) r.sc = t.max; }); save(); render(true); }); },
  delTask(id) { if (confirm('این تکلیف و وضعیت دانش‌آموزان در آن حذف شود؟')) { snapNow('قبل از حذف تکلیف'); db.tasks = db.tasks.filter(t => t.id !== id); save(); render(true); } },
  pickTask(id) { S.tk = id; S.kon = false; render(true); },
  tkMark(id, el) { setTk(id, el.dataset.k, true); S.kr = vis().findIndex(x => x.id === id); S.kon = true; render(true); },
  tkAll() { const t = curRec(); if (!t) return; rowsOf().forEach(s => { const r = t.res[s.id] ??= {}; if (r.auto) return; r.st = 'y'; }); save(); render(true); toast('همه «انجام شد» ثبت شدند' + (S.view === 'acts' ? '' : ' (غایب‌های خودکار بدون تغییر ماندند)')); },
  tkRest() { const t = curRec(); if (!t) return; let n = 0; rowsOf().forEach(s => { const r = t.res[s.id]; if (r && r.st) return; (t.res[s.id] ??= {}).st = 'y'; n++; }); save(); render(true); toast(n ? `${fa(n, 0)} نفر باقی‌مانده «انجام شد» ثبت شدند` : 'وضعیت همه از قبل مشخص بود'); },
});
const curRec = () => S.view === 'acts' ? actOf(S.ak) : taskOf(S.tk);
const rowsOf = () => S.view === 'acts' ? actStudents(actOf(S.ak)) : db.students;
function tidy(t, sid) { const r = t.res[sid]; if (r && !r.st && r.sc == null) { if (!db.acts.includes(t) && (db.att[t.date] || {})[sid] === 'a') t.res[sid] = {}; else delete t.res[sid]; } }
function setTk(sid, k, toggle) { const t = curRec(); if (!t) return; const r = t.res[sid] ??= {}; delete r.auto; if (!k || (toggle && r.st === k)) delete r.st; else r.st = k; tidy(t, sid); save(); }
/* absent on the task's date => "not done" (score 0) unless the teacher edited it */
function syncAbsent(c) {
  let ch = false;
  c.tasks.forEach(t => { const day = c.att[t.date] || {};
    c.students.forEach(s => { const ab = day[s.id] === 'a', r = t.res[s.id];
      if (ab && !r) { t.res[s.id] = t.max > 0 ? { st: 'n', sc: 0, auto: 1 } : { st: 'n', auto: 1 }; ch = true; }
      else if (!ab && r && r.auto) { delete t.res[s.id]; ch = true; }
      else if (ab && r && r.auto) { if (t.max > 0 && r.sc !== 0) { r.sc = 0; ch = true; } else if (!(t.max > 0) && r.sc != null) { delete r.sc; ch = true; } } }); });
  return ch;
}


/* ================= activities & projects (فعالیت و پروژه) ================= */
const actOf = id => db.acts.find(a => a.id === id);
function actStudents(a) { return a && a.ids ? db.students.filter(s => a.ids.includes(s.id)) : db.students; }
function actCount(sid, c = db) {
  const o = { y: 0, n: 0, u: 0, t: 0, sum: 0, k: 0 };
  c.acts.forEach(a => { if (a.ids && !a.ids.includes(sid)) return; o.t++; const r = a.res[sid]; if (r && r.st === 'y') o.y++; else if (r && r.st === 'n') o.n++; else o.u++; if (r && r.sc != null && a.max > 0) { o.sum += r.sc / a.max * 20; o.k++; } });
  o.pct = (o.y + o.n) ? o.y / (o.y + o.n) * 100 : null; o.avg = o.k ? o.sum / o.k : null; return o;
}
const actForm = (a = {}) => `<div class="fg"><label class="f">درس (اختیاری)<select name="courseId"><option value="">— بدون درس —</option>${db.courses.map(c => `<option value="${c.id}" ${c.id === a.courseId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>${field('title', 'عنوان فعالیت / پروژه', a.title, 'text', 'required')}${field('date', 'تاریخ فعالیت', a.date || iso(new Date()), 'date')}${field('due', 'مهلت تحویل (اختیاری)', a.due || '', 'date', 'data-clear=1')}${field('max', 'بارم (۰ = بدون نمره، فقط انجام/عدم انجام)', a.max ?? 20, 'number', 'min=0 max=100 step=0.5')}<label class="f">شرکت‌کنندگان<select name="who"><option value="all" ${!a.ids ? 'selected' : ''}>همه دانش‌آموزان کلاس</option><option value="sel" ${a.ids ? 'selected' : ''}>فقط چند نفر (خودم انتخاب می‌کنم)</option></select></label></div>`;
function actMembersDialog(a) {
  const cur = new Set(a.ids || []);
  dlgOpen('شرکت‌کنندگان «' + esc(a.title) + '»', `<div class="row"><input type="search" placeholder="جستجوی نام…" oninput="const q=this.value.trim();this.form.querySelectorAll('label.mb').forEach(l=>l.hidden=q&&!l.textContent.includes(q))" style="flex:1"><button type="button" class="btn sec sm" onclick="this.form.querySelectorAll('.mb input').forEach(i=>i.checked=true)">همه</button><button type="button" class="btn sec sm" onclick="this.form.querySelectorAll('.mb input').forEach(i=>i.checked=false)">هیچ‌کدام</button></div><div class="mbl">${db.students.map(s => `<label class="mb ck"><input type="checkbox" name="m_${s.id}" ${cur.has(s.id) ? 'checked' : ''}><span>${esc(s.name)}</span></label>`).join('') || '<div class="empty">دانش‌آموزی نیست</div>'}</div>`,
    d => { a.ids = db.students.filter(s => d['m_' + s.id]).map(s => s.id); save(); render(true); toast(`${fa(a.ids.length, 0)} نفر در این فعالیت شرکت دارند`); });
}
function profileActs(s) {
  if (!db.acts.length) return '';
  const c = actCount(s.id), rows = db.acts.filter(a => !a.ids || a.ids.includes(s.id)).sort((x, y) => x.date < y.date ? 1 : -1);
  return `<div class="card" style="margin-top:16px"><div class="top" style="margin-bottom:10px"><div><h3 style="margin:0">${ico('target')} فعالیت‌ها و پروژه‌ها</h3><div class="sub">${fa(rows.length, 0)} فعالیت برای این دانش‌آموز${c.pct != null ? ' · درصد انجام: ' + fa(c.pct, 0) + '٪' : ''}</div></div></div>
  <div class="row" style="margin-bottom:10px"><span class="pill ok">انجام شد ${fa(c.y, 0)}</span><span class="pill bad">انجام نشد ${fa(c.n, 0)}</span><span class="pill warn">ثبت نشده ${fa(c.u, 0)}</span>${c.avg != null ? `<span class="pill ok">میانگین نمره فعالیت‌ها ${fa(c.avg)} از ۲۰</span>` : ''}</div>
  <div class="tw" style="max-height:300px"><table><tr><th>تاریخ</th><th>فعالیت</th><th>درس</th><th>وضعیت</th><th class="num">نمره</th></tr>${rows.map(a => { const r = a.res[s.id]; return `<tr><td>${jd(a.date)}</td><td>${esc(a.title)}</td><td>${esc(courseOf(a.courseId)?.name) || '—'}</td><td>${tkPill(r)}</td><td class="num">${a.max > 0 && r && r.sc != null ? fa(r.sc) + ' از ' + fa(a.max) : '—'}</td></tr>`; }).join('')}</table></div></div>`;
}
VIEWS.acts = function () {
  if (S.actCourse && !courseOf(S.actCourse)) S.actCourse = '';
  const list = db.acts.filter(a => !S.actCourse || a.courseId === S.actCourse).sort((a, b) => a.date < b.date ? 1 : -1);
  if (!db.acts.find(a => a.id === S.ak)) S.ak = list[0]?.id;
  const a = actOf(S.ak), L = a ? actStudents(a) : [];
  let detail = '<div class="card empty">فعالیتی انتخاب نشده است. با «فعالیت / پروژه جدید» یکی تعریف کنید.<br><small>برای کارهایی مثل پروژه، پژوهش، کار گروهی یا فعالیت کلاسی که لازم نیست همه دانش‌آموزان در آن نمره داشته باشند.</small></div>';
  if (a) {
    const V2 = vis(), fidMissing = S.fid && stuOf(S.fid) && !V2.length && a.ids;
    detail = `<div class="card"><div class="top" style="margin-bottom:10px"><div><h3 style="margin:0">${esc(a.title)}${a.courseId ? ' — ' + esc(courseOf(a.courseId)?.name) : ''}</h3><div class="sub">تاریخ: ${jd(a.date)}${a.due ? ' · مهلت تحویل: ' + jd(a.due) : ''} · ${a.max > 0 ? 'بارم ' + fa(a.max) : 'بدون نمره (فقط انجام/عدم انجام)'} · ${a.ids ? 'شرکت‌کنندگان: ' + fa(L.length, 0) + ' نفر از ' + fa(db.students.length, 0) : 'همه دانش‌آموزان'}</div></div><div class="row noprint"><button class="btn sec sm" data-act="tkAll">✓ همه انجام شد</button><button class="btn sec sm" data-act="tkRest">✓ باقی‌مانده‌ها انجام شد</button><button class="btn sec sm" data-act="actMembers" data-id="${a.id}">👥 شرکت‌کنندگان</button><button class="btn sec sm" data-act="editAct" data-id="${a.id}">ویرایش</button><button class="btn bad sm" data-act="delAct" data-id="${a.id}">حذف</button></div></div>
    <div class="row" id="tkStats" style="margin-bottom:12px">${tkStats(a, L)}</div><div class="row noprint" style="margin-bottom:8px">${fqBox()}</div>${kbHint('tasks', a.max > 0)}
    <div class="tw"><table><tr><th>#</th><th>دانش‌آموز</th><th>وضعیت</th>${a.max > 0 ? `<th class="num">نمره (از ${fa(a.max)})</th>` : ''}${a.ids ? '<th class="noprint"></th>' : ''}</tr>
    ${V2.map((s, i) => { const r = a.res[s.id] || {}; return `<tr class="${S.kon && S.kr === i ? 'kr' : ''}" data-sid="${s.id}"><td>${fa(i + 1, 0)}</td><td><span class="row">${avatar(s)} ${nl(s)}</span></td><td><div class="seg"><button class="y ${r.st === 'y' ? 'on' : ''}" data-act="tkMark" data-id="${s.id}" data-k="y">✓ انجام شد</button><button class="n ${r.st === 'n' ? 'on' : ''}" data-act="tkMark" data-id="${s.id}" data-k="n">✗ انجام نشد</button></div></td>${a.max > 0 ? `<td class="num"><input type="number" class="tsc" data-id="${s.id}" min="0" max="${a.max}" step="0.25" value="${r.sc ?? ''}" style="width:90px"></td>` : ''}${a.ids ? `<td class="num noprint"><button class="btn bad sm" data-act="actRemove" data-id="${s.id}" title="حذف از این فعالیت">✕</button></td>` : ''}</tr>`; }).join('') || `<tr><td colspan=5 class="empty">${fidMissing ? `«${esc(stuOf(S.fid).name)}» در این فعالیت شرکت ندارد. <button class="btn sm" data-act="actAdd" data-id="${S.fid}">افزودن به این فعالیت</button>` : S.fq ? 'دانش‌آموزی با این نام پیدا نشد.' : a.ids ? 'هنوز کسی انتخاب نشده؛ «شرکت‌کنندگان» را بزنید.' : 'ابتدا دانش‌آموز ثبت کنید.'}</td></tr>`}</table></div></div>`;
  }
  V(head('فعالیت و پروژه', 'ثبت فعالیت‌ها و پروژه‌ها با نمره یا انجام/عدم انجام؛ می‌توانید فقط چند دانش‌آموز را در آن بیاورید (ذخیره خودکار)', `<button class="btn" data-act="addAct">+ فعالیت / پروژه جدید</button>`) + coursePick('akCPick', S.actCourse) + `
  <div class="grid" style="grid-template-columns:300px 1fr"><div class="card"><h3>فهرست فعالیت‌ها (${fa(list.length, 0)})</h3><div class="exl">${list.map(x => { const st = actStudents(x), y = st.filter(s => x.res[s.id]?.st === 'y').length, n = st.filter(s => x.res[s.id]?.st === 'n').length; return `<button class="ex ${x.id === S.ak ? 'on' : ''}" data-act="pickAct" data-id="${x.id}"><b>${esc(x.title)}</b><br><small>${x.courseId ? esc(courseOf(x.courseId)?.name) + ' · ' : ''}${jd(x.date)} · ${x.ids ? '👥' + fa(st.length, 0) + ' · ' : ''}✓${fa(y, 0)} ✗${fa(n, 0)}</small></button>`; }).join('') || '<div class="empty">خالی</div>'}</div></div>${detail}</div>`);
  document.querySelectorAll('.tsc').forEach(i => {
    const sid = i.dataset.id, commit = fin => {
      const aa = db && db.acts.find(x => x.id === a.id); if (!aa) return; if (i.validity && i.validity.badInput) return;
      const r = aa.res[sid] ??= {};
      if (i.value === '') delete r.sc; else { r.sc = Math.min(aa.max, Math.max(0, +i.value)); if (fin) i.value = r.sc; if (!r.st) { r.st = 'y'; const row = i.closest('tr'); row.querySelector('.seg .y').classList.add('on'); row.querySelector('.seg .n').classList.remove('on'); } }
      tidy(aa, sid); save(); const ts = $('#tkStats'); if (ts) ts.innerHTML = tkStats(aa, actStudents(aa)); if (fin) toast('ذخیره شد');
    };
    i.oninput = () => commit(false); i.onchange = () => commit(true);
  });
};
Object.assign(A, {
  addAct() { dlgOpen('فعالیت / پروژه جدید', actForm(), d => { const a = { id: uid(), courseId: d.courseId, title: d.title.trim(), date: d.date, due: d.due || '', max: +d.max || 0, ids: d.who === 'sel' ? [] : null, res: {} }; db.acts.push(a); S.ak = a.id; if (S.actCourse && S.actCourse !== a.courseId) S.actCourse = a.courseId; save(); render(true); toast('فعالیت ثبت شد'); if (a.ids) setTimeout(() => actMembersDialog(a), 50); }); },
  editAct(id) { const a = actOf(id); dlgOpen('ویرایش فعالیت', actForm(a), d => { Object.assign(a, { courseId: d.courseId, title: d.title.trim(), date: d.date, due: d.due || '', max: +d.max || 0 }); if (a.max > 0) Object.values(a.res).forEach(r => { if (r.sc > a.max) r.sc = a.max; }); let ask = false; if (d.who === 'all') a.ids = null; else if (!a.ids) { a.ids = db.students.filter(s => a.res[s.id]).map(s => s.id); ask = true; } save(); render(true); if (ask) setTimeout(() => actMembersDialog(a), 50); }); },
  delAct(id) { if (confirm('این فعالیت و وضعیت دانش‌آموزان در آن حذف شود؟')) { snapNow('قبل از حذف فعالیت'); db.acts = db.acts.filter(a => a.id !== id); save(); render(true); } },
  pickAct(id) { S.ak = id; S.kon = false; render(true); },
  actMembers(id) { const a = actOf(id); if (a) { if (!a.ids) { if (!confirm('الان همه دانش‌آموزان در این فعالیت هستند. به حالت «فقط چند نفر» تغییر کند؟')) return; a.ids = db.students.map(s => s.id); save(); } actMembersDialog(a); } },
  actRemove(id) { const a = actOf(S.ak); if (!a || !a.ids) return; if (confirm('این دانش‌آموز از فعالیت حذف شود؟ (نمره و وضعیتش در این فعالیت هم پاک می‌شود)')) { a.ids = a.ids.filter(x => x !== id); delete a.res[id]; save(); render(true); } },
  actAdd(id) { const a = actOf(S.ak); if (!a || !a.ids) return; if (!a.ids.includes(id)) a.ids.push(id); save(); render(true); toast('به فعالیت اضافه شد'); },
});

/* ================= lottery (قرعه‌کشی) ================= */
const rnd = () => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 4294967296; };
function randInt(n) { if (n <= 1) return 0; const lim = Math.floor(4294967296 / n) * n, a = new Uint32Array(1); do { crypto.getRandomValues(a); } while (a[0] >= lim); return a[0] % n; } // بدون سوگیری
const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = randInt(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const isAbs = v => v === 'a' || v === 'e'; // غایب و غیبت مجاز هر دو «حاضر نیستند»
const todayIso = () => iso(new Date());
function drawInfo() {
  const cid = S.dr.c, rows = db.students.map(s => ({ s, avg: cid ? stuCourseAvg(s.id, cid) : stuAvg(s.id), b: behCount(s.id, db, '', '', cid), t: taskCount(s.id) }));
  const wa = rows.filter(x => x.avg != null).sort((a, b) => a.avg - b.avg), third = Math.max(1, Math.ceil(wa.length / 3));
  const lowSet = new Set(wa.slice(0, third).map(x => x.s.id)), highSet = new Set(wa.slice(-third).map(x => x.s.id));
  rows.forEach(x => {
    const ix = wa.findIndex(y => y.s.id === x.s.id);
    x.low = x.avg != null && (lowSet.has(x.s.id) || x.avg < pass()); x.high = x.avg != null && highSet.has(x.s.id) && x.avg >= pass();
    x.bad = x.b.score < 0; x.good = x.b.score > 0; x.tk = x.t.n > 0;
    const wLow = x.avg == null ? .3 : 1 - (wa.length > 1 ? ix / (wa.length - 1) : .5), wBad = Math.min(1, Math.max(0, -x.b.score) / (6 * bstepVal()));
    x.w = S.dr.graded ? 1 + 6 * Math.max(wLow, wBad) : 1;
  });
  return rows;
}
const CRIT = [['low', 'نمره پایین', 'یک‌سوم ضعیف‌ترِ کلاس یا زیر حد قبولی', '#d64545'], ['high', 'نمره بالا', 'یک‌سوم بالاترِ کلاس', '#1f9d63'], ['bad', 'رفتار نامناسب', 'امتیاز رفتاری منفی', '#e0702d'], ['good', 'رفتار مناسب', 'امتیاز رفتاری مثبت', '#2b9aa8'], ['tk', 'تکلیف انجام‌نشده', 'حداقل یک تکلیف انجام‌نشده', '#8e5bd1']];
const activeCrit = () => CRIT.filter(c => S.dr[c[0]]).map(c => c[0]);
function wsample(pool, k) { const p = shuffle(pool), out = []; while (out.length < k && p.length) { const tot = p.reduce((a, x) => a + x.w, 0); let r = rnd() * tot, i = 0; for (; i < p.length - 1; i++) { r -= p[i].w; if (r < 0) break; } out.push(p.splice(i, 1)[0]); } return out; }
function choose(pool, k) {
  const act = activeCrit(); if (!act.length) return wsample(pool, k);
  const pr = pool.filter(x => act.some(c => x[c])), first = wsample(pr, Math.min(k, pr.length)), ids = new Set(first.map(x => x.s.id));
  return [...first, ...wsample(pool.filter(x => !ids.has(x.s.id)), k - first.length)];
}
function candidates(exclude = new Set()) {
  const day = db.att[todayIso()] || {}; let c = drawInfo().filter(x => !exclude.has(x.s.id));
  if (S.dr.present) c = c.filter(x => !isAbs(day[x.s.id]));
  return c;
}
function drawPick(n, exclude = new Set()) {
  const cand = candidates(exclude), drawn = new Set(db.drawn || []); let note = '';
  let pool = S.dr.norep ? cand.filter(x => !drawn.has(x.s.id)) : cand, picks = choose(pool, Math.min(n, pool.length));
  if (S.dr.norep && picks.length < n && cand.length > picks.length) { // everybody has had a turn: start a new round
    db.drawn = []; note = 'همه یک بار انتخاب شده بودند؛ دور جدید شروع شد.';
    const ids = new Set(picks.map(x => x.s.id)); picks = [...picks, ...choose(cand.filter(x => !ids.has(x.s.id)), Math.min(n - picks.length, cand.length - picks.length))];
  }
  if (picks.length < n) note += (note ? ' ' : '') + `فقط ${fa(picks.length, 0)} نفر قابل انتخاب بود.`;
  const act = activeCrit(); if (act.length && picks.length && !picks.some(x => act.some(c => x[c]))) note += ' کسی با معیارهای اولویت پیدا نشد؛ از بقیه انتخاب شد.';
  picks = shuffle(picks); // ترتیب نمایش هم تصادفی است (اولویت‌دارها اول نیایند)
  db.drawn = [...new Set([...(db.drawn || []), ...picks.map(x => x.s.id)])]; save();
  return { picks, note: note.trim() };
}
const whyTags = x => CRIT.filter(c => S.dr[c[0]] && x[c[0]]).map(c => `<span class="tag" style="background:${c[3]}1a;color:${c[3]}">${c[1]}</span>`).join('');
const metaOf = x => `میانگین ${x.avg == null ? '—' : fa(x.avg)} · رفتار ${sgn(x.b.score)}${x.t.n ? ' · ' + fa(x.t.n, 0) + ' تکلیف ناقص' : ''}`;
const mkLast = (res, keep) => ({ cls: db.id, picks: res.picks.map(x => ({ id: x.s.id, name: x.s.name, why: CRIT.filter(c => S.dr[c[0]] && x[c[0]]).map(c => c[1]) })), note: res.note || '', savedId: keep ? keep.savedId : null, title: keep ? keep.title : '', t: Date.now() });
let DW = null; // پنجره‌ی مستقل نمایش نتیجه
function drawDoc(L) {
  const e = x => String(x ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])), n = L.picks.length;
  const fs = n <= 2 ? 2.6 : n <= 4 ? 2.3 : n <= 8 ? 1.9 : 1.6, minw = n <= 2 ? 26 : n <= 4 ? 22 : n <= 8 ? 18 : 14;
  const cards = L.picks.map((p, i) => { const st = stuOf(p.id); return `<div class="w" style="animation-delay:${i * 220}ms"><span class="n">${fa(i + 1, 0)}</span>${st && st.photo ? `<img src="${st.photo}" alt="">` : `<span class="av" style="background:${colorOf(p.id)}">${e((p.name.trim()[0]) || '؟')}</span>`}<b class="nm">${e(st ? st.name : p.name)}</b></div>`; }).join('');
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>نتیجه قرعه‌کشی — ${e(db.name)}</title><base href="${location.href}">
<style>@font-face{font-family:Vazirmatn;src:url(fonts/Vazirmatn-Regular.ttf);font-weight:400}@font-face{font-family:Vazirmatn;src:url(fonts/Vazirmatn-Bold.ttf);font-weight:700}
*{box-sizing:border-box}html,body{height:100%}body{margin:0;font-family:Vazirmatn,Tahoma,sans-serif;background:radial-gradient(circle at 20% 10%,#e3fafc,#fff5f5 55%,#fff9db);color:#16282d;display:flex;flex-direction:column}
header{padding:18px 30px 0;text-align:center}h1{margin:0;font-size:clamp(17px,2vw,26px)}header p{margin:2px 0 0;color:#5b7279;font-size:clamp(12px,1.1vw,15px)}
.note{color:#e67700;text-align:center;font-size:clamp(14px,1.5vw,20px);padding-top:6px}
main{flex:1;display:flex;flex-wrap:wrap;gap:1.6vmin;align-content:center;justify-content:center;padding:2vmin 3vw}
.w{background:#fff;border-radius:2vmin;box-shadow:0 6px 20px #0b728533;padding:1vmin 1.6vmin;display:flex;align-items:center;gap:2.4vmin;min-width:${minw}vw;max-width:96vw;animation:pop .5s cubic-bezier(.2,1.4,.4,1) both;border:.35vmin solid #0c8599}.w.spin .nm{color:#8aa0a6}.w.spin{border-color:#ffb703}
.n{background:#ffb703;color:#3b2a00;border-radius:50%;width:clamp(26px,${fs * 1.5}vw,38px);height:clamp(26px,${fs * 1.5}vw,38px);display:grid;place-items:center;font-weight:700;font-size:clamp(13px,${fs * .8}vw,20px);flex:none}
.av,.w img{width:clamp(28px,${fs * 1.6}vw,42px);height:clamp(28px,${fs * 1.6}vw,42px);border-radius:50%;object-fit:cover;display:grid;place-items:center;color:#fff;font-weight:700;font-size:clamp(14px,${fs * .9}vw,22px);flex:none}
.nm{font-size:clamp(14px,${fs}vw,24px);line-height:1.3;flex:1}
@keyframes pop{from{opacity:0;transform:scale(.4) rotate(-6deg)}to{opacity:1;transform:none}}
.bar{position:fixed;bottom:12px;left:12px;display:flex;gap:8px;opacity:.35;transition:.2s}.bar:hover{opacity:1}.bar button{border:0;background:#0b7285;color:#fff;border-radius:12px;padding:8px 16px;font:inherit;font-size:15px;cursor:pointer}
@media print{.bar{display:none}}</style></head><body>
<header><h1>🎲 نتیجه قرعه‌کشی — ${fa(n, 0)} نفر</h1><p>کلاس ${e(db.name)}${L.title ? ' · ' + e(L.title) : ''}</p></header>${L.note ? `<div class="note">${e(L.note)}</div>` : ''}
<main>${cards || '<div style="font-size:30px;color:#5b7279">کسی برای انتخاب نبود.</div>'}</main>
<div class="bar"><button id="sv" onclick="saveIt()">📌 ثبت لیست</button><button onclick="document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()">⛶ تمام‌صفحه</button><button onclick="again()">🎲 قرعه‌کشی دوباره</button><button onclick="closeMe()">✕ بستن</button></div>
<script>const ALL=${JSON.stringify(db.students.map(x => x.name))};const SPIN=${L.noSpin ? 'false' : 'true'};function saveIt(){try{H.kelasamDraw.save();var b=document.getElementById('sv');b.textContent='✓ ثبت شد'}catch(e){alert('پنجره اصلی کلاسام بسته شده است')}}
(function(){if(!SPIN||ALL.length<2)return;document.querySelectorAll('.w').forEach(function(w,i){var nm=w.querySelector('.nm'),real=nm.textContent,t0=Date.now(),dur=1100+i*750;w.classList.add('spin');var iv=setInterval(function(){var el=Date.now()-t0;if(el>=dur){clearInterval(iv);nm.textContent=real;w.classList.remove('spin');return}nm.textContent=ALL[Math.floor(Math.random()*ALL.length)]},el_gap(t0,dur))});function el_gap(){return 70}})();
const H=(window.opener&&!window.opener.closed)?window.opener:window.parent;function again(){try{H.kelasamDraw.again()}catch(e){alert('پنجره اصلی کلاسام بسته شده است')}}function closeMe(){if(window.opener)window.close();else{try{H.document.getElementById('dlg').close()}catch(e){}}}</script></body></html>`;
}
function openDrawWindow(onlyRefresh) {
  const L = S.lastDraw; if (!L) return; const html = drawDoc(L);
  if (!CAPP) {
    try {
      let w = DW && !DW.closed ? DW : null;
      if (!w && !onlyRefresh) w = window.open('', 'kelasam-draw', `popup=yes,width=${Math.min(860, screen.availWidth)},height=${Math.min(560, screen.availHeight)}`);
      if (w && w.document) { DW = w; w.document.open(); w.document.write(html); w.document.close(); if (!onlyRefresh) { try { w.focus(); } catch { } toast('نتیجه در پنجره‌ی جدا باز شد؛ می‌توانید آن را به صفحه دوم ببرید و همزمان در این پنجره کار کنید'); } return; }
    } catch { }
  }
  if (onlyRefresh) return;
  const d = $('#dlg'); d.innerHTML = `<form onsubmit="return false" style="padding:0;gap:0"><iframe id="drFr" style="width:100%;height:78vh;border:0;border-radius:18px 18px 0 0"></iframe><div class="row" style="padding:10px 16px"><button type="button" class="btn sec" data-close>بستن</button></div></form>`;
  d.style.width = 'min(1200px,98vw)'; d.querySelector('#drFr').srcdoc = html; d.querySelector('[data-close]').onclick = () => d.close();
  d.onclose = () => { d.style.width = ''; }; if (!d.open) d.showModal();
}
window.kelasamDraw = { again: () => A.drAgain(), save: () => { A.drSave(); } };
function lastDrawCard() {
  const L = S.lastDraw; if (!L || L.cls !== db.id) return '';
  return `<div class="card" style="margin-top:16px;border:2px solid var(--brand)"><div class="top" style="margin-bottom:8px"><div><h3 style="margin:0">${ico('dice')} نتیجه آخرین قرعه‌کشی — ${fa(L.picks.length, 0)} نفر</h3><div class="sub">نتیجه در یک پنجره‌ی مستقل هم نمایش داده می‌شود؛ همان لحظه می‌توانید در همین برنامه (مثلاً صفحه «آزمون‌ها») برای دانش‌آموز نمره بگذارید.</div></div><div class="row noprint"><button class="btn sec sm" data-act="drShow">🖥 نمایش در پنجره جدا / تمام‌صفحه</button><button class="btn sm" data-act="drAgain">🎲 قرعه‌کشی دوباره</button></div></div>
  ${L.note ? `<div class="sub" style="color:var(--warn);margin-bottom:6px">${esc(L.note)}</div>` : ''}
  <div class="drres">${L.picks.map((p, i) => { const st = stuOf(p.id); return `<div class="dwin"><span class="dn">${fa(i + 1, 0)}</span>${st ? avatar(st) : ''}<div class="dnm"><b>${st ? nl(st) : esc(p.name)}</b></div><button type="button" class="btn sec sm noprint" data-act="drSwap" data-id="${p.id}" title="این نفر را با یک نفر دیگر عوض کن">تعویض</button></div>`; }).join('') || '<div class="empty">کسی برای انتخاب نبود.</div>'}</div>
  <div class="row noprint" style="margin-top:12px"><input id="drTitle" placeholder="عنوان لیست (اختیاری؛ مثلاً: سؤال‌پرسی فصل ۳)" value="${esc(L.title)}" style="flex:1;min-width:200px"><button class="btn" style="background:var(--ok)" data-act="drSave">📌 ${L.savedId ? 'به‌روزرسانی لیست ثبت‌شده' : 'ثبت لیست'}</button></div></div>`;
}
document.addEventListener('input', e => { if (e.target.id === 'drTitle' && S.lastDraw) S.lastDraw.title = e.target.value; });
VIEWS.draw = function () {
  const st = S.dr, info = drawInfo(), today = todayIso(), day = db.att[today] || {}, cand = info.filter(x => !(st.present && isAbs(day[x.s.id]))), drawn = (db.drawn || []).filter(id => stuOf(id));
  const cnt = k => cand.filter(x => x[k]).length, ck = (k, t, sub = '') => `<label class="ck"><input type="checkbox" data-dr="${k}" ${st[k] ? 'checked' : ''}><span><b>${t}</b>${sub ? `<small>${sub}</small>` : ''}</span></label>`;
  if (st.n > cand.length) st.n = Math.max(1, cand.length);
  V(head('قرعه‌کشی', 'انتخاب تصادفی دانش‌آموزان برای سؤال پرسیدن یا بررسی کتاب', '') + emptyHint() + `
  <div class="grid g2">
  <div class="card"><h3>تنظیمات</h3>
    <div class="fg"><div class="f">تعداد افراد قرعه‌کشی<div class="stepper"><button type="button" class="btn sec sm" data-act="drStep" data-d="-1">−</button><input type="number" min="1" max="${Math.max(1, cand.length)}" value="${st.n}" data-dr="n"><button type="button" class="btn sec sm" data-act="drStep" data-d="1">+</button></div></div>
    <label class="f">درس (برای معیار نمره و رفتار)<select data-dr="c"><option value="">همه دروس (تجمیع)</option>${db.courses.map(k => `<option value="${k.id}" ${st.c === k.id ? 'selected' : ''}>${esc(k.name)}</option>`).join('')}</select></label></div>
    ${ck('present', 'فقط حاضرین', `غایب‌های امروز (${wd(today)} ${jd(today)}؛ طبق حضور و غیاب) وارد قرعه‌کشی نشوند${db.att[today] ? '' : ' — ⚠️ برای امروز هنوز حضور و غیاب ثبت نشده'}`)}
    ${ck('norep', 'تکرار نشود', 'تا همه یک بار انتخاب نشده‌اند، کسی دوباره انتخاب نشود')}
    <div class="row sub" style="align-items:center">${fa(drawn.length, 0)} نفر از ${fa(db.students.length, 0)} نفر در این دور انتخاب شده‌اند ${drawn.length ? '<button type="button" class="btn sec sm" data-act="drReset">شروع دور جدید</button>' : ''}</div>
  </div>
  <div class="card"><h3>اولویت‌ها <span class="sub">(اختیاری)</span></h3><div class="sub" style="margin:0 0 6px">هر مورد را که تیک بزنید، آن افراد اول وارد قرعه‌کشی می‌شوند؛ اگر تعداد درخواستی بیشتر از آنها بود، بقیه از سایر دانش‌آموزان انتخاب می‌شوند.</div>
    ${CRIT.map(c => ck(c[0], `<span class="dot" style="background:${c[3]}"></span>${c[1]} <span class="pill ${cnt(c[0]) ? 'warn' : ''}">${fa(cnt(c[0]), 0)} نفر</span>`, c[2])).join('')}
    <hr style="border:0;border-top:1px solid var(--line);margin:8px 0">
    ${ck('graded', 'اولویت تدریجی', 'هرچه نمره ضعیف‌تر یا منفی‌های رفتاری بیشتر باشد، شانس انتخاب بیشتر است (تا ۷ برابر)')}
  </div></div>
  <div class="card" style="margin-top:16px;text-align:center"><div class="sub" style="margin-bottom:10px">${fa(cand.length, 0)} نفر در قرعه‌کشی شرکت داده می‌شوند${st.present && cand.length < db.students.length ? ` (${fa(db.students.length - cand.length, 0)} غایب کنار گذاشته شد)` : ''}</div><button class="btn big" data-act="doDraw" ${cand.length ? '' : 'disabled'}>${ico('dice')} قرعه‌کشی ${fa(Math.min(st.n, cand.length), 0)} نفر</button></div>
  ${lastDrawCard()}
  ${drawListsCard()}
  ${drawn.length ? `<div class="card" style="margin-top:16px"><h3>انتخاب‌شده‌ها در این دور</h3><div class="row">${drawn.map(id => `<span class="chip" style="background:#e1f3f5;color:#0f5f6b">${nl(stuOf(id))}</span>`).join('')}</div></div>` : ''}`);
};
function drawListsCard() {
  const L = [...(db.draws || [])].sort((a, b) => b.t - a.t);
  const row = (x, i) => { const dt = new Date(x.t); return `<tr><td>${fa(i + 1, 0)}</td><td style="white-space:nowrap">${x.title ? `<b>${esc(x.title)}</b><br>` : ''}${jd(iso(dt))}<br><small class="sub">ساعت ${fnum(dt.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }))}${x.course ? ' · ' + esc(courseOf(x.course)?.name || '') : ''}</small></td><td><div class="row" style="gap:6px">${x.names.map((n, j) => `<span class="chip" style="background:#e1f3f5;color:#0f5f6b"><b>${fa(j + 1, 0)}.</b> ${stuOf(n.id) ? nl(stuOf(n.id)) : esc(n.name)}</span>`).join('')}</div></td><td class="num noprint" style="white-space:nowrap"><button class="btn sec sm" data-act="drRename" data-id="${x.id}" title="عنوان لیست">عنوان</button> <button class="btn sec sm" data-act="drCopy" data-id="${x.id}" title="کپی اسامی">کپی</button> <button class="btn bad sm" data-act="drDel" data-id="${x.id}">حذف</button></td></tr>`; };
  return `<div class="card" style="margin-top:16px"><div class="top" style="margin-bottom:8px"><div><h3 style="margin:0">📋 لیست‌های ثبت‌شده قرعه‌کشی (${fa(L.length, 0)})</h3><div class="sub">نتیجه قرعه‌کشی‌ها را با «ثبت لیست» اینجا نگه دارید تا اسامی یادتان نرود؛ هر وقت لازم نبود حذف کنید.</div></div>${L.length ? '<button class="btn bad sm noprint" data-act="drDelAll">پاک کردن همه</button>' : ''}</div>
  ${L.length ? `<div class="tw wide" style="max-height:420px"><table><tr><th>#</th><th>عنوان و زمان ثبت</th><th>اسامی قرعه‌کشی‌شده</th><th class="noprint"></th></tr>${L.map(row).join('')}</table></div>` : '<div class="empty">هنوز لیستی ثبت نشده است. بعد از قرعه‌کشی، دکمه «ثبت لیست» را بزنید.</div>'}</div>`;
}
Object.assign(A, {
  drDel(id) { db.draws = db.draws.filter(x => x.id !== id); save(); render(true); toast('لیست حذف شد'); },
  drDelAll() { if (confirm('همه لیست‌های ثبت‌شده قرعه‌کشی پاک شود؟')) { db.draws = []; save(); render(true); } },
  drCopy(id) { const x = db.draws.find(v => v.id === id); if (!x) return; const t = (x.title ? x.title + '\n' : '') + x.names.map((n, j) => `${j + 1}. ${stuOf(n.id)?.name || n.name}`).join('\n'); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('اسامی کپی شد'), () => toast('کپی انجام نشد')); },
});
document.addEventListener('change', e => {
  const k = e.target.dataset && e.target.dataset.dr; if (!k || S.view !== 'draw') return;
  S.dr[k] = e.target.type === 'checkbox' ? e.target.checked : k === 'n' ? Math.max(1, Math.min(99, Math.floor(+e.target.value) || 1)) : e.target.value; render(true);
});
const attDays = () => Object.keys(db.att).filter(d => db.att[d] && Object.values(db.att[d]).some(Boolean)).sort();
Object.assign(A, {
  attPrev() { const p = attDays().filter(x => x < S.date).pop(); if (!p) return toast('روز ثبت‌شده‌ی قبلی وجود ندارد'); S.date = p; render(true); },
  attNext() { const n = attDays().find(x => x > S.date); if (!n) return toast('روز ثبت‌شده‌ی بعدی وجود ندارد'); S.date = n; render(true); },
  errCopy() { const t = `kelasam ${VERSION} · ${SERVER ? 'ویندوز' : CAPP ? 'اندروید' : 'وب'} · ${navigator.userAgent}\n` + ERRLOG.map(x => new Date(x.t).toLocaleString('fa-IR') + '  ' + x.m).join('\n'); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('گزارش کپی شد'), () => prompt('این متن را برای پشتیبانی بفرستید:', t)); },
  drStep(_, el) { S.dr.n = Math.max(1, Math.min(99, S.dr.n + (+el.dataset.d))); render(true); },
  drReset() { db.drawn = []; save(); render(true); toast('دور جدید شروع شد'); },
  doDraw() { if (!db.students.length) return; S.lastDraw = mkLast(drawPick(S.dr.n)); openDrawWindow(); render(true); },
  drAgain() { const L = S.lastDraw; if (L && L.cls === db.id) { const ids = L.picks.map(p => p.id); db.drawn = (db.drawn || []).filter(id => !ids.includes(id)); } if (!db.students.length) return; S.lastDraw = mkLast(drawPick(S.dr.n), L && L.cls === db.id ? { savedId: null, title: L.title } : null); openDrawWindow(); render(true); },
  drShow() { openDrawWindow(); },
  drSwap(id) {
    const L = S.lastDraw; if (!L) return; const cur = L.picks.map(p => p.id); db.drawn = (db.drawn || []).filter(x => x !== id);
    const r = drawPick(1, new Set(cur)); if (!r.picks.length) { save(); return toast('نفر دیگری برای جایگزینی نیست'); }
    const np = mkLast(r).picks[0]; L.picks = L.picks.map(p => p.id === id ? np : p); L.note = ''; openDrawWindow(true); render(true);
  },
  drSave() { const L = S.lastDraw; if (!L || !L.picks.length) return; const old = L.savedId && db.draws.find(x => x.id === L.savedId); const rec = { id: L.savedId || uid(), t: old ? old.t : Date.now(), course: S.dr.c, title: (L.title || '').trim(), names: L.picks.map(p => ({ id: p.id, name: p.name })) }; if (old) Object.assign(old, rec); else db.draws.push(rec); L.savedId = rec.id; save(); render(true); toast('لیست قرعه‌کشی ثبت شد'); },
  drRename(id) { const x = db.draws.find(v => v.id === id); if (!x) return; const t = prompt('عنوان این لیست:', x.title || ''); if (t == null) return; x.title = t.trim(); save(); render(true); },
});

/* ================= keyboard (attendance & tasks) ================= */
const kbHint = (v, scored) => `<div class="kbhint noprint">⌨️ با کیبورد: <kbd>↑</kbd><kbd>↓</kbd> جابه‌جایی بین دانش‌آموزان · ${v === 'att' ? '<kbd>۱</kbd> حاضر · <kbd>۲</kbd> غایب · <kbd>۳</kbd> تأخیر · <kbd>۴</kbd> مجاز · <kbd>Space</kbd> / <kbd>Enter</kbd> حاضر' : '<kbd>۱</kbd> انجام شد · <kbd>۲</kbd> انجام نشد · <kbd>Space</kbd> / <kbd>Enter</kbd> انجام شد'} (و رفتن به نفر بعد) · <kbd>Delete</kbd> پاک کردن${scored ? ' · <kbd>۳</kbd> رفتن به کادر نمره (داخل کادر: <kbd>↑</kbd><kbd>↓</kbd> یا <kbd>Enter</kbd> = نمره نفر بعد/قبل، <kbd>Esc</kbd> = خروج)' : ''}</div>`;
/* keep the active row near the middle of the visible area (never glued to the bottom edge) */
function centerRow(row, dir = 0) {
  if (!row) return;
  const box = row.closest('.tw'), can = box && box.scrollHeight > box.clientHeight + 2;
  if (can) {
    const r = row.getBoundingClientRect(), b = box.getBoundingClientRect(), mid = r.top - b.top + r.height / 2, f = mid / b.height;
    if (f < .05 || f > .95 || (dir > 0 && f > .5) || (dir < 0 && f < .5)) box.scrollTop += mid - b.height / 2;
  }
  const r = row.getBoundingClientRect(), vh = window.innerHeight - (matchMedia('(max-width:760px)').matches ? 64 : 0), mid = r.top + r.height / 2, f = mid / vh;
  if (f < .12 || f > .88 || (!can && ((dir > 0 && f > .55) || (dir < 0 && f < .45)))) scBy(mid - vh / 2);
}
function scrollRow(dir = 0) { centerRow(document.querySelector('tr.kr'), dir); }
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
  if (S.view !== 'att' && S.view !== 'tasks' && S.view !== 'acts') return;
  if (document.querySelector('dialog[open]') || !db || !db.students.length) return;
  const tg = e.target.tagName; if (/^(INPUT|TEXTAREA|SELECT)$/.test(tg)) return;
  if (S.view !== 'att' && !curRec()) return;
  const L = vis(), n = L.length; if (!n) return;
  const dm = /^(?:Digit|Numpad)([0-9])$/.exec(e.code); let k = dm ? dm[1] : e.key; k = String(k).toLowerCase();
  const att = S.view === 'att', scored = !att && curRec().max > 0;
  const MAP = att ? { 1: 'p', 2: 'a', 3: 'l', 4: 'e', 'ح': 'p', 'غ': 'a', 'ت': 'l', 'م': 'e', p: 'p', a: 'a', l: 'l', e: 'e' } : { 1: 'y', 2: 'n', y: 'y', n: 'n', 'ب': 'y', 'ن': 'n' };
  const goScore = scored && k === '3';
  const isAct = k in MAP || goScore || e.key === ' ' || e.key === 'Enter' || e.key === 'Delete' || e.key === 'Backspace';
  const isNav = ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key);
  if (!isAct && !isNav) return;
  if (tg === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) return;
  e.preventDefault();
  let i = S.kon ? Math.min(S.kr ?? 0, n - 1) : 0, dir = 0;
  if (!S.kon) { S.kon = true; S.kr = 0; if (isNav) { render(true); return scrollRow(0); } }
  if (goScore) { const inp = [...document.querySelectorAll('input.tsc')][i]; if (inp) { inp.focus(); inp.select(); centerRow(inp.closest('tr'), 0); } return; }
  if (e.key === 'ArrowDown') { i = Math.min(n - 1, i + 1); dir = 1; } else if (e.key === 'ArrowUp') { i = Math.max(0, i - 1); dir = -1; } else if (e.key === 'Home') i = 0; else if (e.key === 'End') i = n - 1;
  else {
    const sid = L[i].id, adv = () => Math.min(n - 1, i + 1);
    if (e.key === 'Delete' || e.key === 'Backspace') { if (att) { if (db.att[S.date]) delete db.att[S.date][sid]; save(); } else setTk(sid, null); }
    else { const st = (e.key === ' ' || e.key === 'Enter') ? (att ? 'p' : 'y') : MAP[k]; if (att) { (db.att[S.date] ??= {})[sid] = st; save(); } else setTk(sid, st, false); i = adv(); dir = 1; }
  }
  S.kr = i; render(true); scrollRow(dir);
});
/* score boxes (tasks & exams): ↑ ↓ / Enter jump to the previous/next student's box instead of changing the number */
document.addEventListener('keydown', e => {
  const i = e.target; if (!i.matches || !i.matches('input.tsc, input.sc')) return;
  const cls = i.classList.contains('tsc') ? 'tsc' : 'sc', all = [...document.querySelectorAll('input.' + cls)], idx = all.indexOf(i);
  if (e.key === 'Escape') { e.preventDefault(); i.blur(); if (cls === 'tsc') { S.kon = true; S.kr = idx; render(true); scrollRow(0); } return; }
  const dn = e.key === 'ArrowDown' || (e.key === 'Enter' && !e.shiftKey), up = e.key === 'ArrowUp' || (e.key === 'Enter' && e.shiftKey);
  if (!dn && !up) return;
  e.preventDefault();
  const nx = all[idx + (dn ? 1 : -1)];
  if (!nx) { if (e.key === 'Enter') i.blur(); return; }
  nx.focus(); nx.select(); centerRow(nx.closest('tr'), dn ? 1 : -1);
});
document.addEventListener('focusin', e => {
  const i = e.target; if (!i.matches || !i.matches('input.tsc, input.sc')) return;
  document.querySelectorAll('tr.kr').forEach(x => x.classList.remove('kr')); i.closest('tr').classList.add('kr');
  if (i.classList.contains('tsc')) { S.kon = true; S.kr = [...document.querySelectorAll('input.tsc')].indexOf(i); }
});

/* ================= about ================= */
const VERSION = '2.5';
/* ---- گزارش پایداری: خطاهای برنامه و «بسته‌شدن ناگهانی» (اندروید) ثبت می‌شود تا علت قابل پیگیری باشد ---- */
const RUN = { t: Date.now(), hb: Date.now(), state: 'fg' }, ERRLOG = [];
const runSave = () => { try { KV.set('run', JSON.stringify(RUN)); } catch { } };
let errT = null;
function logErr(m) { m = String(m || '').slice(0, 300); const l = ERRLOG[ERRLOG.length - 1]; if (l && l.m === m) return; ERRLOG.push({ t: Date.now(), m }); while (ERRLOG.length > 30) ERRLOG.shift(); clearTimeout(errT); errT = setTimeout(() => { try { KV.set('errlog', JSON.stringify(ERRLOG)); } catch { } }, 1500); }
addEventListener('error', e => logErr((e.message || 'خطا') + ' @' + String(e.filename || '').split('/').pop() + ':' + (e.lineno || '')));
addEventListener('unhandledrejection', e => logErr('Promise: ' + ((e.reason && (e.reason.message || e.reason.msg)) || e.reason)));
async function stabilityBoot() {
  try {
    const old = JSON.parse(await KV.get('errlog') || '[]'); if (Array.isArray(old)) ERRLOG.unshift(...old);
    if (CAPP) {
      const prev = JSON.parse(await KV.get('run') || 'null');
      if (prev && prev.state === 'fg') ERRLOG.push({ t: prev.hb, m: '⚠️ برنامه در حالت باز ناگهان بسته شد (آخرین نشانه‌ی فعالیت همین زمان بود)' });
    }
  } catch { }
  if (!CAPP) return;
  RUN.state = 'fg'; runSave();
  setInterval(() => { if (!document.hidden) { RUN.hb = Date.now(); runSave(); } }, 15000);
  document.addEventListener('visibilitychange', () => { RUN.state = document.hidden ? 'bg' : 'fg'; RUN.hb = Date.now(); runSave(); });
  addEventListener('pagehide', () => { RUN.state = 'bg'; runSave(); });
}
function androidBoot() { // دکمه بازگشت: به‌جای بستن یک‌باره‌ی برنامه، اول به صفحه قبل برمی‌گردد و برای خروج دو بار می‌خواهد
  const AP = window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.App; if (!CAPP || !AP) return;
  let last = 0;
  AP.addListener('backButton', () => {
    const d = document.querySelector('dialog[open]'); if (d) { d.close(); return; }
    if (S.view !== 'home') { S.view = 'home'; render(); return; }
    if (Date.now() - last < 2200) { AP.exitApp(); return; }
    last = Date.now(); toast('برای خروج، یک بار دیگر «بازگشت» را بزنید');
  });
  AP.addListener('pause', () => { RUN.state = 'bg'; runSave(); try { persist(); } catch { } });
  AP.addListener('resume', () => { RUN.state = 'fg'; RUN.hb = Date.now(); runSave(); });
}
VIEWS.about = function () {
  const link = (t, u) => `<a class="ext" data-ext href="${u}" target="_blank" rel="noopener noreferrer"><b>${t}</b><span dir="ltr">${u}</span></a>`;
  V(`<div class="card about"><img src="icon-192.png" alt="kelasam" width="96" height="96"><h1>kelasam</h1><div class="sub">نسخه ${fnum(VERSION)}</div>
  <h2>تیم برنامه نویسی کلاسام</h2><p class="lead">در خدمت دبیران عزیز کشور</p>
  <div class="notice"><p>لطفا بدون اطلاع و اجازه ناشر برنامه را منتشر نکنید</p><p>از نشر بدون اجازه و بدون پرداخت وجه آن رضایت نداریم</p></div>
  <p class="lead">کلاسام وابسته به صفحه دبیران</p>
  <h3>آدرس صفحات ما:</h3><div class="links">${link('وب‌سایت', 'https://www.dabiran7.ir')}${link('تلگرام', 'https://t.me/Dabiran7')}${link('ایتا', 'https://eitaa.com/dabiran7')}${link('اینستاگرام', 'https://www.instagram.com/dabiran7')}</div>
  <details class="sub" style="margin-top:16px;text-align:start"><summary style="cursor:pointer">🩺 گزارش پایداری (برای پشتیبانی)</summary><div style="margin-top:8px">${ERRLOG.length ? ERRLOG.slice(-15).reverse().map(x => `<div style="border-top:1px solid var(--line);padding:4px 0"><small>${when(x.t)}</small><br>${esc(x.m)}</div>`).join('') : 'موردی ثبت نشده است.'}<div class="row" style="margin-top:8px"><button type="button" class="btn sec sm" data-act="errCopy">کپی گزارش</button></div></div></details></div>`);
};
document.addEventListener('click', e => { const a = e.target.closest('a[data-ext]'); if (a && CAPP) { e.preventDefault(); Capacitor.Plugins.Browser.open({ url: a.href }).catch(() => window.open(a.href, '_system')); return; } if (a && SERVER) { e.preventDefault(); fetch('api/openurl?u=' + encodeURIComponent(a.href), { method: 'POST' }).catch(() => {}); } });

/* ================= automatic snapshots & backups ================= */
const SNAP_KEEP = 20, SNAP_EVERY = 6 * 36e5, DAY = 864e5;
const hasData = r => !!r && r.classes.some(c => c.students.length || c.exams.length || c.tasks.length || (c.acts || []).length);
const idbTx = (mode, fn) => idb().then(d => new Promise((res, rej) => { const tx = d.transaction('kv', mode), r = fn(tx.objectStore('kv')); tx.oncomplete = () => res(r && r.result); tx.onerror = tx.onabort = () => rej(tx.error); }));
const snapKeys = async () => ((await idbTx('readonly', st => st.getAllKeys())) || []).filter(k => String(k).startsWith('snap:')).sort();
/* Android: نسخه‌ها فایل‌اند داخل حافظه خود برنامه (kelasam/backups)، نه حافظه مرورگر. مرورگر معمولی: IndexedDB */
const SDIR = 'kelasam/backups', SIDX = SDIR + '/index.json';
const fsRead = path => FS.readFile({ path, directory: 'DATA', encoding: 'utf8' }).then(r => r.data);
const fsWrite = (path, data) => FS.writeFile({ path, data, directory: 'DATA', encoding: 'utf8', recursive: true });
const snapStore = {
  async list() { // [{k,t,label,cls,n}] جدیدترین اول
    if (CAPP) { try { return JSON.parse(await fsRead(SIDX)).sort((a, b) => b.t - a.t); } catch { return []; } }
    const out = []; for (const k of (await snapKeys()).reverse()) { try { const v = JSON.parse(await idbTx('readonly', st => st.get(k))); out.push({ k, t: v.t, label: v.label, n: v.n, cls: v.cls }); } catch { } } return out;
  },
  async get(k) { return JSON.parse(CAPP ? await fsRead(SDIR + '/' + k) : await idbTx('readonly', st => st.get(k))); },
  async put(rec) {
    if (CAPP) {
      const k = 'snap-' + rec.t + '.json'; await fsWrite(SDIR + '/' + k, JSON.stringify(rec));
      let idx = []; try { idx = JSON.parse(await fsRead(SIDX)); } catch { }
      idx.push({ k, t: rec.t, label: rec.label, cls: rec.cls, n: rec.n }); idx.sort((a, b) => b.t - a.t);
      const drop = idx.splice(SNAP_KEEP); for (const x of drop) { try { await FS.deleteFile({ path: SDIR + '/' + x.k, directory: 'DATA' }); } catch { } }
      await fsWrite(SIDX, JSON.stringify(idx)); return;
    }
    await idbTx('readwrite', st => st.put(JSON.stringify(rec), 'snap:' + new Date(rec.t).toISOString()));
    const all = await snapKeys(); if (all.length > SNAP_KEEP) await idbTx('readwrite', st => { all.slice(0, all.length - SNAP_KEEP).forEach(k => st.delete(k)); });
  }
};
async function migrateIdbSnaps() { // نسخه‌های قدیمیِ داخل مرورگر (نسخه‌های قبلی برنامه) را به فایل‌های برنامه منتقل کن
  try {
    const keys = await snapKeys(); if (!keys.length) return;
    for (const k of keys) { const v = JSON.parse(await idbTx('readonly', st => st.get(k))); await snapStore.put(v); await idbTx('readwrite', st => st.delete(k)); }
  } catch { }
}
async function snapNow(label, manual) {
  if (SERVER) { // فایل پشتیبان واقعی کنار برنامه (KelasamData\backups)
    if (!hasData(R)) return null;
    const body = JSON.stringify(R); // همین لحظه، قبل از هر تغییر بعدی
    try { return await fetch('api/snapshot', { method: 'POST', body }).then(r => r.json()); } catch { return null; }
  }
  if (!hasData(R)) return;
  const data = JSON.stringify(R), rec = { t: Date.now(), label, cls: R.classes.length, n: R.classes.reduce((a, c) => a + c.students.length, 0), data };
  try {
    const l = await snapStore.list();
    if (l.length) { const last = await snapStore.get(l[0].k); if (last.data === data) { localStorage.setItem(KEY + '-snapT', Date.now()); return; } }
    await snapStore.put(rec);
    localStorage.setItem(KEY + '-snapT', Date.now());
  } catch { }
}
const autoSnap = () => { if (SERVER) return snapNow('خودکار');
   if (Date.now() - (+localStorage.getItem(KEY + '-snapT') || 0) > SNAP_EVERY) snapNow('خودکار'); };
const when = t => fnum(new Date(t).toLocaleString('fa-IR-u-ca-persian', { dateStyle: 'medium', timeStyle: 'short' }));
async function saveAs(name, data, mime, desc) { // پنجره «ذخیره به‌عنوان» برای انتخاب محل فایل
  const blob = data instanceof Blob ? data : new Blob([data], { type: mime }), ext = '.' + name.split('.').pop();
  if (window.showSaveFilePicker) {
    try { const h = await showSaveFilePicker({ suggestedName: name, types: [{ description: desc, accept: { [mime]: [ext] } }] }); const w = await h.createWritable(); await w.write(blob); await w.close(); return { ok: true, name: h.name }; }
    catch (e) { if (e && e.name === 'AbortError') return { cancel: true }; }
  }
  if (SERVER) { try { const j = await fetch('api/savefile?name=' + encodeURIComponent(name), { method: 'POST', body: blob }).then(r => r.json()); if (j.ok) return { ok: true, name: j.path }; if (j.cancel) return { cancel: true }; } catch { } }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); return { ok: true, name, dl: true };
}
async function backupFile() {
  const name = 'kelasam-backup-' + iso(new Date()) + '.json', text = JSON.stringify(R);
  if (CAPP) { try { await FS.writeFile({ path: 'backup/' + name, data: text, directory: 'CACHE', encoding: 'utf8', recursive: true }); const u = await FS.getUri({ path: 'backup/' + name, directory: 'CACHE' }); await Capacitor.Plugins.Share.share({ title: 'پشتیبان kelasam', url: u.uri, dialogTitle: 'ذخیره پشتیبان: محل (فایل‌ها / درایو / …) را انتخاب کنید' }); localStorage.setItem(KEY + '-bk', Date.now()); toast('پشتیبان آماده شد'); return; } catch (e) { if (e && /cancel/i.test(String(e.message || e))) return; } }
  try { const f = new File([text], name, { type: 'application/json' }); if (/android|iphone|ipad/i.test(navigator.userAgent) && navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: 'پشتیبان kelasam' }); localStorage.setItem(KEY + '-bk', Date.now()); toast('پشتیبان آماده شد'); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  const r = await saveAs(name, text, 'application/json', 'فایل پشتیبان kelasam'); if (r.cancel) return;
  localStorage.setItem(KEY + '-bk', Date.now()); toast(r.dl ? 'فایل پشتیبان دانلود شد' : 'پشتیبان ذخیره شد: ' + r.name);
}
function bkDays() { const v = localStorage.getItem(KEY + '-bkd'); return v == null ? 7 : +v; }
function bkDue() {
  if (SERVER || !hasData(R) || !bkDays()) return false;
  if (!localStorage.getItem(KEY + '-first')) localStorage.setItem(KEY + '-first', Date.now());
  const last = Math.max(+localStorage.getItem(KEY + '-bk') || 0, +localStorage.getItem(KEY + '-first') || 0, +localStorage.getItem(KEY + '-snz') || 0);
  return Date.now() - last > bkDays() * DAY;
}
function bkBanner() {
  if (!bkDue()) return '';
  const last = +localStorage.getItem(KEY + '-bk') || 0;
  return `<div class="card noprint" style="margin-bottom:14px;border-color:#f6d98a;background:#fffaf0"><div class="row" style="justify-content:space-between"><div><b>💾 وقت پشتیبان‌گیری است</b><div class="sub">${last ? 'آخرین فایل پشتیبان: ' + when(last) : 'هنوز فایل پشتیبان نگرفته‌اید'}. فایل را در تلگرام/ایمیل برای خودتان بفرستید تا اگر گوشی عوض شد یا اطلاعات مرورگر پاک شد، اطلاعات از بین نرود.</div></div><div class="row"><button class="btn sm" data-act="bkNow">پشتیبان‌گیری</button><button class="btn sec sm" data-act="bkLater">بعداً</button></div></div></div>`;
}
Object.assign(A, {
  bkNow() { backupFile().then(() => render(true)); },
  bkLater() { localStorage.setItem(KEY + '-snz', Date.now() - (bkDays() - 1) * DAY); render(true); },
});
async function restoreText(text, label) {
  let d; try { d = migrate(JSON.parse(text)); if (!d) throw 0; } catch { return alert('این نسخه معتبر نیست.'); }
  if (!confirm('اطلاعات فعلی با این نسخه جایگزین شود؟\n(از وضعیت فعلی هم یک نسخه خودکار نگه داشته می‌شود.)')) return;
  await snapNow('قبل از بازگردانی'); R = d; db = null; S.view = 'home'; save(); render(); $('#dlg').close(); toast('بازگردانی انجام شد' + (label ? ' — ' + label : ''));
}
async function backupsDialog() {
  const d = $('#dlg'); let snaps = [], files = [];
  try { snaps = await snapStore.list(); } catch { }
  if (SERVER) { try { files = await fetch('api/backups', { cache: 'no-store' }).then(r => r.json()); } catch { } }
  const row = (id, kind, t, txt) => `<div class="li" style="border-top:1px solid var(--line);padding:6px 0"><span>${when(t)}<br><small class="sub">${txt}</small></span><button type="button" class="btn sm" data-rs="${kind}" data-id="${esc(id)}">بازگردانی</button></div>`;
  d.innerHTML = `<form><h3>🕘 پشتیبان‌های خودکار</h3>
  ${SERVER ? `<p class="sub" style="margin:0">همه‌چیز در فایل‌های کنار برنامه ذخیره می‌شود، نه داخل مرورگر. اطلاعات اصلی روی همین کامپیوتر ذخیره می‌شود: <b dir="ltr">${esc((SINFO && SINFO.dir) || 'C:\\kelasamdb')}\\class-data.json</b><br>پشتیبان‌های خودکار کنار فایل برنامه (مثلاً روی فلش) هستند: <b dir="ltr">${esc((SINFO && SINFO.bkdir) || 'KelasamData\\backups')}</b> — هر ۳ ساعت (در صورت تغییر)، هنگام بستن برنامه، قبل از همگام‌سازی و با دکمه زیر. (۳ روز اخیر کامل، برای روزهای قدیمی‌تر روزی یک نسخه، تا ۹۰ روز).</p><div class="row"><button type="button" class="btn sec sm" data-open>📂 باز کردن پوشه پشتیبان‌ها</button></div><div style="max-height:200px;overflow:auto">${files.map(f => row(f.name, 'f', f.mod * 1000, 'فایل ' + esc(f.name))).join('') || '<div class="empty">هنوز پشتیبانی ساخته نشده</div>'}</div>`
  : `<p class="sub" style="margin:0">برنامه هر ۶ ساعت (و قبل از حذف‌ها، همگام‌سازی و بازگردانی‌ها) یک نسخه نگه می‌دارد. اگر اشتباهی چیزی را پاک کردید از اینجا برگردانید. ${CAPP ? 'این نسخه‌ها به‌صورت <b>فایل در حافظه خود برنامه</b> ذخیره می‌شوند (نه حافظه مرورگر)؛ با پاک‌کردن اطلاعات برنامه یا حذف برنامه از بین می‌روند، پس با دکمه «ذخیره» فایل پشتیبان هم بگیرید.' : 'اگر اطلاعات مرورگر کلاً پاک شود، این نسخه‌ها هم پاک می‌شوند؛ پس با دکمه «ذخیره» فایل پشتیبان هم بگیرید.'}</p>
  <label class="f">یادآوری پشتیبان‌گیری فایل<select id="bkd">${[[3, 'هر ۳ روز'], [7, 'هر هفته'], [14, 'هر ۲ هفته'], [0, 'یادآوری نشود']].map(([v, t]) => `<option value="${v}" ${bkDays() === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label>`}
  ${SERVER && !snaps.length ? '' : `<h4 style="margin:6px 0 0">${SERVER ? 'نسخه‌های قدیمیِ داخل مرورگر (فقط برای بازگردانی)' : CAPP ? 'نسخه‌های ذخیره‌شده در حافظه برنامه' : 'نسخه‌های داخل مرورگر'} (${fa(snaps.length, 0)})</h4><div style="max-height:240px;overflow:auto">${snaps.map(x => row(x.k, 's', x.t, `${esc(x.label)} · ${fa(x.cls, 0)} کلاس · ${fa(x.n, 0)} دانش‌آموز`)).join('') || '<div class="empty">هنوز نسخه‌ای نیست</div>'}</div>`}
  <div class="row"><button type="button" class="btn" data-snap>${SERVER ? 'همین الان یک نسخه در پوشه پشتیبان‌ها بساز' : 'همین الان یک نسخه بساز'}</button><button type="button" class="btn sec" data-close>بستن</button></div></form>`;
  d.querySelector('[data-close]').onclick = () => d.close();
  d.querySelector('[data-snap]').onclick = async () => { const r = await snapNow('دستی', true); await backupsDialog(); toast(SERVER ? (r && r.created ? 'نسخه در پوشه پشتیبان‌ها ساخته شد: ' + r.name : r ? 'تغییری از آخرین نسخه نبود؛ همان نسخه آخر کامل است' : 'ساخت نسخه انجام نشد!') : 'نسخه ساخته شد'); };
  const o = d.querySelector('[data-open]'); if (o) o.onclick = () => fetch('api/openbackups', { method: 'POST' });
  const b = d.querySelector('#bkd'); if (b) b.onchange = () => localStorage.setItem(KEY + '-bkd', b.value);
  d.querySelectorAll('[data-rs]').forEach(btn => btn.onclick = async () => {
    if (btn.dataset.rs === 's') { const v = await snapStore.get(btn.dataset.id); restoreText(v.data, when(v.t)); }
    else restoreText(await fetch('api/backup?name=' + encodeURIComponent(btn.dataset.id)).then(r => r.text()), btn.dataset.id);
  });
  if (!d.open) d.showModal();
}

/* ================= tools ================= */
async function nativeOut(name, data, isB64) {
  const o = { path: 'out/' + name, data, directory: 'CACHE', recursive: true }; if (!isB64) o.encoding = 'utf8';
  await FS.writeFile(o); const u = await FS.getUri({ path: 'out/' + name, directory: 'CACHE' });
  await Capacitor.Plugins.Share.share({ title: name, url: u.uri, dialogTitle: 'ذخیره یا ارسال فایل' });
}
const xlsxOut = (wb, name) => { if (!CAPP) return saveAs(name, XLSX.write(wb, { bookType: 'xlsx', type: 'array' }), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'فایل اکسل').then(r => { if (!r.cancel) toast(r.dl ? 'فایل اکسل دانلود شد' : 'فایل اکسل ذخیره شد: ' + r.name); }); return nativeOut(name, XLSX.write(wb, { bookType: 'xlsx', type: 'base64' }), true).catch(e => { if (!/cancel/i.test(String(e && e.message || e))) toast('ساخت فایل انجام نشد'); }); };
function download(name, text, type) { if (CAPP) { nativeOut(name, text, false).catch(() => {}); return; } const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); }
$('#menuBtn').innerHTML = ico('menu') + ' منو';
[['bInstall', 'download'], ['bExportCls', 'table'], ['bExportAll', 'layers'], ['bExport', 'save'], ['bAuto', 'clock'], ['bImport', 'folder'], ['bSync', 'sync'], ['bAbout', 'info']].forEach(([id, n]) => { const e = $('#' + id + ' .ic'); if (e) e.innerHTML = ico(n); });
$('#bExport').onclick = () => backupFile();
$('#bUndo').onclick = () => histGo(-1); $('#bRedo').onclick = () => histGo(1);
$('#bAuto').onclick = () => backupsDialog();
$('#bImport').onclick = () => $('#fImport').click();
$('#fImport').onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { try { const d = migrate(JSON.parse(t)); if (!d) throw 0; snapNow('قبل از بازیابی فایل'); R = d; db = null; S.view = 'home'; save(); render(); toast('بازیابی انجام شد'); } catch { alert('این فایل پشتیبان معتبر نیست.'); } }); e.target.value = ''; };
$('#bExportCls').onclick = () => db && exportXlsx([db], true);
$('#bExportAll').onclick = () => exportXlsx(R.classes, false);
$('#bSync').onclick = () => syncDialog();

/* ================= boot ================= */
let deferred; addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; const bi = $('#bInstall'); if (bi) bi.hidden = false; });
if ($('#bInstall')) $('#bInstall').onclick = async () => { if (deferred) { deferred.prompt(); deferred = null; $('#bInstall').hidden = true; } };
if ($('#bInstall') && /iphone|ipad/i.test(navigator.userAgent) && !navigator.standalone) { $('#bInstall').hidden = false; $('#bInstall').onclick = () => alert('در سافاری دکمه «اشتراک‌گذاری» را بزنید و «Add to Home Screen» را انتخاب کنید.'); }
(async () => {
  try {
    const r = await fetch('api/data', { cache: 'no-store' });
    if (r.ok && r.headers.get('X-Class-Server') === '1') {
      SERVER = true; VER = r.headers.get('X-Ver') || '0'; const j = migrate(await r.json());
      R = j || emptyRoot(); fresh = !j; // the file next to the exe is the only source of truth
      try { localStorage.removeItem(KEY); } catch { }
      addEventListener('focus', () => { flushServer().then(() => pullServer(false)); });
      document.addEventListener('visibilitychange', () => { if (!document.hidden) flushServer().then(() => pullServer(false)); });
      addEventListener('pagehide', e => { if (!e.persisted) navigator.sendBeacon('api/bye'); });
      $('#side .tools').insertAdjacentHTML('beforebegin', '<div id="saveSt" class="savest ok"></div>'); showSave();
      fetch('api/info', { cache: 'no-store' }).then(r => r.json()).then(i => { SINFO = i; saveInfo.t = i.mod ? i.mod * 1000 : 0; showSave(); if (i.fallback) setTimeout(() => alert('توجه: پوشه کنار برنامه (فلش) قابل نوشتن نیست و اطلاعات روی همین کامپیوتر ذخیره می‌شود:\n' + i.dir + '\n\nبرای ذخیره روی فلش، قفل نوشتن فلش را بررسی کنید یا برنامه را در پوشه‌ای که قابل نوشتن است اجرا کنید.'), 800); }).catch(() => {});
      setInterval(pingServer, 10000); document.addEventListener('visibilitychange', () => { if (!document.hidden) pingServer(); }); addEventListener('online', pingServer);
    }
  } catch { }
  if (CAPP) {
    $('#bInstall').remove(); migrateIdbSnaps();
    const t = await readFile();
    if (t) { try { const j = migrate(JSON.parse(t)); if (j) { R = j; fresh = false; } } catch { } }
    else if (!fresh) pushFile(JSON.stringify(R));
    else { const s = await idbGet(); if (s) { try { const j = migrate(JSON.parse(s)); if (j) { R = j; pushFile(s); } } catch { } } }
  } else if (!SERVER) {
    if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
    if (fresh) { const s = await idbGet(); if (s) { try { const j = migrate(JSON.parse(s)); if (j) R = j; } catch { } } }
  } else $('#bInstall').remove();
  { let ch = false; R.classes.forEach(c => { ch = syncAbsent(c) || ch; }); if (ch) persist(); }
  histInit(); render(); histUI(); syncBoot(); stabilityBoot(); androidBoot();
  setTimeout(autoSnap, 4000); setInterval(autoSnap, 30 * 60e3);
})();
