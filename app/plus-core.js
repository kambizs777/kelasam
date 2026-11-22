'use strict';
/* =====================================================================
   plus-core.js  (نسخه 2.6)  —  امکانات عمومی برنامه
   ۱) دکمه‌های کوچک و قابل‌جابه‌جایی «واگرد/بازگرد»   ۲) مدرسه‌ها   ۳) صفحه «درباره ما» (قابل ویرایش از پنل مدیریت سرور)
   ۴) جستجوی سریع دانش‌آموز (مخصوص گوشی)   ۵) داده‌ی نمونه برای قابلیت‌های جدید
   این فایل بعد از app.js بارگذاری می‌شود و از توابع و ثابت‌های آن استفاده می‌کند.
   ===================================================================== */

/* ---------------------------------------------------------------
   ۱) نوار واگرد/بازگرد: کوچک، نیمه‌شفاف و قابل کشیدن با دستگیره
   --------------------------------------------------------------- */
(function undoBarInit() {
  const bar = $('#undoBar'), grip = $('#uGrip'); if (!bar || !grip) return;
  const KEYP = 'kelasam-undo-pos';
  const place = (x, y) => { // x و y درصد صفحه هستند تا با تغییر اندازه‌ی صفحه بیرون نزنند
    const w = innerWidth, h = innerHeight, bw = bar.offsetWidth || 90, bh = bar.offsetHeight || 36;
    const px = Math.min(Math.max(4, x / 100 * w), w - bw - 4), py = Math.min(Math.max(4, y / 100 * h), h - bh - 4);
    bar.style.left = px + 'px'; bar.style.top = py + 'px'; bar.style.bottom = 'auto'; bar.style.right = 'auto';
  };
  try { const p = JSON.parse(localStorage.getItem(KEYP) || 'null'); if (p) place(p.x, p.y); } catch { }
  let drag = null, idle;
  const wake = () => { bar.classList.remove('idle'); clearTimeout(idle); idle = setTimeout(() => bar.classList.add('idle'), 3500); };
  grip.addEventListener('pointerdown', e => { drag = { dx: e.clientX - bar.offsetLeft, dy: e.clientY - bar.offsetTop }; grip.setPointerCapture(e.pointerId); e.preventDefault(); });
  grip.addEventListener('pointermove', e => { if (!drag) return; place((e.clientX - drag.dx) / innerWidth * 100, (e.clientY - drag.dy) / innerHeight * 100); });
  grip.addEventListener('pointerup', () => { if (!drag) return; drag = null; try { localStorage.setItem(KEYP, JSON.stringify({ x: bar.offsetLeft / innerWidth * 100, y: bar.offsetTop / innerHeight * 100 })); } catch { } });
  grip.addEventListener('dblclick', () => { try { localStorage.removeItem(KEYP); } catch { } bar.style.left = bar.style.top = bar.style.right = bar.style.bottom = ''; toast('جای دکمه‌ها به حالت اول برگشت'); });
  ['pointerenter', 'pointerdown', 'focusin', 'touchstart'].forEach(ev => bar.addEventListener(ev, wake, { passive: true }));
  document.addEventListener('click', e => { if (e.target.closest('[data-act],button')) wake(); }, true);
  addEventListener('resize', () => { try { const p = JSON.parse(localStorage.getItem(KEYP) || 'null'); if (p) place(p.x, p.y); } catch { } });
  wake();
})();

/* ---------------------------------------------------------------
   ۲) مدرسه‌ها
   --------------------------------------------------------------- */
