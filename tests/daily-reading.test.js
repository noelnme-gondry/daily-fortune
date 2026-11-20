import test from 'node:test';
import assert from 'node:assert/strict';
import { buildChart, day, week, bandOf, addDays, CATS, ttiDay } from '../src/engine/index.js';
import { practiceFamily } from '../src/domain/practice-calendar.js';
import { animalDay } from '../src/site/pages/tti.js';
import { dayView } from '../src/client/views.js';
import { DAILY_OUTLOOK, DAILY_OVERVIEW } from '../src/content/daily-outlook.js';
import { DAILY_ACTION_ALTERNATIVES, DAILY_SCENES } from '../src/content/daily-scenes.js';
import { READING_ACTIONS } from '../src/content/reading-actions.js';
import { dailyReading, dailyOverview } from '../src/domain/daily-reading.js';
import { withLanguage } from '../src/i18n/runtime.js';

const start = { y: 2026, m: 10, d: 26 };
const input = { gender: 'F', calendar: 'solar', y: 1993, m: 1, d: 28, time: '03:40' };

test('기존 일곱 운과 모든 점수대에 흐름·기회·주의점의 한영 해석이 있다', () => {
  assert.deepEqual(Object.keys(DAILY_OUTLOOK), CATS);
  for (const cat of CATS) {
    assert.deepEqual(Object.keys(DAILY_OUTLOOK[cat]), Object.keys(DAILY_OVERVIEW));
    for (const band of Object.keys(DAILY_OVERVIEW)) for (const lang of ['ko', 'en']) withLanguage(lang, () => {
      const reading = dailyReading(cat, band, { action: 'action', basis: 'A specific chart factor explains this reading in its own context.', change: 'change' });
      for (const field of ['outlook', 'opportunity', 'caution']) {
        assert.ok(reading[field].length > 40, `${lang} ${cat} ${band} ${field}`);
        assert.doesNotMatch(reading[field], /undefined|NaN|\[object Object\]/);
        if (lang === 'en') assert.doesNotMatch(reading[field], /[가-힣]/);
      }
      assert.equal(reading.text, [reading.outlook, reading.opportunity, reading.caution, 'action', 'change'].join(' '));
      assert.equal(dailyOverview(band), DAILY_OVERVIEW[band][lang === 'ko' ? 0 : 1]);
    });
  }
  const noBasis = dailyReading('career', 'mid', { action: 'action', basis: '', change: 'change' });
  assert.match(noBasis.basis, /개별 일진 요인 해설은 제공되지 않습니다/);
  assert.ok(noBasis.text.endsWith('change'));
});

for (const lang of ['ko', 'en']) {
  test(`${lang}: 날짜별 실제 점수대·전날 비교와 연결되고 오늘·내일의 같은 날짜는 같은 해석이다`, () => withLanguage(lang, () => {
    for (const time of [input.time, null]) {
      const chart = buildChart({ ...input, time });
      for (let d = 0; d < 30; d++) {
        const date = addDays(start, d), r = day(chart, date), previous = day(chart, addDays(date, -1));
        assert.ok(r.overall.outlook.startsWith(dailyOverview(bandOf(r.overall.score))));
        for (let i = 0; i < r.cats.length; i++) {
          const cat = r.cats[i], band = bandOf(cat.score);
          assert.ok(cat.reading.outlook === cat.reading.basis || cat.reading.outlook === DAILY_OUTLOOK[cat.key][band][0][lang === 'ko' ? 0 : 1]);
          assert.ok(DAILY_OUTLOOK[cat.key][band]);
          const diff = cat.score - previous.cats[i].score;
          assert.match(cat.reading.change, new RegExp(diff === 0 ? String(cat.score) : String(Math.abs(diff))));
          assert.ok(cat.reading.basis);
          assert.equal(cat.text, cat.reading.text);
        }
        assert.deepEqual(r.cats, day(chart, date, 'tomorrow').cats);
      }
      assert.ok(week(chart, start).cats.every(cat => !cat.reading), '주간의 기존 해설 구조는 유지');
    }
  }));
}

