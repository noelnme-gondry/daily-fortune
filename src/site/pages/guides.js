import { READING_GUIDES } from '../../content/reading-guides.js';
import { GUIDE_CATEGORIES } from '../../content/guide-catalog.js';
import { PUBLISHER } from '../../content/publisher.js';
import { UNKNOWN_TIME } from '../../content/calculation-notes.js';
import { buildChart, day, addDays, week, month, year, compat, pillarLabel, isoDate } from '../../engine/index.js';
import { calculateTojeong } from '../../domain/tojeong.js';
import { tr } from '../../i18n/runtime.js';
import { elementName } from '../../i18n/terms.js';
import { EXAMPLE_INPUT, DEEP_EXAMPLE_INPUT, PARTNER_EXAMPLE_INPUT } from '../public-examples.js';
import { esc } from '../util.js';
import { hero } from './tools.js';
import { guideArticleBody } from '../guide-articles.js';
import { contentModified } from '../content-revisions.js';

const section = (id, title, paragraphs, extra = '') => `<section class="prose" id="${id}"><h2>${title}</h2>${paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}${extra}</section>`;
function table(caption, headers, rows) {
  return `<div class="table-wrap" tabindex="0" role="region" aria-label="${esc(caption)}"><table class="grid-table"><caption>${caption}</caption><thead><tr>${headers.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr><th scope="row">${row[0]}</th>${row.slice(1).map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
const inputNote = (p) => `<p class="note">${tr('가상 입력 · 양력', 'Fictional input · solar calendar')} ${isoDate(p)} · ${p.time || tr('시간 모름', 'Time unknown')} · ${p.gender === 'M' ? tr('남성', 'Male') : tr('여성', 'Female')}. ${tr('한국에서 출생 당시 사용한 시계 시각입니다. 이용자 정보나 실제 인물의 사례가 아닙니다.', 'The clock time used in Korea at birth. These are not user details or a real person’s case.')}</p>`;
function cardsFor(guides, showTopics = false) {
  return `<div class="cards reading-guide-cards">${guides.map(g => `<a class="card link-card" href="/guides/${g.slug}/"><b>${esc(g.copy.title)}</b><span>${esc(g.copy.description)}</span>${showTopics && g.copy.topics ? `<span class="note">${g.copy.topics.map(esc).join(' · ')}</span>` : ''}</a>`).join('')}</div>`;
}
export function guideCards(exclude = '') {
  if (!exclude) return cardsFor(READING_GUIDES.slice(0, 4));
  const current = READING_GUIDES.find(g => g.slug === exclude);
  const candidates = [...(current.related || []).map(slug => READING_GUIDES.find(g => g.slug === slug)), ...READING_GUIDES.filter(g => g.category === current.category), ...READING_GUIDES];
  return cardsFor([...new Set(candidates)].filter(g => g && g.slug !== exclude).slice(0, 4));
}
export function guideLinks() {
  return `<section class="box-sec reading-guide-links" aria-label="${tr('운세 읽기 안내', 'Reading guidance')}"><div class="sec-head"><h2>${tr('결과가 궁금할 때 함께 읽어보세요', 'Understand your reading')}</h2><a href="/guides/">${tr('이용 가이드 전체', 'All reading guides')}</a></div>${guideCards()}</section>`;
}

function birthTime() {
  const known = buildChart({ ...EXAMPLE_INPUT }), unknown = buildChart({ ...EXAMPLE_INPUT, time: null });
  return section('input', tr('시각을 모르면 임의의 시간을 넣지 마세요', 'Keep an unknown time unknown'), [
    tr('시간을 모르는데 정오나 자시를 실제 출생 시각처럼 입력하면 존재 여부를 모르는 시주까지 해석하게 됩니다. 기록에 분 단위 시각이 있으면 그대로 입력하고, 두 시간 단위 시진만 알면 ‘시진만 알아요’를 선택하세요. 아무 정보도 없으면 ‘시간을 몰라요’를 선택합니다.', 'Entering noon or midnight as an actual birth time adds an hour pillar that may not belong to your chart. Use recorded minutes when known, choose an hour period when that is all you know, and otherwise choose Time unknown.'),
    UNKNOWN_TIME.summary, UNKNOWN_TIME.boundary,
  ]) + section('comparison', tr('같은 생일에서 무엇이 달라지는지 비교합니다', 'Compare the same birthday'), [
    tr('아래는 생년월일과 성별을 유지하고 시각만 바꿔 현재 계산 엔진을 실행한 결과입니다. 겉글자 개수는 화면에 드러난 천간·지지를 센 값입니다. 지장간과 계절 가중치가 들어가는 강약 계산과 같지 않습니다.', 'Only the birth time changes below. Visible element counts count the displayed stems and branches; they are different from strength calculations, which also use hidden stems and seasonal weights.'),
  ], inputNote(EXAMPLE_INPUT) + table(tr('출생 시각 유무에 따른 원국 비교', 'Chart with and without birth time'), [tr('항목', 'Item'), EXAMPLE_INPUT.time, tr('시간 모름', 'Time unknown')], [
    [tr('원국', 'Pillars'), known.cols.map(pillarLabel).join(' · '), unknown.cols.map(pillarLabel).join(' · ')],
    ...known.counts.map((n, i) => [elementName(i), n, unknown.counts[i]]),
    [tr('용신', 'Useful element'), elementName(known.roles.yong), elementName(unknown.roles.yong)],
  ])) + section('boundaries', tr('다른 만세력과 다르면 이 순서로 확인하세요', 'Compare calculator conventions in order'), [
    tr('첫째, 양력·음력과 윤달 여부가 같은지 확인합니다. 같은 숫자의 날짜라도 달력 종류가 다르면 다른 날입니다. 둘째, 출생 당시 시계 시각을 입력했는지 확인합니다. 사용자가 먼저 30분을 빼면 사이트의 보정과 중복될 수 있습니다.', 'First match the calendar and leap-month setting. The same written date can mean a different day. Next check that you entered the original clock time; subtracting 30 minutes yourself can apply the adjustment twice.'),
    tr('셋째, 입춘과 매월 절입 시각을 비교합니다. 이 서비스의 년주·월주는 1월 1일이나 음력 초하루에 일괄 변경되지 않습니다. 넷째, 밤의 날짜 경계를 비교합니다. 현행 한국 표준시·서머타임 미적용 기준으로 23:30부터 다음 날 일주를 적용하며, 과거 표준시·서머타임 기간은 경계가 달라집니다.', 'Then compare Ipchun and the monthly solar-term boundary. Year and month pillars do not simply change on January 1 or a lunar month’s first day. Finally compare the night boundary: under current Korean Standard Time without daylight saving, this service changes the day pillar at 23:30. Historical clock rules can shift that boundary.'),
    tr('출생지별 경도와 균시차를 적용하는 진태양시, 해외 시간대의 자동 변환은 지원하지 않습니다. 해외 출생이나 경계 부근의 출생이라면 이 결과만으로 원국을 확정하지 마세요. 서로 다른 기준의 점수를 비교해 어느 쪽이 더 정확하다고 결론 내릴 수도 없습니다.', 'Location-specific apparent solar time and automatic conversion from overseas time zones are not supported. Do not establish a chart from this result alone for overseas births or births near a boundary. Different conventions do not by themselves establish which prediction is accurate.'),
  ], `<p><a href="/manseryeok/#public-example">${tr('입춘·밤 시간 경계의 실제 원국 예시 보기', 'See worked solar-term and night-boundary examples')}</a> · <a href="/manseryeok/">${tr('내 만세력 계산하기', 'Calculate my chart')}</a></p>`);
}

function scores(ctx) {
  const c = buildChart({ ...EXAMPLE_INPUT });
  const dates = [ctx.today, addDays(ctx.today, 1)];
  const reports = dates.map((d, i) => day(c, d, i ? 'tomorrow' : 'today'));
  return section('meaning', tr('점수는 서비스의 해석 규칙을 숫자로 옮긴 값입니다', 'Scores express the service’s interpretation rules'), [
    tr('60점은 같은 조건에서 환산식의 기준 원점수에 해당합니다. 60%의 성공 확률, 상위 40%, 60%의 예측 정확도를 뜻하지 않습니다. 실제 이용자의 취업·건강·투자 성과를 학습해 보정한 통계 모델도 아닙니다.', 'A score of 60 corresponds to the reference raw value in the conversion formula. It does not mean a 60% chance of success, a percentile or prediction accuracy. The model is not calibrated on users’ employment, health or investment outcomes.'),
    tr('오늘 운세는 원국과 일진·월운·세운의 관계를 70%·20%·10%로 합칩니다. 종합 점수는 분야 원점수에 별도 가중치를 적용하므로 화면에 보이는 분야별 최종 점수의 단순 평균과 일치하지 않을 수 있습니다. 계산 순서와 환산식은 소개 페이지에 공개했습니다.', 'Daily readings combine chart relationships with the day, month and year cycles at 70%, 20% and 10%. Overall scores weight raw area values separately, so averaging the final area scores need not reproduce the overall score. The About page documents the formula.'),
  ]) + section('comparison', tr('같은 사람의 두 날짜를 나란히 읽어보세요', 'Read two dates for the same chart'), [
    tr('같은 가상 입력에서 대상 날짜만 바꾼 계산입니다. 먼저 날짜와 일진을 확인하고, 관심 있는 분야의 점수와 그 분야의 해설을 함께 읽습니다. 한 분야가 높다고 다른 분야의 주의점이 사라지지는 않습니다.', 'Only the reference date changes here. Check the date and day pillar first, then read the score and explanation for the area you care about. A higher value in one area does not cancel the cautions in another.'),
  ], inputNote(EXAMPLE_INPUT) + table(tr('가상 사례의 날짜별 운세 점수', 'Daily scores for the fictional chart'), [tr('항목', 'Item'), ...dates.map(isoDate)], [
    [tr('일진', 'Day pillar'), ...reports.map(r => pillarLabel(r.pillar))],
    [tr('종합', 'Overall'), ...reports.map(r => r.overall.score)],
    ...reports[0].cats.map((cat, i) => [esc(cat.name), ...reports.map(r => r.cats[i].score)]),
  ]) + reports.map((r, i) => `<h3>${isoDate(dates[i])}</h3><p>${esc(r.overall.text)}</p>`).join('') + `<p>${tr('예시와 같은 순서로 내 점수와 해설을 살펴보려면', 'To explore your own scores and explanations in the same order, use')} <a href="/today/">${tr('내 생년월일로 오늘의 운세 보기', 'today’s reading with my birth details')}</a>${tr('를 이용하세요. 시간을 모르면 해당 항목을 선택할 수 있습니다.', '. You can select Time unknown.')}</p>`) + section('periods', tr('오늘·주간·월간 점수가 다른 이유', 'Daily, weekly and monthly scores answer different questions'), [
    tr('주간은 월요일부터 일요일까지 일별 원점수를 합쳐 한 주를 요약합니다. 월간은 그달 15일의 대표 월운 60%, 그달 일진 평균 25%, 세운 15%를 합칩니다. 연간 화면의 월별 비교는 월운·세운을 쓰는 별도 요약이므로 월간 계산기의 값과 같을 필요가 없습니다.', 'A weekly report aggregates daily raw values from Monday through Sunday. A monthly report combines a representative month cycle on the 15th at 60%, average daily cycle values at 25% and the year cycle at 15%. The month-by-month panel inside an annual reading uses a separate month/year summary and need not match the monthly calculator.'),
    tr('기간이 다른 점수를 한 줄에 놓고 어느 날의 사건이 실제로 더 잘 풀린다고 해석하지 마세요. 일정 조율에는 일별 설명을, 한 주를 돌아볼 때는 주간 설명을 읽고, 실제 일정·예산·몸 상태를 먼저 확인하세요.', 'Do not turn scores across different periods into predictions about specific events. Use daily explanations for reflection on a day and weekly explanations to review a week, while checking actual schedules, budgets and how you feel.'),
  ], `<p><a href="/week/#public-example">${tr('이번 주의 계산 예시', 'This week’s worked example')}</a> · <a href="/month/#public-example">${tr('이달의 계산 예시', 'This month’s worked example')}</a> · <a href="/about/#limits">${tr('검증 범위와 한계', 'Validation and limitations')}</a></p>`) + section('use', tr('좋고 나쁨 대신 확인할 질문을 하나 정해보세요', 'Choose one practical question'), [
    tr('일이 바쁜 날이라면 “중요한 약속을 다시 확인할까?”, 관계가 신경 쓰이면 “서로 기대하는 답장 속도를 이야기할까?”처럼 실제로 확인할 질문으로 바꿔보세요. 점수가 낮다는 이유로 중요한 진료나 약속을 미루거나, 점수가 높다는 이유로 투자 규모를 늘리는 근거로 사용하지 않습니다.', 'Turn a reading into something you can actually check: confirm an appointment or discuss how quickly you each expect a reply. A score is not a reason to delay healthcare or an important commitment, or to increase an investment.'),
  ]);
}

function compatibility(ctx) {
  const a = buildChart({ ...DEEP_EXAMPLE_INPUT }), b = buildChart({ ...PARTNER_EXAMPLE_INPUT });
  const r = compat(a, b, ctx.today), u = compat(buildChart({ ...DEEP_EXAMPLE_INPUT, time: null }), b, ctx.today);
  return section('scope', tr('띠와 일주, 전체 사주는 비교 범위가 다릅니다', 'Zodiac, day pillar and full chart have different scopes'), [
    tr('띠 궁합은 출생 연도의 지지 한 글자끼리 비교합니다. 일주 궁합은 일간과 일지를 중심으로 전통적인 합·충 관계를 봅니다. 전체 사주 궁합은 두 원국의 더 많은 글자와 오행 보완 관계를 함께 사용합니다. 정보를 더 쓴다는 사실이 실제 관계의 예측력이 검증됐다는 뜻은 아닙니다.', 'Zodiac comparisons use one birth-year branch per person. Day-pillar comparisons focus on the Day Masters and day branches. Full-chart compatibility uses more pillars and element relationships. Using more inputs does not establish predictive accuracy for a real relationship.'),
    tr('천간합이나 육합이 있다고 천생연분을 확정할 수 없고, 충이 있다고 헤어질 운명이라고 할 수 없습니다. 경제 상황, 가치관, 생활 습관, 갈등을 다루는 방식은 생년월일만으로 알 수 없습니다.', 'A stem or branch combination cannot establish a soulmate, and a clash cannot establish an inevitable separation. Birth details do not reveal a couple’s finances, values, habits or conflict-resolution skills.'),
  ]) + section('example', tr('한 사람의 시각만 바꿔 계산해 봅니다', 'Change only one person’s birth time'), [
    tr('두 가상 인물의 입력을 유지하고 첫 번째 인물만 시간 모름으로 바꿨습니다. 결과가 달라지면 무엇이 제외됐는지 먼저 확인해야 합니다. 더 마음에 드는 점수가 나오는 시간을 골라 넣으면 서로 다른 조건을 같은 결과처럼 비교하게 됩니다.', 'Keep both fictional birthdays fixed and change only the first person to Time unknown. Check which information was excluded before interpreting the difference. Selecting a time because it produces a preferred score would compare different conditions.'),
  ], inputNote(DEEP_EXAMPLE_INPUT) + inputNote(PARTNER_EXAMPLE_INPUT) + table(tr('가상 인물 두 사람의 궁합 비교', 'Compatibility for the fictional pair'), [tr('항목', 'Item'), tr('두 사람 모두 시간 입력', 'Both times known'), tr('첫 번째 인물 시간 모름', 'First time unknown')], [
    [tr('종합 궁합', 'Overall compatibility'), r.total, u.total],
    ...r.cats.map((cat, i) => [esc(cat.name), cat.score, u.cats[i].score]),
  ])) + section('conversation', tr('분야별 차이를 대화의 출발점으로 씁니다', 'Use each area to start a conversation'), [
    tr('소통 분야가 신경 쓰이면 “갈등이 생겼을 때 바로 이야기할지, 생각할 시간을 둘지”를 묻습니다. 생활이나 금전 분야가 궁금하면 공동 지출 범위, 집안일 분담, 혼자 쉬는 시간을 구체적으로 이야기해 보세요. 점수가 설명하지 못하는 실제 차이를 확인하는 과정입니다.', 'For communication, ask whether each person prefers to talk immediately after a disagreement or take time first. For everyday life and money, discuss shared spending, chores and time alone. These conversations reveal differences the scores cannot establish.'),
    tr('상대가 원하지 않으면 출생 정보 입력이나 결과 공유를 요구하지 마세요. 공유 전에 이름과 표시되는 내용을 확인하고, 점수로 상대의 성격이나 관계의 가치를 평가하지 않습니다.', 'Do not pressure a partner to enter birth details or share a result. Check the name and visible content before sharing, and do not use a score to grade a person or the value of a relationship.'),
  ], `<p><a href="/compatibility/">${tr('두 사람의 궁합 직접 보기', 'Explore compatibility')}</a> · <a href="/compatibility/#public-example">${tr('더 자세한 원국·계산 예시', 'Detailed chart and calculation example')}</a></p>`);
}

function tojeong(ctx) {
  const targetYear = ctx.today.y + 1;
  const t = calculateTojeong(EXAMPLE_INPUT, targetYear), r = year(buildChart({ ...EXAMPLE_INPUT }), targetYear, 'next');
  const { age, taese, monthDays, wolgeon, birthDay, iljin } = t.values;
  return section('difference', tr('같은 생일이어도 서로 다른 계산입니다', 'The same birthday enters two different calculations'), [
    tr('사주 신년운세는 생년월일시와 성별로 원국·대운을 세우고 대상 연도의 세운과 비교합니다. 토정비결은 음력 출생 연도·생월·생일과 대상 연도의 수를 사용해 상괘·중괘·하괘를 정합니다. 이 사이트의 토정비결에는 생시와 성별이 필요하지 않습니다.', 'Annual saju uses birth date, time and gender to form the chart and major cycles, then compares them with the target year. Tojeong derives an upper, middle and lower number from lunar birth details and the target year. This site’s Tojeong calculator does not use birth time or gender.'),
  ], inputNote(EXAMPLE_INPUT) + table(tr('같은 가상 생일의 두 결과', 'Two results for the same fictional birthday'), [tr('항목', 'Item'), tr('토정비결', 'Tojeong'), tr('사주 신년운세', 'Annual saju')], [
    [tr('대상 연도', 'Target year'), targetYear, targetYear],
    [tr('결과 형식', 'Result'), `${tr('괘', 'Code')} ${t.code}`, `${r.overall.score}${tr('점', ' points')}`],
    [tr('월별 구분', 'Months'), tr('음력 1~12월', 'Lunar months 1–12'), tr('양력 월별 대표 월운', 'Representative cycles for solar months')],
  ])) + section('calculation', tr('괘 번호를 정하는 과정을 확인합니다', 'Follow the code calculation'), [
    tr(`예시의 음력 생일은 ${isoDate(t.birth.lunar)}입니다. 상괘는 (세는나이 ${age} + 태세수 ${taese})를 8로 나눈 나머지, 중괘는 (생월 일수 ${monthDays} + 월건수 ${wolgeon})를 6으로 나눈 나머지, 하괘는 (적용 생일 ${birthDay} + 일진수 ${iljin})를 3으로 나눈 나머지입니다. 나머지가 0이면 각각 8·6·3으로 바꿉니다.`, `The example’s lunar birthday is ${isoDate(t.birth.lunar)}. Upper: (${age} counting age + ${taese} year number) modulo 8. Middle: (${monthDays} days in the birth month + ${wolgeon} month number) modulo 6. Lower: (${birthDay} effective birthday + ${iljin} day number) modulo 3. A zero remainder becomes 8, 6 or 3 respectively.`),
    tr(`이 계산으로 ${t.upper}·${t.middle}·${t.lower}, 즉 ${t.code}괘를 얻습니다. 괘 번호는 점수나 등급이 아니라 해설을 찾는 식별자입니다. 숫자가 크다고 더 좋은 해가 되는 것은 아닙니다.`, `This gives ${t.upper}, ${t.middle} and ${t.lower}: code ${t.code}. It identifies a reading rather than a score or rank. A larger code does not mean a better year.`),
  ]) + section('calendar', tr('음력·윤달과 판본을 먼저 확인하세요', 'Check lunar dates and edition conventions'), [
    tr('양력 입력은 먼저 한국 음력으로 변환합니다. 윤달 출생은 이 서비스의 작괘 단계에서 같은 월 번호의 평달로 적용하고, 대상 연도에 생일 30일이 없으면 29일을 적용합니다. 결과 화면에 보정 여부를 표시합니다. 다른 판본이나 서비스가 다른 규칙을 쓰면 괘가 달라질 수 있습니다.', 'Solar inputs are converted to the Korean lunar calendar first. In this service’s code calculation, a leap-month birthday uses the regular month with the same number. If day 30 is unavailable in the target year, day 29 is used and the result shows the adjustment. Other editions can follow different conventions.'),
    tr('해설은 molpass/mcp-tojeong의 MIT 공개 한글 판본을 사용하고, 사이트에서 작괘 과정과 읽는 방법을 덧붙였습니다. 이지함의 친필 원문이나 유일한 정본이라고 주장하지 않습니다. 사주 점수와 토정비결 문장이 다르게 보이더라도 한쪽이 실제 미래를 입증한 것은 아닙니다.', 'The Korean readings use the MIT-licensed molpass/mcp-tojeong edition, with this site’s calculation explanation and reading guidance. We do not present it as Yi Ji-ham’s autograph text or a unique authoritative edition. A difference from a saju score does not validate either as a prediction.'),
  ], `<p>${tr('역사·작괘 방식 참고:', 'Historical and calculation reference:')} <a href="https://encykorea.aks.ac.kr/Article/E0059207" rel="noopener" target="_blank">${tr('한국민족문화대백과사전 · 토정비결', 'Encyclopedia of Korean Culture · Tojeong Bigyeol')}</a></p><p><a href="/tojeong/">${tr('내 토정비결 계산하기', 'Calculate my Tojeong reading')}</a> · <a href="/year/${targetYear}/">${tr(`${targetYear}년 사주 신년운세`, `${targetYear} annual saju`)}</a> · <a href="/about/#tojeong">${tr('판본과 계산 기준', 'Edition and calculation conventions')}</a></p>`);
}

export function guidesHub(ctx) {
  const title = tr('운세 이용 가이드', 'Reading guides');
  return {
    path: '/guides/', title, description: tr('사주·만세력 읽기부터 달력·출생 시각, 오행·십신·용신·대운, 직업·재물·관계까지 질문별 가이드와 실제 계산 예시를 모았습니다.', 'Question-led guides to chart reading, birth dates and times, elements, Ten Gods, useful elements, major cycles, work, money and relationships, with calculated examples.'),
    section: '/guides/', crumbs: [[title, '/guides/']],
    ld: [{ '@type': 'ItemList', name: title, numberOfItems: READING_GUIDES.length, itemListElement: READING_GUIDES.map((g, i) => ({ '@type': 'ListItem', position: i + 1, name: g.copy.title, url: `${ctx.site}/guides/${g.slug}/` })) }],
    body: `${hero(title, tr('만세력의 글자가 낯설거나 결과마다 설명이 다를 때, 지금 궁금한 질문부터 찾아보세요. 계산 규칙과 전통 해석을 구별하고, 실제 생활에서 확인할 내용까지 정리했습니다.', 'Find the question you have about a chart or conflicting readings. Each guide separates calculation rules from traditional interpretation and explains what to check in practice.'))}<nav class="guide-tool-nav" aria-label="${tr('운세 서비스로 이동', 'Explore fortune services')}"><a href="/">${tr('무료운세 전체', 'All free fortunes')}</a> · <a href="/today/">${tr('오늘의 운세', 'Today’s fortune')}</a></nav><nav class="box guide-category-nav" aria-label="${tr('가이드 주제', 'Guide topics')}"><b>${tr(`주제 전체 목록 · ${READING_GUIDES.length}편`, `Complete topic index · ${READING_GUIDES.length} guides`)}</b><ul>${GUIDE_CATEGORIES.map(c => `<li><a href="#category-${c.id}">${esc(c.copy.title)}</a></li>`).join('')}</ul></nav>${GUIDE_CATEGORIES.map(c => `<section class="box-sec" id="category-${c.id}" aria-labelledby="category-title-${c.id}"><h2 id="category-title-${c.id}">${esc(c.copy.title)}</h2>${cardsFor(READING_GUIDES.filter(g => g.category === c.id), true)}</section>`).join('')}<section class="prose"><h2>${tr('개별 용어와 내 결과로 이어서 보기', 'Continue to terminology and your own chart')}</h2><p><a href="/saju/">${tr('60일주·10일간·십신·오행·신살 백과', 'Day pillars, Day Masters, Ten Gods, elements and special stars')}</a> · <a href="/saju/guide/">${tr('사주 보는 법 7단계', 'Seven steps to read a chart')}</a> · <a href="/manseryeok/">${tr('내 만세력 계산하기', 'Calculate my chart')}</a></p><p class="note"><a href="/editorial/">${tr('콘텐츠 작성·출처 기준', 'Editorial and source policy')}</a> · <a href="/contact/">${tr('오류·빠진 설명 제보', 'Report an error or missing explanation')}</a></p></section>`,
  };
}
export function readingGuide(slug, ctx) {
  const g = READING_GUIDES.find(g => g.slug === slug);
  if (!g) throw new Error(`Unknown reading guide: ${slug}`);
  const legacy = { 'birth-time': birthTime, 'fortune-scores': scores, compatibility, tojeong }[slug];
  const body = legacy ? legacy(ctx) : guideArticleBody(g);
  const path = `/guides/${slug}/`;
  const modified = contentModified(path);
  return {
    path, title: g.copy.title, description: g.copy.description, section: '/guides/', ogType: 'article', published: g.published,
    crumbs: [[tr('운세 이용 가이드', 'Reading guides'), '/guides/'], [g.copy.title, path]],
    ld: [{ '@type': 'Article', headline: g.copy.title, description: g.copy.description, datePublished: g.published, dateModified: modified, inLanguage: ctx.lang === 'en' ? 'en' : 'ko-KR', author: { '@type': 'Organization', name: PUBLISHER.name }, publisher: { '@id': `${ctx.site}/#org` }, mainEntityOfPage: { '@id': `${ctx.site}${path}#webpage` } }],
    body: `<article class="article reading-guide">${hero(g.copy.title, g.copy.lead, tr('운세 이용 가이드', 'Reading guides'))}<p class="updated">${esc(PUBLISHER.name)} · ${tr('내용 수정', 'Edited')} <time datetime="${modified}">${modified}</time></p><p class="note">${tr('전통 명리와 이 서비스의 계산·해석 범위를 설명합니다. 가상 예시는 실제 경험·상담이나 예측 적중 사례가 아닙니다.', 'This explains traditional saju and this service’s calculation and interpretation scope. Fictional examples are not consultations or evidence of prediction accuracy.')}</p>${body}<section class="prose"><h2>${tr('작성 근거와 다음 확인', 'Sources and next steps')}</h2><p>${tr('계산 예시는 이 사이트의 엔진과 공개된 계산 규칙을 기준으로 작성했습니다. 전통 용어의 해석과 날짜 계산의 재현성을 미래 예측력의 검증과 구분합니다.', 'Examples use this site’s engine and published calculation rules. Reproducible date calculations and interpretations of traditional terminology are distinct from evidence of predictive accuracy.')}</p><p><a href="/about/">${tr('계산 규칙·사용 자료', 'Calculation rules and data')}</a> · <a href="/editorial/">${tr('편집·출처 정책', 'Editorial and source policy')}</a> · <a href="/contact/">${tr('오류 제보', 'Report a correction')}</a></p></section></article><section class="box-sec"><h2>${tr('함께 읽을 가이드', 'Related guides')}</h2>${guideCards(slug)}</section>`,
  };
}

