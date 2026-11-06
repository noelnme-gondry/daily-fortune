import { test, expect } from '@playwright/test';
import { completeProfile } from './helpers/profile.js';

test.beforeEach(async ({ context }) => { await context.route('https://**/*', route => route.abort()); });

for (const lang of ['ko', 'en']) {
  const prefix = lang === 'en' ? '/en' : '';

  for (const colorScheme of ['light', 'dark']) {
    test(`${lang} ${colorScheme}: 운세 등급은 작은 글자의 대비 기준을 지킨다`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(`${prefix}/tti/2026/`);
      const badges = page.locator('.band-high');
      expect(await badges.count()).toBeGreaterThan(0);
      const ratios = await badges.evaluateAll(elements => elements.map(element => {
        const luminance = color => {
          const channels = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(value => {
            const channel = value / 255;
            return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
          });
          return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
        };
        const style = window.getComputedStyle(element);
        const foreground = luminance(style.color);
        const background = luminance(style.backgroundColor);
        return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
      }));
      for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  }

  test(`${lang}: 작은 화면에서도 캐릭터 설명을 읽고 키보드로 상세를 연다`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${prefix}/life-story/`);
    await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
    await completeProfile(page);
    await page.locator('#tool-form [type="submit"]').click();
    await expect(page.locator('.chapter-card')).toHaveCount(9);
    const labels = await page.locator('.chapter-card :is(.chapter-k, .muted)').evaluateAll(elements => elements.map(element => ({
      size: parseFloat(window.getComputedStyle(element).fontSize),
      fits: element.scrollWidth <= element.clientWidth + 1,
    })));
    for (const label of labels) {
      expect(label.size).toBeGreaterThanOrEqual(11);
      expect(label.fits).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    const card = page.locator('.chapter-card').first();
    await card.hover();
    await expect(card).toHaveCSS('transform', 'none');
    await card.focus();
    await card.press('Enter');
    await expect(page.locator('.character-dialog[open]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(card).toBeFocused();
  });
}
