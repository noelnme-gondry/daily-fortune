import { completeProfile } from './helpers/profile.js';
import { test, expect } from '@playwright/test';
import { todayKST } from '../../src/engine/core.js';
import { calculateTojeong } from '../../src/domain/tojeong.js';

test.use({ locale: 'en-US' });
test.beforeEach(async ({ context }) => { await context.route('https://**/*', (route) => route.abort()); });

async function calculate(page) {
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await page.locator('#a-name').fill('Alex');
  await page.locator('#a-y').selectOption('1993');
  await page.locator('#a-m').selectOption('1');
  await page.locator('#a-d').selectOption('28');
  await page.locator('#a-time').fill('03:40');
  await completeProfile(page);
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('#result [data-result-summary]').first()).toBeVisible();
}

test('browser language redirects matching paths, preserves queries and remembers manual Korean', async ({ page, request }) => {
  const response = await request.get('/today/?utm_source=english', { maxRedirects: 0, headers: { 'Accept-Language': 'en-US,en;q=0.9' } });
  expect(response.status()).toBe(302);
  expect(response.headers().location).toBe('/en/today/?utm_source=english');
  expect(response.headers()['cache-control']).toContain('no-store');
  await page.goto('/today/?utm_source=english');
  await expect(page).toHaveURL(/\/en\/today\/\?utm_source=english$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.brand-name b')).toHaveText('K-Fortune');
  await page.locator('[data-set-language="ko"]').click();
  await expect(page).toHaveURL(/\/today\/\?utm_source=english$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
  await page.goto('/week/');
  await expect(page).toHaveURL(/(?<!\/en)\/week\/$/);
  await page.goto('/en/week/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  const korean = await request.get('/today/', { maxRedirects: 0, headers: { Cookie: '', 'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8' } });
  expect(korean.status()).toBe(200);
  const bot = await request.get('/today/', { maxRedirects: 0, headers: { Cookie: '', 'Accept-Language': 'en-US', 'User-Agent': 'Googlebot' } });
  expect(bot.status()).toBe(200);
});

test('all English calculators render English results and keep internal links in English', async ({ page }) => {
  test.setTimeout(120000);
  const errors = []; page.on('pageerror', (error) => errors.push(error.message));
  const paths = ['/today/', '/tomorrow/', '/week/', '/month/', `/year/${todayKST().y}/`, '/lifetime/', '/manseryeok/', '/life-story/', '/saju-ranking/', '/compatibility/'];
  for (const path of paths) {
    await page.goto(`/en${path}`);
    await calculate(page);
    expect((await page.locator('#result').textContent()).match(/[가-힣]+/g), path).toBeNull();
    const links = await page.locator('#result a[href^="/"]').evaluateAll((items) => items.map((item) => item.getAttribute('href')));
    expect(links.every((href) => href.startsWith('/en/')), path).toBe(true);
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      const overflow = await page.evaluate(() => [...document.querySelectorAll('body *')].filter((el) => {
        const bounds = el.getBoundingClientRect();
        return bounds.width > 0 && bounds.right > window.innerWidth + 1;
      }).slice(0, 8).map((el) => `${el.tagName}.${el.className}: ${el.getBoundingClientRect().right}`));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${path} at ${width}px: ${overflow.join(', ')}`).toBe(true);
    }
    if (path === '/life-story/') {
      await page.locator('.chapter-card').first().click();
      await expect(page.locator('dialog[open]')).toContainText('This chapter’s story');
      await page.keyboard.press('Escape');
    }
    if (path === '/compatibility/') {
      await expect(page.locator('[data-match-results]')).toHaveAttribute('aria-busy', 'false', { timeout: 30000 });
      expect(await page.locator('.compat-matches').textContent()).not.toMatch(/[가-힣]/);
      await page.locator('.compat-matches .leader-button').first().click();
      await expect(page.locator('dialog[open]')).toContainText('compatibility');
      await page.keyboard.press('Escape');
    }
  }
  expect(errors).toEqual([]);
});

test('English home input, result sharing and locale switch preserve the selected result', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await page.locator('#a-name').fill('Alex');
  await completeProfile(page);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/en\/today\/$/);
  await expect(page.locator('#result .report-head')).toBeVisible();
  await page.evaluate(() => Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => false }));
  const download = page.waitForEvent('download');
  await page.locator('[data-share="image"]').click();
  expect((await download).suggestedFilename()).toBe('K-Fortune-today.png');
  await expect(page.locator('.result-share .toast')).toHaveText('Image download started.');
  await page.evaluate(() => { window.shareOpened = []; window.open = (...args) => window.shareOpened.push(args); });
  await page.locator('[data-share="x"]').click();
  const social = await page.evaluate(() => window.shareOpened[0][0]);
  const share = new URL(social).searchParams.get('url');
  expect(new URL(share).pathname).toBe('/en/share/');
  await page.goto(share);
  const score = await page.locator('.sc-big').textContent();
  await expect(page.locator('.share-card')).not.toContainText('생년');
  await page.locator('[data-set-language="ko"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
  expect(parseFloat(await page.locator('.sc-big').textContent())).toBe(parseFloat(score));
  await page.locator('[data-set-language="en"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(await page.locator('.share-card').textContent()).not.toMatch(/[가-힣]/);
});

test('English zodiac soft navigation updates language links, metadata and cohort readings', async ({ page }) => {
  await page.goto('/en/tti/');
  await page.locator('.tti-nav > a').nth(1).click();
  await expect(page).toHaveURL(new RegExp(`/en/tti/${todayKST().y}/`));
  await expect(page.locator('[data-set-language="ko"]')).toHaveAttribute('href', `/tti/${todayKST().y}/`);
  await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href', new RegExp(`/en/tti/${todayKST().y}/$`));
  await page.locator('.zodiac-year-link').first().click();
  await expect(page.locator('[data-cohort]')).toHaveAttribute('data-ready', 'true');
  await page.locator('[data-cohort]').selectOption('1996');
  await expect(page.locator('[data-cohort-text]')).toContainText('Born 1996');
  expect(await page.locator('[data-monthly-flow]').textContent()).not.toMatch(/[가-힣]/);
});

test('English Tojeong fetches only its reading, shows all months and retains the code across languages', async ({ page }) => {
  const requests = [];
  page.on('request', (request) => { if (request.url().includes('/data/tojeong/')) requests.push(new URL(request.url()).pathname); });
  await page.goto(`/tojeong/${todayKST().y}/?utm_source=english`);
  await expect(page).toHaveURL(/\/en\/tojeong\/\?utm_source=english$/);
  await expect(page.locator('#tojeong-tool')).toHaveAttribute('data-ready', 'true');
  await page.locator('#tj-name').fill('Alex');
  await page.locator('#tj-y').selectOption('1993');
  await page.locator('#tj-m').selectOption('6');
  await page.locator('#tj-d').selectOption('21');
  await completeProfile(page);
  await page.locator('#tojeong-tool button[type="submit"]').click();
  const code = calculateTojeong({ calendar: 'solar', y: 1993, m: 6, d: 21 }, todayKST().y).code;
  await expect(page.locator('.tojeong-code')).toHaveText(code);
  expect(requests).toEqual([`/data/tojeong/en/${code}.json`]);
  expect(await page.locator('#tojeong-result').textContent()).not.toMatch(/[가-힣]/);
  await expect(page.locator('[data-tojeong-month]')).toHaveCount(12);
  await page.locator('[data-tojeong-month="12"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#tj-month-12')).toBeVisible();
  await expect(page.locator('#tj-month-1')).toBeHidden();
  await page.setViewportSize({ width: 320, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await page.locator('[data-set-language="ko"]').click();
  await expect(page.locator('#tj-name')).toHaveValue('Alex');
  await expect(page.locator('.tojeong-code')).toHaveText(code);
  expect(requests).toEqual([`/data/tojeong/en/${code}.json`, `/data/tojeong/${code}.json`]);
});
