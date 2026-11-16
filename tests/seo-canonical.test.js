import test from 'node:test';
import assert from 'node:assert/strict';
import { createSite } from '../src/site/render.js';

const origin = 'https://fortune.example';
test('판매 모드에서만 상품 중복 주소를 기존 운세 URL로 통합하고 구매·연도별 주소를 보존한다', () => {
  const previous = process.env.FORTUNE_PAID_READINGS;
  try {
    for (const paid of [true, false]) {
      process.env.FORTUNE_PAID_READINGS = paid ? '1' : '0';
      const site = createSite({ site: origin, assets: {}, now: Date.UTC(2026, 10, 16, 3) });
      const sitemap = site.sitemap();
      for (const prefix of ['', '/en']) for (const id of ['lifetime', 'compatibility', 'tojeong']) {
        const path = `${prefix}/shop/${id}/`;
        const canonical = `${prefix}${paid ? `/${id}/` : `/shop/${id}/`}`;
        const html = site.render(path);
        assert.ok(html.includes(`<link rel="canonical" href="${origin}${canonical}">`), `${paid}: ${path}`);
        assert.ok(html.includes(`<meta property="og:url" content="${origin}${canonical}">`));
        assert.ok(html.includes(`"url":"${origin}${canonical}"`));
        assert.ok(html.includes(`hreflang="en" href="${origin}/en${paid ? `/${id}/` : `/shop/${id}/`}"`));
        assert.equal(sitemap.includes(`<loc>${origin}${path}</loc>`), !paid);
        assert.ok(sitemap.includes(`<loc>${origin}${prefix}/${id}/</loc>`));
        assert.doesNotMatch(html, /name="robots" content="noindex/);
        assert.equal(site.redirect(path), null);
        if (!prefix) assert.ok(html.includes('id="purchase-form"'));
        if (paid) assert.ok(site.render(`${prefix}/`).includes(`href="${prefix}/${id}/"`));
      }
      for (const prefix of ['', '/en']) {
        const nextYear = `${prefix}/tojeong/2027/`;
        assert.ok(site.render(nextYear).includes(`<link rel="canonical" href="${origin}${nextYear}">`));
        assert.ok(sitemap.includes(`<loc>${origin}${nextYear}</loc>`));
        for (const path of ['orders', 'result']) assert.ok(!sitemap.includes(`<loc>${origin}${prefix}/shop/${path}/</loc>`));
      }
    }
  } finally {
    if (previous === undefined) delete process.env.FORTUNE_PAID_READINGS;
    else process.env.FORTUNE_PAID_READINGS = previous;
  }
});
