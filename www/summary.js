'use strict';
/* =====================================================================
   «برآیند کلی» دانش‌آموز — یک صفحه گرافیکی و خوانا برای نمایش روی ویدئوپروژکتور (صفحه دوم)
   در پنجره‌ی جداگانه باز می‌شود؛ پنجره را به صفحه دوم بکشید و دکمه «تمام‌صفحه» را بزنید.
   ===================================================================== */
function summaryData(sid) {
  const s = stuOf(sid), c = db, ps = pass();
  const b = behCount(sid), a = attCount(sid), avg = stuAvg(sid), rk = ranking(), rank = rk.findIndex(x => x.s.id === sid) + 1;
  const tk = taskCount(sid), ac = actCount(sid), ca = classAvg();
  const courses = c.courses.map(k => ({ n: k.name, v: stuCourseAvg(sid, k.id), cls: courseStats(k.id).avg })).filter(x => x.v != null);
  const negs = c.beh.filter(x => x.sid === sid && bp(x.t) < 0).sort((x, y) => x.date < y.date ? 1 : -1);
  const poss = c.beh.filter(x => x.sid === sid && bp(x.t) > 0).sort((x, y) => x.date < y.date ? 1 : -1);
  const challenges = [], strengths = [];
  courses.filter(x => x.v < ps).forEach(x => challenges.push(`نمره درس «${x.n}» پایین‌تر از حد قبولی است (${fa(x.v)} از ۲۰)`));
  courses.filter(x => x.v >= ps && x.cls != null && x.v < x.cls - 1).forEach(x => challenges.push(`در درس «${x.n}» پایین‌تر از میانگین کلاس هستی (${fa(x.v)} در برابر ${fa(x.cls)})`));
  if (b.score < 0) challenges.push(`امتیاز رفتاری منفی است (${sgn(b.score)}): ${b.r ? fa(b.r, 0) + ' کارت قرمز' : ''}${b.r && b.y ? ' و ' : ''}${b.y ? fa(b.y, 0) + ' کارت زرد' : ''}`);
  else if (b.neg > 0) challenges.push(`${fa(b.neg, 0)} مورد رفتار منفی ثبت شده؛ حواست باشد`);
  negs.slice(0, 4).forEach(x => { if (x.note) challenges.push(`رفتار: ${x.note} (${jd(x.date)})`); });
  if (a.a >= 3 || (a.pct != null && a.pct < 85)) challenges.push(`${fa(a.a, 0)} روز غیبت${a.l ? ' و ' + fa(a.l, 0) + ' تأخیر' : ''} — حضور منظم‌تر لازم است`);
  if (tk.n > 0) challenges.push(`${fa(tk.n, 0)} تکلیف انجام‌نشده`);
  if (ac.n > 0) challenges.push(`${fa(ac.n, 0)} فعالیت/پروژه انجام‌نشده`);
  const best = [...courses].sort((x, y) => y.v - x.v)[0];
  if (best && best.v >= 15) strengths.push(`درخشش در درس «${best.n}» (${fa(best.v)} از ۲۰)`);
  if (avg != null && ca != null && avg > ca) strengths.push(`میانگین بالاتر از میانگین کلاس (${fa(avg)} در برابر ${fa(ca)})`);
  if (rank && rank <= 3) strengths.push(`رتبه ${fa(rank, 0)} در کلاس`);
  if (b.pos > 0 && b.score > 0) strengths.push(`${fa(b.pos, 0)} رفتار مثبت ثبت شده (${sgn(b.score)})`);
  poss.slice(0, 3).forEach(x => { if (x.note) strengths.push(`${x.note} (${jd(x.date)})`); });
  if (a.pct != null && a.pct >= 95 && a.t >= 3) strengths.push(`حضور عالی (${fa(a.pct, 0)}٪)`);
  if (tk.pct === 100 && tk.y >= 2) strengths.push('همه تکالیف را انجام داده');
  if (ac.pct === 100 && ac.y >= 1) strengths.push('در همه فعالیت‌ها و پروژه‌ها فعال بوده');
  return { s, b, a, avg, rank, n: c.students.length, tk, ac, ca, courses, challenges, strengths, ps };
}
function summaryDoc(sid) {
  const d = summaryData(sid), s = d.s, m = R.meta, e = esc;
  const ring = (pct, color, label, sub) => { const r = 52, C = 2 * Math.PI * r, v = Math.max(0, Math.min(100, pct || 0)); return `<div class="ringw"><svg viewBox="0 0 140 140" width="150" height="150"><circle cx="70" cy="70" r="${r}" fill="none" stroke="#e8eef1" stroke-width="16"/><circle cx="70" cy="70" r="${r}" fill="none" stroke="${color}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${(C * v / 100).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 70 70)"/><text x="70" y="78" text-anchor="middle" font-size="30" font-weight="700" fill="#16282d">${pct == null ? '—' : fa(pct, 0) + '٪'}</text></svg><b>${label}</b><small>${sub}</small></div>`; };
  const totalB = d.b.neg + d.b.pos, negPct = totalB ? d.b.neg / totalB * 100 : 0;
  const tile = (k, t, col, bg, fg) => `<div class="bt" style="background:${bg};color:${fg}"><div class="bn">${fa(d.b[k], 0)}</div><div>${t}</div><small>${pt(k)}</small></div>`;
  const bar = x => { const col = x.v < d.ps ? '#e03131' : x.v < 14 ? '#f59f00' : x.v < 17 ? '#74b816' : '#2f9e44'; return `<div class="cr"><span class="cn">${e(x.n)}</span><div class="cb"><i style="width:${(x.v / 20 * 100).toFixed(1)}%;background:${col}"></i>${x.cls != null ? `<u style="right:${(x.cls / 20 * 100).toFixed(1)}%" title="میانگین کلاس"></u>` : ''}</div><b style="color:${col}">${fa(x.v)}</b></div>`; };
  const li = (arr, empty) => arr.length ? arr.map(x => `<li>${e(x)}</li>`).join('') : `<li class="none">${empty}</li>`;
  const sc = d.b.score, scCol = sc < 0 ? '#e03131' : sc > 0 ? '#2f9e44' : '#868e96';
  const face = sc >= 3 ? '😄' : sc > 0 ? '🙂' : sc === 0 ? '😐' : sc > -3 ? '😕' : '😟';
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>برآیند کلی — ${e(s.name)}</title><base href="${location.href}">
<style>
@font-face{font-family:Vazirmatn;src:url(fonts/Vazirmatn-Regular.ttf);font-weight:400}@font-face{font-family:Vazirmatn;src:url(fonts/Vazirmatn-Bold.ttf);font-weight:700}
*{box-sizing:border-box}body{margin:0;font-family:Vazirmatn,Tahoma,sans-serif;background:linear-gradient(135deg,#e3fafc,#fff5f5 55%,#fff9db);color:#16282d;font-size:20px;line-height:1.7;min-height:100vh}
.wrap{max-width:1500px;margin:0 auto;padding:22px 28px 70px}
.hd{display:flex;align-items:center;gap:22px;background:linear-gradient(120deg,#0b7285,#1c7ed6);color:#fff;border-radius:26px;padding:20px 28px;box-shadow:0 10px 30px #0b728555}
.hd .av{width:110px;height:110px;border-radius:50%;object-fit:cover;border:5px solid #ffd43b;background:#fff;display:grid;place-items:center;font-size:48px;color:#0b7285;font-weight:700;flex:none}
.hd h1{margin:0;font-size:44px;line-height:1.2}.hd p{margin:2px 0 0;opacity:.9;font-size:20px}
.hd .kp{margin-inline-start:auto;display:flex;gap:14px}.kp div{background:#ffffff26;border-radius:18px;padding:8px 20px;text-align:center;min-width:130px}.kp b{display:block;font-size:38px;line-height:1.2}.kp small{font-size:15px}
.g{display:grid;gap:18px;margin-top:18px}.g2{grid-template-columns:1.15fr 1fr}.g3{grid-template-columns:1fr 1fr 1fr}
.cd{background:#fff;border-radius:24px;padding:20px 24px;box-shadow:0 6px 22px #0b72851f}.cd h2{margin:0 0 12px;font-size:25px}
.bal{height:46px;border-radius:99px;overflow:hidden;display:flex;background:#e9ecef;margin:8px 0 4px}.bal i{display:block;height:100%}.bal .n{background:linear-gradient(90deg,#e03131,#ff8787)}.bal .p{background:linear-gradient(90deg,#8ce99a,#2f9e44)}
.bl{direction:ltr;display:flex;justify-content:space-between;font-size:17px;color:#495057}
.bts{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:14px}.bt{border-radius:20px;text-align:center;padding:12px 4px;font-weight:700}.bt .bn{font-size:46px;line-height:1.1}.bt small{font-weight:400;font-size:15px;opacity:.85}
.score{display:flex;align-items:center;gap:16px;margin-top:12px;font-size:22px}.score b{font-size:54px;line-height:1}.score .f{font-size:64px}
.cr{display:grid;grid-template-columns:150px 1fr 70px;gap:12px;align-items:center;margin:9px 0}.cn{font-weight:700}.cb{position:relative;height:26px;background:#edf2f4;border-radius:99px}.cb i{position:absolute;inset-block:0;right:0;border-radius:99px;display:block}.cb u{position:absolute;top:-5px;bottom:-5px;width:4px;background:#16282d;border-radius:4px;text-decoration:none}.cr b{font-size:24px;text-align:center}
.lg{font-size:15px;color:#6c757d;margin-top:6px}.lg u{display:inline-block;width:4px;height:14px;background:#16282d;vertical-align:middle;margin-inline:4px;text-decoration:none}
.rings{display:flex;justify-content:space-around;flex-wrap:wrap;gap:6px}.ringw{text-align:center}.ringw b{display:block;font-size:21px}.ringw small{color:#6c757d;font-size:16px}
ul{margin:0;padding:0;list-style:none}li{padding:8px 14px 8px 8px;margin:7px 0;border-radius:14px;font-size:20px}
.ch li{background:#fff5f5;border-inline-start:8px solid #fa5252}.st li{background:#ebfbee;border-inline-start:8px solid #40c057}li.none{background:#f1f3f5;border-color:#adb5bd;color:#6c757d}
.msg{margin-top:18px;text-align:center;font-size:25px;font-weight:700;color:#0b7285;background:#fff;border-radius:24px;padding:16px}
.bar{position:fixed;bottom:0;inset-inline:0;background:#16282dee;padding:10px;display:flex;gap:10px;justify-content:center}.bar button{border:0;border-radius:12px;padding:8px 22px;font:inherit;font-size:17px;font-weight:700;cursor:pointer;background:#ffd43b;color:#2a1d00}
@media print{.bar{display:none}body{background:#fff}.wrap{padding:0}}
@media(max-width:1100px){.g2,.g3{grid-template-columns:1fr}.hd{flex-wrap:wrap}.hd .kp{margin:0}.bts{grid-template-columns:1fr 1fr}.cr{grid-template-columns:110px 1fr 56px}}
</style></head><body><div class="wrap">
<div class="hd">${s.photo ? `<img class="av" src="${s.photo}" alt="">` : `<div class="av">${e(s.name.trim()[0] || '؟')}</div>`}<div><h1>${e(s.name)}</h1><p>کلاس ${e(db.name)}${m.school ? ' · ' + e(m.school) : ''}${m.year ? ' · سال تحصیلی ' + e(m.year) : ''}</p><p>برآیند کلی عملکرد تا ${jd(iso(new Date()))}</p></div>
<div class="kp"><div><b>${fa(d.avg)}</b><small>میانگین از ۲۰</small></div><div><b>${d.rank ? fa(d.rank, 0) : '—'}</b><small>رتبه از ${fa(d.n, 0)}</small></div></div></div>
<div class="g g2"><div class="cd"><h2>🚦 رفتار و انضباط</h2>
<div class="bl"><span>منفی‌ها: ${fa(d.b.neg, 0)}</span><span>مثبت‌ها: ${fa(d.b.pos, 0)}</span></div>
<div class="bal" dir="ltr">${totalB ? `<i class="n" style="width:${negPct}%"></i><i class="p" style="width:${100 - negPct}%"></i>` : ''}</div>
<div class="bts">${tile('r', 'قرمز', '', '#fa5252', '#fff')}${tile('y', 'زرد', '', '#ffe066', '#5c4300')}${tile('g', 'سبز', '', '#b2f2bb', '#1b5e20')}${tile('G', 'سبز پررنگ', '', '#2f9e44', '#fff')}</div>
<div class="score"><span class="f">${face}</span><div>امتیاز رفتاری<br><b style="color:${scCol}">${sgn(sc)}</b></div>${d.b.w ? `<div style="margin-inline-start:auto;font-size:17px;color:#6c757d">${fa(d.b.w, 0)} یادداشت</div>` : ''}</div></div>
<div class="cd"><h2>📚 نمرات دروس</h2>${d.courses.map(bar).join('') || '<div style="color:#6c757d">هنوز نمره‌ای ثبت نشده</div>'}<div class="lg">نوار = نمره من · خط مشکی <u></u> = میانگین کلاس · حد قبولی ${fa(d.ps)}</div></div></div>
<div class="g g3"><div class="cd"><h2>📅 حضور</h2><div class="rings">${ring(d.a.pct, '#2f9e44', 'درصد حضور', `${fa(d.a.a, 0)} غیبت · ${fa(d.a.l, 0)} تأخیر`)}</div></div>
<div class="cd"><h2>📝 تکالیف</h2><div class="rings">${ring(d.tk.pct, '#7048e8', 'انجام تکالیف', `${fa(d.tk.y, 0)} انجام · ${fa(d.tk.n, 0)} نشده${d.tk.avg != null ? ' · نمره ' + fa(d.tk.avg) : ''}`)}</div></div>
<div class="cd"><h2>🎯 فعالیت و پروژه</h2><div class="rings">${d.ac.t ? ring(d.ac.pct, '#0ca678', 'انجام فعالیت‌ها', `${fa(d.ac.y, 0)} انجام · ${fa(d.ac.n, 0)} نشده${d.ac.avg != null ? ' · نمره ' + fa(d.ac.avg) : ''}`) : '<div style="color:#6c757d;padding:40px 0;text-align:center">فعالیتی ثبت نشده</div>'}</div></div></div>
<div class="g g2"><div class="cd st"><h2>🌟 نقاط قوت</h2><ul>${li(d.strengths, 'با تلاش بیشتر، نقاط قوت زیادی خواهی ساخت 💪')}</ul></div>
<div class="cd ch"><h2>🎯 چالش‌ها و نکاتی که باید حواسم باشد</h2><ul>${li(d.challenges, 'چالش مهمی ثبت نشده؛ همین مسیر را ادامه بده 🎉')}</ul></div></div>
<div class="msg">${d.challenges.length > 2 ? 'قدم‌به‌قدم؛ با برنامه‌ریزی و تلاش، همه چالش‌ها قابل‌حل است 💪' : 'آفرین! همین‌طور ادامه بده 🌟'}</div></div>
<div class="bar"><button onclick="document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()">⛶ تمام‌صفحه</button><button onclick="window.print()">🖨 چاپ</button><button onclick="window.close()">✕ بستن</button></div></body></html>`;
}
function summaryOpen(id) {
  {
    const s = stuOf(id); if (!s) return;
    const html = summaryDoc(id);
    let w = null;
    if (!CAPP) { try { w = window.open('', 'kelasam-summary', `popup=yes,width=${Math.min(1280, screen.availWidth)},height=${Math.min(820, screen.availHeight)}`); } catch { } }
    if (w && w.document) { w.document.open(); w.document.write(html); w.document.close(); try { w.focus(); } catch { } toast('پنجره برآیند باز شد؛ آن را به صفحه دوم ببرید و «تمام‌صفحه» بزنید'); return; }
    const d = $('#dlg'); d.innerHTML = `<form onsubmit="return false" style="padding:0;gap:0"><iframe id="sumFr" style="width:100%;height:78vh;border:0;border-radius:18px 18px 0 0"></iframe><div class="row" style="padding:10px 16px"><button type="button" class="btn sec" data-close>بستن</button></div></form>`;
    d.style.width = 'min(1200px,98vw)'; d.querySelector('#sumFr').srcdoc = html; d.querySelector('[data-close]').onclick = () => d.close();
    d.onclose = () => { d.style.width = ''; }; d.showModal();
  }
}
