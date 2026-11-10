import { test, expect } from '@playwright/test';
import { buildChart, day, week, month, year, addDays } from '../../src/engine/index.js';

const date = { y: 2026, m: 11, d: 5 };
const input = { calendar: 'solar', gender: 'M', y: 1990, m: 5, d: 15, time: '12:00' };
const ready = page => expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
const fill = async (page, name = '가족 예시') => {
  await page.locator(`#a-y`).fill(String(input.y));
  for (const key of ['m', 'd']) await page.locator(`#a-${key}`).selectOption(String(input[key]));
  await page.locator('#a-name').fill(name); await page.locator('#a-time').fill(input.time);
  await page.locator('[name="a-gender"][value="M"]').check();
};
test.beforeEach(async ({ context, page }) => {
  await context.route('https://**/*', r => r.abort());
  await page.clock.setFixedTime(new Date('2026-11-05T12:00:00+09:00'));
});

for (const prefix of ['', '/en']) {
  test(`${prefix || 'ko'}: 기간을 바꿔도 같은 인물·분야의 실제 결과로 이어지고 작은 화면에서 조작한다`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(`${prefix}/today/`); await ready(page); await fill(page);
    await page.locator('#tool-form [type=submit]').click();
    const c = buildChart(input);
    await page.locator('[data-reading-area][href="#reading-money"]').click();
    const cases = [
      ['tomorrow', day(c, addDays(date, 1), 'tomorrow')], ['week', week(c, date)],
      ['month', month(c, 2026, 11)], ['year/2027', year(c, 2027, 'next')],
    ];
    for (const [route, report] of cases) {
      const link = page.locator(`[data-period-link][href="${prefix}/${route}/#reading-money"]`);
      await link.focus(); await page.keyboard.press('Enter'); await ready(page);
      await expect(page).toHaveURL(new RegExp(`/${route}/#reading-money$`));
      await expect(page.locator('#a-name')).toHaveValue('가족 예시');
      await expect(page.locator('#a-y')).toHaveValue('1990');
      await expect(page.locator('#reading-money')).toBeFocused();
      await expect(page.locator('#reading-money .num')).toHaveText(new RegExp(`^${report.cats.find(c => c.key === 'money').score}(점| points)?$`));
      await expect(page.locator('[data-period-link][aria-current="page"]')).toHaveCount(1);
      for (const anchor of await page.locator('[data-reading-area]').all()) {
        await expect(page.locator(await anchor.getAttribute('href'))).toHaveCount(1);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    }
    await page.locator('[data-reading-area][href="#reading-summary"]').click();
    await expect(page.locator('#reading-summary')).toBeFocused();
    await expect(page.locator('[data-period-link]').first()).toHaveAttribute('href', `${prefix}/today/#reading-summary`);
    const events = await page.evaluate(() => JSON.stringify(window.dataLayer || []));
    expect(events).not.toContain('가족 예시'); expect(events).not.toContain('1990');
  });

  test(`${prefix || 'ko'}: 원국 근거는 실제 계산값과 시간 미상·역행을 설명한다`, async ({ page }) => {
    await page.goto(`${prefix}/manseryeok/`); await ready(page); await fill(page);
    await page.locator('#tool-form [type=submit]').click();
    await page.locator('.chart-basis > summary').focus(); await page.keyboard.press('Enter');
    await expect(page.locator('[data-strength-evidence]')).toContainText('51.6%');
    await expect(page.locator('[data-season-evidence]')).toContainText('+0.7');
    await expect(page.locator('[data-cycle-evidence]')).toContainText('1997');
    await expect(page.locator('[data-current-cycle]')).toContainText('2017');
    for (const width of [320, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    }
    await page.locator('[name="a-gender"][value="F"]').check(); await page.locator('#a-notime').check();
    await page.locator('#tool-form [type=submit]').click(); await page.locator('.chart-basis > summary').click();
    const c = buildChart({ ...input, gender: 'F', time: null });
    await expect(page.locator('[data-strength-evidence]')).toContainText(`${(c.ratio * 100).toFixed(1)}%`);
    await expect(page.locator('.chart-basis .note')).toContainText(prefix ? 'Time unknown' : '시간 미상');
    await expect(page.locator('[data-cycle-evidence]')).toContainText(prefix ? 'backward' : '역행');
    await page.locator('.chart-basis a').click();
    await expect(page).toHaveURL(new RegExp(`${prefix}/about/#interpretation-differences$`));
    await expect(page.locator('#interpretation-differences')).toBeVisible();
  });
}

test('주간 날짜 상세의 분야 이동은 주간 결과와 섞이지 않는다', async ({ page }) => {
  await page.goto('/week/'); await ready(page); await fill(page); await page.locator('#tool-form [type=submit]').click();
  await page.locator('[data-reading-date="2026-11-05"]').click();
  await page.locator('#calendar-day-detail .daily-links a').nth(1).click();
  await expect(page.locator('#detail-2026-11-05-money')).toBeFocused();
  const ids = await page.locator('#result [id]').evaluateAll(elements => elements.map(e => e.id));
  expect(new Set(ids).size).toBe(ids.length);
  await page.locator('[data-close-day]').click();
  await expect(page.locator('[data-reading-date="2026-11-05"]')).toBeFocused();
  await page.locator('[data-reading-area][href="#reading-money"]').click();
  await expect(page.locator('#reading-money')).toBeFocused();
});

test('저장 목록에서 고른 가족이 기간 이동 뒤에도 선택되어 있다', async ({ page }) => {
  await page.goto('/today/'); await ready(page); await fill(page, '첫 가족');
  await page.locator('#save-device').check(); await page.locator('#tool-form [type=submit]').click();
  await expect(page.locator('[data-storage-status]')).toContainText('저장했습니다');
  await page.locator('[data-dismiss-profile-guide]').click();
  await page.locator('#a-name').fill('두 번째 가족'); await page.locator('#a-y').fill('1960');
  await page.locator('#tool-form [type=submit]').click();
  await expect(page.locator('#a-saved-person option')).toHaveCount(3);
  const id = await page.locator('#a-saved-person option').filter({ hasText: '첫 가족' }).getAttribute('value');
  await page.locator('#a-saved-person').selectOption(id);
  await page.locator('[data-period-link][href="/week/#reading-summary"]').click(); await ready(page);
  await expect(page.locator('#a-name')).toHaveValue('첫 가족');
  await expect(page.locator('#a-saved-person')).toHaveValue(id);
  await expect(page.locator('#result .report-head .val b')).toHaveText(String(week(buildChart(input), date).overall.score));
});

test('계산 기준 문서는 자바스크립트 없이도 한국어·영어에서 연결된다', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  await context.route('https://**/*', route => route.abort());
  const page = await context.newPage();
  for (const prefix of ['', '/en']) {
    await page.goto(`${prefix}/about/#interpretation-differences`);
    for (const id of ['strength-rules', 'daeun-rules', 'interpretation-differences']) await expect(page.locator(`#${id}`)).toBeVisible();
    await expect(page.locator('#daeun-rules')).toContainText(prefix ? 'start year minus birth year' : '시작 연도−출생 연도');
  }
  await context.close();
});
