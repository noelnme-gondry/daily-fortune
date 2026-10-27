import { test, expect } from '@playwright/test';
import { buildChart, day, week, month, year, addDays } from '../../src/engine/index.js';
import T from '../../src/content/text.js';
import { withLanguage } from '../../src/i18n/runtime.js';
import { AD_POSITION_EXPERIMENT } from '../../src/domain/ad-experiment.js';
import { EL_SLUG } from '../../src/engine/core.js';
import { LUCKY_BANNERS } from '../../src/content/lucky-banners.js';

const date = { y: 2026, m: 10, d: 27 };
const input = { calendar: 'solar', y: 1993, m: 1, d: 28, gender: 'F', time: '03:40' };
const chart = buildChart(input);
const periods = [
  ['/today/', () => day(chart, date)], ['/tomorrow/', () => day(chart, addDays(date, 1))],
  ['/week/', () => week(chart, date)], ['/month/', () => month(chart, 2026, 10)],
  ['/year/2026/', () => year(chart, 2026)], ['/year/2027/', () => year(chart, 2027)],
];
// 광고 실적을 발생시키지 않고 실제 발급 설정과 iframe 삽입을 검증한다.
const sdkStub = `window.partnerCalls = []; window.PartnersCoupang = { G: function(options) {
  window.partnerCalls.push({ ...options, container: undefined });
  const frame = document.createElement('iframe');
  frame.width = options.width; frame.height = options.height;
  options.container.append(frame);
} };`;
const bannerConfig = element => ({ ...LUCKY_BANNERS[EL_SLUG[element]], width: '100%', height: '250', bordered: false, tsource: '' });

test.beforeEach(async ({ context, page }) => {
  await context.route('https://**/*', route => route.abort());
  await context.route('https://ads-partners.coupang.com/g.js', route => route.fulfill({ contentType: 'application/javascript', body: sdkStub }));
  await context.addInitScript(key => localStorage.setItem(key, 'A'), AD_POSITION_EXPERIMENT.storageKey);
  await page.clock.setFixedTime(new Date('2026-10-27T12:00:00+09:00'));
});

async function calculate(page, path, profile = input) {
  await page.goto(path);
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  for (const field of ['y', 'm', 'd']) await page.locator(`#a-${field}`).selectOption(String(profile[field]));
  await page.locator(`[name="a-gender"][value="${profile.gender}"]`).check();
  await page.locator('#a-notime').uncheck();
  await page.locator('#a-time').fill(profile.time);
  await page.locator('#tool-form [type="submit"]').click();
}

async function checkBannerArea(page) {
  const area = page.locator('#result .lucky-banner');
  await expect(area).toHaveCount(1);
  await expect(area).toHaveAttribute('data-banner-state', 'ready');
  await expect(area.locator('[data-lucky-banner-slot]')).toHaveAttribute('data-ad-state', 'initialized');
  await expect(area.locator('iframe')).toHaveCount(1);
  await expect(area.locator('.partner-ad-disclosure')).toBeVisible();
  await expect(area.locator('a, button, img, li')).toHaveCount(0);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const box = await area.boundingBox();
    const result = await page.locator('#result').boundingBox();
    expect(box.width).toBe(Math.min(result.width, 784));
    const slot = await area.locator('[data-lucky-banner-slot]').boundingBox();
    expect(slot.width).toBe(box.width);
    expect(slot.height).toBe(250);
    const frame = await area.locator('iframe').boundingBox();
    expect(frame.width).toBe(slot.width);
    expect(frame.height).toBe(250);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
}

for (const lang of ['ko', 'en']) {
  const prefix = lang === 'en' ? '/en' : '';
  test(`${lang}: 6개 기간 결과에서 총운→실제 행운색→오행별 배너 순서를 재계산·복원에도 유지한다`, async ({ page }) => {
    for (const [path, report] of periods) {
      await calculate(page, `${prefix}${path}`);
      const color = withLanguage(lang, () => report().lucky.color);
      await expect(page.locator('#result > .reading-overview > .report-head + .lucky + .lucky-banner')).toHaveCount(1);
      await expect(page.locator('#result .lucky > div:first-child b')).toHaveText(color);
      await expect(page.locator('#result [data-lucky-banner-slot]')).toHaveAttribute('data-lucky-banner-slot', EL_SLUG[withLanguage(lang, () => report().lucky.el)]);
      await expect(page.locator('#result > [data-result-summary] + .partner-ad')).toHaveCount(1);
      await checkBannerArea(page);
      await page.reload();
      await expect(page.locator('#result .lucky-banner')).toHaveCount(1);
      await expect(page.locator('#result .lucky > div:first-child b')).toHaveText(color);
    }
  });

  test(`${lang}: 평생운·만세력에 원국 용신·희신 색과 용신 그룹 배너를 표시한다`, async ({ page }) => {
    for (const path of ['/lifetime/', '/manseryeok/']) {
      await calculate(page, `${prefix}${path}`);
      const colors = withLanguage(lang, () => [chart.roles.yong, chart.roles.hee].map(e => T.element[e].color.join(' · ')));
      await expect(page.locator('#result .lucky-palettes dd')).toHaveText(colors);
      await expect(page.locator(path === '/lifetime/'
        ? '.life > .reading-overview > section + .lucky-colors + .lucky-banner'
        : '#result > .reading-overview > .chart-card + .lucky-colors + .lucky-banner')).toHaveCount(1);
      await expect(page.locator('#result [data-lucky-banner-slot]')).toHaveAttribute('data-lucky-banner-slot', EL_SLUG[chart.roles.yong]);
      await checkBannerArea(page);
      await page.locator('#a-notime').check();
      await page.locator('#tool-form [type="submit"]').click();
      const unknown = buildChart({ ...input, time: null });
      await expect(page.locator('#result .lucky-palettes dd')).toHaveText(withLanguage(lang, () => [unknown.roles.yong, unknown.roles.hee].map(e => T.element[e].color.join(' · '))));
      await expect(page.locator('#result .lucky-banner')).toHaveCount(1);
      await expect(page.locator('#result [data-lucky-banner-slot]')).toHaveAttribute('data-lucky-banner-slot', EL_SLUG[unknown.roles.yong]);
    }
  });
}

