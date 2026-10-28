import test from 'node:test';
import assert from 'node:assert/strict';
import { createSite } from '../src/site/render.js';
import { HOME, TOOLS, FREE_ACCESS } from '../src/content/pages.js';
import { BRAND } from '../src/content/brand.js';
import { READING_GUIDES } from '../src/content/reading-guides.js';
import { contentModified } from '../src/site/content-revisions.js';
import { withLanguage } from '../src/i18n/runtime.js';
import { esc } from '../src/site/util.js';

const origin = 'https://fortune.example';
const site = createSite({ site: origin, assets: {}, now: Date.parse('2026-10-26T12:00:00+09:00') });
const main = html => html.match(/<main[\s\S]*?<\/main>/)[0];

for (const lang of ['ko', 'en']) {
  const prefix = lang === 'en' ? '/en' : '';
  test(`${lang}: 홈은 전용 무료운세 메타와 기존 서비스 목록을 가이드보다 앞에 제공한다`, () => withLanguage(lang, () => {
    const html = site.render(`${prefix}/`), body = main(html);
    assert.ok(html.includes(`<title>${esc(HOME.title)}</title>`));
    assert.ok(html.includes(`<meta name="description" content="${esc(HOME.description)}">`));
    assert.ok(body.includes(`<h1>${esc(HOME.h1)}</h1>`));
    assert.ok(body.includes(`<p class="lead">${esc(HOME.lead)}</p>`));
    assert.ok(body.includes(FREE_ACCESS.description));
    const services = body.indexOf('class="box-sec home-services"');
    assert.ok(body.indexOf('id="tool"') < services);
    for (const marker of ['class="reading-guides"', 'class="box-sec reading-guide-links"', 'class="home-features"']) assert.ok(services < body.indexOf(marker));
    const cards = body.match(/<div class="cards home-tools">([\s\S]*?)<\/div>/)[1];
    const paths = [...cards.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
    assert.equal(paths.length, 10);
    assert.equal(new Set(paths).size, 10);
    assert.deepEqual(paths.slice(0, 4), ['/today/', '/year/2026/', '/lifetime/', '/compatibility/'].map(path => `${prefix}${path}`));
    for (const path of paths) assert.ok(site.has(path));
    if (!prefix) assert.equal(HOME.title, `무료운세 | 오늘의 운세·사주·궁합 - ${BRAND.name}`);
    assert.equal(site.page(`${prefix}/today/`).title, TOOLS.today.title, '오늘 제목은 유지');
  }));

  test(`${lang}: 홈 검색·공유 설명은 본문 소개와 분리하고 한국어는 80자 이내로 제공한다`, () => withLanguage(lang, () => {
    const html = site.render(`${prefix}/`);
    const description = html.match(/<meta name="description" content="([^"]+)">/)[1];
    if (lang === 'ko') assert.ok([...description].length <= 80, `네이버 설명 권장 길이 초과: ${[...description].length}자`);
    assert.notEqual(HOME.description, HOME.lead);
    for (const attribute of ['name="description"', 'property="og:description"', 'name="twitter:description"']) {
      const tags = [...html.matchAll(new RegExp(`<meta ${attribute} content="([^"]+)">`, 'g'))];
      assert.equal(tags.length, 1, attribute);
      assert.equal(tags[0][1], esc(HOME.description), attribute);
    }
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
    assert.equal(graph.find(node => node['@type'] === 'WebPage').description, HOME.description);
    if (lang === 'en') assert.doesNotMatch(description, /[가-힣]/);
  }));

  test(`${lang}: 개인·띠별 선택과 가이드의 문맥 링크가 서버 HTML에 있고 기존 경로를 유지한다`, () => {
    const html = main(site.render(`${prefix}/today/`));
    const entry = html.match(/<nav class="reading-entry"[\s\S]*?<\/nav>/)[0];
    assert.ok(entry.includes('href="#tool"'));
    assert.ok(entry.includes(`href="${prefix}/tti/today/"`));
    assert.ok(html.indexOf('class="reading-entry"') < html.indexOf('id="tool"'));
    assert.equal((html.match(/id="public-example"/g) || []).length, 1);
    const scores = main(site.render(`${prefix}/guides/fortune-scores/`)).match(/<section class="prose" id="comparison"[\s\S]*?<\/section>/)[0];
    assert.ok(scores.includes(`href="${prefix}/today/"`));
    const zodiac = main(site.render(`${prefix}/guides/zodiac-samjae/`)).match(/<section class="prose" id="section-1"[\s\S]*?<\/section>/)[0];
    for (const path of ['/today/', '/tti/today/']) assert.ok(zodiac.includes(`href="${prefix}${path}"`));
    const hub = main(site.render(`${prefix}/guides/`)).match(/<nav class="guide-tool-nav"[\s\S]*?<\/nav>/)[0];
    for (const path of ['/', '/today/']) assert.ok(hub.includes(`href="${prefix}${path}"`));
    if (prefix) for (const body of [html, scores, zodiac, hub]) assert.doesNotMatch(body, /[가-힣]/);
  });

  test(`${lang}: 대표 URL의 검색 메타·canonical·hreflang·H1과 편집한 가이드 수정일을 확인한다`, () => {
    for (const path of ['/', '/today/', '/tti/today/']) {
      const html = site.render(`${prefix}${path}`);
      assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
      assert.match(html, /<title>[^<]+<\/title>/);
      assert.match(html, /<meta name="description" content="[^"]+">/);
      assert.ok(html.includes(`rel="canonical" href="${origin}${prefix}${path}"`));
      for (const [locale, url] of [['ko', path], ['en', `/en${path}`]]) assert.ok(html.includes(`hreflang="${locale}" href="${origin}${url}"`));
      assert.doesNotMatch(html, /noindex/);
    }
    for (const path of ['/guides/', '/guides/fortune-scores/', '/guides/zodiac-samjae/']) {
      assert.equal(contentModified(`${prefix}${path}`), '2026-10-26');
      assert.ok(site.sitemap().includes(`<loc>${origin}${prefix}${path}</loc><lastmod>2026-10-26</lastmod>`));
    }
    assert.equal(contentModified(`${prefix}/guides/career/`), '2026-10-25');
    for (const g of READING_GUIDES.filter(g => g.linkSection !== undefined)) assert.ok(g.linkSection >= 0 && g.linkSection < g.copy.sections.length);
  });
}
