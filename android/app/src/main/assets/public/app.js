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
const pt = k => BEH[k].p ? sgn(BEH[k].p) : 'بدون امتیاز';
const chipStyle = t => `background:${BEH[t].bg};color:${BEH[t].fg};${BEH[t].bd ? 'border:1px solid ' + BEH[t].bd : ''}`;
const sgn = n => (n > 0 ? '+' : n < 0 ? '−' : '') + fa(Math.abs(n), 0);
const behPill = t => `<span class="pill" style="${chipStyle(t)}">${BEH[t].t} (${pt(t)})</span>`;

/* ================= data model =================
 root = { v:2, meta:{school,teacher,year,pass}, classes:[ {id,name,grade,students,courses,exams,att,beh} ] } */
const KEY = 'class-office-v1';
const emptyRoot = () => ({ v: 2, meta: { school: '', teacher: '', year: '', pass: 10 }, classes: [] });
const newClass = (name, grade = '') => ({ id: uid(), name, grade, students: [], courses: [], exams: [], att: {}, beh: [], tasks: [] });
function migrate(d) {
  if (!d || typeof d !== 'object') return null;
  if (Array.isArray(d.classes)) {
    d.meta = Object.assign({ school: '', teacher: '', year: '', pass: 10 }, d.meta);
    d.classes.forEach(c => { c.students ??= []; c.courses ??= []; c.exams ??= []; c.att ??= {}; c.beh ??= []; c.tasks ??= []; c.grade ??= ''; });
    return d;
  }
  if (Array.isArray(d.students)) { // old single-class backup
    const m = d.meta || {};
    const c = { id: uid(), name: m.cls || 'کلاس من', grade: m.grade || '', students: d.students, courses: d.courses || [], exams: d.exams || [], att: d.att || {}, beh: [], tasks: [] };
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
    return { id: uid(), name, grade, students, courses, exams, att, beh, tasks };
  };
  const n1 = [['محراب', 'رضایی'], ['محمد', 'احمدی'], ['سینا', 'کریمی'], ['مهبد', 'حسینی'], ['آرین', 'موسوی'], ['امیرعلی', 'صادقی'], ['پارسا', 'نوری'], ['رضا', 'جعفری'], ['کیان', 'محمدی'], ['بهراد', 'قاسمی']];
  const n2 = [['ماهان', 'رحیمی'], ['علیرضا', 'یوسفی'], ['نیما', 'اکبری'], ['آرمان', 'سلیمانی'], ['یاسین', 'طاهری'], ['هادی', 'فرهادی'], ['امیرحسین', 'زارعی'], ['سجاد', 'عباسی']];
  return { v: 2, meta: { school: 'دبیرستان نمونه شهید بهشتی', teacher: 'آقای/خانم معلم', year: '۱۴۰۵-۱۴۰۶', pass: 10 }, classes: [make('نهم ۱', 'نهم', n1, 7), make('نهم ۲', 'نهم', n2, 13)] };
}
const idb = () => new Promise((res, rej) => { const r = indexedDB.open('class-office', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const idbGet = () => idb().then(d => new Promise(res => { const q = d.transaction('kv').objectStore('kv').get(KEY); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); })).catch(() => null);
const idbPut = v => idb().then(d => { d.transaction('kv', 'readwrite').objectStore('kv').put(v, KEY); }).catch(() => {});
const CAPP = !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform());
const FS = CAPP ? Capacitor.Plugins.Filesystem : null, NFILE = 'kelasam/class-data.json';
let fileChain = Promise.resolve();
const pushFile = (text) => { if (!FS) return; fileChain = fileChain.then(() => FS.writeFile({ path: NFILE, data: text, directory: 'DATA', encoding: 'utf8', recursive: true })).catch(() => toast('ذخیره در حافظه گوشی انجام نشد!')); };
const readFile = () => FS.readFile({ path: NFILE, directory: 'DATA', encoding: 'utf8' }).then(r => r.data).catch(() => null);
let SERVER = false, pushChain = Promise.resolve(), fresh = false;
const pushServer = () => { pushChain = pushChain.then(() => fetch('api/data', { method: 'PUT', body: JSON.stringify(R) }).then(r => { if (!r.ok) throw 0; }).catch(() => toast('ذخیره در فایل برنامه انجام نشد!'))); };
let R = null;
try { R = migrate(JSON.parse(localStorage.getItem(KEY))); } catch { }
if (!R) { R = emptyRoot(); fresh = true; }
let db = null; // current class
const setCur = id => { db = R.classes.find(c => c.id === id) || null; };
const save = () => { const s = JSON.stringify(R); try { localStorage.setItem(KEY, s); } catch { } idbPut(s); pushFile(s); if (SERVER) pushServer(); };
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
function behCount(sid, c = db, from = '', to = '') {
  const o = { r: 0, y: 0, g: 0, G: 0, w: 0, neg: 0, pos: 0, score: 0 };
  c.beh.forEach(b => { if (b.sid !== sid || !BEH[b.t]) return; if (from && b.date < from) return; if (to && b.date > to) return; o[b.t]++; const p = BEH[b.t].p; o.score += p; if (p < 0) o.neg++; else if (p > 0) o.pos++; });
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
const behBadge = c => `<span class="pill ok">${sgn(c.pos).replace('−', '+')}</span> <span class="pill bad">${c.neg ? '−' + fa(c.neg, 0) : '۰'}</span>`;

/* ================= state & ui ================= */
const S = { view: 'home', st: null, ex: null, exCourse: '', q: '', date: iso(new Date()), bf: '', bt: '', bsort: 'score' };
let charts = [];
const NAV = [['cover', '📘', 'مشخصات کلاس'], ['dash', '📊', 'داشبورد'], ['courses', '📚', 'درس‌ها'], ['students', '🧑‍🎓', 'دانش‌آموزان'], ['profile', '🪪', 'پروفایل'], ['att', '✅', 'حضور و غیاب'], ['beh', '🚦', 'رفتار'], ['tasks', '📌', 'تکالیف'], ['exams', '📝', 'آزمون‌ها']];
const BOT = [['dash', '📊', 'داشبورد'], ['students', '🧑‍🎓', 'دانش‌آموزان'], ['att', '✅', 'حضور'], ['beh', '🚦', 'رفتار'], ['exams', '📝', 'آزمون']];
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
function V(h) {
  $('#view').innerHTML = (db && S.view !== 'home' && S.view !== 'about' ? classBar() : '') + bkBanner() + h;
  const sel = $('#clsSel'); if (sel) sel.onchange = e => { setCur(e.target.value); S.st = S.ex = null; render(); };
}
const VIEWS = {};
function render(keep = false) {
  const y = window.scrollY;
  charts.forEach(c => c.destroy()); charts = [];
  if (S.view !== 'home' && S.view !== 'about' && !db) S.view = 'home';
  $('#brandSub').textContent = db ? db.name : 'مدیریت کلاس‌ها';
  const items = [['home', '🏫', 'کلاس‌ها'], ...(db ? NAV : []), ['about', 'ℹ️', 'درباره ما']];
  $('#nav').innerHTML = items.map(([k, i, t]) => `<button class="nav ${S.view === k ? 'on' : ''}" data-nav="${k}"><span class="ic">${i}</span>${t}</button>`).join('');
  $('#bExportCls').hidden = !db;
  $('#bottom').innerHTML = [['home', '🏫', 'کلاس‌ها'], ...(db ? BOT : [])].map(([k, i, t]) => `<button class="${S.view === k ? 'on' : ''}" data-nav="${k}"><span>${i}</span>${t}</button>`).join('') + `<button data-more><span>☰</span>بیشتر</button>`;
  $('#side').classList.remove('open');
  VIEWS[S.view]();
  window.scrollTo(0, keep ? y : 0);
}
const emptyHint = () => db.students.length ? '' : `<div class="card" style="margin:0 0 16px;border-color:#f6d98a;background:#fffaf0"><h3>شروع کار با «${esc(db.name)}»</h3><p class="sub" style="margin:0 0 12px">هنوز دانش‌آموزی در این کلاس ثبت نشده است. لیست کلاس را از اکسل یا متن وارد کنید، یا یکی‌یکی اضافه کنید.</p><div class="row"><button class="btn" data-act="importStudents">📥 ایمپورت از اکسل / متن</button><button class="btn sec" data-act="addStudent">+ دانش‌آموز جدید</button></div></div>`;

/* ================= views ================= */
VIEWS.home = function () {
  const m = R.meta;
  const cards = R.classes.map(c => {
    const at = mean(c.students.map(s => attCount(s.id, c).pct).filter(v => v != null)); let neg = 0, pos = 0; c.beh.forEach(b => { const p = BEH[b.t]?.p; if (p < 0) neg++; else if (p > 0) pos++; });
    return `<div class="card ccard"><div class="row" style="justify-content:space-between"><div><h2>${esc(c.name)}</h2><div class="sub">${c.grade ? 'پایه ' + esc(c.grade) : '&nbsp;'}</div></div><div style="font-size:34px">🏫</div></div>
    <div class="mini"><div><small>دانش‌آموز</small><b>${fa(c.students.length, 0)}</b></div><div><small>میانگین</small><b>${fa(classAvg(c), 1)}</b></div><div><small>حضور</small><b>${at == null ? '—' : fa(at, 0) + '٪'}</b></div><div><small>رفتار</small><b style="font-size:13px"><span style="color:var(--ok)">+${fa(pos, 0)}</span> <span style="color:var(--bad)">−${fa(neg, 0)}</span></b></div></div>
    <div class="row"><button class="btn" data-act="openClass" data-id="${c.id}">ورود به کلاس</button><button class="btn sec sm" data-act="editClass" data-id="${c.id}">ویرایش</button><button class="btn bad sm" data-act="delClass" data-id="${c.id}">حذف</button></div></div>`;
  }).join('');
  V(head('kelasam', m.school ? esc(m.school) + (m.year ? ' · سال تحصیلی ' + esc(m.year) : '') : 'کلاس‌های خود را بسازید و هر کدام را جداگانه مدیریت کنید', `<button class="btn" data-act="addClass">+ کلاس جدید</button><button class="btn sec" data-act="importStudents">📥 ایمپورت دانش‌آموزان</button>`) +
    (R.classes.length ? `<div class="cgrid">${cards}</div>` : `<div class="card" style="border-color:#f6d98a;background:#fffaf0"><h3>به kelasam خوش آمدید 👋</h3><p class="sub">برای شروع یک کلاس بسازید (مثلاً «نهم ۱») و دانش‌آموزان آن را از اکسل یا متن وارد کنید. هر کلاس نمرات، حضور و غیاب و رفتار جداگانه دارد.</p><div class="row"><button class="btn" data-act="addClass">+ ساخت اولین کلاس</button><button class="btn sec" data-act="loadSample">دیدن نمونه با دو کلاس</button></div></div>`) +
    `<form class="card" id="schoolForm" style="margin-top:18px"><h3>اطلاعات کلی مدرسه</h3><div class="fg">${field('school', 'نام مدرسه', m.school)}${field('teacher', 'نام معلم', m.teacher)}${field('year', 'سال تحصیلی', m.year)}${field('pass', 'حد نمره قبولی (از ۲۰)', m.pass, 'number', 'min=0 max=20 step=0.25')}</div><div style="margin-top:14px"><button class="btn">ذخیره</button></div></form>`);
  $('#schoolForm').onsubmit = e => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); R.meta = { school: d.school, teacher: d.teacher, year: d.year, pass: +d.pass }; save(); render(true); toast('ذخیره شد'); };
};

