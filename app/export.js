'use strict';
/* =====================================================================
   خروجی اکسل رنگی و گرافیکی (نیاز به xlsx-js-style)
   صفحه «گزارش کلی» با کادرهای خلاصه و نمودار میله‌ای متنی + جدول‌های رنگی با نمره‌های «نقشه حرارتی»
   ===================================================================== */
const XLC = { dark: '0B7285', mid: '15AABF', light: 'E3FAFC', zebra: 'F4FBFC', white: 'FFFFFF', ink: '16282D', mute: '5C7378', red: 'D64545', redL: 'FDE6E6', redD: 'B42626', yel: 'F2C400', yelL: 'FFF3BF', yelD: '7A5C00', grn: '1F9D63', grnL: 'DFF4EA', grnM: '8CCF7E', grnD: '0B6B2E', blueL: 'DCEBFA', blueD: '1C5FA8', pur: '7048E8', purL: 'EDE7FF', org: 'F08C00', orgL: 'FFE8CC', gold: 'FFD43B', silver: 'DEE2E6', bronze: 'F6C9A3', line: 'CFE3E7' };
const xlB = { style: 'thin', color: { rgb: XLC.line } };
const xlBorder = { top: xlB, bottom: xlB, left: xlB, right: xlB };
function xs(o = {}) {
  return {
    font: { name: (typeof XLFONT === 'string' ? XLFONT : 'Tahoma'), sz: o.sz || 11, bold: !!o.b, color: { rgb: o.fc || XLC.ink } },
    fill: o.bg ? { patternType: 'solid', fgColor: { rgb: o.bg } } : { patternType: 'none' },
    alignment: { horizontal: o.h || 'center', vertical: 'center', wrapText: o.wrap !== false, textRotation: o.rot || 0, readingOrder: 2 },
    border: o.nb ? {} : xlBorder
  };
}
const xBar = (v, max, n = 12) => { const k = Math.max(0, Math.min(n, Math.round((v || 0) / max * n))); return '█'.repeat(k) + '░'.repeat(n - k); };
const gradeSt = (v, pass) => v === '' || v == null ? {} : v < pass ? { bg: XLC.redL, fc: XLC.redD, b: 1 } : v < 14 ? { bg: XLC.yelL, fc: XLC.yelD } : v < 17 ? { bg: 'E3F5DC', fc: '2C6B1D' } : { bg: 'B2F2BB', fc: XLC.grnD, b: 1 };
const pctSt = v => v === '' || v == null ? {} : v >= 90 ? { bg: XLC.grnL, fc: XLC.grnD, b: 1 } : v >= 75 ? { bg: XLC.yelL, fc: XLC.yelD } : { bg: XLC.redL, fc: XLC.redD, b: 1 };
const scoreSt = v => v === '' || v == null ? {} : v > 0 ? { bg: XLC.grnL, fc: XLC.grnD, b: 1 } : v < 0 ? { bg: XLC.redL, fc: XLC.redD, b: 1 } : {};

