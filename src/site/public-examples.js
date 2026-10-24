import { elementName, term } from '../i18n/terms.js';
import { tr } from '../i18n/runtime.js';
import { siteText, siteValue } from './copy.js';
// 공개 설명에만 쓰는 가상 입력. 개인 저장소·요청 매개변수를 읽지 않는다.
// 결과를 전사하지 않고 실제 계산기와 같은 엔진으로 HTML을 생성한다.
import { buildChart, day, isoDate, year, yearMonths, lifetime, compat, pillarLabel, TG, TG_SLUG } from '../engine/index.js';
import { UNKNOWN_TIME } from '../content/calculation-notes.js';
import { esc } from './util.js';

export const EXAMPLE_INPUT = Object.freeze({ gender: 'M', calendar: 'solar', y: 1990, m: 5, d: 17, time: '14:30' });
export const DEEP_EXAMPLE_INPUT = Object.freeze({ gender: 'F', calendar: 'solar', y: 1990, m: 5, d: 15, time: '14:00' });
export const PARTNER_EXAMPLE_INPUT = Object.freeze({ gender: 'M', calendar: 'solar', y: 1988, m: 8, d: 2, time: '09:00' });
export const MANSE_BOUNDARIES = Object.freeze([
  { id: 'ipchun', input: { gender: 'M', calendar: 'solar', y: 1990, m: 2, d: 4 }, times: ['10:30', '11:30'] },
  { id: 'night', input: { gender: 'M', calendar: 'solar', y: 1999, m: 12, d: 31 }, times: ['23:20', '23:40'] },
]);
const inputText = (p) => `${p.calendar === 'solar' ? siteText('양력') : siteText('음력')} ${p.y}${siteText("년 ")}${p.m}${siteText("월 ")}${p.d}${siteText("일, ")}${p.time || siteText('시간 모름')}, ${p.gender === 'M' ? siteText('남성') : siteText('여성')}`;
const start = (title, date, input = EXAMPLE_INPUT) => `<section class="card box public-example" id="public-example" aria-labelledby="example-title"${date ? ` data-example-date="${isoDate(date)}"` : ''}><p class="eyebrow">${siteText("실제 엔진으로 계산한 가상 사례")}</p><h2 id="example-title">${title}</h2><p>${siteText("이 사례는 기능 설명을 위해 정한 가상의 입력이며 실존 인물이나 이용자의 저장 정보가 아닙니다.")}</p><h3>${siteText("입력 예시")}</h3><p>${inputText(input)}${siteText(". 출생 당시 한국 시계 시각을 입력한 사례입니다.")}</p>`;
const end = () => `<h3>${siteText("해석의 한계")}</h3><p>${siteText("간지와 점수는 이 서비스의 계산 규칙에 따른 결과입니다. 성격이나 미래 사건이 사실로 확인되었다는 뜻이 아니며, 점수는 성공 확률이나 예측 정확도가 아닙니다.")}</p><p><a href="/about/#birth-rules">${siteText("입력·시간 경계 기준")}</a> · <a href="/about/#limits">${siteText("검증 범위와 해석의 한계")}</a></p><p class="cta"><a class="btn" href="#tool" data-ga-cta="public_example">${siteText("내 정보로 직접 이용하기")}</a></p></section>`;

