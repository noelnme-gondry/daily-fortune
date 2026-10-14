// 계산기(도구) 페이지와 홈. 폼과 설명·FAQ는 서버에서 그리고, 결과는 브라우저에서 계산한다.
import { HOME, TOOLS, SITE, yearTool } from '../../content/pages.js';
import {
  ANIMAL, ANIMAL_SLUG, EL_K, EL_H, STEM_EL, BR_EL, addDays, dow, fmtDate, fmtShort, pillarLabel, pillarH,
  dayPillar, monthPillar, yearPillar, yearPillarOfDate, lunarText, solarTerms, ttiDay, ttiYear, samjaeYear, toUTC,
} from '../../engine/index.js';
import { esc, faqBlock, faqLd } from '../util.js';

const BAND = (s) => (s >= 75 ? ['high', '대길'] : s >= 60 ? ['good', '길'] : s >= 45 ? ['mid', '평'] : ['low', '주의']);
export const bandChip = (s) => { const [k, n] = BAND(s); return `<span class="band band-${k}">${n}</span>`; };

/* ── 입력 폼 ───────────────────────────── */
function personFields(p, ctx, legend) {
  const ys = [];
  for (let y = ctx.today.y; y >= 1930; y--) ys.push(`<option value="${y}"${y === 1990 ? ' selected' : ''}>${y}년</option>`);
  const ms = [...Array(12).keys()].map((i) => `<option value="${i + 1}">${i + 1}월</option>`).join('');
  const ds = [...Array(31).keys()].map((i) => `<option value="${i + 1}">${i + 1}일</option>`).join('');
  return `<fieldset class="person" data-person="${p}">
    ${legend ? `<legend class="person-legend">${esc(legend)}</legend>` : ''}
    <div class="field"><label for="${p}-name">이름 (선택)</label><input class="input" id="${p}-name" maxlength="12" autocomplete="off" placeholder="결과에 표시할 이름"></div>
    <fieldset class="field"><legend>성별</legend>
      <div class="seg"><label><input type="radio" name="${p}-gender" value="F"><span>여성</span></label><label><input type="radio" name="${p}-gender" value="M" checked><span>남성</span></label></div>
    </fieldset>
    <fieldset class="field"><legend>생년월일</legend>
      <div class="seg"><label><input type="radio" name="${p}-cal" value="solar" checked><span>양력</span></label><label><input type="radio" name="${p}-cal" value="lunar"><span>음력</span></label></div>
      <div class="ymd"><select class="input" id="${p}-y" aria-label="태어난 해">${ys.join('')}</select><select class="input" id="${p}-m" aria-label="태어난 달">${ms}</select><select class="input" id="${p}-d" aria-label="태어난 날">${ds}</select></div>
      <label class="check"><input type="checkbox" id="${p}-leap" disabled> 음력 윤달</label>
    </fieldset>
    <fieldset class="field"><legend>태어난 시각</legend>
      <input class="input" type="time" id="${p}-time" value="12:00" aria-label="태어난 시각">
      <label class="check"><input type="checkbox" id="${p}-notime"> 시간을 몰라요</label>
    </fieldset>
  </fieldset>`;
}
const HINT = '<p class="hint">한국 표준시로 입력하면 동경 127.5° 기준 30분 보정과 서머타임(1948–60, 1987–88)이 자동 반영됩니다. 입력한 정보는 서버로 전송되지 않고 이 기기에만 저장됩니다.</p>';

