import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { birthTimeOptions, branchOfTime } from '../src/domain/birth-time.js';
import { utcOffset } from '../src/engine/calendar.js';
import { buildChart, ttiDay, ttiDayDetails, ttiMonths, ttiYear, lifeStory, day, scoresOf, rankScore, rankFromTable } from '../src/engine/index.js';
import { analyze } from '../src/engine/chart.js';
import { gameStats } from '../src/engine/story.js';
import { JOB_BY_ID } from '../src/content/character-jobs.js';
import { toEngine } from '../src/client/profile.js';
import LEADERS from '../src/content/rank-leaders.js';
import TABLE from '../src/content/rank-table.js';
import { createSite } from '../src/site/render.js';
import { siteUrl } from '../src/site/util.js';

const A = { gender: 'F', calendar: 'solar', y: 1993, m: 1, d: 28, time: '03:40' };
const TODAY = { y: 2026, m: 10, d: 14 };
const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const dayHour = (c) => JSON.stringify([c.pillars.day, c.pillars.hour]);
test('시진 선택은 그 구간의 어떤 시계 시각을 넣어도 같은 일주·시주가 된다(30분·서머타임·1954~61년 표준시)', () => {
  // 1990 평시(UTC+9), 1987 서머타임, 1956 동경 127.5° 표준시, 1957 그 기간의 서머타임, 1950 서머타임
  for (const date of [{ y: 1990, m: 5, d: 10 }, { y: 1987, m: 7, d: 10 }, { y: 1956, m: 3, d: 5 }, { y: 1957, m: 6, d: 15 }, { y: 1950, m: 6, d: 1 }]) {
    const opts = birthTimeOptions(utcOffset(date).off);
    assert.equal(opts[0].start, 0); assert.equal(opts.at(-1).end, 1440);
    for (const o of opts) {
      const ref = dayHour(buildChart({ ...date, gender: 'M', calendar: 'solar', timeBranch: o.value }));
      assert.equal(JSON.parse(ref)[1].b, o.branch, o.label);
      for (const t of [o.start, o.end - 1]) assert.equal(dayHour(buildChart({ ...date, gender: 'M', calendar: 'solar', time: hhmm(t) })), ref, `${date.y} ${o.label} ${hhmm(t)}`);
    }
  }
});
test('밤 11시~11시 30분 출생은 해시·당일 일주이고 11시 30분 이후만 다음 날 자시다', () => {
  const D = { gender: 'M', calendar: 'solar', y: 1990, m: 5, d: 10 };
  assert.equal(branchOfTime('23:10', 540).value, '11');
  assert.equal(branchOfTime('23:40', 540).value, 'n0');
  assert.equal(dayHour(buildChart({ ...D, timeBranch: '11' })), dayHour(buildChart({ ...D, time: '23:10' })));
  assert.equal(buildChart({ ...D, timeBranch: 'n0' }).pillars.day.b, buildChart({ ...D, d: 11, time: '06:00' }).pillars.day.b);
  // 1987년 서머타임 02:10은 표준시 01:10 → 자시
  assert.equal(branchOfTime('02:10', utcOffset({ y: 1987, m: 7, d: 10 }).off).branch, 0);
  assert.equal(buildChart({ ...D, y: 1987, m: 7, d: 10, time: '02:10' }).pillars.hour.b, 0);
});
test('이전 저장값·시간 모름·잘못된 시진', () => {
  const branch = (timeBranch) => buildChart({ ...A, timeBranch });
  assert.equal(branch('3').pillars.hour.b, 3);
  assert.equal(branch('zi-early').pillars.day.b, buildChart({ ...A, time: '06:00' }).pillars.day.b);
  assert.equal(branch('zi-late').pillars.day.b, buildChart({ ...A, d: 29, time: '06:00' }).pillars.day.b);
  assert.equal(buildChart(toEngine({ ...A, timeMode: 'branch', timeBranch: '3', noTime: true })).pillars.hour, null);
  assert.equal(buildChart(toEngine({ ...A, timeMode: 'branch', timeBranch: '3' })).timeLabel, '묘시 · 05:30~07:30');
  assert.equal(buildChart(toEngine({ ...A, timeMode: 'exact', time: '03:40', timeBranch: null })).timeLabel, '03:40');
  assert.throws(() => buildChart({ ...A, timeBranch: 'wrong' }));
  assert.deepEqual(buildChart(toEngine(A)).pillars, buildChart(A).pillars, '정확한 시각 입력 보존');
});
test('일반 점수 환산과 상세 설명의 일별 가감은 같은 계산', () => {
  const zero = { acc: Array.from({ length: 7 }, () => new Map()), L: 0 };
  assert.equal(scoresOf(zero, 'day').overall, 51);
  for (let t = 0; t < 12; t++) {
    const raw = 60 + ttiDayDetails(t, TODAY).reduce((n, d) => n + d.value, 0);
    assert.equal(Math.max(22, Math.min(97, Math.round(raw))), ttiDay(t, TODAY).score);
  }
});
test('월별 12개 점수와 연생 선택은 결정론적이고 연도가 자동 갱신', () => {
  for (let t = 0; t < 12; t++) {
    const r = ttiYear(t, 2027), birth = r.cohorts.at(-1).birthYear;
    assert.ok(r.cohorts.every((c) => c.birthYear <= 2027 && c.birthYear >= 1927));
    const months = ttiMonths(t, 2027, birth);
    assert.equal(months.length, 12);
    assert.deepEqual(ttiMonths(t, 2027, birth), months);
    assert.ok(new Set(months.map((m) => m.score)).size > 2);
    assert.ok(months.every((m) => m.score >= 22 && m.score <= 97 && m.text));
    assert.throws(() => ttiMonths(t, 2027, birth - 1));
  }
});
test('캐릭터 게임 보정은 일반 운세와 랭킹을 바꾸지 않는다', () => {
  const c = buildChart(A), before = day(c, TODAY), rank = rankScore(c);
  const story = lifeStory(c, TODAY);
  assert.deepEqual(day(c, TODAY), before); assert.deepEqual(rankScore(c), rank);
  for (const stage of story.stages) {
    assert.equal(stage.years.length, 10);
    assert.ok(fs.existsSync(`public/characters/${stage.character.portrait}.webp`));
    assert.ok(Object.values(stage.stats).every((n) => Number.isInteger(n) && n >= 1 && n <= 99));
  }
  const raw = { drive: 60, wealth: 60, charm: 60, wisdom: 60, vital: 60 };
  assert.equal(gameStats(raw, '정재').wealth, 68);
  assert.equal(gameStats(raw, '편관').drive, 68);
  assert.notDeepEqual(gameStats(raw, '정재'), gameStats(raw, '편관'));
  const low = lifeStory(buildChart({ gender: 'M', calendar: 'solar', y: 1980, m: 6, d: 1, timeBranch: '3' }), TODAY).stages[4];
  assert.equal(low.band, 'low');
  assert.equal(low.score, 44, '직업 확장으로 원래의 흐름 점수가 바뀌면 안 된다');
  assert.ok(JOB_BY_ID[low.character.portrait].setback);
  assert.equal(JOB_BY_ID[low.character.portrait].tg, low.tg);
  assert.ok(low.story.includes(JOB_BY_ID[low.character.portrait].desc));
});
test('명예의 전당 점수·공동 순위는 기존 산식·분포표와 일치', () => {
  for (const kind of ['four', 'three']) for (const [category, rows] of Object.entries(LEADERS[kind])) {
    assert.equal(rows.length, 100);
    assert.equal(new Set(rows.map((r) => JSON.stringify(r.pillars))).size, 100);
    assert.equal(rows[0].rank, 1, `${kind}/${category}: 해당 분야의 1위부터 표시해야 한다`);
    const histogram = category === 'total' ? TABLE[kind].total : TABLE[kind].cats[category];
    const topScores = histogram.flatMap((count, idx) => Array(Math.min(count, 100)).fill(category === 'total' ? idx / 10 : idx)).reverse().slice(0, 100);
    assert.deepEqual(rows.map((row) => row.score), topScores, `${kind}/${category}: 출생 날짜 유무로 상위 점수를 건너뛰면 안 된다`);
    for (const row of rows) {
      const r = rankScore(analyze(row.pillars));
      assert.equal(row.score, category === 'total' ? r.total : r.cats[category]);
      const h = category === 'total' ? TABLE[kind].total : TABLE[kind].cats[category];
      const idx = category === 'total' ? Math.round(row.score * 10) : row.score;
      assert.equal(row.rank, 1 + h.slice(idx + 1).reduce((a, b) => a + b, 0));
      assert.equal(row.tied, h[idx]);
      assert.equal(row.tier, rankFromTable(r, TABLE[kind]).tier.code);
    }
  }
});
test('KST 새해 직전·직후: 경로·메뉴·메타·사이트맵·띠 출생 연도 갱신', () => {
  const site = (now) => createSite({ site: siteUrl({}), assets: { css: '/a.css', js: '/a.js' }, now });
  const old = site(Date.UTC(2026, 11, 31, 14, 59));
  const next = site(Date.UTC(2026, 11, 31, 15, 0));
  assert.ok(old.has('/year/2026/')); assert.ok(old.has('/year/2027/'));
  assert.ok(next.has('/year/2026/')); assert.ok(next.has('/year/2028/'));
  assert.match(next.render('/tti/2028/rat/'), /2028년 1~12월 운세/);
  assert.match(next.render('/'), /2028년 운세/);
  assert.match(next.sitemap(), /\/tti\/2028\/rat\//);
  assert.match(next.sitemap(), /\/year\/2026\//);
  assert.ok(next.has('/tti/today/rat/'));
  assert.match(next.render('/tti/'), /data-dialog="tti-day-0"/);
  assert.doesNotMatch(next.render('/tti/'), /<h2>12띠 성격/);
});
