import { test, expect } from '@playwright/test';
import { buildChart, day, lifetime, compat, branchRels, BR_H } from '../../src/engine/index.js';
import { DEEP_EXAMPLE_INPUT as input, PARTNER_EXAMPLE_INPUT as partner } from '../../src/site/public-examples.js';
import { withLanguage } from '../../src/i18n/runtime.js';

const date = { y: 2026, m: 10, d: 24 };
test.beforeEach(async ({ context, page }) => {
  await context.route('https://**/*', route => route.abort());
  await page.clock.setFixedTime(new Date('2026-10-24T12:00:00+09:00'));
  await context.addInitScript(() => { window.designEvents = []; window.gtag = (...args) => window.designEvents.push(args); });
});
async function ready(page, path) {
  await page.goto(path);
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
}
async function fill(page, birth = input) {
  for (const key of ['y', 'm', 'd']) await page.locator(`#a-${key}`).selectOption(String(birth[key]));
  await page.locator(`[name="a-gender"][value="${birth.gender}"]`).check();
  await page.locator('#a-notime').uncheck();
  await page.locator('#a-time').fill(birth.time);
}
const submit = page => page.locator('#tool-form [type="submit"]').click();
const noOverflow = async page => expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);

for (const lang of ['ko', 'en']) {
  const prefix = lang === 'en' ? '/en' : '';
  test(`${lang}: 첫 홈의 입력 순서·전체 메뉴와 재방문 정보 수정·삭제`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await ready(page, `${prefix}/`);
    await expect(page.locator('#tool-form')).toBeVisible();
    const order = await page.evaluate(() => ['#tool-form', '.purpose-list', '.home-features'].map(s => document.querySelector(s).getBoundingClientRect().top));
    expect(order[0]).toBeLessThan(order[1]); expect(order[1]).toBeLessThan(order[2]);
    expect(order[0]).toBeLessThan(600);
    await fill(page); await page.locator('#save-device').check(); await submit(page);
    await expect(page).toHaveURL(new RegExp(`${prefix}/today/$`));
    await ready(page, `${prefix}/`);
    await expect(page.locator('[data-saved-entry]')).toBeVisible();
    await expect(page.locator('#tool-form')).toBeHidden();
    await expect(page.locator('[data-saved-summary]')).toContainText('1990.5.15');
    await page.locator('[data-saved-result]').click();
    await expect(page.locator('#result .report-head')).toBeVisible();
    await page.locator('[data-saved-entry] [data-edit-profile]').click();
    await expect(page.locator('#a-y')).toBeFocused();
    await expect(page.locator('#a-time')).toHaveValue('14:00');
    await expect(page.locator('[data-saved-entry] [data-edit-profile]')).toHaveAttribute('aria-expanded', 'true');
    await page.locator('[data-delete-profile]').click();
    await expect(page.locator('[data-saved-entry]')).toBeHidden();
    await page.reload();
    await expect(page.locator('#tool-form')).toBeVisible();
    await expect(page.locator('#a-y')).toHaveValue('');
    for (const width of [320, 768, 1280]) { await page.setViewportSize({ width, height: 900 }); await noOverflow(page); }
  });

  test(`${lang}: 분야별 운세·원국 관계는 실제 입력값과 연결되고 재계산에 갱신된다`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await ready(page, `${prefix}/today/`); await fill(page); await submit(page);
    const expected = withLanguage(lang, () => day(buildChart(input), date, 'today'));
    const cards = page.locator('.daily-cat');
    for (let i = 0; i < expected.cats.length; i++) {
      await expect(cards.nth(i)).toBeVisible();
      await expect(cards.nth(i).locator('[data-daily-outlook]')).toHaveText(expected.cats[i].reading.outlook);
      await expect(cards.nth(i).locator('.num')).toHaveText(`${expected.cats[i].score}${lang === 'ko' ? '점' : ' points'}`);
    }
    await page.locator('.chart-disclosure > summary').click();
    const chart = page.locator('.chart-card');
    const relation = chart.locator('[data-chart-relation="year,hour"]').filter({ hasText: lang === 'ko' ? '육합' : 'Six-combination' });
    await relation.click();
    await expect(relation).toHaveAttribute('aria-pressed', 'true');
    await expect(chart.locator('[data-chart-branch].is-related')).toHaveCount(2);
    await expect(chart.locator('[data-chart-branch="year"]')).toContainText('午');
    await expect(chart.locator('[data-chart-branch="hour"]')).toContainText('未');
    const panel = page.locator(`[id="${await relation.getAttribute('aria-controls')}"]`);
    await expect(panel).toBeVisible();
    await relation.press('Enter');
    await expect(panel).toBeHidden();
    await expect(chart.locator('.is-related')).toHaveCount(0);
    await page.locator('#a-notime').check(); await submit(page);
    await expect(page.locator('[data-chart-branch="hour"]')).toHaveCount(0);
    await expect(chart.locator('[data-chart-relation*="hour"]')).toHaveCount(0);
    await expect(page.locator('.daily-cat:visible')).toHaveCount(7);
    const noTime = withLanguage(lang, () => day(buildChart({ ...input, time: null }), date));
    await expect(cards.locator('.num')).toHaveText(noTime.cats.map(cat => `${cat.score}${lang === 'ko' ? '점' : ' points'}`));
    // 다른 생일도 원국의 실제 관계와 동일하며 시안의 글자를 고정하지 않는다.
    const alternate = { ...input, y: 1993, m: 1, d: 28, time: '03:40' };
    await fill(page, alternate); await submit(page);
    await page.locator('.chart-disclosure > summary').click();
    const c = buildChart(alternate);
    const pairs = c.cols.flatMap((a, i) => c.cols.slice(i + 1).flatMap(b => branchRels(a.b, b.b).map(kind => ({ a, b, kind }))));
    await expect(chart.locator('[data-chart-relation]')).toHaveCount(pairs.length);
    for (const { a, b } of pairs) await expect(chart.locator(`[data-chart-relation="${a.pos},${b.pos}"]`).first()).toContainText(`${BR_H[a.b]}`);
    expect(await page.evaluate(() => [...document.querySelectorAll('[aria-controls]')].every(el => document.querySelectorAll(`[id="${el.getAttribute('aria-controls')}"]`).length === 1))).toBe(true);
    await noOverflow(page);
  });

  test(`${lang}: 공개 평생·궁합 예시는 JS 없이 실제 엔진값·시간 모름 비교·실제 경로를 제공한다`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, locale: 'ko-KR', viewport: { width: 320, height: 900 } });
    await context.route('https://**/*', route => route.abort());
    const page = await context.newPage();
    try {
      const c = buildChart(input), b = buildChart(partner);
      const life = withLanguage(lang, () => lifetime(c, date)), pair = withLanguage(lang, () => compat(c, b, date));
      await page.goto(`http://127.0.0.1:4176${prefix}/lifetime/`);
      const example = page.locator('#public-example');
      await expect(example.locator('[data-cycle-score]')).toHaveText(life.daeun.map(cycle => String(cycle.score)));
      await expect(example).toContainText(lang === 'ko' ? '시간 모름' : 'Time unknown');
      await expect(example.locator('.example-nav a').last()).toHaveAttribute('href', `${prefix}/compatibility/#public-example`);
      await example.locator('.example-nav a').last().click();
      await expect(example.locator('[data-example-overall]')).toHaveText(`${pair.total}${lang === 'ko' ? '점' : ' points'}`);
      await expect(example.locator('[data-compat-score]')).toHaveText(pair.cats.map(cat => String(cat.score)));
      await expect(example).toContainText('1988');
      for (const width of [320, 390, 768, 1280]) { await page.setViewportSize({ width, height: 900 }); await noOverflow(page); }
      await example.locator('[data-ga-cta="public_example"]').click();
      await expect(page).toHaveURL(/#tool$/);
    } finally { await context.close(); }
  });
}

test('저장소 접근 실패·미래 저장 생일도 홈 폼을 숨기지 않는다', async ({ context, page }) => {
  await context.addInitScript(() => {
    Object.defineProperty(window, 'indexedDB', { value: undefined });
    sessionStorage.setItem('ohaeng:profile', JSON.stringify({ gender: 'F', calendar: 'solar', y: 2026, m: 12, d: 1, noTime: true }));
  });
  await ready(page, '/');
  await expect(page.locator('#tool-form')).toBeVisible();
  await expect(page.locator('[data-saved-entry]')).toBeHidden();
  await expect(page.locator('[data-storage-status]')).toContainText('저장소를 불러오지 못했습니다');
  await page.locator('#tool-form [type="submit"]').click();
  await expect(page.locator('#tool-form-error')).toContainText('미래');
  await expect(page.locator('#result .report-head')).toHaveCount(0);
});
