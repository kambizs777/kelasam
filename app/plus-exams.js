'use strict';
/* =====================================================================
   plus-exams.js (نسخه 2.6) — ابزارهای بخش «آزمون‌ها»
   ۱) تعدیل نمرات یک آزمون (افزودن/کاهش نمره به همه یا گروهی از دانش‌آموزان، با پیش‌نمایش زنده)
   ۲) خروجی اکسل هر آزمون        ۳) جدول «نمره سبزها» (تصویر یا اکسل؛ در فایل plus-exams2.js)
   ===================================================================== */

const nfa = (v, d = 2) => v == null || isNaN(v) ? '—' : fa(+(+v).toFixed(d), d);
const examOf = id => (db && db.exams.find(e => e.id === id)) || null;

/* ---------------------------------------------------------------
   ۱) تعدیل نمرات
   --------------------------------------------------------------- */
const ADJ_MODES = {
  add: ['افزودن / کاهش مقدار ثابت', 'مثلاً نیم‌نمره به همه‌ی نمره‌ها اضافه شود'],
  pct: ['افزودن / کاهش درصدی از نمره‌ی خودش', 'مثلاً ۱۰٪ افزایش: نمره‌ی ۱۰ می‌شود ۱۱'],
  floor: ['حداقل نمره', 'هر نمره‌ای کمتر از عدد انتخابی بود، به همان عدد برسد'],
  curve: ['بالاترین نمره = نمره کامل (تعدیل خطی)', 'همه‌ی نمره‌ها به نسبت بالاترین نمره‌ی کلاس بالا می‌روند'],
};
function adjCompute(e, o) {
  const out = new Map(), ids = Object.keys(e.scores).filter(k => e.scores[k] != null && stuOf(k));
  const top = Math.max(0, ...ids.map(k => +e.scores[k]));
  ids.forEach(sid => {
    const old = +e.scores[sid]; let hit = true;
    if (o.who === 'lt') hit = old < o.thr; else if (o.who === 'gte') hit = old >= o.thr; else if (o.who === 'pick') hit = o.pick.has(sid);
    let nv = old;
    if (hit) {
      if (o.mode === 'add') nv = old + o.sign * o.val;
      else if (o.mode === 'pct') nv = old * (1 + o.sign * o.val / 100);
      else if (o.mode === 'floor') nv = Math.max(old, o.val);
      else if (o.mode === 'curve') nv = top > 0 ? old * e.max / top : old;
    }
    let capped = false;
    if (o.round > 0) nv = Math.round(nv / o.round) * o.round;
    if (o.cap && nv > e.max) { nv = e.max; capped = true; }
    if (nv < 0) nv = 0;
    nv = +nv.toFixed(2);
    out.set(sid, { old, nv, hit: hit && nv !== old, capped });
  });
  return out;
}
function adjText(e, o, n) {
  const w = o.who === 'all' ? 'همه' : o.who === 'lt' ? `نمره‌های کمتر از ${nfa(o.thr)}` : o.who === 'gte' ? `نمره‌های ${nfa(o.thr)} و بالاتر` : `${fa(o.pick.size, 0)} دانش‌آموز انتخاب‌شده`;
  const m = o.mode === 'add' ? `${o.sign > 0 ? 'افزودن' : 'کاهش'} ${nfa(o.val)} نمره` : o.mode === 'pct' ? `${o.sign > 0 ? 'افزایش' : 'کاهش'} ${nfa(o.val)}٪` : o.mode === 'floor' ? `حداقل نمره ${nfa(o.val)}` : 'تعدیل خطی تا نمره کامل';
  return `${m} — ${w} (${fa(n, 0)} نمره تغییر کرد)`;
}
function adjustDialog(id) {
  const e = examOf(id); if (!e) return;
  if (!Object.keys(e.scores).length) return toast('این آزمون هنوز نمره‌ای ندارد');
  const o = { mode: 'add', sign: 1, val: 0.5, who: 'all', thr: Math.round(e.max / 2), pick: new Set(), cap: true, round: 0 };
  const d = $('#dlg');
  d.innerHTML = `<form onsubmit="return false" class="adj"><h3>⚖️ تعدیل نمرات — ${esc(e.title)} (${esc(courseOf(e.courseId)?.name || '')})</h3>
  <div class="sub" style="margin:0">نمره‌ی کل این آزمون: ${fa(e.max)} — تغییرات پیش از اعمال در جدول پایین دیده می‌شود. بعد از اعمال هم با «واگرد» می‌توانید برگردانید.</div>
  <div class="fg"><label class="f" style="grid-column:1/-1">روش تعدیل<select id="aMode">${Object.entries(ADJ_MODES).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join('')}</select><small class="sub" id="aModeSub"></small></label>
  <label class="f" id="aSignW">جهت<select id="aSign"><option value="1">افزایش (+)</option><option value="-1">کاهش (−)</option></select></label>
  <label class="f" id="aValW"><span id="aValL">مقدار (نمره)</span><input id="aVal" type="number" inputmode="decimal" step="0.05" min="0" value="0.5"></label>
  <label class="f">اعمال روی<select id="aWho"><option value="all">همه‌ی دانش‌آموزان</option><option value="lt">فقط نمره‌های کمتر از …</option><option value="gte">فقط نمره‌های … و بالاتر</option><option value="pick">دانش‌آموزان انتخابی</option></select></label>
  <label class="f" id="aThrW" hidden>حد نمره<input id="aThr" type="number" inputmode="decimal" step="0.25" value="${o.thr}"></label>
  <label class="f">گرد کردن نتیجه<select id="aRound"><option value="0">بدون گرد کردن</option><option value="0.25">به ۰٫۲۵</option><option value="0.5">به ۰٫۵</option><option value="1">عدد صحیح</option></select></label></div>
  <label class="ck"><input type="checkbox" id="aCap" checked><span><b>از نمره‌ی کل بالاتر نرود</b><small>مثلاً نمره‌ی ۱۹٫۷۵ با نیم‌نمره اضافه، ${fa(e.max)} می‌شود (نه ۲۰٫۲۵)</small></span></label>
  <div id="aPickW" hidden><div class="row" style="margin:4px 0"><button type="button" class="btn sec sm" id="aPA">همه</button><button type="button" class="btn sec sm" id="aPN">هیچ‌کدام</button></div><div class="mbl">${db.students.filter(s => e.scores[s.id] != null).map(s => `<label class="ck mb"><input type="checkbox" data-p="${s.id}"><span>${esc(s.name)}<small>${nfa(e.scores[s.id])}</small></span></label>`).join('')}</div></div>
  <div id="aSum" class="row" style="margin:4px 0"></div>
  <div class="tw" style="max-height:240px"><table id="aTb"></table></div>
  <div class="row"><button type="button" class="btn" id="aOk">✓ اعمال تعدیل</button><button type="button" class="btn sec" data-close>انصراف</button></div></form>`;
  d.querySelector('[data-close]').onclick = () => d.close();
  const q = s => d.querySelector(s);
  const read = () => {
    o.mode = q('#aMode').value; o.sign = +q('#aSign').value; o.val = Math.max(0, +q('#aVal').value || 0); o.who = q('#aWho').value; o.thr = +q('#aThr').value || 0; o.cap = q('#aCap').checked; o.round = +q('#aRound').value;
    o.pick = new Set([...d.querySelectorAll('[data-p]:checked')].map(x => x.dataset.p));
    q('#aModeSub').textContent = ADJ_MODES[o.mode][1];
    q('#aSignW').hidden = !(o.mode === 'add' || o.mode === 'pct'); q('#aValW').hidden = o.mode === 'curve';
    q('#aValL').textContent = o.mode === 'pct' ? 'درصد (٪)' : o.mode === 'floor' ? 'حداقل نمره' : 'مقدار (نمره)';
    q('#aThrW').hidden = !(o.who === 'lt' || o.who === 'gte'); q('#aPickW').hidden = o.who !== 'pick';
    const r = adjCompute(e, o), rows = [...r.entries()].map(([sid, x]) => ({ s: stuOf(sid), ...x })).sort((a, b) => (b.hit - a.hit) || a.s.name.localeCompare(b.s.name, 'fa'));
    const chg = rows.filter(x => x.hit), m0 = mean(rows.map(x => x.old)), m1 = mean(rows.map(x => x.nv));
    q('#aSum').innerHTML = `<span class="pill ${chg.length ? 'ok' : 'warn'}">${fa(chg.length, 0)} نمره تغییر می‌کند</span><span class="pill">میانگین: ${nfa(m0)} ← <b>${nfa(m1)}</b></span>${rows.some(x => x.capped) ? `<span class="pill warn">${fa(rows.filter(x => x.capped).length, 0)} نمره به سقف رسید</span>` : ''}`;
    q('#aTb').innerHTML = `<tr><th>دانش‌آموز</th><th class="num">قبل</th><th class="num">بعد</th><th class="num">تغییر</th></tr>` + rows.map(x => `<tr style="${x.hit ? 'background:#f1fbf4' : 'opacity:.55'}"><td>${esc(x.s.name)}</td><td class="num">${nfa(x.old)}</td><td class="num"><b>${nfa(x.nv)}</b></td><td class="num">${x.hit ? `<span class="pill ${x.nv > x.old ? 'ok' : 'bad'}">${x.nv > x.old ? '+' : '−'}${nfa(Math.abs(x.nv - x.old))}</span>` : '—'}</td></tr>`).join('');
    q('#aOk').disabled = !chg.length; return r;
  };
  d.querySelectorAll('select,input').forEach(i => { i.oninput = read; i.onchange = read; });
  q('#aPA').onclick = () => { d.querySelectorAll('[data-p]').forEach(x => { x.checked = true; }); read(); }; q('#aPN').onclick = () => { d.querySelectorAll('[data-p]').forEach(x => { x.checked = false; }); read(); };
  q('#aOk').onclick = () => {
    const r = read(), n = [...r.values()].filter(x => x.hit).length; if (!n) return;
    r.forEach((x, sid) => { if (x.hit) e.scores[sid] = x.nv; });
    (e.adj ??= []).push({ t: Date.now(), d: adjText(e, o, n) });
    save(); d.close(); render(true); toast(`تعدیل اعمال شد (${fa(n, 0)} نمره). برای برگرداندن، «واگرد» را بزنید`);
  };
  read(); if (!d.open) d.showModal();
}