export function toolBlock(mode, ctx, extra = {}) {
  const pair = mode === 'compatibility';
  const data = `data-tool="${mode}" data-date="${ctx.todayISO}"${extra.year ? ` data-year="${extra.year}"` : ''}`;
  const label = { today: '오늘의 운세 보기', tomorrow: '내일의 운세 보기', week: '이번 주 운세 보기', month: '이달의 운세 보기', year: `${extra.year}년 운세 보기`, lifetime: '평생 운세 보기', compatibility: '궁합 보기', manseryeok: '사주 원국 계산', home: '내 운세 보기' }[mode];
  const form = pair
    ? `<form class="pform card pair-form" id="tool-form" novalidate><h2 class="form-title">두 사람의 사주 입력</h2><div class="pair-grid">${personFields('a', ctx, '나')}${personFields('b', ctx, '상대')}</div><div class="form-actions"><button class="btn" type="submit">${label}</button><button class="link-btn" type="button" data-sample>예시 두 사람으로 보기</button></div>${HINT}</form>`
    : `<form class="pform card" id="tool-form" novalidate><h2 class="form-title">내 사주 입력</h2>${personFields('a', ctx)}<div class="form-actions"><button class="btn" type="submit">${label}</button><button class="link-btn" type="button" data-sample>예시 인물로 보기</button></div>${HINT}</form>`;
  const empty = mode === 'home' ? '' : `<div class="result" id="result" aria-live="polite"><div class="result-empty card"><p><b>생년월일시를 입력하면 결과가 여기에 나타납니다.</b></p><p class="muted">한 번 입력하면 이 기기에 저장되어 오늘·내일·올해·평생 운세를 다시 입력하지 않고 볼 수 있습니다.</p><noscript><p>운세 계산은 브라우저에서 이루어지므로 자바스크립트를 켜 주세요.</p></noscript></div></div>`;
  return `<section class="tool ${pair ? 'tool-pair' : ''} ${mode === 'home' ? 'tool-home' : ''}" id="tool" ${data} aria-label="운세 계산기">${form}${empty}</section>`;
}

/* ── 날짜 정보 상자 ───────────────────────────── */
function nextTerm(o) {
  const terms = [...solarTerms(o.y), ...solarTerms(o.y + 1)];
  return terms.find((t) => toUTC(t.date) >= toUTC(o));
}
export function dayBox(o, label) {
  const dp = dayPillar(o), mp = monthPillar(o), yp = yearPillarOfDate(o);
  const nt = nextTerm(o);
  return `<section class="daybox card" aria-label="${esc(label)} 일진">
    <div class="daybox-main"><span class="daybox-k">${esc(label)}</span><b class="daybox-d">${fmtDate(o)}</b><span class="muted">${lunarText(o)}</span></div>
    <dl class="daybox-grid">
      <div><dt>일진</dt><dd><span class="hz el-${STEM_EL[dp.s]}">${pillarH(dp)}</span> ${pillarLabel(dp).slice(0, 2)}일</dd></div>
      <div><dt>월건</dt><dd><span class="hz">${pillarH(mp)}</span> ${pillarLabel(mp).slice(0, 2)}월</dd></div>
      <div><dt>세차</dt><dd><span class="hz">${pillarH(yp)}</span> ${pillarLabel(yp).slice(0, 2)}년</dd></div>
      ${nt ? `<div><dt>다음 절기</dt><dd>${nt.name} ${nt.date.m}/${nt.date.d} ${nt.time}</dd></div>` : ''}
    </dl>
  </section>`;
}
// 띠별 오늘의 운세 (서버에서 날짜별로 계산)
export function ttiDayList(o, opts = {}) {
  const rows = [...Array(12).keys()].map((t) => ttiDay(t, o));
  const items = rows.map((r) => `<li class="tti-row"><a href="/tti/${ctxYear(o)}/${ANIMAL_SLUG[r.tti]}/" class="tti-name"><span class="hz">${'子丑寅卯辰巳午未申酉戌亥'[r.tti]}</span>${r.animal}띠</a><span class="num tti-score">${r.score}</span>${bandChip(r.score)}${opts.short ? '' : `<p>${esc(r.text)} <span class="muted">행운의 색 ${r.color} · 숫자 ${r.number}</span></p>`}</li>`).join('');
  return `<ol class="tti-list${opts.short ? ' short' : ''}">${items}</ol>`;
}
const ctxYear = (o) => o.y;

