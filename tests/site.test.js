import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createSite } from '../src/site/render.js';
import { HOME } from '../src/content/pages.js';
import { BRAND } from '../src/content/brand.js';
import { withLanguage } from '../src/i18n/runtime.js';

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
    assert.ok(!/<button\b[^>]*>[^<]*예시/.test(visible), `${path}: 예시 버튼이 남아 있음`);
  }
});

test('내부 링크는 리디렉션되는 주소를 가리키지 않는다', () => {
  const moved = (href) => /[?&]lang=/.test(href) || !!site.redirect(href.split(/[?#]/)[0])
    || (!/\.[a-z0-9]+(\?|#|$)/i.test(href) && !href.split(/[?#]/)[0].endsWith('/'));
  for (const [path, html] of pages) {
    const bad = [...html.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1].replace(/&amp;/g, '&')).filter(moved);
    assert.deepEqual(bad, [], path);
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

test('새 브랜드가 홈·전체 페이지의 검색 정보·설치 이름에 일관되게 적용된다', () => {
  const home = site.render('/');
  assert.equal(head(home, /<title>(.*?)<\/title>/), HOME.title);
  assert.ok(home.includes(`<h1>${HOME.h1}</h1>`));
  for (const [path, html] of pages) {
    const brand = withLanguage(path.startsWith('/en/') ? 'en' : 'ko', () => ({ name: BRAND.name, alt: BRAND.alt }));
    assert.equal(head(html, /<meta property="og:site_name" content="(.*?)">/), brand.name, path);
    // 한국어 하위 페이지 제목은 브랜드를 붙이지 않고, 영어 하위 페이지는 기존처럼 붙인다.
    if (!['/', '/en/'].includes(path)) assert.equal(head(html, /<title>(.*?)<\/title>/).endsWith(` | ${brand.name}`), path.startsWith('/en/'), path);
    const ld = JSON.parse(head(html, /<script type="application\/ld\+json">(.*?)<\/script>/s));
    for (const node of ld['@graph'].filter((n) => ['WebSite', 'Organization'].includes(n['@type']))) {
      assert.equal(node.name, brand.name, path);
      assert.equal(node.alternateName, brand.alt, path);
    }
    assert.ok(html.includes(`src="${BRAND.logo}"`), path);
    assert.ok(!html.includes('오행 운세'), `${path}: 이전 브랜드명이 남아 있음`);
  }
  const manifest = JSON.parse(fs.readFileSync(new URL('../public/site.webmanifest', import.meta.url), 'utf8'));
  assert.equal(manifest.name, BRAND.name);
  assert.equal(manifest.short_name, BRAND.name);
  assert.ok(site.renderShare(null).includes(BRAND.name));
  assert.ok(!site.renderShare(null).includes('오행 운세'));
});

test('JSON-LD는 유효하고 이동 경로·FAQ가 화면과 일치한다', () => {
  for (const [path, html] of pages) {
    const ld = JSON.parse(head(html, /<script type="application\/ld\+json">(.*?)<\/script>/s));
    const types = ld['@graph'].map((n) => n['@type']);
    assert.ok(types.includes('Organization'), path);
    if (!['/', '/en/'].includes(path)) assert.ok(types.includes('BreadcrumbList'), path);
    const faq = ld['@graph'].find((n) => n['@type'] === 'FAQPage');
    if (faq) for (const q of faq.mainEntity) assert.ok(html.includes(q.name.replace(/&/g, '&amp;')), `${path}: FAQ 질문이 화면에 없음 — ${q.name}`);
  }
  const home = JSON.parse(head(site.render('/'), /<script type="application\/ld\+json">(.*?)<\/script>/s));
  assert.ok(home['@graph'].some((n) => n['@type'] === 'WebSite'));
});

test('연도별 만세력 Dataset 설명은 Google 길이 기준을 충족하고 본문과 일치한다', () => {
  // https://developers.google.com/search/docs/appearance/structured-data/dataset#dataset
  for (const [path, html] of pages.filter(([path]) => /^\/manseryeok\/\d{4}\/$/.test(path))) {
    const ld = JSON.parse(head(html, /<script type="application\/ld\+json">(.*?)<\/script>/s));
    const datasets = ld['@graph'].filter((node) => node['@type'] === 'Dataset');
    assert.equal(datasets.length, 1, path);
    const description = datasets[0].description;
    const length = [...description].length;
    assert.ok(length >= 50 && length <= 5000, `${path}: Dataset 설명 ${length}자`);
    const visible = html.replace(/<script[\s\S]*?<\/script>/g, '');
    assert.ok(visible.includes(description), `${path}: Dataset 설명이 본문에 없음`);
  }
});

test('sitemap·robots·rss·llms.txt', () => {
  const sm = site.sitemap();
  assert.equal((sm.match(/<loc>/g) || []).length, site.routes.length);
  assert.ok(site.robots().includes(`Sitemap: ${SITE}/sitemap.xml`));
  for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Yeti']) assert.ok(site.robots().includes(bot));
  assert.ok(site.rss().includes('<rss version="2.0"'));
  assert.ok(site.llms().startsWith(`# ${BRAND.name}`));
  assert.ok(site.llmsFull().includes('갑자일주'));
});

test('날짜가 바뀌는 페이지는 기준 날짜를 반영한다', () => {
  assert.ok(site.render('/today/').includes('2026년 10월 14일'));
  assert.ok(site.render('/tomorrow/').includes('2026년 10월 15일'));
  assert.ok(site.render('/tti/today/').includes('10월 14일'));
  const next = createSite({ site: SITE, assets: { css: '/a.css', js: '/a.js' }, now: Date.UTC(2027, 0, 2, 3) });
  assert.ok(next.has('/year/2028/'));
  assert.ok(next.has('/year/2026/'));
});

test('없는 경로는 null이고 404 페이지는 noindex', () => {
  assert.equal(site.render('/nope/'), null);
  assert.ok(site.notFound().includes('noindex'));
});

test('광고·GA·공유·정보 아이콘', () => {
  process.env.GA_MEASUREMENT_ID = 'G-ABC123';
  process.env.ADSENSE_SLOT_INLINE = '1234567890';
  const s2 = createSite({ site: SITE, assets: { css: '/a.css', js: '/a.js' }, now: Date.UTC(2026, 9, 14, 3) });
  const html = s2.render('/today/');
  assert.ok(html.includes('googletagmanager.com/gtag/js?id=G-ABC123'));
  assert.ok(html.includes('page_location:u.origin+u.pathname'), 'GA에 # 뒤와 쿼리를 보내지 않는다');
  assert.ok(html.includes('data-ad-slot="1234567890"'));
  assert.ok(html.includes('adsbygoogle.js?client=ca-pub-3073450406371629'));
  assert.ok(!html.includes('data-share-page'));
  assert.ok(html.includes('class="info"'));
  assert.equal(s2.adsTxt(), 'google.com, pub-3073450406371629, DIRECT, f08c47fec0942fa0\n');
  const share = s2.renderShare(new URLSearchParams({ k: 'rank', n: '서윤', s: '67.1', r: '95445', w: '1', t: 'B' }));
  assert.ok(share.includes('noindex'));
  assert.ok(!share.includes('adsbygoogle.js'), '공유 카드에는 광고를 넣지 않는다');
  assert.ok(share.includes(`<link rel="canonical" href="${SITE}/saju-ranking/">`));
  assert.ok(share.includes('page_title:"공유 카드'), 'GA 페이지 제목에 이름을 보내지 않는다');
  process.env.ADSENSE_CLIENT = 'off';
  const s3 = createSite({ site: SITE, assets: { css: '/a.css', js: '/a.js' } });
  assert.ok(!s3.render('/today/').includes('adsbygoogle'));
  assert.equal(s3.adsTxt(), '');
  delete process.env.GA_MEASUREMENT_ID; delete process.env.ADSENSE_SLOT_INLINE; delete process.env.ADSENSE_CLIENT;
});

test('결과 공유가 있는 계산기에는 별도 페이지 공유를 표시하지 않는다', () => {
  for (const { path } of site.routes) {
    const html = site.render(path);
    const resultPage = /data-tool="(?!home")/.test(html) || html.includes('id="tojeong-tool"');
    if (resultPage) assert.doesNotMatch(html, /data-share-page/, path);
  }
  for (const path of ['/', '/tti/', '/saju/']) assert.match(site.render(path), /data-share-page/, path);
});

test('새 페이지: 인생 캐릭터·사주 랭킹·60일주 랭킹', () => {
  for (const p of ['/life-story/', '/saju-ranking/', '/saju/ilju-ranking/']) assert.ok(site.has(p), p);
  assert.ok(site.render('/saju/ilju-ranking/').includes('정해일주'));
});