const deepNav = (mode) => `<nav class="example-nav" aria-label="${tr('공개 결과 예시', 'Worked examples')}"><a href="/lifetime/#public-example"${mode === 'life' ? ' aria-current="page"' : ''}>${tr('평생 운세 예시', 'Lifetime example')}</a><a href="/compatibility/#public-example"${mode === 'compat' ? ' aria-current="page"' : ''}>${tr('궁합 예시', 'Compatibility example')}</a></nav>`;
function modelScope(date) {
  return `<p class="note">${tr('계산 기준일', 'Reference date')}: <time datetime="${isoDate(date)}">${isoDate(date)}</time> · ${tr('현재 서비스와 동일한 계산 엔진', 'The same calculation engine as the current service')}</p><h3>${tr('현재 계산이 반영하는 범위', 'Calculation scope')}</h3><ul><li>${tr('한국의 과거 표준시·서머타임과 평균태양시 보정을 반영합니다.', 'Includes historical Korean time zones, daylight saving and mean solar time adjustments.')}</li><li>${tr('강약은 월지·일지 가중치와 비겁·인성 비율을 반영합니다.', 'Day Master strength uses month/day branch weights and Peer/Resource proportions.')}</li><li>${tr('용신은 억부 선호와 계절 보정을 합친 이 서비스의 모델입니다.', 'Useful elements follow this service’s model of strength balancing and seasonal adjustment.')}</li><li>${tr('출생지별 경도·균시차·해외 시간대 변환과 별도 격국·종격 판정은 포함하지 않습니다.', 'Does not include location-specific longitude, equation of time, overseas time-zone conversion or separate special-structure classification.')}</li></ul><p>${esc(UNKNOWN_TIME.summary)}</p><p>${esc(UNKNOWN_TIME.boundary)}</p>`;
}
function timeComparison(c, unknown, extraRows = '') {
  const row = (name, a, b) => `<tr><th scope="row">${name}</th><td>${a}</td><td>${b}</td></tr>`;
  return `<h3>${tr('같은 생일에 시간을 모른다면', 'The same birthday with an unknown time')}</h3><div class="table-wrap" tabindex="0" role="region" aria-label="${tr('시간 유무에 따른 결과 비교', 'Results with and without a birth time')}"><table><caption>${tr('다른 입력을 유지하고 첫 번째 인물의 시각만 변경했습니다.', 'All other inputs remain the same; only the first person’s birth time changes.')}</caption><thead><tr><th scope="col">${tr('비교 항목', 'Item')}</th><th scope="col">14:00</th><th scope="col">${tr('시간 모름', 'Time unknown')}</th></tr></thead><tbody>${row(tr('원국', 'Pillars'), c.cols.map(pillarLabel).join(' · '), unknown.cols.map(pillarLabel).join(' · '))}${row(tr('겉글자 수', 'Visible characters'), c.counts.reduce((a, b) => a + b, 0), unknown.counts.reduce((a, b) => a + b, 0))}${row(tr('일간 강약', 'Day Master strength'), term(c.strengthLabel), term(unknown.strengthLabel))}${row(tr('용신', 'Useful element'), elementName(c.roles.yong), elementName(unknown.roles.yong))}${extraRows}</tbody></table></div><p class="note">${tr('이 사례의 차이이며, 모든 사람의 결과가 같은 방향으로 변한다는 뜻은 아닙니다.', 'These differences apply to this example; other people’s results may change differently.')}</p>`;
}

export function lifetimeExample(date) {
  const c = buildChart({ ...DEEP_EXAMPLE_INPUT });
  const unknown = buildChart({ ...DEEP_EXAMPLE_INPUT, time: null });
  const r = lifetime(c, date);
  return `${start(tr('평생 운세 결과 예시와 읽는 법', 'Lifetime Reading: Worked Example'), null, DEEP_EXAMPLE_INPUT)}${deepNav('life')}
    <h3>${tr('실제 계산 결과', 'Calculated results')}</h3><p><b>${esc(r.dayMaster.title)}</b> · ${esc(r.dayMaster.image)}</p><p>${esc(r.dayMaster.summary)}</p><p>${esc(r.strength.text)}</p>
    <div class="table-wrap"><table><caption>${tr('가상 사례의 대운 흐름', 'Ten-year cycles for this fictional example')}</caption><thead><tr><th scope="col">${tr('시작 연도', 'Start year')}</th><th scope="col">${tr('만 나이', 'Age')}</th><th scope="col">${tr('대운', 'Cycle')}</th><th scope="col">${tr('점수', 'Score')}</th></tr></thead><tbody>${r.daeun.map(d => `<tr data-example-cycle="${d.startYear}"><th scope="row">${d.startYear}</th><td>${d.age}</td><td>${pillarLabel(d)}</td><td data-cycle-score>${d.score}</td></tr>`).join('')}</tbody></table></div>
    <h3>${tr('읽는 방법', 'How to read it')}</h3><p>${tr('일간의 성질, 오행 분포와 강약을 먼저 읽고 10년 단위 대운을 살펴보세요. 대운 점수는 해당 대운과 원국을 기존 분야별 가중치로 비교한 값입니다. 실제 인생의 성취·건강·재산을 측정한 값은 아닙니다.', 'Start with the Day Master, element distribution and strength, then explore the ten-year cycles. Cycle scores compare each cycle with the natal chart using the existing area weights. They do not measure real achievements, health or wealth.')}</p>
    ${timeComparison(c, unknown)}${modelScope(date)}${end()}`;
}