/* ---------------------------------------------------------------
   ۲) خروجی اکسل یک آزمون
   --------------------------------------------------------------- */
function examExcel(id) {
  const e = examOf(id); if (!e) return;
  const k = courseOf(e.courseId), ps = pass();
  const list = db.students.map(s => ({ s, v: e.scores[s.id], n: norm(e, s.id) }));
  const ranked = list.filter(x => x.n != null).sort((a, b) => b.n - a.n), rk = new Map(); let last = null, pos = 0;
  ranked.forEach((x, i) => { if (x.n !== last) { pos = i + 1; last = x.n; } rk.set(x.s.id, pos); });
  const heads = ['ردیف', 'نام آزمون', 'درس', 'کلاس', 'تاریخ آزمون', 'نام و نام خانوادگی', 'نام پدر', 'کد ملی', 'نمره', 'نمره‌ی کل', 'نمره از ۲۰', 'وضعیت', 'رتبه'];
  const rows = list.map((x, i) => [i + 1, e.title, k ? k.name : '', db.name, jd(e.date), x.s.name, x.s.father || '', x.s.nid || '',
    x.v == null ? '' : { v: +x.v, s: gradeSt(x.n, ps) }, e.max, x.n == null ? '' : { v: +x.n.toFixed(2), s: gradeSt(x.n, ps) },
    x.n == null ? { v: 'نمره ندارد', s: { fc: '868E96' } } : x.n >= ps ? { v: 'قبول', s: { fc: XLC.grnD, b: 1 } } : { v: 'مردود', s: { fc: XLC.redD, b: 1 } }, x.n == null ? '' : rk.get(x.s.id)]);
  const vals = ranked.map(x => x.n);
  const sh = xTable(`${e.title} — ${k ? k.name : ''} — کلاس ${db.name}`, `${schoolName()} · ${jd(e.date)} · نمره‌ی کل ${e.max} · ${schoolName() ? '' : ''}معلم: ${R.meta.teacher || '—'}`, heads, rows, { left: [1, 2, 5], w: [6, 20, 14, 12, 14, 24, 14, 14, 9, 9, 11, 11, 7], band: XLC.blueD });
  const r0 = 4 + rows.length + 1, put = (c, t, v, o = {}) => { sh.put(r0 + c, 0, t, Object.assign({ b: 1, bg: XLC.light, h: 'right' }, o), 3); sh.put(r0 + c, 3, v, Object.assign({ b: 1 }, o)); };
  put(0, 'تعداد شرکت‌کننده', vals.length); put(1, 'میانگین (از ۲۰)', vals.length ? +mean(vals).toFixed(2) : '—'); put(2, 'بالاترین نمره (از ۲۰)', vals.length ? +Math.max(...vals).toFixed(2) : '—'); put(3, 'پایین‌ترین نمره (از ۲۰)', vals.length ? +Math.min(...vals).toFixed(2) : '—');
  put(4, 'تعداد قبول', vals.filter(v => v >= ps).length, { fc: XLC.grnD }); put(5, 'تعداد مردود', vals.filter(v => v < ps).length, { fc: XLC.redD });
  const wb = XLSX.utils.book_new(); wb.Workbook = { Views: [{ RTL: true }] };
  XLSX.utils.book_append_sheet(wb, sh.ws(), 'نمرات آزمون');
  xlsxOut(wb, `kelasam-آزمون-${(k ? k.name + '-' : '') + e.title}-${db.name}-${iso(new Date())}.xlsx`.replace(/[\\\/:*?"<>|]/g, ' '));
}

/* ---------------------------------------------------------------
   اتصال به صفحه‌ی آزمون‌ها
   --------------------------------------------------------------- */
Object.assign(A, {
  adjExam(id) { adjustDialog(id); },
  exExcel(id) { examExcel(id); },
  gotoCalc() { S.view = 'calc'; render(); },
  adjLog(id) { const e = examOf(id); if (e) alert((e.adj || []).map(x => when(x.t) + '\n  ' + x.d).join('\n\n') || 'تعدیلی ثبت نشده'); },
});
