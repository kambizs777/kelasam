'use strict';
/* =====================================================================
   plus-exams2.js (نسخه 2.6) — جدول «نمره سبزها» (نمره‌های برتر هر آزمون) به‌صورت عکس PNG یا اکسل
   چند کلاس کنار هم، با انتخاب معیار (حداقل نمره / چند نفر برتر / درصد برتر) و تنظیم رنگ، اندازه و ستون‌ها.
   ===================================================================== */
const GREEN_PRESETS = {
  green: ['سبز (مثل نمونه)', { titleBg: '#ffff00', titleText: '#000000', head: '#ffd9ff', headText: '#000000', cell: '#99ffcc', cellText: '#000000', border: '#c98fb0' }],
  blue: ['آبی', { titleBg: '#1971c2', titleText: '#ffffff', head: '#a5d8ff', headText: '#0b3d6b', cell: '#e7f5ff', cellText: '#0b3d6b', border: '#74c0fc' }],
  orange: ['نارنجی', { titleBg: '#f76707', titleText: '#ffffff', head: '#ffd8a8', headText: '#5c2a00', cell: '#fff4e6', cellText: '#5c2a00', border: '#ffa94d' }],
  teal: ['سبزآبی', { titleBg: '#0b7285', titleText: '#ffffff', head: '#99e9f2', headText: '#053f4a', cell: '#e3fafc', cellText: '#053f4a', border: '#3bc9db' }],
  gray: ['خاکستری ساده', { titleBg: '#343a40', titleText: '#ffffff', head: '#dee2e6', headText: '#212529', cell: '#f8f9fa', cellText: '#212529', border: '#adb5bd' }],
  gold: ['طلایی', { titleBg: '#e67700', titleText: '#fff9db', head: '#ffec99', headText: '#5c3b00', cell: '#fff9db', cellText: '#5c3b00', border: '#fcc419' }],
};
const GREEN_DEF = { mode: 'min', min: 18.5, top: 5, pct: 10, perRow: 5, showRank: false, showFather: false, showNid: false, scoreLeft: true, digits: 'en', sep: '/', font: 14, bold: true, rowH: 30, nameW: 190, footer: '', title: '', preset: 'green', ...GREEN_PRESETS.green[1] };
function greenCfg() { let c = {}; try { c = JSON.parse(localStorage.getItem('kelasam-green-cfg') || '{}'); } catch { } return Object.assign({}, GREEN_DEF, c); }
const greenSave = c => { try { localStorage.setItem('kelasam-green-cfg', JSON.stringify(c)); } catch { } };

/* انتخاب بر اساس معیار: خروجی [{s, v}] مرتب‌شده از بیشترین نمره (نمره از ۲۰) */
function greenPick(c, e, g) {
  const L = c.students.map(s => ({ s, v: e.scores[s.id] == null ? null : e.scores[s.id] / e.max * 20 })).filter(x => x.v != null).sort((a, b) => b.v - a.v || a.s.name.localeCompare(b.s.name, 'fa'));
  if (!L.length) return [];
  let cut;
  if (g.mode === 'min') cut = +g.min;
  else if (g.mode === 'top') cut = L[Math.min(L.length, Math.max(1, +g.top | 0)) - 1].v; // هم‌نمره‌های آخرین نفر هم می‌آیند
  else cut = L[Math.min(L.length, Math.max(1, Math.ceil(L.length * (+g.pct || 10) / 100))) - 1].v;
  return L.filter(x => x.v >= cut - 1e-9);
}
function greenFmt(v, g) {
  let t = String(+(+v).toFixed(2));
  if (g.digits === 'fa') t = t.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
  return t.replace('.', g.sep === '/' ? '/' : g.digits === 'fa' ? '٫' : '.');
}
/* ساخت داده‌ی جدول از انتخاب‌های کاربر: sel = [{c, e}] */
function greenData(sel, g) {
  const cols = sel.map(({ c, e }) => ({ name: 'کلاس ' + c.name, rows: greenPick(c, e, g) })).filter(x => x.rows.length);
  return cols;
}
/* ---- محاسبه‌ی ابعاد (مشترک بین عکس و اکسل) ---- */
function greenCols(g) { // ستون‌های هر بلوک از راست به چپ
  const L = []; if (g.showRank) L.push({ k: 'rank', w: 38 }); L.push({ k: 'name', w: +g.nameW || 190 }); if (g.showFather) L.push({ k: 'father', w: 110 }); if (g.showNid) L.push({ k: 'nid', w: 105 });
  const sc = { k: 'score', w: 62 }; if (g.scoreLeft) L.push(sc); else L.splice(g.showRank ? 1 : 0, 0, sc); return L;
}
function greenTitle(g, e) { return g.title.trim() || (e ? `${e.title} ${courseOf(e.courseId)?.name || ''}`.trim() : 'نمره‌های برتر'); }