/* ساخت صفحه به‌صورت شبکه‌ای با ادغام سلول */
class XSheet {
  constructor() { this.c = {}; this.merges = []; this.rows = []; this.cols = []; this.maxR = 0; this.maxC = 0; this.filter = null; }
  put(r, c, v, o = {}, sc = 1, sr = 1) {
    const cell = { v: v == null ? '' : v, t: typeof v === 'number' ? 'n' : 's', s: xs(o) };
    this.c[XLSX.utils.encode_cell({ r, c })] = cell;
    for (let i = 0; i < sr; i++) for (let j = 0; j < sc; j++) if (i || j) this.c[XLSX.utils.encode_cell({ r: r + i, c: c + j })] = { v: '', t: 's', s: xs(o) };
    if (sc > 1 || sr > 1) this.merges.push({ s: { r, c }, e: { r: r + sr - 1, c: c + sc - 1 } });
    this.maxR = Math.max(this.maxR, r + sr - 1); this.maxC = Math.max(this.maxC, c + sc - 1);
  }
  height(r, h) { this.rows[r] = { hpt: h }; }
  ws() {
    const ws = Object.assign({}, this.c);
    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: this.maxR, c: this.maxC } });
    ws['!merges'] = this.merges; ws['!cols'] = this.cols; ws['!rows'] = this.rows;
    if (this.filter) ws['!autofilter'] = { ref: this.filter };
    return ws;
  }
}
/* جدول استاندارد: عنوان، زیرعنوان، سرستون رنگی، ردیف‌های راه‌راه */
function xTable(title, sub, heads, rows, opt = {}) {
  const sh = new XSheet(), n = heads.length, bandC = opt.band || XLC.dark;
  sh.put(0, 0, title, { sz: 18, b: 1, fc: XLC.white, bg: bandC, nb: 1 }, n); sh.height(0, 38);
  sh.put(1, 0, sub, { sz: 10.5, fc: XLC.mute, bg: XLC.light, nb: 1 }, n); sh.height(1, 22);
  sh.height(2, 6);
  heads.forEach((h, i) => { const hs = (opt.hs && opt.hs[i]) || {}; sh.put(3, i, h, { b: 1, fc: hs.fc || XLC.white, bg: hs.bg || XLC.mid, sz: 10.5, rot: opt.rot ? opt.rot : 0 }); });
  sh.height(3, opt.hh || 34);
  rows.forEach((row, ri) => {
    const bg = ri % 2 ? XLC.white : XLC.zebra;
    row.forEach((cell, ci) => {
      let v = cell, o = {};
      if (cell && typeof cell === 'object' && !Array.isArray(cell)) { v = cell.v; o = cell.s || {}; }
      const base = { bg, h: opt.left && opt.left.includes(ci) ? 'right' : 'center' };
      sh.put(4 + ri, ci, v, Object.assign(base, opt.col && opt.col[ci] ? opt.col[ci](v, row) : {}, o));
    });
    sh.height(4 + ri, opt.rh || 22);
  });
  sh.cols = heads.map((h, i) => ({ wch: (opt.w && opt.w[i]) || Math.max(8, Math.min(34, String(h).length * 1.1 + 3)) }));
  if (opt.filter !== false && rows.length) sh.filter = XLSX.utils.encode_range({ s: { r: 3, c: 0 }, e: { r: 3 + rows.length, c: n - 1 } });
  return sh;
}

