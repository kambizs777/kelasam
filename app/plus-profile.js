'use strict';
/* =====================================================================
   plus-profile.js (نسخه 2.6) — جدول‌های قابل ویرایش در «پروفایل دانش‌آموز»
   • حضور و غیاب: همه‌ی روزهای ثبت‌شده با تاریخ کامل و امکان تغییر وضعیت / حذف / افزودن
   • نمره‌ها: عنوان آزمون لینک است و نمره همان‌جا ویرایش می‌شود
   • تکالیف و فعالیت‌ها: وضعیت و نمره همان‌جا ویرایش می‌شود و عنوان لینک به صفحه‌ی خودش است
   ===================================================================== */
const ST_CLS = { p: 'ok', a: 'bad', l: 'warn', e: 'info' };

function profileAtt(s) {
  const days = Object.keys(db.att).filter(d => db.att[d] && db.att[d][s.id]).sort().reverse(), c = attCount(s.id), all = !!S.pAttAll;
  const list = all ? days : days.filter(d => db.att[d][s.id] !== 'p');
  const months = {}; [...days].reverse().forEach(d => { const m = jmon(d); months[m] ??= { a: 0, l: 0, e: 0, t: 0 }; const v = db.att[d][s.id]; months[m].t++; if (v !== 'p') months[m][v]++; });
  return `<div class="grid g21" style="margin-top:16px"><div class="card"><div class="top" style="margin-bottom:8px"><div><h3 style="margin:0">${ico('check')} حضور و غیاب ${esc(s.name)}</h3><div class="sub">${fa(days.length, 0)} روز ثبت‌شده · درصد حضور ${fa(c.pct, 0)}٪</div></div>
  <div class="row noprint"><button class="btn sm" data-act="pAttAdd">+ ثبت غیبت / تأخیر</button><button class="btn sec sm" data-act="pAttAll">${all ? 'فقط غیبت‌ها و تأخیرها' : 'نمایش همه‌ی روزها (' + fa(days.length, 0) + ')'}</button></div></div>
  <div class="row" style="margin-bottom:8px"><span class="pill bad">غایب ${fa(c.a, 0)}</span><span class="pill warn">تأخیر ${fa(c.l, 0)}</span><span class="pill info">مجاز ${fa(c.e, 0)}</span><span class="pill ok">حاضر ${fa(c.p, 0)}</span></div>
  <div class="tw" style="max-height:340px"><table><tr><th>#</th><th>تاریخ</th><th>وضعیت (برای تغییر بزنید)</th><th class="noprint"></th></tr>${list.map((d, i) => `<tr><td>${fa(i + 1, 0)}</td><td style="white-space:nowrap"><b>${wd(d)}</b> ${jd(d)}</td><td><div class="seg sm">${Object.entries(ST).map(([k, t]) => `<button class="${k} ${db.att[d][s.id] === k ? 'on' : ''}" data-act="pAtt" data-id="${d}" data-k="${k}">${t}</button>`).join('')}</div></td><td class="num noprint"><button class="btn bad sm" data-act="pAttDel" data-id="${d}" title="حذف ثبت این روز برای این دانش‌آموز">✕</button></td></tr>`).join('') || `<tr><td colspan=4 class="empty">${all ? 'هنوز حضور و غیابی ثبت نشده است.' : '🎉 هیچ غیبت یا تأخیری ثبت نشده است.'}</td></tr>`}</table></div></div>
  <div class="card"><h3>غیبت‌های ماهانه</h3><div class="tw"><table><tr><th>ماه</th><th class="num">غ</th><th class="num">ت</th><th class="num">مجاز</th><th class="num">ثبت</th></tr>${Object.entries(months).map(([m, v]) => `<tr><td>${m}</td><td class="num">${fa(v.a, 0)}</td><td class="num">${fa(v.l, 0)}</td><td class="num">${fa(v.e, 0)}</td><td class="num">${fa(v.t, 0)}</td></tr>`).join('') || '<tr><td colspan=5 class="empty">ثبت نشده</td></tr>'}</table></div></div></div>`;
}

