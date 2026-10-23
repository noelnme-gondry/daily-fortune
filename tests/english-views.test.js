import test from 'node:test';
import assert from 'node:assert/strict';
import * as engine from '../src/engine/index.js';
import * as views from '../src/client/views.js';
import { rankView } from '../src/client/rank-tool.js';
import { storyView } from '../src/client/story-tool.js';
import { compatView } from '../src/client/compat-tool.js';
import { lifeView } from '../src/client/life-tool.js';
import TABLE from '../src/content/rank-table.js';
import { withLanguage, isEnglish, bilingual } from '../src/i18n/runtime.js';
import { ADJ } from '../src/content/story.js';
import { ADJ_FLAT, characterCode, shareUrl } from '../src/site/share-codec.js';

test('language scopes restore after nested rendering and failures; proxies stay dynamic', () => {
  const content = bilingual({ nested: { text: '한국어' }, list: ['원본'] }, { nested: { text: 'English' }, list: ['Translated'] });
  const nested = content.nested;
  withLanguage('en', () => {
    assert.equal(nested.text, 'English');
    assert.deepEqual(content.list.map((text) => text), ['Translated']);
    withLanguage('ko', () => assert.equal(content.nested.text, '한국어'));
    assert.ok(isEnglish());
  });
  assert.throws(() => withLanguage('en', () => { throw new Error('test'); }));
  assert.equal(isEnglish(), false);
  assert.equal(nested.text, '한국어');
});

test('all client result views render English while chart identities remain Korean', () => withLanguage('en', () => {
  const input = { name: 'Alex', gender: 'F', calendar: 'solar', y: 1993, m: 1, d: 28, time: '03:40' };
  const chart = engine.buildChart(input), other = engine.buildChart({ ...input, name: 'Sam', gender: 'M', y: 1988 });
  const today = { y: 2026, m: 10, d: 16 };
  const rank = engine.sajuRank(chart, TABLE), leaderRank = engine.sajuRank(engine.buildChart({ ...input, time: null }), TABLE);
  const rendered = {
    chart: views.chartCard(chart, input, today), day: views.dayView(engine.day(chart, today, 'today')),
    week: views.weekView(engine.week(chart, today), today), month: views.monthView(engine.month(chart, today.y, today.m), today),
    year: views.yearView(engine.year(chart, today.y), engine.yearMonths(chart, today.y), today),
    lifetime: lifeView(engine.lifetime(chart, today), chart, today), compatibility: compatView(engine.compat(chart, other, today), chart, other, today),
    calendar: views.manseView(chart), story: storyView(engine.lifeStory(chart, today), chart), rank: rankView(rank, chart, leaderRank),
  };
  for (const [name, html] of Object.entries(rendered)) {
    assert.doesNotMatch(html.replace(/<[^>]*>/g, ' '), /[가-힣]|undefined|NaN|\[object Object\]/, name);
    assert.doesNotMatch(html, /(?:aria-label|title)="[^"]*[가-힣]/, name);
  }
}));

test('character share codes have the same meaning in both languages', () => {
  const korean = withLanguage('ko', () => characterCode(ADJ.high[0], 'ranger'));
  const english = withLanguage('en', () => characterCode(ADJ.high[0], 'ranger'));
  assert.equal(english, korean);
  assert.notEqual(withLanguage('en', () => ADJ_FLAT[0]), withLanguage('ko', () => ADJ_FLAT[0]));
  assert.match(withLanguage('en', () => shareUrl('https://example.com', { k: 'story', c: english })), /^https:\/\/example.com\/en\/share\//);
});
