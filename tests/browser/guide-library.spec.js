import { test, expect } from '@playwright/test';
import { completeProfile } from './helpers/profile.js';

test.beforeEach(async ({ context }) => {
  await context.route('https://**/*', route => route.abort());
});

for (const width of [320, 768, 1024, 1440]) {
  test(`${width}px 백과에서 전체 주제·본문·영어·실제 계산기로 이어진다`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/saju/');
    await page.getByRole('link', { name: '주제별 이용 가이드 전체 목록', exact: true }).click();
    await expect(page.locator('.guide-category-nav')).toContainText('30편');
    await expect(page.locator('main .reading-guide-cards a')).toHaveCount(30);
    await page.locator('.guide-category-nav a[href="#category-chart"]').click();
    await page.locator('main a[href="/guides/useful-elements/"]').click();
    await expect(page.locator('#calculated-example table')).toBeVisible();
    await page.locator('.guide-toc a[href="#checklist"]').click();
    await expect(page.locator('#checklist')).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.getByRole('link', { name: 'English', exact: true }).click();
    await expect(page).toHaveURL(/\/en\/guides\/useful-elements\/#checklist$/);
    await expect(page.locator('#checklist')).toBeInViewport();
    await expect(page.locator('main')).not.toContainText(/[가-힣]/);
    await page.locator('main a[href="/en/lifetime/#public-example"]').click();
    await expect(page.locator('#public-example')).toBeVisible();
    await page.locator('#public-example a[href="#tool"]').click();
    await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
    await completeProfile(page);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('#result')).not.toBeEmpty();
    await expect(page.locator('#result')).not.toContainText(/undefined|NaN|\[object Object\]/);
  });
}

test('JavaScript 없이 신규 가이드의 주제·목차·계산 예시를 읽고 키보드로 이동한다', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
  await context.route('https://**/*', route => route.abort());
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4176/guides/');
  await expect(page.locator('main .reading-guide-cards a')).toHaveCount(30);
  await page.locator('main a[href="/guides/chart-reading/"]').click();
  const toc = page.locator('.guide-toc a').first();
  await toc.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#section-1$/);
  await expect(page.locator('#section-1')).toBeInViewport();
  const region = page.getByRole('region', { name: '네 기둥과 일간 찾기', exact: true });
  await region.focus();
  await expect(region).toBeFocused();
  await expect(region.locator('table tbody tr')).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await context.close();
});