function schoolsCard() {
  const L = schoolsOf(), th = R.classes;
  return `<div class="card" style="margin-top:18px"><div class="top" style="margin-bottom:10px"><div><h3 style="margin:0">🏫 مدرسه‌ها</h3><div class="sub">اگر در چند مدرسه تدریس می‌کنید، مدرسه‌ها را اینجا تعریف کنید؛ هنگام ساخت هر کلاس مدرسه‌اش را انتخاب می‌کنید و کلاس‌ها به‌تفکیک مدرسه نمایش داده می‌شوند.</div></div><button class="btn sm" data-act="addSchool">+ مدرسه جدید</button></div>
  ${L.length ? `<div class="tw" style="max-height:none"><table><tr><th>مدرسه</th><th class="num">کلاس‌ها</th><th class="num">دانش‌آموزان</th><th></th></tr>${L.map(x => { const cs = th.filter(c => c.sid === x.id && termOf(c) === termNow()); return `<tr><td><b>${esc(x.name)}</b></td><td class="num">${fa(cs.length, 0)}</td><td class="num">${fa(cs.reduce((a, c) => a + c.students.length, 0), 0)}</td><td class="num" style="white-space:nowrap"><button class="btn sec sm" data-act="addClassIn" data-id="${x.id}">+ کلاس</button> <button class="btn sec sm" data-act="editSchool" data-id="${x.id}">ویرایش نام</button> <button class="btn bad sm" data-act="delSchool" data-id="${x.id}">حذف</button></td></tr>`; }).join('')}</table></div>` : '<div class="empty">هنوز مدرسه‌ای تعریف نشده است؛ با «+ مدرسه جدید» نام مدرسه‌ی اول را بنویسید.</div>'}</div>`;
}
Object.assign(A, {
  addSchool() {
    dlgOpen('مدرسه جدید', field('name', 'نام مدرسه (مثلاً دبیرستان شهید بهشتی)', '', 'text', 'required autofocus'), d => {
      const nm = d.name.trim(); if (!nm) return false;
      const sc = { id: uid(), name: nm }; R.meta = Object.assign({}, R.meta, { schools: [...schoolsOf(), sc] });
      if (schoolsOf().length === 1) R.classes.forEach(c => { if (!c.sid) c.sid = sc.id; }); // کلاس‌های قبلی به مدرسه‌ی اول می‌روند
      syncSchoolMeta(); save(); render(true); toast('مدرسه اضافه شد');
    });
  },
  editSchool(id) {
    const x = schoolsOf().find(v => v.id === id); if (!x) return;
    dlgOpen('ویرایش نام مدرسه', field('name', 'نام مدرسه', x.name, 'text', 'required'), d => { x.name = d.name.trim() || x.name; syncSchoolMeta(); save(); render(true); });
  },
  delSchool(id) {
    const x = schoolsOf().find(v => v.id === id); if (!x) return;
    const n = R.classes.filter(c => c.sid === id).length;
    if (!confirm(`مدرسه‌ی «${x.name}» حذف شود؟${n ? `\n${fa(n, 0)} کلاس این مدرسه حذف نمی‌شود و «بدون مدرسه» می‌ماند (بعداً می‌توانید مدرسه‌اش را عوض کنید).` : ''}`)) return;
    R.meta = Object.assign({}, R.meta, { schools: schoolsOf().filter(v => v.id !== id) });
    R.classes.forEach(c => { if (c.sid === id) c.sid = ''; }); syncSchoolMeta(); save(); render(true);
  },
});
/* نوار «کلاس فعال» بالای هر صفحه: نام مدرسه هم نشان داده شود */
(function patchClassBar() {
  const old = classBar;
  classBar = function () { const h = old(); const n = schoolsOf().length > 1 ? schoolName() : ''; return n ? h.replace('<span>🏫 کلاس فعال:</span>', `<span>🏫 ${esc(n)} ·</span>`) : h; };
})();

/* ---------------------------------------------------------------
   ۳) درباره ما — متن‌ها اینجا یک‌جا نوشته شده‌اند و از «پنل مدیریت سرور» هم قابل ویرایش‌اند
   --------------------------------------------------------------- */
const ABOUT = {
  team: 'تیم برنامه نویسی کلاسام',
  slogan: 'در خدمت دبیران عزیز کشور',
  links: [['وب‌سایت دبیران', 'https://www.dabiran7.ir'], ['تلگرام', 'https://t.me/Dabiran7'], ['ایتا', 'https://eitaa.com/dabiran7'], ['اینستاگرام', 'https://www.instagram.com/dabiran7']],
  rights: 'کلیه حقوق این اثر متعلق به وبسایت دبیران dabiran7.ir است و نشر آن بدون اجازه جایز نمی باشد',
  ask: 'سوالات خود را از ادمین شبکه های اجتماعی ما یا ارتباط با ما سایت بپرسید',
};
try { const c = JSON.parse(localStorage.getItem('kelasam-about') || 'null'); if (c && c.team) Object.assign(ABOUT, c); } catch { }
async function aboutRemote() { // اگر به سرور رسا دسترسی باشد، متن «درباره ما» را از آنجا می‌گیرد (ویرایش از پنل مدیریت)
  try {
    const ac = new AbortController(), tm = setTimeout(() => ac.abort(), 6000);
    const r = await fetch(syBase() + 'api.php?a=about', { cache: 'no-store', signal: ac.signal }); clearTimeout(tm);
    const j = await r.json(); if (j && j.ok && j.about && j.about.team) { const old = JSON.stringify(ABOUT); Object.assign(ABOUT, j.about); localStorage.setItem('kelasam-about', JSON.stringify(j.about)); if (S.view === 'about' && old !== JSON.stringify(ABOUT)) render(true); }
  } catch { }
}
VIEWS.about = function () {
  const link = (t, u) => `<a class="ext" data-ext href="${esc(u)}" target="_blank" rel="noopener noreferrer"><b>${esc(t)}</b><span dir="ltr">${esc(u)}</span></a>`;
  V(`<div class="card about"><img src="icon-192.png" alt="kelasam" width="96" height="96"><h1>kelasam</h1><div class="sub">نسخه ${fnum(VERSION)}</div>
  <h2>${esc(ABOUT.team)}</h2><p class="lead">${esc(ABOUT.slogan)}</p>
  <h3>آدرس وب‌سایت و شبکه‌های اجتماعی ما:</h3><div class="links">${ABOUT.links.map(x => link(x[0], x[1])).join('')}</div>
  <div class="notice"><p>${esc(ABOUT.rights)}</p></div>
  <p class="lead" style="font-size:15px">${esc(ABOUT.ask)}</p>
  <details class="sub" style="margin-top:16px;text-align:start"><summary style="cursor:pointer">🩺 گزارش پایداری (برای پشتیبانی)</summary><div style="margin-top:8px">${ERRLOG.length ? ERRLOG.slice(-15).reverse().map(x => `<div style="border-top:1px solid var(--line);padding:4px 0"><small>${when(x.t)}</small><br>${esc(x.m)}</div>`).join('') : 'موردی ثبت نشده است.'}<div class="row" style="margin-top:8px"><button type="button" class="btn sec sm" data-act="errCopy">کپی گزارش</button></div></div></details></div>`);
  aboutRemote();
};

