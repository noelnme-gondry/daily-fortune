import { completeProfile } from './helpers/profile.js';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.route('https://**/*', (route) => route.abort());
});

test('상단 메뉴를 가로·세로로 이동해 내일 운세를 열고 키보드로 닫는다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const groups = page.locator('.nav-group');
  const menu = groups.first();
  const toggle = menu.locator('.nav-toggle');
  await expect(toggle).toBeVisible();
  for (const group of await groups.all()) {
    await group.locator('.nav-main').hover();
    await expect(group.locator('.nav-toggle')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.nav-links:visible')).toHaveCount(1);
  }
  await menu.locator('.nav-main').hover();
  const tomorrow = menu.getByRole('link', { name: '내일의 운세', exact: true });
  const box = await tomorrow.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 12 });
  await tomorrow.click();
  await expect(page).toHaveURL(/\/tomorrow\/$/);
  await page.mouse.move(0, 0);
  await toggle.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await expect(menu.locator('.nav-links a').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test.describe('터치 메뉴', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 320, height: 760 } });
  test('영문 하위 링크가 화면 안에 열리고 탭으로 이동한다', async ({ page }) => {
    await page.goto('/en/today/');
    const group = page.locator('.nav-group').nth(2);
    await group.locator('.nav-toggle').tap();
    const link = group.locator('.nav-links a').last();
    await expect(link).toBeInViewport({ ratio: 1 });
    await link.tap();
    await expect(page).toHaveURL(/\/en\/tti\/compatibility\/$/);
  });
});

test('모바일 결과의 중복 운세 메뉴를 숨기고 상단 메뉴로 이동한다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/today/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await completeProfile(page);
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('#result .chart-card')).toBeAttached();
  await expect(page.getByRole('navigation', { name: '다른 운세 보기', includeHidden: true })).toBeHidden();
  await expect(page.locator('#reading-summary')).toBeFocused();
  await expect(page.locator('#reading-summary [data-result-heading]')).toBeInViewport();
  await page.evaluate(() => window.scrollTo(0, 1700));
  await expect.poll(() => page.locator('.site-head').evaluate((el) => el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(1);
  await page.evaluate(() => window.scrollTo(0, 1550));
  await expect.poll(() => page.locator('.site-head').evaluate((el) => el.getBoundingClientRect().top)).toBe(0);
  await page.locator('[data-dialog="site-menu"]').click();
  await page.getByRole('navigation', { name: '전체 메뉴', exact: true }).getByRole('link', { name: '내일의 운세', exact: true }).click();
  await expect(page).toHaveURL(/\/tomorrow\/$/);
  await expect(page.locator('#result .chart-card')).toBeAttached();
});

for (const width of [320, 768]) {
  test(`${width}px에서 로고와 주요 메뉴가 스크롤 방향에 따라 나타나고 숨는다`, async ({ page }) => {
    if (width === 320) await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/today/');
    const header = page.locator('.site-head');
    await expect(header).toHaveAttribute('data-scroll-header', '');
    await page.evaluate(() => window.scrollTo(0, 900));
    await expect(header).toHaveClass(/is-hidden/);
    await page.evaluate(() => window.scrollTo(0, 780));
    await expect.poll(() => header.evaluate((el) => el.getBoundingClientRect().top)).toBe(0);
    await expect(page.locator('.brand')).toBeInViewport({ ratio: 1 });
    await expect(page.locator('.gnav')).toBeInViewport({ ratio: 1 });
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.evaluate(() => window.scrollTo(0, 950));
    await expect(header).toHaveClass(/is-hidden/);
    await page.locator('.gnav a').first().focus();
    await expect(page.locator('.gnav a').first()).toBeInViewport({ ratio: 1 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(header).not.toHaveClass(/is-hidden/);
    await expect(page.locator('.brand')).toBeInViewport({ ratio: 1 });
  });
}

test('데스크톱 메뉴는 기존 위치를 유지하고 모바일 전환 상태가 남지 않는다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/today/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await page.evaluate(() => window.scrollTo(0, 900));
  await expect(page.locator('.site-head')).toHaveClass(/is-hidden/);
  await page.setViewportSize({ width: 1024, height: 900 });
  await expect(page.locator('.site-head')).not.toHaveAttribute('data-scroll-header', '');
  expect(await page.locator('.site-head').evaluate((el) => window.getComputedStyle(el).position)).toBe('static');
  await completeProfile(page);
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('#result .chart-card')).toBeAttached();
  await expect(page.getByRole('navigation', { name: '다른 운세 보기', includeHidden: true })).toBeHidden();
});
