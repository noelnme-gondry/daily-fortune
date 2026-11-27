import { tr } from '../../i18n/runtime.js';
import { animalName, branchName, weekdayName } from '../../i18n/terms.js';
import { siteText, siteValue } from '../copy.js';
// 띠별 운세: 허브, 연도별 12띠, 띠별 상세(출생 연도별), 삼재, 띠 궁합표, 띠별 오늘의 운세
import { TTI_COPY } from '../../content/pages.js';
import TT from '../../content/tti.js';
import { ANIMAL, ANIMAL_SLUG, BR_H, pillarLabel, yearPillar, ttiYear, ttiDay, ttiCompat, ttiMatches, samjaeYear, samjaeBranches, fmtDate, fmtShort, dow, ttiMonths, addDays } from '../../engine/index.js';
import { esc, faqBlock, faqLd, factTable } from '../util.js';
import { hero, bandChip, dayBox } from './tools.js';
import { animalIcon, uiIcon } from '../icons.js';
import { ttiDailyDetail, zodiacPersonalLinks } from '../tti-detail.js';
import { ttiMonthCards } from '../tti-months.js';
import { yearGuide } from '../year-guide.js';

const article = (ctx, page) => ({ '@type': 'Article', headline: page.h1 || page.title, description: page.description, inLanguage: siteText('ko-KR'), datePublished: ctx.published, dateModified: ctx.buildDate, author: { '@id': `${ctx.site}/#org` }, publisher: { '@id': `${ctx.site}/#org` }, mainEntityOfPage: { '@id': `${ctx.site}${page.path}#webpage` }, image: `${ctx.site}/og-default.png` });