/* ---------------------------------------------------------------
   ۴) جستجوی سریع دانش‌آموز (دکمه 🔍 بالای صفحه؛ میان‌بر Ctrl+K)
   --------------------------------------------------------------- */
function quickFind() {
  const d = $('#dlg');
  d.innerHTML = `<form onsubmit="return false" class="qf"><h3>🔍 پیدا کردن سریع دانش‌آموز</h3>
  <input id="qfI" type="search" autocomplete="off" placeholder="بخشی از نام، نام پدر یا کد ملی…" style="font-size:17px;padding:12px">
  <label class="ck" style="padding:4px 0"><input type="checkbox" id="qfAll" ${S.qfAll ? 'checked' : ''}><span>جستجو در همه کلاس‌های این ترم (نه فقط کلاس فعال)</span></label>
  <div id="qfL" class="qfl"></div><div class="row"><button type="button" class="btn sec" data-close>بستن</button></div></form>`;
  d.querySelector('[data-close]').onclick = () => d.close();
  const list = () => {
    const q = nq($('#qfI').value), all = $('#qfAll').checked; S.qfAll = all;
    const cls = all || !db ? termClasses() : [db], out = [];
    cls.forEach(c => c.students.forEach(s => { if (!q || nq(s.name).includes(q) || nq(s.father).includes(q) || (s.nid && String(s.nid).includes(faD(q)))) out.push({ c, s }); }));
    $('#qfL').innerHTML = out.slice(0, 40).map(({ c, s }) => { const av = stuAvg(s.id, c); return `<div class="qfi"><span class="row" style="gap:8px">${avatar(s)}<span><b>${esc(s.name)}</b><br><small class="sub">${esc(c.name)}${schoolsOf().length > 1 ? ' · ' + esc(schoolName(c)) : ''}${av != null ? ' · میانگین ' + fa(av) : ''}</small></span></span>
      <span class="qa">${[['profile', 'پروفایل'], ['exams', 'نمره'], ['beh', 'رفتار'], ['att', 'حضور'], ['tasks', 'تکلیف']].map(([v, t]) => `<button type="button" class="qb" data-qf="${v}" data-c="${c.id}" data-s="${s.id}">${t}</button>`).join('')}</span></div>`; }).join('') || '<div class="empty">دانش‌آموزی پیدا نشد</div>';
    if (out.length > 40) $('#qfL').insertAdjacentHTML('beforeend', `<div class="sub" style="text-align:center">${fa(out.length - 40, 0)} مورد دیگر… عبارت جستجو را دقیق‌تر کنید</div>`);
  };
  $('#qfI').oninput = list; $('#qfAll').onchange = list; list();
  $('#qfL').onclick = e => {
    const b = e.target.closest('[data-qf]'); if (!b) return; const c = R.classes.find(x => x.id === b.dataset.c); if (!c) return;
    setCur(c.id); resetClassFilters(); const v = b.dataset.qf; S.kon = false;
    if (v === 'profile') { S.st = b.dataset.s; S.pbt = ''; S.view = 'profile'; } else { S.view = v; S.fid = b.dataset.s; S.fq = ''; }
    d.close(); render();
  };
  if (!d.open) d.showModal(); setTimeout(() => { try { $('#qfI').focus(); } catch { } }, 60);
}
Object.assign(A, { quickFind });
document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (R && R.classes.length) quickFind(); } });
(function () {
  const side = $('#side .tools'); if (side) side.insertAdjacentHTML('afterbegin', '<button class="nav" id="bFind"><span class="ic">🔍</span>جستجوی سریع (Ctrl+K)</button>');
  const f = () => { if (R && R.classes.length) quickFind(); else toast('اول یک کلاس بسازید'); };
  ['#bFind', '#qfBtn'].forEach(s => { const b = $(s); if (b) b.onclick = () => { setMenu(false); f(); }; });
})();

