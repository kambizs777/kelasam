'use strict';
/* =====================================================================
   plus-beh.js (نسخه 2.6) — تکمیل بخش «رفتار»
   • دلایل آماده (مثل ClassDojo): با یک لمس توضیح رفتار پر می‌شود؛ فهرست دلایل قابل ویرایش است
   • ثبت گروهی: یک رفتار برای چند دانش‌آموز یا همه‌ی کلاس
   • پنجره‌ی کوچک «تنظیمات رفتار»: پاک‌کردن گروهی (مثلاً همه‌ی رفتارهای منفی)، مبنای امتیاز، دلایل آماده، هشدار رفتاری
   • نمودار توزیع رفتارها و امتیاز هر دانش‌آموز در پایین صفحه
   ===================================================================== */
const BEH_REASONS0 = {
  r: ['درگیری با همکلاسی', 'بی‌احترامی', 'تخریب وسایل'],
  y: ['صحبت بی‌اجازه', 'فراموشی لوازم یا تکلیف', 'تأخیر در ورود', 'بی‌توجهی در کلاس'],
  g: ['مشارکت فعال', 'کمک به همکلاسی', 'نظم و آرامش'],
  G: ['پاسخ عالی', 'ابتکار و خلاقیت', 'رفتار الگو'],
  w: ['تماس با ولی', 'نیاز به پیگیری'],
};
const behReasons = t => ((R.meta.behReasons && R.meta.behReasons[t]) || BEH_REASONS0[t] || []);
const behAlert = () => (R.meta.behAlert == null ? -3 : +R.meta.behAlert);

/* دلیل‌های آماده زیر کادر «توضیح» نشان داده می‌شود */
function behReasonChips(sel, note) {
  const box = document.createElement('div'); box.className = 'chips reasons'; note.parentElement.before(box);
  const draw = () => {
    const L = behReasons(sel.value); box.innerHTML = L.length ? `<small class="sub">دلیل آماده:</small>` + L.map(x => `<button type="button" class="cc">${esc(x)}</button>`).join('') : '';
    box.querySelectorAll('.cc').forEach(b => b.onclick = () => { const v = note.value.trim(); note.value = v ? (v.includes(b.textContent) ? v : v + '، ' + b.textContent) : b.textContent; note.focus(); });
  };
  const prev = sel.onchange; sel.onchange = e => { if (prev) prev(e); draw(); }; draw();
}

/* ---------------------------------------------------------------
   ثبت گروهی
   --------------------------------------------------------------- */
function behGroupDialog() {
  const d = $('#dlg'), st = { t: 'g' };
  d.innerHTML = `<form onsubmit="return false"><h3>👥 ثبت گروهی رفتار — ${esc(db.name)}</h3>
  <div class="sub" style="margin:0">یک رفتار را برای چند نفر (یا همه‌ی کلاس) با هم ثبت کنید؛ مثلاً «سبز برای همه‌ی گروه شماره ۲».</div>
  <div class="fg"><label class="f">نوع<select id="gT">${Object.entries(BEH).map(([k, v]) => `<option value="${k}" ${k === st.t ? 'selected' : ''}>${v.t} (${pt(k)})</option>`).join('')}</select></label>${field('date', 'تاریخ', S.date, 'date')}
  <label class="f">درس<select id="gC"><option value="">— بدون درس (عمومی) —</option>${db.courses.map(k => `<option value="${k.id}" ${k.id === S.bc ? 'selected' : ''}>${esc(k.name)}</option>`).join('')}</select></label></div>
  <label class="f">توضیح<textarea id="gN" rows="2" placeholder="اختیاری (برای «یادداشت» لازم است)"></textarea></label>
  <div class="row"><b>دانش‌آموزان:</b><button type="button" class="btn sec sm" id="gA">همه</button><button type="button" class="btn sec sm" id="gZ">هیچ‌کدام</button><span class="sub" id="gCnt"></span></div>
  <div class="mbl">${db.students.map(s => `<label class="ck mb"><input type="checkbox" data-s="${s.id}"><span>${esc(s.name)}</span></label>`).join('')}</div>
  <div class="row"><button type="button" class="btn" id="gOk">ثبت برای انتخاب‌شده‌ها</button><button type="button" class="btn sec" data-close>انصراف</button></div></form>`;
  d.querySelector('[data-close]').onclick = () => d.close();
  const q = s => d.querySelector(s), cnt = () => { q('#gCnt').textContent = fa(d.querySelectorAll('[data-s]:checked').length, 0) + ' نفر انتخاب شده'; };
  d.querySelectorAll('[data-s]').forEach(i => i.onchange = cnt); q('#gA').onclick = () => { d.querySelectorAll('[data-s]').forEach(i => { i.checked = true; }); cnt(); }; q('#gZ').onclick = () => { d.querySelectorAll('[data-s]').forEach(i => { i.checked = false; }); cnt(); }; cnt();
  behReasonChips(q('#gT'), q('#gN'));
  q('#gOk').onclick = () => {
    const ids = [...d.querySelectorAll('[data-s]:checked')].map(i => i.dataset.s), t = q('#gT').value, note = q('#gN').value.trim(), date = d.querySelector('input[name=date]').value || S.date;
    if (!ids.length) return toast('حداقل یک دانش‌آموز را انتخاب کنید'); if (t === 'w' && !note) return toast('برای یادداشت، توضیح لازم است');
    ids.forEach(sid => db.beh.push({ id: uid(), sid, date, t, note, cid: q('#gC').value || '' }));
    save(); d.close(); render(true); toast(`${BEH[t].t} برای ${fa(ids.length, 0)} نفر ثبت شد`);
  };
  d.showModal();
}