export function hub(ctx) {
  const y = ctx.today.y;
  const choices = [
    ['/tti/today/', tr('띠별 오늘의 운세', 'Today’s twelve zodiac readings'), tr('오늘 점수와 해석을 비교하고 내 띠의 7일 흐름으로 이동합니다.', 'Compare today’s readings and open the seven-day view for your sign.')],
    ['/tti/tomorrow/', tr('띠별 내일의 운세', 'Tomorrow’s zodiac readings'), tr('내 띠의 내일 점수와 풀이를 확인합니다.', 'Find tomorrow’s score and reading for your sign.')],
    [`/tti/${y}/`, tr(`${y}년 띠별 운세`, `${y} zodiac readings`), tr('출생 연도를 선택해 월별 흐름을 확인합니다. 띠 공통 해석과 연생별 표시를 구분하세요.', 'Choose a birth year to inspect monthly readings, distinguishing sign-wide text from birth-year details.')],
    [`/tti/${y + 1}/`, tr(`${y + 1}년 띠별 운세`, `${y + 1} zodiac readings`), tr('다음 해의 간지와 월별 해석을 봅니다. 미래 사건의 예측 확률은 아닙니다.', 'Explore next year’s calendar relationships and monthly readings, not probabilities of future events.')],
    ['/tti/samjae/', tr('삼재 연도 확인', 'Check Samjae years'), tr('띠 그룹별 들삼재·눌삼재·날삼재를 표로 확인합니다.', 'Look up the traditional three-year Samjae cycle by zodiac group.')],
    ['/tti/compatibility/', tr('띠 궁합 관계표', 'Zodiac relationship table'), tr('합·충 등 전통적인 지지 관계를 비교합니다. 실제 관계의 성공 여부를 판정하지 않습니다.', 'Compare traditional branch relationships, not the success of a real relationship.')],
  ];
  return {
    path: '/tti/', section: '/tti/',
    title: tr('띠별 운세 안내 — 오늘·내일·신년·삼재·궁합 고르기', 'Zodiac reading guide — daily, annual, Samjae and compatibility'),
    description: tr('띠별 오늘·내일 운세, 연간 운세, 삼재와 궁합의 차이를 확인하고 필요한 자료를 고르세요. 출생 연도와 입춘 기준, 개인 사주와 띠별 해석의 차이도 설명합니다.', 'Choose between daily and annual zodiac readings, Samjae and compatibility. Learn about birth-year boundaries, Ipchun and the difference from a full birth chart.'),
    crumbs: [[siteText('띠별 운세'), '/tti/']],
    body: `<article class="article" data-zodiac-guide>${hero(tr('어떤 띠별 운세를 찾으세요?', 'Which zodiac reading do you need?'), tr('하루의 해석, 한 해의 월별 흐름, 삼재 연도와 궁합 관계표는 서로 다른 질문에 답합니다. 필요한 자료를 고른 뒤 해석이 적용되는 범위를 함께 확인하세요.', 'Daily readings, annual monthly views, Samjae years and compatibility answer different questions. Choose a resource and check what its interpretation covers.'))}
      <div class="cards">${choices.map(([href, title, text]) => `<a class="card link-card" href="${href}"><b>${esc(title)}</b><span>${esc(text)}</span></a>`).join('')}</div>
      <section class="prose"><h2>${tr('1월·2월 초 출생이라면 띠의 경계를 확인하세요', 'Check the year boundary for January and early-February births')}</h2><p>${tr('이 서비스의 띠는 명리의 입춘 경계를 사용합니다. 양력 1월 1일이나 음력 설날 기준의 띠와 다를 수 있으므로, 경계 무렵 출생자는 날짜와 시각을 확인하세요. 출생 연도 숫자만 보고 정하지 않습니다.', 'This service uses the Ipchun boundary. It can differ from January 1 or Lunar New Year conventions. If you were born near the boundary, check the date and time rather than choosing by the year number alone.')} <a href="/manseryeok/">${tr('만세력에서 내 띠 확인하기', 'Check my sign in the birth chart')}</a> · <a href="/guides/ipchun-boundary/">${tr('입춘 경계 읽는 법', 'Read the Ipchun boundary guide')}</a></p></section>
      <section class="prose"><h2>${tr('띠별 해석과 개인 사주는 범위가 다릅니다', 'Zodiac and personal birth-chart readings have different scope')}</h2><p>${tr('같은 띠는 같은 기본 해석을 봅니다. 생년월일시 전체를 반영하지 않으며 개인의 성격·건강·미래 사건을 측정하지 않습니다. 내 네 기둥의 관계가 궁금하면 개인 사주 계산으로 이동하세요.', 'People with the same sign share the base reading. It does not use the full birth date and time or measure personality, health or future events. Use a personal chart when you need to inspect all four pillars.')} <a href="/today/">${tr('내 사주로 오늘의 운세 보기', 'Read today with my full chart')}</a> · <a href="/guides/zodiac-samjae/">${tr('띠·삼재 해석의 이용 기준', 'How to use zodiac and Samjae readings')}</a></p></section>
      <section class="prose"><h2>${tr('오늘에서 내일로 이어서 보려면', 'Continue from today to tomorrow')}</h2><p>${tr('오늘의 12띠 목록에서 내 띠를 고르면 날짜별 점수 근거와 7일 흐름을 볼 수 있습니다. 날짜가 바뀐 해석과 현재 날짜를 구분하고, 점수를 일의 성공 확률로 읽지 마세요.', 'Choose your sign in today’s list to see the score basis and seven-day view. Check the date of each reading; scores are not probabilities of success.')} <a href="/tti/today/">${tr('오늘의 띠별 목록 열기', 'Open today’s zodiac list')}</a></p></section></article>`,
  };
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
  const exampleYears = cohorts.filter(c => c.age >= 18 && c.age <= 85).slice(0, 5).map(c => c.birthYear);
  const cohortTable = `<details><summary>${tr('출생 연도별 점수 비교', 'Compare scores by birth year')}</summary><table class="grid-table"><caption>${tr(`${name} · 출생 연도별 비교`, `${name} by birth year`)}</caption><thead><tr><th scope="col">${siteText('출생 연도')}</th><th scope="col">${siteText('간지')}</th><th scope="col">${siteText('점수')}</th></tr></thead><tbody>${cohorts.map(c => `<tr><th scope="row">${c.birthYear}</th><td>${c.pillarText}</td><td>${c.score}</td></tr>`).join('')}</tbody></table></details>`;
  const faq = [
    { q: `${name}${siteText("는 어떤가요?")}`, a: r.summary },
    { q: `${y}${siteText("년 ")}${siteValue(r.animal)}${siteText("띠에게 좋은 달은?")}`, a: r.goodMonths.length ? `${r.goodMonths.map((x) => `${siteValue(x)}${siteText("월")}`).join(', ')}${siteText("은 월지가 ")}${siteValue(r.animal)}${siteText("띠와 합을 이루어 일이 잘 풀립니다.")}${r.cautionMonths.length ? ` ${r.cautionMonths.map((x) => `${siteValue(x)}${siteText("월")}`).join(', ')}${siteText("은 충·형·원진이 들어 조심하는 편이 좋습니다.")}` : ''}` : `${y}${siteText("년에는 특별히 합이 드는 달이 없어 꾸준함이 가장 큰 무기입니다.")}` },
    { q: `${siteValue(r.animal)}${siteText("띠는 ")}${y}${siteText("년에 삼재인가요?")}`, a: r.samjae ? `${siteText("네. ")}${y}${siteText("년은 ")}${siteValue(r.animal)}${siteText("띠의 ")}${siteValue(r.samjae.name)}${siteText("입니다. ")}${TT.samjae[r.samjae.idx]}` : `${siteText("아닙니다. ")}${siteValue(r.animal)}${siteText("띠의 다음 삼재는 ")}${sjYears.filter((x) => x > y).slice(0, 3).join('·')}${siteText("년입니다.")}` },
    { q: `${siteValue(r.animal)}${siteText("띠와 잘 맞는 띠는?")}`, a: `${m.good.map((g) => `${animalName(g.tti)}${siteText("띠(")}${siteValue(g.rel)})`).join(', ')}${siteText("와 잘 맞고, ")}${m.bad.map((g) => `${animalName(g.tti)}${siteText("띠(")}${siteValue(g.rel)})`).join(', ')}${siteText("와는 서로 맞추는 노력이 필요합니다.")}` },
  ];
  const page = {
    path: `/tti/${y}/${ANIMAL_SLUG[t]}/`, h1: name, ogType: 'article', section: '/tti/',
    title: `${name}${siteText(" — 총운·재물·애정·건강과 출생 연도별 운세")}`,
    description: tr(`${name}는 ${r.score}점입니다. ${exampleYears.join('·')}년생의 점수와 풀이, 좋은 달과 조심할 달, 삼재 여부를 확인하세요.`, `${name} scores ${r.score} points. Compare readings for birth years including ${exampleYears.join(', ')} and see favorable months, months for caution and Samjae status.`),
    crumbs: [[siteText('띠별 운세'), '/tti/'], [`${y}${siteText("년")}`, `/tti/${y}/`], [`${siteValue(r.animal)}${siteText("띠")}`, `/tti/${y}/${ANIMAL_SLUG[t]}/`]],
  };
  page.ld = [article(ctx, page), faqLd(faq)];
  page.body = `<article class="article"><div class="zodiac-hero">${animalIcon(t)}${hero(name, r.summary, tr(`종합 ${r.score}점 · ${r.headline}`, `Overall ${r.score} · ${r.headline}`))}</div>
    <section class="cats-static">${r.cats.map((c) => `<article class="cat"><div class="cat-top"><h3>${c.name}</h3>${bandChip(c.score)}<div class="track"><i style="width:${c.score}%"></i></div><span class="num">${c.score}</span></div><p>${esc(c.text)}</p></article>`).join('')}</section>
    ${factTable([[siteText('종합 점수'), `<span class="num">${r.score}</span>${siteText("점 ")}${bandChip(r.score)}`], [siteText('좋은 달'), r.goodMonths.length ? r.goodMonths.map((x) => `${siteValue(x)}${siteText("월")}`).join(', ') : '—'], [siteText('조심할 달'), r.cautionMonths.length ? r.cautionMonths.map((x) => `${siteValue(x)}${siteText("월")}`).join(', ') : '—'], [siteText('행운의 색 · 숫자 · 방향'), `${r.lucky.color} · ${r.lucky.number} · ${r.lucky.dir}`]], `${name}${siteText(" 핵심 정리")}`)}
    <section class="tti-reading-basis"><h3>${tr('점수와 해석의 근거 보기', 'How the score and reading were derived')}</h3><p>${esc(r.basis)}</p>
    ${factTable([[siteText('해와의 관계'), `${branchName(r.pillar.b)}(${BR_H[r.pillar.b]}) ↔ ${branchName(t)}(${BR_H[t]}) · ${r.rel === '없음' ? siteText('특별한 합충 없음') : siteValue(r.rel)}`], [siteText('삼재'), r.samjae ? r.samjae.name : siteText('해당 없음')]])}
    </section>
    <section class="cohort-picker box card"><h2>${siteText("내 출생 연도로 보기")}</h2>${cohortTable}<label for="tti-birth-year">${siteText("출생 연도")}<select class="input" id="tti-birth-year" data-cohort data-tti="${siteValue(t)}" data-year="${y}"><option value="">${siteValue(r.animal)}${siteText("띠 공통 운세")}</option>${cohorts.map((c) => `<option value="${c.birthYear}">${c.birthYear}${siteText("년생 · ")}${c.pillarText}</option>`).join('')}</select></label><p data-cohort-text aria-live="polite">${siteText("출생 연도를 선택하면 해당 연생의 해석과 월별 점수만 보여드립니다.")}</p><p class="hint">${siteText("위 총운·분야별 해석은 띠 공통입니다. 띠는 입춘 기준이므로 1월~2월 초 출생은 앞 띠일 수 있습니다. 개인 원국 전체를 반영한 결과는 사주 운세에서 확인하세요.")}</p></section>
    <section class="box-sec"><h2>${y}${siteText("년 1~12월 운세")}</h2><p class="hint">${siteText("각 달 15일의 월운 65% + 연간 점수 35%에 출생 연도의 천간 관계를 반영합니다. 월별 점수는 이 사이트의 해석 규칙이며 통계적 예측값이 아닙니다.")}</p><div class="monthly-flow" data-monthly-flow>${ttiMonthCards(ttiMonths(t, y))}</div>${cohortData(t, y, r)}</section>
    <p class="cta"><a class="btn" href="${y > ctx.today.y ? '/shop/bundle/' : `/year/${y}/`}">${siteText("내 사주로 ")}${y}${siteText("년 운세 보기")}${y > ctx.today.y ? tr(' · 3종 묶음 990원', ' · bundle KRW 990') : ''}</a></p>
    ${faqBlock(faq)}
    <nav class="chips" aria-label="${siteText("다른 띠")}">${ANIMAL.map((n, i) => `<a class="chip${i === t ? ' on' : ''}" href="/tti/${y}/${ANIMAL_SLUG[i]}/">${animalIcon(i)}${siteValue(n)}${siteText("띠")}</a>`).join('')}</nav>
    <p class="updated">${siteText("최종 업데이트 ")}${ctx.buildDate} · <a href="/about/">${siteText("계산 방법")}</a></p></article>`;
  return page;
}