export function compatibilityExample(date) {
  const a = buildChart({ ...DEEP_EXAMPLE_INPUT }), b = buildChart({ ...PARTNER_EXAMPLE_INPUT });
  const unknown = buildChart({ ...DEEP_EXAMPLE_INPUT, time: null });
  const r = compat(a, b, date), comparison = compat(unknown, b, date);
  return `${start(tr('사주 궁합 결과 예시와 읽는 법', 'Saju Compatibility: Worked Example'), null, DEEP_EXAMPLE_INPUT)}<p>${tr('상대 가상 입력: ', 'Fictional partner: ')}${inputText(PARTNER_EXAMPLE_INPUT)}.</p>${deepNav('compat')}
    <h3>${tr('실제 계산 결과', 'Calculated results')}</h3><p>${tr('종합 궁합', 'Overall compatibility')}: <b data-example-overall>${r.total}${tr('점', ' points')}</b> · ${esc(r.headline)}</p>
    <div class="table-wrap"><table><caption>${tr('가상 사례의 분야별 궁합', 'Compatibility areas for this fictional pair')}</caption><thead><tr><th scope="col">${tr('분야', 'Area')}</th><th scope="col">${tr('점수', 'Score')}</th></tr></thead><tbody>${r.cats.map(cat => `<tr><th scope="row">${esc(cat.name)}</th><td data-compat-score="${cat.key}">${cat.score}</td></tr>`).join('')}</tbody></table></div>
    ${r.lines.map(line => `<p>${esc(line)}</p>`).join('')}
    <h3>${tr('읽는 방법', 'How to read it')}</h3><p>${tr('일간, 일지·월지·년지의 관계와 필요한 오행의 보완을 함께 비교합니다. 분야별 점수를 소통과 생활 방식의 차이를 살피는 질문으로 읽어보세요. 점수는 사랑의 크기나 결혼 성공률을 측정하지 않습니다.', 'The reading compares Day Masters, day/month/year branch relationships and element balance. Use the areas as prompts for discussing communication and everyday habits. Scores do not measure love or the probability of a successful marriage.')}</p>
    ${timeComparison(a, unknown, `<tr><th scope="row">${tr('종합 궁합', 'Overall compatibility')}</th><td>${r.total}</td><td>${comparison.total}</td></tr>`)}${modelScope(date)}${end()}`;
}

export function dayExample(date, which) {
  const c = buildChart({ ...EXAMPLE_INPUT });
  const r = day(c, date, which);
  const title = which === 'tomorrow' ? tr('내일의 운세 결과 예시와 읽는 법', 'Tomorrow’s Fortune: Worked Example') : tr('오늘의 운세 결과 예시와 읽는 법', 'Today’s Fortune: Worked Example');
  const points = tr('점', ' points');
  return `${start(title, date)}
    <h3>${siteText('실제 계산 결과')}</h3><p>${tr('기준 날짜: ', 'Reference date: ')}<time datetime="${isoDate(date)}">${r.label}</time> · ${tr('일진: ', 'Day pillar: ')}${pillarLabel(r.pillar)}.</p>
    <p>${tr('이 가상 사례의 종합 점수는 ', 'The overall score for this fictional example is ')}<b data-example-overall>${r.overall.score}${points}</b>${tr('입니다.', '.')}</p>
    <div class="table-wrap"><table class="grid-table"><caption>${title}</caption><thead><tr><th scope="col">${siteText('분야')}</th><th scope="col">${siteText('점수')}</th></tr></thead><tbody>${r.cats.map((cat) => `<tr><th scope="row">${cat.name}</th><td>${cat.score}${points}</td></tr>`).join('')}</tbody></table></div>
    <p>${siteText('계산된 총운 해설: ')}${esc(r.overall.text)}</p>
    <h3>${siteText('읽는 방법')}</h3><p>${tr('오늘·내일 운세는 해당 날짜의 일진 70%, 절기 기준 월운 20%, 세운 10%로 내 사주와의 관계를 합산한 뒤 점수로 환산합니다. 종합 점수는 분야별 점수의 단순 평균이 아닙니다. 점수의 높고 낮음과 함께 총운과 각 분야의 설명을 읽어 보세요.', 'Daily readings combine relationships with the day cycle at 70%, solar-term month cycle at 20% and annual cycle at 10%, then convert them to scores. The overall score is not a simple average of the area scores. Read the explanations alongside the numbers.')}</p>
    <h3>${tr('생일이나 띠가 같아도 결과가 다른 이유', 'Why the same birthday or zodiac sign can give different results')}</h3><p>${tr('띠별 운세는 태어난 해의 지지 하나를 비교하지만, 개인 운세는 출생 연·월·일·시로 세운 원국을 함께 봅니다. 같은 생일도 태어난 해와 시각이 다르면 결과가 달라질 수 있습니다. 시간을 모르면 시주를 제외해 다시 계산하며, 기준 날짜가 바뀌면 같은 입력의 점수도 달라질 수 있습니다.', 'Zodiac readings compare one birth-year branch. Personal readings use the natal year, month, day and hour pillars. People sharing a birthday can have different birth years or times. Choosing Time unknown omits the hour pillar, and changing the reference date can also change the scores.')}</p>
    <p><a href="/manseryeok/">${tr('내 사주 원국 확인하기', 'Check my natal chart')}</a> · <a href="${which === 'tomorrow' ? '/today/' : '/tomorrow/'}">${which === 'tomorrow' ? tr('오늘의 운세와 비교하기', 'Compare with today’s fortune') : tr('내일의 운세도 확인하기', 'Explore tomorrow’s fortune')}</a></p>${end()}`;
}