function profileExams(s) {
  const L = [...db.exams].sort((a, b) => a.date < b.date ? 1 : -1);
  return `<div class="card" style="margin-top:16px"><div class="top" style="margin-bottom:8px"><div><h3 style="margin:0">${ico('exam')} نمره‌های آزمون‌ها</h3><div class="sub">روی نام آزمون بزنید تا صفحه‌ی آن باز شود؛ نمره را همین‌جا هم می‌توانید بنویسید یا اصلاح کنید.</div></div></div>
  <div class="tw" style="max-height:380px"><table><tr><th>تاریخ</th><th>درس</th><th>آزمون</th><th class="num">نمره</th><th class="num">از ۲۰</th><th class="num">میانگین کلاس</th></tr>${L.map(e => { const v = norm(e, s.id), all = db.students.map(x => norm(e, x.id)).filter(x => x != null); return `<tr><td style="white-space:nowrap">${jd(e.date)}</td><td>${esc(courseOf(e.courseId)?.name || '—')}</td><td><a href="#" class="nl" data-act="openExam" data-id="${e.id}">${e.calc ? '★ ' : ''}${esc(e.title)}</a></td><td class="num"><input type="number" inputmode="decimal" class="pex" data-id="${e.id}" min="0" max="${e.max}" step="0.25" value="${e.scores[s.id] ?? ''}" style="width:78px" ${e.calc ? 'disabled title="نمره‌ی محاسبه‌شده است؛ از صفحه «محاسبه نمره مستمر» به‌روز می‌شود"' : ''}> <small class="sub">از ${fa(e.max)}</small></td><td class="num">${pill(v)}</td><td class="num">${fa(mean(all), 1)}</td></tr>`; }).join('') || '<tr><td colspan=6 class="empty">هنوز آزمونی ثبت نشده است.</td></tr>'}</table></div></div>`;
}

/* تکالیف و فعالیت‌ها (جایگزین نسخه‌ی فقط‌خواندنی) */
function profRec(kind, s, rows, c, title, icon) {
  const mono = kind === 'tasks' ? 'تکلیف' : 'فعالیت';
  return `<div class="card" style="margin-top:16px"><div class="top" style="margin-bottom:10px"><div><h3 style="margin:0">${ico(icon)} ${title}</h3><div class="sub">${fa(rows.length, 0)} ${mono}${c.pct != null ? ' · درصد انجام: ' + fa(c.pct, 0) + '٪' : ''} · وضعیت و نمره را همین‌جا تغییر دهید</div></div></div>
  <div class="row" style="margin-bottom:10px"><span class="pill ok">انجام شد ${fa(c.y, 0)}</span><span class="pill bad">انجام نشد ${fa(c.n, 0)}</span><span class="pill warn">ثبت نشده ${fa(c.u, 0)}</span>${c.avg != null ? `<span class="pill ok">میانگین نمره ${fa(c.avg)} از ۲۰</span>` : ''}</div>
  <div class="tw" style="max-height:340px"><table><tr><th>تاریخ</th><th>${mono}</th><th>درس</th><th>وضعیت</th><th class="num">نمره</th></tr>${rows.map(t => { const r = t.res[s.id] || {}; return `<tr><td style="white-space:nowrap">${jd(t.date)}</td><td><a href="#" class="nl" data-act="openRec" data-kind="${kind}" data-id="${t.id}">${esc(t.title)}</a></td><td>${esc(courseOf(t.courseId)?.name) || '—'}</td>
    <td><div class="seg sm"><button class="y ${r.st === 'y' ? 'on' : ''}" data-act="pRec" data-kind="${kind}" data-id="${t.id}" data-k="y">✓ انجام شد</button><button class="n ${r.st === 'n' ? 'on' : ''}" data-act="pRec" data-kind="${kind}" data-id="${t.id}" data-k="n">✗ نشد</button></div></td>
    <td class="num">${t.max > 0 ? `<input type="number" inputmode="decimal" class="prc" data-kind="${kind}" data-id="${t.id}" min="0" max="${t.max}" step="0.25" value="${r.sc ?? ''}" style="width:72px"> <small class="sub">از ${fa(t.max)}</small>` : '—'}</td></tr>`; }).join('') || `<tr><td colspan=5 class="empty">هنوز ${mono}ی تعریف نشده است.</td></tr>`}</table></div></div>`;
}
profileTasks = function (s) { return profRec('tasks', s, [...db.tasks].sort((a, b) => a.date < b.date ? 1 : -1), taskCount(s.id), `${''}تکالیف`, 'tasks'); };
profileActs = function (s) { if (!db.acts.length) return ''; return profRec('acts', s, db.acts.filter(a => !a.ids || a.ids.includes(s.id)).sort((x, y) => x.date < y.date ? 1 : -1), actCount(s.id), 'فعالیت‌ها و پروژه‌ها', 'target'); };

