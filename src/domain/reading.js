import { hash, toUTC, DAY_MS } from '../engine/core.js';
import { tr } from '../i18n/runtime.js';
import { READING_ACTIONS, SHORT_READING_LABELS, ZODIAC_RELATION, ELEMENT_THEME } from '../content/reading-actions.js';
import { READING_HEADLINES } from '../content/reading-headlines.js';
import { zodiacOutlook } from './zodiac-outlook.js';

const localized = (pair) => tr(...pair);
const FACTOR_THEME = {
  비견: 'peer', 겁재: 'peer', 식신: 'expression', 상관: 'expression', 편재: 'wealth', 정재: 'wealth',
  편관: 'duty', 정관: 'duty', 편인: 'learning', 정인: 'learning',
  귀인: 'peer', 도화: 'expression', 홍란: 'peer', 문창: 'learning', 화개: 'learning', 역마: 'change', 양인: 'change',
};
export function factorTheme(factor = '') {
  if (FACTOR_THEME[factor]) return FACTOR_THEME[factor];
  if (/충|형|원진|해|파/.test(factor)) return 'change';
  if (/합/.test(factor)) return 'peer';
  return null;
}

export const readingCycle = (date, kind = 'day') => Math.floor(toUTC(date) / DAY_MS / (kind === 'week' ? 7 : 1));

export function dayChangeText(score, previous) {
  const delta = score - previous;
  if (delta === 0) return tr(`전날과 같은 ${score}점입니다.`, `The score is unchanged from the previous day at ${score}.`);
  return tr(`전날보다 ${Math.abs(delta)}점 ${delta > 0 ? '높은' : '낮은'} ${score}점입니다.`, `The score is ${score}, ${Math.abs(delta)} points ${delta > 0 ? 'higher' : 'lower'} than the previous day.`);
}

export const readingHeadline = (title, rhythm = 'day') => `${localized(SHORT_READING_LABELS[rhythm])} · ${title}`;

// 공유 페이지의 허용 목록도 표시 문구의 같은 원본에서 파생한다.
export function readingHeadlines(kind) {
  const rhythms = kind === 'week' ? Object.keys(SHORT_READING_LABELS).filter((key) => key !== 'day')
    : kind === 'today' || kind === 'tomorrow' ? ['day'] : [];
  const actions = Object.values(READING_ACTIONS).flat();
  const titles = Object.values(READING_HEADLINES).flat(2).map(localized);
  return [
    // 기존에 발급한 공유 링크의 짧은 주제명도 계속 인식한다.
    ...rhythms.flatMap((rhythm) => actions.map((row) => readingHeadline(localized(row[2]), rhythm))),
    ...rhythms.flatMap((rhythm) => titles.map((title) => rhythm === 'day' ? title : readingHeadline(title, rhythm))),
  ];
}

// 날짜·주차의 순번으로 후보를 순환한다. 조회 이력이나 난수에 의존하지 않는다.
// 한국어·영어는 같은 id를 선택하며, 문구 선택이 점수 계산에 들어가지 않는다.
export function readingAction(cat, score, { factor, cycle = 0, identity = '', offset = 0, headlineOffset = 0 } = {}) {
  const all = READING_ACTIONS[cat];
  const theme = factorTheme(factor);
  const matching = theme ? all.filter((row) => row[1].includes(theme)) : all;
  const candidates = matching.length ? matching : all;
  // 12지·60갑자 주기와 2/6개 문구의 순환이 겹쳐 같은 장면에 고정되는 것을 방지한다.
  const rotation = cycle + Math.floor(cycle / 12);
  const position = hash(`${identity}|${cat}|${factor || ''}`) + rotation + offset;
  const index = ((position % candidates.length) + candidates.length) % candidates.length;
  const [id, , title, active, careful] = candidates[index];
  const actionId = `${cat}-${id}`;
  const titles = READING_HEADLINES[actionId][score >= 60 ? 0 : 1];
  // 주제가 한 바퀴 돈 다음 제목의 상황을 바꿔, 같은 나머지 연산에 고정되지 않게 한다.
  const turn = Math.floor(position / candidates.length) + headlineOffset;
  const variant = ((turn % titles.length) + titles.length) % titles.length;
  return { id: actionId, title: localized(title), headline: localized(titles[variant]), text: localized(score >= 60 ? active : careful) };
}