VIEWS.cover = function () {
  const m = R.meta;
  V(emptyHint() + `<div class="cover"><div class="sub" style="color:#bfe3e8">دفتر کلاس · سال تحصیلی ${esc(m.year)}</div><h2>${esc(m.school || 'نام مدرسه')}</h2><p>${db.grade ? 'پایه ' + esc(db.grade) + ' — ' : ''}کلاس ${esc(db.name)}</p><p>معلم: ${esc(m.teacher || '—')}</p></div>
  <div class="grid g21" style="margin-top:16px"><form class="card" id="metaForm"><h3>ویرایش مشخصات</h3><div class="fg">${field('name', 'نام کلاس', db.name, 'text', 'required')}${field('grade', 'پایه', db.grade)}${field('school', 'نام مدرسه', m.school)}${field('teacher', 'نام معلم', m.teacher)}${field('year', 'سال تحصیلی', m.year)}${field('pass', 'حد نمره قبولی (از ۲۰)', m.pass, 'number', 'min=0 max=20 step=0.25')}</div><div style="margin-top:14px"><button class="btn">ذخیره مشخصات</button></div></form>
  <div class="card"><h3>راهنمای سریع</h3><div class="list sub" style="font-size:14px"><div>۱. در «درس‌ها» دروس و ضریب را تعریف کنید.</div><div>۲. در «دانش‌آموزان» لیست را ایمپورت یا ثبت کنید.</div><div>۳. در «حضور و غیاب» وضعیت هر روز را با یک کلیک بزنید.</div><div>۴. در «رفتار» برای هر دانش‌آموز کارت زرد/قرمز یا سبز ثبت کنید.</div><div>۵. در «تکالیف» تکلیف تعریف کنید و انجام/عدم انجام یا نمره را ثبت کنید.</div><div>۶. در «آزمون‌ها» نمرات را وارد کنید.</div><div>۷. داشبورد و پروفایل‌ها خودکار ساخته می‌شوند.</div></div></div></div>`);
  $('#metaForm').onsubmit = e => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); db.name = d.name; db.grade = d.grade; R.meta = { school: d.school, teacher: d.teacher, year: d.year, pass: +d.pass }; save(); render(true); toast('مشخصات ذخیره شد'); };
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
  <div class="grid g4">${stat('🧑‍🎓', '#e1f3f5', 'تعداد دانش‌آموزان', fa(db.students.length, 0))}${stat('🎯', '#fff0d1', 'میانگین کل کلاس', fa(ca))}${stat('📝', '#e8e6fb', 'تعداد آزمون‌ها', fa(db.exams.length, 0))}${stat('✅', '#dff4ea', 'میانگین حضور', fa(mean(totalAtt), 1) + '٪')}</div>
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
  ${list.map((s, i) => { const c = attCount(s.id); return `<tr><td>${fa(i + 1, 0)}</td><td><span class="row">${avatar(s)} <b>${esc(s.name)}</b></span></td><td>${esc(s.nid) || '—'}</td><td>${esc(s.phone)}</td><td class="num">${pill(stuAvg(s.id))}</td><td class="num">${fa(c.a, 0)}</td><td class="num">${behBadge(behCount(s.id))}</td><td class="num">${(() => { const t = taskCount(s.id); return t.y + t.n ? fa(t.y, 0) + ' از ' + fa(t.y + t.n, 0) : '—'; })()}</td><td class="num" style="white-space:nowrap"><button class="btn sm" data-act="open" data-id="${s.id}">پروفایل</button> <button class="btn sec sm" data-act="editStudent" data-id="${s.id}">ویرایش</button> <button class="btn bad sm" data-act="delStudent" data-id="${s.id}">حذف</button></td></tr>`; }).join('') || '<tr><td colspan=9 class="empty">دانش‌آموزی پیدا نشد.</td></tr>'}</table></div></div>`);
  const q$ = $('#q'); q$.oninput = () => { S.q = q$.value; const p = q$.selectionStart; render(true); const n = $('#q'); n.focus(); n.setSelectionRange(p, p); };
};
const studentForm = (s = {}) => `<div class="fg">${field('name', 'نام و نام خانوادگی', s.name, 'text', 'required')}${field('father', 'نام پدر', s.father)}${field('nid', 'کد ملی', s.nid, 'text', 'inputmode=numeric')}${field('birth', 'تاریخ تولد (مثلاً ۱۳۹۰/۵/۱۲)', s.birth)}${field('phone', 'تلفن ولی', s.phone, 'tel')}${field('address', 'نشانی', s.address)}</div><label class="f">عکس دانش‌آموز<input type="file" name="_photo" accept="image/*"></label>`;
function readPhoto(file) {
  return new Promise(res => { if (!file || !file.size) return res(null); const fr = new FileReader(); fr.onload = () => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'), z = 200, k = Math.max(z / im.width, z / im.height); c.width = c.height = z; c.getContext('2d').drawImage(im, (z - im.width * k) / 2, (z - im.height * k) / 2, im.width * k, im.height * k); res(c.toDataURL('image/jpeg', .8)); }; im.src = fr.result; }; fr.readAsDataURL(file); });
}

VIEWS.profile = function () {
  if (!db.students.length) return V(head('پروفایل', '') + '<div class="card empty">ابتدا یک دانش‌آموز ثبت کنید.</div>');
  if (!stuOf(S.st)) S.st = db.students[0].id;
  const s = stuOf(S.st), idx = db.students.indexOf(s), r = ranking(), rank = r.findIndex(x => x.s.id === s.id) + 1, a = attCount(s.id), avg = stuAvg(s.id), bc = behCount(s.id);
  const exs = db.exams.filter(e => e.scores[s.id] != null).sort((x, y) => x.date < y.date ? -1 : 1);
  const months = {}; Object.keys(db.att).sort().forEach(d => { const m = jmon(d); months[m] ??= { a: 0, l: 0, e: 0, t: 0 }; const v = db.att[d][s.id]; if (v) { months[m].t++; if (v !== 'p') months[m][v]++; } });
  const recs = db.beh.filter(b => b.sid === s.id).sort((x, y) => x.date < y.date ? 1 : -1);
  const info = (l, v) => `<div><div class="sub">${l}</div><b>${esc(v || '—')}</b></div>`;
  const box = t => `<div style="${chipStyle(t)}"><b>${fa(bc[t], 0)}</b><small>${BEH[t].t}</small></div>`;
  V(head('پروفایل دانش‌آموز', 'گزارش خودکار عملکرد تحصیلی، حضور و رفتار', `<button class="btn sec sm" data-act="prev">▶ قبلی</button><select id="stSel">${db.students.map(x => `<option value="${x.id}" ${x.id === s.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select><button class="btn sec sm" data-act="next">بعدی ◀</button><button class="btn" data-act="print">🖨️ چاپ</button>`) + `
  <div class="card row" style="gap:22px;align-items:center">${avatar(s, 'xl')}<div style="flex:1;min-width:240px"><h2 style="margin:0 0 8px">${esc(s.name)}</h2><div class="fg" style="grid-template-columns:repeat(3,1fr)">${info('نام پدر', s.father)}${info('کد ملی', s.nid)}${info('تاریخ تولد', s.birth)}${info('تلفن ولی', s.phone)}${info('نشانی', s.address)}${info('کلاس', db.name)}</div></div></div>
  <div class="grid g4" style="margin-top:16px">
  <div class="card stat"><div class="bub" style="background:#fff0d1">🎯</div><div><small>میانگین</small><b>${fa(avg)}</b></div></div>
  <div class="card stat"><div class="bub" style="background:#e1f3f5">🏅</div><div><small>رتبه در کلاس</small><b>${rank ? fa(rank, 0) + ' از ' + fa(db.students.length, 0) : '—'}</b></div></div>
  <div class="card stat"><div class="bub" style="background:#fde6e6">🚫</div><div><small>روز غایب / تأخیر</small><b>${fa(a.a, 0)} / ${fa(a.l, 0)}</b></div></div>
  <div class="card stat"><div class="bub" style="background:#dff4ea">✅</div><div><small>درصد حضور</small><b>${fa(a.pct, 0)}٪</b></div></div></div>
  <div class="card" style="margin-top:16px"><div class="top" style="margin-bottom:10px"><div><h3 style="margin:0">🚦 رفتار و انضباط در طول سال</h3><div class="sub">امتیاز رفتاری: <b style="color:${bc.score < 0 ? 'var(--bad)' : 'var(--ok)'}">${sgn(bc.score)}</b> · ${fa(bc.pos, 0)} مثبت، ${fa(bc.neg, 0)} منفی و ${fa(bc.w, 0)} یادداشت</div></div><div class="row noprint"><button class="btn sm" data-act="behNote" data-id="${s.id}">+ ثبت رفتار</button></div></div>
  <div class="bx">${box('r')}${box('y')}${box('g')}${box('G')}${box('w')}</div>
  <div class="tw" style="margin-top:12px;max-height:300px"><table><tr><th>تاریخ</th><th>نوع</th><th>توضیح</th><th></th></tr>${recs.map(b => `<tr><td>${jd(b.date)}</td><td>${behPill(b.t)}</td><td>${esc(b.note) || '—'}</td><td class="num noprint"><button class="btn bad sm" data-act="delBeh" data-id="${b.id}">حذف</button></td></tr>`).join('') || '<tr><td colspan=4 class="empty">هنوز رفتاری ثبت نشده است.</td></tr>'}</table></div></div>
  ${profileTasks(s)}
  <div class="grid g2" style="margin-top:16px"><div class="card"><h3>میانگین دروس در مقابل کلاس</h3><div class="chart"><canvas id="c1"></canvas></div></div>
  <div class="card"><h3>روند نمرات آزمون‌ها</h3><div class="chart"><canvas id="c2"></canvas></div></div></div>
  <div class="grid g2" style="margin-top:16px"><div class="card"><h3>غیبت‌های ماهانه</h3><div class="tw"><table><tr><th>ماه</th><th class="num">غایب</th><th class="num">تأخیر</th><th class="num">مجاز</th><th class="num">ثبت</th></tr>${Object.entries(months).map(([m, v]) => `<tr><td>${m}</td><td class="num">${fa(v.a, 0)}</td><td class="num">${fa(v.l, 0)}</td><td class="num">${fa(v.e, 0)}</td><td class="num">${fa(v.t, 0)}</td></tr>`).join('') || '<tr><td colspan=5 class="empty">ثبت نشده</td></tr>'}</table></div></div>
  <div class="card"><h3>نمره‌های ثبت‌شده</h3><div class="tw"><table><tr><th>تاریخ</th><th>درس</th><th>آزمون</th><th class="num">نمره از ۲۰</th></tr>${[...exs].reverse().map(e => `<tr><td>${jd(e.date)}</td><td>${esc(courseOf(e.courseId)?.name)}</td><td>${esc(e.title)}</td><td class="num">${pill(norm(e, s.id))}</td></tr>`).join('') || '<tr><td colspan=4 class="empty">ثبت نشده</td></tr>'}</table></div></div></div>`);
  $('#stSel').onchange = e => { S.st = e.target.value; render(); };
  S._n = [db.students[(idx - 1 + db.students.length) % db.students.length].id, db.students[(idx + 1) % db.students.length].id];
  mkChart('c1', { type: 'bar', data: { labels: db.courses.map(c => c.name), datasets: [{ label: s.name, data: db.courses.map(c => stuCourseAvg(s.id, c.id)), backgroundColor: '#0f7c8a', borderRadius: 6 }, { label: 'میانگین کلاس', data: db.courses.map(c => courseStats(c.id).avg), backgroundColor: '#c9d6d9', borderRadius: 6 }] }, options: { plugins: { legend: { display: true } }, scales: { y: { min: 0, max: 20, ticks: tickFa } } } });
  mkChart('c2', { type: 'line', data: { labels: exs.map(e => jday(e.date)), datasets: [{ data: exs.map(e => norm(e, s.id)), borderColor: '#f2a516', backgroundColor: '#f2a516', tension: .25, pointRadius: 4 }] }, options: { scales: { y: { min: 0, max: 20, ticks: tickFa }, x: { ticks: { maxTicksLimit: 8 } } } } });
};