/* ---------------------------------------------------------------
   تنظیمات رفتار (پنجره‌ی کوچک)
   --------------------------------------------------------------- */
function behSettings() {
  const d = $('#dlg'), T = termClasses();
  d.innerHTML = `<form onsubmit="return false" class="bset"><h3>⚙️ تنظیمات رفتار</h3>
  <details open><summary>🧹 پاک‌کردن گروهی رفتارها</summary>
    <div class="sub" style="margin:4px 0">ابتدا انتخاب می‌کنید چه چیزی پاک شود؛ تعداد موردها همان لحظه نشان داده می‌شود و قبل از پاک‌شدن یک پشتیبان خودکار گرفته می‌شود.</div>
    <div class="row" id="dTypes">${['r', 'y', 'g', 'G', 'w'].map(k => `<label class="ck" style="padding:6px 10px"><input type="checkbox" data-t="${k}" ${k === 'r' || k === 'y' ? 'checked' : ''}><span><span class="pill" style="${chipStyle(k)}">${BEH[k].t}</span></span></label>`).join('')}<button type="button" class="btn sec sm" id="dNeg">فقط منفی‌ها</button><button type="button" class="btn sec sm" id="dPos">فقط مثبت‌ها</button><button type="button" class="btn sec sm" id="dAll">همه</button></div>
    <div class="fg"><label class="f">محدوده<select id="dScope"><option value="c">فقط همین کلاس (${esc(db.name)})</option>${T.length > 1 ? `<option value="t">همه‌ی کلاس‌های این ترم</option>` : ''}</select></label>
    <label class="f">درس<select id="dCourse"><option value="*">همه (با هر درس یا بدون درس)</option>${db.courses.map(k => `<option value="${k.id}">${esc(k.name)}</option>`).join('')}</select></label>
    <label class="f">دانش‌آموز<select id="dStu"><option value="*">همه‌ی دانش‌آموزان</option>${db.students.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></label>
    <label class="f">از تاریخ ${jdate('', '', 'id=dFrom data-clear=1')}</label><label class="f">تا تاریخ ${jdate('', '', 'id=dTo data-clear=1')}</label></div>
    <div class="row"><span class="pill warn" id="dCount"></span><button type="button" class="btn bad" id="dGo">🗑 پاک کن</button></div></details>
  <details><summary>🎯 مبنای امتیاز و هشدار</summary><div class="fg">${behStepFields(db)}<label class="f">هشدار رفتاری (امتیاز برابر یا کمتر از)<input id="sAlert" type="number" step="0.5" value="${behAlert()}"><small class="sub">در صفحه‌ی رفتار، کنار نام دانش‌آموزی که به این امتیاز برسد ⚠️ می‌آید. برای خاموش‌کردن عدد ۰ را بنویسید.</small></label></div></details>
  <details><summary>💬 دلایل آماده (هر خط یک دلیل)</summary><div class="fg">${['r', 'y', 'g', 'G', 'w'].map(k => `<label class="f"><span class="pill" style="${chipStyle(k)}">${BEH[k].t}</span><textarea rows="4" data-r="${k}">${esc(behReasons(k).join('\n'))}</textarea></label>`).join('')}</div></details>
  <div class="row"><button type="button" class="btn" id="sOk">ذخیره‌ی تنظیمات</button><button type="button" class="btn sec" data-close>بستن</button></div></form>`;
  d.querySelector('[data-close]').onclick = () => d.close();
  const q = s => d.querySelector(s);
  const chosen = () => new Set([...d.querySelectorAll('[data-t]:checked')].map(i => i.dataset.t));
  const target = () => {
    const ts = chosen(), cs = q('#dScope').value === 't' ? T : [db], cv = q('#dCourse').value, sv = q('#dStu').value, f = (q('#dFrom').value || ''), to = (q('#dTo').value || ''), out = [];
    cs.forEach(c => c.beh.forEach(b => { if (!ts.has(b.t)) return; if (cv !== '*' && (c !== db || b.cid !== cv)) return; if (sv !== '*' && (c !== db || b.sid !== sv)) return; if (f && b.date < f) return; if (to && b.date > to) return; out.push([c, b]); }));
    return out;
  };
  const upd = () => { const n = target().length; q('#dCount').textContent = n ? `${fa(n, 0)} مورد پاک می‌شود` : 'موردی با این شرایط نیست'; q('#dGo').disabled = !n; };
  d.querySelectorAll('#dTypes input,#dScope,#dCourse,#dStu').forEach(i => i.onchange = upd);
  ['#dFrom', '#dTo'].forEach(i => q(i).addEventListener('change', upd));
  const setT = L => { d.querySelectorAll('[data-t]').forEach(i => { i.checked = L.includes(i.dataset.t); }); upd(); };
  q('#dNeg').onclick = () => setT(['r', 'y']); q('#dPos').onclick = () => setT(['g', 'G']); q('#dAll').onclick = () => setT(['r', 'y', 'g', 'G', 'w']);
  q('#dGo').onclick = () => {
    const L = target(); if (!L.length) return;
    const names = [...chosen()].map(k => BEH[k].t).join('، ');
    if (!confirm(`${fa(L.length, 0)} رفتار از نوع «${names}» پاک شود؟\n(قبل از پاک‌شدن یک پشتیبان خودکار گرفته می‌شود و با «واگرد» هم می‌توانید برگردانید.)`)) return;
    snapNow('قبل از پاک‌کردن گروهی رفتارها'); const ids = new Set(L.map(x => x[1].id)); R.classes.forEach(c => { c.beh = c.beh.filter(b => !ids.has(b.id)); });
    save(); d.close(); render(true); toast(`${fa(L.length, 0)} رفتار پاک شد`);
  };
  q('#sOk').onclick = () => {
    const rs = {}; d.querySelectorAll('[data-r]').forEach(t => { rs[t.dataset.r] = t.value.split('\n').map(x => x.trim()).filter(Boolean); });
    const fd = {}; d.querySelectorAll('[name^=bstep],[name^=bp_]').forEach(i => { fd[i.name] = i.value; });
    R.meta = Object.assign({}, R.meta, { behReasons: rs, behAlert: +q('#sAlert').value || 0 });
    try { if (fd.bstep) readStep(fd, db); } catch { }
    save(); d.close(); render(true); toast('تنظیمات رفتار ذخیره شد');
  };
  upd(); d.showModal();
}

