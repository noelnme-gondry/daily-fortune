import { completeProfile } from './helpers/profile.js';
import { test, expect } from '@playwright/test';
import { findCompatMatches } from '../../src/domain/compat-matches.js';
import { COMPAT_CATEGORIES } from '../../src/engine/compat.js';

const today = { y: 2026, m: 10, d: 14 };
const a = { y: 1993, m: 1, d: 28, gender: 'F', calendar: 'solar', time: '03:40' };
const b = { y: 1988, m: 7, d: 1, gender: 'M', calendar: 'solar', time: '12:00' };

test.beforeEach(async ({ context, page }) => {
  await context.route('https://**/*', (route) => route.abort());
  await page.clock.setFixedTime(new Date('2026-10-14T07:00:00+09:00'));
});

async function calculate(page) {
  await page.goto('/compatibility/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  for (const [side, input] of [['a', a], ['b', b]]) {
    for (const field of ['y', 'm', 'd']) await page.locator(`#${side}-${field}`).selectOption(String(input[field]));
    await page.locator(`input[name="${side}-gender"][value="${input.gender}"]`).check();
    await page.locator(`#${side}-time`).fill(input.time);
  }
  await completeProfile(page);
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('#result .report-head')).toBeVisible();
}

const pairReport = (page) => page.locator('#result > :not(.compat-matches)').evaluateAll((els) => els.map((el) => el.innerHTML));

