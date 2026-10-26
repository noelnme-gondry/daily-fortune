import { test, expect } from '@playwright/test';
import { completeProfile } from './helpers/profile.js';
import { FREE_ACCESS } from '../../src/content/pages.js';
import { withLanguage } from '../../src/i18n/runtime.js';

test.beforeEach(async ({ context }) => { await context.route('https://**/*', route => route.abort()); });

for (const lang of ['ko', 'en']) {
  const prefix = lang === 'en' ? '/en' : '';
  test(`${lang}: 무료운세 홈의 서비스 탐색·오늘 입력·저장 복원·띠별 선택을 유지한다`, async ({ page }) => {
    await page.goto(`${prefix}/`);
    await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
    await expect(page.locator('.home-services')).toContainText(withLanguage(lang, () => FREE_ACCESS.description));
    const order = await page.evaluate(() => ['.home-services', '.reading-guides', '.reading-guide-links', '.home-features'].map(s => document.querySelector(s).getBoundingClientRect().top));
    expect(order.slice(1).every(top => top > order[0])).toBe(true);
    await expect(page.locator('.home-tools a')).toHaveCount(10);
    const button = page.locator('#tool-form [type="submit"]');
    await expect(button).toHaveText(lang === 'ko' ? '오늘의 운세 보기' : 'See today’s fortune');
    await completeProfile(page);
    await page.locator('#save-device').check();
    await button.click();
    await expect(page).toHaveURL(new RegExp(`${prefix}/today/$`));
    await expect(page.locator('#result .daily-cat')).toHaveCount(7);
    await page.goto(`${prefix}/`);
    await expect(page.locator('[data-saved-entry]')).toBeVisible();
    await expect(page.locator('#tool-form')).toBeHidden();
    await page.locator('[data-saved-result]').click();
    await expect(page).toHaveURL(new RegExp(`${prefix}/$`));
    await expect(page.locator('#result .daily-cat')).toHaveCount(7);
    await page.goto(`${prefix}/today/`);
    await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
    const entry = page.locator('.reading-entry');
    await entry.locator('a[href="#tool"]').focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#tool$/);
    await entry.locator(`a[href="${prefix}/tti/today/"]`).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`${prefix}/tti/today/$`));
    await expect(page.locator('main .tti-row')).toHaveCount(12);
    for (const width of [320, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ['/', '/today/']) {
        await page.goto(`${prefix}${path}`);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
        expect(await page.evaluate(() => [...document.querySelectorAll('[aria-controls]')].every(el => document.querySelectorAll(`[id="${el.getAttribute('aria-controls')}"]`).length === 1))).toBe(true);
      }
    }
  });

  test(`${lang}: 가이드 허브와 두 문맥 링크는 개인·띠별 결과에 정확히 연결된다`, async ({ page }) => {
    await page.goto(`${prefix}/guides/`);
    await page.locator(`.guide-tool-nav a[href="${prefix}/"]`).click();
    await expect(page.locator('.home-services')).toBeVisible();
    await page.goto(`${prefix}/guides/`);
    await page.locator(`.guide-tool-nav a[href="${prefix}/today/"]`).click();
    await expect(page.locator('.reading-entry')).toBeVisible();
    await page.goto(`${prefix}/guides/fortune-scores/`);
    await page.locator(`#comparison a[href="${prefix}/today/"]`).click();
    await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
    await page.goto(`${prefix}/guides/zodiac-samjae/`);
    await page.locator(`#section-1 a[href="${prefix}/today/"]`).click();
    await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
    await page.goto(`${prefix}/guides/zodiac-samjae/`);
    await page.locator(`#section-1 a[href="${prefix}/tti/today/"]`).click();
    await expect(page.locator('main .tti-row')).toHaveCount(12);
  });
}
