import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine/index.js';

const TODAY = { y: 2026, m: 10, d: 14 };
const A = { name: '서윤', gender: 'F', calendar: 'solar', y: 1993, m: 1, d: 28, time: '03:40' };
const B = { name: '도현', gender: 'M', calendar: 'solar', y: 1991, m: 8, d: 14, time: '10:30' };
const hz = (p) => E.pillarH(p);

test('일진은 날짜로 계산된다', () => {
  assert.equal(hz(E.dayPillar({ y: 2000, m: 1, d: 1 })), '戊午');
  assert.equal(hz(E.dayPillar(TODAY)), '辛酉');
  assert.equal(hz(E.yearPillar(2026)), '丙午');
  assert.equal(hz(E.yearPillar(2027)), '丁未');
  assert.equal(hz(E.monthPillar(TODAY)), '戊戌');
});

test('년·월주는 한국 시각 기준 입춘 절입으로 바뀐다', () => {
  // 1990년 입춘: 2월 4일 11:14(한국 표준시)
  const before = E.buildChart({ gender: 'M', calendar: 'solar', y: 1990, m: 2, d: 4, time: '10:30' });
  const after = E.buildChart({ gender: 'M', calendar: 'solar', y: 1990, m: 2, d: 4, time: '11:30' });
  assert.equal(hz(before.pillars.year), '己巳');
  assert.equal(hz(before.pillars.month), '丁丑');
  assert.equal(hz(after.pillars.year), '庚午');
  assert.equal(hz(after.pillars.month), '戊寅');
});

test('밤 11시 30분 이후는 다음 날 자시, 30분 보정 적용', () => {
  const late = E.buildChart({ gender: 'M', calendar: 'solar', y: 1999, m: 12, d: 31, time: '23:40' });
  assert.equal(hz(late.pillars.day), '戊午');
  assert.equal(hz(late.pillars.hour), '壬子');
  const early = E.buildChart({ gender: 'M', calendar: 'solar', y: 1999, m: 12, d: 31, time: '23:20' });
  assert.equal(E.BR_H[early.pillars.hour.b], '亥');
  assert.equal(hz(E.buildChart({ gender: 'F', calendar: 'solar', y: 1993, m: 1, d: 28, time: '03:40' }).pillars.hour), '丙寅');
});

test('서머타임 기간은 1시간을 뺀다', () => {
  const c = E.buildChart({ gender: 'M', calendar: 'solar', y: 1988, m: 7, d: 1, time: '12:10' });
  assert.equal(c.dst, true);
  assert.equal(E.BR_H[c.pillars.hour.b], '巳'); // 12:10 − 1h − 30m = 10:40 → 사시
});

test('한국 음력 변환과 존재하지 않는 날짜 거부', () => {
  assert.deepEqual(E.lunarOf(TODAY), { y: 2026, m: 9, d: 4, leap: false });
  assert.deepEqual(E.solarOfLunar(2020, 4, 10, true), { y: 2020, m: 6, d: 1 });
  assert.equal(E.solarOfLunar(2021, 4, 10, true), null);
  assert.equal(E.solarOfLunar(2026, 2, 30, false), null);
  assert.throws(() => E.buildChart({ gender: 'F', calendar: 'lunar', leap: true, y: 2021, m: 4, d: 10 }), E.ChartInputError);
  const viaLunar = E.buildChart({ gender: 'F', calendar: 'lunar', y: 1993, m: 1, d: 6, time: '03:40' });
  assert.equal(viaLunar.key, E.buildChart(A).key);
});

test('시간을 모르면 세 기둥으로 계산한다', () => {
  const c = E.buildChart({ ...A, time: null });
  assert.equal(c.pillars.hour, null);
  assert.equal(c.positions.length, 3);
  assert.ok(E.day(c, TODAY).overall.score >= 0);
});

test('같은 입력이면 모든 결과가 완전히 같다 (결정론)', () => {
  const run = () => {
    const a = E.buildChart(A), b = E.buildChart(B);
    return JSON.stringify([E.day(a, TODAY), E.week(a, TODAY), E.month(a, 2026, 10), E.year(a, 2027, 'next'), E.yearMonths(a, 2026), E.lifetime(a, TODAY), E.compat(a, b, TODAY), E.ttiYear(6, 2026), E.ttiDay(0, TODAY)]);
  };
  assert.equal(run(), run());
});

test('점수는 0~100 범위이고 분포가 고르게 퍼진다', () => {
  const scores = [];
  for (let i = 0; i < 40; i++) {
    const c = E.buildChart({ gender: i % 2 ? 'M' : 'F', calendar: 'solar', y: 1960 + i, m: 1 + (i % 12), d: 1 + (i % 28), time: `${String(i % 24).padStart(2, '0')}:15` });
    for (let k = 0; k < 10; k++) scores.push(E.day(c, E.addDays(TODAY, k * 7)).overall.score);
  }
  assert.ok(scores.every((s) => s >= 0 && s <= 100));
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  assert.ok(mean > 50 && mean < 70, `평균 ${mean}`);
  assert.ok(Math.min(...scores) < 45 && Math.max(...scores) > 75);
});

test('리포트 구조: 7개 분야와 해설', () => {
  const r = E.day(E.buildChart(A), TODAY);
  assert.equal(r.cats.length, 7);
  for (const c of r.cats) assert.ok(c.text.length > 20 && !/undefined|\{/.test(c.text), c.text);
  assert.ok(!/undefined|\{/.test(r.overall.text));
  assert.equal(E.yearMonths(E.buildChart(A), 2026).length, 12);
});

test('궁합: 점수·조심할 점·결혼 길일', () => {
  const r = E.compat(E.buildChart(A), E.buildChart(B), TODAY);
  assert.equal(r.cats.length, 5);
  assert.ok(r.cautions.length >= 3);
  assert.equal(r.events.weddingDates.length, 6);
  for (const d of r.events.weddingDates) assert.ok([0, 6].includes(E.dow(d.date)));
  assert.ok(r.events.marriageYears.length === 3);
});

test('삼재: 2026년은 돼지·토끼·양띠 눌삼재', () => {
  const s = E.samjaeYear(2026);
  assert.deepEqual(s.map((x) => E.ANIMAL[x.tti]).sort(), ['돼지', '양', '토끼'].sort());
  assert.ok(s.every((x) => x.name === '눌삼재'));
  assert.ok(E.samjaeYear(2027).every((x) => x.name === '날삼재'));
});

test('조사 선택', () => {
  assert.equal(E.josa('편관', '은/는'), '편관은');
  assert.equal(E.josa('정재', '이/가'), '정재가');
  assert.equal(E.josa('화(火)', '으로/로'), '화(火)로');
  assert.equal(E.josa('금(金)', '으로/로'), '금(金)으로');
  assert.equal(E.josa('경진일주', '과/와'), '경진일주와');
  assert.equal(E.fill('{A:이/가} {B:을/를}', { A: '서윤', B: '도현' }), '서윤이 도현을');
});

test('24절기는 한 해에 24개', () => {
  const t = E.solarTerms(2026);
  assert.equal(t.length, 24);
  assert.equal(t.find((x) => x.name === '입춘').date.d, 4);
});
