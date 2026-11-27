import { test, expect } from '@playwright/test';
import { completeProfile } from './helpers/profile.js';
import { fmtDate, parseISO } from '../../src/engine/index.js';
import { withLanguage } from '../../src/i18n/runtime.js';

test('입력 중 한국 자정을 넘어도 띠별에서 선택한 날짜와 분야가 열리고 새로고침해도 유지된다', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-27T14:59:00Z'));
  await page.goto('/tomorrow/?zodiac_date=2026-11-28&zodiac_area=money');
  await expect(page.locator('.reading-handoff-note')).toContainText('11월 28일');
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await completeProfile(page);
  await page.clock.setFixedTime(new Date('2026-11-27T15:01:00Z'));
  await page.getByRole('button', { name: '11월 28일 내 금전운 보기' }).click();
  await expect(page.locator('#reading-money')).toBeFocused();
  await expect(page.locator('#reading-summary')).toContainText('11월 28일');
  await page.reload();
  await expect(page.locator('#reading-summary')).toContainText('11월 28일');
  await page.goto('/tomorrow/?zodiac_date=2026-02-30&zodiac_area=money');
  await expect(page.locator('.reading-handoff-note')).toHaveCount(0);
  await expect(page.locator('#reading-summary')).toContainText('11월 29일');
});

test('목록에서 띠 상세를 열고 처음에는 입력, 저장한 생일은 새 탭에서도 바로 종합과 일곱 분야를 본다', async ({ context, page }) => {
  await page.goto('/tti/tomorrow/');
  await expect(page.locator('.premium-entry')).toHaveCount(0);
  await page.locator('.tti-name[href="/tti/tomorrow/horse/"]').click();
  await expect(page).toHaveURL(/\/tti\/tomorrow\/horse\/$/);
  await expect(page.locator('dialog[open], .premium-entry')).toHaveCount(0);
  await expect(page.locator('.tti-week-list li')).toHaveCount(7);
  await page.locator('[data-reading-target="overview"]').click();
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#tool-form')).toBeVisible();
  await completeProfile(page);
  await page.locator('#save-device').check();
  await page.locator('#tool-form [type="submit"]').click();
  await expect(page.locator('#reading-summary')).toBeFocused();
  const fresh = await context.newPage();
  await fresh.goto('/tti/tomorrow/horse/');
  await fresh.locator('[data-reading-target="overview"]').click();
  await expect(fresh.locator('#reading-summary')).toBeFocused();
  await expect(fresh.locator('#tool-form')).toBeHidden();
  await expect(fresh.locator('.daily-cats article[id^="reading-"]')).toHaveCount(7);
});

for (const period of ['today', 'tomorrow']) for (const prefix of ['', '/en']) test(prefix + '/' + period + ' 띠별에서 직접 고른 분야와 날짜를 개인 풀이로 가져간다', async ({ page }) => {
  await page.goto(prefix + '/tti/' + period + '/ox/');
  const selection = page.locator('[data-zodiac-area="money"]');
  const offer = page.locator('[data-reading-target="area"]');
  const date = await offer.getAttribute('data-reading-date-iso');
  await selection.click();
  await expect(page.locator('#zodiac-ox-money')).toBeInViewport();
  await expect(offer).toHaveText(await selection.getAttribute('data-personal-label'));
  await expect(offer).toHaveAttribute('data-zodiac-handoff', 'money');
  await page.reload();
  await expect(offer).toHaveAttribute('data-zodiac-handoff', 'money');
  await offer.click();
  const dest = new URL(page.url());
  expect(dest.pathname).toBe(prefix + '/' + period + '/');
  expect(dest.searchParams.get('zodiac_date')).toBe(date);
  expect(dest.searchParams.get('zodiac_area')).toBe('money');
  expect(dest.hash).toBe('#reading-money');
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await completeProfile(page);
  await page.locator('#tool-form [type=submit]').click();
  await expect(page.locator('#reading-money')).toBeFocused();
  const expected = withLanguage(prefix ? 'en' : 'ko', () => fmtDate(parseISO(date)));
  await expect(page.locator('#reading-summary')).toContainText(expected);
});
