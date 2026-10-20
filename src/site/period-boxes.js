import { weekdayName } from '../i18n/terms.js';
import { siteText, siteValue, displayPillar } from './copy.js';
import { esc, tip } from './util.js';
import { TIPS } from '../content/tips.js';
import { STEM_EL, addDays, dow, fmtDate, fmtShort, pillarH, dayPillar, monthPillar, yearPillarOfDate, lunarText, solarTerms, toUTC } from '../engine/index.js';

function nextTerm(o) {
  const terms = [...solarTerms(o.y), ...solarTerms(o.y + 1)];
  return terms.find((t) => toUTC(t.date) >= toUTC(o));
}
export function dayBox(o, label) {
  const dp = dayPillar(o), mp = monthPillar(o), yp = yearPillarOfDate(o);
  const nt = nextTerm(o);
  return `<section class="daybox card" aria-label="${esc(label)}${siteText(" 일진")}">
    <div class="daybox-main"><span class="daybox-k">${esc(label)}</span><b class="daybox-d">${fmtDate(o)}</b><span class="muted">${lunarText(o)}</span></div>
    <dl class="daybox-grid">
      <div><dt>${siteText("일진 ")}${tip(TIPS.ilJin, siteText('일진 설명'))}</dt><dd><span class="hz el-${STEM_EL[dp.s]}">${pillarH(dp)}</span> ${displayPillar(dp)}${siteText("일")}</dd></div>
      <div><dt>${siteText("월건 ")}${tip(TIPS.wolGeon, siteText('월건 설명'))}</dt><dd><span class="hz">${pillarH(mp)}</span> ${displayPillar(mp)}${siteText("월")}</dd></div>
      <div><dt>${siteText("세차 ")}${tip(TIPS.seCha, siteText('세차 설명'))}</dt><dd><span class="hz">${pillarH(yp)}</span> ${displayPillar(yp)}${siteText("년")}</dd></div>
      ${nt ? `<div><dt>${siteText("다음 절기 ")}${tip(TIPS.term, siteText('절기 설명'))}</dt><dd>${siteValue(nt.name)} ${nt.date.m}/${nt.date.d} ${nt.time}</dd></div>` : ''}
    </dl>
  </section>`;
}
export function weekBox(o) {
  const start = addDays(o, -((dow(o) + 6) % 7));
  const cells = [...Array(7).keys()].map((i) => { const d = addDays(start, i); const p = dayPillar(d); return `<li${toUTC(d) === toUTC(o) ? ' class="is-today"' : ''}><span>${weekdayName(dow(d))} ${fmtShort(d)}</span><b class="hz">${pillarH(p)}</b></li>`; }).join('');
  return `<section class="daybox card" aria-label="${siteText("이번 주 일진")}"><div class="daybox-main"><span class="daybox-k">${siteText("이번 주")}</span><b class="daybox-d">${fmtShort(start)} ~ ${fmtShort(addDays(start, 6))}</b></div><ol class="weekline">${cells}</ol></section>`;
}
export function monthBox(o) {
  const mp = monthPillar({ y: o.y, m: o.m, d: 15 });
  const terms = solarTerms(o.y).filter((t) => t.date.m === o.m);
  return `<section class="daybox card" aria-label="${siteText("이번 달 월건")}"><div class="daybox-main"><span class="daybox-k">${siteText("이번 달")}</span><b class="daybox-d">${o.y}${siteText("년 ")}${o.m}${siteText("월")}</b></div>
    <dl class="daybox-grid"><div><dt>${siteText("월건")}</dt><dd><span class="hz el-${STEM_EL[mp.s]}">${pillarH(mp)}</span> ${displayPillar(mp)}${siteText("월")}</dd></div>${terms.map((t) => `<div><dt>${siteValue(t.name)}</dt><dd>${t.date.m}/${t.date.d} ${t.time}</dd></div>`).join('')}<div><dt>${siteText("만세력")}</dt><dd><a href="/manseryeok/${o.y}/${o.m}/">${o.m}${siteText("월 날짜별 일진 보기")}</a></dd></div></dl></section>`;
}
