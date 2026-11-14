import { test, expect } from '@playwright/test';
import { completeProfile, editProfile } from './helpers/profile.js';

test('내 순위를 공개하고 재계산하면 점과 등급 캐릭터, 특기가 새 결과에 맞춰 바뀐다', async ({ page, context }) => {
  await context.route('https://**/*', (route) => route.abort());
  await page.setViewportSize({ width: 320, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/saju-ranking/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await page.locator('#a-y').fill('1993');
  await page.locator('#a-m').selectOption('1');
  await page.locator('#a-d').selectOption('28');
  await page.locator('input[name="a-tmode"][value="exact"]').check();
  await page.locator('#a-time').fill('03:40');
  await completeProfile(page);

  const submit = page.locator('#tool-form button[type="submit"]');
  const reveal = page.getByRole('button', { name: '내 순위 공개', exact: true });
  const marker = page.locator('.rank-plot-marker');
  const rank = page.locator('.rank-num');
  const curve = page.locator('.rank-plot-curve');
  const share = page.locator('#rank-share');
  await submit.click();
  await expect(reveal).toBeVisible();
  await expect(reveal).toHaveAttribute('aria-expanded', 'false');
  const controls = (await reveal.getAttribute('aria-controls')).split(' ');
  for (const id of controls) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
    await expect(page.locator(`#${id}`)).toBeHidden();
  }
  await expect(marker).toBeHidden();
  await expect(curve).toBeVisible();
  const fourPillarCurve = await curve.getAttribute('points');
  await reveal.press('Enter');
  await expect(rank).toBeFocused();
  await expect(rank).toHaveText('95,445위');
  await expect(page.locator('.rank-tier')).toContainText('B 등급');
  await expect(page.locator('.rank-character')).toHaveText('숲길의 정찰꾼');
  await expect(page.locator('.rank-specialty')).toContainText('재물 · 상위 2%');
  const portrait = page.locator('.rank-identity img');
  await expect.poll(() => portrait.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
  await expect(marker).toBeVisible();
  await expect(marker).toHaveCSS('animation-name', 'none');
  await expect(marker).toHaveAttribute('style', /--rank-x:67\.1%/);
  await expect(page.locator('.rank-score-marker')).toHaveText('내 점수 67.1점');
  await expect(share).toBeVisible();
  await expect(page.locator('#rank-details')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);

  await editProfile(page);
  await page.locator('#a-notime').check();
  await submit.click();
  await expect(reveal).toBeVisible();
  await expect(marker).toBeHidden();
  await expect(share).toBeHidden();
  await expect(curve).not.toHaveAttribute('points', fourPillarCurve);
  await reveal.click();
  await expect(rank).toHaveText('25,855위');
  await expect(page.locator('.rank-pool')).toContainText('43,200가지');
  await expect(page.locator('.rank-tier')).toContainText('C 등급');
  await expect(page.locator('.rank-character')).toHaveText('복숭아밭의 정원사');
  await expect(page.locator('.rank-specialty')).toContainText('인기·매력 · 상위 4%');
  await expect(marker).toHaveAttribute('style', /--rank-x:48\.1%/);
  for (const width of [768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await expect(marker).toBeVisible();
  }
});
