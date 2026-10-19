import { tr } from '../../i18n/runtime.js';
import { animalName, branchName, weekdayName } from '../../i18n/terms.js';
import { siteText, siteValue } from '../copy.js';
// 띠별 운세: 허브, 연도별 12띠, 띠별 상세(출생 연도별), 삼재, 띠 궁합표, 띠별 오늘의 운세
import { TTI_COPY } from '../../content/pages.js';
import TT from '../../content/tti.js';
import { ANIMAL, ANIMAL_SLUG, BR_H, pillarLabel, yearPillar, ttiYear, ttiDay, ttiCompat, ttiMatches, samjaeYear, samjaeBranches, fmtDate, fmtShort, dow, ttiMonths, addDays } from '../../engine/index.js';
import { esc, faqBlock, faqLd, factTable } from '../util.js';
import { hero, bandChip, dayBox, ttiDayList } from './tools.js';
import { animalIcon, uiIcon } from '../icons.js';
import { ttiDailyDetail } from '../tti-detail.js';
import { ttiMonthCards } from '../tti-months.js';
import { yearGuide } from '../year-guide.js';

const yy = (y) => String(y).slice(2);
const article = (ctx, page) => ({ '@type': 'Article', headline: page.h1 || page.title, description: page.description, inLanguage: siteText('ko-KR'), datePublished: ctx.published, dateModified: ctx.buildDate, author: { '@id': `${ctx.site}/#org` }, publisher: { '@id': `${ctx.site}/#org` }, mainEntityOfPage: { '@id': `${ctx.site}${page.path}#webpage` }, image: `${ctx.site}/og-default.png` });

export function hub(ctx) {
  const page = today(ctx);
  return { ...page, path: '/tti/', title: siteText('[무료] 띠별 운세 — 오늘의 12띠 운세와 신년운세'), description: siteText('회원가입 없이 무료로 보는 띠별 운세. 띠별 운세의 시작은 오늘의 운세입니다. 동물 아이콘으로 내 띠를 고르고 오늘 해석, 올해·내년의 월별 운세, 삼재와 띠 궁합을 확인하세요.'), crumbs: [[siteText('띠별 운세'), '/tti/']] };
}

export function yearIndex(y, ctx) {
  const rows = [...Array(12).keys()].map((t) => ttiYear(t, y));
  const yp = yearPillar(y);
  const best = rows.slice().sort((a, b) => b.score - a.score).slice(0, 3);
  const lead = tr(`${y}년 종합 점수는 ${best.map((r) => `${r.animal}띠(${r.score}점)`).join(', ')} 순으로 높습니다. 내 띠를 고르면 직장·금전·연애·이동·건강 가운데 어떤 운을 활용하고 무엇을 챙기면 좋을지 볼 수 있습니다.`, `The highest overall scores for ${y} are ${best.map((r) => `${r.animal} (${r.score})`).join(', ')}. Choose your sign to explore strengths and areas needing care in work, money, love, travel and wellbeing.`);
  const page = {
    path: `/tti/${y}/`, title: `${y}${siteText("년 띠별 운세 — ")}${pillarLabel(yp)}${siteText("년 12띠 신년운세")}`, h1: `${y}${siteText("년 띠별 운세")}`,
    description: `${y}${siteText("년 ")}${pillarLabel(yp)}${siteText("년 12띠 신년운세. 쥐띠부터 돼지띠까지 띠별 점수와 총운, 출생 연도별 운세, 좋은 달과 조심할 달, ")}${y}${siteText("년 삼재 띠를 정리했습니다.")}`,
    crumbs: [[siteText('띠별 운세'), '/tti/'], [`${y}${siteText("년")}`, `/tti/${y}/`]], section: '/tti/', ogType: 'article',
    supplement: yearGuide(y, ctx, `/tti/${y}/`),
  };
  page.ld = [article(ctx, page), { '@type': 'ItemList', name: `${y}${siteText("년 띠별 운세")}`, itemListElement: rows.map((r, i) => ({ '@type': 'ListItem', position: i + 1, name: `${y}${siteText("년 ")}${siteValue(r.animal)}${siteText("띠 운세")}`, url: `${ctx.site}/tti/${y}/${ANIMAL_SLUG[r.tti]}/` })) }];
  page.body = `<article class="article">${hero(page.h1, lead, `${pillarLabel(yp)}${siteText("년")}`)}
    <div class="table-wrap zodiac-year-wrap"><table class="grid-table zodiac-year-table"><thead><tr><th scope="col">${siteText("띠")}</th><th scope="col">${siteText("점수")}</th><th scope="col">${siteText("한 줄 요약")}</th><th scope="col">${siteText("출생 연도")}</th></tr></thead><tbody>
    ${rows.map((r) => `<tr><th scope="row"><a class="zodiac-year-link" href="/tti/${y}/${ANIMAL_SLUG[r.tti]}/">${animalIcon(r.tti)}<span><b>${siteValue(r.animal)}${siteText("띠")}</b><small>${siteText("자세히 보기")}</small></span>${uiIcon('arrow')}</a></th><td><span class="zodiac-year-score"><b class="num">${r.score}</b>${bandChip(r.score)}</span></td><td>${esc(r.headline)}${r.samjae ? ` · ${siteValue(r.samjae.name)}` : ''}</td><td class="zodiac-birth-years">${r.cohorts.filter((c) => c.age >= 10 && c.age <= 86).map((c) => `<span>${c.birthYear}${siteText("년생")}</span>`).join(' ')}</td></tr>`).join('')}
    </tbody></table></div>
    <p class="updated">${siteText("최종 업데이트 ")}${ctx.buildDate} · <a href="/about/">${siteText("계산 방법")}</a></p></article>`;
  return page;
}

