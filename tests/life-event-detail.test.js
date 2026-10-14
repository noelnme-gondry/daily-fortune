import test from 'node:test';
import assert from 'node:assert/strict';
import { buildChart, lifetime, year, yearSignals } from '../src/engine/index.js';
import { lifeEventDetails } from '../src/domain/life-event-detail.js';
import { lifeEventsView } from '../src/client/life-events-view.js';

const today = { y: 2026, m: 10, d: 14 };
const profile = { gender: 'F', calendar: 'solar', y: 1993, m: 1, d: 28, time: '03:40' };
const chart = buildChart(profile);
const events = lifetime(chart, today).events;

test('주요 시기 상세는 선정 연도·원래 이유와 연간 계산 점수를 그대로 사용한다', () => {
  const before = JSON.stringify(events);
  const details = lifeEventDetails(chart, events);
  assert.deepEqual(details.map((g) => [g.key, g.items.map((i) => i.y)]), events.map((g) => [g.key, g.items.map((i) => i.y)]));
  for (const group of details) for (const item of group.items) {
    const original = events.find((g) => g.key === group.key).items.find((i) => i.y === item.y);
    assert.equal(item.age, original.age);
    assert.equal(item.why, original.why);
    const annual = year(chart, item.y, 'next');
    assert.deepEqual(item.scores.map((s) => [s.key, s.score]), [['overall', annual.overall.score], ...annual.cats.map((c) => [c.key, c.score])]);
    assert.ok(item.summary && item.selection);
  }
  assert.equal(JSON.stringify(events), before);
});

test('상대적으로 높은 금전운이나 낮은 종합 점수를 무조건 좋음·나쁨으로 표시하지 않는다', () => {
  const c = buildChart({ ...profile, y: 1979, m: 12, d: 20, time: '12:00' });
  const money = lifeEventDetails(c, lifetime(c, today).events).find((g) => g.key === 'money');
  const mid = money.items.find((i) => i.y === 2033);
  assert.equal(mid.scores.find((s) => s.key === 'money').score, 56);
  assert.equal(mid.badge, '보통');
  assert.match(mid.selection, /다른 해보다 높다는 뜻/);
  const caution = lifeEventDetails(chart, events).find((g) => g.key === 'caution');
  assert.equal(caution.items.find((i) => i.y === 2035).badge, '주의');
  assert.equal(caution.items.find((i) => i.y === 2040).badge, '점검');
  assert.match(caution.items[0].selection, /건강 점수가 아니라 종합 점수/);
});

test('인연은 연애운으로 설명하고 자녀·이동 신호는 길흉이나 확률로 바꾸지 않는다', () => {
  const details = lifeEventDetails(chart, events);
  const marriage = details.find((g) => g.key === 'marriage').items.find((i) => i.y === 2035);
  assert.equal(marriage.scores.find((s) => s.key === 'overall').score, 43);
  assert.equal(marriage.badge, '보통'); // 종합 43점과 연애운의 평가를 구분한다.
  for (const item of details.find((g) => g.key === 'child').items) {
    assert.equal(item.badge, '관심');
    assert.equal(item.scores.some((s) => s.key === 'child'), false);
    assert.match(item.summary, /임신·출산의 예측은 아닙니다/);
  }
  for (const item of details.find((g) => g.key === 'move').items) {
    assert.equal(item.badge, '변화');
    assert.match(item.summary, /좋은 일 또는 나쁜 일을 뜻하지 않습니다/);
  }
});

test('홍란·천희처럼 구분점이 포함된 용어도 원래 신호 단위로 풀이한다', () => {
  const details = lifeEventDetails(chart, events);
  for (const group of details.filter((g) => ['marriage', 'child', 'move'].includes(g.key))) for (const item of group.items) {
    assert.deepEqual(item.reasons.map((r) => r.term), yearSignals(chart, item.y).reasons[group.key]);
    assert.ok(item.reasons.every((r) => r.text.length > 10));
  }
  const hongran = details.find((g) => g.key === 'marriage').items.find((i) => i.y === 2033).reasons.find((r) => r.term === '홍란·천희');
  assert.match(hongran.text, /기쁜 만남/);
});

test('시각 미상은 한계를 밝히고 선정되지 않은 분야에 연도를 만들어 넣지 않는다', () => {
  const c = buildChart({ ...profile, time: null });
  const details = lifeEventDetails(c, lifetime(c, today).events);
  for (const item of details.flatMap((g) => g.items)) {
    assert.match(item.timeNote, /시주를 제외/);
    assert.ok(!item.reasons.some((r) => r.term === '자녀궁(시지) 합'));
  }
  const older = buildChart({ ...profile, y: 1940, time: null });
  const olderEvents = lifetime(older, today).events;
  assert.deepEqual(lifeEventDetails(older, olderEvents).filter((g) => ['marriage', 'child'].includes(g.key)).map((g) => g.items), [[], []]);
  const html = lifeEventsView(olderEvents, older, today);
  assert.doesNotMatch(html, /data-dialog="life-event-(marriage|child)-/);
  assert.match(html, /두드러진 해가 없습니다/);
});
