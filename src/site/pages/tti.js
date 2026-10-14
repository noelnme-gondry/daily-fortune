// 띠별 운세: 허브, 연도별 12띠, 띠별 상세(출생 연도별), 삼재, 띠 궁합표, 띠별 오늘의 운세
import { TTI_COPY } from '../../content/pages.js';
import TT from '../../content/tti.js';
import { ANIMAL, ANIMAL_SLUG, BR_H, BR_K, pillarLabel, yearPillar, ttiYear, ttiCompat, ttiMatches, samjaeYear, samjaeBranches, fmtDate, ttiMonths, addDays } from '../../engine/index.js';
import { esc, faqBlock, faqLd, factTable } from '../util.js';
import { hero, bandChip, dayBox, ttiDayList } from './tools.js';
import { animalIcon, uiIcon } from '../icons.js';
import { ttiDailyDetail } from '../tti-detail.js';
import { ttiMonthCards } from '../tti-months.js';

const yy = (y) => String(y).slice(2);
const article = (ctx, page) => ({ '@type': 'Article', headline: page.h1 || page.title, description: page.description, inLanguage: 'ko-KR', datePublished: ctx.published, dateModified: ctx.buildDate, author: { '@id': `${ctx.site}/#org` }, publisher: { '@id': `${ctx.site}/#org` }, mainEntityOfPage: { '@id': `${ctx.site}${page.path}#webpage` }, image: `${ctx.site}/og-default.png` });

export function hub(ctx) {
  const page = today(ctx);
  return { ...page, path: '/tti/', title: '띠별 운세 — 오늘의 12띠 운세와 신년운세', description: '띠별 운세의 시작은 오늘의 운세입니다. 동물 아이콘으로 내 띠를 고르고 오늘 해석, 올해·내년의 월별 운세, 삼재와 띠 궁합을 확인하세요.', crumbs: [['띠별 운세', '/tti/']] };
}

export function yearIndex(y, ctx) {
  const rows = [...Array(12).keys()].map((t) => ttiYear(t, y));
  const yp = yearPillar(y);
  const sj = samjaeYear(y);
  const best = rows.slice().sort((a, b) => b.score - a.score).slice(0, 3);
  const lead = `${y}년은 ${pillarLabel(yp)}년, ${ANIMAL[yp.b]}띠의 해입니다. 띠별로는 ${best.map((r) => `${r.animal}띠(${r.score}점)`).join(', ')}의 운이 가장 좋고, ${sj.map((s) => `${ANIMAL[s.tti]}띠`).join('·')}는 ${sj[0] ? sj[0].name : ''}에 해당합니다. 아래 점수는 ${yp.b === undefined ? '' : `${BR_K[yp.b]}(${BR_H[yp.b]})`} 년지와 각 띠의 합·충·원진, 오행의 상생·상극, 삼재를 반영한 값입니다.`;
  const page = {
    path: `/tti/${y}/`, title: `${y}년 띠별 운세 — ${pillarLabel(yp)}년 12띠 신년운세`, h1: `${y}년 띠별 운세`,
    description: `${y}년 ${pillarLabel(yp)}년 12띠 신년운세. 쥐띠부터 돼지띠까지 띠별 점수와 총운, 출생 연도별 운세, 좋은 달과 조심할 달, ${y}년 삼재 띠를 정리했습니다.`,
    crumbs: [['띠별 운세', '/tti/'], [`${y}년`, `/tti/${y}/`]], section: '/tti/', ogType: 'article',
  };
  page.ld = [article(ctx, page), { '@type': 'ItemList', name: `${y}년 띠별 운세`, itemListElement: rows.map((r, i) => ({ '@type': 'ListItem', position: i + 1, name: `${y}년 ${r.animal}띠 운세`, url: `${ctx.site}/tti/${y}/${ANIMAL_SLUG[r.tti]}/` })) }];
  page.body = `<article class="article">${hero(page.h1, lead, `${pillarLabel(yp)}년`)}
    <div class="table-wrap zodiac-year-wrap"><table class="grid-table zodiac-year-table"><thead><tr><th scope="col">띠</th><th scope="col">점수</th><th scope="col">한 줄 요약</th><th scope="col">출생 연도</th></tr></thead><tbody>
    ${rows.map((r) => `<tr><th scope="row"><a class="zodiac-year-link" href="/tti/${y}/${ANIMAL_SLUG[r.tti]}/">${animalIcon(r.tti)}<span><b>${r.animal}띠</b><small>자세히 보기</small></span>${uiIcon('arrow')}</a></th><td><span class="zodiac-year-score"><b class="num">${r.score}</b>${bandChip(r.score)}</span></td><td>${esc(r.headline)}${r.samjae ? ` · ${r.samjae.name}` : ''}</td><td class="zodiac-birth-years">${r.cohorts.filter((c) => c.age >= 10 && c.age <= 86).map((c) => `<span>${c.birthYear}년생</span>`).join(' ')}</td></tr>`).join('')}
    </tbody></table></div>
    <p class="updated">최종 업데이트 ${ctx.buildDate} · <a href="/about/">계산 방법</a></p></article>`;
  return page;
}