test('주간·월간 날짜 상세에도 색은 표시하고 배너는 바깥에 한 개만 유지한다', async ({ page }) => {
  for (const path of ['/week/', '/month/']) {
    await calculate(page, path);
    await page.locator('[data-reading-date]').first().click();
    await expect(page.locator('#calendar-day-detail .report-head + .lucky')).toHaveCount(1);
    await expect(page.locator('#calendar-day-detail .lucky-banner')).toHaveCount(0);
    await expect(page.locator('#result .lucky-banner')).toHaveCount(1);
  }
});

test('실제 결과가 목·화·토·금·수로 바뀌면 오늘·평생운·만세력의 발급 배너도 바뀐다', async ({ page }) => {
  const reportDates = [{ m: 1, d: 9 }, { m: 1, d: 2 }, { m: 1, d: 1 }, { m: 1, d: 8 }, { m: 1, d: 13 }];
  const chartDates = [{ m: 1, d: 5 }, { m: 1, d: 7 }, { m: 1, d: 1 }, { m: 1, d: 8 }, { m: 2, d: 7 }];
  for (let element = 0; element < EL_SLUG.length; element++) {
    for (const path of ['/today/', '/lifetime/', '/manseryeok/']) {
      const profile = { ...input, ...(path === '/today/' ? reportDates : chartDates)[element] };
      const computed = buildChart(profile);
      expect(path === '/today/' ? day(computed, date).lucky.el : computed.roles.yong).toBe(element);
      await calculate(page, path, profile);
      const slot = page.locator('[data-lucky-banner-slot]');
      await expect(slot).toHaveAttribute('data-lucky-banner-slot', EL_SLUG[element]);
      await expect(slot).toHaveAttribute('data-ad-state', 'initialized');
      expect(await page.evaluate(() => window.partnerCalls.at(-1))).toEqual(bannerConfig(element));
      await expect(slot.locator('iframe')).toHaveCount(1);
    }
  }
});

test('발급 배너를 재계산해도 공통 배너·SDK를 중복 생성하지 않는다', async ({ page, context }) => {
  let sdkRequests = 0;
  await context.route('https://ads-partners.coupang.com/g.js', route => {
    sdkRequests++;
    return route.fulfill({ contentType: 'application/javascript', body: sdkStub });
  });
  await calculate(page, '/today/');
  const slot = page.locator('[data-lucky-banner-slot]');
  await expect(slot).toHaveAttribute('data-ad-state', 'initialized');
  await expect(slot.locator('iframe')).toHaveCount(1);
  await expect(page.locator('.lucky-banner .partner-ad-disclosure')).toBeVisible();
  expect(await page.evaluate(() => window.partnerCalls)).toContainEqual(bannerConfig(day(chart, date).lucky.el));
  expect(await page.evaluate(() => window.partnerCalls.length)).toBe(2);
  await page.locator('[data-partner-ad-slot="common"]').evaluate(el => el.dataset.testInstance = 'original');
  await page.locator('#a-d').selectOption('29');
  await page.locator('#tool-form [type="submit"]').click();
  await expect(slot).toHaveAttribute('data-ad-state', 'initialized');
  await expect(slot.locator('iframe')).toHaveCount(1);
  const changed = buildChart({ ...input, d: 29 });
  expect(await page.evaluate(() => window.partnerCalls.at(-1))).toEqual(bannerConfig(day(changed, date).lucky.el));
  expect(await page.evaluate(() => window.partnerCalls.length)).toBe(3);
  await expect(page.locator('[data-partner-ad-slot="common"]')).toHaveAttribute('data-test-instance', 'original');
  expect(sdkRequests).toBe(1);
});

test('B 광고도 총운과 행운색 사이에 끼지 않고 기존 배너 하나를 유지한다', async ({ page }) => {
  await page.addInitScript(key => localStorage.setItem(key, 'B'), AD_POSITION_EXPERIMENT.storageKey);
  for (const path of ['/today/', '/lifetime/']) {
    await calculate(page, path);
    await expect(page.locator('#result > .partner-ad:first-child')).toHaveCount(1);
    await expect(page.locator('.reading-overview > section + .lucky, .reading-overview > section + .lucky-colors')).toHaveCount(1);
    await expect(page.locator('[data-partner-ad-slot]')).toHaveCount(1);
  }
});