/* ---------------------------------------------------------------
   صفحه‌ی رفتار: دکمه‌های تازه، هشدار و نمودار
   --------------------------------------------------------------- */
(function wrapBehView() {
  const base = VIEWS.beh;
  VIEWS.beh = function () {
    let tot, L;
    V.post = root => {
      const row = root.querySelector('.top .row'); if (row) row.insertAdjacentHTML('afterbegin', `<button class="btn sec" data-act="behGroup" title="ثبت یک رفتار برای چند نفر یا همه">👥 ثبت گروهی</button><button class="btn sec" data-act="behSettings" title="پاک‌کردن گروهی، مبنای امتیاز، دلایل آماده">⚙️ تنظیمات</button>`);
      const al = behAlert();
      root.querySelectorAll('.brow').forEach(r => { const a = r.querySelector('a.nl'); if (!a || !al) return; const sc = behCount(a.dataset.id, db, S.bf, S.bt, S.bc).score; if (sc <= al) a.insertAdjacentHTML('afterend', ` <span class="pill bad" title="امتیاز رفتاری ${sgn(sc)} — به حد هشدار (${sgn(al)}) رسیده">⚠️ ${sgn(sc)}</span>`); });
      if (!db.beh.length) return;
      tot = { r: 0, y: 0, g: 0, G: 0, w: 0 }; db.beh.forEach(b => { if (tot[b.t] != null && (!S.bc || b.cid === S.bc)) tot[b.t]++; });
      L = db.students.map(s => ({ s, c: behCount(s.id, db, S.bf, S.bt, S.bc) })).sort((a, b) => b.c.score - a.c.score);
      root.insertAdjacentHTML('beforeend', `<div class="grid g2" style="margin-top:16px"><div class="card"><h3>📊 توزیع رفتارهای ثبت‌شده</h3><div class="chart" style="height:240px"><canvas id="bc1"></canvas></div></div><div class="card"><h3>🏅 امتیاز رفتاری هر دانش‌آموز</h3><div class="chart" style="height:${Math.max(240, L.length * 22 + 40)}px"><canvas id="bc2"></canvas></div></div></div>`);
    };
    V.after = () => {
      if (!tot) return;
      mkChart('bc1', { type: 'doughnut', data: { labels: ['r', 'y', 'g', 'G', 'w'].map(k => BEH[k].t), datasets: [{ data: ['r', 'y', 'g', 'G', 'w'].map(k => tot[k]), backgroundColor: ['#d64545', '#f2c400', '#8ccf7e', '#1f9d63', '#ced4da'], borderWidth: 2 }] }, options: { cutout: '58%', plugins: { legend: { display: true, position: 'bottom', labels: { usePointStyle: true } } } } });
      mkChart('bc2', { type: 'bar', data: { labels: L.map(x => x.s.name), datasets: [{ data: L.map(x => +x.c.score.toFixed(2)), backgroundColor: L.map(x => x.c.score < 0 ? '#d64545bb' : '#1f9d63bb'), borderRadius: 5 }] }, options: { indexAxis: 'y', scales: { x: { ticks: tickFa }, y: { ticks: { autoSkip: false, font: { size: 11 } } } } } });
    };
    base();
  };
})();
Object.assign(A, { behGroup() { behGroupDialog(); }, behSettings() { behSettings(); } });
