import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { buildChart, day, week, ttiDay, ttiYear, ttiMonths, addDays, ANIMAL } from '../src/engine/index.js';
import { withLanguage } from '../src/i18n/runtime.js';
import { dayChangeText, readingAction, readingHeadlines, weekRhythm } from '../src/domain/reading.js';
import { READING_ACTIONS } from '../src/content/reading-actions.js';
import { parseShare } from '../src/site/pages/share.js';

const START = { y: 2026, m: 10, d: 19 };
const INPUTS = [
  { gender: 'F', calendar: 'solar', y: 1993, m: 1, d: 28, time: '03:40' },
  { gender: 'M', calendar: 'solar', y: 1991, m: 8, d: 14, time: '10:30' },
  { gender: 'F', calendar: 'solar', y: 2000, m: 2, d: 29, time: null },
];

test('해설 개선 전의 개인·띠별 계산 점수를 60일 표본에서 그대로 보존한다', () => {
  const scores = [];
  for (const input of INPUTS) {
    const c = buildChart(input);
    for (let d = 0; d < 60; d++) {
      const o = addDays(START, d);
      for (const r of [day(c, o), week(c, o)]) scores.push([r.overall.score, r.cats.map((x) => x.score), r.days?.map((x) => [x.score, x.cats])]);
    }
  }
  for (let t = 0; t < 12; t++) {
    for (let d = 0; d < 60; d++) scores.push(ttiDay(t, addDays(START, d)).score);
    for (const y of [2026, 2027]) {
      const r = ttiYear(t, y);
      scores.push([r.score, r.cats.map((x) => x.score), r.cohorts.map((x) => x.score), ttiMonths(t, y).map((x) => x.score)]);
    }
  }
  assert.equal(createHash('sha256').update(JSON.stringify(scores)).digest('hex'), 'b5330207716d4385de56aa6513914e3a728a919501dea9b330e1250262c6e073');
});

test('주간 해설은 주별 실제 요일 흐름을 담고 제목이 같은 분야에 고정되지 않는다', () => {
  const c = buildChart(INPUTS[0]);
  const rows = Array.from({ length: 12 }, (_, i) => week(c, addDays(START, i * 7)));
  assert.ok(new Set(rows.map((r) => r.overall.headline)).size >= 8);
  for (const r of rows) for (const cat of r.cats) assert.match(cat.text, /요일/);
  for (let i = 0; i < 7; i++) assert.ok(new Set(rows.map((r) => r.cats[i].text)).size >= 11);
});

test('같은 날짜의 띠 해설은 띠 이름을 빼도 문단 전체가 중복되지 않는다', () => {
  const names = new RegExp(`${ANIMAL.join('|')}띠`, 'g');
  for (let d = 0; d < 60; d++) {
    const o = addDays(START, d);
    const texts = Array.from({ length: 12 }, (_, t) => ttiDay(t, o).text.replace(names, '띠'));
    assert.equal(new Set(texts).size, 12, JSON.stringify(o));
  }
});

test('같은 일진이 60일 뒤 돌아와도 띠별 활용 예시가 그대로 반복되지 않는다', () => {
  for (let t = 0; t < 12; t++) for (let d = 0; d < 60; d++) {
    const first = ttiDay(t, addDays(START, d)).advice;
    const later = ttiDay(t, addDays(START, d + 60)).advice;
    assert.notEqual(first, later, `${t}번 띠 · ${d}일 뒤`);
  }
});

test('띠별 월간 해설에 오늘·내일·하루 같은 일간 문장이 섞이지 않는다', () => {
  for (let t = 0; t < 12; t++) for (const r of ttiMonths(t, 2026)) assert.doesNotMatch(r.text, /오늘|내일|하루|날입니다/);
});

test('짧은 기간의 해설은 호출 순서·언어 전환·새로고침에 영향받지 않는다', () => {
  const c = buildChart(INPUTS[0]);
  const read = () => [day(c, START), week(c, START), ttiDay(1, START)];
  const before = read();
  withLanguage('en', read);
  day(buildChart(INPUTS[1]), addDays(START, 30));
  assert.deepEqual(read(), before);
  assert.deepEqual(week(c, addDays(START, 6)), before[1]);
});