export function periodExample(mode, date) {
  const c = buildChart({ ...EXAMPLE_INPUT });
  const r = mode === 'week' ? week(c, date) : month(c, date.y, date.m);
  const rows = r.days.map(d => [isoDate(d.date), pillarLabel(d.pillar), d.score]);
  return `<section class="card box public-example" id="public-example" aria-labelledby="example-title" data-example-date="${isoDate(date)}"><p class="eyebrow">${tr('실제 엔진으로 계산한 가상 사례', 'Fictional case calculated by the current engine')}</p><h2 id="example-title">${mode === 'week' ? tr('이번 주 운세 계산 예시', 'Weekly worked example') : tr('이달의 운세 계산 예시', 'Monthly worked example')}</h2>${inputNote(EXAMPLE_INPUT)}<p>${esc(r.label)} · ${tr('종합', 'Overall')} <b data-example-overall>${r.overall.score}</b>${tr('점', ' points')}</p><p>${esc(r.overall.text)}</p>${table(tr('같은 입력의 날짜별 점수', 'Daily scores for the same chart'), [tr('날짜', 'Date'), tr('일진', 'Day pillar'), tr('점수', 'Score')], rows)}<h3>${tr('읽는 방법과 한계', 'How to read this and its limits')}</h3><p>${mode === 'week' ? tr('월요일부터 일요일까지 일별 원점수를 합쳐 주간 점수를 계산합니다. 표의 최종 일별 점수를 단순 평균한 값과는 다를 수 있습니다.', 'Weekly scores aggregate raw daily values from Monday to Sunday. They can differ from the simple average of the final daily scores in this table.') : tr('그달 15일의 대표 월운 60%, 그달 일진 평균 25%, 세운 15%를 반영합니다. 표는 날짜별 일간 점수이므로 표의 평균과 월간 종합 점수는 계산 조건이 다릅니다.', 'Monthly scores use the representative month cycle on the 15th at 60%, average daily cycle values at 25% and the year cycle at 15%. The table shows daily report scores, so its average uses different conditions from the monthly overall score.')}</p><p>${tr('이 숫자는 서비스 규칙의 환산값이며 사건의 성공 확률이 아닙니다. 같은 날짜라도 출생 정보가 다르면 결과가 달라질 수 있습니다.', 'These values express this service’s rules, not the probability of success. Different birth details can produce different results for the same date.')}</p><p><a href="/guides/fortune-scores/">${tr('점수와 기간 차이를 자세히 읽기', 'Understand scores and period differences')}</a> · <a href="#tool">${tr('내 정보로 직접 이용하기', 'Try my own details')}</a></p></section>`;
}