VIEWS.att = function () {
  const d = S.date, rec = db.att[d] || {}, dates = Object.keys(db.att).sort();
  V(head('حضور و غیاب', `${wd(d)} ${jd(d)}`, `${jdate('', d, 'id=dsel')}<button class="btn sec" data-act="allP">همه حاضر</button>`) + kbHint('att') + `
  <div class="grid g21"><div class="card"><div class="tw" style="max-height:none"><table><tr><th>#</th><th>دانش‌آموز</th><th>وضعیت</th></tr>
  ${db.students.map((s, i) => `<tr class="${S.kon && S.kr === i ? 'kr' : ''}"><td>${fa(i + 1, 0)}</td><td><span class="row">${avatar(s)} ${esc(s.name)}</span></td><td><div class="seg">${Object.entries(ST).map(([k, t]) => `<button class="${k} ${rec[s.id] === k ? 'on' : ''}" data-act="mark" data-id="${s.id}" data-k="${k}">${t}</button>`).join('')}</div></td></tr>`).join('') || '<tr><td colspan=3 class="empty">ابتدا دانش‌آموز ثبت کنید.</td></tr>'}</table></div></div>
  <div class="card"><h3>خلاصه حضور (${fa(dates.length, 0)} روز ثبت‌شده)</h3><div class="tw" style="max-height:480px"><table><tr><th>دانش‌آموز</th><th class="num">غ</th><th class="num">ت</th><th>حضور</th></tr>
  ${db.students.map(s => { const c = attCount(s.id); return `<tr><td>${esc(s.name)}</td><td class="num">${fa(c.a, 0)}</td><td class="num">${fa(c.l, 0)}</td><td><div class="bar"><i style="width:${c.pct ?? 0}%;background:${c.pct < 85 ? 'var(--bad)' : 'var(--ok)'}"></i></div><small>${fa(c.pct, 0)}٪</small></td></tr>`; }).join('')}</table></div>
  <p class="sub" style="margin:8px 0 0">غ = غایب · ت = تأخیر. فقط روزهایی را که کلاس داشتید ثبت کنید.</p></div></div>`);
  $('#dsel').onchange = e => { if (e.target.value) { S.date = e.target.value; render(true); } };
};

