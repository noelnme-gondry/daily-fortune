import { test, expect } from '@playwright/test';

const profile = { name: '입력 예시', calendar: 'solar', gender: 'M', y: 1993, m: 6, d: 21, timeMode: 'branch', timeBranch: 5, noTime: false };
test.use({ isMobile: true, hasTouch: true });

test.beforeEach(async ({ context, page }) => {
  await context.route('https://**/*', route => route.abort());
  await page.clock.setFixedTime(new Date('2026-11-16T12:00:00+09:00'));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  // 궁합에서 같은 사람을 두 칸에 입력했던 기존 탭을 재현한다.
  await page.addInitScript(input => {
    sessionStorage.setItem('ohaeng:profile', JSON.stringify(input));
    sessionStorage.setItem('ohaeng:partner', JSON.stringify(input));
  }, profile);
});

for (const prefix of ['', '/en']) {
  test(`${prefix || 'ko'}: 모바일 본문과 큰 글자 설정은 읽을 크기를 유지한다`, async ({ page }) => {
    for (const width of [320, 390, 760]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`${prefix}/year/2026/`);
      await expect(page.locator('#reading-career p').first()).toBeVisible();
      await page.locator('[data-reading-size]').selectOption('normal');
      const text = page.locator('#reading-career p').first();
      const normal = await text.evaluate(el => { const s = window.getComputedStyle(el); return { size: parseFloat(s.fontSize), line: parseFloat(s.lineHeight) }; });
      expect(normal.size).toBeGreaterThanOrEqual(17);
      expect(normal.line / normal.size).toBeGreaterThanOrEqual(1.8);
      await page.locator('[data-reading-size]').selectOption('large');
      expect(await text.evaluate(el => parseFloat(window.getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(19);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.goto(`${prefix}/saju/ohaeng/wood/`);
      expect(await page.locator('.prose p').first().evaluate(el => parseFloat(window.getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(17);
    }
  });

  test(`${prefix || 'ko'}: 개인 풀이에서는 저장된 궁합 상대를 표시하지 않고 궁합에서는 두 사람을 유지한다`, async ({ page }) => {
    for (const route of ['today', 'tomorrow', 'week', 'month', 'year/2026', 'manseryeok', 'lifetime']) {
      await page.goto(`${prefix}/${route}/`);
      await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
      const summary = page.locator('.applied-profile p');
      await expect(summary).toContainText(profile.name);
      expect((await summary.innerText()).match(/입력 예시/g)).toHaveLength(1);
      await expect(summary.locator('br')).toHaveCount(0);
    }
    await page.goto(`${prefix}/compatibility/`);
    await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
    const summary = page.locator('.applied-profile p');
    expect((await summary.innerText()).match(/입력 예시/g)).toHaveLength(2);
    await expect(summary.locator('br')).toHaveCount(1);
  });

  test(`${prefix || 'ko'}: 모바일 분야 메뉴는 가로로 잘리지 않고 키보드 이동 시 본문 대신 제목에 초점을 표시한다`, async ({ page }) => {
    await page.goto(`${prefix}/year/2026/#reading-career`);
    await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
    const nav = page.locator('.reading-area-nav');
    const target = page.locator('#reading-career');
    await expect(target).toBeFocused();
    await expect(target).toHaveCSS('outline-style', 'none');
    for (const width of [320, 390, 760]) {
      await page.setViewportSize({ width, height: 844 });
      const bounds = await nav.evaluate(el => {
        const navRect = el.getBoundingClientRect();
        return {
          fits: el.scrollWidth <= el.clientWidth + 1,
          linksFit: [...el.querySelectorAll('a')].every(link => {
            const rect = link.getBoundingClientRect();
            return rect.left >= navRect.left && rect.right <= navRect.right + 1 && link.scrollWidth <= link.clientWidth + 1;
          }),
        };
      });
      expect(bounds).toEqual({ fits: true, linksFit: true });
      await page.locator('[data-reading-area][href="#reading-money"]').tap();
      await expect(page.locator('#reading-money h3')).toBeInViewport({ ratio: 1 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    const link = page.locator('[data-reading-area][href="#reading-career"]');
    await link.focus();
    await page.keyboard.press('Enter');
    await expect(target).toBeFocused();
    await expect(target).toHaveCSS('outline-style', 'none');
    await expect(target.locator('h3')).toHaveCSS('text-decoration-line', 'underline');
    await page.locator('[data-edit-profile]').focus();
    await expect(page.locator('[data-edit-profile]')).toHaveCSS('outline-style', 'solid');
  });
}
