import { analyze, buildChart } from '../engine/chart.js';
import { allPillars } from '../engine/rank.js';
import { findBirthExamples } from '../engine/rank-examples.js';
import { compatScores, compatReasons, COMPAT_CATEGORIES } from '../engine/compat.js';
import { yearPillar } from '../engine/calendar.js';
import { toUTC } from '../engine/core.js';
import { RANKING_LIMIT } from './ranking-list.js';

export function matchYearRange(birthYear, today) {
  return { from: Math.max(1930, birthYear - 10), to: Math.min(today.y, birthYear + 10) };
}

export function ageAt(birth, today) {
  return today.y - birth.y - (today.m < birth.m || (today.m === birth.m && today.d < birth.d) ? 1 : 0);
}

// 모든 후보를 점수순으로 검토한 뒤 실제 입력으로 재현되는 출생일·시진만 채택한다.
// 시기는 양력 출생연도 ±10년, 성별은 폼에서 입력한 다른 사람의 성별을 따른다.
// 역산에 실패한 원국을 가짜 생년월일로 채우거나 일부 표본을 전체 순위로 표시하지 않는다.
export function findCompatMatches(baseInput, candidateGender, today, onProgress = () => {}) {
  const base = buildChart(baseInput);
  const range = matchYearRange(base.birth.y, today);
  const yearKeys = new Set();
  for (let y = range.from - 1; y <= range.to; y++) {
    const p = yearPillar(y);
    yearKeys.add(`${p.s}:${p.b}`);
  }
  const candidates = [];
  let scanned = 0;
  const count = yearKeys.size * 12 * 60 * 12;
  for (const pillars of allPillars(true)) {
    if (!yearKeys.has(`${pillars.year.s}:${pillars.year.b}`)) continue;
    const { total, cats } = compatScores(base, analyze(pillars, candidateGender));
    candidates.push({ pillars, scores: { total, ...Object.fromEntries(cats.map((c) => [c.key, c.score])) }, order: scanned++ });
    if (scanned % 10000 === 0) onProgress({ phase: 'score', done: scanned, count });
  }
  const verified = new Map();
  const details = new Map();
  const rankings = {};
  const end = toUTC(today);
  for (const [key] of COMPAT_CATEGORIES) {
    onProgress({ phase: 'verify', category: key });
    candidates.sort((a, b) => b.scores[key] - a.scores[key] || b.scores.total - a.scores.total || a.order - b.order);
    const rows = [];
    for (const candidate of candidates) {
      if (!verified.has(candidate.order)) {
        const input = findBirthExamples(candidate.pillars, range.from).find((p) => p.y >= range.from && p.y <= range.to && toUTC(p) <= end);
        verified.set(candidate.order, input ? { ...input, gender: candidateGender } : null);
      }
      const input = verified.get(candidate.order);
      if (!input) continue;
      if (!details.has(candidate.order)) {
        const chart = buildChart(input);
        const actual = compatScores(base, chart);
        const scores = { total: actual.total, ...Object.fromEntries(actual.cats.map((c) => [c.key, c.score])) };
        details.set(candidate.order, { input, pillars: chart.pillars, age: ageAt(chart.birth, today), timeLabel: chart.timeLabel, scores, reasons: compatReasons(base, chart) });
      }
      const detail = details.get(candidate.order);
      const { scores } = detail;
      const rank = rows.length && rows.at(-1).score === scores[key] ? rows.at(-1).rank : rows.length + 1;
      rows.push({ ...detail, score: scores[key], rank });
      if (rows.length === RANKING_LIMIT) break;
    }
    rankings[key] = rows;
  }
  return { range, baseBirth: base.birth, baseHasTime: base.hasTime, candidateGender, today, rankings };
}
