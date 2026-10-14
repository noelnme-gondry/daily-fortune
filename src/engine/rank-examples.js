// 역산 후보는 반드시 사이트의 출생 입력 경로로 재계산해 확인한다.
import { Solar } from './calendar.js';
import { buildChart } from './chart.js';
import { pillarH } from './core.js';

export function matchingPillars(a, b) {
  return ['year', 'month', 'day', 'hour'].every((key) => a[key] && b[key]
    ? a[key].s === b[key].s && a[key].b === b[key].b : !a[key] && !b[key]);
}

export function findBirthExamples(pillars, from = 1930) {
  // 시간 모름 입력은 buildChart에서 정오를 사용한다. 자시로 역산하면 절입일의 원국이 누락된다.
  const hour = pillars.hour || { s: ((pillars.day.s % 5) * 2 + 6) % 10, b: 6 };
  const candidates = Solar.fromBaZi(...['year', 'month', 'day'].map((key) => pillarH(pillars[key])), pillarH(hour), 1, from);
  const examples = [];
  for (const solar of candidates) {
    const input = { y: solar.getYear(), m: solar.getMonth(), d: solar.getDay(), calendar: 'solar', gender: 'M',
      ...(pillars.hour ? { timeBranch: String(hour.b) } : { time: null }) };
    if (matchingPillars(pillars, buildChart(input).pillars)) examples.push(input);
  }
  return examples.sort((a, b) => b.y - a.y || b.m - a.m || b.d - a.d).slice(0, 2);
}
