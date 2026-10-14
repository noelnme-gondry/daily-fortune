import T from '../content/text.js';
import { ELEMENT_PRACTICE, REPAIR_ACTION } from '../content/rank-advice.js';
import { rankScore, rankReasons, RANK_CATS } from './rank.js';

export function rankGuidance(chart, rank) {
  const supports = [['용신', chart.roles.yong], ['희신', chart.roles.hee]].map(([role, element]) => ({
    role, element, name: T.element[element].name, colors: T.element[element].color,
    direction: T.element[element].dir, ...ELEMENT_PRACTICE[element],
  }));
  const repairs = rank.reasons.filter((r) => r.pts < 0).sort((a, b) => a.pts - b.pts).map((r) => {
    const [title, action, caution] = REPAIR_ACTION[r.key];
    return { ...r, title, action: r.key === 'center'
      ? chart.strong ? '역할을 나누고 내 의견을 말하기 전에 상대의 의견을 한 번 더 들어 보세요.' : '혼자 떠안을 일을 줄이고 도움받을 사람과 휴식 시간을 먼저 정하세요.'
      : action, caution };
  });
  const gi = chart.roles.gi;
  return { supports, repairs, caution: { name: T.element[gi].name, text: ELEMENT_PRACTICE[gi].caution } };
}

export function rankHighlights(chart, average) {
  const score = rankScore(chart);
  const reasons = rankReasons(score, average);
  return {
    strengths: reasons.filter((r) => r.pts > 0).sort((a, b) => b.pts - a.pts).slice(0, 2),
    weaknesses: reasons.filter((r) => r.pts < 0).sort((a, b) => a.pts - b.pts).slice(0, 2),
    weakest: RANK_CATS.map(([key, name]) => ({ key, name, score: score.cats[key] })).sort((a, b) => a.score - b.score)[0],
  };
}