export function weekRhythm(days, catIndex = null) {
  if (days.length !== 7) throw new RangeError('A weekly reading requires seven days');
  const scores = days.map((d) => catIndex === null ? d.score : d.cats[catIndex]);
  if (!scores.every(Number.isFinite)) throw new RangeError('Weekly scores must be finite');
  const high = Math.max(...scores), low = Math.min(...scores);
  const early = (scores[0] + scores[1] + scores[2]) / 3;
  const late = (scores[4] + scores[5] + scores[6]) / 3;
  const kind = high - low < 8 ? 'steady' : late - early >= 6 ? 'rising' : early - late >= 6 ? 'falling' : 'mixed';
  const copy = {
    steady: ['요일별 점수 차이가 작은 편입니다.', 'The daily scores are relatively close.'],
    rising: ['월~수요일보다 금~일요일의 평균 점수가 높습니다.', 'The average score is higher on Friday–Sunday than on Monday–Wednesday.'],
    falling: ['금~일요일보다 월~수요일의 평균 점수가 높습니다.', 'The average score is higher on Monday–Wednesday than on Friday–Sunday.'],
    mixed: ['주초·주말의 방향보다 개별 요일의 강약을 살펴보세요.', 'Look at individual stronger and weaker days rather than an early-to-late trend.'],
  };
  const best = days.filter((_, i) => scores[i] === high), quiet = days.filter((_, i) => scores[i] === low);
  const names = (rows) => rows.map((d) => tr(`${d.label}요일`, d.label)).join(tr('·', ', '));
  const timing = high === low
    ? tr(`모든 요일이 ${high}점으로 같아 특정 요일을 더 좋다고 구분하지 않습니다.`, `Every day scores ${high}; no particular day ranks above the others.`)
    : tr(`최고점은 ${names(best)}(${high}점), 최저점은 ${names(quiet)}(${low}점)입니다.`, `The highest score is on ${names(best)} (${high}), and the lowest on ${names(quiet)} (${low}).`);
  return { kind, high, low, best, quiet, label: localized(SHORT_READING_LABELS[kind]), text: `${localized(copy[kind])} ${timing}` };
}

export function zodiacFocus(rel, e, es) {
  if (rel === '충' || rel === '파') return 'move';
  if (rel === '형') return 'career';
  if (['합', '삼합', '원진', '해', '같음'].includes(rel)) return 'social';
  // 특별한 합충이 없으면 일지 오행을 중심에 두되, 같은 오행일 때는 천간도 살핀다.
  return ['social', 'career', 'money', 'career', 'study'][e === 0 ? es ?? e : e];
}

export const zodiacRelationText = (rel) => localized(ZODIAC_RELATION[rel]);
export function zodiacElementText(e, es) {
  if (es === undefined) return tr(`지지의 오행은 ${localized(ELEMENT_THEME[e])}에 초점을 둡니다.`, `The branch element emphasizes ${localized(ELEMENT_THEME[e])}.`);
  const branch = localized(ELEMENT_THEME[e]), stem = localized(ELEMENT_THEME[es]);
  return e === es
    ? tr(`천간과 지지의 오행은 모두 ${branch}에 초점을 둡니다.`, `Both stem and branch elements emphasize ${branch}.`)
    : tr(`지지의 오행은 ${branch}, 천간의 오행은 ${stem}을 함께 살피게 합니다.`, `The branch element emphasizes ${branch}, alongside ${stem} from the stem element.`);
}

export function zodiacReading({ rel, e, es, score, cycle, offset = 0, headlineOffset = 0, identity = '' }) {
  const focus = zodiacFocus(rel, e, es);
  const action = readingAction(focus, score, { cycle, offset, headlineOffset, identity });
  const { outlook, caution } = zodiacOutlook({ rel, e, es, score });
  return { ...action, outlook, advice: action.text, caution, text: `${outlook} ${action.text} ${caution}` };
}