/* نمودار رفتارهای دانش‌آموز (حلقه‌ای) */
function profBehChart(s, bc) {
  const ks = ['r', 'y', 'g', 'G', 'w'];
  mkChart('c4', { type: 'doughnut', data: { labels: ks.map(k => BEH[k].t), datasets: [{ data: ks.map(k => bc[k]), backgroundColor: ['#d64545', '#f2c400', '#8ccf7e', '#1f9d63', '#ced4da'], borderWidth: 2 }] }, options: { cutout: '58%', plugins: { legend: { display: true, position: 'bottom', labels: { usePointStyle: true } } } } });
}

const recOf = (kind, id) => (kind === 'tasks' ? db.tasks : db.acts).find(x => x.id === id);
Object.assign(A, {
  pAtt(d, el) { const sid = S.st, k = el.dataset.k, r = db.att[d] ??= {}; if (r[sid] === k) delete r[sid]; else r[sid] = k; if (!Object.keys(r).length) delete db.att[d]; save(); render(true); },
  pAttDel(d) { const r = db.att[d]; if (!r) return; delete r[S.st]; if (!Object.keys(r).length) delete db.att[d]; save(); render(true); toast('ثبت این روز حذف شد'); },
  pAttAll() { S.pAttAll = !S.pAttAll; render(true); },
  pAttAdd() {
    const s = stuOf(S.st); if (!s) return;
    dlgOpen('ثبت حضور و غیاب — ' + esc(s.name), `<div class="fg">${field('date', 'تاریخ', S.date, 'date')}<label class="f">وضعیت<select name="k">${Object.entries(ST).map(([k, t]) => `<option value="${k}" ${k === 'a' ? 'selected' : ''}>${t}</option>`).join('')}</select></label></div><div class="sub">اگر برای این روز قبلاً وضعیتی ثبت شده باشد، جایگزین می‌شود. برای سایر دانش‌آموزان تغییری ایجاد نمی‌شود.</div>`, d => { if (!d.date) return false; (db.att[d.date] ??= {})[s.id] = d.k; save(); render(true); toast('ثبت شد'); });
  },
  openExam(id) { S.view = 'exams'; S.ex = id; S.exCourse = ''; S.fid = ''; S.fq = ''; render(); },
  openRec(_, el) { const k = el.dataset.kind; S.view = k; if (k === 'tasks') S.tk = el.dataset.id; else S.ak = el.dataset.id; S.fid = ''; S.fq = ''; S.kon = false; render(); },
  pRec(id, el) {
    const t = recOf(el.dataset.kind, id); if (!t) return; const r = t.res[S.st] ??= {}; delete r.auto;
    if (r.st === el.dataset.k) delete r.st; else r.st = el.dataset.k;
    if (!r.st && r.sc == null) delete t.res[S.st]; save(); render(true);
  },
});
document.addEventListener('change', e => {
  const i = e.target; if (S.view !== 'profile' || !db) return;
  if (i.classList.contains('pex')) {
    const ex = db.exams.find(x => x.id === i.dataset.id); if (!ex || ex.calc) return;
    if (i.value === '') delete ex.scores[S.st]; else ex.scores[S.st] = Math.min(ex.max, Math.max(0, +i.value));
    save(); render(true); toast('نمره ذخیره شد');
  } else if (i.classList.contains('prc')) {
    const t = recOf(i.dataset.kind, i.dataset.id); if (!t) return; const r = t.res[S.st] ??= {}; delete r.auto;
    if (i.value === '') delete r.sc; else r.sc = Math.min(t.max, Math.max(0, +i.value));
    if (!r.st && r.sc == null) delete t.res[S.st]; save(); render(true); toast('نمره ذخیره شد');
  }
});