function manseBoundaryExample({ id, input, times }) {
  const [before, after] = times.map((time) => buildChart({ ...input, time }));
  const title = id === 'ipchun'
    ? tr('입춘 전후에는 어떤 기둥이 달라질까요?', 'Which pillars change across the start of spring?')
    : tr('같은 날짜의 밤 11시 30분 전후는 어떻게 다를까요?', 'What changes across 23:30 on the same date?');
  const explanation = id === 'ipchun'
    ? tr('년주는 입춘 절입 시각, 월주는 매달 절입 시각을 기준으로 바뀝니다. 이 가상 사례에서는 입춘과 시진 경계를 함께 지나므로 년주·월주·시주가 달라지고 일주는 같습니다.', 'The year pillar changes at the start of spring (Ipchun), and the month pillar changes at a solar-term boundary. This fictional pair crosses both Ipchun and an hour-period boundary, so the year, month and hour pillars change while the day pillar stays the same.')
    : tr('이 서비스는 동경 127.5° 평균태양시를 기준으로 계산합니다. 현행 한국 표준시·서머타임 미적용에서는 30분을 보정해 23:30부터 다음 날의 일주와 자시를 적용합니다. 두 입력 모두 출생 당시 시계의 날짜와 시각을 그대로 넣으며, 날짜를 다음 날로 바꾸지 않습니다. 과거 표준시·서머타임이나 출생지별 진태양시를 쓰는 방식과는 조건이 다를 수 있습니다.', 'This service uses mean solar time at 127.5°E. Under current Korean Standard Time without daylight saving, it applies a 30-minute correction and uses the next day pillar and Rat hour from 23:30. Enter the original clock date and time for both examples; do not move the birth date forward. Historical time zones, daylight saving and methods using location-specific apparent solar time can have different boundaries.');
  return `<section class="example-boundary" data-boundary="${id}" aria-labelledby="example-${id}-title">
    <h3 id="example-${id}-title">${title}</h3>
    <p>${tr('가상 입력 A: ', 'Fictional input A: ')}${inputText({ ...input, time: times[0] })}<br>${tr('가상 입력 B: ', 'Fictional input B: ')}${inputText({ ...input, time: times[1] })}</p>
    <p>${explanation}</p>
    <p class="example-scroll-hint" id="example-${id}-hint">${tr('좁은 화면에서는 표를 좌우로 밀어 두 입력과 변경 여부를 비교하세요.', 'On narrow screens, scroll the table sideways to compare both inputs and the changes.')}</p>
    <div class="table-wrap" tabindex="0" role="region" aria-labelledby="example-${id}-title" aria-describedby="example-${id}-hint"><table class="grid-table example-pillars"><caption>${title}</caption><thead><tr><th scope="col">${siteText('기둥')}</th><th scope="col">A · ${times[0]}</th><th scope="col">B · ${times[1]}</th><th scope="col">${tr('비교', 'Comparison')}</th></tr></thead><tbody>${before.cols.map((p, i) => {
    const q = after.cols[i], changed = p.s !== q.s || p.b !== q.b;
    return `<tr data-changed="${changed}"><th scope="row">${siteValue(p.label)}</th><td>${pillarLabel(p)}</td><td>${pillarLabel(q)}</td><td>${changed ? `<strong>${tr('변경', 'Changed')}</strong>` : tr('같음', 'Same')}</td></tr>`;
  }).join('')}</tbody></table></div></section>`;
}

