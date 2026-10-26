import test from 'node:test';
import assert from 'node:assert/strict';
import { buildChart, day, week, bandOf, addDays, CATS } from '../src/engine/index.js';
import { dayView } from '../src/client/views.js';
import { DAILY_OUTLOOK, DAILY_OVERVIEW } from '../src/content/daily-outlook.js';
import { dailyReading, dailyOverview } from '../src/domain/daily-reading.js';
import { withLanguage } from '../src/i18n/runtime.js';

const start = { y: 2026, m: 10, d: 26 };
const input = { gender: 'F', calendar: 'solar', y: 1993, m: 1, d: 28, time: '03:40' };

test('기존 일곱 운과 모든 점수대에 흐름·기회·주의점의 한영 해석이 있다', () => {
  assert.deepEqual(Object.keys(DAILY_OUTLOOK), CATS);
  for (const cat of CATS) {
    assert.deepEqual(Object.keys(DAILY_OUTLOOK[cat]), Object.keys(DAILY_OVERVIEW));
    for (const band of Object.keys(DAILY_OVERVIEW)) for (const lang of ['ko', 'en']) withLanguage(lang, () => {
      const reading = dailyReading(cat, band, { action: 'action', basis: 'basis', change: 'change' });
      for (const field of ['outlook', 'opportunity', 'caution']) {
        assert.ok(reading[field].length > 40, `${lang} ${cat} ${band} ${field}`);
        assert.doesNotMatch(reading[field], /undefined|NaN|\[object Object\]/);
        if (lang === 'en') assert.doesNotMatch(reading[field], /[가-힣]/);
      }
      assert.equal(reading.text, [reading.outlook, reading.opportunity, reading.caution, 'action', 'basis', 'change'].join(' '));
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
          assert.equal(cat.reading.outlook, DAILY_OUTLOOK[cat.key][band][0][lang === 'ko' ? 0 : 1]);
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

test('일간 카드의 본문은 펼쳐지고 근거만 접히며 사용자 문자열을 이스케이프한다', () => {
  const r = day(buildChart(input), start);
  r.cats[0].name = '<img src=x>';
  r.cats[0].reading.outlook = '<script>alert(1)</script>';
  const html = dayView(r), second = dayView(r);
  assert.equal((html.match(/class="daily-cat card"/g) || []).length, 7);
  assert.doesNotMatch(html, / hidden|<script>|<img src=x>/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /<details class="reading-basis">/);
  const ids = [...(html + second).matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, '주간·월간 상세를 함께 렌더해도 ID는 유일');
  for (const [, ref] of html.matchAll(/(?:href="#|aria-labelledby=")([^"]+)"/g)) assert.ok(ids.includes(ref), ref);
  const emptyBasis = { ...r, cats: r.cats.map(cat => ({ ...cat, reading: { ...cat.reading, basis: '' } })) };
  assert.doesNotMatch(dayView(emptyBasis), /data-daily-basis/);
});
