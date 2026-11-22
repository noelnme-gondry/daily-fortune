import { DAILY_OUTLOOK, DAILY_OVERVIEW, DAILY_FACTOR_OUTLOOK, CAREER_FOLLOW_THROUGH } from '../content/daily-outlook.js';
import { DAILY_ACTION_ALTERNATIVES, DAILY_SCENES } from '../content/daily-scenes.js';
import { READING_ACTIONS } from '../content/reading-actions.js';
import { factorTheme } from './reading.js';
import { hash } from '../engine/core.js';
import { isEnglish, tr } from '../i18n/runtime.js';

export const dailyOverview = (band) => tr(...DAILY_OVERVIEW[band]);

const practices = Object.fromEntries(Object.entries(DAILY_ACTION_ALTERNATIVES).map(([topic, rows]) =>
  [topic, rows.map(row => [...row, topic])]));
const workFactors = {
  월지충: ['익숙한 순서가 바뀌면 첫걸음이 더딜 수 있어요. 함께 하는 일이 있다면 오늘 먼저 할 것 하나만 정해 보세요.',
    'A change in routine can slow the first step. If you are doing something together, agree on one thing to start with.', 'agree-first-step'],
  월지형: ['같은 일을 두고도 어디까지 해야 끝인지 생각이 다를 수 있어요. “이 정도면 된 걸까?” 하고 먼저 맞춰 보세요.',
    'People can picture different finish lines for the same task. If that happens, ask what would count as finished.', 'narrow-finish-line'],
};

export function personalPractices(cat, factor, topic, cycle, identity) {
  const primary = practices[topic];
  const offset = hash(identity + '|' + cycle + '|' + topic) % primary.length;
  const choices = [...primary.slice(offset), ...primary.slice(0, offset)];
  if (cat === 'career' && workFactors[factor]) choices.unshift([...workFactors[factor], topic]);
  const theme = factorTheme(factor);
  const related = [], otherTopics = [];
  for (const [id, themes] of READING_ACTIONS[cat]) {
    const other = cat + '-' + id;
    if (other === topic) continue;
    const pool = !theme || themes.includes(theme) ? related : otherTopics;
    pool.push(...practices[other]);
  }
  return [...choices, ...related, ...otherTopics];
}

// 해석과 활용 예시를 구분한다. 요인·전날 대비는 엔진이 계산한 값을 그대로 받는다.
export function dailyReading(cat, band, { action, basis, change, cycle, identity, main, counter }) {
  const [outlook, bandOpportunity, bandCaution] = DAILY_OUTLOOK[cat][band].map(pair => tr(...pair));
  // Every fourth date uses the actual score band. Only the other dates
  // advance the scene sequence, including across month and year boundaries.
  const scenes = DAILY_SCENES[cat];
  const dateIndex = cycle + hash(identity + '|' + cat);
  const group = Math.floor(dateIndex / 4);
  const dayInGroup = dateIndex - 4 * group;
  const sceneIndex = group * 3 + dayInGroup;
  const scene = Number.isInteger(cycle) && dayInGroup < 3
    ? scenes[((sceneIndex % scenes.length) + scenes.length) % scenes.length] : null;
  const opportunity = scene ? tr(scene[0], scene[1]) : bandOpportunity;
  const caution = scene ? tr(scene[2], scene[3]) : bandCaution;
  const phrase = factor => factor && DAILY_FACTOR_OUTLOOK[cat]?.[factorTheme(factor[0])]?.[factor[1] > 0 ? 0 : 1];
  const first = phrase(main), other = phrase(counter);
  let personal = first;
  if (first && other && first !== other) {
    personal += (counter[1] < 0 ? ' 다만 ' : ' 그래도 ') + other;
  } else if (first && cat === 'career') {
    personal += ' ' + CAREER_FOLLOW_THROUGH[factorTheme(main[0])][main[1] > 0 ? 0 : 1];
  }
  const reading = { outlook: isEnglish() ? basis || outlook : personal || outlook, opportunity, caution, action,
    basis: basis || tr('이 분야의 개별 일진 요인 해설은 제공되지 않습니다. 점수는 일진·월운·세운을 함께 반영한 값입니다.', 'No individual day-pillar factor explanation is available for this area. The score combines the day, month and year cycles.'),
    change,
  };
  return { ...reading, text: [...new Set(Object.values(reading).filter(Boolean))].join(' ') };
}