const XL_SUM_H = ['ردیف', 'نام و نام خانوادگی', 'نام پدر', 'کد ملی', 'تاریخ تولد', 'تلفن ولی', 'نشانی', 'میانگین نمرات', 'رتبه در کلاس', 'روز حاضر', 'روز غایب', 'روز تأخیر', 'روز مجاز', 'درصد حضور', 'قرمز', 'زرد', 'سبز کمرنگ', 'سبز پررنگ', 'یادداشت (سفید)', 'جمع منفی‌ها', 'جمع مثبت‌ها', 'امتیاز رفتاری', 'تکلیف انجام‌شده', 'تکلیف انجام‌نشده', 'درصد انجام تکالیف', 'میانگین نمره تکالیف (از ۲۰)', 'فعالیت انجام‌شده', 'فعالیت انجام‌نشده', 'میانگین نمره فعالیت‌ها (از ۲۰)'];
const XL_SUM_HS = (() => { const g = (a, b, bg, fc = XLC.white) => { const o = {}; for (let i = a; i <= b; i++) o[i] = { bg, fc }; return o; }; return Object.assign([], g(0, 6, XLC.dark), g(7, 8, XLC.blueD), g(9, 13, XLC.grn), g(14, 21, XLC.org), g(22, 25, XLC.pur), g(26, 28, '0CA678'), { 14: { bg: XLC.red, fc: XLC.white }, 15: { bg: XLC.yel, fc: XLC.ink }, 16: { bg: XLC.grnM, fc: XLC.ink }, 17: { bg: XLC.grn, fc: XLC.white }, 18: { bg: 'F1F3F5', fc: XLC.ink } }); })();
function xlSumRows(c) {
  const rk = ranking(c);
  return c.students.map((s, i) => {
    const a = attCount(s.id, c), b = behCount(s.id, c), tc = taskCount(s.id, c), ac = actCount(s.id, c), av = stuAvg(s.id, c), r = rk.findIndex(x => x.s.id === s.id) + 1;
    const f = (v, d = 2) => v == null ? '' : +v.toFixed(d);
    return [i + 1, s.name, s.father, s.nid, s.birth, s.phone, s.address, f(av), r || '', a.p, a.a, a.l, a.e, f(a.pct, 0), b.r, b.y, b.g, b.G, b.w, b.neg, b.pos, +b.score.toFixed(2), tc.y, tc.n, f(tc.pct, 0), f(tc.avg), ac.y, ac.n, f(ac.avg)];
  });
}
function xlSummaryTable(c, title) {
  const ps = pass(), rows = xlSumRows(c).map(r => r.map((v, ci) => {
    if (ci === 7) return { v, s: gradeSt(v, ps) };
    if (ci === 8) return { v, s: v === 1 ? { bg: XLC.gold, b: 1 } : v === 2 ? { bg: XLC.silver, b: 1 } : v === 3 ? { bg: XLC.bronze, b: 1 } : {} };
    if (ci === 10 && v > 0) return { v, s: { fc: XLC.redD, b: 1 } };
    if (ci === 13) return { v, s: pctSt(v) };
    if (ci === 21) return { v, s: scoreSt(v) };
    if (ci === 25 || ci === 28) return { v, s: gradeSt(v, ps) };
    if (ci === 24 && v !== '') return { v, s: pctSt(v) };
    return v;
  }));
  const sh = xTable(title, `معلم: ${R.meta.teacher || '—'}  ·  سال تحصیلی: ${R.meta.year || '—'}  ·  تاریخ گزارش: ${jd(iso(new Date()))}`, XL_SUM_H, rows, { hs: XL_SUM_HS, left: [1, 2, 6], w: [6, 22, 16, 13, 12, 14, 24, 11, 9, 8, 8, 8, 8, 10, 8, 8, 9, 9, 10, 9, 9, 10, 10, 10, 11, 13, 10, 10, 13], hh: 46 });
  // ردیف میانگین
  const r0 = 4 + rows.length, num = i => { const v = rows.map(r => (r[i] && typeof r[i] === 'object' ? r[i].v : r[i])).filter(x => typeof x === 'number'); return v.length ? +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(2) : ''; };
  if (rows.length) { sh.put(r0, 0, 'جمع / میانگین کلاس', { b: 1, bg: XLC.light, fc: XLC.dark }, 7); [7, 13, 21, 24, 25].forEach(i => sh.put(r0, i, num(i), { b: 1, bg: XLC.light, fc: XLC.dark })); for (let i = 8; i < 29; i++) if (![13, 21, 24, 25].includes(i)) sh.put(r0, i, i >= 9 && i <= 12 || i >= 14 && i <= 20 || i === 22 || i === 23 || i >= 26 && i <= 27 ? (() => { const v = rows.map(r => r[i]).filter(x => typeof x === 'number'); return v.length ? +v.reduce((a, b) => a + b, 0).toFixed(0) : ''; })() : '', { b: 1, bg: XLC.light, fc: XLC.dark }); sh.height(r0, 26); }
  return sh;
}

