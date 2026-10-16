import { animalName, weekdayName } from '../../i18n/terms.js';
import { siteText, displayPillar, siteValue } from '../copy.js';
// 만세력 표: 연도별(24절기·월건) / 월별(날짜별 일진·음력·절기)
import { MANSE_COPY } from '../../content/pages.js';
import { STEM_EL, daysIn, dow, pillarLabel, pillarH, dayPillar, monthPillar, yearPillar, lunarOf, solarTerms, toUTC } from '../../engine/index.js';
import { hero } from './tools.js';
import { yearGuide } from '../year-guide.js';

export function manseYear(y, ctx) {
  const c = MANSE_COPY.year(y);
  const terms = solarTerms(y);
  const months = [...Array(12).keys()].map((i) => { const m = i + 1; const mp = monthPillar({ y, m, d: 15 }); return `<a class="card link-card" href="/manseryeok/${y}/${m}/"><b>${y}${siteText("년 ")}${m}${siteText("월")}</b><span><span class="hz el-${STEM_EL[mp.s]}">${pillarH(mp)}</span> ${displayPillar(mp)}${siteText("월 · ")}${terms.filter((t) => t.date.m === m).map((t) => siteValue(t.name)).join('·')}</span></a>`; }).join('');
  return {
    path: `/manseryeok/${y}/`, title: c.title, description: `${y}${siteText("년(")}${pillarLabel(yearPillar(y))}${siteText("년) 만세력. 24절기 절입 시각과 월별 월건, 날짜별 일진과 음력을 확인하세요.")}`,
    crumbs: [[siteText('만세력'), '/manseryeok/'], [`${y}${siteText("년")}`, `/manseryeok/${y}/`]], section: '/manseryeok/', ogType: 'article',
    ld: [{ '@type': 'Dataset', name: `${y}${siteText("년 만세력")}`, description: c.lead, inLanguage: siteText('ko-KR'), creator: { '@id': `${ctx.site}/#org` }, temporalCoverage: `${y}-01-01/${y}-12-31`, isAccessibleForFree: true, license: `${ctx.site}/about/` }],
    supplement: yearGuide(y, ctx, `/manseryeok/${y}/`),
    body: `${hero(c.h1, c.lead, `${pillarLabel(yearPillar(y))}${siteText("년 · ")}${animalName(yearPillar(y).b)}${siteText("띠")}`)}
      <section class="box-sec"><div class="sec-head"><h2>${y}${siteText("년 24절기 절입 시각 (한국 표준시)")}</h2></div><div class="table-wrap"><table class="grid-table"><thead><tr><th scope="col">${siteText("절기")}</th><th scope="col">${siteText("날짜")}</th><th scope="col">${siteText("시각")}</th></tr></thead><tbody>${terms.map((t) => `<tr><th scope="row">${siteValue(t.name)}</th><td>${t.date.m}${siteText("월 ")}${t.date.d}${siteText("일 (")}${weekdayName(dow(t.date))})</td><td class="num">${t.time}</td></tr>`).join('')}</tbody></table></div></section>
      <section class="box-sec"><div class="sec-head"><h2>${siteText("월별 만세력")}</h2></div><div class="cards four">${months}</div></section>
      <p class="cta"><a class="btn" href="/manseryeok/">${siteText("생년월일시로 사주 원국 계산하기")}</a></p>`,
  };
}

export function manseMonth(y, m, ctx) {
  const c = MANSE_COPY.month(y, m);
  const n = daysIn(y, m);
  const terms = solarTerms(y).filter((t) => t.date.m === m);
  const rows = [];
  for (let d = 1; d <= n; d++) {
    const o = { y, m, d };
    const dp = dayPillar(o), mp = monthPillar(o);
    const l = lunarOf(o);
    const term = terms.find((t) => t.date.d === d);
    const isToday = toUTC(o) === toUTC(ctx.today);
    rows.push(`<tr${isToday ? ' class="is-today"' : ''}${dow(o) === 0 ? ' data-sun' : ''}><th scope="row">${m}/${d} <span class="muted">${weekdayName(dow(o))}</span></th><td><span class="hz el-${STEM_EL[dp.s]}">${pillarH(dp)}</span> ${displayPillar(dp)}</td><td>${l ? `${l.leap ? siteText('윤') : ''}${l.m}.${l.d}` : ''}</td><td><span class="hz">${pillarH(mp)}</span></td><td>${term ? `${siteValue(term.name)} ${term.time}` : ''}</td></tr>`);
  }
  const mp = monthPillar({ y, m, d: 15 });
  const prev = m === 1 ? [y - 1, 12] : [y, m - 1];
  const next = m === 12 ? [y + 1, 1] : [y, m + 1];
  const lead = `${y}${siteText("년 ")}${m}${siteText("월의 월건은 ")}${pillarLabel(mp)}${siteText("월")}${terms.length ? `${siteText("이며, ")}${terms.map((t) => `${siteValue(t.name)}${siteText("은 ")}${t.date.d}${siteText("일 ")}${t.time}`).join(', ')}${siteText("에 듭니다")}` : siteText('입니다')}${siteText(". 아래 표는 날짜별 일진(일주)과 한국천문연구원 기준 음력, 그날의 월주를 정리한 것입니다.")}`;
  const inRange = (yy) => yy === ctx.today.y || yy === ctx.today.y + 1;
  return {
    path: `/manseryeok/${y}/${m}/`, title: c.title, description: `${y}${siteText("년 ")}${m}${siteText("월 만세력: 날짜별 일진(간지), 음력 날짜, 월건 ")}${pillarLabel(mp)}${terms.length ? `, ${terms.map((t) => siteValue(t.name)).join('·')}${siteText(" 절입 시각")}` : ''}${siteText("을 한 표로 확인하세요.")}`,
    crumbs: [[siteText('만세력'), '/manseryeok/'], [`${y}${siteText("년")}`, `/manseryeok/${y}/`], [`${m}${siteText("월")}`, `/manseryeok/${y}/${m}/`]], section: '/manseryeok/', ogType: 'article',
    body: `${hero(c.h1, lead)}<div class="table-wrap"><table class="grid-table manse"><thead><tr><th scope="col">${siteText("양력")}</th><th scope="col">${siteText("일진")}</th><th scope="col">${siteText("음력")}</th><th scope="col">${siteText("월주")}</th><th scope="col">${siteText("절기")}</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>
      <nav class="pager" aria-label="${siteText("이전·다음 달")}">${inRange(prev[0]) ? `<a href="/manseryeok/${prev[0]}/${prev[1]}/">← ${prev[0]}${siteText("년 ")}${prev[1]}${siteText("월")}</a>` : '<span></span>'}<a href="/manseryeok/${y}/">${y}${siteText("년 만세력")}</a>${inRange(next[0]) ? `<a href="/manseryeok/${next[0]}/${next[1]}/">${next[0]}${siteText("년 ")}${next[1]}${siteText("월 →")}</a>` : '<span></span>'}</nav>
      <p class="cta"><a class="btn" href="/manseryeok/">${siteText("내 사주 원국 계산하기")}</a></p>`,
  };
}
