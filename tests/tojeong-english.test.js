import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculateTojeong } from '../src/domain/tojeong.js';
import { tojeongView } from '../src/client/tojeong-view.js';
import { TOJEONG, tojeongHeadline } from '../src/content/tojeong.js';
import { tojeongPage } from '../src/site/pages/tojeong.js';
import { withLanguage } from '../src/i18n/runtime.js';

const read = (name) => JSON.parse(readFileSync(new URL(`../src/content/${name}`, import.meta.url), 'utf8'));
const korean = read('tojeong-144.json');
const english = read('tojeong-144.en.json');
const birth = { calendar: 'lunar', y: 1976, m: 8, d: 26 };

test('English Tojeong dataset covers all 144 codes and 1,872 passages', () => {
  assert.deepEqual(Object.keys(english).sort(), Object.keys(korean).sort());
  let passages = 0;
  for (const [code, original] of Object.entries(korean)) {
    const translated = english[code];
    assert.deepEqual(Object.keys(translated).sort(), Object.keys(original).sort(), code);
    assert.equal(translated.code, code);
    assert.deepEqual(Object.keys(translated.months), Object.keys(original.months), code);
    for (const [part, text] of Object.entries({ chongun: translated.chongun, ...translated.months })) {
      assert.equal(typeof text, 'string', `${code}/${part}`);
      assert.ok(text.trim().length > 20, `${code}/${part}`);
      assert.doesNotMatch(text, /[가-힣]/u, `${code}/${part}`);
      passages++;
    }
  }
  assert.equal(passages, 1872);
});

test('English Tojeong results retain calculated values, 12 accessible month regions, and safe names', () => {
  const result = calculateTojeong(birth, 2005);
  const before = JSON.parse(JSON.stringify(result));
  const html = withLanguage('en', () => tojeongView(result, english[result.code], '<img src=x onerror=alert(1)>'));
  assert.deepEqual(result, before);
  assert.equal(result.code, '212');
  assert.match(html, /Upper 2 · Middle 1 · Lower 2/);
  assert.match(html, /Your annual outlook/);
  assert.match(html, /Traditional counting age: 30/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(html, /<img src=x/);
  assert.doesNotMatch(html, /[가-힣]/u);
  assert.equal((html.match(/data-tojeong-month=/g) || []).length, 12);
  assert.equal((html.match(/role="region"/g) || []).length, 12);
  for (let month = 1; month <= 12; month++) {
    assert.ok(html.includes(`aria-controls="tj-month-${month}"`));
    assert.ok(html.includes(`aria-labelledby="tj-month-button-${month}"`));
    assert.ok(html.includes(`Lunar month ${month}`));
  }
  assert.throws(() => withLanguage('en', () => tojeongView(result, { chongun: 'Incomplete' })), /incomplete/);
  assert.match(tojeongView(result, korean[result.code]), /한 해의 총운/);
});

test('English Tojeong date conventions remain visible for leap months and adjusted birthdays', () => {
  const leap = calculateTojeong({ calendar: 'lunar', y: 1993, m: 3, d: 1, leap: true }, 2026);
  const adjusted = calculateTojeong({ calendar: 'lunar', y: 2004, m: 8, d: 30 }, 2005);
  // A reading is independent of the calculation explanation displayed around it.
  const reading = english['212'];
  assert.match(withLanguage('en', () => tojeongView(leap, reading)), /leap-month birthday was treated as the regular month/);
  assert.match(withLanguage('en', () => tojeongView(adjusted, reading)), /birthday day 30 was calculated as day 29/);
  assert.equal(adjusted.values.birthDay, 29);
});

test('English Tojeong page localizes forms, reference tables, FAQs, and edition notes', () => {
  const ctx = { today: { y: 2026, m: 10, d: 16 }, site: 'https://unse.example' };
  const page = withLanguage('en', () => tojeongPage(ctx));
  assert.match(page.title, /2026 Free Tojeong reading/);
  assert.match(page.body, /Birth time and gender are not needed/);
  assert.match(page.body, /Select a Tojeong year/);
  assert.match(page.body, /2026 Tojeong calculation reference/);
  assert.match(page.body, /Full MIT license/);
  assert.doesNotMatch(page.body, /[가-힣]/u);
  assert.equal(page.ld.find((item) => item['@type'] === 'WebApplication').inLanguage, 'en');
  assert.equal(withLanguage('en', () => TOJEONG.source), TOJEONG.source);
  assert.match(withLanguage('en', () => TOJEONG.editionNote), /unverified/);
  assert.match(TOJEONG.h1, /무료 토정비결/);
  const next = withLanguage('en', () => tojeongPage(ctx, 2027));
  assert.match(next.title, /2027 Tojeong/);
  assert.match(next.body, /Next year/);
  assert.equal(tojeongHeadline(english['212']), 'Gold enters the furnace, is refined, and becomes a great vessel.');
});