test('궁합 맨 아래 추천: 분야별 실점수·상세·모바일·기준 전환, 기존 두 사람 결과 유지', async ({ page }) => {
  const expected = findCompatMatches(a, b.gender, today);
  await calculate(page);
  const section = page.locator('.compat-matches');
  await expect(page.locator('#result > :last-child')).toHaveClass(/compat-matches/);
  await expect(section.locator('[data-match-results]')).toHaveAttribute('aria-busy', 'false', { timeout: 20000 });
  await expect(section.locator('[data-match-scope]')).toContainText('1983~2003년생 · 남성');
  const originalReport = await pairReport(page);
  for (const [key] of COMPAT_CATEGORIES) {
    await section.locator('[data-match-category]').selectOption(key);
    await expect(section.locator('.leader-button')).toHaveCount(5);
    await expect(section.locator('.leader-score')).toHaveText(expected.rankings[key].slice(0, 5).map((r) => `${r.score}점`));
    await expect(section.locator('.leader-place').first()).toHaveText('1위');
    await expect(section.locator('.leader-date')).toHaveText(expected.rankings[key].slice(0, 5).map((r) => `양력 ${r.input.y}년 ${r.input.m}월 ${r.input.d}일`));
    await expect(section.locator('.ranking-page-numbers button')).toHaveCount(20);
    await expect(section.getByRole('button', { name: '이전 페이지', exact: true })).toBeDisabled();
    await section.getByRole('button', { name: '20페이지', exact: true }).click();
    await expect(section.locator('.leader-score')).toHaveText(expected.rankings[key].slice(95).map((r) => `${r.score}점`));
    await expect(section.locator('.leader-date')).toHaveText(expected.rankings[key].slice(95).map((r) => `양력 ${r.input.y}년 ${r.input.m}월 ${r.input.d}일`));
    await expect(section.locator('.leader-place')).toHaveText(expected.rankings[key].slice(95).map((r) => `${r.rank}위`));
    await expect(section.getByRole('button', { name: '다음 페이지', exact: true })).toBeDisabled();
    await expect(section.locator('.ranking-page-summary')).toContainText('96–100 / 100개');
  }
  await section.locator('[data-match-category]').selectOption('money');
  await page.setViewportSize({ width: 320, height: 850 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await expect(section.locator('.ranking-pagination [aria-current="page"]')).toHaveText('1');
  await section.getByRole('button', { name: '다음 페이지', exact: true }).press('Enter');
  await expect(section.locator('.ranking-pagination [aria-current="page"]')).toHaveText('2');
  await expect(section.locator('.leader-score')).toHaveText(expected.rankings.money.slice(5, 10).map((r) => `${r.score}점`));
  await expect(section.getByRole('button', { name: '다음 페이지', exact: true })).toBeFocused();
  await section.getByRole('button', { name: '이전 페이지', exact: true }).press('Enter');
  await expect(section.getByRole('button', { name: '1페이지', exact: true })).toBeFocused();
  const first = section.locator('.leader-button').first();
  await expect(first).toContainText(`만 ${expected.rankings.money[0].age}세`);
  await first.focus();
  await page.keyboard.press('Enter');
  const dialog = section.locator('dialog[open]');
  await expect(dialog).toBeVisible();
  const id = await first.getAttribute('aria-controls');
  await expect(dialog).toHaveAttribute('id', id);
  await expect(dialog).toHaveAttribute('aria-labelledby', `${id}-title`);
  await expect(dialog.locator('.leader-pillars dt')).toHaveText(['년주', '월주', '일주', '시주']);
  await expect(dialog.locator('[data-match-score]')).toHaveText(COMPAT_CATEGORIES.map(([k]) => `${expected.rankings.money[0].scores[k]}점`));
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  await page.keyboard.press('Tab');
  expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(first).toBeFocused();
  const before = await section.locator('.leader-date').allTextContents();
  await section.getByRole('button', { name: '20페이지', exact: true }).click();
  await section.locator('[data-match-base="b"]').click();
  await expect(section.locator('[data-match-base="b"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(section.locator('[data-match-scope]')).toContainText('1978~1998년생 · 여성');
  await expect(section.locator('[data-match-results]')).toHaveAttribute('aria-busy', 'false', { timeout: 20000 });
  await expect(section.locator('.ranking-pagination [aria-current="page"]')).toHaveText('1');
  expect(await section.locator('.leader-date').allTextContents()).not.toEqual(before);
  expect(await pairReport(page)).toEqual(originalReport);
  await section.locator('[data-match-base="a"]').click();
  await expect(section.locator('.leader-date')).toHaveText(before);
  expect(await pairReport(page)).toEqual(originalReport);
  await expect(page.locator('#a-y')).toHaveValue('1993');
  await expect(page.locator('#b-y')).toHaveValue('1988');
});

test('추천 계산 실패는 재시도 가능하고 새 입력은 진행 중인 이전 검색을 폐기한다', async ({ page }) => {
  await page.route('**/compat-matches.worker.js*', (route) => route.abort());
  await calculate(page);
  const section = page.locator('.compat-matches');
  await expect(section.locator('[data-match-status]')).toContainText('계산하지 못했습니다');
  await expect(section.locator('.leader-button')).toHaveCount(0);
  await expect(page.locator('#result .report-head')).toBeVisible();
  await page.unroute('**/compat-matches.worker.js*');
  await section.locator('[data-match-retry]').click();
  await expect(section.locator('.leader-button')).toHaveCount(5, { timeout: 20000 });
  await section.locator('[data-match-base="b"]').click();
  await page.locator('#a-y').selectOption('2000');
  await page.locator('#a-notime').check();
  await completeProfile(page);
  await page.locator('button[type="submit"]').click();
  await expect(section.locator('[data-match-base="a"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(section.locator('[data-match-scope]')).toContainText('1990~2010년생');
  await expect(section.locator('[data-match-scope]')).toContainText('출생 시간 제외');
  await expect(section.locator('.leader-button')).toHaveCount(5, { timeout: 20000 });
  const expected = findCompatMatches({ ...a, y: 2000, time: null }, b.gender, today);
  await expect(section.locator('.leader-date')).toHaveText(expected.rankings.total.slice(0, 5).map((r) => `양력 ${r.input.y}년 ${r.input.m}월 ${r.input.d}일`));
  await expect(section.locator('[data-match-retry]')).toBeHidden();
});