export function manseExample() {
  const c = buildChart({ ...EXAMPLE_INPUT });
  const unknown = buildChart({ ...EXAMPLE_INPUT, time: null });
  return `${start(siteText('만세력 결과는 이렇게 읽습니다'))}
    <h3>${siteText("실제 계산 결과")}</h3><p>${c.cols.map((p) => `${siteValue(p.label)} ${pillarLabel(p)}`).join(' · ')}${siteText("입니다.")}</p><p class="example-scroll-hint" id="example-scroll-hint">${siteText("좁은 화면에서는 표를 좌우로 밀어 십신과 12운성을 확인하세요.")}</p><div class="table-wrap" tabindex="0" role="region" aria-label="${siteText("가상 사례 원국 상세 표")}" aria-describedby="example-scroll-hint"><table class="grid-table example-pillars"><caption>${siteText("가상 사례의 사주 원국")}</caption><thead><tr><th scope="col">${siteText("기둥")}</th><th scope="col">${siteText("간지")}</th><th scope="col">${siteText("천간 십신")}</th><th scope="col">${siteText("지지 십신")}</th><th scope="col">${siteText("12운성")}</th></tr></thead><tbody>${c.cols.map((p) => `<tr><th scope="row">${siteValue(p.label)}</th><td>${pillarLabel(p)}</td><td>${siteValue(p.tgS)}</td><td>${siteValue(p.tgB)}</td><td>${siteValue(p.stage)}</td></tr>`).join('')}</tbody></table></div>
    <p>${siteText("겉글자의 오행 개수: ")}${c.counts.map((n, i) => `${elementName(i)} ${siteValue(n)}${siteText("개")}`).join(' · ')}.</p>
    <h3>${siteText("읽는 방법")}</h3><p>${siteText("년주·월주·일주·시주는 출생 년·월·일·시의 간지입니다. 일주의 천간을 일간이라 하고, 십신은 일간과 다른 글자의 관계를 나타냅니다. 오행 개수는 겉글자를 센 값으로, 지장간과 월지 가중치를 반영하는 강약·용신 계산과 구분합니다.")}</p>
    ${MANSE_BOUNDARIES.map(manseBoundaryExample).join('')}
    <h3>${siteText("같은 생일에 시간을 모른다면")}</h3><p>${siteText("시간 모름으로 다시 계산하면 ")}${unknown.cols.map((p) => `${siteValue(p.label)} ${pillarLabel(p)}`).join(' · ')}${siteText("이며 시주는 없습니다. 겉글자는 ")}${unknown.counts.reduce((a, b) => a + b, 0)}${siteText("개입니다.")}</p><p>${esc(UNKNOWN_TIME.summary)}</p>${end()}`;
}

function yearMonthExample(m, y) {
  const points = tr('점', ' points');
  const tenGodLink = (tg) => `<a href="/saju/sipsin/${TG_SLUG[TG.indexOf(tg)]}/">${siteValue(tg)}</a>`;
  return `<section class="example-month" data-example-month="${m.m}" aria-labelledby="example-month-${m.m}-title">
    <h4 id="example-month-${m.m}-title">${tr(`${y}년 ${m.m}월`, `${y} · Month ${m.m}`)}</h4>
    <p>${tr('대표 월주: ', 'Reference month pillar: ')}${m.pillarText}<br>${tr('천간·지지 십신: ', 'Stem and branch Ten Gods: ')}${tenGodLink(m.tgS)} · ${tenGodLink(m.tgB)}</p>
    <p>${tr('종합 ', 'Overall: ')}<b data-month-score>${m.score}${points}</b> · ${tr('이 달에서 상대적으로 높은 분야: ', 'Highest-scoring area within this month: ')}<b data-month-best>${m.best.name} ${m.best.score}${points}</b></p>
    <p data-month-explanation>${esc(m.text)}</p></section>`;
}

