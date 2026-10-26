import test from 'node:test';
import assert from 'node:assert/strict';
import { createSite } from '../src/site/render.js';
import { READING_GUIDES } from '../src/content/reading-guides.js';
import { GUIDE_CATEGORIES } from '../src/content/guide-catalog.js';
import { withLanguage } from '../src/i18n/runtime.js';
import { buildChart, pillarLabel } from '../src/engine/index.js';
import { EXAMPLE_INPUT, MANSE_BOUNDARIES } from '../src/site/public-examples.js';
import { contentModified } from '../src/site/content-revisions.js';

const origin = 'https://fortune.example';
const site = createSite({ site: origin, assets: {}, now: Date.parse('2026-10-25T12:00:00+09:00') });
const added = READING_GUIDES.filter(g => g.published === '2026-10-25');
const mainOf = html => html.match(/<main[\s\S]*?<\/main>/)[0];

test('가이드 목록은 주제별 분류·관련 글·번역 본문을 하나의 목록에서 파생한다', () => {
  assert.equal(READING_GUIDES.length, 30);
  assert.equal(added.length, 26);
  assert.equal(new Set(READING_GUIDES.map(g => g.slug)).size, READING_GUIDES.length);
  for (const lang of ['ko', 'en']) withLanguage(lang, () => {
    for (const g of added) {
      assert.ok(GUIDE_CATEGORIES.some(c => c.id === g.category));
      assert.ok(g.copy.topics.length >= 3);
      assert.equal(g.copy.sections.length, 3);
      assert.equal(g.copy.checklist.length, 3);
      for (const slug of g.related) assert.ok(READING_GUIDES.some(r => r.slug === slug), `${g.slug} → ${slug}`);
      for (const section of g.copy.sections) assert.ok(section.paragraphs.length >= 2);
      if (lang === 'en') assert.doesNotMatch(JSON.stringify(g.copy), /[가-힣]/, g.slug);
    }
  });
  assert.equal(new Set(added.map(g => g.copy.sections.map(s => s.paragraphs.join(' ')).join(' '))).size, added.length);
});

test('전체 주제는 목록에서 발견되며 KR/EN 정적 본문·검색 메타·RSS가 연결된다', () => {
  const map = site.sitemap(), feed = site.rss();
  for (const prefix of ['', '/en']) {
    const hub = mainOf(site.render(`${prefix}/guides/`));
    for (const g of READING_GUIDES) {
      const path = `${prefix}/guides/${g.slug}/`, html = site.render(path), main = mainOf(html);
      assert.ok(hub.includes(`href="${path}"`), path);
      assert.ok(html.includes(`<link rel="canonical" href="${origin}${path}">`));
      assert.ok(html.includes(`href="${origin}/en/guides/${g.slug}/"`));
      assert.ok(map.includes(`<loc>${origin}${path}</loc>`));
      assert.equal((main.match(/<h1[ >]/g) || []).length, 1);
      assert.doesNotMatch(main, /undefined|NaN|\[object Object\]/, path);
      assert.doesNotMatch(html, /adsbygoogle|data-partner-ad-slot/, path);
      if (prefix) assert.doesNotMatch(main, /[가-힣]/, path);
      if (!prefix) {
        const item = feed.split('<item>').find(item => item.includes(`<link>${origin}${path}</link>`));
        assert.ok(item?.includes(new Date(`${g.published}T09:00:00+09:00`).toUTCString()), path);
      }
      const jsonld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
      const nodes = jsonld.flatMap(x => x['@graph'] || [x]);
      const article = nodes.find(x => x['@type'] === 'Article');
      assert.equal(article.datePublished, g.published, path);
      assert.equal(article.dateModified, contentModified(path), path);
    }
  }
});

test('가이드의 계산기·관련 글·목차 링크는 실제 경로와 앵커를 가리킨다', () => {
  for (const prefix of ['', '/en']) for (const g of added) {
    const path = `${prefix}/guides/${g.slug}/`, main = mainOf(site.render(path));
    assert.equal((main.match(/class="card link-card"/g) || []).length, 4, path);
    for (const [, href] of main.matchAll(/href="([/#][^"]*)"/g)) {
      const [target, fragment] = href.split('#');
      const targetPath = target || path;
      assert.ok(site.has(targetPath), `${path} → ${href}`);
      if (fragment) assert.ok(site.render(targetPath).includes(`id="${fragment}"`), `${path} → ${href}`);
    }
  }
  assert.ok(mainOf(site.render('/saju/')).includes('href="/guides/"'));
  assert.equal((mainOf(site.render('/')).match(/class="card link-card" href="\/guides\//g) || []).length, 4);
});

test('신규 가이드의 숫자와 원국·대운 표는 실제 엔진 값을 사용한다', () => {
  const c = buildChart({ ...EXAMPLE_INPUT });
  for (const slug of ['chart-reading', 'ten-gods-reading', 'hidden-stems']) {
    const html = site.render(`/guides/${slug}/`);
    for (const col of c.cols) assert.ok(html.includes(pillarLabel(col)), slug);
  }
  const strength = site.render('/guides/strength/');
  assert.ok(strength.includes(`${(c.ratio * 100).toFixed(2)}%`));
  const elements = site.render('/guides/five-elements-balance/');
  c.counts.forEach((n, i) => assert.ok(elements.includes(`<td>${n}</td><td>${c.weights[i].toFixed(2)}</td>`)));
  const cycles = site.render('/guides/major-cycles/');
  for (const d of c.daeun.slice(0, 4)) assert.ok(cycles.includes(`<th scope="row">${d.startYear}</th><td>${d.age}</td><td>${pillarLabel(d)}</td>`));
  for (const b of MANSE_BOUNDARIES) {
    const html = site.render(`/guides/${b.id === 'ipchun' ? 'ipchun' : 'midnight'}-boundary/`);
    for (const time of b.times) for (const col of buildChart({ ...b.input, time }).cols) assert.ok(html.includes(pillarLabel(col)));
  }
});
