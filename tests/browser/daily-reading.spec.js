import { editProfile } from './helpers/profile.js';
import { test, expect } from '@playwright/test';
import { buildChart, day, addDays, isoDate } from '../../src/engine/index.js';
import { withLanguage } from '../../src/i18n/runtime.js';

const date = { y: 2026, m: 10, d: 26 };
const input = { gender: 'F', calendar: 'solar', y: 1993, m: 1, d: 28, time: '03:40' };

test.beforeEach(async ({ context, page }) => {
  await context.route('https://**/*', route => route.abort());
  await page.clock.setFixedTime(new Date(`${isoDate(date)}T12:00:00+09:00`));
});

for (const lang of ['ko', 'en']) {
  test(`${lang}: 오늘·내일 운세는 일곱 분야의 흐름·기회·주의점을 펼쳐 보여준다`, async ({ page }) => {
    const prefix = lang === 'en' ? '/en' : '';
    const chart = buildChart(input);
    await page.goto(`${prefix}/today/`);
    await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
    await editProfile(page);
    await page.locator(`#a-y`).fill(String(input.y));
    for (const key of ['m', 'd']) await page.locator(`#a-${key}`).selectOption(String(input[key]));
    await page.locator('[name="a-gender"][value="F"]').check();
    await page.locator('#a-time').fill(input.time);
    await page.locator('#tool-form [type="submit"]').click();

    for (const mode of ['today', 'tomorrow']) {
      if (mode === 'tomorrow') {
        await page.locator(`#result .result-next a[href="${prefix}/tomorrow/"]`).click();
        await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
      }
      const expected = withLanguage(lang, () => day(chart, mode === 'today' ? date : addDays(date, 1), mode));
      const cards = page.locator('#result .daily-cat');
      await expect(cards).toHaveCount(7);
      await expect(page.locator('#result .report-text > p').first()).toHaveText(expected.overall.outlook);
      await expect(page.locator('#result [data-overall-basis]')).toBeVisible();
      await expect(page.locator('#result [data-overall-basis]')).toHaveText(expected.overall.text);
      await expect(page.locator('#result .chart-disclosure')).not.toHaveAttribute('open', '');
      for (let i = 0; i < expected.cats.length; i++) {
        const card = cards.nth(i), cat = expected.cats[i];
        await expect(card).toBeVisible();
        await expect(card).not.toHaveAttribute('open', '');
        await expect(card.locator('.daily-cat-name')).toHaveText(cat.name);
        await expect(card.locator('.num')).toHaveText(`${cat.score}${lang === 'ko' ? '점' : ' points'}`);
        for (const field of ['outlook', 'opportunity', 'caution', 'action', 'basis', 'change']) {
          await expect(card.locator(`[data-daily-${field}]`)).toBeVisible();
          await expect(card.locator(`[data-daily-${field}]`)).toHaveText(cat.reading[field]);
        }
        await expect(card.locator('dialog, details')).toHaveCount(0);
      }
      const links = page.locator('#result .daily-links a');
      for (let i = 0; i < 7; i++) {
        const target = await links.nth(i).getAttribute('href');
        await links.nth(i).focus();
        await page.keyboard.press('Enter');
        await expect.poll(() => page.locator(target).evaluate(el => document.activeElement === el ? 'focused' : document.activeElement?.outerHTML.slice(0, 220))).toBe('focused');
      }
      for (const width of [320, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
        await page.locator('#result .daily-links a[href="#reading-money"]').click();
        await expect(page.locator('#reading-money h3')).toBeInViewport({ ratio: 1 });
        await expect.poll(() => page.evaluate(() => {
          const title = document.querySelector('#reading-money h3').getBoundingClientRect();
          const header = document.querySelector('.site-head').getBoundingClientRect();
          return title.top >= Math.max(0, header.bottom);
        })).toBe(true);
      }
    }
  });
}
