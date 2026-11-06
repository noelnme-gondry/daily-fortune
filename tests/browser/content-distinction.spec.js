import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.route('https://**/*', route => route.abort());
});

for (const [width, prefix] of [[1440, ''], [320, '/en']]) {
  test(`${width}px ${prefix || 'KR'} 허브와 일주 비교의 실제 이동`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${prefix}/tti/`);
    await expect(page.locator('[data-zodiac-guide]')).toBeVisible();
    await page.locator('main a[href="' + prefix + '/tti/today/"]').first().click();
    await expect(page).toHaveURL(new RegExp(`${prefix}/tti/today/$`));
    await page.goto(`${prefix}/saju/ilju/gapja/`);
    await expect(page.locator('[data-ilju-comparison]')).toBeVisible();
    await page.locator('[data-ilju-comparison] a').nth(1).click();
    await expect(page).toHaveURL(new RegExp(`${prefix}/saju/ilju/gapsul/$`));
    await expect(page.locator('main')).not.toContainText(/undefined|NaN|\[object Object\]/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
