import assert from 'node:assert/strict';
import test from 'node:test';
import { ttiDay, addDays, CATS } from '../src/engine/index.js';
import { zodiacDayDetail } from '../src/domain/zodiac-day-detail.js';
import { ZODIAC_DAY_SCENES } from '../src/content/zodiac-day-scenes.js';
import { ZODIAC_DAY_STORIES } from '../src/content/zodiac-day-stories.js';
import { withLanguage } from '../src/i18n/runtime.js';

test('모든 띠별 일간 장면에 독립 원고가 있고 60일 동안 일곱 분야와 두 언어가 이어진다', () => {
  const themes = Object.values(ZODIAC_DAY_SCENES).flat().map(scene => scene[6]);
  assert.deepEqual(themes.sort(), Object.keys(ZODIAC_DAY_STORIES).sort());
  for (const editions of Object.values(ZODIAC_DAY_STORIES)) assert.equal(editions.length, 2);
  for (let day = 0; day < 60; day++) {
    const date = addDays({ y: 2026, m: 11, d: 27 }, day);
    for (const lang of ['ko', 'en']) withLanguage(lang, () => {
      const stories = new Set();
      const editions = new Set();
      for (let sign = 0; sign < 12; sign++) {
        const reading = ttiDay(sign, date);
        const { story, areas } = zodiacDayDetail(reading);
        stories.add(story);
        editions.add(areas.map(a => a.text).join(' '));
        const next = zodiacDayDetail(ttiDay(sign, addDays(date, 1)));
        assert.notEqual(story, next.story);
        areas.forEach((area, i) => assert.notEqual(area.text, next.areas[i].text));
        assert.deepEqual(areas.map(a => a.key).sort(), [...CATS].sort());
        const texts = [story, ...areas.map(a => a.text)];
        assert.equal(new Set(texts).size, texts.length);
        for (const text of texts) {
          assert.ok(!reading.text.includes(text));
          assert.equal(/[가-힣]/.test(text), lang === 'ko');
          assert.ok(text.split(/[.!?](?:\s|$)/u).filter(Boolean).length >= 4);
        }
      }
      assert.equal(stories.size, 12);
      assert.equal(editions.size, 12);
    });
  }
});
