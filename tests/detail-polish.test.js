import test from 'node:test';
import assert from 'node:assert/strict';
import LEADERS from '../src/content/rank-leaders.js';
import TABLE from '../src/content/rank-table.js';
import T from '../src/content/text.js';
import { buildChart, analyze } from '../src/engine/chart.js';
import { rankScore, sajuRank, PARTS } from '../src/engine/rank.js';
import { findBirthExamples, matchingPillars } from '../src/engine/rank-examples.js';
import { rankGuidance, rankHighlights } from '../src/engine/rank-guidance.js';
import { resolveBirthTime } from '../src/domain/birth-time.js';
import { utcOffset } from '../src/engine/calendar.js';

test('상위 60개 표시 항목의 출생 예시는 실제 입력으로 원국·점수를 재현한다', () => {
  for (const [kind, categories] of Object.entries(LEADERS)) for (const [category, rows] of Object.entries(categories)) {
    for (const row of rows) {
      assert.ok(row.examples.length > 0);
      for (const input of row.examples) {
        const chart = buildChart(input);
        assert.ok(matchingPillars(row.pillars, chart.pillars));
        assert.ok(input.y >= 1930);
        assert.equal(!!chart.pillars.hour, kind === 'four');
        if (input.timeBranch) assert.ok(resolveBirthTime(input.timeBranch, utcOffset(input).off));
        const score = rankScore(chart);
        assert.equal(category === 'total' ? score.total : score.cats[category], row.score);
        assert.equal(rankScore(buildChart({ ...input, gender: 'F' })).total, row.total);
      }
    }
  }
});

test('날짜 역산은 미확인 조합을 꾸며 내지 않고 경계가 달라진 원국을 거부한다', () => {
  const row = LEADERS.four.total[0];
  assert.deepEqual(findBirthExamples(row.pillars), row.examples);
  const impossibleMonth = { ...row.pillars, month: { ...row.pillars.month, s: (row.pillars.month.s + 1) % 10 } };
  assert.deepEqual(findBirthExamples(impossibleMonth), []);
  assert.equal(matchingPillars(row.pillars, impossibleMonth), false);
  assert.equal(matchingPillars(row.pillars, { ...row.pillars, hour: null }), false);
  assert.ok(findBirthExamples(LEADERS.three.total[0].pillars).length);
});

test('개운 가이드는 실제 감점과 용신·희신을 사용하고 점수를 바꾸지 않는다', () => {
  const seenElements = new Set();
  const seenStrength = new Set();
  for (let m = 1; m <= 12; m++) {
    const chart = buildChart({ y: 1993, m, d: 21, timeBranch: '3', gender: 'M', calendar: 'solar' });
    const rank = sajuRank(chart, TABLE);
    const before = JSON.stringify(rank);
    const g = rankGuidance(chart, rank);
    assert.equal(JSON.stringify(rank), before);
    assert.deepEqual(g.supports.map((s) => s.element), [chart.roles.yong, chart.roles.hee]);
    for (const s of g.supports) {
      seenElements.add(s.element);
      assert.deepEqual(s.colors, T.element[s.element].color);
      assert.equal(s.direction, T.element[s.element].dir);
      assert.ok(s.item && s.action);
    }
    seenStrength.add(chart.strong);
    assert.equal(g.caution.name, T.element[chart.roles.gi].name);
    assert.deepEqual(g.repairs.map((r) => r.key).sort(), rank.reasons.filter((r) => r.pts < 0).map((r) => r.key).sort());
    assert.ok(g.repairs.every((r) => r.action && r.caution && r.pts < 0));
    assert.deepEqual(rankGuidance(chart, { ...rank, reasons: [] }).repairs, []);
    const all = rankGuidance(chart, { reasons: PARTS.map(([key, name]) => ({ key, name, pts: -1, text: '규칙 설명' })) });
    assert.equal(all.repairs.length, PARTS.length);
  }
  assert.equal(seenElements.size, 5);
  assert.equal(seenStrength.size, 2);
});

test('대표 조합의 장단점은 평균 대비 근거와 실제 분야 점수에서 나온다', () => {
  for (const [kind, categories] of Object.entries(LEADERS)) for (const rows of Object.values(categories)) for (const row of rows) {
    const h = rankHighlights(analyze(row.pillars), TABLE[kind].avg);
    assert.ok(h.strengths.every((r) => r.pts > 0));
    assert.ok(h.weaknesses.every((r) => r.pts < 0));
    assert.equal(h.weakest.score, Math.min(...Object.values(row.cats)));
  }
});
