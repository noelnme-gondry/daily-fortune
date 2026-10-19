import { test, expect } from '@playwright/test';
import { ttiDay, ttiYear, ttiMonths, todayKST, addDays } from '../../src/engine/index.js';
import { withLanguage } from '../../src/i18n/runtime.js';

test.use({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
test.beforeEach(async ({ context }) => { await context.route('https://**/*', (route) => route.abort()); });

for (const lang of ['ko', 'en']) {
  const prefix = lang === 'en' ? '/en' : '';
  test(`${lang}: JS 없이도 연간 강점·주의점과 내일의 생활 해설을 읽고 근거를 펼친다`, async ({ page }) => {
    const today = todayKST();
    const annual = withLanguage(lang, () => ttiYear(0, today.y));
    await page.goto(`${prefix}/tti/${today.y}/rat/`);
    await expect(page.locator('.zodiac-hero')).toContainText(annual.summary);
    await expect(page.locator('.cats-static .cat > p')).toHaveText(annual.cats.map((c) => c.text));
    await expect(page.locator('.cats-static .cat-top .num')).toHaveText(annual.cats.map((c) => String(c.score)));
    const annualBasis = page.locator('main .tti-reading-basis').first();
    await expect(annualBasis.locator('p').first()).not.toBeVisible();
    await annualBasis.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(annualBasis.locator('p').first()).toHaveText(annual.basis);
    await expect(annualBasis.locator('p').first()).toBeVisible();
    const months = withLanguage(lang, () => ttiMonths(0, today.y));
    await expect(page.locator('[data-monthly-flow] article > p')).toHaveText(months.map((m) => m.text));
    const monthBasis = page.locator('[data-monthly-flow] details').first();
    await expect(monthBasis.locator('p')).not.toBeVisible();
    await monthBasis.locator('summary').click();
    await expect(monthBasis.locator('p')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);

    const tomorrow = withLanguage(lang, () => ttiDay(0, addDays(today, 1)));
    await page.goto(`${prefix}/tti/tomorrow/rat/`);
    await expect(page.locator('.tti-outlook')).toHaveText(tomorrow.outlook);
    await expect(page.locator('.tti-advice')).toContainText(tomorrow.advice);
    await expect(page.locator('.tti-caution')).toContainText(tomorrow.caution);
    const dailyBasis = page.locator('main .tti-reading-basis');
    await expect(dailyBasis.locator('.tti-factors')).not.toBeVisible();
    await dailyBasis.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(dailyBasis.locator('.tti-factors')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  });
}