/* ------- صفحه «گزارش کلی» (داشبورد) ------- */
function xlDashboard(c) {
  const sh = new XSheet(), W = 12, ps = pass(), rk = ranking(c), ca = classAvg(c);
  sh.cols = Array.from({ length: W }, () => ({ wch: 10.5 }));
  sh.put(0, 0, `گزارش کلی کلاس ${c.name}${c.grade ? ' — پایه ' + c.grade : ''}`, { sz: 22, b: 1, fc: XLC.white, bg: XLC.dark, nb: 1 }, W); sh.height(0, 46);
  sh.put(1, 0, `${R.meta.school || 'مدرسه'}  ·  معلم: ${R.meta.teacher || '—'}  ·  سال تحصیلی ${R.meta.year || '—'}  ·  ${jd(iso(new Date()))}`, { sz: 11, fc: XLC.dark, bg: XLC.light, nb: 1 }, W); sh.height(1, 24);
  sh.height(2, 10);
  const attAll = mean(c.students.map(s => attCount(s.id, c).pct).filter(v => v != null));
  let pos = 0, neg = 0; c.beh.forEach(b => { const p = bp(b.t, c); if (p > 0) pos++; else if (p < 0) neg++; });
  const tk = c.students.map(s => taskCount(s.id, c)), tY = tk.reduce((a, x) => a + x.y, 0), tN = tk.reduce((a, x) => a + x.n, 0);
  const tile = (r, col, label, val, bg) => { sh.put(r, col, label, { sz: 10.5, b: 1, fc: XLC.white, bg, nb: 1 }, 3); sh.put(r + 1, col, val, { sz: 24, b: 1, fc: XLC.white, bg, nb: 1 }, 3); };
  const row1 = 3, row2 = 6;
  tile(row1, 0, 'تعداد دانش‌آموزان', c.students.length, XLC.dark); tile(row1, 3, 'میانگین کلاس (از ۲۰)', ca == null ? '—' : +ca.toFixed(2), XLC.blueD); tile(row1, 6, 'میانگین حضور', attAll == null ? '—' : Math.round(attAll) + '٪', XLC.grn); tile(row1, 9, 'تعداد آزمون‌ها', c.exams.length, XLC.pur);
  tile(row2, 0, 'رفتارهای مثبت', pos, '2F9E44'); tile(row2, 3, 'رفتارهای منفی', neg, XLC.red); tile(row2, 6, 'تکلیف انجام‌شده', tY + tN ? Math.round(tY / (tY + tN) * 100) + '٪' : '—', XLC.org); tile(row2, 9, 'فعالیت و پروژه', c.acts.length, '0CA678');
  [row1, row1 + 1, row2, row2 + 1].forEach((r, i) => sh.height(r, i % 2 ? 40 : 22)); sh.height(5, 8);
  let r = 9;
  const section = (t, bg) => { sh.put(r, 0, t, { sz: 13, b: 1, fc: XLC.white, bg: bg || XLC.mid, nb: 1, h: 'right' }, W); sh.height(r, 26); r++; };
  // دروس
  if (c.courses.length) {
    section('📚 میانگین دروس', XLC.blueD);
    sh.put(r, 0, 'درس', { b: 1, bg: XLC.blueL, fc: XLC.blueD }, 3); sh.put(r, 3, 'میانگین (نمودار)', { b: 1, bg: XLC.blueL, fc: XLC.blueD }, 5); sh.put(r, 8, 'میانگین', { b: 1, bg: XLC.blueL, fc: XLC.blueD }); sh.put(r, 9, 'کمترین', { b: 1, bg: XLC.blueL, fc: XLC.blueD }); sh.put(r, 10, 'بیشترین', { b: 1, bg: XLC.blueL, fc: XLC.blueD }); sh.put(r, 11, 'ضریب', { b: 1, bg: XLC.blueL, fc: XLC.blueD }); r++;
    c.courses.forEach((k, i) => { const s = courseStats(k.id, c), g = gradeSt(s.avg, ps), bg = i % 2 ? XLC.white : XLC.zebra;
      sh.put(r, 0, k.name, { b: 1, bg, h: 'right' }, 3); sh.put(r, 3, s.avg == null ? '—' : xBar(s.avg, 20, 20), { bg, fc: s.avg == null ? XLC.mute : s.avg < ps ? XLC.red : s.avg < 14 ? XLC.org : s.avg < 17 ? '74B816' : XLC.grn, sz: 11, h: 'right' }, 5);
      sh.put(r, 8, s.avg == null ? '' : +s.avg.toFixed(2), Object.assign({ bg }, g)); sh.put(r, 9, s.min == null ? '' : +s.min.toFixed(2), { bg }); sh.put(r, 10, s.max == null ? '' : +s.max.toFixed(2), { bg }); sh.put(r, 11, k.coef, { bg }); sh.height(r, 22); r++; });
    r++;
  }
  const list = (title, bg, heads, items, spanName) => {
    section(title, bg);
    sh.put(r, 0, '#', { b: 1, bg: XLC.light, fc: XLC.dark }); sh.put(r, 1, 'دانش‌آموز', { b: 1, bg: XLC.light, fc: XLC.dark }, 7);
    heads.forEach((h, i) => sh.put(r, 8 + i * 2, h, { b: 1, bg: XLC.light, fc: XLC.dark }, 2)); r++;
    if (!items.length) { sh.put(r, 0, 'موردی وجود ندارد', { bg: XLC.zebra, fc: XLC.mute }, W); r++; }
    items.forEach((it, i) => { const b2 = i % 2 ? XLC.white : XLC.zebra, medal = i === 0 ? XLC.gold : i === 1 ? XLC.silver : i === 2 ? XLC.bronze : b2;
      sh.put(r, 0, i + 1, { bg: spanName ? medal : b2, b: 1 }); sh.put(r, 1, it.name, { bg: b2, h: 'right', b: 1 }, 7);
      it.vals.forEach((v, j) => sh.put(r, 8 + j * 2, v.v, Object.assign({ bg: b2 }, v.s || {}), 2)); sh.height(r, 22); r++; });
    r++;
  };
  list('🏆 پنج دانش‌آموز برتر', '2F9E44', ['میانگین', 'درصد حضور'], rk.slice(0, 5).map(x => ({ name: x.s.name, vals: [{ v: +x.avg.toFixed(2), s: gradeSt(x.avg, ps) }, { v: Math.round(attCount(x.s.id, c).pct ?? 0), s: pctSt(attCount(x.s.id, c).pct) }] })), true);
  list('⚠️ نیازمند توجه (کمترین میانگین‌ها)', XLC.red, ['میانگین', 'غیبت (روز)'], [...rk].reverse().slice(0, 5).map(x => ({ name: x.s.name, vals: [{ v: +x.avg.toFixed(2), s: gradeSt(x.avg, ps) }, { v: attCount(x.s.id, c).a, s: attCount(x.s.id, c).a > 3 ? { bg: XLC.redL, fc: XLC.redD, b: 1 } : {} }] })));
  list('🚫 بیشترین غیبت', XLC.org, ['روز غایب', 'روز تأخیر'], c.students.map(s => ({ s, a: attCount(s.id, c) })).filter(x => x.a.a > 0).sort((a, b) => b.a.a - a.a.a).slice(0, 5).map(x => ({ name: x.s.name, vals: [{ v: x.a.a, s: { bg: XLC.redL, fc: XLC.redD, b: 1 } }, { v: x.a.l }] })));
  list('🟢🔴 امتیاز رفتاری (بیشترین مثبت)', XLC.pur, ['امتیاز', 'منفی‌ها'], c.students.map(s => ({ s, b: behCount(s.id, c) })).sort((a, b) => b.b.score - a.b.score).slice(0, 5).map(x => ({ name: x.s.name, vals: [{ v: +x.b.score.toFixed(2), s: scoreSt(x.b.score) }, { v: x.b.neg }] })));
  sh.put(r, 0, 'ساخته‌شده با برنامه kelasam — www.dabiran7.ir', { sz: 9.5, fc: XLC.mute, nb: 1 }, W);
  return sh;
}

