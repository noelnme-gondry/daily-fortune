import { test, expect } from '@playwright/test';
import { completeProfile, editProfile } from './helpers/profile.js';
import { contrastRatios } from './helpers/contrast.js';

const screens = ['/', '/today/', '/tomorrow/', '/week/', '/month/', '/year/2026/', '/lifetime/', '/manseryeok/', '/compatibility/', '/life-story/', '/saju-ranking/', '/tojeong/', '/tti/today/rat/', '/tti/2027/rat/', '/saju/ilju-ranking/', '/saju/glossary/', '/saju/ilgan/', '/saju/ohaeng/', '/guides/', '/about/'];

test.beforeEach(async ({ context, page }) => {
  await context.route('https://**/*', route => route.abort());
  await page.clock.setFixedTime(new Date('2026-11-16T12:00:00+09:00'));
});

for (const lang of ['ko', 'en']) for (const colorScheme of ['light', 'dark']) {
  test(`${lang}/${colorScheme}: 주요 페이지의 결과·줄바꿈·대비·메뉴를 검사한다`, async ({ page }, testInfo) => {
    test.setTimeout(240000);
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    const prefix = lang === 'en' ? '/en' : '';
    const failures = [];
    page.on('pageerror', error => failures.push(error.message));
    for (const path of screens) {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(`${prefix}${path}`);
      const tool = page.locator('#tool');
      if (await tool.count()) {
        await expect(tool).toHaveAttribute('data-ready', 'true');
        if (path !== '/') {
          await editProfile(page);
          await completeProfile(page);
          await page.locator('#tool-form [type=submit]').click();
          await expect(page.locator('#result .chart-card, #result .report-head, #result .chapter-card').first()).toBeAttached();
          if (path === '/saju-ranking/') await page.locator('[data-rank-reveal]').click();
          const folds = page.locator('#result details,#result [data-disclosure]');
          await expect(folds).toHaveCount(path === '/year/2026/' ? 1 : 0);
          if (path === '/year/2026/') await expect(folds).toHaveClass('reading-fold');
          if (path === '/lifetime/') await expect(page.locator('#result .chart-svg')).toBeVisible();
          if (path === '/saju-ranking/') await expect(page.locator('.rank-distribution svg')).toBeVisible();
        }
      }
      for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.evaluate(() => window.scrollTo(0, 0));
        const overflow = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, viewport: window.innerWidth, offenders: [...document.querySelectorAll('main *,header *')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.right > window.innerWidth + 1 || r.left < -1) && window.getComputedStyle(el).position !== 'fixed' && !el.closest('.scroll-x,.table-wrap,.scroll-rail'); }).slice(0, 8).map(el => el.className) }));
        expect.soft(overflow.page, `${path}/${width}: ${JSON.stringify(overflow.offenders)}`).toBeLessThanOrEqual(width + 1);
        const overlaps = await page.evaluate(() => [...document.querySelectorAll('.head-row,.gnav,.period-switch,.purpose-links,.evidence-grid,.rank-evidence')].flatMap(group => {
          const items = [...group.children].filter(el => el.getClientRects().length && window.getComputedStyle(el).position !== 'absolute').map(el => ({ text: el.textContent.trim().slice(0, 35), rect: el.getBoundingClientRect() }));
          return items.flatMap((a, index) => items.slice(index + 1).filter(b => Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left) > 1 && Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top) > 1).map(b => `${group.className}: ${a.text} / ${b.text}`));
        }));
        expect.soft(overlaps, `${path}/${width}: overlapping controls or cards`).toEqual([]);
        const navigation = await page.locator('.gnav a,.purpose-links a:visible').evaluateAll(links => links.map(a => ({ text: a.textContent.trim(), width: a.clientWidth, scroll: a.scrollWidth })));
        for (const item of navigation) expect.soft(item.scroll, `${path}/${width}: ${item.text}`).toBeLessThanOrEqual(item.width + 1);
        if ((width === 390 || width === 1440) && ['/', '/today/', '/lifetime/', '/compatibility/', '/saju-ranking/'].includes(path)) {
          await page.screenshot({ path: testInfo.outputPath(`${path.replaceAll('/', '') || 'home'}-${width}.png`), fullPage: true });
          await page.screenshot({ path: testInfo.outputPath(`${path.replaceAll('/', '') || 'home'}-${width}-viewport.png`), fullPage: false });
        }
      }
      const ratios = await contrastRatios(page.locator('h1:visible,h2:visible,h3:visible,.daily-outlook:visible,.purpose-links a:visible,.period-switch a:visible,.home-feature b:visible'));
      for (const ratio of ratios) expect.soft(ratio, path).toBeGreaterThanOrEqual(4.5);
      await page.locator('[data-dialog="site-menu"]').click();
      await expect(page.locator('#site-menu')).toBeVisible();
      await expect(page.locator('#site-menu .purpose-groups > section')).toHaveCount(5);
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-dialog="site-menu"]')).toBeFocused();
    }
    expect(failures).toEqual([]);
  });
}

test('설명 창은 항목별 근거를 보여주고 키보드로 닫으면 원래 버튼에 돌아온다', async ({ page }) => {
  await page.goto('/manseryeok/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await completeProfile(page);
  await page.locator('#tool-form [type=submit]').click();
  const triggers = page.locator('.chart-basis .explanation-button');
  for (let repeat = 0; repeat < 3; repeat++) for (const trigger of await triggers.all()) {
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('dialog[open]')).toHaveCount(1);
    await expect(page.locator('dialog[open] .explanation-body p').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog[open]')).toHaveCount(0);
    await expect.poll(() => trigger.evaluate(el => document.activeElement === el ? 'focused' : document.activeElement?.outerHTML.slice(0, 220))).toBe('focused');
    const next = page.locator('#result [data-edit-profile]');
    await next.focus();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await expect.poll(() => next.evaluate(el => document.activeElement === el ? 'focused' : document.activeElement?.outerHTML.slice(0, 220))).toBe('focused');
  }
  await expect(page.locator('#result details,#result [data-disclosure]')).toHaveCount(0);
});


test('터치로 용어 설명을 한 번 누르면 떠 있고 다시 누르면 닫힌다', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await context.route('https://**/*', route => route.abort());
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4176/manseryeok/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await completeProfile(page);
  await page.locator('#tool-form [type=submit]').click();
  const button = page.locator('#result .chart-start .info');
  await button.tap();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  const tip = page.locator(`#${await button.getAttribute('data-tip-id')}`);
  await expect(tip).toBeVisible();
  const rect = await tip.boundingBox();
  expect(rect.x).toBeGreaterThanOrEqual(0);
  expect(rect.x + rect.width).toBeLessThanOrEqual(390);
  await button.tap();
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(tip).toBeHidden();
  await context.close();
});
