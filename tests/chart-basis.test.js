import test from 'node:test';
import assert from 'node:assert/strict';
import { buildChart, daeunAt } from '../src/engine/chart.js';
import { chartBasis } from '../src/client/chart-basis.js';
import { withLanguage } from '../src/i18n/runtime.js';
import { day, week, month, year } from '../src/engine/fortune.js';
import { dayView, weekView, monthView, yearView } from '../src/client/views.js';

const input = { calendar: 'solar', gender: 'M', y: 1990, m: 5, d: 15, time: '12:00' };
const today = { y: 2026, m: 11, d: 5 };

test('비교 예시의 근거는 겉글자 수와 가중값을 구분하고 실제 용신 순서를 보여준다', () => {
  const c = buildChart(input);
  assert.deepEqual(c.counts, [0, 3, 1, 3, 1]);
  assert.ok(Math.abs(c.analysisBasis.total - 9.5) < 1e-12);
  assert.ok(Math.abs(c.analysisBasis.support - 4.9) < 1e-12);
  assert.ok(Math.abs(c.ratio - c.analysisBasis.support / c.analysisBasis.total) < 1e-12);
  assert.equal(c.strengthLabel, '신강');
  assert.deepEqual(c.fav, [1.1, 1.9, -1.1, -1.4, 1.7]);
  assert.equal(c.analysisBasis.seasonalElement, 4);
  const html = chartBasis(c, today);
  assert.match(html, /4.9 ÷ 전체 힘 9.5 = 51.6%/);
  assert.match(html, /class="basis-current"><th scope="row">신강/);
  assert.match(html, /<th scope="row">화<\/th><td>1.9<\/td><td>용신/);
  assert.match(html, /2017~2026년 구간/);
});

test('순행·역행과 시간 미상 근거를 구분하고 연도 경계에서만 현재 대운이 바뀐다', () => {
  const m = buildChart(input), f = buildChart({ ...input, gender: 'F' });
  assert.deepEqual(m.cycleBasis, { forward: true, years: 7, months: 3, days: 0 });
  assert.deepEqual(f.cycleBasis, { forward: false, years: 3, months: 1, days: 20 });
  assert.equal(m.daeun[0].startYear, 1997); assert.equal(f.daeun[0].startYear, 1993);
  assert.equal(daeunAt(m, 1996), null);
  assert.equal(daeunAt(m, 2026).startYear, 2017);
  assert.equal(daeunAt(m, 2027).startYear, 2027);
  assert.match(chartBasis(m, { y: 1996 }), /첫 대운 시작 전/);
  const unknown = buildChart({ ...input, time: null });
  assert.ok(Math.abs(unknown.analysisBasis.total - 7.5) < 1e-12);
  assert.match(chartBasis(unknown, today), /시간 미상: 시주를 제외/);
  assert.match(chartBasis(f, today), /역행으로 이전/);
  withLanguage('en', () => assert.doesNotMatch(chartBasis(unknown, today), /[가-힣]|NaN|undefined/));
});

test('기간별 분야 ID가 같고 달력 상세를 함께 열어도 대상이 중복되지 않는다', () => {
  const c = buildChart(input);
  const reports = [dayView(day(c, today), { scope: 'reading' }), weekView(week(c, today), today), monthView(month(c, 2026, 11), today), yearView(year(c, 2027), [], today)];
  for (const html of reports) {
    const combined = html + dayView(day(c, today), { banner: false, scope: 'detail-2026-11-05' });
    const ids = [...combined.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    assert.equal(ids.length, new Set(ids).size);
    assert.ok(ids.includes('reading-money'));
    assert.ok(ids.includes('detail-2026-11-05-money'));
    for (const [, id] of combined.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(id), id);
  }
});