function weekBox(o) {
  const start = addDays(o, -((dow(o) + 6) % 7));
  const cells = [...Array(7).keys()].map((i) => { const d = addDays(start, i); const p = dayPillar(d); return `<li${toUTC(d) === toUTC(o) ? ' class="is-today"' : ''}><span>${'일월화수목금토'[dow(d)]} ${fmtShort(d)}</span><b class="hz">${pillarH(p)}</b></li>`; }).join('');
  return `<section class="daybox card" aria-label="이번 주 일진"><div class="daybox-main"><span class="daybox-k">이번 주</span><b class="daybox-d">${fmtShort(start)} ~ ${fmtShort(addDays(start, 6))}</b></div><ol class="weekline">${cells}</ol></section>`;
}
function monthBox(o) {
  const mp = monthPillar({ y: o.y, m: o.m, d: 15 });
  const terms = solarTerms(o.y).filter((t) => t.date.m === o.m);
  return `<section class="daybox card" aria-label="이번 달 월건"><div class="daybox-main"><span class="daybox-k">이번 달</span><b class="daybox-d">${o.y}년 ${o.m}월</b></div>
    <dl class="daybox-grid"><div><dt>월건</dt><dd><span class="hz el-${STEM_EL[mp.s]}">${pillarH(mp)}</span> ${pillarLabel(mp).slice(0, 2)}월</dd></div>${terms.map((t) => `<div><dt>${t.name}</dt><dd>${t.date.m}/${t.date.d} ${t.time}</dd></div>`).join('')}<div><dt>만세력</dt><dd><a href="/manseryeok/${o.y}/${o.m}/">${o.m}월 날짜별 일진 보기</a></dd></div></dl></section>`;
}

