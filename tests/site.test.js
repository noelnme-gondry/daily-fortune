import test from 'node:test';
import assert from 'node:assert/strict';
import { createSite } from '../src/site/render.js';

const SITE = 'https://unse.example';
const site = createSite({ site: SITE, assets: { css: '/assets/s.css', js: '/assets/m.js', tool: '/assets/t.js' }, now: Date.UTC(2026, 9, 14, 3) });
const pages = site.routes.map((r) => [r.path, site.render(r.path)]);
const head = (html, re) => (html.match(re) || [])[1];

test('모든 경로가 렌더링되고 이상한 값이 없다', () => {
  assert.ok(pages.length > 150, `${pages.length}개`);
  for (const [path, html] of pages) {
    assert.ok(html.startsWith('<!doctype html>'), path);
    const visible = html.replace(/<script[\s\S]*?<\/script>/g, '');
    assert.ok(!/undefined|NaN|\[object Object\]/.test(visible), `${path}: ${(visible.match(/.{30}(undefined|NaN|\[object Object\]).{30}/) || [])[0]}`);
  }
});

test('제목·설명은 페이지마다 고유하고 canonical이 자기 주소다', () => {
  const titles = new Set(), descs = new Set();
  for (const [path, html] of pages) {
    const t = head(html, /<title>(.*?)<\/title>/);
    const d = head(html, /<meta name="description" content="(.*?)">/);
    assert.ok(t && d, path);
    assert.ok(!titles.has(t), `제목 중복: ${t}`);
    assert.ok(!descs.has(d), `설명 중복: ${path}`);
    titles.add(t); descs.add(d);
    assert.equal(head(html, /<link rel="canonical" href="(.*?)">/), `${SITE}${path}`);
    assert.equal(head(html, /<meta property="og:url" content="(.*?)">/), `${SITE}${path}`);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${path}: h1은 하나`);
  }
});

test('JSON-LD는 유효하고 이동 경로·FAQ가 화면과 일치한다', () => {
  for (const [path, html] of pages) {
    const ld = JSON.parse(head(html, /<script type="application\/ld\+json">(.*?)<\/script>/s));
    const types = ld['@graph'].map((n) => n['@type']);
    assert.ok(types.includes('Organization'), path);
    if (path !== '/') assert.ok(types.includes('BreadcrumbList'), path);
    const faq = ld['@graph'].find((n) => n['@type'] === 'FAQPage');
    if (faq) for (const q of faq.mainEntity) assert.ok(html.includes(q.name.replace(/&/g, '&amp;')), `${path}: FAQ 질문이 화면에 없음 — ${q.name}`);
  }
  const home = JSON.parse(head(site.render('/'), /<script type="application\/ld\+json">(.*?)<\/script>/s));
  assert.ok(home['@graph'].some((n) => n['@type'] === 'WebSite'));
});

test('sitemap·robots·rss·llms.txt', () => {
  const sm = site.sitemap();
  assert.equal((sm.match(/<loc>/g) || []).length, site.routes.length);
  assert.ok(site.robots().includes(`Sitemap: ${SITE}/sitemap.xml`));
  for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Yeti']) assert.ok(site.robots().includes(bot));
  assert.ok(site.rss().includes('<rss version="2.0"'));
  assert.ok(site.llms().startsWith('# 오행 운세'));
  assert.ok(site.llmsFull().includes('갑자일주'));
});

test('날짜가 바뀌는 페이지는 기준 날짜를 반영한다', () => {
  assert.ok(site.render('/today/').includes('2026년 10월 14일'));
  assert.ok(site.render('/tomorrow/').includes('2026년 10월 15일'));
  assert.ok(site.render('/tti/today/').includes('10월 14일'));
  const next = createSite({ site: SITE, assets: { css: '/a.css', js: '/a.js' }, now: Date.UTC(2027, 0, 2, 3) });
  assert.ok(next.has('/year/2028/'));
  assert.ok(!next.has('/year/2026/'));
});

test('없는 경로는 null이고 404 페이지는 noindex', () => {
  assert.equal(site.render('/nope/'), null);
  assert.ok(site.notFound().includes('noindex'));
});