export function samjae(ctx) {
  const c = TTI_COPY.samjae;
  const year = ctx.today.y;
  const thisY = samjaeYear(year), nextY = samjaeYear(year + 1);
  let title = c.title;
  if (ctx.lang !== 'en') {
    const signNames = (entries) => entries.map(s => `${animalName(s.tti)}띠`).join('·');
    const currentSigns = signNames(thisY), nextSigns = signNames(nextY);
    title = currentSigns === nextSigns
      ? `${year}·${year + 1}년 ${c.title} | ${currentSigns}는 언제 끝날까?`
      : `${year}년 ${c.title} ${currentSigns} | ${year + 1}년 ${nextSigns}`;
  }
  const years = [];
  for (let y = ctx.today.y - 1; y <= ctx.today.y + 10; y++) years.push(y);
  const groups = [[8, 0, 4], [5, 9, 1], [2, 6, 10], [11, 3, 7]];
  const page = {
    path: '/tti/samjae/', title, h1: c.h1, description: `${ctx.today.y}${siteText("년·")}${ctx.today.y + 1}${siteText("년 삼재 띠와 들삼재·눌삼재·날삼재를 한눈에 확인하세요. 띠별 삼재 연도표와 삼재의 뜻, 대처법을 정리했습니다.")}`,
    crumbs: [[siteText('띠별 운세'), '/tti/'], [siteText('삼재'), '/tti/samjae/']], section: '/tti/', ogType: 'article',
  };
  page.ld = [article(ctx, page), faqLd(c.faq)];
  page.body = `<article class="article">${hero(c.h1, c.lead)}
    ${factTable([[`${ctx.today.y}${siteText("년 삼재")}`, thisY.map((s) => `${animalName(s.tti)}${siteText("띠 ")}${siteValue(s.name)}`).join(', ')], [`${ctx.today.y + 1}${siteText("년 삼재")}`, nextY.map((s) => `${animalName(s.tti)}${siteText("띠 ")}${siteValue(s.name)}`).join(', ')]], siteText('올해와 내년 삼재'))}
    <section class="prose"><h2>${siteText("띠 그룹별 삼재 연도")}</h2><div class="table-wrap" tabindex="0" role="region" aria-label="${tr('띠 그룹별 삼재 연도', 'Samjae years by zodiac group')}"><table class="grid-table"><thead><tr><th scope="col">${siteText("띠")}</th><th scope="col">${siteText("삼재가 드는 해의 지지")}</th><th scope="col">${years[0]}~${years[years.length - 1]}${siteText("년 중 삼재 해")}</th></tr></thead><tbody>
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
    <p class="cta"><a class="btn" href="/compatibility/">${tr("두 사람의 전체 사주로 비교하기", "Compare both full charts")}</a></p>${sections}${faqBlock(c.faq)}<p class="updated">${siteText("최종 업데이트 ")}${ctx.buildDate}</p></article>`;
  return page;
}