VIEWS.beh = function () {
  const d = S.date, today = db.beh.filter(b => b.date === d);
  const sorted = db.students.map(s => ({ s, c: behCount(s.id, db, S.bf, S.bt) }));
  if (S.bsort === 'score') sorted.sort((a, b) => b.c.score - a.c.score); else if (S.bsort === 'neg') sorted.sort((a, b) => a.c.score - b.c.score); else sorted.sort((a, b) => a.s.name.localeCompare(b.s.name, 'fa'));
  const tot = { r: 0, y: 0, g: 0, G: 0, w: 0 }; db.beh.forEach(b => { if (tot[b.t] != null && (!S.bf || b.date >= S.bf) && (!S.bt || b.date <= S.bt)) tot[b.t]++; });
  V(head('رفتار و انضباط', `ثبت برای ${wd(d)} ${jd(d)}`, `${jdate('', d, 'id=dsel')}`) + `
  <div class="card"><div class="legend" style="margin-bottom:6px">برای ثبت، روی دکمه رنگی کنار نام دانش‌آموز بزنید (دکمه سفید فقط برای نوشتن یادداشت است):
  ${Object.keys(BEH).map(behPill).join(' ')}</div>
  ${db.students.map(s => { const t = today.filter(b => b.sid === s.id); return `<div class="brow"><span class="row">${avatar(s)} <b>${esc(s.name)}</b>${t.map(b => `<span class="chip" style="${chipStyle(b.t)}">${BEH[b.t].t}</span>`).join('')}</span>
  <span class="bbs"><button class="bb r" data-act="beh" data-id="${s.id}" data-k="r">− قرمز</button><button class="bb y" data-act="beh" data-id="${s.id}" data-k="y">− زرد</button><button class="bb g" data-act="beh" data-id="${s.id}" data-k="g">+ سبز</button><button class="bb G" data-act="beh" data-id="${s.id}" data-k="G">++ سبز پررنگ</button><button class="bb w" title="فقط یادداشت، بدون امتیاز" data-act="behW" data-id="${s.id}">⚪ یادداشت</button><button class="bb n" title="ثبت با توضیح" data-act="behNote" data-id="${s.id}">📝</button></span></div>`; }).join('') || '<div class="empty">ابتدا دانش‌آموز ثبت کنید.</div>'}</div>
  <div class="card" style="margin-top:16px"><h3>رفتارهای ثبت‌شده در ${jd(d)} (${fa(today.length, 0)})</h3>${today.length ? `<div class="tw" style="max-height:260px"><table><tr><th>دانش‌آموز</th><th>نوع</th><th>توضیح</th><th></th></tr>${today.map(b => `<tr><td>${esc(stuOf(b.sid)?.name)}</td><td>${behPill(b.t)}</td><td>${esc(b.note) || '—'}</td><td class="num"><button class="btn bad sm" data-act="delBeh" data-id="${b.id}">حذف</button></td></tr>`).join('')}</table></div>` : '<div class="empty">در این روز چیزی ثبت نشده است.</div>'}</div>
  <div class="card" style="margin-top:16px"><div class="top" style="margin-bottom:10px"><div><h3 style="margin:0">گزارش رفتار کلاس</h3><div class="sub">جمع: ${Object.keys(BEH).map(k => `${BEH[k].t} ${fa(tot[k], 0)}`).join(' · ')}</div></div>
  <div class="row noprint"><label class="f" style="display:flex;align-items:center;gap:6px">از ${jdate('', S.bf, 'id=bf data-clear=1')}</label><label class="f" style="display:flex;align-items:center;gap:6px">تا ${jdate('', S.bt, 'id=bt data-clear=1')}</label>
  <select id="bsort"><option value="score" ${S.bsort === 'score' ? 'selected' : ''}>بیشترین امتیاز</option><option value="neg" ${S.bsort === 'neg' ? 'selected' : ''}>بیشترین منفی</option><option value="name" ${S.bsort === 'name' ? 'selected' : ''}>بر اساس نام</option></select></div></div>
  <div class="tw wide" style="max-height:none"><table><tr><th>#</th><th>دانش‌آموز</th><th class="num">قرمز</th><th class="num">زرد</th><th class="num">سبز کمرنگ</th><th class="num">سبز پررنگ</th><th class="num">یادداشت</th><th class="num">منفی</th><th class="num">مثبت</th><th class="num">امتیاز</th></tr>
  ${sorted.map((x, i) => `<tr><td>${fa(i + 1, 0)}</td><td><a href="#" data-act="open" data-id="${x.s.id}" style="color:var(--brand);text-decoration:none;font-weight:700">${esc(x.s.name)}</a></td><td class="num">${fa(x.c.r, 0)}</td><td class="num">${fa(x.c.y, 0)}</td><td class="num">${fa(x.c.g, 0)}</td><td class="num">${fa(x.c.G, 0)}</td><td class="num">${fa(x.c.w, 0)}</td><td class="num">${fa(x.c.neg, 0)}</td><td class="num">${fa(x.c.pos, 0)}</td><td class="num"><span class="pill ${x.c.score < 0 ? 'bad' : x.c.score > 0 ? 'ok' : 'warn'}">${sgn(x.c.score)}</span></td></tr>`).join('')}</table></div>
  <p class="sub" style="margin:8px 0 0">امتیازها: قرمز −۲ · زرد −۱ · سبز کمرنگ +۱ · سبز پررنگ +۲ · سفید (یادداشت): بدون امتیاز، فقط توضیح</p></div>`);
  $('#dsel').onchange = e => { if (e.target.value) { S.date = e.target.value; render(true); } };
  $('#bf').onchange = e => { S.bf = e.target.value; render(true); }; $('#bt').onchange = e => { S.bt = e.target.value; render(true); };
  $('#bsort').onchange = e => { S.bsort = e.target.value; render(true); };
};

