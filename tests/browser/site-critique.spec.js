import { test, expect } from '@playwright/test';
import { buildChart, day } from '../../src/engine/index.js';

test.beforeEach(async ({ context, page }) => {
  await context.route('https://**/*', route => route.abort());
  await page.clock.setFixedTime(new Date('2026-11-14T12:00:00+09:00'));
  await context.addInitScript(() => {
    window.critiqueEvents = [];
    window.gtag = (...args) => window.critiqueEvents.push(args);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async value => { window.copiedUrl = value; } } });
  });
});

async function birthDate(page) {
  await page.locator('#a-y').fill('1990');
  await page.locator('#a-m').selectOption('5');
  await page.locator('#a-d').selectOption('15');
}

for (const prefix of ['', '/en']) {
  test(`${prefix || 'ko'}: 시각 공란은 실제 시간 미상 결과로 계산하며 공유·다음 행동을 요약 직후에 둔다`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${prefix}/today/`);
    await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
    await birthDate(page);
    await page.locator('[name="a-gender"][value="F"]').check();
    await page.locator('#tool-form [type="submit"]').click();
    const result = day(buildChart({ gender: 'F', calendar: 'solar', y: 1990, m: 5, d: 15, time: null }), { y: 2026, m: 11, d: 14 });
    await expect(page.locator('#result .report-head .val b')).toHaveText(String(result.overall.score));
    await expect(page.locator('#tool-form')).toBeHidden();
    await expect(page.locator('#public-example')).toBeHidden();
    await expect(page.locator('#result .daily-cat')).toHaveCount(7);
    expect(await page.locator('#result .daily-cat[open]').count()).toBe(0);
    const geometry = await page.evaluate(() => {
      const bottom = document.querySelector('#result .report-head').getBoundingClientRect().bottom;
      return { share: document.querySelector('#result .result-share').getBoundingClientRect().top - bottom, next: document.querySelector('.result-next').getBoundingClientRect().top - bottom };
    });
    expect(geometry.share).toBeLessThan(100);
    expect(geometry.next).toBeLessThan(650);
    await page.locator('[data-share="copy"]').click();
    const copied = new URL(await page.evaluate(() => window.copiedUrl));
    expect(copied.searchParams.get('utm_source')).toBe('copy');
    expect(copied.searchParams.get('utm_medium')).toBe('share');
    expect(copied.searchParams.get('utm_campaign')).toBe('today');
    const events = await page.evaluate(() => window.critiqueEvents);
    for (const name of ['calc_attempt', 'calc_submit', 'calc_complete']) expect(events.filter(e => e[1] === name)).toHaveLength(1);
    await page.reload();
    await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
    expect(await page.evaluate(() => window.critiqueEvents.some(e => e[1] === 'calc_complete'))).toBe(false);
    await page.locator('[data-reading-area][href="#reading-money"]').click();
    await expect(page.locator('#reading-money')).toHaveAttribute('open', '');
    await expect(page.locator('#reading-money')).toBeFocused();
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('#tool-form')).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('#tool-form')).toBeHidden();
    await page.locator('#result [data-edit-profile]').click();
    await expect(page.locator('#tool-form')).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('#tool-form')).toBeVisible();
  });
}

test('성별은 명시적으로 선택하며 실패한 제출과 오류 필드를 측정한다', async ({ page }) => {
  await page.goto('/today/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('[name="a-gender"]:checked')).toHaveCount(0);
  await birthDate(page);
  await page.locator('#tool-form [type="submit"]').click();
  await expect(page.locator('.field-gender [role="alert"]')).toBeVisible();
  await expect(page.locator('[name="a-gender"]').first()).toBeFocused();
  const events = await page.evaluate(() => window.critiqueEvents);
  expect(events.find(e => e[1] === 'form_error')?.[2]).toMatchObject({ error_field: 'gender' });
  expect(events.filter(e => e[1] === 'calc_attempt')).toHaveLength(1);
  expect(events.some(e => e[1] === 'calc_submit' || e[1] === 'calc_complete')).toBe(false);
});

test('검색 유입 계산기는 모바일 첫 화면에서 폼과 제출 버튼에 도달한다', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const rows = [];
  for (const path of ['/today/', '/tomorrow/', '/week/', '/month/', '/year/2027/', '/lifetime/', '/life-story/', '/saju-ranking/']) {
    await page.goto(path);
    await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
    const row = await page.locator('#tool-form').evaluate(form => ({ path: location.pathname, top: form.getBoundingClientRect().top, submit: form.querySelector('[type="submit"]').getBoundingClientRect().bottom }));
    rows.push(row);
  }
  await testInfo.attach('landing-geometry', { body: JSON.stringify(rows, null, 2), contentType: 'application/json' });
  for (const row of rows) {
    expect(row.top, row.path).toBeLessThan(500);
    expect(row.submit, row.path).toBeLessThanOrEqual(844);
  }
});

test('상단 저장·분야 펼침·섹션 도달은 개인 값을 보내지 않는다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/today/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await birthDate(page);
  await page.locator('[name="a-gender"][value="M"]').check();
  await page.locator('#tool-form [type="submit"]').click();
  await page.locator('[data-save-result]').click();
  await expect(page.locator('[data-result-storage]')).toContainText('저장했습니다');
  await page.locator('[data-dismiss-profile-guide]').click();
  await page.locator('[data-reading-area][href="#reading-money"]').click();
  await page.locator('#reading-money .reading-basis > summary').click();
  const events = await page.evaluate(() => window.critiqueEvents);
  for (const name of ['profile_save', 'reading_area_select', 'reading_detail_open', 'result_section_view']) expect(events.some(e => e[1] === name)).toBe(true);
  expect(JSON.stringify(events)).not.toMatch(/1990|1990-05-15|gender.*M|\bs=\d/);
  await expect(page.locator('.partner-ad')).toBeHidden();
  await expect(page.locator('.lucky-banner')).toBeHidden();
});
