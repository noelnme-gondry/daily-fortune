import test from 'node:test';
import assert from 'node:assert/strict';
import { createSite } from '../src/site/render.js';
import { sexagenary, iljuSlug, tenGod, BR_MAIN, TG } from '../src/engine/index.js';

const site = createSite({ site: 'https://fortune.example', assets: {}, now: Date.parse('2026-11-07T12:00:00+09:00') });

test('띠별 허브는 오늘 결과와 다른 안내이며 KR/EN URL과 탐색을 보존한다', () => {
  for (const prefix of ['', '/en']) {
    const hub = site.render(`${prefix}/tti/`);
    const today = site.render(`${prefix}/tti/today/`);
    assert.match(hub, /data-zodiac-guide/);
    assert.doesNotMatch(today, /data-zodiac-guide/);
    assert.match(hub, /data-partner-ad-slot/);
    assert.ok(hub.includes(`href="${prefix}/tti/today/"`));
    assert.ok(hub.includes(`href="${prefix}/tti/2027/"`));
    assert.ok(hub.includes(`href="${prefix}/tti/samjae/"`));
    assert.ok(hub.includes(`href="${prefix}/manseryeok/"`));
    assert.ok(hub.includes(`<link rel="canonical" href="https://fortune.example${prefix}/tti/">`));
    assert.ok(site.sitemap().includes(`<loc>https://fortune.example${prefix}/tti/</loc>`));
    if (prefix) assert.doesNotMatch(hub.match(/<main[\s\S]*?<\/main>/)[0], /[가-힣]/);
  }
});

test('60일주 비교는 기존 엔진의 같은 일간·다른 일지와 같은 일지·다른 일간을 보여준다', () => {
  for (let n = 0; n < 60; n++) for (const prefix of ['', '/en']) {
    const p = sexagenary(n), sameStem = sexagenary((n + 10) % 60), sameBranch = sexagenary((n + 12) % 60);
    const html = site.render(`${prefix}/saju/ilju/${iljuSlug(p)}/`);
    assert.match(html, /data-ilju-comparison/);
    for (const peer of [p, sameStem, sameBranch]) {
      assert.ok(html.includes(`data-comparison-pillar="${iljuSlug(peer)}"`));
      assert.ok(html.includes(`href="${prefix}/saju/ilju/${iljuSlug(peer)}/"`));
    }
    assert.ok(html.includes(`data-principal-relationship="${TG.indexOf(tenGod(p.s, BR_MAIN[p.b]))}"`));
    assert.doesNotMatch(html, /잘 맞는 분야:|같은 분야가 잘 맞습니다|분야에서 재능이 드러납니다/);
    if (prefix) assert.doesNotMatch(html.match(/<main[\s\S]*?<\/main>/)[0].replace(/data-[\w-]+="[^"]*"/g, ''), /[가-힣]/);
  }
});