export function yearExample(y, ctx) {
  const c = buildChart({ ...EXAMPLE_INPUT });
  const which = y === ctx.today.y + 1 ? 'next' : 'this';
  const r = year(c, y, which), months = yearMonths(c, y);
  const unknown = year(buildChart({ ...EXAMPLE_INPUT, time: null }), y, which);
  const comparison = months.filter((m) => [5, 11].includes(m.m));
  return `${start(`${y}${siteText("년 신년운세 계산 예시")}`)}
    <h3>${siteText("실제 계산 결과")}</h3><p>${siteText("대상 연도: ")}${y}${siteText("년 · 세운 ")}${pillarLabel(r.pillar)}${r.daeun ? `${siteText(" · 대운 ")}${pillarLabel(r.daeun)}` : ''}${siteText(". 종합 점수는 ")}<b data-example-overall>${r.overall.score}${siteText("점")}</b>${siteText("입니다.")}</p>
    <div class="table-wrap"><table class="grid-table"><caption>${siteText("가상 사례의 ")}${y}${siteText("년 분야별 점수")}</caption><thead><tr><th scope="col">${siteText("분야")}</th><th scope="col">${siteText("점수")}</th></tr></thead><tbody>${r.cats.map((cat) => `<tr><th scope="row">${cat.name}</th><td>${cat.score}${siteText("점")}</td></tr>`).join('')}</tbody></table></div>
    <p>${siteText("계산된 총운 해설: ")}${esc(r.overall.text)}</p>
    <div class="table-wrap"><table class="grid-table"><caption>${siteText("가상 사례의 ")}${y}${siteText("년 월별 점수")}</caption><thead><tr><th scope="col">${siteText("월")}</th><th scope="col">${siteText("대표 월주")}</th><th scope="col">${siteText("점수")}</th></tr></thead><tbody>${months.map((m) => `<tr><th scope="row">${m.m}${siteText("월")}</th><td>${pillarLabel(m.pillar)}</td><td>${m.score}${siteText("점")}</td></tr>`).join('')}</tbody></table></div>
    <h3>${siteText("읽는 방법")}</h3><p>${siteText("이 사례의 연간 점수는 세운 68%와 대운 32%를 합친 뒤 환산한 값입니다. 월별 점수는 각 달 15일의 절기 월주 65%와 그날의 년주 35%로 별도 계산하므로, 열두 달 점수의 단순 평균이 연간 점수가 되지는 않습니다. 입춘 전인 1월에는 전년도 년주가 반영됩니다.")}</p>
    <h3>${tr('두 달의 점수와 해설을 함께 읽기', 'Read two months side by side')}</h3>
    <p>${tr('같은 가상 입력의 5월과 11월을 비교해 보세요. 설명을 위해 고른 두 달이며, 모든 사람의 최고·최저 월을 뜻하지 않습니다. 종합 점수와 그 달에서 상대적으로 높은 분야를 함께 읽으면 분야별 차이를 확인할 수 있습니다.', 'Compare May and November for the same fictional birth details. These months were chosen to illustrate the reading; they are not everyone’s best or worst months. Read the overall score alongside the highest-scoring area within each month to see how the areas differ.')}</p>
    ${comparison.map((m) => yearMonthExample(m, y)).join('')}
    <p>${tr('십신은 일간과 월주의 관계를 이해하는 맥락입니다. 위 해설은 기존 월별 계산 결과이며, 특정 십신 하나 때문에 몇 점이 증가하거나 감소했다고 분해한 값은 아닙니다.', 'The Ten Gods describe how the month pillar relates to the Day Master. The explanations above come from the existing monthly calculation; they do not assign a specific point increase or decrease to a single Ten God.')}</p>
    <h3>${siteText("시간 모름으로 바꾸면")}</h3><p>${siteText("나머지 입력을 유지하고 시간 모름을 선택하면 이 사례의 종합 점수는 ")}${unknown.overall.score}${siteText("점입니다. 시주를 제외하면 전체 오행과 관계 계산이 달라질 수 있어, 영향이 자녀운·말년운에만 한정되지 않습니다.")}</p><p>${esc(UNKNOWN_TIME.summary)}</p>${end()}`;
}