export function animalYear(t, y, ctx) {
  const r = ttiYear(t, y);
  const m = ttiMatches(t);
  const sjYears = [];
  for (let yr = y - 1; yr <= y + 12 && sjYears.length < 3; yr++) if (samjaeBranches(t).includes(yearPillar(yr).b) && yr >= y - 2) sjYears.push(yr);
  const name = `${y}년 ${r.animal}띠 운세`;
  const cohorts = r.cohorts.slice().reverse();
  const faq = [
    { q: `${name}는 어떤가요?`, a: `${r.headline}입니다. ${r.summary}` },
    { q: `${y}년 ${r.animal}띠에게 좋은 달은?`, a: r.goodMonths.length ? `${r.goodMonths.map((x) => `${x}월`).join(', ')}은 월지가 ${r.animal}띠와 합을 이루어 일이 잘 풀립니다.${r.cautionMonths.length ? ` ${r.cautionMonths.map((x) => `${x}월`).join(', ')}은 충·형·원진이 들어 조심하는 편이 좋습니다.` : ''}` : `${y}년에는 특별히 합이 드는 달이 없어 꾸준함이 가장 큰 무기입니다.` },
    { q: `${r.animal}띠는 ${y}년에 삼재인가요?`, a: r.samjae ? `네. ${y}년은 ${r.animal}띠의 ${r.samjae.name}입니다. ${TT.samjae[r.samjae.idx]}` : `아닙니다. ${r.animal}띠의 다음 삼재는 ${sjYears.filter((x) => x > y).slice(0, 3).join('·')}년입니다.` },
    { q: `${r.animal}띠와 잘 맞는 띠는?`, a: `${m.good.map((g) => `${ANIMAL[g.tti]}띠(${g.rel})`).join(', ')}와 잘 맞고, ${m.bad.map((g) => `${ANIMAL[g.tti]}띠(${g.rel})`).join(', ')}와는 서로 맞추는 노력이 필요합니다.` },
  ];
  const page = {
    path: `/tti/${y}/${ANIMAL_SLUG[t]}/`, h1: name, ogType: 'article', section: '/tti/',
    title: `${name} — 총운·재물·애정·건강과 출생 연도별 운세`,
    description: `${y}년 ${pillarLabel(r.pillar)}년 ${r.animal}띠 운세(${r.score}점): ${r.headline}. ${cohorts.slice(-5).map((c) => `${yy(c.birthYear)}년생`).join('·')} 출생 연도별 운세와 좋은 달, 삼재 여부, 행운의 색을 정리했습니다.`,
    crumbs: [['띠별 운세', '/tti/'], [`${y}년`, `/tti/${y}/`], [`${r.animal}띠`, `/tti/${y}/${ANIMAL_SLUG[t]}/`]],
  };
  page.ld = [article(ctx, page), faqLd(faq)];
  page.body = `<article class="article">${hero(name, `${y}년 ${r.animal}띠의 운세 점수는 ${r.score}점으로 "${r.headline}"입니다. ${r.summary}`, `${pillarLabel(r.pillar)}년 · ${r.animal}띠 ${BR_K[t]}(${BR_H[t]})`)}
    ${factTable([['종합 점수', `<span class="num">${r.score}</span>점 ${bandChip(r.score)}`], ['해와의 관계', `${BR_K[r.pillar.b]}(${BR_H[r.pillar.b]}) ↔ ${BR_K[t]}(${BR_H[t]}) · ${r.rel === '없음' ? '특별한 합충 없음' : r.rel}`], ['삼재', r.samjae ? r.samjae.name : '해당 없음'], ['좋은 달', r.goodMonths.length ? r.goodMonths.map((x) => `${x}월`).join(', ') : '—'], ['조심할 달', r.cautionMonths.length ? r.cautionMonths.map((x) => `${x}월`).join(', ') : '—'], ['행운의 색 · 숫자 · 방향', `${r.lucky.color} · ${r.lucky.number} · ${r.lucky.dir}`]], `${name} 핵심 정리`)}
    <section class="cats-static">${r.cats.map((c) => `<article class="cat"><div class="cat-top"><h3>${c.name}</h3>${bandChip(c.score)}<div class="track"><i style="width:${c.score}%"></i></div><span class="num">${c.score}</span></div><p>${esc(c.text)}</p></article>`).join('')}</section>
    <section class="cohort-picker box card"><h2>내 출생 연도로 보기</h2><label for="tti-birth-year">출생 연도<select class="input" id="tti-birth-year" data-cohort data-tti="${t}" data-year="${y}"><option value="">${r.animal}띠 공통 운세</option>${cohorts.map((c) => `<option value="${c.birthYear}">${c.birthYear}년생 · ${c.pillarText}</option>`).join('')}</select></label><p data-cohort-text aria-live="polite">출생 연도를 선택하면 해당 연생의 해석과 월별 점수만 보여드립니다.</p><p class="hint">위 총운·분야별 해석은 띠 공통입니다. 띠는 입춘 기준이므로 1월~2월 초 출생은 앞 띠일 수 있습니다. 개인 원국 전체를 반영한 결과는 사주 운세에서 확인하세요.</p></section>
    <section class="box-sec"><h2>${y}년 1~12월 운세</h2><p class="hint">각 달 15일의 월운 65% + 연간 점수 35%에 출생 연도의 천간 관계를 반영합니다. 월별 점수는 이 사이트의 해석 규칙이며 통계적 예측값이 아닙니다.</p><div class="monthly-flow" data-monthly-flow>${ttiMonthCards(ttiMonths(t, y))}</div></section>
    <p class="cta"><a class="btn" href="/year/${y}/">내 사주로 ${y}년 운세 정확히 보기</a></p>
    ${faqBlock(faq)}
    <nav class="chips" aria-label="다른 띠">${ANIMAL.map((n, i) => `<a class="chip${i === t ? ' on' : ''}" href="/tti/${y}/${ANIMAL_SLUG[i]}/">${animalIcon(i)}${n}띠</a>`).join('')}</nav>
    <p class="updated">최종 업데이트 ${ctx.buildDate} · <a href="/about/">계산 방법</a></p></article>`;
  return page;
}

