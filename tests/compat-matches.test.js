import test from 'node:test';
import assert from 'node:assert/strict';
import { buildChart } from '../src/engine/chart.js';
import { compat, compatScores, COMPAT_CATEGORIES } from '../src/engine/compat.js';
import { findCompatMatches, matchYearRange, ageAt } from '../src/domain/compat-matches.js';
import { matchingPillars } from '../src/engine/rank-examples.js';
import { toUTC } from '../src/engine/core.js';

const today = { y: 2026, m: 10, d: 14 };
const a = { y: 1993, m: 1, d: 28, gender: 'F', calendar: 'solar', time: '03:40' };
const b = { y: 1988, m: 7, d: 1, gender: 'M', calendar: 'solar', time: '12:00' };

test('궁합 검색용 점수 추출은 기존 골든 점수·방향 대칭·시간 모름 결과를 보존한다', () => {
  for (const [x, y, total, cats] of [
    [a, b, 84, [71, 80, 64, 86, 78]],
    [b, a, 84, [71, 80, 64, 86, 78]],
    [{ ...a, time: null }, b, 87, [71, 80, 64, 93, 82]],
    [{ ...a, gender: 'M' }, { ...b, time: null }, 86, [71, 80, 64, 90, 82]],
    [{ ...a, time: null }, { ...b, time: null }, 88, [71, 80, 64, 95, 82]],
  ]) {
    const ca = buildChart(x), cb = buildChart(y);
    const full = compat(ca, cb, today), fast = compatScores(ca, cb);
    assert.deepEqual(fast, { total: full.total, cats: full.cats });
    assert.equal(fast.total, total);
    assert.deepEqual(fast.cats.map((c) => c.score), cats);
  }
});

test('범위는 기준 출생연도 ±10년이며 지원 시작연도와 오늘을 넘기지 않고 만 나이를 계산한다', () => {
  assert.deepEqual(matchYearRange(1993, today), { from: 1983, to: 2003 });
  assert.deepEqual(matchYearRange(1930, today), { from: 1930, to: 1940 });
  assert.deepEqual(matchYearRange(2020, today), { from: 2010, to: 2026 });
  assert.equal(ageAt({ y: 1990, m: 10, d: 14 }, today), 36);
  assert.equal(ageAt({ y: 1990, m: 10, d: 15 }, today), 35);
});

test('6개 분야의 추천은 실제 생년월일·시진으로 재현되며 각 분야 최고 점수부터 표시된다', () => {
  const result = findCompatMatches(a, b.gender, today);
  const ca = buildChart(a);
  // 입력 fixture의 각 분야에서 확인한 최고점. 분야별 목록은 종합 목록의 단순 재정렬이 아니다.
  const expected = [96, 94, 93, 90, 93, 90];
  for (const [[key], highest] of COMPAT_CATEGORIES.map((c, i) => [c, expected[i]])) {
    const rows = result.rankings[key];
    assert.equal(rows.length, 100);
    assert.equal(rows[0].rank, 1);
    assert.equal(rows[0].score, highest);
    assert.equal(new Set(rows.map((r) => JSON.stringify(r.pillars))).size, 100);
    rows.forEach((r, i) => {
      assert.ok(r.input.y >= 1983 && r.input.y <= 2003);
      assert.equal(r.input.gender, 'M');
      const cb = buildChart(r.input), score = compatScores(ca, cb);
      assert.ok(matchingPillars(cb.pillars, r.pillars));
      assert.equal(r.age, ageAt(cb.birth, today));
      assert.deepEqual(r.scores, { total: score.total, ...Object.fromEntries(score.cats.map((c) => [c.key, c.score])) });
      assert.equal(r.score, r.scores[key]);
      assert.equal(r.rank, i && rows[i - 1].score === r.score ? rows[i - 1].rank : i + 1);
      if (i) assert.ok(rows[i - 1].score >= r.score);
      assert.equal(r.reasons[key].length, 2);
    });
  }
  assert.notDeepEqual(result.rankings.total.map((r) => r.input), result.rankings.money.map((r) => r.input));
  // 목록에 없는 실제 날짜들도 최고점 이하인지 비교한다.
  for (let y = 1983; y <= 2003; y++) {
    const score = compatScores(ca, buildChart({ ...b, y, m: 6, d: 15, timeBranch: '6' }));
    assert.ok(score.total <= result.rankings.total[0].score);
    score.cats.forEach((c) => assert.ok(c.score <= result.rankings[c.key][0].score));
  }
});

test('기준 인물 전환은 검색 범위·추천 성별·목록을 바꾸며 시간 모름과 같은 성별도 계산한다', () => {
  const result = findCompatMatches({ ...b, time: null }, a.gender, today);
  assert.deepEqual(result.range, { from: 1978, to: 1998 });
  assert.equal(result.baseHasTime, false);
  assert.ok(result.rankings.total.every((r) => r.input.gender === 'F'));
  const sameSex = findCompatMatches(a, a.gender, today);
  assert.ok(sameSex.rankings.total.every((r) => r.input.gender === 'F'));
  assert.notDeepEqual(result.rankings.total.map((r) => r.input), sameSex.rankings.total.map((r) => r.input));
});

test('음력 기준은 변환한 양력 출생연도로 검색하고 미래 날짜는 추천하지 않는다', () => {
  const input = { y: 2025, m: 12, d: 20, calendar: 'lunar', gender: 'F', time: null };
  const result = findCompatMatches(input, 'M', today);
  assert.equal(result.baseBirth.y, 2026);
  assert.deepEqual(result.range, { from: 2016, to: 2026 });
  for (const rows of Object.values(result.rankings)) for (const r of rows) {
    assert.ok(r.input.y >= 2016);
    assert.ok(toUTC(r.input) <= toUTC(today));
    assert.ok(r.age >= 0);
  }
});

test('계산할 수 없는 입력을 정상 점수나 빈 추천 성공으로 위장하지 않는다', () => {
  assert.throws(() => findCompatMatches({ ...a, y: 1800 }, 'M', today));
});
