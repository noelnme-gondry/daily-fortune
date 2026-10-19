import { test, expect } from '@playwright/test';
import { buildChart, day, week, ttiDay, ttiMonths, todayKST, isoDate, addDays } from '../../src/engine/index.js';
import { withLanguage } from '../../src/i18n/runtime.js';
import { readingHeadlines } from '../../src/domain/reading.js';

test.beforeEach(async ({ context }) => { await context.route('https://**/*', (route) => route.abort()); });

for (const lang of ['ko', 'en']) {
  const prefix = lang === 'en' ? '/en' : '';
  test(`${lang}: 오늘·내일·주간 진입 경로에 새 해설과 실제 점수가 연결된다`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
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
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    }
  });

  test(`${lang}: 띠 목록·상세·출생 연도 선택에도 같은 해설이 연결된다`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    const today = todayKST();
    await page.goto(`${prefix}/tti/today/`);
    const { text, headline, outlook, advice, caution } = withLanguage(lang, () => ttiDay(1, today));
    await expect(page.locator('.tti-list .tti-row').nth(1)).toContainText(text);
    await expect(page.locator('.tti-list .tti-reading-headline').nth(1)).toHaveText(headline);
    await page.locator('.tti-name').nth(1).click();
    await expect(page.locator('dialog[open] .tti-reading-headline')).toHaveText(headline);
    await expect(page.locator('dialog[open] .tti-outlook')).toHaveText(outlook);
    await expect(page.locator('dialog[open] .tti-advice')).toContainText(advice);
    await expect(page.locator('dialog[open] .tti-caution')).toContainText(caution);
    const basis = page.locator('dialog[open] .tti-reading-basis');
    await expect(basis).not.toHaveAttribute('open', '');
    await expect(basis.locator('.tti-factors')).not.toBeVisible();
    await basis.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(basis.locator('.tti-factors')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.goto(`${prefix}/tti/today/ox/`);
    await expect(page.locator('main .tti-outlook')).toHaveText(outlook);
    await expect(page.locator('main .tti-advice')).toContainText(advice);
    await expect(page.locator('main .tti-caution')).toContainText(caution);
    await expect(page.locator('main .tti-reading-headline')).toHaveText(headline);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await page.goto(`${prefix}/tti/${today.y}/rat/`);
    await expect(page.locator('[data-cohort]')).toHaveAttribute('data-ready', 'true');
    await page.locator('[data-cohort]').selectOption('1996');
    const months = withLanguage(lang, () => ttiMonths(0, today.y, 1996));
    await expect(page.locator('[data-monthly-flow] article > p')).toHaveText(months.map((m) => m.text));
  });

  test(`${lang}: 긴 주간 제목도 공유 이미지에서 잘리지 않는다`, async ({ page }) => {
    await page.goto(`${prefix}/week/`);
    const titles = withLanguage(lang, () => readingHeadlines('week'));
    const result = await page.evaluate(async ({ titles, lang }) => {
      const { drawCard } = await import('/src/client/card.js');
      const ctx = document.createElement('canvas').getContext('2d');
      const font = `700 ${lang === 'en' ? 46 : 54}px Hahmlet, "Noto Serif KR", serif`;
      await document.fonts.load(font);
      ctx.font = font;
      const longest = titles.slice().sort((a, b) => ctx.measureText(b).width - ctx.measureText(a).width).slice(0, 12);
      const proto = Object.getPrototypeOf(ctx), original = proto.fillText;
      let rendered = [];
      proto.fillText = function (text, ...args) {
        if (this.font === ctx.font) rendered.push(text);
        return original.call(this, text, ...args);
      };
      try {
        const results = [];
        for (const title of longest) {
          rendered = [];
          const blob = await drawCard({ kicker: 'Weekly reading', big: '65', title });
          results.push({ title, rendered: rendered.join(' '), png: blob.type === 'image/png' && blob.size > 0 });
        }
        return results;
      } finally { proto.fillText = original; }
    }, { titles, lang });
    for (const r of result) {
      expect(r.rendered).toBe(r.title);
      expect(r.png).toBe(true);
    }
  });
}