function ttiDayList(o, period) {
  const detailPath = t => `/tti/${period}/${ANIMAL_SLUG[t]}/`;
  const rows = [...Array(12).keys()].map((t) => ttiDay(t, o));
  const signAttributes = t => period === 'tomorrow'
    ? 'data-ga-cta="zodiac_week_detail"'
    : `data-dialog="tti-day-${t}" aria-haspopup="dialog" aria-controls="tti-day-${t}"`;
  const items = rows.map((r) => `<li class="tti-row"><a href="${detailPath(r.tti)}" class="tti-name" ${signAttributes(r.tti)}>${animalIcon(r.tti)}${siteValue(r.animal)}${siteText("띠")}</a><span class="num tti-score">${r.score}</span>${bandChip(r.score)}<p><strong class="tti-reading-headline">${esc(r.headline)}</strong><br>${esc(r.outlook)}</p></li>`).join('');
  const list = `<ol class="tti-list">${items}</ol>`;
  if (period === 'tomorrow') return list;
  return `${list}${rows.map((r) => `<dialog class="character-dialog tti-dialog" data-zodiac-period="${period}" id="tti-day-${r.tti}" aria-labelledby="tti-detail-title-${ANIMAL_SLUG[r.tti]}"><div class="dialog-bar"><span>${siteValue(r.animal)}${siteText("띠 일별 운세")}</span><button class="sbtn" type="button" data-close-dialog autofocus>${siteText("닫기 ×")}</button></div><div class="box"><a class="btn ghost" data-ga-cta="zodiac_week_detail" href="${detailPath(r.tti)}">${tr(`${r.animal}띠 분야별 상세 풀이와 7일 흐름`, `${siteValue(r.animal)} seven-day outlook and full reading`)}</a>${ttiDailyDetail(r.tti, o, period, { preview: true })}</div></dialog>`).join('')}`;
}