test('일간 카드의 본문·근거·전날 비교를 모두 펼치고 사용자 문자열을 이스케이프한다', () => {
  const r = day(buildChart(input), start);
  r.cats[0].name = '<img src=x>';
  r.cats[0].reading.outlook = '<script>alert(1)</script>';
  const html = dayView(r), second = dayView(r);
  assert.equal((html.match(/class="daily-cat card"/g) || []).length, 7);
  assert.doesNotMatch(html, / hidden|<script>|<img src=x>/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<dialog|<details/);
  const ids = [...(html + second).matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, '주간·월간 상세를 함께 렌더해도 ID는 유일');
  for (const [, ref] of html.matchAll(/(?:href="#|aria-labelledby=")([^"]+)"/g)) assert.ok(ids.includes(ref), ref);
  const emptyBasis = { ...r, cats: r.cats.map(cat => ({ ...cat, reading: { ...cat.reading, basis: '' } })) };
  assert.doesNotMatch(dayView(emptyBasis), /data-daily-basis/);
});

test('모든 행동 주제에 서로 다른 한영 대안이 있고 두 언어의 순서가 맞는다', () => {
  const topics = Object.entries(READING_ACTIONS).flatMap(([category, rows]) => rows.map(row => category + '-' + row[0]));
  assert.deepEqual(Object.keys(DAILY_ACTION_ALTERNATIVES).sort(), topics.sort());
  for (const variants of Object.values(DAILY_ACTION_ALTERNATIVES)) {
    assert.ok(variants.length >= 3);
    for (const [ko, en] of variants) {
      assert.match(ko, /[가-힣]/);
      assert.match(en, /[a-z]/i);
      assert.doesNotMatch(en, /[가-힣]/);
    }
    for (const lang of [0, 1]) assert.equal(new Set(variants.map(pair => pair[lang])).size, variants.length);
  }
});

test('같은 생활 장면은 보름 안에 다시 선택되지 않고 점수대 원고는 나흘에 한 번 읽힌다', () => {
  for (const cat of CATS) {
    const scenes = new Set(DAILY_SCENES[cat].map(scene => scene[0]));
    const lastSeen = new Map();
    let bandDays = 0;
    for (let cycle = -20; cycle < 100; cycle++) {
      const { opportunity } = dailyReading(cat, 'mid', { action: 'action', basis: 'basis', change: '', cycle, identity: 'example' });
      if (scenes.has(opportunity)) {
        if (lastSeen.has(opportunity)) assert.ok(cycle - lastSeen.get(opportunity) > 14, cat);
        lastSeen.set(opportunity, cycle);
      } else {
        assert.equal(opportunity, DAILY_OUTLOOK[cat].mid[1][0]);
        bandDays++;
      }
    }
    assert.equal(lastSeen.size, scenes.size);
    assert.equal(bandDays, 30);
  }
});

// Count a recurrence once per eligible date in the same reader and field.
function countRepeats(rows, fields, counts, window = 7) {
  for (let i = window; i < rows.length; i++) {
    const previous = rows.slice(i - window, i);
    for (const field of fields) {
      if (previous.some(row => row[field] === rows[i][field])) counts[field]++;
    }
  }
}

const profiles = [
    [1958, 11, 3, null, 'F'], [1969, 2, 16, '06:00', 'M'], [1982, 9, 4, '18:35', 'F'], [1990, 5, 17, '14:30', 'F'],
    [1993, 1, 28, '03:40', 'M'], [2001, 8, 11, null, 'M'], [2006, 4, 6, '09:20', 'F'], [2010, 10, 19, '21:00', 'M'],
  ];
const sampleCharts = () => profiles.map(([y, m, d, time, gender]) => buildChart({ y, m, d, time, gender, calendar: 'solar' }));

test('개인·띠별 풀이의 직전 7일 동일 문구 비율은 각 항목에서 20% 이하이다', () => {
  const charts = sampleCharts();
  for (const lang of ['ko', 'en']) withLanguage(lang, () => {
    for (const [first, length] of [[{ y: 2026, m: 11, d: 1 }, 28], [{ y: 2026, m: 12, d: 15 }, 84]]) {
      const dates = Array.from({ length }, (_, i) => addDays(first, i));
      const counts = { opportunity: 0, caution: 0, action: 0 };
      for (const chart of charts) {
        const days = dates.map(date => day(chart, date).cats);
        for (const [idx] of CATS.entries()) {
          countRepeats(days.map(cats => cats[idx].reading), Object.keys(counts), counts);
        }
      }
      const total = (length - 7) * charts.length * CATS.length;
      for (const [field, n] of Object.entries(counts)) assert.ok(n <= total * 0.2, lang + ' ' + field + ' ' + n + '/' + total);
      const zodiac = { advice: 0 };
      for (let t = 0; t < 12; t++) countRepeats(dates.map(date => ttiDay(t, date)), ['advice'], zodiac);
      assert.ok(zodiac.advice <= 0.2 * (length - 7) * 12, lang + ' zodiac ' + zodiac.advice);
    }
  });
});

test('같은 직장운 주제도 월지 충·형에 맞춰 다른 제안을 하고 연애 상태를 추측하지 않는다', () => {
  const chart = buildChart({ gender: 'M', calendar: 'solar', y: 2010, m: 10, d: 19, time: '21:00' });
  for (const lang of ['ko', 'en']) withLanguage(lang, () => {
    const earlier = day(chart, { y: 2026, m: 11, d: 2 }).cats;
    const later = day(chart, { y: 2026, m: 11, d: 5 }).cats;
    const work = cats => cats.find(c => c.key === 'career').reading.action;
    assert.notEqual(work(earlier), work(later));
    const love = later.find(c => c.key === 'love').reading.basis;
    assert.doesNotMatch(love, /삼각관계|혼사|triangle|marriage/i);
    assert.match(love, lang === 'ko' ? /겁재/ : /Rival/);
  });
});

test('2026년 동일 표본에서 개인 일곱 분야와 각 띠의 직전 14일 문구·행동 중복률은 각각 20% 미만이다', () => {
  const dates = Array.from({ length: 365 }, (_, i) => addDays({ y: 2026, m: 1, d: 1 }, i));
  const charts = sampleCharts();
  for (const lang of ['ko', 'en']) withLanguage(lang, () => {
    const assertRate = (n, total, label) => assert.ok(n < total * 0.2, lang + ' ' + label + ' ' + n + '/' + total);
    const counts = CATS.map(() => ({ action: 0, behavior: 0 }));
    for (const chart of charts) {
      const days = dates.map(date => day(chart, date).cats);
      counts.forEach((count, i) => {
        const rows = days.map(cats => cats[i].reading).map(r => ({ ...r, behavior: practiceFamily(r.behavior) }));
        assert.ok(rows.every(r => r.behavior && r.action));
        countRepeats(rows, ['action', 'behavior'], count, 14);
      });
    }
    counts.forEach((count, i) => Object.values(count).forEach(n => assertRate(n, charts.length * 351, CATS[i])));
    for (let sign = 0; sign < 12; sign++) {
      const rows = dates.map(date => ttiDay(sign, date)).map(r => ({ ...r, behavior: practiceFamily(r.behavior) })), counts = { advice: 0, behavior: 0 };
      assert.ok(rows.every(r => r.behavior && r.advice));
      countRepeats(rows, ['advice', 'behavior'], counts, 14);
      Object.values(counts).forEach(n => assertRate(n, 351, sign));
    }
  });
});

test('같은 행동의 표현 두 개는 하나로 세고 실제 정산과 사전 예산 합의는 구분한다', () => {
  const brief = DAILY_ACTION_ALTERNATIVES['career-brief'];
  assert.notEqual(brief[0][0], brief[1][0]);
  assert.equal(brief[0][2], brief[1][2]);
  for (const lang of ['ko', 'en']) withLanguage(lang, () => {
    const get = d => ttiDay(0, { y: 2026, m: 1, d });
    assert.equal(get(7).behavior, 'reconcile-receipts');
    assert.equal(get(19).behavior, 'agree-budget-ceiling');
  });
});

test('띠별 7일 요약에 오늘과 공동 최고인 다른 날짜도 함께 나온다', () => {
  for (const lang of ['ko', 'en']) withLanguage(lang, () => {
    const html = animalDay(2, { today: { y: 2026, m: 12, d: 5 } }).body;
    assert.match(html, /(?:최고점은 70점|highest score in these seven days is 70)[^<]*12\/5[^<]*12\/10/);
  });
});
