import test from 'node:test';
import assert from 'node:assert/strict';
import { buildChart, day, week, ttiDay, addDays } from '../src/engine/index.js';
import { READING_ACTIONS } from '../src/content/reading-actions.js';
import { READING_HEADLINES } from '../src/content/reading-headlines.js';
import { readingAction } from '../src/domain/reading.js';
import { withLanguage } from '../src/i18n/runtime.js';

const START = { y: 2026, m: 10, d: 19 };
const INPUTS = [
  { gender: 'F', y: 1993, m: 1, d: 28, time: '03:40' },
  { gender: 'M', y: 1991, m: 8, d: 14, time: '10:30' },
  { gender: 'F', y: 2000, m: 2, d: 29, time: null },
  { gender: 'M', y: 1965, m: 12, d: 9, time: '23:50' },
  { gender: 'F', y: 1988, m: 7, d: 12, time: '12:00' },
  { gender: 'M', y: 2005, m: 5, d: 5, time: null },
];
// 기존 제목의 공통 머리말도 제거해 문구 조합 수로 다양성을 부풀리지 않는다.
const core = (r) => r.overall.headline.split(' · ').at(-1);

test('모든 행동 주제에 활용·주의 제목이 한영으로 있고 중복이 없다', () => {
  const actionIds = Object.entries(READING_ACTIONS).flatMap(([cat, rows]) => rows.map(([id]) => `${cat}-${id}`));
  assert.deepEqual(Object.keys(READING_HEADLINES).sort(), actionIds.sort());
  for (const groups of Object.values(READING_HEADLINES)) {
    assert.equal(groups.length, 2);
    for (const titles of groups) {
      assert.equal(titles.length, 6);
      for (const pair of titles) {
        assert.equal(pair.length, 2);
        assert.match(pair[0], /[가-힣]/);
        assert.ok(pair[1].length > 5);
        assert.doesNotMatch(pair[1], /[가-힣]/);
      }
    }
  }
  for (const lang of [0, 1]) {
    const titles = Object.values(READING_HEADLINES).flat(2).map((pair) => pair[lang]);
    assert.equal(new Set(titles).size, titles.length);
  }
});

test('제목은 선택한 본문의 주제·점수대를 따르고 한영 선택이 일치한다', () => {
  for (const [cat, rows] of Object.entries(READING_ACTIONS)) {
    for (const score of [59, 60]) {
      const seen = new Set();
      for (let cycle = -60; cycle < 60; cycle++) {
        const context = { cycle, identity: 'headline-test' };
        const ko = readingAction(cat, score, context);
        const en = withLanguage('en', () => readingAction(cat, score, context));
        const group = READING_HEADLINES[ko.id][score >= 60 ? 0 : 1];
        const title = group.find((pair) => pair[0] === ko.headline);
        assert.ok(title, `${ko.id}: ${ko.headline}`);
        assert.equal(en.id, ko.id);
        assert.equal(en.headline, title[1]);
        const action = rows.find(([id]) => `${cat}-${id}` === ko.id);
        assert.equal(ko.text, action[score >= 60 ? 3 : 4][0]);
        seen.add(ko.headline);
      }
      assert.equal(seen.size, rows.length * 6, '등록된 후보가 실제로 선택 가능해야 한다');
    }
  }
});

test('여섯 원국의 90일·26주에서 공통 머리말을 제외한 제목이 충분히 달라진다', () => {
  for (const input of INPUTS) {
    const c = buildChart(input);
    const daily = Array.from({ length: 90 }, (_, i) => day(c, addDays(START, i)));
    const weekly = Array.from({ length: 26 }, (_, i) => week(c, addDays(START, i * 7)));
    assert.ok(new Set(daily.map(core)).size >= 45, `일간 ${JSON.stringify(input)}`);
    assert.ok(new Set(weekly.map(core)).size >= 20, `주간 ${JSON.stringify(input)}`);
  }
});

test('띠별 일간에도 실제로 표시할 제목이 있고 90일간 다양하게 선택된다', () => {
  for (let t = 0; t < 12; t++) {
    const rows = Array.from({ length: 90 }, (_, i) => ttiDay(t, addDays(START, i)));
    assert.ok(rows.every((r) => typeof r.headline === 'string' && r.headline.length > 5));
    assert.ok(new Set(rows.map((r) => r.headline)).size >= 35, `${t}번 띠`);
  }
});

test('366일간 같은 날짜의 12띠 제목이 띠 이름이나 공통 머리말 없이도 다르다', () => {
  for (let i = 0; i < 366; i++) {
    const date = addDays(START, i);
    const rows = Array.from({ length: 12 }, (_, t) => ttiDay(t, date));
    assert.equal(new Set(rows.map((r) => r.headline)).size, 12, JSON.stringify(date));
  }
});
