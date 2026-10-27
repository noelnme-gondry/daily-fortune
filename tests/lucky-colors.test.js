import test from 'node:test';
import assert from 'node:assert/strict';
import T from '../src/content/text.js';
import { LUCKY_BANNERS, LUCKY_BANNER_SIZE } from '../src/content/lucky-banners.js';
import { EL_SLUG } from '../src/engine/core.js';
import { buildChart } from '../src/engine/chart.js';
import { reportColorPalettes, chartColorPalettes } from '../src/domain/lucky-colors.js';
import { chartColors, luckyBanner } from '../src/client/lucky-colors.js';
import { withLanguage } from '../src/i18n/runtime.js';

test('발급된 5개 배너 ID와 추적 코드를 오행에 정확히 연결한다', () => {
  assert.deepEqual(Object.keys(LUCKY_BANNERS), EL_SLUG);
  assert.deepEqual(Object.fromEntries(Object.entries(LUCKY_BANNERS).map(([slug, banner]) => [slug, banner.id])), {
    wood: 1043704, fire: 1043702, earth: 1043705, metal: 1043706, water: 1043707,
  });
  for (const banner of Object.values(LUCKY_BANNERS)) {
    assert.equal(banner.trackingCode, 'AF3219545');
    assert.equal(banner.template, 'carousel');
  }
});

test('미발급 상태에는 상품 개수 제한 없이 배너 자리 한 개만 만든다', () => {
  for (const lang of ['ko', 'en']) withLanguage(lang, () => {
    const html = luckyBanner([{ element: 0, colorIndices: [0] }], {});
    assert.match(html, /data-banner-state="pending"/);
    assert.equal([...html.matchAll(/data-lucky-banner-slot=/g)].length, 1);
    assert.doesNotMatch(html, /data-partner-ad-config|<a\b|<button\b|<img\b|<li\b/);
    if (lang === 'en') assert.doesNotMatch(html, /[가-힣]/);
  });
});

test('14개 행운색은 KR/EN에서 기존 계산 결과의 오행 배너에 연결된다', () => {
  for (const lang of ['ko', 'en']) withLanguage(lang, () => {
    let count = 0;
    T.element.forEach((element, el) => element.color.forEach((color, colorIndex) => {
      const palettes = reportColorPalettes({ el, color });
      assert.deepEqual(palettes, [{ element: el, colorIndices: [colorIndex] }]);
      const html = luckyBanner(palettes);
      assert.ok(html.includes(`data-lucky-banner-slot="${EL_SLUG[el]}"`));
      assert.ok(html.includes(`&quot;id&quot;:${LUCKY_BANNERS[EL_SLUG[el]].id}`));
      count++;
    }));
    assert.equal(count, 14);
  });
  assert.deepEqual(reportColorPalettes({ el: 0, color: '알 수 없는 색' }), []);
  assert.deepEqual(reportColorPalettes({ el: -1, color: '초록' }), []);
  assert.deepEqual(reportColorPalettes(null), []);
});

test('평생운·만세력은 실제 용신·희신 색을 표시하고 배너는 용신 그룹 한 개를 사용한다', () => {
  for (const time of ['03:40', null]) {
    const chart = buildChart({ calendar: 'solar', y: 1993, m: 1, d: 28, gender: 'F', time });
    const palettes = chartColorPalettes(chart);
    assert.deepEqual(palettes.map(p => p.element), [chart.roles.yong, chart.roles.hee]);
    for (const lang of ['ko', 'en']) withLanguage(lang, () => {
      const html = chartColors(chart);
      for (const { element } of palettes) assert.ok(html.includes(T.element[element].color.join(' · ')));
      const banner = luckyBanner(palettes);
      assert.ok(banner.includes(`data-lucky-banner-slot="${EL_SLUG[chart.roles.yong]}"`));
      assert.equal([...banner.matchAll(/data-lucky-banner-slot=/g)].length, 1);
      if (lang === 'en') assert.doesNotMatch(html + banner, /[가-힣]/);
    });
  }
  assert.deepEqual(chartColorPalettes({ roles: { yong: undefined, hee: 9 } }), []);
  assert.equal(chartColors({}), '');
  assert.equal(luckyBanner([]), '');
});

test('발급 설정을 SDK에 전달하고 상품 개수·상품 목록은 사이트에서 제한하지 않는다', () => {
  const html = luckyBanner([{ element: 0, colorIndices: [0] }], { wood: { id: 12345, trackingCode: 'AF1234567', width: 999, height: 999 } });
  assert.match(html, /data-banner-state="ready"/);
  assert.match(html, /쿠팡 파트너스/);
  assert.match(html, /&quot;id&quot;:12345/);
  assert.match(html, /&quot;width&quot;:&quot;100%&quot;/);
  assert.ok(html.includes(`&quot;height&quot;:&quot;${LUCKY_BANNER_SIZE.height}&quot;`));
  assert.doesNotMatch(html, /<li\b|<img\b|limit|items|products/);
  assert.match(luckyBanner([{ element: 0, colorIndices: [0] }], { wood: { id: 0 } }), /data-banner-state="pending"/);
});
