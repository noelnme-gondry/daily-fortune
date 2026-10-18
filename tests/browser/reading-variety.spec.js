import { test, expect } from '@playwright/test';
import { buildChart, day, week, ttiDay, ttiMonths, todayKST, isoDate, addDays } from '../../src/engine/index.js';
import { withLanguage } from '../../src/i18n/runtime.js';

test.beforeEach(async ({ context }) => { await context.route('https://**/*', (route) => route.abort()); });

for (const lang of ['ko', 'en']) {
  const prefix = lang === 'en' ? '/en' : '';
  test(`${lang}: 오늘·내일·주간 진입 경로에 새 해설과 실제 점수가 연결된다`, async ({ page }) => {
    const today = todayKST();
    await page.clock.setFixedTime(new Date(`${isoDate(today)}T12:00:00+09:00`));
    const input = { gender: 'F', calendar: 'solar', y: 1993, m: 1, d: 28, time: '03:40' };
    const c = buildChart(input);
    for (const mode of ['today', 'tomorrow', 'week']) {
      await page.goto(`${prefix}/${mode}/`);
      await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
      await page.locator('input[name="a-gender"][value="F"]').check();
      await page.locator('#a-y').selectOption('1993');
      await page.locator('#a-m').selectOption('1');
      await page.locator('#a-d').selectOption('28');
      await page.locator('#a-notime').uncheck();
      await page.locator('input[name="a-tmode"][value="exact"]').check();
      await page.locator('#a-time').fill('03:40');
      await page.locator('button[type="submit"]').click();
      const expected = withLanguage(lang, () => mode === 'week' ? week(c, today) : day(c, mode === 'tomorrow' ? addDays(today, 1) : today, mode));
      await expect(page.locator('#result .report-head h2')).toHaveText(expected.overall.headline);
      await expect(page.locator('#result .cats .cat > p')).toHaveText(expected.cats.map((cat) => cat.text));
      await expect(page.locator('#result .cat-top .num')).toHaveText(expected.cats.map((cat) => String(cat.score)));
      if (mode === 'week') await expect(page.locator('#result .week .wd > b')).toHaveText(expected.days.map((d) => String(d.score)));
    }
  });

  test(`${lang}: 띠 목록·상세·출생 연도 선택에도 같은 해설이 연결된다`, async ({ page }) => {
    const today = todayKST();
    await page.goto(`${prefix}/tti/today/`);
    const text = withLanguage(lang, () => ttiDay(1, today).text);
    await expect(page.locator('.tti-list .tti-row').nth(1)).toContainText(text);
    await page.locator('.tti-name').nth(1).click();
    await expect(page.locator('dialog[open] .box > p').first()).toHaveText(text);
    await page.keyboard.press('Escape');
    await page.goto(`${prefix}/tti/today/ox/`);
    await expect(page.locator('main')).toContainText(text);
    await page.goto(`${prefix}/tti/${today.y}/rat/`);
    await expect(page.locator('[data-cohort]')).toHaveAttribute('data-ready', 'true');
    await page.locator('[data-cohort]').selectOption('1996');
    const months = withLanguage(lang, () => ttiMonths(0, today.y, 1996));
    await expect(page.locator('[data-monthly-flow] article > p')).toHaveText(months.map((m) => m.text));
  });
}