export function dailyList(ctx, period) {
  const tomorrow = period === 'tomorrow';
  const date = tomorrow ? addDays(ctx.today, 1) : ctx.today;
  const day = tomorrow ? siteText('내일') : siteText('오늘');
  const heading = tomorrow ? tr('띠별 내일의 운세', 'Tomorrow’s Zodiac Fortune') : TTI_COPY.today.h1;
  const lead = tomorrow
    ? tr('내 띠를 누르면 내일의 금전운·직장운·연애운 등 일곱 분야와 앞으로 7일의 흐름을 볼 수 있어요.', 'Choose your sign for seven readings, including money, work and love, and the outlook for the next seven days.')
    : TTI_COPY.today.lead;
  const path = `/tti/${period}/`;
  return {
    path,
    title: tomorrow ? tr(`[무료] 띠별 내일의 운세 (${date.m}월 ${date.d}일) — 12띠 내일 운세`, `${heading} (${date.m}/${date.d}) — All 12 Signs`)
      : `${siteText("[무료] 띠별 오늘의 운세 (")}${date.m}${siteText("월 ")}${date.d}${siteText("일) — 12띠 오늘 운세")}`,
    h1: heading, section: '/tti/', daily: true,
    description: tomorrow ? tr(`${fmtDate(date)} 띠별 내일의 운세. 열두 띠의 내일 점수와 풀이, 행운의 색과 숫자를 확인하세요.`, `${fmtDate(date)} zodiac readings for tomorrow. See each sign’s score, interpretation, lucky color and number.`)
      : `${fmtDate(date)}${siteText(" 띠별 오늘의 운세. 쥐띠·소띠·호랑이띠·토끼띠·용띠·뱀띠·말띠·양띠·원숭이띠·닭띠·개띠·돼지띠의 오늘 점수와 해설, 행운의 색과 숫자를 확인하세요.")}`,
    crumbs: [[siteText('띠별 운세'), '/tti/'], [heading, path]],
    body: `${hero(`${heading} · ${date.m}${siteText("월 ")}${date.d}${siteText("일")}`, lead)}${dayBox(date, day)}${ttiDayList(date, period)}<p class="cta"><a class="btn" href="/${period}/">${tomorrow ? tr('내 사주로 내일의 운세 보기', 'Read my personal fortune for tomorrow') : siteText("내 사주로 오늘의 운세 보기")}</a></p>`,
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
  const week = [...Array(7).keys()].map((i) => { const d = addDays(date, i); return { d, score: ttiDay(t, d).score }; });
  const high = Math.max(...week.map(w => w.score));
  const best = week.filter(w => w.score === high).map(w => fmtShort(w.d) + ' (' + weekdayName(dow(w.d)) + ')').join(tr(' · ', ', '));
  const m = ttiMatches(t);
  const y = ctx.today.y;
  const births = ttiYear(t, y).cohorts.filter((c) => c.age >= 6 && c.age <= 90).map((c) => c.birthYear);
  const first = r.text.split(/(?<=[.!?])\s+/)[0];
  return {
    path: `/tti/${period}/${slug}/`, section: '/tti/',
    title: tr(`${animal}띠 ${word}의 운세 — ${date.m}월 ${date.d}일 ${r.score}점`, `${dailyTitle} — ${date.m}/${date.d} · ${r.score} points`),
    description: `${fmtDate(date)} ${animal}${siteText("띠 ")}${word}${siteText("의 운세 ")}${r.score}${siteText("점. ")}${first}${siteText(" 12띠 중 ")}${rank}${siteText("위이며, 앞으로 7일 흐름과 행운의 색·숫자, 잘 맞는 띠를 함께 확인하세요.")}`,
    crumbs: [[siteText('띠별 운세'), '/tti/'], [tomorrow ? tr('띠별 내일의 운세', 'Tomorrow’s Zodiac Fortune') : TTI_COPY.today.h1, `/tti/${period}/`], [`${animal}${siteText("띠 ")}${word}${siteText(" 운세")}`, `/tti/${period}/${slug}/`]],
    body: `${hero(dailyTitle, tr(`${fmtDate(date)} · ${r.score}점 · 12띠 중 ${rank}위`, `${fmtDate(date)} · ${r.score} points · Ranked ${rank} of 12`))}
      <article class="box card">${ttiDailyDetail(t, date, period)}</article>
      <p class="cta"><a class="btn ghost" data-ga-cta="zodiac_other_day" href="/tti/${tomorrow ? 'today' : 'tomorrow'}/${slug}/">${tomorrow
        ? tr(`${animal}띠의 오늘 풀이 보기`, `Read today’s ${animal} outlook`)
        : tr(`${animal}띠의 내일 풀이 보기`, `Read tomorrow’s ${animal} outlook`)}</a></p>
      <section class="box card tti-week"><h2>${animal}${siteText("띠의 앞으로 7일")}</h2>
        <ol class="tti-week-list">${week.map((w, i) => `<li${i === 0 ? ' class="is-today"' : ''}><span>${weekdayName(dow(w.d))} ${fmtShort(w.d)}</span><i style="--s:${w.score}" aria-hidden="true"></i><b class="num">${w.score}</b>${bandChip(w.score)}</li>`).join('')}</ol>
        <p class="hint">${tr(`이번 7일의 최고점은 ${high}점입니다. 해당 날짜는 ${best}입니다.`, `The highest score in these seven days is ${high}. Dates at that score: ${best}.`)}</p>
      </section>
      ${zodiacPersonalLinks(r, date, period)}
      ${factTable([
        [siteText('출생 연도'), `${births.map((b) => `${b}`).join(' · ')}${siteText("년생 ")}<small>${siteText("(1월~2월 초 출생은 입춘 전이라 앞 띠일 수 있습니다)")}</small>`],
        [siteText('잘 맞는 띠'), m.good.map((g) => `${animalName(g.tti)}${siteText("띠(")}${siteValue(g.rel)})`).join(', ')],
        [siteText('조심할 띠'), m.bad.map((g) => `${animalName(g.tti)}${siteText("띠(")}${siteValue(g.rel)})`).join(', ')],
        [`${y}${siteText("년 · ")}${y + 1}${siteText("년 운세")}`, `<a href="/tti/${y}/${slug}/">${y}${siteText("년 ")}${animal}${siteText("띠 운세")}</a> · <a href="/tti/${y + 1}/${slug}/">${y + 1}${siteText("년 ")}${animal}${siteText("띠 운세")}</a>`],
      ], `${animal}${siteText("띠 한눈에 보기")}`)}
      <nav class="chips" aria-label="${siteText("다른 띠 ")}${word}${siteText(" 운세")}">${ANIMAL.map((n, i) => `<a class="chip${i === t ? ' on' : ''}" href="/tti/${period}/${ANIMAL_SLUG[i]}/">${animalIcon(i)}${siteValue(n)}${siteText("띠")}</a>`).join('')}</nav>
      <a class="btn ghost" href="/tti/${period}/">${tomorrow ? tr('내일의 12띠 운세로 돌아가기', 'Back to tomorrow’s twelve signs') : siteText("12띠 오늘의 운세로 돌아가기")}</a>`,
  };
}
