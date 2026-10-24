import test from 'node:test';
import assert from 'node:assert/strict';
import { createSite } from '../src/site/render.js';
import { withLanguage } from '../src/i18n/runtime.js';
import * as knowledge from '../src/content/knowledge.js';
import { TOOLS, ABOUT, PRIVACY, HOME, SITE, MANSE_COPY, yearTool } from '../src/content/pages.js';
import { TIPS } from '../src/content/tips.js';
import { UNKNOWN_TIME } from '../src/content/calculation-notes.js';
import { parseShare } from '../src/site/pages/share.js';
import { buildChart, day, week, month, year, COMPAT_HEADLINES } from '../src/engine/index.js';

const snapshot = (lang, fn) => withLanguage(lang, () => JSON.parse(JSON.stringify(fn())));
const englishStrings = (value, path = '') => {
  if (typeof value === 'string') assert.doesNotMatch(value, /[가-힣]/, path);
  else if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) englishStrings(child, `${path}/${key}`);
};

test('English encyclopedia, help and page copy cover every displayed value', () => {
  englishStrings(snapshot('en', () => ({ knowledge, TOOLS, ABOUT, PRIVACY, HOME, SITE, TIPS, UNKNOWN_TIME, calendar: MANSE_COPY.year(2026), annual: yearTool(2026, 'This year') })));
  assert.equal(snapshot('ko', () => knowledge.SIPSIN['비견'].keywords[0]), '자립');
  assert.equal(snapshot('en', () => knowledge.SIPSIN['비견'].keywords[0]), 'Independence');
  assert.deepEqual(snapshot('en', () => knowledge.SINSAL.map(({ slug, kind }) => ({ slug, kind }))), snapshot('ko', () => knowledge.SINSAL.map(({ slug, kind }) => ({ slug, kind }))));
});

test('Every English non-Tojeong page renders English text and metadata without truncating pillar names', () => {
  const site = createSite({ site: 'https://fortune.example', assets: {}, now: Date.UTC(2026, 9, 16) });
  const routes = site.routes.filter((r) => r.lang === 'en' && !r.path.startsWith('/en/tojeong/'));
  assert.equal(routes.length, site.routes.filter(r => !r.lang && !r.path.startsWith('/tojeong/')).length);
  for (const route of routes) {
    const page = site.page(route.path);
    englishStrings({ title: page.title, description: page.description, crumbs: page.crumbs, ld: page.ld }, route.path);
    const visible = `${page.body || ''}${page.supplement || ''}`.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<[^>]*>/g, ' ');
    assert.doesNotMatch(visible, /[가-힣]|undefined|NaN|\[object Object\]/, route.path);
  }
  assert.match(site.page('/en/today/').body, /gye-hae/);
  assert.match(site.page('/en/saju/ohaeng/wood/').body, /Water generates Wood; Wood generates Fire/);
  assert.match(site.page('/en/manseryeok/').body, /Birth-country and birth-location corrections are not included/);
});

test('Approved shared headlines survive switching language in both directions', () => {
  const date = { y: 2026, m: 10, d: 16 };
  const input = { y: 1990, m: 5, d: 17, time: '14:30', gender: 'M' };
  const reports = {
    today: (c) => day(c, date), tomorrow: (c) => day(c, { ...date, d: 17 }),
    week: (c) => week(c, date), month: (c) => month(c, 2026, 10), year: (c) => year(c, 2026),
  };
  for (const [kind, report] of Object.entries(reports)) {
    const ko = snapshot('ko', () => report(buildChart(input)).overall);
    const en = snapshot('en', () => report(buildChart(input)).overall);
    for (const [source, target, lang] of [[ko, en, 'en'], [en, ko, 'ko']]) {
      const query = new URLSearchParams({ k: kind, s: String(source.score), h: source.headline, y: '2026' });
      const card = withLanguage(lang, () => parseShare(query));
      assert.ok(card, `${kind}: ${lang}`);
      assert.equal(card.title, target.headline);
    }
  }
  for (let i = 0; i < 5; i++) {
    const ko = withLanguage('ko', () => COMPAT_HEADLINES[i]);
    const en = withLanguage('en', () => COMPAT_HEADLINES[i]);
    assert.equal(withLanguage('en', () => parseShare(new URLSearchParams({ k: 'compat', s: '70', h: ko }))).title, en);
    assert.equal(withLanguage('ko', () => parseShare(new URLSearchParams({ k: 'compat', s: '70', h: en }))).title, ko);
  }
  assert.equal(withLanguage('en', () => parseShare(new URLSearchParams({ k: 'today', s: '70', h: 'unapproved text' }))), null);
});