VIEWS.exams = function () {
  const list = db.exams.filter(e => !S.exCourse || e.courseId === S.exCourse).sort((a, b) => a.date < b.date ? 1 : -1);
  if (!db.exams.find(e => e.id === S.ex)) S.ex = list[0]?.id;
  const e = db.exams.find(x => x.id === S.ex);
  let detail = '<div class="card empty">آزمونی انتخاب نشده است. یک آزمون جدید بسازید.</div>';
  if (e) {
    const v = db.students.map(s => norm(e, s.id)).filter(x => x != null);
    detail = `<div class="card"><div class="top" style="margin-bottom:10px"><div><h3 style="margin:0">${esc(e.title)} — ${esc(courseOf(e.courseId)?.name)}</h3><div class="sub">${jd(e.date)} · نمره کل ${fa(e.max)}</div></div><div class="row"><button class="btn sec sm" data-act="editExam" data-id="${e.id}">ویرایش</button><button class="btn bad sm" data-act="delExam" data-id="${e.id}">حذف</button></div></div>
    <div class="row" style="margin-bottom:12px"><span class="pill ok">میانگین ${fa(mean(v))}</span><span class="pill warn">کمترین ${fa(v.length ? Math.min(...v) : null)}</span><span class="pill ok">بیشترین ${fa(v.length ? Math.max(...v) : null)}</span><span class="pill bad">مردود ${fa(v.filter(x => x < pass()).length, 0)} نفر</span></div>
    <div class="tw"><table><tr><th>#</th><th>دانش‌آموز</th><th class="num">نمره (از ${fa(e.max)})</th><th class="num">از ۲۰</th></tr>
    ${db.students.map((s, i) => `<tr><td>${fa(i + 1, 0)}</td><td>${esc(s.name)}</td><td class="num"><input type="number" class="sc" data-id="${s.id}" min="0" max="${e.max}" step="0.25" value="${e.scores[s.id] ?? ''}" style="width:90px"></td><td class="num" id="n${s.id}">${pill(norm(e, s.id))}</td></tr>`).join('')}</table></div></div>`;
  }
  V(head('آزمون‌ها', 'ثبت آزمون و ورود نمرات (ذخیره خودکار)', `<select id="exC"><option value="">همه دروس</option>${db.courses.map(c => `<option value="${c.id}" ${S.exCourse === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select><button class="btn sec" data-act="gradeImport">📥 ورود نمرات از اکسل</button><button class="btn" data-act="addExam">+ آزمون جدید</button>`) + `
  <div class="grid" style="grid-template-columns:300px 1fr"><div class="card"><h3>فهرست آزمون‌ها (${fa(list.length, 0)})</h3><div class="exl">${list.map(x => `<button class="ex ${x.id === S.ex ? 'on' : ''}" data-act="pickExam" data-id="${x.id}"><b>${esc(x.title)}</b><br><small>${esc(courseOf(x.courseId)?.name)} · ${jd(x.date)}</small></button>`).join('') || '<div class="empty">خالی</div>'}</div></div>${detail}</div>`);
  $('#exC').onchange = ev => { S.exCourse = ev.target.value; render(true); };
  document.querySelectorAll('.sc').forEach(i => i.onchange = () => {
    const sid = i.dataset.id; if (i.value === '') delete e.scores[sid]; else e.scores[sid] = Math.min(e.max, Math.max(0, +i.value));
    if (i.value !== '') i.value = e.scores[sid]; save(); $('#n' + sid).innerHTML = pill(norm(e, sid)); toast('ذخیره شد');
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
    const e = { id: uid(), courseId: $('#gC').value, title: $('#gT').value.trim() || 'آزمون', date: $('#gD').value || iso(new Date()), max: mx, scores }; db.exams.push(e); S.ex = e.id; save(); d.close(); render(); toast('نمرات ثبت شد'); };
  d.showModal();
}

/* ================= excel export ================= */
function sheetOf(aoa) { const ws = XLSX.utils.aoa_to_sheet(aoa), w = []; aoa.forEach(r => r.forEach((v, i) => { w[i] = Math.max(w[i] || 8, Math.min(40, String(v ?? '').length + 2)); })); ws['!cols'] = w.map(x => ({ wch: x })); return ws; }
const SUM_H = ['کلاس', 'ردیف', 'نام و نام خانوادگی', 'نام پدر', 'کد ملی', 'تاریخ تولد', 'تلفن ولی', 'نشانی', 'میانگین نمرات', 'رتبه در کلاس', 'روز حاضر', 'روز غایب', 'روز تأخیر', 'روز مجاز', 'درصد حضور', 'قرمز', 'زرد', 'سبز کمرنگ', 'سبز پررنگ', 'یادداشت (سفید)', 'جمع منفی‌ها', 'جمع مثبت‌ها', 'امتیاز رفتاری', 'تکلیف انجام‌شده', 'تکلیف انجام‌نشده', 'درصد انجام تکالیف', 'میانگین نمره تکالیف (از ۲۰)'];
function sumRows(c) {
  const rk = ranking(c);
  return c.students.map((s, i) => { const a = attCount(s.id, c), b = behCount(s.id, c), tc = taskCount(s.id, c), av = stuAvg(s.id, c), r = rk.findIndex(x => x.s.id === s.id) + 1;
    return [c.name, i + 1, s.name, s.father, s.nid, s.birth, s.phone, s.address, av == null ? '' : +av.toFixed(2), r || '', a.p, a.a, a.l, a.e, a.pct == null ? '' : +a.pct.toFixed(0), b.r, b.y, b.g, b.G, b.w, b.neg, b.pos, b.score, tc.y, tc.n, tc.pct == null ? '' : +tc.pct.toFixed(0), tc.avg == null ? '' : +tc.avg.toFixed(2)]; });
}
function exportXlsx(classes, single) {
  if (!classes.length) return toast('کلاسی برای خروجی وجود ندارد');
  const wb = XLSX.utils.book_new(); wb.Workbook = { Views: [{ RTL: true }] };
  const used = new Set(); const add = (name, aoa) => { let n = name.replace(/[\\\/?*\[\]:]/g, ' ').slice(0, 28), k = n, i = 2; while (used.has(k)) k = n + ' ' + i++; used.add(k); XLSX.utils.book_append_sheet(wb, sheetOf(aoa), k); };
  const gl = [['کلاس', 'نام', 'کد ملی', 'درس', 'آزمون', 'تاریخ', 'بارم', 'نمره', 'نمره از ۲۰']], al = [['کلاس', 'نام', 'کد ملی', 'تاریخ', 'وضعیت']], bl = [['کلاس', 'نام', 'کد ملی', 'تاریخ', 'نوع', 'امتیاز', 'توضیح']], tl = [['کلاس', 'نام', 'کد ملی', 'درس', 'تکلیف', 'تاریخ', 'مهلت', 'بارم', 'وضعیت', 'نمره']];
  const all = []; classes.forEach(c => {
    all.push(...sumRows(c));
    [...c.exams].sort((x, y) => x.date < y.date ? -1 : 1).forEach(e => c.students.forEach(s => { if (e.scores[s.id] != null) gl.push([c.name, s.name, s.nid, courseOf(e.courseId, c)?.name || '', e.title, jd(e.date), e.max, e.scores[s.id], +norm(e, s.id).toFixed(2)]); }));
    Object.keys(c.att).sort().forEach(d => c.students.forEach(s => { if (c.att[d][s.id]) al.push([c.name, s.name, s.nid, jd(d), ST[c.att[d][s.id]]]); }));
    [...c.tasks].sort((x, y) => x.date < y.date ? -1 : 1).forEach(t => c.students.forEach(s => { const r = t.res[s.id]; if (r && (r.st || r.sc != null)) tl.push([c.name, s.name, s.nid, courseOf(t.courseId, c)?.name || '', t.title, jd(t.date), t.due ? jd(t.due) : '', t.max || '', r.st === 'y' ? 'انجام شد' : r.st === 'n' ? 'انجام نشد' : '', r.sc ?? '']); }));
    [...c.beh].sort((x, y) => x.date < y.date ? -1 : 1).forEach(b => { const s = stuOf(b.sid, c); if (s) bl.push([c.name, s.name, s.nid, jd(b.date), BEH[b.t].t, BEH[b.t].p, b.note || '']); });
  });
  if (single) {
    const c = classes[0];
    add('خلاصه کلاس', [SUM_H.slice(1), ...sumRows(c).map(r => r.slice(1))]);
    const ex = [...c.exams].sort((x, y) => x.date < y.date ? -1 : 1);
    add('جدول نمرات', [['نام', 'کد ملی', ...c.courses.map(k => 'میانگین ' + k.name), 'میانگین کل', ...ex.map(e => `${courseOf(e.courseId, c)?.name || ''} - ${e.title} (${jd(e.date)})`)], ...c.students.map(s => [s.name, s.nid, ...c.courses.map(k => { const v = stuCourseAvg(s.id, k.id, c); return v == null ? '' : +v.toFixed(2); }), (() => { const v = stuAvg(s.id, c); return v == null ? '' : +v.toFixed(2); })(), ...ex.map(e => e.scores[s.id] ?? '')])]);
    const dates = Object.keys(c.att).sort(), L = { p: 'ح', a: 'غ', l: 'ت', e: 'م' };
    add('جدول حضور', [['نام', 'کد ملی', ...dates.map(jd)], ...c.students.map(s => [s.name, s.nid, ...dates.map(d => L[c.att[d][s.id]] || '')])]);
    const tks = [...c.tasks].sort((x, y) => x.date < y.date ? -1 : 1);
    add('جدول تکالیف', [['نام', 'کد ملی', ...tks.map(t => `${t.title} (${jd(t.date)})${t.max ? ' از ' + t.max : ''}`)], ...c.students.map(s => [s.name, s.nid, ...tks.map(t => { const r = t.res[s.id]; if (!r) return ''; const st = r.st === 'y' ? 'انجام شد' : r.st === 'n' ? 'انجام نشد' : ''; return r.sc != null && t.max ? (st ? st + ' - ' : '') + r.sc : st; })])]);
  } else {
    add('همه کلاس‌ها', [SUM_H, ...all]);
    classes.forEach(c => add(c.name, [SUM_H.slice(1), ...sumRows(c).map(r => r.slice(1))]));
  }
  add('ریز نمرات', gl); add('ریز حضور و غیاب', al); add('ریز رفتار', bl); add('ریز تکالیف', tl);
  const nm = single ? classes[0].name.replace(/[\\\/:*?"<>|]/g, ' ') : 'همه-کلاس‌ها';
  xlsxOut(wb, `kelasam-${nm}-${iso(new Date())}.xlsx`); toast('فایل اکسل ساخته شد');
}

/* ================= actions ================= */
const classForm = (c = {}) => field('name', 'نام کلاس (مثلاً نهم ۱)', c.name, 'text', 'required') + field('grade', 'پایه', c.grade);
function behDialog(sid, t0 = 'y') {
  const s = stuOf(sid); if (!s) return;
  dlgOpen('ثبت رفتار — ' + esc(s.name), `<div class="fg"><label class="f">نوع<select name="t" id="bhT">${Object.entries(BEH).map(([k, v]) => `<option value="${k}" ${k === t0 ? 'selected' : ''}>${v.t} (${pt(k)})</option>`).join('')}</select></label>${field('date', 'تاریخ', S.date, 'date')}</div><label class="f">توضیح <span id="bhReq">${t0 === 'w' ? '(لازم)' : '(اختیاری)'}</span><textarea name="note" id="bhN" rows="3" ${t0 === 'w' ? 'required' : ''} placeholder="مثلاً: صحبت کردن در کلاس / کمک به همکلاسی / تماس با ولی"></textarea></label>`, d => { db.beh.push({ id: uid(), sid, date: d.date, t: d.t, note: d.note.trim() }); save(); render(true); toast('رفتار ثبت شد'); });
  const sel = $('#bhT'), n = $('#bhN'); sel.onchange = () => { n.required = sel.value === 'w'; $('#bhReq').textContent = sel.value === 'w' ? '(لازم)' : '(اختیاری)'; };
  n.focus();
}
const A = {
  addClass() { dlgOpen('کلاس جدید', classForm(), d => { const c = newClass(d.name.trim(), d.grade.trim()); R.classes.push(c); save(); setCur(c.id); S.view = 'students'; S.st = S.ex = null; render(); toast('کلاس ساخته شد. حالا دانش‌آموزان را اضافه کنید'); }); },
  editClass(id) { const c = R.classes.find(x => x.id === id); dlgOpen('ویرایش کلاس', classForm(c), d => { c.name = d.name.trim(); c.grade = d.grade.trim(); save(); render(true); }); },
  delClass(id) { const c = R.classes.find(x => x.id === id); if (confirm(`کلاس «${c.name}» با همه دانش‌آموزان، نمرات، حضور و غیاب و رفتارهایش حذف شود؟\n(پیشنهاد: اول پشتیبان بگیرید)`)) { snapNow('قبل از حذف کلاس'); R.classes = R.classes.filter(x => x.id !== id); if (db && db.id === id) db = null; save(); render(); } },
  openClass(id) { setCur(id); S.view = 'students'; S.st = S.ex = null; S.q = ''; render(); },
  importStudents() { importDialog(); }, gradeImport() { gradeImportDialog(); },
  loadSample() { if (R.classes.some(c => c.students.length) && !confirm('همه داده‌های فعلی با داده نمونه جایگزین شود؟')) return; snapNow('قبل از داده نمونه'); R = sample(); db = null; S.view = 'home'; S.st = S.ex = null; save(); render(); toast('داده نمونه بارگذاری شد'); },
  addCourse() { dlgOpen('درس جدید', courseForm(), d => { db.courses.push({ id: uid(), name: d.name, coef: +d.coef }); save(); render(true); }); },
  editCourse(id) { const c = courseOf(id); dlgOpen('ویرایش درس', courseForm(c), d => { c.name = d.name; c.coef = +d.coef; save(); render(true); }); },
  delCourse(id) { if (confirm('این درس و تمام آزمون‌هایش حذف شود؟')) { db.courses = db.courses.filter(c => c.id !== id); db.exams = db.exams.filter(e => e.courseId !== id); db.tasks.forEach(t => { if (t.courseId === id) t.courseId = ''; }); save(); render(true); } },
  addStudent() { if (!db) return toast('اول یک کلاس انتخاب کنید'); dlgOpen('دانش‌آموز جدید در ' + esc(db.name), studentForm(), async (d, f) => { const p = await readPhoto(f.querySelector('[name=_photo]').files[0]); delete d._photo; db.students.push({ id: uid(), photo: p || '', ...d }); save(); render(true); toast('دانش‌آموز اضافه شد'); }); },
  editStudent(id) { const s = stuOf(id); dlgOpen('ویرایش دانش‌آموز', studentForm(s), async (d, f) => { const p = await readPhoto(f.querySelector('[name=_photo]').files[0]); delete d._photo; Object.assign(s, d); if (p) s.photo = p; save(); render(true); }); },
  delStudent(id) { if (confirm('این دانش‌آموز و همه نمره‌ها، غیبت‌ها و رفتارهایش حذف شود؟')) { db.students = db.students.filter(s => s.id !== id); db.exams.forEach(e => delete e.scores[id]); db.tasks.forEach(t => delete t.res[id]); Object.values(db.att).forEach(d => delete d[id]); db.beh = db.beh.filter(b => b.sid !== id); save(); render(true); } },
  open(id, el) { S.st = id; S.view = 'profile'; render(); },
  prev() { S.st = S._n[0]; render(); }, next() { S.st = S._n[1]; render(); }, print() { if (CAPP) { toast('چاپ در نسخه اندروید در دسترس نیست؛ از نسخه ویندوز استفاده کنید'); return; } window.print(); },
  mark(id, el) { const r = db.att[S.date] ??= {}; if (r[id] === el.dataset.k) delete r[id]; else r[id] = el.dataset.k; S.kr = db.students.findIndex(x => x.id === id); S.kon = true; save(); render(true); },
  allP() { db.att[S.date] = Object.fromEntries(db.students.map(s => [s.id, 'p'])); save(); render(true); toast('همه حاضر ثبت شدند'); },
  beh(id, el) { db.beh.push({ id: uid(), sid: id, date: S.date, t: el.dataset.k, note: '' }); save(); render(true); toast(`${stuOf(id).name}: ${BEH[el.dataset.k].t} ثبت شد`); },
  behNote(id) { behDialog(id, 'y'); }, behW(id) { behDialog(id, 'w'); },
  delBeh(id) { db.beh = db.beh.filter(b => b.id !== id); save(); render(true); toast('حذف شد'); },
  addExam() { if (!db.courses.length) return toast('ابتدا یک درس تعریف کنید'); dlgOpen('آزمون جدید', examForm(), d => { const e = { id: uid(), courseId: d.courseId, title: d.title, date: d.date, max: +d.max, scores: {} }; db.exams.push(e); S.ex = e.id; save(); render(true); }); },
  editExam(id) { const e = db.exams.find(x => x.id === id); dlgOpen('ویرایش آزمون', examForm(e), d => { Object.assign(e, d, { max: +d.max }); Object.keys(e.scores).forEach(k => { if (e.scores[k] > e.max) e.scores[k] = e.max; }); save(); render(true); }); },
  delExam(id) { if (confirm('این آزمون حذف شود؟')) { db.exams = db.exams.filter(e => e.id !== id); save(); render(true); } },
  pickExam(id) { S.ex = id; render(true); }
};
document.addEventListener('click', e => {
  if (e.target.closest('[data-more]')) { $('#side').classList.toggle('open'); return; }
  const n = e.target.closest('[data-nav]'); if (n) { S.view = n.dataset.nav; S.kon = false; return render(); }
  const a = e.target.closest('[data-act]'); if (a) { e.preventDefault(); A[a.dataset.act]?.(a.dataset.id, a); }
});
$('#menuBtn').onclick = () => $('#side').classList.toggle('open');


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
const jdate = (name, v = '', x = '') => `<span class="jdw"><input type="text" class="jdv" readonly value="${jDisp(v)}" placeholder="📅 انتخاب تاریخ"><input type="hidden" ${name ? `name="${name}"` : ''} value="${esc(v)}" ${x}></span>`;
function openPicker(hid) {
  let dlg = $('#jpk'); if (!dlg) { dlg = document.createElement('dialog'); dlg.id = 'jpk'; document.body.appendChild(dlg); }
  const clearable = hid.dataset.clear === '1', todayIso = iso(new Date());
  let f = isoJ(hid.value || todayIso), vy = f.jy, vm = f.jm;
  const shift = (j, n) => { const g = JAL.toG(j.jy, j.jm, j.jd), dt = new Date(g.gy, g.gm - 1, g.gd + n, 12); return JAL.toJ(dt.getFullYear(), dt.getMonth() + 1, dt.getDate()); };
  const draw = () => {
    const g1 = JAL.toG(vy, vm, 1), lead = (new Date(g1.gy, g1.gm - 1, g1.gd, 12).getDay() + 1) % 7, n = JAL.len(vy, vm);
    let cells = '<i></i>'.repeat(lead);
    for (let d = 1; d <= n; d++) { const di = jIso(vy, vm, d), cls = [di === hid.value ? 'sel' : '', di === todayIso ? 'today' : '', (lead + d - 1) % 7 === 6 ? 'fri' : '', f.jy === vy && f.jm === vm && f.jd === d ? 'fd' : ''].join(' '); cells += `<button type="button" class="${cls}" data-d="${d}">${fnum(d)}</button>`; }
    dlg.innerHTML = `<div class="jp"><div class="jh"><button type="button" class="btn sec sm" data-pm title="ماه قبل">▶</button><select data-m>${JM.map((m, i) => `<option value="${i + 1}" ${i + 1 === vm ? 'selected' : ''}>${m}</option>`).join('')}</select><select data-y>${Array.from({ length: 31 }, (_, i) => vy - 15 + i).map(y => `<option value="${y}" ${y === vy ? 'selected' : ''}>${fnum(y)}</option>`).join('')}</select><button type="button" class="btn sec sm" data-nm title="ماه بعد">◀</button></div>
    <div class="jgrid jw">${['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((w, i) => `<b class="${i === 6 ? 'fri' : ''}">${w}</b>`).join('')}</div><div class="jgrid">${cells}</div>
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
const tkStats = t => { const rs = db.students.map(s => t.res[s.id]), y = rs.filter(r => r?.st === 'y').length, n = rs.filter(r => r?.st === 'n').length, sc = rs.map(r => r?.sc).filter(v => v != null);
  return `<span class="pill ok">انجام شد ${fa(y, 0)}</span><span class="pill bad">انجام نشد ${fa(n, 0)}</span><span class="pill warn">ثبت نشده ${fa(db.students.length - y - n, 0)}</span>${t.max > 0 && sc.length ? `<span class="pill ok">میانگین نمره ${fa(mean(sc))} از ${fa(t.max)}</span>` : ''}`; };
VIEWS.tasks = function () {
  const list = db.tasks.filter(t => !S.tkCourse || t.courseId === S.tkCourse).sort((a, b) => a.date < b.date ? 1 : -1);
  if (!db.tasks.find(t => t.id === S.tk)) S.tk = list[0]?.id;
  const t = taskOf(S.tk);
  let detail = '<div class="card empty">تکلیفی انتخاب نشده است. با «تکلیف جدید» یکی تعریف کنید.</div>';
  if (t) detail = `<div class="card"><div class="top" style="margin-bottom:10px"><div><h3 style="margin:0">${esc(t.title)}${t.courseId ? ' — ' + esc(courseOf(t.courseId)?.name) : ''}</h3><div class="sub">تاریخ: ${jd(t.date)}${t.due ? ' · مهلت تحویل: ' + jd(t.due) : ''} · ${t.max > 0 ? 'بارم ' + fa(t.max) : 'بدون نمره (فقط انجام/عدم انجام)'}</div></div><div class="row noprint"><button class="btn sec sm" data-act="tkAll">✓ همه انجام شد</button><button class="btn sec sm" data-act="editTask" data-id="${t.id}">ویرایش</button><button class="btn bad sm" data-act="delTask" data-id="${t.id}">حذف</button></div></div>
    <div class="row" id="tkStats" style="margin-bottom:12px">${tkStats(t)}</div>${kbHint('tasks')}
    <div class="tw"><table><tr><th>#</th><th>دانش‌آموز</th><th>وضعیت</th>${t.max > 0 ? `<th class="num">نمره (از ${fa(t.max)})</th>` : ''}</tr>
    ${db.students.map((s, i) => { const r = t.res[s.id] || {}; return `<tr class="${S.kon && S.kr === i ? 'kr' : ''}" data-sid="${s.id}"><td>${fa(i + 1, 0)}</td><td><span class="row">${avatar(s)} ${esc(s.name)}</span></td><td><div class="seg"><button class="y ${r.st === 'y' ? 'on' : ''}" data-act="tkMark" data-id="${s.id}" data-k="y">✓ انجام شد</button><button class="n ${r.st === 'n' ? 'on' : ''}" data-act="tkMark" data-id="${s.id}" data-k="n">✗ انجام نشد</button></div></td>${t.max > 0 ? `<td class="num"><input type="number" class="tsc" data-id="${s.id}" min="0" max="${t.max}" step="0.25" value="${r.sc ?? ''}" style="width:90px"></td>` : ''}</tr>`; }).join('') || '<tr><td colspan=4 class="empty">ابتدا دانش‌آموز ثبت کنید.</td></tr>'}</table></div></div>`;
  V(head('تکالیف', 'تعریف تکلیف و ثبت انجام/عدم انجام یا نمره (ذخیره خودکار)', `<select id="tkC"><option value="">همه دروس</option>${db.courses.map(c => `<option value="${c.id}" ${S.tkCourse === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select><button class="btn" data-act="addTask">+ تکلیف جدید</button>`) + `
  <div class="grid" style="grid-template-columns:300px 1fr"><div class="card"><h3>فهرست تکالیف (${fa(list.length, 0)})</h3><div class="exl">${list.map(x => { const y = db.students.filter(s => x.res[s.id]?.st === 'y').length, n = db.students.filter(s => x.res[s.id]?.st === 'n').length; return `<button class="ex ${x.id === S.tk ? 'on' : ''}" data-act="pickTask" data-id="${x.id}"><b>${esc(x.title)}</b><br><small>${x.courseId ? esc(courseOf(x.courseId)?.name) + ' · ' : ''}${jd(x.date)} · ✓${fa(y, 0)} ✗${fa(n, 0)}</small></button>`; }).join('') || '<div class="empty">خالی</div>'}</div></div>${detail}</div>`);
  $('#tkC').onchange = ev => { S.tkCourse = ev.target.value; render(true); };
  document.querySelectorAll('.tsc').forEach(i => i.onchange = () => {
    const sid = i.dataset.id, r = t.res[sid] ??= {};
    if (i.value === '') delete r.sc; else { r.sc = Math.min(t.max, Math.max(0, +i.value)); i.value = r.sc; if (!r.st) { r.st = 'y'; const row = i.closest('tr'); row.querySelector('.seg .y').classList.add('on'); row.querySelector('.seg .n').classList.remove('on'); } }
    if (!r.st && r.sc == null) delete t.res[sid];
    save(); $('#tkStats').innerHTML = tkStats(t); toast('ذخیره شد');
  });
};
const taskForm = (t = {}) => `<div class="fg"><label class="f">درس (اختیاری)<select name="courseId"><option value="">— بدون درس —</option>${db.courses.map(c => `<option value="${c.id}" ${c.id === t.courseId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>${field('title', 'عنوان تکلیف', t.title, 'text', 'required')}${field('date', 'تاریخ تعریف تکلیف', t.date || iso(new Date()), 'date')}${field('due', 'مهلت تحویل (اختیاری)', t.due || '', 'date', 'data-clear=1')}${field('max', 'بارم (۰ = بدون نمره، فقط انجام/عدم انجام)', t.max ?? 0, 'number', 'min=0 max=100 step=0.5')}</div>`;
function profileTasks(s) {
  const c = taskCount(s.id), rows = [...db.tasks].sort((a, b) => a.date < b.date ? 1 : -1);
  return `<div class="card" style="margin-top:16px"><div class="top" style="margin-bottom:10px"><div><h3 style="margin:0">📌 تکالیف</h3><div class="sub">${fa(db.tasks.length, 0)} تکلیف تعریف شده${c.pct != null ? ' · درصد انجام: ' + fa(c.pct, 0) + '٪' : ''}</div></div></div>
  <div class="row" style="margin-bottom:10px"><span class="pill ok">انجام شد ${fa(c.y, 0)}</span><span class="pill bad">انجام نشد ${fa(c.n, 0)}</span><span class="pill warn">ثبت نشده ${fa(c.u, 0)}</span>${c.avg != null ? `<span class="pill ok">میانگین نمره تکالیف ${fa(c.avg)} از ۲۰</span>` : ''}</div>
  <div class="tw" style="max-height:300px"><table><tr><th>تاریخ</th><th>تکلیف</th><th>درس</th><th>وضعیت</th><th class="num">نمره</th></tr>${rows.map(t => { const r = t.res[s.id]; return `<tr><td>${jd(t.date)}</td><td>${esc(t.title)}</td><td>${esc(courseOf(t.courseId)?.name) || '—'}</td><td>${tkPill(r)}</td><td class="num">${t.max > 0 && r && r.sc != null ? fa(r.sc) + ' از ' + fa(t.max) : '—'}</td></tr>`; }).join('') || '<tr><td colspan=5 class="empty">هنوز تکلیفی تعریف نشده است.</td></tr>'}</table></div></div>`;
}
Object.assign(A, {
  addTask() { dlgOpen('تکلیف جدید', taskForm(), d => { const t = { id: uid(), courseId: d.courseId, title: d.title.trim(), date: d.date, due: d.due || '', max: +d.max || 0, res: {} }; db.tasks.push(t); S.tk = t.id; save(); render(true); toast('تکلیف ثبت شد'); }); },
  editTask(id) { const t = taskOf(id); dlgOpen('ویرایش تکلیف', taskForm(t), d => { Object.assign(t, { courseId: d.courseId, title: d.title.trim(), date: d.date, due: d.due || '', max: +d.max || 0 }); if (t.max > 0) Object.values(t.res).forEach(r => { if (r.sc > t.max) r.sc = t.max; }); save(); render(true); }); },
  delTask(id) { if (confirm('این تکلیف و وضعیت دانش‌آموزان در آن حذف شود؟')) { snapNow('قبل از حذف تکلیف'); db.tasks = db.tasks.filter(t => t.id !== id); save(); render(true); } },
  pickTask(id) { S.tk = id; S.kon = false; render(true); },
  tkMark(id, el) { setTk(id, el.dataset.k, true); S.kr = db.students.findIndex(x => x.id === id); S.kon = true; render(true); },
  tkAll() { const t = taskOf(S.tk); if (!t) return; db.students.forEach(s => { const r = t.res[s.id] ??= {}; r.st = 'y'; }); save(); render(true); toast('همه «انجام شد» ثبت شدند'); },
});
function setTk(sid, k, toggle) { const t = taskOf(S.tk); if (!t) return; const r = t.res[sid] ??= {}; if (!k || (toggle && r.st === k)) delete r.st; else r.st = k; if (!r.st && r.sc == null) delete t.res[sid]; save(); }

/* ================= keyboard (attendance & tasks) ================= */
const kbHint = v => `<div class="kbhint noprint">⌨️ با کیبورد: <kbd>↑</kbd><kbd>↓</kbd> جابه‌جایی بین دانش‌آموزان · ${v === 'att' ? '<kbd>۱</kbd> حاضر · <kbd>۲</kbd> غایب · <kbd>۳</kbd> تأخیر · <kbd>۴</kbd> مجاز · <kbd>Space</kbd> / <kbd>Enter</kbd> حاضر' : '<kbd>۱</kbd> انجام شد · <kbd>۲</kbd> انجام نشد · <kbd>Space</kbd> / <kbd>Enter</kbd> انجام شد'} (و رفتن به نفر بعد) · <kbd>Delete</kbd> پاک کردن</div>`;
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
  if (S.view !== 'att' && S.view !== 'tasks') return;
  if (document.querySelector('dialog[open]') || !db || !db.students.length) return;
  const tg = e.target.tagName; if (/^(INPUT|TEXTAREA|SELECT)$/.test(tg)) return;
  if (S.view === 'tasks' && !taskOf(S.tk)) return;
  const n = db.students.length, dm = /^(?:Digit|Numpad)([0-9])$/.exec(e.code); let k = dm ? dm[1] : e.key; k = String(k).toLowerCase();
  const att = S.view === 'att';
  const MAP = att ? { 1: 'p', 2: 'a', 3: 'l', 4: 'e', 'ح': 'p', 'غ': 'a', 'ت': 'l', 'م': 'e', p: 'p', a: 'a', l: 'l', e: 'e' } : { 1: 'y', 2: 'n', y: 'y', n: 'n', 'ب': 'y', 'ن': 'n' };
  const isAct = k in MAP || e.key === ' ' || e.key === 'Enter' || e.key === 'Delete' || e.key === 'Backspace';
  const isNav = ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key);
  if (!isAct && !isNav) return;
  if (tg === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) return;
  e.preventDefault();
  let i = S.kon ? Math.min(S.kr ?? 0, n - 1) : 0;
  if (!S.kon) { S.kon = true; S.kr = 0; if (isNav) { render(true); return scrollRow(); } }
  if (e.key === 'ArrowDown') i = Math.min(n - 1, i + 1); else if (e.key === 'ArrowUp') i = Math.max(0, i - 1); else if (e.key === 'Home') i = 0; else if (e.key === 'End') i = n - 1;
  else {
    const sid = db.students[i].id, adv = () => Math.min(n - 1, i + 1);
    if (e.key === 'Delete' || e.key === 'Backspace') { if (att) { if (db.att[S.date]) delete db.att[S.date][sid]; save(); } else setTk(sid, null); }
    else { const st = (e.key === ' ' || e.key === 'Enter') ? (att ? 'p' : 'y') : MAP[k]; if (att) { (db.att[S.date] ??= {})[sid] = st; save(); } else setTk(sid, st, false); i = adv(); }
  }
  S.kr = i; render(true); scrollRow();
});
function scrollRow() { document.querySelector('tr.kr')?.scrollIntoView({ block: 'nearest' }); }

/* ================= about ================= */
const VERSION = '1.3';
VIEWS.about = function () {
  const link = (t, u) => `<a class="ext" data-ext href="${u}" target="_blank" rel="noopener noreferrer"><b>${t}</b><span dir="ltr">${u}</span></a>`;
  V(`<div class="card about"><img src="icon-192.png" alt="kelasam" width="96" height="96"><h1>kelasam</h1><div class="sub">نسخه ${fnum(VERSION)}</div>
  <h2>تیم برنامه نویسی کلاسام</h2><p class="lead">در خدمت دبیران عزیز کشور</p>
  <div class="notice"><p>لطفا بدون اطلاع و اجازه ناشر برنامه را منتشر نکنید</p><p>از نشر بدون اجازه و بدون پرداخت وجه آن رضایت نداریم</p></div>
  <p class="lead">کلاسام وابسته به صفحه دبیران</p>
  <h3>آدرس صفحات ما:</h3><div class="links">${link('تلگرام', 'https://t.me/Dabiran7')}${link('ایتا', 'https://eitaa.com/dabiran7')}${link('اینستاگرام', 'https://www.instagram.com/dabiran7')}</div></div>`);
};
document.addEventListener('click', e => { const a = e.target.closest('a[data-ext]'); if (a && CAPP) { e.preventDefault(); Capacitor.Plugins.Browser.open({ url: a.href }).catch(() => window.open(a.href, '_system')); return; } if (a && SERVER) { e.preventDefault(); fetch('api/openurl?u=' + encodeURIComponent(a.href), { method: 'POST' }).catch(() => {}); } });

/* ================= automatic snapshots & backups ================= */
const SNAP_KEEP = 20, SNAP_EVERY = 6 * 36e5, DAY = 864e5;
const hasData = r => !!r && r.classes.some(c => c.students.length || c.exams.length || c.tasks.length);
const idbTx = (mode, fn) => idb().then(d => new Promise((res, rej) => { const tx = d.transaction('kv', mode), r = fn(tx.objectStore('kv')); tx.oncomplete = () => res(r && r.result); tx.onerror = tx.onabort = () => rej(tx.error); }));
const snapKeys = async () => ((await idbTx('readonly', st => st.getAllKeys())) || []).filter(k => String(k).startsWith('snap:')).sort();
async function snapNow(label) {
  if (!hasData(R)) return;
  const data = JSON.stringify(R), rec = JSON.stringify({ t: Date.now(), label, cls: R.classes.length, n: R.classes.reduce((a, c) => a + c.students.length, 0), data });
  try {
    const keys = await snapKeys();
    if (keys.length) { const last = JSON.parse(await idbTx('readonly', st => st.get(keys[keys.length - 1]))); if (last.data === data) { localStorage.setItem(KEY + '-snapT', Date.now()); return; } }
    await idbTx('readwrite', st => st.put(rec, 'snap:' + new Date().toISOString()));
    localStorage.setItem(KEY + '-snapT', Date.now());
    const all = await snapKeys(); if (all.length > SNAP_KEEP) await idbTx('readwrite', st => { all.slice(0, all.length - SNAP_KEEP).forEach(k => st.delete(k)); });
    if (SERVER) fetch('api/snapshot', { method: 'POST' }).catch(() => {});
  } catch { }
}
const autoSnap = () => { if (Date.now() - (+localStorage.getItem(KEY + '-snapT') || 0) > SNAP_EVERY) snapNow('خودکار'); };
const when = t => fnum(new Date(t).toLocaleString('fa-IR-u-ca-persian', { dateStyle: 'medium', timeStyle: 'short' }));
async function backupFile() {
  const name = 'kelasam-backup-' + iso(new Date()) + '.json', text = JSON.stringify(R);
  localStorage.setItem(KEY + '-bk', Date.now());
  if (CAPP) { try { await FS.writeFile({ path: 'backup/' + name, data: text, directory: 'CACHE', encoding: 'utf8', recursive: true }); const u = await FS.getUri({ path: 'backup/' + name, directory: 'CACHE' }); await Capacitor.Plugins.Share.share({ title: 'پشتیبان kelasam', url: u.uri, dialogTitle: 'ذخیره یا ارسال فایل پشتیبان' }); toast('پشتیبان آماده شد'); return; } catch (e) { if (e && /cancel/i.test(String(e.message || e))) return; } }
  try { const f = new File([text], name, { type: 'application/json' }); if (/android|iphone|ipad/i.test(navigator.userAgent) && navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: 'پشتیبان kelasam' }); toast('پشتیبان آماده شد'); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  download(name, text, 'application/json'); toast('فایل پشتیبان ساخته شد');
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
  try { for (const k of (await snapKeys()).reverse()) { const v = JSON.parse(await idbTx('readonly', st => st.get(k))); snaps.push({ k, t: v.t, label: v.label, n: v.n, cls: v.cls }); } } catch { }
  if (SERVER) { try { files = await fetch('api/backups', { cache: 'no-store' }).then(r => r.json()); } catch { } }
  const row = (id, kind, t, txt) => `<div class="li" style="border-top:1px solid var(--line);padding:6px 0"><span>${when(t)}<br><small class="sub">${txt}</small></span><button type="button" class="btn sm" data-rs="${kind}" data-id="${esc(id)}">بازگردانی</button></div>`;
  d.innerHTML = `<form><h3>🕘 پشتیبان‌های خودکار</h3>
  ${SERVER ? `<p class="sub" style="margin:0">در نسخه ویندوز، هر وقت اطلاعات تغییر کند و از آخرین پشتیبان بیش از ۳ ساعت گذشته باشد، یک نسخه در پوشه <b dir="ltr">KelasamData\\backups</b> کنار برنامه ساخته می‌شود (۳ روز اخیر کامل، برای روزهای قدیمی‌تر روزی یک نسخه، تا ۹۰ روز).</p><div class="row"><button type="button" class="btn sec sm" data-open>📂 باز کردن پوشه پشتیبان‌ها</button></div><div style="max-height:200px;overflow:auto">${files.map(f => row(f.name, 'f', f.mod * 1000, 'فایل ' + esc(f.name))).join('') || '<div class="empty">هنوز پشتیبانی ساخته نشده</div>'}</div>`
  : `<p class="sub" style="margin:0">برنامه هر ۶ ساعت (و قبل از حذف‌ها و بازگردانی‌ها) یک نسخه داخل همین دستگاه نگه می‌دارد. اگر اشتباهی چیزی را پاک کردید از اینجا برگردانید. توجه: اگر اطلاعات مرورگر کلاً پاک شود، این نسخه‌ها هم پاک می‌شوند؛ پس فایل پشتیبان را هم بگیرید.</p>
  <label class="f">یادآوری پشتیبان‌گیری فایل<select id="bkd">${[[3, 'هر ۳ روز'], [7, 'هر هفته'], [14, 'هر ۲ هفته'], [0, 'یادآوری نشود']].map(([v, t]) => `<option value="${v}" ${bkDays() === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label>`}
  <h4 style="margin:6px 0 0">نسخه‌های داخل مرورگر/برنامه ${fa(snaps.length, 0)}</h4><div style="max-height:240px;overflow:auto">${snaps.map(x => row(x.k, 's', x.t, `${esc(x.label)} · ${fa(x.cls, 0)} کلاس · ${fa(x.n, 0)} دانش‌آموز`)).join('') || '<div class="empty">هنوز نسخه‌ای نیست</div>'}</div>
  <div class="row"><button type="button" class="btn" data-snap>همین الان یک نسخه بساز</button><button type="button" class="btn sec" data-close>بستن</button></div></form>`;
  d.querySelector('[data-close]').onclick = () => d.close();
  d.querySelector('[data-snap]').onclick = async () => { await snapNow('دستی'); backupsDialog(); toast('نسخه ساخته شد'); };
  const o = d.querySelector('[data-open]'); if (o) o.onclick = () => fetch('api/openbackups', { method: 'POST' });
  const b = d.querySelector('#bkd'); if (b) b.onchange = () => localStorage.setItem(KEY + '-bkd', b.value);
  d.querySelectorAll('[data-rs]').forEach(btn => btn.onclick = async () => {
    if (btn.dataset.rs === 's') { const v = JSON.parse(await idbTx('readonly', st => st.get(btn.dataset.id))); restoreText(v.data, when(v.t)); }
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
const xlsxOut = (wb, name) => { if (!CAPP) return XLSX.writeFile(wb, name); return nativeOut(name, XLSX.write(wb, { bookType: 'xlsx', type: 'base64' }), true).catch(e => { if (!/cancel/i.test(String(e && e.message || e))) toast('ساخت فایل انجام نشد'); }); };
function download(name, text, type) { if (CAPP) { nativeOut(name, text, false).catch(() => {}); return; } const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); }
$('#bExport').onclick = () => backupFile();
$('#bAuto').onclick = () => backupsDialog();
$('#bImport').onclick = () => $('#fImport').click();
$('#fImport').onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { try { const d = migrate(JSON.parse(t)); if (!d) throw 0; snapNow('قبل از بازیابی فایل'); R = d; db = null; S.view = 'home'; save(); render(); toast('بازیابی انجام شد'); } catch { alert('این فایل پشتیبان معتبر نیست.'); } }); e.target.value = ''; };
$('#bExportCls').onclick = () => db && exportXlsx([db], true);
$('#bExportAll').onclick = () => exportXlsx(R.classes, false);
$('#bReset').onclick = () => A.loadSample();
$('#bClear').onclick = () => { if (confirm('همه کلاس‌ها و اطلاعات پاک شود؟ (یک نسخه خودکار از وضعیت فعلی نگه داشته می‌شود)')) { snapNow('قبل از شروع از صفر'); R = emptyRoot(); db = null; S.view = 'home'; S.st = S.ex = null; save(); render(); } };

/* ================= boot ================= */
let deferred; addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; $('#bInstall').hidden = false; });
$('#bInstall').onclick = async () => { if (deferred) { deferred.prompt(); deferred = null; $('#bInstall').hidden = true; } };
if (/iphone|ipad/i.test(navigator.userAgent) && !navigator.standalone) { $('#bInstall').hidden = false; $('#bInstall').onclick = () => alert('در سافاری دکمه «اشتراک‌گذاری» را بزنید و «Add to Home Screen» را انتخاب کنید.'); }
(async () => {
  try {
    const r = await fetch('api/data', { cache: 'no-store' });
    if (r.ok && r.headers.get('X-Class-Server') === '1') {
      SERVER = true; const j = migrate(await r.json());
      if (j) R = j; else if (!fresh) save();
      addEventListener('pagehide', () => navigator.sendBeacon('api/bye'));
      setInterval(() => fetch('api/ping').catch(() => {}), 10000);
    }
  } catch { }
  if (CAPP) {
    $('#bInstall').remove();
    const t = await readFile();
    if (t) { try { const j = migrate(JSON.parse(t)); if (j) { R = j; fresh = false; } } catch { } }
    else if (!fresh) pushFile(JSON.stringify(R));
    else { const s = await idbGet(); if (s) { try { const j = migrate(JSON.parse(s)); if (j) { R = j; pushFile(s); } } catch { } } }
  } else if (!SERVER) {
    if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
    if (fresh) { const s = await idbGet(); if (s) { try { const j = migrate(JSON.parse(s)); if (j) R = j; } catch { } } }
  } else $('#bInstall').remove();
  render();
  setTimeout(autoSnap, 4000); setInterval(autoSnap, 30 * 60e3);
})();