/* ---------------------------------------------------------------
   ۵) داده‌ی نمونه برای قابلیت‌های جدید (مدرسه‌ها، ترم دوم، نمره مستمر، تعدیل نمره، رفتار)
   --------------------------------------------------------------- */
(function extendSample() {
  const base = sample;
  sample = function () {
    const root = base(); let seed = 4242; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const [c1, c2] = root.classes;
    root.meta.schools = [{ id: 's-main', name: 'مدرسه عطاآفرین رشت' }, { id: 's-b', name: 'دبیرستان شهید بهشتی رشت' }]; root.meta.school = root.meta.schools[0].name; root.meta.term = 1;
    c1.sid = 's-main'; c2.sid = 's-b'; c1.term = c2.term = 1; c1.tg = uid(); c2.tg = uid();
    /* ترم دوم کلاس اول: همان دانش‌آموزان و دروس، ولی آزمون و حضور و رفتار از صفر */
    const t2 = Object.assign(newClass(c1.name, c1.grade, 2), { tg: c1.tg, sid: c1.sid, students: JSON.parse(JSON.stringify(c1.students)), courses: JSON.parse(JSON.stringify(c1.courses)), bstep: c1.bstep });
    const d0 = new Date(); d0.setDate(d0.getDate() + 30);
    t2.courses.slice(0, 3).forEach((k, ci) => { for (let n = 0; n < 2; n++) { const dt = new Date(d0); dt.setDate(dt.getDate() + n * 14 + ci); const sc = {}; t2.students.forEach(s => { if (rnd() > .05) sc[s.id] = Math.min(20, Math.max(5, Math.round((13 + rnd() * 7) * 4) / 4)); }); t2.exams.push({ id: uid(), courseId: k.id, title: ['کوییز ۱', 'آزمون مهر'][n] + ' ترم دوم', date: iso(dt), max: 20, scores: sc }); } });
    root.classes.splice(1, 0, t2);
    /* تعدیل نمره: یک آزمون عربی نیم‌نمره اضافه می‌شود و در سابقه‌ی تعدیل ثبت می‌شود */
    const ar = c1.courses.find(k => k.name === 'عربی'), ex = ar && c1.exams.find(e => e.courseId === ar.id);
    if (ex) { Object.keys(ex.scores).forEach(k => { ex.scores[k] = Math.min(ex.max, +(ex.scores[k] + .5).toFixed(2)); }); ex.adj = [{ t: Date.now(), d: 'افزودن ۰٫۵ نمره به همه (نمونه‌ی تعدیل نمره)' }]; }
    /* فرمول نمره مستمر: ۵۰٪ آزمون‌های ریاضی + ۲۰٪ تکالیف + ۱۰٪ رفتار + ۲۰٪ حضور؛ نتیجه به‌صورت آزمون ★ ثبت می‌شود */
    const mk = c1.courses.find(k => k.name === 'ریاضی') || c1.courses[0];
    const cf = { id: uid(), name: 'نمره مستمر ریاضی ترم اول', courseId: mk.id, outOf: 20, step: .25, miss: 'skip', examId: '', comps: [
      { id: uid(), kind: 'exams', label: 'آزمون‌های ریاضی', w: 50, ids: c1.exams.filter(e => !e.calc && e.courseId === mk.id).map(e => e.id) },
      { id: uid(), kind: 'tasks', label: 'تکالیف', w: 20, ids: c1.tasks.map(t => t.id) },
      { id: uid(), kind: 'beh', label: 'رفتار', w: 10, cid: '', scale: 1 },
      { id: uid(), kind: 'att', label: 'حضور و غیاب', w: 20 }] };
    const res = calcRun(cf, c1), sc = {}; res.forEach((r, sid) => { if (r.fin != null) sc[sid] = r.fin; });
    const ce = { id: uid(), courseId: mk.id, title: cf.name, date: iso(new Date()), max: 20, scores: sc, calc: cf.id }; c1.exams.push(ce); cf.examId = ce.id; c1.calcs = [cf];
    /* نمونه دلایل آماده‌ی رفتار */
    root.meta.behReasons = { r: ['درگیری با همکلاسی', 'بی‌احترامی'], y: ['صحبت بی‌اجازه', 'فراموشی تکلیف', 'تأخیر'], g: ['مشارکت در بحث', 'کمک به همکلاسی'], G: ['نمره عالی', 'ابتکار و خلاقیت'] };
    return root;
  };
})();
