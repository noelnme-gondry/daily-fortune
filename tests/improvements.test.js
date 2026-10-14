import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BIRTH_TIMES } from '../src/domain/birth-time.js';
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
test('모든 시진은 현대·서머타임·음력 입력에서도 선택한 시주를 유지', () => {
  for (const time of BIRTH_TIMES) for (const input of [A, { ...A, y: 1988, m: 7, d: 1 }, { ...A, calendar: 'lunar' }]) {
    const c = buildChart(toEngine({ ...input, timeMode: 'branch', timeBranch: time.value }));
    assert.equal(c.pillars.hour.b, time.branch, `${input.y} ${time.label}`);
  }
  const branch = (timeBranch) => buildChart({ ...A, timeBranch });
  assert.equal(branch('3').pillars.hour.b, 3);
  assert.equal(branch('zi-early').pillars.day.b, buildChart({ ...A, time: '06:00' }).pillars.day.b);
  assert.equal(branch('zi-late').pillars.day.b, buildChart({ ...A, d: 29, time: '06:00' }).pillars.day.b);
  assert.equal(buildChart(toEngine({ ...A, timeMode: 'branch', timeBranch: '3', noTime: true })).pillars.hour, null);
  assert.throws(() => buildChart({ ...A, timeBranch: 'wrong' }));
  assert.deepEqual(buildChart(toEngine(A)).pillars, buildChart(A).pillars, '기존 정확한 입력 보존');
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
    assert.equal(rows.length, 5);
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
  assert.ok(!next.has('/year/2026/')); assert.ok(next.has('/year/2028/'));
  assert.match(next.render('/tti/2028/rat/'), /2028년 1~12월 운세/);
  assert.match(next.render('/'), /2028년 운세/);
  assert.match(next.sitemap(), /\/tti\/2028\/rat\//);
  assert.doesNotMatch(next.sitemap(), /\/year\/2026\//);
  assert.ok(next.has('/tti/today/rat/'));
  assert.match(next.render('/tti/'), /data-dialog="tti-day-0"/);
  assert.doesNotMatch(next.render('/tti/'), /<h2>12띠 성격/);
});
