import { test, expect } from '@playwright/test';
import { todayKST } from '../../src/engine/index.js';
import { contrastRatios } from './helpers/contrast.js';
import { completeProfile } from './helpers/profile.js';

test.beforeEach(async ({ context }) => { await context.route('https://**/*', route => route.abort()); });

for (const lang of ['ko', 'en']) {
  const prefix = lang === 'en' ? '/en' : '';

  test(`${lang}: 홈 로고의 읽는 이름에 화면 문구가 포함된다`, async ({ page }) => {
    await page.goto(`${prefix}/`);
    const brand = page.locator('.brand');
    const visibleName = (await brand.innerText()).replace(/\s+/g, ' ').trim();
    await expect(brand).toHaveAccessibleName(visibleName);
  });

  for (const colorScheme of ['light', 'dark']) {
    test(`${lang} ${colorScheme}: 계산한 달력과 원국의 작은 글자는 배경과 구분된다`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.setViewportSize({ width: 320, height: 900 });
      await page.goto(`${prefix}/month/`);
      await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
      await completeProfile(page);
      await page.locator('#tool-form [type="submit"]').click();
      await expect(page.locator('.cal .day-score')).not.toHaveCount(0);
      for (const ratio of await contrastRatios(page.locator('.cal :is(.dn, .ps, .day-score)'))) expect(ratio).toBeGreaterThanOrEqual(4.5);
      await page.locator('.chart-disclosure > summary').click();
      for (const ratio of await contrastRatios(page.locator('#result .char small'))) expect(ratio).toBeGreaterThanOrEqual(4.5);
      await page.locator('[data-reading-script]').selectOption('hangul');
      for (const ratio of await contrastRatios(page.locator('#result .char-hanja'))) expect(ratio).toBeGreaterThanOrEqual(4.5);
      const button = page.locator('.cal [data-reading-date]').first();
      await button.focus();
      await button.press('Enter');
      await expect(button).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('#calendar-day-detail')).toBeVisible();
    });

    test(`${lang} ${colorScheme}: 만세력·띠 주간 등급·궁합표의 작은 글자를 읽을 수 있다`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      const now = todayKST();
      await page.goto(`${prefix}/manseryeok/${now.y}/${now.m}/`);
      for (const ratio of await contrastRatios(page.locator('.manse .hz[class*="el-"]'))) expect(ratio).toBeGreaterThanOrEqual(4.5);
      await page.goto(`${prefix}/tti/compatibility/`);
      for (const ratio of await contrastRatios(page.locator('.heat .hm'))) expect(ratio).toBeGreaterThanOrEqual(4.5);
      await page.goto(`${prefix}/tti/today/snake/`);
      for (const ratio of await contrastRatios(page.locator('.tti-week-list .band'))) expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  }

  test(`${lang}: 계산 결과 버튼의 읽는 이름에 날짜와 선정 이유가 포함된다`, async ({ page }) => {
    for (const path of ['/week/', '/lifetime/']) {
      await page.goto(`${prefix}${path}`);
      await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
      await completeProfile(page);
      await page.locator('#tool-form [type="submit"]').click();
      if (path === '/week/') {
        const button = page.locator('.wd').first();
        const pillar = await button.locator('.p').innerText();
        await expect(button).toHaveAccessibleName(new RegExp(pillar));
      } else {
        const button = page.locator('.life-event-trigger').first();
        const reason = await button.locator('.life-event-reason').innerText();
        await expect(button).toHaveAccessibleName(new RegExp(reason.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      }
    }
  });

  test(`${lang}: 자바스크립트 없이 긴 표를 키보드로 가로 스크롤한다`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ locale: 'ko-KR', javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
    await context.route('https://**/*', route => route.abort());
    const page = await context.newPage();
    const now = todayKST();
    for (const [path, selector] of [['/tti/samjae/', '.table-wrap'], ['/saju/12unseong/', '.table-wrap'], [`/manseryeok/${now.y}/${now.m}/`, '.table-wrap'], ['/tojeong/', '.scroll-x']]) {
      await page.goto(`${baseURL}${prefix}${path}`);
      const region = page.locator(selector).first();
      const overflows = await region.evaluate(element => element.scrollWidth > element.clientWidth + 1);
      if (!overflows) continue;
      await region.focus();
      await expect(region).toBeFocused();
      await region.press('ArrowRight', { delay: 100 });
      await expect.poll(() => region.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
    }
    await context.close();
  });
}