/* ---- رسم روی بوم (canvas) ---- */
async function greenCanvas(cols, g, title) {
  try { await document.fonts.load(`700 ${g.font}px Vazirmatn`); await document.fonts.load(`400 ${g.font}px Vazirmatn`); } catch { }
  const SC = 2, bc = greenCols(g), bw = bc.reduce((a, x) => a + x.w, 0), rh = +g.rowH || 30, gap = 14, pad = 14, per = Math.max(1, Math.min(+g.perRow || 5, cols.length || 1));
  const blocks = []; for (let i = 0; i < cols.length; i += per) blocks.push(cols.slice(i, i + per));
  const W = pad * 2 + per * bw + (per - 1) * gap, titleH = Math.round(rh * 1.5);
  let H = pad + titleH + 10; const bh = blocks.map(b => rh + Math.max(...b.map(x => x.rows.length)) * rh); bh.forEach(h => { H += h + gap; }); H += (g.footer ? 26 : 0) + pad - gap;
  const cv = document.createElement('canvas'); cv.width = W * SC; cv.height = H * SC; const x = cv.getContext('2d'); x.scale(SC, SC); x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, H);
  x.direction = 'rtl'; x.textBaseline = 'middle'; x.textAlign = 'center';
  const wt = g.bold ? 700 : 400, fit = (t, w, sz, wgt) => { let s = sz; x.font = `${wgt} ${s}px Vazirmatn,Tahoma`; while (s > 8 && x.measureText(t).width > w - 8) { s--; x.font = `${wgt} ${s}px Vazirmatn,Tahoma`; } };
  const cell = (cx, cy, w, h, bg, fg, t, wgt) => { x.fillStyle = bg; x.fillRect(cx, cy, w, h); x.strokeStyle = g.border; x.lineWidth = 1; x.strokeRect(cx + .5, cy + .5, w - 1, h - 1); if (t !== '' && t != null) { x.fillStyle = fg; fit(String(t), w, g.font, wgt); x.fillText(String(t), cx + w / 2, cy + h / 2 + 1); } };
  cell(pad, pad, W - pad * 2, titleH, g.titleBg, g.titleText, title, 700);
  let y = pad + titleH + 10;
  blocks.forEach((b, bi) => {
    b.forEach((cl, i) => {
      let xr = W - pad - i * (bw + gap); // لبه‌ی راست بلوک
      cell(xr - bw, y, bw, rh, g.head, g.headText, cl.name, 700);
      cl.rows.forEach((r, ri) => {
        const cy = y + rh + ri * rh; let cx = xr;
        bc.forEach(c => {
          cx -= c.w; const t = c.k === 'rank' ? fa(ri + 1, 0) : c.k === 'name' ? r.s.name : c.k === 'father' ? (r.s.father || '') : c.k === 'nid' ? (r.s.nid || '') : greenFmt(r.v, g);
          cell(cx, cy, c.w, rh, g.cell, g.cellText, t, wt);
        });
      });
    });
    y += bh[bi] + gap;
  });
  if (g.footer) { x.fillStyle = '#495057'; x.font = `400 13px Vazirmatn,Tahoma`; x.textAlign = 'left'; x.direction = 'ltr'; x.fillText(g.footer, pad, H - pad - 4); }
  return cv;
}
/* ---- اکسل ---- */
function greenWorkbook(cols, g, title) {
  const bc = greenCols(g), nb = bc.length, per = Math.max(1, Math.min(+g.perRow || 5, cols.length || 1)), hx = h => String(h).replace('#', '').toUpperCase();
  const border = { style: 'thin', color: { rgb: hx(g.border) } }, bd = { top: border, bottom: border, left: border, right: border };
  const st = (bg, fg, b, sz) => ({ font: { name: typeof XLFONT === 'string' ? XLFONT : 'Tahoma', sz: sz || 12, bold: !!b, color: { rgb: hx(fg) } }, fill: { patternType: 'solid', fgColor: { rgb: hx(bg) } }, alignment: { horizontal: 'center', vertical: 'center', readingOrder: 2, wrapText: true }, border: bd });
  const ws = {}, merges = [], put = (r, c, v, s) => { ws[XLSX.utils.encode_cell({ r, c })] = { v: v == null ? '' : v, t: typeof v === 'number' ? 'n' : 's', s }; };
  const totalC = per * nb + (per - 1); let maxR = 0;
  put(0, 0, title, st(g.titleBg, g.titleText, 1, 18)); for (let c = 1; c < totalC; c++) put(0, c, '', st(g.titleBg, g.titleText, 1, 18)); merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalC - 1 } });
  let r0 = 2; const rows = []; rows[0] = { hpt: 34 };
  for (let i = 0; i < cols.length; i += per) {
    const b = cols.slice(i, i + per), h = Math.max(...b.map(x => x.rows.length));
    b.forEach((cl, j) => {
      const c0 = j * (nb + 1); // بلوک اول سمت راست است؛ شیت RTL نمایش داده می‌شود
      put(r0, c0, cl.name, st(g.head, g.headText, 1, 13)); for (let c = 1; c < nb; c++) put(r0, c0 + c, '', st(g.head, g.headText, 1, 13)); merges.push({ s: { r: r0, c: c0 }, e: { r: r0, c: c0 + nb - 1 } });
      cl.rows.forEach((r, ri) => bc.forEach((c, ci) => { const v = c.k === 'rank' ? ri + 1 : c.k === 'name' ? r.s.name : c.k === 'father' ? (r.s.father || '') : c.k === 'nid' ? (r.s.nid || '') : greenFmt(r.v, g); put(r0 + 1 + ri, c0 + ci, v, st(g.cell, g.cellText, g.bold, +g.font || 12)); }));
    });
    rows[r0] = { hpt: 26 }; for (let k = 1; k <= h; k++) rows[r0 + k] = { hpt: 24 }; r0 += h + 3; maxR = r0;
  }
  if (g.footer) { put(maxR - 1, 0, g.footer, { font: { sz: 10, color: { rgb: '868E96' } }, alignment: { horizontal: 'left' } }); }
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: Math.max(maxR, 2), c: totalC - 1 } }); ws['!merges'] = merges; ws['!rows'] = rows;
  const wcol = []; for (let j = 0; j < per; j++) { bc.forEach(c => wcol.push({ wch: c.k === 'name' ? Math.max(18, c.w / 7.5) : c.k === 'score' || c.k === 'rank' ? 8 : 14 })); if (j < per - 1) wcol.push({ wch: 3 }); }
  ws['!cols'] = wcol;
  const wb = XLSX.utils.book_new(); wb.Workbook = { Views: [{ RTL: true }] }; XLSX.utils.book_append_sheet(wb, ws, 'نمره سبزها'); return wb;
}
function imgOut(cv, name) {
  if (CAPP) return nativeOut(name, cv.toDataURL('image/png').split(',')[1], true).catch(() => toast('ساخت فایل انجام نشد'));
  return new Promise(res => cv.toBlob(async b => { const r = await saveAs(name, b, 'image/png', 'تصویر PNG'); if (!r.cancel) toast(r.dl ? 'تصویر دانلود شد' : 'تصویر ذخیره شد: ' + r.name); res(); }, 'image/png'));
}