function xlGrades(c) {
  const ex = [...c.exams].sort((x, y) => x.date < y.date ? -1 : 1), ps = pass();
  const heads = ['ردیف', 'نام', ...c.courses.map(k => 'میانگین ' + k.name), 'میانگین کل', ...ex.map(e => `${courseOf(e.courseId, c)?.name || ''}\n${e.title}\n${jd(e.date)}`)];
  const nk = c.courses.length;
  const rows = c.students.map((s, i) => [i + 1, s.name, ...c.courses.map(k => { const v = stuCourseAvg(s.id, k.id, c); return v == null ? '' : { v: +v.toFixed(2), s: Object.assign({ b: 1 }, gradeSt(v, ps)) }; }), (() => { const v = stuAvg(s.id, c); return v == null ? '' : { v: +v.toFixed(2), s: Object.assign({ b: 1 }, gradeSt(v, ps)) }; })(), ...ex.map(e => { const v = norm(e, s.id); return e.scores[s.id] == null ? '' : { v: e.scores[s.id], s: gradeSt(v, ps) }; })]);
  const hs = heads.map((h, i) => i < 2 ? { bg: XLC.dark } : i < 2 + nk + 1 ? { bg: XLC.blueD } : { bg: XLC.mid });
  return xTable(`جدول نمرات — کلاس ${c.name}`, 'رنگ‌ها: قرمز = زیر حد قبولی · زرد = تا ۱۴ · سبز روشن = تا ۱۷ · سبز = ۱۷ به بالا (نمره‌ها در جدول آزمون‌ها بر اساس نمره خام‌اند، رنگ بر اساس نمره از ۲۰)', heads, rows, { hs, left: [1], w: [6, 22, ...heads.slice(2).map(() => 13)], hh: 62 });
}
function xlAttendance(c) {
  const dates = Object.keys(c.att).sort(), L = { p: 'ح', a: 'غ', l: 'ت', e: 'م' }, SS = { p: { bg: XLC.grnL, fc: XLC.grnD }, a: { bg: XLC.red, fc: XLC.white, b: 1 }, l: { bg: XLC.yelL, fc: XLC.yelD, b: 1 }, e: { bg: XLC.blueL, fc: XLC.blueD, b: 1 } };
  const heads = ['ردیف', 'نام', 'جمع غایب', 'جمع تأخیر', 'درصد حضور', ...dates.map(d => jd(d))];
  const rows = c.students.map((s, i) => { const a = attCount(s.id, c); return [i + 1, s.name, { v: a.a, s: a.a > 0 ? { fc: XLC.redD, b: 1 } : {} }, a.l, { v: a.pct == null ? '' : Math.round(a.pct), s: pctSt(a.pct) }, ...dates.map(d => { const v = c.att[d][s.id]; return v ? { v: L[v], s: SS[v] } : ''; })]; });
  const hs = heads.map((h, i) => i < 5 ? { bg: XLC.grn } : { bg: XLC.dark });
  return xTable(`جدول حضور و غیاب — کلاس ${c.name}`, 'ح = حاضر · غ = غایب · ت = تأخیر · م = مجاز', heads, rows, { hs, left: [1], w: [6, 22, 9, 9, 10, ...dates.map(() => 5.2)], hh: 74, rot: 0, col: {} });
}
function xlBehCourse(c) {
  const bcs = c.courses.filter(k => c.beh.some(b => b.cid === k.id)); if (!bcs.length) return null;
  const heads = ['ردیف', 'نام', ...bcs.map(k => 'امتیاز ' + k.name), 'بدون درس', 'جمع'];
  const rows = c.students.map((s, i) => { const vals = bcs.map(k => behCount(s.id, c, '', '', k.id).score), g = c.beh.filter(b => b.sid === s.id && !b.cid).reduce((a, b) => a + bp(b.t, c), 0), t = behCount(s.id, c).score; const f = v => ({ v: +v.toFixed(2), s: scoreSt(v) }); return [i + 1, s.name, ...vals.map(f), f(g), Object.assign(f(t), {})]; });
  return xTable(`رفتار به تفکیک درس — کلاس ${c.name}`, 'سبز = مثبت · قرمز = منفی', heads, rows, { hs: heads.map((h, i) => i < 2 ? { bg: XLC.dark } : { bg: XLC.org }), left: [1], w: [6, 22, ...heads.slice(2).map(() => 14)] });
}
function xlStatusGrid(c, list, label, memb) {
  const heads = ['ردیف', 'نام', 'انجام‌شده', 'انجام‌نشده', ...list.map(t => `${t.title}\n${jd(t.date)}${t.max ? '\n(از ' + t.max + ')' : ''}`)];
  const rows = c.students.map((s, i) => { let y = 0, n = 0; const cells = list.map(t => { if (memb && t.ids && !t.ids.includes(s.id)) return { v: '—', s: { fc: 'ADB5BD' } }; const r = t.res[s.id]; if (!r) return ''; if (r.st === 'y') y++; else if (r.st === 'n') n++; const sc = r.sc != null && t.max ? ' ' + r.sc : ''; return r.st === 'y' ? { v: '✓' + sc, s: { bg: XLC.grnL, fc: XLC.grnD, b: 1 } } : r.st === 'n' ? { v: '✗' + sc, s: { bg: XLC.redL, fc: XLC.redD, b: 1 } } : { v: sc.trim(), s: {} }; }); return [i + 1, s.name, { v: y, s: y ? { fc: XLC.grnD, b: 1 } : {} }, { v: n, s: n ? { fc: XLC.redD, b: 1 } : {} }, ...cells]; });
  return xTable(`${label} — کلاس ${c.name}`, '✓ = انجام شد · ✗ = انجام نشد · عدد کنار علامت = نمره', heads, rows, { hs: heads.map((h, i) => i < 2 ? { bg: XLC.dark } : i < 4 ? { bg: XLC.pur } : { bg: XLC.mid }), left: [1], w: [6, 22, 10, 10, ...list.map(() => 13)], hh: 62 });
}
function buildWorkbook(classes, single) {
  const wb = XLSX.utils.book_new(); wb.Workbook = { Views: [{ RTL: true }] };
  const used = new Set();
  const add = (name, sh, tab) => { if (!sh) return; let n = name.replace(/[\\\/?*\[\]:]/g, ' ').slice(0, 28), k = n, i = 2; while (used.has(k)) k = n + ' ' + i++; used.add(k); const ws = sh.ws ? sh.ws() : sh; if (tab) ws['!tab'] = tab; XLSX.utils.book_append_sheet(wb, ws, k); };
  const detail = (name, title, heads, rows, band) => add(name, xTable(title, `kelasam · ${jd(iso(new Date()))}`, heads, rows, { band, left: [1, heads.length - 1], w: heads.map((h, i) => i < 2 ? 22 : 14) }));
  const gl = [], al = [], bl = [], tl = [], cl = [];
  classes.forEach(c => {
    [...c.exams].sort((x, y) => x.date < y.date ? -1 : 1).forEach(e => c.students.forEach(s => { if (e.scores[s.id] != null) gl.push([c.name, s.name, s.nid, courseOf(e.courseId, c)?.name || '', e.title, jd(e.date), e.max, e.scores[s.id], { v: +norm(e, s.id).toFixed(2), s: gradeSt(norm(e, s.id), R.meta.pass ?? 10) }]); }));
    Object.keys(c.att).sort().forEach(d => c.students.forEach(s => { if (c.att[d][s.id]) { const v = c.att[d][s.id]; al.push([c.name, s.name, s.nid, jd(d), { v: ST[v], s: v === 'p' ? { bg: XLC.grnL, fc: XLC.grnD } : v === 'a' ? { bg: XLC.redL, fc: XLC.redD, b: 1 } : v === 'l' ? { bg: XLC.yelL, fc: XLC.yelD } : { bg: XLC.blueL, fc: XLC.blueD } }]); } }));
    [...c.beh].sort((x, y) => x.date < y.date ? -1 : 1).forEach(b => { const s = stuOf(b.sid, c); if (s && BEH[b.t]) bl.push([c.name, s.name, s.nid, jd(b.date), courseOf(b.cid, c)?.name || '', { v: BEH[b.t].t, s: { bg: BEH[b.t].bg.replace('#', '').toUpperCase(), fc: BEH[b.t].fg.replace('#', '').toUpperCase(), b: 1 } }, { v: bp(b.t, c), s: scoreSt(bp(b.t, c)) }, b.note || '']); });
    [[c.tasks, tl, 'تکلیف'], [c.acts, cl, 'فعالیت']].forEach(([arr, out]) => [...arr].sort((x, y) => x.date < y.date ? -1 : 1).forEach(t => c.students.forEach(s => { if (t.ids && !t.ids.includes(s.id)) return; const r = t.res[s.id]; if (r && (r.st || r.sc != null)) out.push([c.name, s.name, s.nid, courseOf(t.courseId, c)?.name || '', t.title, jd(t.date), t.due ? jd(t.due) : '', t.max || '', r.st === 'y' ? { v: 'انجام شد', s: { bg: XLC.grnL, fc: XLC.grnD } } : r.st === 'n' ? { v: 'انجام نشد', s: { bg: XLC.redL, fc: XLC.redD } } : '', r.sc ?? '']); })));
  });
  if (single) {
    const c = classes[0];
    add('گزارش کلی', xlDashboard(c));
    add('خلاصه کلاس', xlSummaryTable(c, `خلاصه وضعیت دانش‌آموزان — کلاس ${c.name}`));
    add('جدول نمرات', xlGrades(c)); add('جدول حضور', xlAttendance(c)); add('رفتار به تفکیک درس', xlBehCourse(c));
    add('جدول تکالیف', xlStatusGrid(c, [...c.tasks].sort((x, y) => x.date < y.date ? -1 : 1), 'جدول تکالیف', false));
    if (c.acts.length) add('جدول فعالیت‌ها', xlStatusGrid(c, [...c.acts].sort((x, y) => x.date < y.date ? -1 : 1), 'جدول فعالیت و پروژه', true));
  } else {
    const heads = ['کلاس', 'پایه', 'دانش‌آموز', 'میانگین کلاس', 'میانگین حضور (٪)', 'آزمون', 'تکلیف', 'فعالیت', 'رفتار مثبت', 'رفتار منفی'];
    const rows = classes.map(c => { const at = mean(c.students.map(s => attCount(s.id, c).pct).filter(v => v != null)), ca = classAvg(c); let pos = 0, neg = 0; c.beh.forEach(b => { const p = bp(b.t, c); if (p > 0) pos++; else if (p < 0) neg++; }); return [{ v: c.name, s: { b: 1 } }, c.grade, c.students.length, { v: ca == null ? '' : +ca.toFixed(2), s: gradeSt(ca, pass()) }, { v: at == null ? '' : Math.round(at), s: pctSt(at) }, c.exams.length, c.tasks.length, c.acts.length, { v: pos, s: { fc: XLC.grnD, b: 1 } }, { v: neg, s: { fc: XLC.redD, b: 1 } }]; });
    add('گزارش کلی', xTable('گزارش کلی همه کلاس‌ها', `${R.meta.school || ''} · معلم: ${R.meta.teacher || '—'} · سال تحصیلی ${R.meta.year || '—'} · ${jd(iso(new Date()))}`, heads, rows, { hs: heads.map((h, i) => ({ bg: i < 3 ? XLC.dark : i < 5 ? XLC.blueD : i < 8 ? XLC.pur : XLC.org })), w: [18, 10, 11, 13, 14, 9, 9, 9, 12, 12], hh: 44, rh: 26 }));
    classes.forEach(c => add(c.name, xlSummaryTable(c, `کلاس ${c.name}`)));
  }
  detail('ریز نمرات', 'ریز نمره‌ها', ['کلاس', 'نام', 'کد ملی', 'درس', 'آزمون', 'تاریخ', 'بارم', 'نمره', 'نمره از ۲۰'], gl, XLC.blueD);
  detail('ریز حضور و غیاب', 'ریز حضور و غیاب', ['کلاس', 'نام', 'کد ملی', 'تاریخ', 'وضعیت'], al, XLC.grn);
  detail('ریز رفتار', 'ریز رفتارها', ['کلاس', 'نام', 'کد ملی', 'تاریخ', 'درس', 'نوع', 'امتیاز', 'توضیح'], bl, XLC.org);
  detail('ریز تکالیف', 'ریز تکالیف', ['کلاس', 'نام', 'کد ملی', 'درس', 'تکلیف', 'تاریخ', 'مهلت', 'بارم', 'وضعیت', 'نمره'], tl, XLC.pur);
  if (cl.length) detail('ریز فعالیت‌ها', 'ریز فعالیت‌ها و پروژه‌ها', ['کلاس', 'نام', 'کد ملی', 'درس', 'فعالیت', 'تاریخ', 'مهلت', 'بارم', 'وضعیت', 'نمره'], cl, '0CA678');
  return wb;
}
function exportXlsx(classes, single) {
  if (!classes.length) return toast('کلاسی برای خروجی وجود ندارد');
  const wb = buildWorkbook(classes, single);
  const nm = single ? classes[0].name.replace(/[\\\/:*?"<>|]/g, ' ') : 'همه-کلاس‌ها';
  xlsxOut(wb, `kelasam-${nm}-${iso(new Date())}.xlsx`);
}