/* ── 공통 조각 ───────────────────────────── */
function hero(h1, lead, eyebrow) {
  return `<header class="page-hero">${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}<h1>${esc(h1)}</h1><p class="lead">${esc(lead)}</p></header>`;
}
const HOW = {
  today: ['오늘의 일진 천간·지지가 일간에게 어떤 십신인지 계산합니다.', '일진 지지가 원국의 년지·월지·일지·시지와 합·충·형·원진을 이루는지 봅니다.', '일진 오행이 용신·희신인지 기신인지에 따라 전체 흐름을 가감합니다.', '일진 70% · 월운 20% · 세운 10%를 합쳐 0~100점으로 환산합니다.'],
  tomorrow: ['내일 날짜의 일진으로 오늘의 운세와 같은 규칙을 적용합니다.', '십신·합충형·12운성·신살·용신 여부를 분야별 가중치로 더합니다.', '일진 70% · 월운 20% · 세운 10% 비중으로 점수를 냅니다.'],
  week: ['월요일부터 일요일까지 날마다 일진 점수를 계산합니다.', '일곱 날의 요인을 평균해 주간 분야별 점수를 냅니다.', '분야마다 점수가 가장 높은 요일을 골라 보여 줍니다.'],
  month: ['그 달 15일의 절기 월주를 대표 월운으로 씁니다.', '월운 60% · 그달 모든 일진 평균 25% · 세운 15%로 합칩니다.', '날짜별 종합 점수로 좋은 날 4개와 조심할 날 3개를 고릅니다.'],
  year: ['그 해의 년주(세운)를 원국에 대입합니다.', '그 해에 지나고 있는 10년 대운을 32% 비중으로 더합니다.', '각 달 15일의 절기 월주 65% · 년주 35%로 월별 점수를 냅니다.'],
  lifetime: ['일간의 성질과 오행 분포로 타고난 기질을 읽습니다.', '월지·일지 가중치와 지장간으로 신강·신약과 용신을 정합니다.', '대운 9개를 각각 점수화해 인생의 리듬을 그래프로 보여 줍니다.', '앞으로 15년의 세운에서 결혼·자녀·재물·이사 신호를 찾습니다.'],
  compatibility: ['일간끼리의 천간합·상생·상극을 봅니다.', '배우자궁인 일지, 띠(년지), 월지의 합·충·원진을 비교합니다.', '서로에게 필요한 용신 오행을 상대 사주가 얼마나 채워 주는지 계산합니다.', '앞으로 10년 세운에서 두 사람의 결혼·자녀·재물 신호를 합쳐 시기를 고릅니다.'],
  manseryeok: ['년주: 입춘 절입 시각 기준', '월주: 매달 절입 시각 기준', '일주: 60일 주기 일진', '시주: 동경 127.5° 평균태양시(표준시 −30분), 밤 11시 30분부터 다음 날 자시'],
};
function howBlock(mode) {
  return `<section class="prose how"><h2>이렇게 계산합니다</h2><ol>${HOW[mode].map((t) => `<li>${esc(t)}</li>`).join('')}</ol><p><a href="/about/">계산 규칙 전체 보기</a></p></section>`;
}
function related(items) {
  return `<section class="related"><h2>함께 보면 좋은 운세</h2><div class="cards">${items.map(([href, t, d]) => `<a class="card link-card" href="${href}"><b>${esc(t)}</b><span>${esc(d)}</span></a>`).join('')}</div></section>`;
}
function relatedFor(path, ctx) {
  const y = ctx.today.y;
  const all = [
    ['/today/', '오늘의 운세', '오늘 일진과 내 사주의 만남'],
    ['/tomorrow/', '내일의 운세', '내일 일정을 미리 준비'],
    ['/week/', '이번 주 운세', '요일별 점수와 최고의 요일'],
    ['/month/', '이달의 운세', '날짜별 길일 달력'],
    [`/year/${y}/`, `${y}년 운세`, '총운과 1~12월 월별 운세'],
    [`/year/${y + 1}/`, `${y + 1}년 운세`, '내년 총운과 월별 운세'],
    ['/lifetime/', '평생 운세', '기질·대운·결혼 시기'],
    ['/compatibility/', '사주 궁합', '평생 궁합과 결혼 길일'],
    ['/tti/today/', '띠별 오늘의 운세', '12띠 오늘 점수'],
  ];
  return related(all.filter(([h]) => h !== path).slice(0, 6));
}
function webApp(tool, ctx) {
  return { '@type': 'WebApplication', name: `${SITE.name} ${tool.h1}`, url: `${ctx.site}${tool.path}`, description: tool.desc, applicationCategory: 'LifestyleApplication', operatingSystem: 'Web', inLanguage: 'ko-KR', offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' }, publisher: { '@id': `${ctx.site}/#org` } };
}
function toolPage(key, ctx, opts = {}) {
  const t = opts.tool || TOOLS[key];
  const mode = opts.mode || key;
  const top = opts.top || '';
  const extraAfter = opts.after || '';
  return {
    path: t.path, title: t.title, description: t.desc, crumbs: opts.crumbs || [[t.nav, t.path]], section: t.path,
    tool: true, ld: [webApp(t, ctx), faqLd(t.faq)],
    body: `${hero(t.h1, t.lead)}${top}${toolBlock(mode, ctx, opts)}${howBlock(mode === 'year' ? 'year' : mode)}${extraAfter}${faqBlock(t.faq)}${relatedFor(t.path, ctx)}`,
  };
}

/* ── 페이지 ───────────────────────────── */
export function today(ctx) {
  const o = ctx.today;
  return toolPage('today', ctx, {
    top: dayBox(o, '오늘'),
    after: `<section class="box-sec"><div class="sec-head"><h2>${o.m}월 ${o.d}일 띠별 오늘의 운세</h2><a href="/tti/today/">전체 보기</a></div>${ttiDayList(o, { short: true })}</section>`,
  });
}
export function tomorrow(ctx) {
  const o = addDays(ctx.today, 1);
  return toolPage('tomorrow', ctx, {
    top: dayBox(o, '내일'),
    after: `<section class="box-sec"><div class="sec-head"><h2>${o.m}월 ${o.d}일 띠별 운세 미리 보기</h2></div>${ttiDayList(o, { short: true })}</section>`,
  });
}
export const week = (ctx) => toolPage('week', ctx, { top: weekBox(ctx.today) });
export const month = (ctx) => toolPage('month', ctx, { top: monthBox(ctx.today) });
export const lifetime = (ctx) => toolPage('lifetime', ctx);
export const compatibility = (ctx) => toolPage('compatibility', ctx, {
  after: `<section class="prose"><h2>띠 궁합만 빠르게 보고 싶다면</h2><p>태어난 해의 띠만으로 보는 궁합은 <a href="/tti/compatibility/">띠 궁합표</a>에서 12띠 모든 조합을 확인할 수 있습니다. 다만 띠는 여덟 글자 중 한 글자일 뿐이라, 정확한 궁합은 위의 사주 궁합으로 보세요.</p></section>`,
});
export const manseryeok = (ctx) => toolPage('manseryeok', ctx, {
  after: `<section class="box-sec"><div class="sec-head"><h2>연도별 만세력 표</h2></div><div class="cards">${[ctx.today.y, ctx.today.y + 1].map((y) => `<a class="card link-card" href="/manseryeok/${y}/"><b>${y}년 만세력</b><span>${pillarLabel(yearPillar(y))}년 · 월별 일진과 24절기</span></a>`).join('')}</div></section>`,
});

export function yearPage(y, ctx) {
  const rel = y === ctx.today.y ? '올해' : y === ctx.today.y + 1 ? '내년' : '';
  const t = yearTool(y, rel);
  const yp = yearPillar(y);
  const sj = samjaeYear(y);
  const top = `<section class="daybox card" aria-label="${y}년 세운"><div class="daybox-main"><span class="daybox-k">${y}년${rel ? ` · ${rel}` : ''}</span><b class="daybox-d">${pillarLabel(yp)}년</b><span class="muted">${STEM_EL[yp.s] === BR_EL[yp.b] ? `천간과 지지가 모두 ${EL_K[STEM_EL[yp.s]]}(${EL_H[STEM_EL[yp.s]]})` : `천간 ${EL_K[STEM_EL[yp.s]]}(${EL_H[STEM_EL[yp.s]]}) · 지지 ${EL_K[BR_EL[yp.b]]}(${EL_H[BR_EL[yp.b]]})`}의 해, ${ANIMAL[yp.b]}띠 해</span></div>
    <dl class="daybox-grid"><div><dt>삼재</dt><dd>${sj.map((s) => `${ANIMAL[s.tti]}띠 ${s.name}`).join(', ')}</dd></div><div><dt>띠별 운세</dt><dd><a href="/tti/${y}/">${y}년 12띠 운세</a></dd></div><div><dt>만세력</dt><dd><a href="/manseryeok/${y}/">${y}년 만세력</a></dd></div></dl></section>`;
  return toolPage('year', ctx, { tool: t, mode: 'year', year: y, top, crumbs: [['신년운세', '/year/'], [`${y}년 운세`, t.path]] });
}
export function yearHub(ctx) {
  const ys = [ctx.today.y, ctx.today.y + 1];
  return {
    path: '/year/', title: '신년운세 — 연도별 사주 운세', description: `${ys.join('년·')}년 신년운세를 내 사주로 확인하세요. 세운과 대운으로 계산한 연간 총운과 월별 운세를 제공합니다.`,
    crumbs: [['신년운세', '/year/']], section: '/year/',
    body: `${hero('신년운세', '신년운세는 그 해의 간지(세운)가 내 사주 원국과 맺는 관계로 한 해의 흐름을 봅니다. 연도를 골라 총운과 1~12월 월별 운세를 확인하세요.')}<div class="cards">${ys.map((y) => `<a class="card link-card" href="/year/${y}/"><b>${y}년 운세</b><span>${pillarLabel(yearPillar(y))}년 · ${ANIMAL[yearPillar(y).b]}띠 해</span></a>`).join('')}</div>`,
  };
}

export function home(ctx) {
  const o = ctx.today;
  const y = o.y;
  const cards = [
    ['/today/', '오늘의 운세', '일진이 내 사주와 만나는 오늘의 7개 분야 점수'],
    ['/tomorrow/', '내일의 운세', '내일의 일진으로 미리 보는 하루'],
    ['/week/', '이번 주 운세', '요일별 점수와 분야별 최고의 요일'],
    ['/month/', '이달의 운세', '월운과 날짜별 길일 달력'],
    [`/year/${y}/`, `${y}년 운세`, '올해 총운과 1~12월 월별 운세'],
    [`/year/${y + 1}/`, `${y + 1}년 운세`, '내년 총운과 월별 운세'],
    ['/lifetime/', '평생 운세', '타고난 기질, 대운 흐름, 결혼·재물 시기'],
    ['/compatibility/', '사주 궁합', '평생 궁합, 조심할 점, 결혼 길일'],
    ['/manseryeok/', '만세력', '사주팔자 원국과 대운 바로 계산'],
  ];
  const ty = [...Array(12).keys()].map((t) => ttiYear(t, y));
  const sj = samjaeYear(y);
  const body = `
    <section class="home-hero">
      <div class="home-intro"><p class="eyebrow">${esc(SITE.tagline)}</p><h1>${esc(HOME.h1)}</h1><p class="lead">${esc(HOME.lead)}</p></div>
      ${toolBlock('home', ctx)}
    </section>
    ${dayBox(o, '오늘')}
    <section class="box-sec"><div class="sec-head"><h2>운세 종류</h2></div><div class="cards three">${cards.map(([h, t, d]) => `<a class="card link-card" href="${h}"><b>${t}</b><span>${d}</span></a>`).join('')}</div></section>
    <section class="box-sec"><div class="sec-head"><h2>띠별 오늘의 운세 · ${o.m}월 ${o.d}일</h2><a href="/tti/today/">해설 보기</a></div>${ttiDayList(o, { short: true })}</section>
    <section class="box-sec"><div class="sec-head"><h2>${y}년 ${pillarLabel(yearPillar(y))}년 띠별 운세</h2><a href="/tti/${y}/">12띠 전체</a></div>
      <p class="muted">${y}년 삼재: ${sj.map((s) => `${ANIMAL[s.tti]}띠(${s.name})`).join(', ')}</p>
      <div class="cards four">${ty.map((r) => `<a class="card link-card tti-card" href="/tti/${y}/${ANIMAL_SLUG[r.tti]}/"><b>${r.animal}띠 <span class="num">${r.score}</span></b><span>${esc(r.headline)}</span></a>`).join('')}</div></section>
    <section class="box-sec"><div class="sec-head"><h2>사주 백과</h2><a href="/saju/">전체 보기</a></div><div class="cards three">
      <a class="card link-card" href="/saju/ilju/"><b>60일주 총정리</b><span>갑자일주부터 계해일주까지 성격·연애·직업</span></a>
      <a class="card link-card" href="/saju/sipsin/"><b>십신 뜻</b><span>비견·식신·정재·정관·정인 등 10가지</span></a>
      <a class="card link-card" href="/saju/ohaeng/"><b>오행 상생상극</b><span>목화토금수의 성격과 보완법</span></a>
      <a class="card link-card" href="/saju/sinsal/"><b>신살</b><span>도화살·역마살·화개살·천을귀인</span></a>
      <a class="card link-card" href="/saju/ilgan/"><b>일간별 성격</b><span>갑목부터 계수까지 10가지 일간</span></a>
      <a class="card link-card" href="/saju/guide/"><b>사주 보는 법</b><span>원국 세우기부터 대운까지 7단계</span></a>
    </div></section>
    ${faqBlock(HOME.faq)}`;
  return {
    path: '/', title: HOME.title, description: SITE.description, section: '/', tool: true, crumbs: [],
    ld: [faqLd(HOME.faq), { '@type': 'ItemList', name: '오행 운세 운세 종류', itemListElement: cards.map(([h, t], i) => ({ '@type': 'ListItem', position: i + 1, name: t, url: `${ctx.site}${h}` })) }],
    body,
  };
}
export { hero, related };