export function samjae(ctx) {
  const c = TTI_COPY.samjae;
  const years = [];
  for (let y = ctx.today.y - 1; y <= ctx.today.y + 10; y++) years.push(y);
  const groups = [[8, 0, 4], [5, 9, 1], [2, 6, 10], [11, 3, 7]];
  const page = {
    path: '/tti/samjae/', title: c.title, h1: c.h1, description: `${ctx.today.y}년·${ctx.today.y + 1}년 삼재 띠와 들삼재·눌삼재·날삼재를 한눈에 확인하세요. 띠별 삼재 연도표와 삼재의 뜻, 대처법을 정리했습니다.`,
    crumbs: [['띠별 운세', '/tti/'], ['삼재', '/tti/samjae/']], section: '/tti/', ogType: 'article',
  };
  page.ld = [article(ctx, page), faqLd(c.faq)];
  const thisY = samjaeYear(ctx.today.y), nextY = samjaeYear(ctx.today.y + 1);
  page.body = `<article class="article">${hero(c.h1, c.lead)}
    ${factTable([[`${ctx.today.y}년 삼재`, thisY.map((s) => `${ANIMAL[s.tti]}띠 ${s.name}`).join(', ')], [`${ctx.today.y + 1}년 삼재`, nextY.map((s) => `${ANIMAL[s.tti]}띠 ${s.name}`).join(', ')]], '올해와 내년 삼재')}
    <section class="prose"><h2>띠 그룹별 삼재 연도</h2><div class="table-wrap"><table class="grid-table"><thead><tr><th scope="col">띠</th><th scope="col">삼재가 드는 해의 지지</th><th scope="col">${years[0]}~${years[years.length - 1]}년 중 삼재 해</th></tr></thead><tbody>
    ${groups.map((g) => { const br = samjaeBranches(g[0]); const ys = years.filter((y) => br.includes(yearPillar(y).b)); return `<tr><th scope="row">${g.map((t) => `${ANIMAL[t]}띠`).join('·')}</th><td>${br.map((b) => `${BR_K[b]}(${BR_H[b]})`).join('·')}년</td><td>${ys.map((y) => `${y}(${['들', '눌', '날'][br.indexOf(yearPillar(y).b)]})`).join(', ')}</td></tr>`; }).join('')}
    </tbody></table></div></section>
    <section class="prose"><h2>삼재 3년의 의미</h2><dl class="dl"><dt>들삼재</dt><dd>${TT.samjae[0]}</dd><dt>눌삼재</dt><dd>${TT.samjae[1]}</dd><dt>날삼재</dt><dd>${TT.samjae[2]}</dd></dl></section>
    ${faqBlock(c.faq)}<p class="updated">최종 업데이트 ${ctx.buildDate}</p></article>`;
  return page;
}