/* ---- پنجره‌ی تنظیمات ---- */
function greenDialog(id) {
  const e0 = examOf(id); if (!e0) return;
  const g = greenCfg(), T = termClasses();
  const guess = c => { if (c.id === db.id) return e0; const t = nq(e0.title), cn = nq(courseOf(e0.courseId)?.name || ''); return c.exams.find(x => nq(x.title) === t && nq(courseOf(x.courseId, c)?.name || '') === cn) || c.exams.find(x => nq(x.title) === t) || null; };
  const sel = T.map(c => { const e = guess(c); return { c, e: e ? e.id : '', on: !!e }; });
  const d = $('#dlg'); d.style.width = 'min(1000px,98vw)'; d.onclose = () => { d.style.width = ''; };
  const num = (k, l, extra = '') => `<label class="f">${l}<input type="number" inputmode="decimal" data-g="${k}" value="${g[k]}" ${extra}></label>`;
  const chk = (k, l) => `<label class="ck"><input type="checkbox" data-g="${k}" ${g[k] ? 'checked' : ''}><span><b>${l}</b></span></label>`;
  const clr = (k, l) => `<label class="f clr">${l}<input type="color" data-g="${k}" value="${g[k]}"></label>`;
  d.innerHTML = `<form onsubmit="return false" class="grn"><h3>🟢 جدول نمره سبزها — ${esc(e0.title)}</h3>
  <div class="gprev"><canvas id="gCv"></canvas></div>
  <div class="row"><button type="button" class="btn" id="gPng">🖼 ذخیره به‌صورت عکس (PNG)</button><button type="button" class="btn" id="gXls" style="background:var(--ok)">📗 ذخیره به‌صورت اکسل</button><button type="button" class="btn sec" data-close>بستن</button></div>
  <details open><summary>۱) کلاس‌ها و آزمون هر کلاس</summary><div class="sub" style="margin:4px 0">آزمونی که نام یکسان دارد خودکار پیدا شده؛ اگر کلاسی آزمون دیگری دارد، از فهرست انتخاب کنید. کلاس‌های بدون تیک در جدول نمی‌آیند.</div>
  <div class="tw" style="max-height:220px"><table><tr><th></th><th>کلاس</th><th>آزمون این کلاس</th></tr>${sel.map((x, i) => `<tr><td><input type="checkbox" data-sc="${i}" ${x.on ? 'checked' : ''}></td><td>${esc(x.c.name)}${schoolsOf().length > 1 ? `<br><small class="sub">${esc(schoolName(x.c))}</small>` : ''}</td><td><select data-se="${i}"><option value="">— آزمونی انتخاب نشده —</option>${[...x.c.exams].sort((a, b) => a.date < b.date ? 1 : -1).map(ee => `<option value="${ee.id}" ${ee.id === x.e ? 'selected' : ''}>${esc(ee.title)} · ${esc(courseOf(ee.courseId, x.c)?.name || '')} · ${jd(ee.date)}</option>`).join('')}</select></td></tr>`).join('')}</table></div></details>
  <details open><summary>۲) معیار نمره سبز</summary><div class="fg"><label class="f">روش انتخاب<select data-g="mode"><option value="min" ${g.mode === 'min' ? 'selected' : ''}>نمره‌ی بیشتر یا مساوی عدد مشخص</option><option value="top" ${g.mode === 'top' ? 'selected' : ''}>چند نفر برتر هر کلاس</option><option value="pct" ${g.mode === 'pct' ? 'selected' : ''}>درصدی از برترین‌های هر کلاس</option></select></label>
  ${num('min', 'حداقل نمره (از ۲۰)', 'step="0.25" min="0" max="20"')}${num('top', 'تعداد نفرات برتر', 'min="1" max="60"')}${num('pct', 'درصد برتر', 'min="1" max="100"')}</div><div class="sub">نمره‌ها همیشه از ۲۰ حساب می‌شوند. در روش «چند نفر برتر»، هم‌نمره‌های آخرین نفر هم می‌آیند.</div></details>
  <details><summary>۳) ظاهر و رنگ‌ها</summary><div class="row" style="margin:6px 0">${Object.entries(GREEN_PRESETS).map(([k, v]) => `<button type="button" class="btn sec sm" data-pre="${k}" style="border:2px solid ${v[1].border};background:${v[1].cell};color:${v[1].cellText}">${v[0]}</button>`).join('')}</div>
  <div class="fg">${clr('titleBg', 'رنگ نوار عنوان')}${clr('titleText', 'رنگ نوشته‌ی عنوان')}${clr('head', 'رنگ سرستون (کلاس)')}${clr('headText', 'رنگ نوشته‌ی سرستون')}${clr('cell', 'رنگ سلول‌ها')}${clr('cellText', 'رنگ نوشته‌ی سلول‌ها')}${clr('border', 'رنگ خطوط')}
  ${num('font', 'اندازه‌ی نوشته', 'min="9" max="30"')}${num('rowH', 'ارتفاع ردیف', 'min="20" max="60"')}${num('nameW', 'عرض ستون نام', 'min="110" max="320"')}${num('perRow', 'تعداد کلاس در هر ردیف', 'min="1" max="12"')}
  <label class="f">ارقام<select data-g="digits"><option value="en" ${g.digits === 'en' ? 'selected' : ''}>انگلیسی (19/5)</option><option value="fa" ${g.digits === 'fa' ? 'selected' : ''}>فارسی (۱۹/۵)</option></select></label>
  <label class="f">جداکننده‌ی اعشار<select data-g="sep"><option value="/" ${g.sep === '/' ? 'selected' : ''}>اسلش (19/5)</option><option value="." ${g.sep === '.' ? 'selected' : ''}>نقطه (19.5)</option></select></label></div>
  <div class="fg">${chk('bold', 'نوشته‌ها پررنگ')}${chk('scoreLeft', 'ستون نمره سمت چپ')}${chk('showRank', 'ستون ردیف')}${chk('showFather', 'ستون نام پدر')}${chk('showNid', 'ستون کد ملی')}</div>
  <div class="fg"><label class="f" style="grid-column:1/-1">عنوان جدول (خالی = نام آزمون و درس)<input data-g="title" value="${esc(g.title)}" placeholder="مثلاً: میانترم یک درس دینی"></label><label class="f" style="grid-column:1/-1">متن پایین جدول (اختیاری)<input data-g="footer" value="${esc(g.footer)}" placeholder="مثلاً نام شما یا مدرسه"></label></div></details>
  <div id="gMsg" class="sub"></div></form>`;
  d.querySelector('[data-close]').onclick = () => d.close();
  const q = s => d.querySelector(s); let busy = false, again = false;
  const readG = () => { d.querySelectorAll('[data-g]').forEach(i => { const k = i.dataset.g; g[k] = i.type === 'checkbox' ? i.checked : i.type === 'number' ? (+i.value || 0) : i.value; }); greenSave(g); };
  const picks = () => sel.filter((x, i) => { const on = q(`[data-sc="${i}"]`).checked, eid = q(`[data-se="${i}"]`).value; x.e = eid; return on && eid; }).map(x => ({ c: x.c, e: x.c.exams.find(y => y.id === x.e) })).filter(x => x.e);
  const draw = async () => {
    if (busy) { again = true; return; } busy = true;
    try { readG(); const p = picks(), cols = greenData(p, g), msg = q('#gMsg'); const cv = q('#gCv');
      if (!cols.length) { cv.width = 10; cv.height = 10; msg.textContent = p.length ? 'با این معیار هیچ دانش‌آموزی انتخاب نشد؛ معیار را پایین‌تر بیاورید.' : 'حداقل یک کلاس را با آزمونش انتخاب کنید.'; }
      else { const cs = await greenCanvas(cols, g, greenTitle(g, p[0].e)); cv.width = cs.width; cv.height = cs.height; cv.getContext('2d').drawImage(cs, 0, 0); msg.textContent = `${fa(cols.length, 0)} کلاس · ${fa(cols.reduce((a, x) => a + x.rows.length, 0), 0)} نفر`; }
    } finally { busy = false; if (again) { again = false; draw(); } }
  };
  d.querySelectorAll('[data-g],[data-sc],[data-se]').forEach(i => { i.oninput = draw; i.onchange = draw; });
  d.querySelectorAll('[data-pre]').forEach(b => b.onclick = () => { const pr = GREEN_PRESETS[b.dataset.pre][1]; Object.entries(pr).forEach(([k, v]) => { const i = q(`[data-g="${k}"]`); if (i) i.value = v; }); draw(); });
  const out = async kind => {
    readG(); const p = picks(), cols = greenData(p, g); if (!cols.length) return toast('چیزی برای خروجی گرفتن نیست');
    const nm = `kelasam-نمره-سبزها-${greenTitle(g, p[0].e)}-${iso(new Date())}`.replace(/[\\\/:*?"<>|]/g, ' ');
    if (kind === 'png') { const cv = await greenCanvas(cols, g, greenTitle(g, p[0].e)); await imgOut(cv, nm + '.png'); } else xlsxOut(greenWorkbook(cols, g, greenTitle(g, p[0].e)), nm + '.xlsx');
  };
  q('#gPng').onclick = () => out('png'); q('#gXls').onclick = () => out('xlsx');
  if (!d.open) d.showModal(); draw();
}
Object.assign(A, { greenOpen(id) { greenDialog(id); } });