test('일간 해설의 전날 대비 증감은 실제 개인 계산값과 같다', () => {
  for (const input of INPUTS) {
    const c = buildChart(input);
    for (let d = 0; d < 30; d++) {
      const o = addDays(START, d), current = day(c, o), previous = day(c, addDays(o, -1));
      for (let i = 0; i < 7; i++) {
        const delta = current.cats[i].score - previous.cats[i].score;
        const expected = delta === 0 ? `전날과 같은 ${current.cats[i].score}점` : `전날보다 ${Math.abs(delta)}점 ${delta > 0 ? '높은' : '낮은'}`;
        assert.ok(current.cats[i].text.includes(expected));
      }
    }
  }
  assert.equal(dayChangeText(60, 60), '전날과 같은 60점입니다.');
  assert.equal(withLanguage('en', () => dayChangeText(42, 60)), 'The score is 42, 18 points lower than the previous day.');
});

test('주간 동점 요일을 모두 표시하고 전부 동점이면 최고·최저를 나누지 않는다', () => {
  const make = (scores) => scores.map((score, i) => ({ label: ['월', '화', '수', '목', '금', '토', '일'][i], score, cats: [100 - score] }));
  const tied = weekRhythm(make([70, 70, 50, 50, 60, 60, 60]));
  assert.deepEqual(tied.best.map((d) => d.label), ['월', '화']);
  assert.deepEqual(tied.quiet.map((d) => d.label), ['수', '목']);
  assert.match(tied.text, /월요일·화요일\(70점\)/);
  const flat = weekRhythm(make([60, 60, 60, 60, 60, 60, 60]));
  assert.doesNotMatch(flat.text, /최고점|최저점/);
  assert.match(flat.text, /모든 요일이 60점/);
  const rising = make([30, 35, 40, 60, 75, 80, 85]);
  assert.equal(weekRhythm(rising).kind, 'rising');
  assert.equal(weekRhythm(rising, 0).kind, 'falling', '분야별 추세는 종합 추세와 독립적');
  assert.throws(() => weekRhythm(make([60])), RangeError);
  assert.throws(() => weekRhythm(make([60, 60, 60, NaN, 60, 60, 60])), RangeError);
});

test('행동 예시는 관련 요인 안에서 순환하고 한영의 주제가 일치한다', () => {
  for (const cat of Object.keys(READING_ACTIONS)) {
    for (const factor of ['비견', '식신', '정재', '정관', '정인', '일지충', '오행']) {
      const first = readingAction(cat, 70, { factor, cycle: 20000, identity: 'sample' });
      const next = readingAction(cat, 70, { factor, cycle: 20001, identity: 'sample' });
      assert.notEqual(first.id, next.id, `${cat} ${factor}`);
      const en = withLanguage('en', () => readingAction(cat, 70, { factor, cycle: 20000, identity: 'sample' }));
      assert.equal(en.id, first.id);
      assert.doesNotMatch(`${en.title} ${en.text}`, /[가-힣]/);
    }
    for (const row of READING_ACTIONS[cat]) {
      assert.equal(row.length, 5);
      for (const pair of row.slice(2)) {
        assert.ok(pair[0] && pair[1]);
        assert.doesNotMatch(pair[1], /[가-힣]/);
      }
    }
  }
});

test('모든 새 제목과 기존 공유 링크가 언어를 바꿔도 보존된다', () => {
  for (const kind of ['today', 'tomorrow', 'week']) {
    const ko = readingHeadlines(kind), en = withLanguage('en', () => readingHeadlines(kind));
    for (let i = 0; i < ko.length; i++) {
      const query = new URLSearchParams({ k: kind, s: '65', h: ko[i] });
      assert.equal(withLanguage('en', () => parseShare(query)).title, en[i]);
      query.set('h', en[i]);
      assert.equal(parseShare(query).title, ko[i]);
    }
  }
  const old = new URLSearchParams({ k: 'today', s: '65', h: '길 위에 기회가 있는 날' });
  assert.equal(parseShare(old).title, old.get('h'));
  assert.ok(withLanguage('en', () => parseShare(old)));
  const arbitrary = new URLSearchParams({ k: 'today', s: '65', h: '하루의 초점 · <script>alert(1)</script>' });
  assert.equal(parseShare(arbitrary), null);
});
