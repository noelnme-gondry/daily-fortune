import { test, expect } from '@playwright/test';
import { completeProfile } from './helpers/profile.js';

test.beforeEach(async ({ context }) => {
  await context.route('https://**/*', route => route.abort());
});

for (const width of [320, 768, 1440]) {
  test(`${width}px 홈에서 가이드·문의로 진입하고 영어판으로 이동한다`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.locator('.reading-guide-links a[href="/guides/birth-time/"]').click();
    await expect(page).toHaveURL(/\/guides\/birth-time\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('태어난 시간을 모를 때');
    await expect(page.getByRole('region', { name: '출생 시각 유무에 따른 원국 비교' })).toBeVisible();
    await expect(page.locator('[data-partner-ad-slot]')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.getByRole('link', { name: 'English', exact: true }).click();
    await expect(page).toHaveURL(/\/en\/guides\/birth-time\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('What can you read without a birth time?');
    await expect(page.locator('main')).not.toContainText(/[가-힣]/);
    await page.locator('main a[href="/en/contact/"]').click();
    await expect(page).toHaveURL(/\/en\/contact\/$/);
    await expect(page.locator('main a[href="mailto:gondry.montauk@gmail.com"]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

test('JavaScript 없이도 가이드의 사례·계산 근거·문의 정보를 읽는다', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, locale: 'ko-KR', viewport: { width: 320, height: 900 } });
  await context.route('https://**/*', route => route.abort());
  const page = await context.newPage();
  for (const path of ['/guides/birth-time/', '/guides/fortune-scores/', '/guides/compatibility/', '/guides/tojeong/']) {
    await page.goto(`http://127.0.0.1:4176${path}`);
    await expect(page.locator('main table')).toBeVisible();
    await expect(page.locator('main')).not.toContainText(/undefined|NaN|\[object Object\]/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    await expect(page.locator('main a[href="/contact/"]')).toBeVisible();
  }
  await context.close();
});

for (const mode of ['week', 'month', 'life-story', 'saju-ranking']) {
  test(`${mode} 공개 예시에서 실제 계산기로 이동해 결과를 얻는다`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(`/${mode}/`);
    await expect(page.locator('main #public-example')).toBeVisible();
    await page.locator('#public-example a[href="#tool"]').click();
    await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
    await completeProfile(page);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('#result')).not.toBeEmpty();
    await expect(page.locator('#result')).not.toContainText(/undefined|NaN|\[object Object\]/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  });
}
