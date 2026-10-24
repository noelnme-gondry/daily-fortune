import test from 'node:test';
import assert from 'node:assert/strict';
import { createSite } from '../src/site/render.js';
import { allowsAds } from '../src/site/ad-policy.js';

const site = createSite({ site: 'https://unse.example', assets: { css: '/s.css', js: '/m.js' }, now: Date.UTC(2026, 9, 14, 3) });

test('공통 광고 지면은 광고를 허용한 콘텐츠 페이지의 본문 뒤·푸터 앞에 한 번만 나온다', () => {
  for (const { path } of site.routes) {
    const html = site.render(path);
    const count = (html.match(/data-partner-ad-slot="common"/g) || []).length;
    assert.equal(count, allowsAds(site.page(path)) ? 1 : 0, path);
    if (!allowsAds(site.page(path))) continue;
    assert.match(html, /<\/main>\s*<aside class="partner-ad" aria-label="(?:광고|Advertisement)">[\s\S]*?<\/aside>\s*<footer class="site-foot">/, path);
    assert.match(html, path.startsWith('/en/') ? /We may earn a commission/ : /이 배너는 쿠팡 파트너스 활동의 일환으로/, `${path}: 수수료 고지`);
    assert.match(html, /data-partner-ad-config="[^"]*&quot;id&quot;:1039151/, `${path}: 발급 배너 설정`);
  }
});

test('개인화 공유 페이지와 404에는 공통 광고 지면이 없다', () => {
  for (const html of [site.renderShare(null), site.renderShare(new URLSearchParams({ k: 'life', i: 'gapja', n: '검증' })), site.notFound()]) {
    assert.doesNotMatch(html, /data-partner-ad-slot/);
    assert.doesNotMatch(html, /AF3219545/);
  }
});
