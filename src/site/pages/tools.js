// 계산기(도구) 페이지와 홈. 폼과 설명·FAQ는 서버에서 그리고, 결과는 브라우저에서 계산한다.
import { HOME, TOOLS, SITE, FREE_ACCESS, FREE_FAQ, yearTool } from '../../content/pages.js';
import {
  ANIMAL, ANIMAL_SLUG, EL_K, EL_H, STEM_EL, BR_EL, addDays, dow, fmtDate, fmtShort, pillarLabel, pillarH,
  dayPillar, monthPillar, yearPillar, yearPillarOfDate, lunarText, solarTerms, ttiDay, ttiYear, samjaeYear, toUTC,
} from '../../engine/index.js';
import { esc, faqBlock, faqLd, tip, disclosure } from '../util.js';
import { animalIcon, uiIcon } from '../icons.js';
import { ttiDailyDetail } from '../tti-detail.js';
import { TIPS } from '../../content/tips.js';
import { adSlot } from '../layout.js';
import { birthTimeOptions } from '../../domain/birth-time.js';

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
    <div class="field field-name"><label for="${p}-name">이름 (선택)</label><input class="input" id="${p}-name" maxlength="12" autocomplete="off" placeholder="결과에 표시할 이름"></div>
    <fieldset class="field field-gender"><legend>성별</legend>
      <div class="seg"><label><input type="radio" name="${p}-gender" value="F"><span>여성</span></label><label><input type="radio" name="${p}-gender" value="M" checked><span>남성</span></label></div>
    </fieldset>
    <fieldset class="field field-birth"><legend>생년월일</legend>
      <div class="seg"><label><input type="radio" name="${p}-cal" value="solar" checked><span>양력</span></label><label><input type="radio" name="${p}-cal" value="lunar"><span>음력</span></label></div>
      <div class="ymd"><select class="input" id="${p}-y" aria-label="태어난 해">${ys.join('')}</select><select class="input" id="${p}-m" aria-label="태어난 달">${ms}</select><select class="input" id="${p}-d" aria-label="태어난 날">${ds}</select></div>
      <label class="check"><input type="checkbox" id="${p}-leap" disabled> 음력 윤달</label>
    </fieldset>
    <fieldset class="field field-time"><legend>태어난 시각</legend>
      <div class="seg seg-time"><label><input type="radio" name="${p}-tmode" value="exact" checked><span>시각 입력</span></label><label><input type="radio" name="${p}-tmode" value="branch"><span>시진만 알아요</span></label></div>
      <input class="input" type="time" id="${p}-time" value="12:00" aria-label="태어난 시각" aria-describedby="${p}-time-hint">
      <select class="input" id="${p}-branch" aria-label="태어난 시진" aria-describedby="${p}-time-hint" hidden>${birthTimeOptions().map((t) => `<option value="${t.value}"${t.value === '6' ? ' selected' : ''}>${t.label}</option>`).join('')}</select>
      <label class="check"><input type="checkbox" id="${p}-notime"> 시간을 몰라요</label>
      <p class="hint" id="${p}-time-hint" data-time-hint>출생 당시 시계 시각 그대로 넣으세요. 30분 보정과 서머타임은 자동으로 계산합니다.</p>
    </fieldset>
  </fieldset>`;
}
const HINT = '<div class="storage-options"><label class="check"><input type="checkbox" id="save-device"> 이 기기에 저장</label><button class="link-btn" type="button" data-delete-profile>저장된 정보 삭제</button><p class="hint" data-storage-status role="status">저장을 선택하면 다음 방문에도 불러옵니다. 미선택 시 현재 탭에서만 임시로 유지됩니다.</p></div><p class="hint">입력한 생년월일은 서버로 전송되지 않습니다.</p>';

export function toolBlock(mode, ctx, extra = {}) {
  const pair = mode === 'compatibility';
  const data = `data-tool="${mode}" data-date="${ctx.todayISO}"${extra.year ? ` data-year="${extra.year}"` : ''}`;
  const label = { today: '오늘의 운세 보기', tomorrow: '내일의 운세 보기', week: '이번 주 운세 보기', month: '이달의 운세 보기', year: `${extra.year}년 운세 보기`, lifetime: '평생 운세 보기', compatibility: '궁합 보기', manseryeok: '사주 원국 계산', story: '내 인생 캐릭터 보기', rank: '내 사주 순위 보기', home: '내 운세 보기' }[mode];
  const form = pair
    ? `<form class="pform card pair-form" id="tool-form" novalidate><h2 class="form-title">두 사람의 사주 입력</h2><div class="pair-grid">${personFields('a', ctx, '나')}${personFields('b', ctx, '상대')}</div><div class="form-actions"><button class="btn" type="submit">${label}</button></div>${HINT}</form>`
    : `<form class="pform card" id="tool-form" novalidate><h2 class="form-title">내 사주 입력</h2>${personFields('a', ctx)}<div class="form-actions"><button class="btn" type="submit">${label}</button></div>${HINT}</form>`;
  const empty = `<div class="result" id="result" aria-live="polite">${mode === 'home' ? '' : '<div class="result-empty card"><p><b>생년월일시를 입력하면 결과가 여기에 나타납니다.</b></p><p class="muted">이 기기에 저장을 선택하면 다음 방문에도 입력 정보를 불러올 수 있습니다.</p><noscript><p>운세 계산은 브라우저에서 이루어지므로 자바스크립트를 켜 주세요.</p></noscript></div>'}</div>`;
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
      <div><dt>일진 ${tip(TIPS.ilJin, '일진 설명')}</dt><dd><span class="hz el-${STEM_EL[dp.s]}">${pillarH(dp)}</span> ${pillarLabel(dp).slice(0, 2)}일</dd></div>
      <div><dt>월건 ${tip(TIPS.wolGeon, '월건 설명')}</dt><dd><span class="hz">${pillarH(mp)}</span> ${pillarLabel(mp).slice(0, 2)}월</dd></div>
      <div><dt>세차 ${tip(TIPS.seCha, '세차 설명')}</dt><dd><span class="hz">${pillarH(yp)}</span> ${pillarLabel(yp).slice(0, 2)}년</dd></div>
      ${nt ? `<div><dt>다음 절기 ${tip(TIPS.term, '절기 설명')}</dt><dd>${nt.name} ${nt.date.m}/${nt.date.d} ${nt.time}</dd></div>` : ''}
    </dl>
  </section>`;
}
// 띠별 오늘의 운세 (서버에서 날짜별로 계산)
export function ttiDayList(o, opts = {}) {
  const rows = [...Array(12).keys()].map((t) => ttiDay(t, o));
  const items = rows.map((r) => `<li class="tti-row"><a href="/tti/${opts.tomorrow ? 'tomorrow' : 'today'}/${ANIMAL_SLUG[r.tti]}/" class="tti-name" data-dialog="tti-day-${r.tti}" aria-haspopup="dialog" aria-controls="tti-day-${r.tti}">${animalIcon(r.tti)}${r.animal}띠</a><span class="num tti-score">${r.score}</span>${bandChip(r.score)}${opts.short ? '' : `<p>${esc(r.text)} <span class="muted">행운의 색 ${r.color} · 숫자 ${r.number}</span></p>`}</li>`).join('');
  return `<ol class="tti-list${opts.short ? ' short' : ''}">${items}</ol>${rows.map((r) => `<dialog class="character-dialog tti-dialog" id="tti-day-${r.tti}" aria-labelledby="tti-detail-title-${ANIMAL_SLUG[r.tti]}"><div class="dialog-bar"><span>${r.animal}띠 일별 운세</span><button class="sbtn" type="button" data-close-dialog autofocus>닫기 ×</button></div><div class="box">${ttiDailyDetail(r.tti, o, opts.tomorrow ? '내일' : '오늘')}</div></dialog>`).join('')}`;
}

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
  story: ['0~89세를 10년씩 아홉 구간으로 나눕니다. 30세 전은 년주·월주, 30~59세는 일주, 60세 이후는 시주를 바탕으로 봅니다.', '각 시기를 지나는 대운을 겹치는 햇수만큼 반영해 시기 점수(대운 70%·원국 30%)를 냅니다.', '시기에 가장 강한 십신이 캐릭터 직업, 점수가 수식어, 그 기둥의 신살이 스킬이 됩니다.', '게임 능력치는 분야 점수의 차이를 확대하고 직업 보정을 더합니다. 운세 점수와 실제 능력은 구분합니다.'],
  rank: ['여덟 글자를 오행 균형·일간 강약·용신의 힘·길신·합·충형·특수 신살 7개 항목으로 점수화합니다.', '가능한 모든 사주 518,400가지(시간 모름 43,200가지)를 같은 규칙으로 미리 계산해 두었습니다.', '내 점수보다 높은 사주 수 + 1이 내 순위이며, 항목별 점수는 전체 평균과 비교해 근거로 보여 줍니다.', '재물·명예·매력·건강·지혜 분야 점수도 같은 방식으로 백분위를 냅니다.'],
  manseryeok: ['년주: 입춘 절입 시각 기준', '월주: 매달 절입 시각 기준', '일주: 60일 주기 일진', '시주: 동경 127.5° 평균태양시(표준시 −30분), 밤 11시 30분부터 다음 날 자시', '시진 선택: 출생일의 표준시·서머타임에 맞춘 시계 기준 구간의 가운데 시각으로 계산'],
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
    ['/life-story/', '사주로 본 내 인생은?', '10년 단위 인생 캐릭터'],
    ['/saju-ranking/', '내 사주 랭킹', '518,400가지 사주 중 몇 위?'],
    ['/tti/today/', '띠별 오늘의 운세', '12띠 오늘 점수'],
  ];
  const fun = all.filter(([h]) => h === '/life-story/' || h === '/saju-ranking/');
  return related([...fun, ...all.filter(([h]) => h !== path && !fun.some(([f]) => f === h))].filter(([h]) => h !== path).slice(0, 6));
}
function webApp(tool, ctx) {
  return { '@type': 'WebApplication', name: `${SITE.name} ${tool.h1}`, url: `${ctx.site}${tool.path}`, description: tool.desc, applicationCategory: 'LifestyleApplication', operatingSystem: 'Web', inLanguage: 'ko-KR', isAccessibleForFree: true, offers: { '@type': 'Offer', price: FREE_ACCESS.price, priceCurrency: FREE_ACCESS.currency }, publisher: { '@id': `${ctx.site}/#org` } };
}
function toolPage(key, ctx, opts = {}) {
  const t = opts.tool || TOOLS[key];
  const mode = opts.mode || key;
  const top = opts.top || '';
  const extraAfter = opts.after || '';
  const faq = [...t.faq, FREE_FAQ];
  return {
    path: t.path, title: t.title, description: t.desc, crumbs: opts.crumbs || [[t.nav, t.path]], section: t.path,
    tool: true, share: false, ld: [webApp(t, ctx), faqLd(faq)],
    body: `${hero(t.h1, t.lead, FREE_ACCESS.summary)}${top}${toolBlock(mode, ctx, opts)}${adSlot(ctx, 'inline')}<div class="info-panels">${disclosure('tool-method', '계산 방법과 점수 기준', howBlock(mode === 'year' ? 'year' : mode))}${extraAfter ? disclosure('tool-more', '관련 운세와 더 알아보기', extraAfter) : ''}${disclosure('tool-faq', '자주 묻는 질문', faqBlock(faq), 'help')}${disclosure('tool-related', '다른 운세 둘러보기', relatedFor(t.path, ctx))}</div>`,
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
    after: `<section class="box-sec"><div class="sec-head"><h2>${o.m}월 ${o.d}일 띠별 운세 미리 보기</h2></div>${ttiDayList(o, { short: true, tomorrow: true })}</section>`,
  });
}
export const week = (ctx) => toolPage('week', ctx, { top: weekBox(ctx.today) });
export const month = (ctx) => toolPage('month', ctx, { top: monthBox(ctx.today) });
export const lifetime = (ctx) => toolPage('lifetime', ctx);
export const compatibility = (ctx) => toolPage('compatibility', ctx, {
  after: `<section class="prose"><h2>띠 궁합만 빠르게 보고 싶다면</h2><p>태어난 해의 띠만으로 보는 궁합은 <a href="/tti/compatibility/">띠 궁합표</a>에서 12띠 모든 조합을 확인할 수 있습니다. 다만 띠는 여덟 글자 중 한 글자일 뿐이라, 정확한 궁합은 위의 사주 궁합으로 보세요.</p></section>`,
});
export const story = (ctx) => toolPage('story', ctx, {
  after: `<section class="prose"><h2>캐릭터 도감</h2><p>사주의 십신 열 가지가 캐릭터 직업이 됩니다. 비견은 독립 전사, 겁재는 승부사 검객, 식신은 풍요의 음유시인, 상관은 재치의 이야기꾼, 편재는 대륙의 모험 상인, 정재는 성실한 재무관, 편관은 불굴의 장군, 정관은 명예의 기사, 편인은 은둔의 연금술사, 정인은 지혜의 현자입니다. <a href="/saju/sipsin/">십신 뜻 자세히 보기</a></p></section>`,
});
export const rank = (ctx) => toolPage('rank', ctx, {
  after: `<section class="prose"><h2>60일주 중 가장 점수가 높은 일주는?</h2><p>모든 사주를 같은 규칙으로 계산해 일주별 평균 점수를 낸 <a href="/saju/ilju-ranking/">60일주 랭킹</a>도 확인해 보세요.</p></section>`,
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
    path: '/year/', title: '신년운세 — 올해·내년 사주 총운과 월별 운세', description: `${ys.join('년·')}년 신년운세. 내 사주와 세운·대운으로 계산한 연간 총운과 분야별 점수, 1~12월 월별 운세를 연도별로 확인하세요. 토정비결과의 차이도 안내합니다.`,
    crumbs: [['신년운세', '/year/']], section: '/year/',
    body: `${hero('무료 신년운세', '신년운세는 그 해의 간지(세운)가 내 사주 원국과 맺는 관계로 한 해의 흐름을 봅니다. 연도를 골라 총운과 1~12월 월별 운세를 확인하세요.', FREE_ACCESS.summary)}<div class="cards">${ys.map((y) => `<a class="card link-card" href="/year/${y}/"><b>${y}년 운세</b><span>${pillarLabel(yearPillar(y))}년 · ${ANIMAL[yearPillar(y).b]}띠 해</span></a>`).join('')}</div><p class="note">이곳의 신년운세는 사주 방식으로 계산합니다. 144괘로 한 해를 읽으려면 <a href="/tojeong/">무료 토정비결</a>을 이용하세요. <a href="/about/#tojeong">두 방식의 차이</a>도 확인할 수 있습니다.</p>`,
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
    ['/tojeong/', '무료 토정비결', '144괘로 보는 총운과 음력 열두 달의 풀이'],
    ['/compatibility/', '사주 궁합', '평생 궁합, 조심할 점, 결혼 길일'],
    ['/manseryeok/', '만세력', '사주팔자 원국과 대운 바로 계산'],
  ];
  const fun = [
    ['/life-story/', '사주로 본 내 인생은?', '0~89세를 아홉 캐릭터로 — 나는 어떤 주인공일까?'],
    ['/saju-ranking/', '내 사주 랭킹', '518,400가지 사주 중 내 사주는 몇 위?'],
    ['/saju/ilju-ranking/', '60일주 랭킹', '평균 점수가 가장 높은 일주는?'],
  ];
  const ty = [...Array(12).keys()].map((t) => ttiYear(t, y));
  const sj = samjaeYear(y);
  const body = `
    <section class="home-hero">
      <div class="home-discovery"><div class="home-intro"><p class="eyebrow">${esc(SITE.tagline)}</p><h1>${esc(HOME.h1)}</h1><p class="lead">${esc(HOME.lead)}</p></div>
        <section class="box-sec fun-sec"><div class="sec-head"><h2>재미로 보는 사주</h2></div><div class="home-features">${fun.map(([h, t, d], i) => `<a class="card home-feature" href="${h}">${i === 0 ? '<img src="/characters/384/ranger.webp" width="72" height="72" alt="">' : `<span class="home-feature-icon">${uiIcon(i === 1 ? 'trophy' : 'book')}</span>`}<span><b>${t}</b><small>${d}</small></span>${uiIcon('arrow')}</a>`).join('')}</div></section>
      </div>
      ${toolBlock('home', ctx)}
    </section>
    ${dayBox(o, '오늘')}
    <section class="box-sec"><div class="sec-head"><h2>무료로 보는 사주와 운세</h2></div><div class="cards home-tools">${cards.map(([h, t, d]) => `<a class="card link-card" href="${h}"><b>${t}</b><span>${d}</span></a>`).join('')}</div></section>
    <section class="box-sec"><div class="sec-head"><h2>띠별 오늘의 운세 · ${o.m}월 ${o.d}일</h2><a href="/tti/today/">해설 보기</a></div>${ttiDayList(o, { short: true })}</section>
    <section class="box-sec"><div class="sec-head"><h2>${y}년 ${pillarLabel(yearPillar(y))}년 띠별 운세</h2><a href="/tti/${y}/">12띠 전체</a></div>
      <p class="muted">${y}년 삼재: ${sj.map((s) => `${ANIMAL[s.tti]}띠(${s.name})`).join(', ')}</p>
      <div class="cards zodiac-cards">${ty.map((r) => `<a class="card link-card tti-card" href="/tti/${y}/${ANIMAL_SLUG[r.tti]}/">${animalIcon(r.tti)}<b>${r.animal}띠 <span class="num">${r.score}</span></b><span>${esc(r.headline)}</span></a>`).join('')}</div></section>
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
    ld: [faqLd(HOME.faq), { '@type': 'ItemList', name: `${SITE.name} 운세 종류`, itemListElement: cards.map(([h, t], i) => ({ '@type': 'ListItem', position: i + 1, name: t, url: `${ctx.site}${h}` })) }],
    body,
  };
}
export { hero, related };
