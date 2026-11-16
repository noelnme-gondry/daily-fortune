import { test, expect } from '@playwright/test';
import { buildChart, day, lifeStory } from '../../src/engine/index.js';
import { EXAMPLE_INPUT } from '../../src/site/public-examples.js';
import { withLanguage } from '../../src/i18n/runtime.js';

test.beforeEach(async ({ context }) => { await context.route('https://**/*', route => route.abort()); });

for (const lang of ['ko', 'en']) test(`${lang}: 홈의 운세 예시는 실제 계산을 보여주고 개인 입력과 구분된다`, async ({ page }) => {
  await page.goto(lang === 'en' ? '/en/' : '/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  const preview = page.locator('.home-reading');
  const [y, m, d] = (await preview.getAttribute('data-reading-example-date')).split('-').map(Number);
  const reading = withLanguage(lang, () => day(buildChart(EXAMPLE_INPUT), { y, m, d }));
  await expect(preview.locator('[data-example-score]')).toHaveText(String(reading.overall.score));
  await expect(preview.locator('[data-example-outlook]')).toHaveText(reading.overall.outlook);
  for (const cat of reading.cats) {
    await expect(preview.locator(`[data-example-area-score="${cat.key}"]`)).toHaveText(`${cat.score}${lang === 'ko' ? '점' : ' pts'}`);
    await expect(preview).toContainText(cat.reading.outlook);
  }
  await expect(preview).toContainText(lang === 'ko' ? '가상 사례' : 'fictional example');
  await expect(page.locator('#a-y')).toHaveValue('');
  await expect(page.locator('#result')).toBeEmpty();
  const story = withLanguage(lang, () => lifeStory(buildChart(EXAMPLE_INPUT), { y, m, d }));
  await expect(page.locator('[data-example-stage]')).toHaveCount(3);
  for (const stage of story.stages.filter((_, i) => [0, 4, 8].includes(i))) {
    const scene = page.locator(`[data-example-stage="${stage.key}"]`);
    await expect(scene).toContainText(stage.ages);
    await expect(scene).toContainText(stage.character.full);
    await scene.scrollIntoViewIfNeeded();
    await expect.poll(() => scene.locator('img').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  }
  for (const width of [320, 390, 768, 820, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    if (width === 390) await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await expect(preview.locator('dd')).toHaveCount(7);
  }
});

for (const width of [390, 1024]) test(`${width}px 풀이 목차는 본문을 가리지 않고 키보드·동작 줄이기 설정으로 즉시 입력을 연다`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  await page.goto('/today/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await page.locator('#a-y').fill('1990');
  await page.locator('#a-m').selectOption('5');
  await page.locator('#a-d').selectOption('17');
  await page.locator('[name="a-gender"][value="M"]').check();
  await page.locator('#a-notime').check();
  await page.locator('#tool-form [type="submit"]').click();
  const nav = page.locator('#result > .reading-area-nav');
  const last = nav.locator('a').last();
  const target = await last.getAttribute('href');
  await last.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator(target)).toBeFocused();
  await expect(last).toHaveAttribute('aria-current', 'location');
  if (width <= 760) {
    // 펼쳐진 두 줄 메뉴가 작은 화면의 본문을 덮지 않도록 일반 흐름에 둔다.
    await expect(nav).toHaveCSS('position', 'static');
    expect(await nav.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await expect(page.locator(`${target} h3`)).toBeInViewport({ ratio: 1 });
    await expect.poll(() => page.locator(target).evaluate(el => el.getBoundingClientRect().top >= Math.max(0, document.querySelector('.site-head').getBoundingClientRect().bottom))).toBe(true);
  } else {
    await expect(nav).toBeInViewport({ ratio: 1 });
    await expect.poll(() => nav.evaluate(el => {
      const header = document.querySelector('.site-head');
      const top = header.classList.contains('is-hidden') ? 0 : Math.max(0, header.getBoundingClientRect().bottom);
      return Math.abs(el.getBoundingClientRect().top - top) < 2;
    })).toBe(true);
    // 카드의 여백·경계선이 아니라 실제 제목과 첫 문장이 메뉴 아래에 있는지 검사한다.
    await expect.poll(() => page.locator(target).evaluate(el => {
      const contentTop = Math.min(...[...el.querySelectorAll('h3, .daily-outlook')].map(node => node.getBoundingClientRect().top));
      return contentTop - document.querySelector('.reading-area-nav').getBoundingClientRect().bottom;
    })).toBeGreaterThanOrEqual(0);
  }
  await page.evaluate(() => {
    window.__readingScroll = [];
    const scroll = window.Element.prototype.scrollIntoView;
    window.Element.prototype.scrollIntoView = function (options) {
      if (this.id === 'tool-form') window.__readingScroll.push(options.behavior);
      return scroll.call(this, options);
    };
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('[data-edit-profile]').click();
  await expect(page.locator('#a-y')).toBeFocused();
  expect(await page.evaluate(() => window.__readingScroll.at(-1))).toBe('instant');
  await page.locator('#tool-form [type="submit"]').click();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('[data-edit-profile]').focus();
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => window.__readingScroll.at(-1))).toBe('instant');
});