export function compat(ctx) {
  const c = TTI_COPY.compat;
  const head = `<tr><th scope="col">띠</th>${ANIMAL.map((a) => `<th scope="col">${a}</th>`).join('')}</tr>`;
  const rows = ANIMAL.map((a, i) => `<tr><th scope="row"><a href="#tti-${ANIMAL_SLUG[i]}">${a}</a></th>${ANIMAL.map((_, j) => { const r = ttiCompat(i, j); return `<td class="hm" style="--s:${r.score}" title="${a}띠·${ANIMAL[j]}띠 ${r.score}점">${r.score}</td>`; }).join('')}</tr>`).join('');
  const sections = ANIMAL.map((a, i) => {
    const m = ttiMatches(i);
    const lines = [...m.good, ...m.bad].map((g) => ttiCompat(i, g.tti));
    return `<section class="prose" id="tti-${ANIMAL_SLUG[i]}"><h2>${a}띠 궁합</h2><p><b>잘 맞는 띠:</b> ${m.good.map((g) => `${ANIMAL[g.tti]}띠(${g.rel}, ${ttiCompat(i, g.tti).score}점)`).join(', ')} · <b>조심할 띠:</b> ${m.bad.map((g) => `${ANIMAL[g.tti]}띠(${g.rel}, ${ttiCompat(i, g.tti).score}점)`).join(', ')}</p><ul>${lines.map((l) => `<li>${esc(l.text)}</li>`).join('')}</ul></section>`;
  }).join('');
  const page = {
    path: '/tti/compatibility/', title: c.title, h1: c.h1, description: '12띠 띠 궁합표. 쥐띠부터 돼지띠까지 모든 조합의 궁합 점수와 육합·삼합(잘 맞는 띠), 충·원진·형(조심할 띠)을 정리했습니다.',
    crumbs: [['띠별 운세', '/tti/'], ['띠 궁합', '/tti/compatibility/']], section: '/tti/', ogType: 'article',
  };
  page.ld = [article(ctx, page), faqLd(c.faq)];
  page.body = `<article class="article">${hero(c.h1, c.lead)}<div class="table-wrap"><table class="grid-table heat small"><caption>세로 띠와 가로 띠가 만나는 칸이 궁합 점수입니다 (100점 만점)</caption><thead>${head}</thead><tbody>${rows}</tbody></table></div>
    <p class="cta"><a class="btn" href="/compatibility/">두 사람의 사주 궁합 정확히 보기</a></p>${sections}${faqBlock(c.faq)}<p class="updated">최종 업데이트 ${ctx.buildDate}</p></article>`;
  return page;
}

export function today(ctx) {
  const o = ctx.today;
  const c = TTI_COPY.today;
  return {
    path: '/tti/today/', title: `띠별 오늘의 운세 (${o.m}월 ${o.d}일) — 12띠 오늘 운세`, h1: c.h1, section: '/tti/',
    description: `${fmtDate(o)} 띠별 오늘의 운세. 쥐띠·소띠·호랑이띠·토끼띠·용띠·뱀띠·말띠·양띠·원숭이띠·닭띠·개띠·돼지띠의 오늘 점수와 해설, 행운의 색과 숫자를 확인하세요.`,
    crumbs: [['띠별 운세', '/tti/'], ['오늘의 운세', '/tti/today/']], daily: true,
    body: `${hero(`${c.h1} · ${o.m}월 ${o.d}일`, c.lead)}${dayBox(o, '오늘')}${ttiDayList(o)}<p class="cta"><a class="btn" href="/today/">내 사주로 오늘의 운세 보기</a></p>`,
  };
}

export function animalDay(t, ctx, tomorrow = false) {
  const date = tomorrow ? addDays(ctx.today, 1) : ctx.today;
  const animal = ANIMAL[t], slug = ANIMAL_SLUG[t], period = tomorrow ? 'tomorrow' : 'today';
  const word = tomorrow ? '내일' : '오늘';
  return {
    path: `/tti/${period}/${slug}/`, section: '/tti/',
    title: `${animal}띠 ${word}의 운세 — ${date.m}월 ${date.d}일 상세 해석`,
    description: `${fmtDate(date)} ${animal}띠 ${word}의 운세. 일진 관계, 오행, 월운에 따른 점수 근거와 행운의 색·숫자를 확인하세요.`,
    crumbs: [['띠별 운세', '/tti/'], [`${animal}띠 ${word} 운세`, `/tti/${period}/${slug}/`]],
    body: `${hero(`${animal}띠 ${word}의 운세`, `${fmtDate(date)}의 띠별 해석입니다.`)}<article class="box card">${ttiDailyDetail(t, date, word)}</article><a class="btn ghost" href="/tti/today/">12띠 오늘의 운세로 돌아가기</a>`,
  };
}
