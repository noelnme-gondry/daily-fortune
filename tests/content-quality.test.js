import test from 'node:test';
import assert from 'node:assert/strict';
import { createSite } from '../src/site/render.js';
import { buildChart, week, month, isoDate } from '../src/engine/index.js';
import { EXAMPLE_INPUT } from '../src/site/public-examples.js';

const origin = 'https://fortune.example';
const site = createSite({ site: origin, assets: {}, now: Date.parse('2026-10-24T12:00:00+09:00') });

test('공개 계산 예시는 main 안에서 코드가 배치한 광고보다 먼저 읽힌다', () => {
  for (const prefix of ['', '/en']) for (const path of ['/today/', '/tomorrow/', '/week/', '/month/', '/lifetime/', '/compatibility/', '/life-story/', '/saju-ranking/', '/manseryeok/', '/year/2027/']) {
    const html = site.render(`${prefix}${path}`);
    const example = html.indexOf('id="public-example"');
    assert.ok(example > html.indexOf('<main'), path);
    assert.ok(example < html.indexOf('</main>'), path);
    assert.ok(example < html.indexOf('class="partner-ad"'), path);
  }
});

test('404와 운영·탐색 화면은 AdSense와 파트너 광고를 요청하지 않는다', () => {
  for (const prefix of ['', '/en']) {
    for (const path of ['/about/', '/privacy/', '/year/', '/saju/', '/saju/ilgan/', '/saju/sipsin/', '/saju/ohaeng/']) {
      const html = site.render(`${prefix}${path}`);
      assert.doesNotMatch(html, /adsbygoogle|pagead2\.googlesyndication|data-partner-ad-slot/, path);
    }
    assert.doesNotMatch(site.notFound(prefix ? 'en' : 'ko'), /adsbygoogle|pagead2\.googlesyndication|data-partner-ad-slot/);
  }
  assert.match(site.adsTxt(), /google\.com, pub-/);
});

test('주간·월간 공개 사례의 모든 날짜와 점수는 계산기와 일치한다', () => {
  const c = buildChart({ ...EXAMPLE_INPUT });
  for (const mode of ['week', 'month']) {
    const r = mode === 'week' ? week(c, site.ctx.today) : month(c, 2026, 10);
    const html = site.render(`/${mode}/`);
    assert.ok(html.includes(`data-example-overall>${r.overall.score}</b>`));
    for (const d of r.days) assert.match(html, new RegExp(`<th scope="row">${isoDate(d.date)}</th>[\\s\\S]*?<td>${d.score}</td>`));
  }
});

test('새 가이드·운영 경로는 KR/EN 본문·canonical·사이트맵·내부 링크가 완결된다', () => {
  const paths = ['/guides/', '/guides/birth-time/', '/guides/fortune-scores/', '/guides/compatibility/', '/guides/tojeong/', '/editorial/', '/contact/'];
  const map = site.sitemap();
  for (const prefix of ['', '/en']) for (const path of paths) {
    const url = `${prefix}${path}`, html = site.render(url);
    assert.ok(html, url);
    assert.ok(html.includes(`<link rel="canonical" href="${origin}${url}">`), url);
    assert.ok(map.includes(`<loc>${origin}${url}</loc>`), url);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, url);
    assert.doesNotMatch(html, /adsbygoogle|data-partner-ad-slot/, url);
    if (prefix) assert.doesNotMatch(html.match(/<main[\s\S]*?<\/main>/)[0], /[가-힣]/, url);
    for (const [, href] of html.matchAll(/<a\b[^>]*href="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
      if (/\.[a-z]+$/.test(href)) continue;
      assert.ok(site.has(href), `${url} → ${href}`);
    }
  }
  for (const path of paths.slice(1, 5)) {
    const item = site.rss().split('<item>').find(item => item.includes(`<link>${origin}${path}</link>`));
    assert.ok(item, path);
    assert.ok(item.includes(new Date('2026-10-24T09:00:00+09:00').toUTCString()));
  }
});

test('운영 연락처와 편집 기준은 실제 연결되고 백과의 단정적 궁합 표현을 완화한다', () => {
  for (const path of ['/about/', '/privacy/', '/contact/', '/editorial/']) {
    const html = site.render(path);
    assert.match(html, /href="mailto:gondry\.montauk@gmail\.com"/);
    assert.match(html, /Gondry Workshop/);
  }
  const html = site.render('/saju/ilju/gapja/');
  assert.doesNotMatch(html, /천생연분/);
  assert.match(html, /전통 명리 용어/);
  assert.match(html, /href="\/editorial\/"/);
  assert.match(site.render('/editorial/'), /AI 도구를 활용/);
});
