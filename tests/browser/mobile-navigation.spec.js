import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.route('https://**/*', (route) => route.abort());
});

test('모바일 결과의 중복 운세 메뉴를 숨기고 상단 메뉴로 이동한다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/today/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('#result .chart-card')).toBeVisible();
  await expect(page.getByRole('navigation', { name: '다른 운세 보기', includeHidden: true })).toBeHidden();
  const resultTop = await page.locator('.site-head').evaluate((el) => el.offsetHeight + 12);
  await expect.poll(() => page.locator('#result').evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBe(resultTop);
  await page.evaluate(() => window.scrollTo(0, 1700));
  await expect.poll(() => page.locator('.site-head').evaluate((el) => el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(1);
  await page.evaluate(() => window.scrollTo(0, 1550));
  await expect.poll(() => page.locator('.site-head').evaluate((el) => el.getBoundingClientRect().top)).toBe(0);
  await page.getByRole('navigation', { name: '주요 메뉴', exact: true }).getByRole('link', { name: '내일 운세', exact: true }).click();
  await expect(page).toHaveURL(/\/tomorrow\/$/);
  await expect(page.locator('#result .chart-card')).toBeVisible();
});

for (const width of [320, 768]) {
  test(`${width}px에서 로고와 두 줄 메뉴 전체가 스크롤 방향에 따라 나타나고 숨는다`, async ({ page }) => {
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
  await page.evaluate(() => window.scrollTo(0, 900));
  await expect(page.locator('.site-head')).toHaveClass(/is-hidden/);
  await page.setViewportSize({ width: 1024, height: 900 });
  await expect(page.locator('.site-head')).not.toHaveAttribute('data-scroll-header', '');
  expect(await page.locator('.site-head').evaluate((el) => window.getComputedStyle(el).position)).toBe('static');
  await page.locator('button[type="submit"]').click();
  await expect(page.getByRole('navigation', { name: '다른 운세 보기' })).toBeVisible();
});
