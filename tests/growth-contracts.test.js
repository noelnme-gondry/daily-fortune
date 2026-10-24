import test from 'node:test';
import assert from 'node:assert/strict';
import { createSite } from '../src/site/render.js';
import { contentModified } from '../src/site/content-revisions.js';
import { toolNavigation, nextTools } from '../src/site/tool-navigation.js';
import { withLanguage } from '../src/i18n/runtime.js';
import { AD_POSITION_EXPERIMENT, assignAdVariant } from '../src/domain/ad-experiment.js';

const site = now => createSite({ site: 'https://makeyourownday-fortune.com', assets: { css: '/a.css', js: '/a.js' }, now: new Date(now).getTime() });
test('새해에도 기존 54개 연도 경로·자기 canonical·양언어 연결·사이트맵을 보존한다', () => {
  const before = site('2026-12-31T23:59:00+09:00'), after = site('2027-01-01T00:01:00+09:00');
  const paths = before.routes.filter(r => /\/(?:year|manseryeok|tti)\/2026\//.test(r.path)).map(r => r.path);
  assert.equal(paths.length, 54);
  for (const path of paths) {
    assert.ok(after.has(path), path);
    const html = after.render(path);
    assert.match(html, /class="archive-note note"/);
    assert.ok(html.includes(`rel="canonical" href="https://makeyourownday-fortune.com${path}"`), path);
    assert.ok(html.includes(`hreflang="en" href="https://makeyourownday-fortune.com/en${path.replace(/^\/en/, '')}"`));
    assert.ok(after.sitemap().includes(`<loc>https://makeyourownday-fortune.com${path}</loc>`));
  }
  assert.equal(after.redirect('/tojeong/2027/'), '/tojeong/');
  assert.ok(after.has('/tojeong/2026/'));
  assert.match(after.render('/year/'), /href="\/year\/2026\/"/);
  assert.match(after.render('/tti/2027/'), /href="\/tti\/2026\/"/);
});
test('본문 수정일·JSON-LD·article·sitemap이 일치하며 편집한 백과와 미수정 콘텐츠의 이력을 구분한다', () => {
  const app = site('2026-10-20T12:00:00+09:00');
  for (const path of ['/saju/sipsin/', '/tti/2027/rat/', '/tojeong/2027/', '/en/tti/2027/rat/']) {
    const date = contentModified(path), html = app.render(path);
    assert.equal(app.page(path).modified, date);
    for (const match of html.matchAll(/"dateModified":"([^"]+)"/g)) assert.equal(match[1], date);
    assert.ok(app.sitemap().includes(`<loc>https://makeyourownday-fortune.com${path}</loc><lastmod>${date}</lastmod>`));
  }
  assert.equal(contentModified('/saju/sipsin/'), '2026-10-24');
  assert.equal(contentModified('/en/tti/2027/rat/'), '2026-10-20');
  assert.equal(app.page('/today/').modified, '2026-10-20');
});
test('도구별 다음 행동은 기존 도구 정의에서 파생되고 KR/EN에 같은 주소를 사용한다', () => {
  const today = { y: 2026, m: 10, d: 20 };
  for (const lang of ['ko', 'en']) withLanguage(lang, () => {
    const all = toolNavigation(today);
    assert.equal(new Set(all.map(t => t.path)).size, all.length);
    assert.equal(nextTools('today', today)[0].path, '/tomorrow/');
    assert.equal(nextTools('year', today)[0].path, '/month/');
    assert.ok(all.every(t => t.nav && !t.nav.includes('undefined')));
  });
});
test('광고 v2는 v1 배정을 재사용하지 않고 새 요약 위치를 구분한다', () => {
  const values = new Map([['myod:ad-position:v1', 'B']]);
  const result = assignAdVariant([{ scope: 'browser', open: () => ({ getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) }) }], () => 0);
  assert.equal(result.variant, 'A');
  assert.equal(AD_POSITION_EXPERIMENT.id, 'ad_position_v2');
  assert.equal(AD_POSITION_EXPERIMENT.placements.A, 'after_summary');
  assert.equal(values.get('myod:ad-position:v1'), 'B');
});