// 출생 연도별 월간 흐름은 서버에서 미리 계산해 넣는다. 브라우저가 사주 엔진을 받지 않아도 된다.
function cohortData(t, y, r) {
  const data = { all: ttiMonths(t, y), cohorts: Object.fromEntries(r.cohorts.map((c) => [c.birthYear, { score: c.score, text: c.text, months: ttiMonths(t, y, c.birthYear) }])) };
  return `<script type="application/json" id="tti-cohort-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

export function animalYear(t, y, ctx) {
  const r = ttiYear(t, y);
  const m = ttiMatches(t);
  const sjYears = [];
  for (let yr = y - 1; yr <= y + 12 && sjYears.length < 3; yr++) if (samjaeBranches(t).includes(yearPillar(yr).b) && yr >= y - 2) sjYears.push(yr);
  const name = tr(`${y}년 ${r.animal}띠 운세`, `${y} ${siteValue(r.animal)} Fortune`);
  const cohorts = r.cohorts.slice().reverse();
  const faq = [
    { q: `${name}${siteText("는 어떤가요?")}`, a: r.summary },
    { q: `${y}${siteText("년 ")}${siteValue(r.animal)}${siteText("띠에게 좋은 달은?")}`, a: r.goodMonths.length ? `${r.goodMonths.map((x) => `${siteValue(x)}${siteText("월")}`).join(', ')}${siteText("은 월지가 ")}${siteValue(r.animal)}${siteText("띠와 합을 이루어 일이 잘 풀립니다.")}${r.cautionMonths.length ? ` ${r.cautionMonths.map((x) => `${siteValue(x)}${siteText("월")}`).join(', ')}${siteText("은 충·형·원진이 들어 조심하는 편이 좋습니다.")}` : ''}` : `${y}${siteText("년에는 특별히 합이 드는 달이 없어 꾸준함이 가장 큰 무기입니다.")}` },
    { q: `${siteValue(r.animal)}${siteText("띠는 ")}${y}${siteText("년에 삼재인가요?")}`, a: r.samjae ? `${siteText("네. ")}${y}${siteText("년은 ")}${siteValue(r.animal)}${siteText("띠의 ")}${siteValue(r.samjae.name)}${siteText("입니다. ")}${TT.samjae[r.samjae.idx]}` : `${siteText("아닙니다. ")}${siteValue(r.animal)}${siteText("띠의 다음 삼재는 ")}${sjYears.filter((x) => x > y).slice(0, 3).join('·')}${siteText("년입니다.")}` },
    { q: `${siteValue(r.animal)}${siteText("띠와 잘 맞는 띠는?")}`, a: `${m.good.map((g) => `${animalName(g.tti)}${siteText("띠(")}${siteValue(g.rel)})`).join(', ')}${siteText("와 잘 맞고, ")}${m.bad.map((g) => `${animalName(g.tti)}${siteText("띠(")}${siteValue(g.rel)})`).join(', ')}${siteText("와는 서로 맞추는 노력이 필요합니다.")}` },
  ];
  const page = {
    path: `/tti/${y}/${ANIMAL_SLUG[t]}/`, h1: name, ogType: 'article', section: '/tti/',
    title: `${name}${siteText(" — 총운·재물·애정·건강과 출생 연도별 운세")}`,
    description: `${y}${siteText("년 ")}${pillarLabel(r.pillar)}${siteText("년 ")}${siteValue(r.animal)}${siteText("띠 운세(")}${r.score}${siteText("점): ")}${r.headline}. ${cohorts.slice(-5).map((c) => `${yy(c.birthYear)}${siteText("년생")}`).join('·')}${siteText(" 출생 연도별 운세와 좋은 달, 삼재 여부, 행운의 색을 정리했습니다.")}`,
    crumbs: [[siteText('띠별 운세'), '/tti/'], [`${y}${siteText("년")}`, `/tti/${y}/`], [`${siteValue(r.animal)}${siteText("띠")}`, `/tti/${y}/${ANIMAL_SLUG[t]}/`]],
  };
  page.ld = [article(ctx, page), faqLd(faq)];
  page.body = `<article class="article"><div class="zodiac-hero">${animalIcon(t)}${hero(name, r.summary, tr(`종합 ${r.score}점 · ${r.headline}`, `Overall ${r.score} · ${r.headline}`))}</div>
    <section class="cats-static">${r.cats.map((c) => `<article class="cat"><div class="cat-top"><h3>${c.name}</h3>${bandChip(c.score)}<div class="track"><i style="width:${c.score}%"></i></div><span class="num">${c.score}</span></div><p>${esc(c.text)}</p></article>`).join('')}</section>
    ${factTable([[siteText('종합 점수'), `<span class="num">${r.score}</span>${siteText("점 ")}${bandChip(r.score)}`], [siteText('좋은 달'), r.goodMonths.length ? r.goodMonths.map((x) => `${siteValue(x)}${siteText("월")}`).join(', ') : '—'], [siteText('조심할 달'), r.cautionMonths.length ? r.cautionMonths.map((x) => `${siteValue(x)}${siteText("월")}`).join(', ') : '—'], [siteText('행운의 색 · 숫자 · 방향'), `${r.lucky.color} · ${r.lucky.number} · ${r.lucky.dir}`]], `${name}${siteText(" 핵심 정리")}`)}
    <details class="tti-reading-basis"><summary>${tr('점수와 해석의 근거 보기', 'How the score and reading were derived')}</summary><p>${esc(r.basis)}</p>
    ${factTable([[siteText('해와의 관계'), `${branchName(r.pillar.b)}(${BR_H[r.pillar.b]}) ↔ ${branchName(t)}(${BR_H[t]}) · ${r.rel === '없음' ? siteText('특별한 합충 없음') : siteValue(r.rel)}`], [siteText('삼재'), r.samjae ? r.samjae.name : siteText('해당 없음')]])}
    </details>
    <section class="cohort-picker box card"><h2>${siteText("내 출생 연도로 보기")}</h2><label for="tti-birth-year">${siteText("출생 연도")}<select class="input" id="tti-birth-year" data-cohort data-tti="${siteValue(t)}" data-year="${y}"><option value="">${siteValue(r.animal)}${siteText("띠 공통 운세")}</option>${cohorts.map((c) => `<option value="${c.birthYear}">${c.birthYear}${siteText("년생 · ")}${c.pillarText}</option>`).join('')}</select></label><p data-cohort-text aria-live="polite">${siteText("출생 연도를 선택하면 해당 연생의 해석과 월별 점수만 보여드립니다.")}</p><p class="hint">${siteText("위 총운·분야별 해석은 띠 공통입니다. 띠는 입춘 기준이므로 1월~2월 초 출생은 앞 띠일 수 있습니다. 개인 원국 전체를 반영한 결과는 사주 운세에서 확인하세요.")}</p></section>
    <section class="box-sec"><h2>${y}${siteText("년 1~12월 운세")}</h2><p class="hint">${siteText("각 달 15일의 월운 65% + 연간 점수 35%에 출생 연도의 천간 관계를 반영합니다. 월별 점수는 이 사이트의 해석 규칙이며 통계적 예측값이 아닙니다.")}</p><div class="monthly-flow" data-monthly-flow>${ttiMonthCards(ttiMonths(t, y))}</div>${cohortData(t, y, r)}</section>
    <p class="cta"><a class="btn" href="/year/${y}/">${siteText("내 사주로 ")}${y}${siteText("년 운세 보기")}</a></p>
    ${faqBlock(faq)}
    <nav class="chips" aria-label="${siteText("다른 띠")}">${ANIMAL.map((n, i) => `<a class="chip${i === t ? ' on' : ''}" href="/tti/${y}/${ANIMAL_SLUG[i]}/">${animalIcon(i)}${siteValue(n)}${siteText("띠")}</a>`).join('')}</nav>
    <p class="updated">${siteText("최종 업데이트 ")}${ctx.buildDate} · <a href="/about/">${siteText("계산 방법")}</a></p></article>`;
  return page;
}

export function samjae(ctx) {
  const c = TTI_COPY.samjae;
  const years = [];
  for (let y = ctx.today.y - 1; y <= ctx.today.y + 10; y++) years.push(y);
  const groups = [[8, 0, 4], [5, 9, 1], [2, 6, 10], [11, 3, 7]];
  const page = {
    path: '/tti/samjae/', title: c.title, h1: c.h1, description: `${ctx.today.y}${siteText("년·")}${ctx.today.y + 1}${siteText("년 삼재 띠와 들삼재·눌삼재·날삼재를 한눈에 확인하세요. 띠별 삼재 연도표와 삼재의 뜻, 대처법을 정리했습니다.")}`,
    crumbs: [[siteText('띠별 운세'), '/tti/'], [siteText('삼재'), '/tti/samjae/']], section: '/tti/', ogType: 'article',
  };
  page.ld = [article(ctx, page), faqLd(c.faq)];
  const thisY = samjaeYear(ctx.today.y), nextY = samjaeYear(ctx.today.y + 1);
  page.body = `<article class="article">${hero(c.h1, c.lead)}
    ${factTable([[`${ctx.today.y}${siteText("년 삼재")}`, thisY.map((s) => `${animalName(s.tti)}${siteText("띠 ")}${siteValue(s.name)}`).join(', ')], [`${ctx.today.y + 1}${siteText("년 삼재")}`, nextY.map((s) => `${animalName(s.tti)}${siteText("띠 ")}${siteValue(s.name)}`).join(', ')]], siteText('올해와 내년 삼재'))}
    <section class="prose"><h2>${siteText("띠 그룹별 삼재 연도")}</h2><div class="table-wrap"><table class="grid-table"><thead><tr><th scope="col">${siteText("띠")}</th><th scope="col">${siteText("삼재가 드는 해의 지지")}</th><th scope="col">${years[0]}~${years[years.length - 1]}${siteText("년 중 삼재 해")}</th></tr></thead><tbody>
    ${groups.map((g) => { const br = samjaeBranches(g[0]); const ys = years.filter((y) => br.includes(yearPillar(y).b)); return `<tr><th scope="row">${g.map((t) => `${animalName(t)}${siteText("띠")}`).join('·')}</th><td>${br.map((b) => `${branchName(b)}(${BR_H[b]})`).join('·')}${siteText("년")}</td><td>${ys.map((y) => `${y}(${[siteText('들'), siteText('눌'), siteText('날')][br.indexOf(yearPillar(y).b)]})`).join(', ')}</td></tr>`; }).join('')}
    </tbody></table></div></section>
    <section class="prose"><h2>${siteText("삼재 3년의 의미")}</h2><dl class="dl"><dt>${siteText("들삼재")}</dt><dd>${TT.samjae[0]}</dd><dt>${siteText("눌삼재")}</dt><dd>${TT.samjae[1]}</dd><dt>${siteText("날삼재")}</dt><dd>${TT.samjae[2]}</dd></dl></section>
    ${faqBlock(c.faq)}<p class="updated">${siteText("최종 업데이트 ")}${ctx.buildDate}</p></article>`;
  return page;
}

export function compat(ctx) {
  const c = TTI_COPY.compat;
  const head = `<tr><th scope="col">${siteText("띠")}</th>${ANIMAL.map((a) => `<th scope="col">${siteValue(a)}</th>`).join('')}</tr>`;
  const rows = ANIMAL.map((a, i) => `<tr><th scope="row"><a href="#tti-${ANIMAL_SLUG[i]}">${siteValue(a)}</a></th>${ANIMAL.map((_, j) => { const r = ttiCompat(i, j); return `<td class="hm" style="--s:${r.score}" title="${siteValue(a)}${siteText("띠·")}${animalName(j)}${siteText("띠 ")}${r.score}${siteText("점")}">${r.score}</td>`; }).join('')}</tr>`).join('');
  const sections = ANIMAL.map((a, i) => {
    const m = ttiMatches(i);
    const lines = [...m.good, ...m.bad].map((g) => ttiCompat(i, g.tti));
    return `<section class="prose" id="tti-${ANIMAL_SLUG[i]}"><h2>${siteValue(a)}${siteText("띠 궁합")}</h2><p><b>${siteText("잘 맞는 띠:")}</b> ${m.good.map((g) => `${animalName(g.tti)}${siteText("띠(")}${siteValue(g.rel)}, ${ttiCompat(i, g.tti).score}${siteText("점)")}`).join(', ')} · <b>${siteText("조심할 띠:")}</b> ${m.bad.map((g) => `${animalName(g.tti)}${siteText("띠(")}${siteValue(g.rel)}, ${ttiCompat(i, g.tti).score}${siteText("점)")}`).join(', ')}</p><ul>${lines.map((l) => `<li>${esc(l.text)}</li>`).join('')}</ul></section>`;
  }).join('');
  const page = {
    path: '/tti/compatibility/', title: c.title, h1: c.h1, description: siteText('12띠 띠 궁합표. 쥐띠부터 돼지띠까지 모든 조합의 궁합 점수와 육합·삼합(잘 맞는 띠), 충·원진·형(조심할 띠)을 정리했습니다.'),
    crumbs: [[siteText('띠별 운세'), '/tti/'], [siteText('띠 궁합'), '/tti/compatibility/']], section: '/tti/', ogType: 'article',
  };
  page.ld = [article(ctx, page), faqLd(c.faq)];
  page.body = `<article class="article">${hero(c.h1, c.lead)}<div class="table-wrap"><table class="grid-table heat small"><caption>${siteText("세로 띠와 가로 띠가 만나는 칸이 궁합 점수입니다 (100점 만점)")}</caption><thead>${head}</thead><tbody>${rows}</tbody></table></div>
    <p class="cta"><a class="btn" href="/compatibility/">${siteText("두 사람의 사주 궁합 정확히 보기")}</a></p>${sections}${faqBlock(c.faq)}<p class="updated">${siteText("최종 업데이트 ")}${ctx.buildDate}</p></article>`;
  return page;
}

export function today(ctx) {
  const o = ctx.today;
  const c = TTI_COPY.today;
  return {
    path: '/tti/today/', title: `${siteText("[무료] 띠별 오늘의 운세 (")}${o.m}${siteText("월 ")}${o.d}${siteText("일) — 12띠 오늘 운세")}`, h1: c.h1, section: '/tti/',
    description: `${fmtDate(o)}${siteText(" 띠별 오늘의 운세. 쥐띠·소띠·호랑이띠·토끼띠·용띠·뱀띠·말띠·양띠·원숭이띠·닭띠·개띠·돼지띠의 오늘 점수와 해설, 행운의 색과 숫자를 확인하세요.")}`,
    crumbs: [[siteText('띠별 운세'), '/tti/'], [siteText('오늘의 운세'), '/tti/today/']], daily: true,
    body: `${hero(`${c.h1} · ${o.m}${siteText("월 ")}${o.d}${siteText("일")}`, c.lead)}${dayBox(o, siteText('오늘'))}${ttiDayList(o)}<p class="cta"><a class="btn" href="/today/">${siteText("내 사주로 오늘의 운세 보기")}</a></p>`,
  };
}

// 띠별 오늘·내일: 그 띠만의 점수 근거, 12띠 중 순위, 7일 흐름, 출생 연도, 잘 맞는 띠를 함께 싣는다.
export function animalDay(t, ctx, tomorrow = false) {
  const date = tomorrow ? addDays(ctx.today, 1) : ctx.today;
  const animal = animalName(t), slug = ANIMAL_SLUG[t], period = tomorrow ? 'tomorrow' : 'today';
  const word = tomorrow ? siteText('내일') : siteText('오늘');
  const dailyTitle = tr(`${animal}띠 ${word}의 운세`, `${animal} Fortune for ${word}`);
  const r = ttiDay(t, date);
  const all = [...Array(12).keys()].map((i) => ttiDay(i, date));
  const rank = 1 + all.filter((x) => x.score > r.score).length;
  const top = all.filter((x) => x.tti !== t).sort((a, b) => b.score - a.score)[0];
  const week = [...Array(7).keys()].map((i) => { const d = addDays(date, i); return { d, score: ttiDay(t, d).score }; });
  const best = week.slice(1).sort((a, b) => b.score - a.score)[0];
  const m = ttiMatches(t);
  const y = ctx.today.y;
  const births = ttiYear(t, y).cohorts.filter((c) => c.age >= 6 && c.age <= 90).map((c) => c.birthYear);
  const first = r.text.split(/(?<=[.!?])\s+/)[0];
  return {
    path: `/tti/${period}/${slug}/`, section: '/tti/',
    title: tr(`${animal}띠 ${word}의 운세 — ${date.m}월 ${date.d}일 ${r.score}점`, `${dailyTitle} — ${date.m}/${date.d} · ${r.score} points`),
    description: `${fmtDate(date)} ${animal}${siteText("띠 ")}${word}${siteText("의 운세 ")}${r.score}${siteText("점. ")}${first}${siteText(" 12띠 중 ")}${rank}${siteText("위이며, 앞으로 7일 흐름과 행운의 색·숫자, 잘 맞는 띠를 함께 확인하세요.")}`,
    crumbs: [[siteText('띠별 운세'), '/tti/'], [`${animal}${siteText("띠 ")}${word}${siteText(" 운세")}`, `/tti/${period}/${slug}/`]],
    body: `${hero(dailyTitle, `${fmtDate(date)} ${animal}${siteText("띠는 12띠 가운데 ")}${rank}${siteText("위(")}${r.score}${siteText("점)입니다. ")}${top.score > r.score ? `${word}${siteText(" 가장 운이 좋은 띠는 ")}${siteValue(top.animal)}${siteText("띠(")}${top.score}${siteText("점)입니다.")}` : `${word}${siteText("은 ")}${animal}${siteText("띠가 가장 운이 좋은 띠입니다.")}`}`)}
      <article class="box card">${ttiDailyDetail(t, date, word)}</article>
      <section class="box card tti-week"><h2>${animal}${siteText("띠의 앞으로 7일")}</h2>
        <ol class="tti-week-list">${week.map((w, i) => `<li${i === 0 ? ' class="is-today"' : ''}><span>${weekdayName(dow(w.d))} ${fmtShort(w.d)}</span><i style="--s:${w.score}" aria-hidden="true"></i><b class="num">${w.score}</b>${bandChip(w.score)}</li>`).join('')}</ol>
        <p class="hint">${best.score >= r.score ? `${siteText("이번 7일 중에서는 ")}${best.d.m}${siteText("월 ")}${best.d.d}${siteText("일(")}${weekdayName(dow(best.d))}${siteText(")이 ")}${best.score}${siteText("점으로 가장 좋습니다.")}` : `${word}${siteText("이 이번 7일 중 가장 좋은 날입니다.")}`}</p>
      </section>
      ${factTable([
        [siteText('출생 연도'), `${births.map((b) => `${b}`).join(' · ')}${siteText("년생 ")}<small>${siteText("(1월~2월 초 출생은 입춘 전이라 앞 띠일 수 있습니다)")}</small>`],
        [siteText('잘 맞는 띠'), m.good.map((g) => `${animalName(g.tti)}${siteText("띠(")}${siteValue(g.rel)})`).join(', ')],
        [siteText('조심할 띠'), m.bad.map((g) => `${animalName(g.tti)}${siteText("띠(")}${siteValue(g.rel)})`).join(', ')],
        [`${y}${siteText("년 · ")}${y + 1}${siteText("년 운세")}`, `<a href="/tti/${y}/${slug}/">${y}${siteText("년 ")}${animal}${siteText("띠 운세")}</a> · <a href="/tti/${y + 1}/${slug}/">${y + 1}${siteText("년 ")}${animal}${siteText("띠 운세")}</a>`],
      ], `${animal}${siteText("띠 한눈에 보기")}`)}
      <nav class="chips" aria-label="${siteText("다른 띠 ")}${word}${siteText(" 운세")}">${ANIMAL.map((n, i) => `<a class="chip${i === t ? ' on' : ''}" href="/tti/${period}/${ANIMAL_SLUG[i]}/">${animalIcon(i)}${siteValue(n)}${siteText("띠")}</a>`).join('')}</nav>
      <a class="btn ghost" href="/tti/today/">${siteText("12띠 오늘의 운세로 돌아가기")}</a>`,
  };
}
