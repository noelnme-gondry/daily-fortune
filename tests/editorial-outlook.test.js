import test from 'node:test';
import assert from 'node:assert/strict';
import { buildChart, day, ttiDay, week } from '../src/engine/index.js';
import { READINGS } from '../src/content/tojeong-readings.js';
import { reportHead } from '../src/client/views.js';

const date = { y: 2026, m: 11, d: 22 };
const profile = { calendar: 'solar', gender: 'F', y: 1993, m: 1, d: 28, time: '03:40' };

test('직장운의 협력과 말의 마찰을 먼저 풀고 사주 근거는 별도로 보존한다', () => {
  const { reading } = day(buildChart(profile), date).cats.find(cat => cat.key === 'career');
  assert.match(reading.outlook, /다른 사람의 손/);
  assert.match(reading.outlook, /지적/);
  assert.doesNotMatch(reading.outlook, /월지|상관/);
  assert.match(reading.basis, /월지/);
  assert.match(reading.basis, /상관/);
});

test('주간 첫 문장은 종합 요일 흐름을 반영하고 띠별 조언은 같은 주제로 이어진다', () => {
  const report = week(buildChart(profile), date);
  assert.match(reportHead(report, ''), /주말보다 주초/);
  assert.match(report.overall.text, /최고점은 월요일/);
  const rabbit = ttiDay(3, date);
  assert.match(rabbit.outlook, /함께|둘이/);
  assert.doesNotMatch(rabbit.text, /물건|자리.*옮기/);
});

test('144괘 모두 각자 다른 현대어 총운을 원문과 함께 제공한다', () => {
  const readings = Object.values(READINGS);
  assert.equal(readings.length, 144);
  assert.equal(new Set(readings.map(r => r.interpretation)).size, 144);
  for (const r of readings) {
    assert.ok(r.interpretation.length > 25);
    assert.notEqual(r.interpretation, r.chongun);
  }
  assert.match(READINGS['111'].interpretation, /얼었던 땅/);
  assert.match(READINGS['232'].interpretation, /호랑이/);
});

test('내일 총운은 같은 날짜의 계산을 유지하며 오늘과 비교한 풀이를 제공한다', () => {
  const chart = buildChart(profile);
  const next = { ...date, d: date.d + 1 };
  const today = day(chart, date), sameDate = day(chart, next), tomorrow = day(chart, next, 'tomorrow');
  assert.deepEqual(tomorrow.cats, sameDate.cats);
  assert.equal(tomorrow.overall.score, sameDate.overall.score);
  const social = r => r.cats.find(cat => cat.key === 'social');
  assert.ok(social(tomorrow).score > social(today).score);
  assert.match(reportHead(tomorrow, ''), /내일 대인운은 오늘보다 한결 여유/);
  assert.match(tomorrow.overall.outlook, /뒷소식/);
});
