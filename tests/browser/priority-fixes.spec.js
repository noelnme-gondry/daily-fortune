import { test, expect } from '@playwright/test';
import { editProfile } from './helpers/profile.js';

test.beforeEach(async ({ context, page }) => {
  await context.route('https://**/*', route => route.abort());
  await page.clock.setFixedTime(new Date('2026-10-24T12:00:00+09:00'));
  await context.addInitScript(() => {
    window.priorityEvents = [];
    window.gtag = (...args) => window.priorityEvents.push(args);
  });
});

async function birth(page, prefix, date, calendar = 'solar') {
  if (prefix !== 'tj') await editProfile(page);
  const form = prefix === 'tj' ? page.locator('#tojeong-tool form') : page.locator('#tool-form');
  if (prefix !== 'tj') await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await form.locator(`input[name="${prefix}-${prefix === 'tj' ? 'calendar' : 'cal'}"][value="${calendar}"]`).check();
  for (const [key, value] of Object.entries(date)) {
    const field = page.locator(`#${prefix}-${key}`);
    if (key === 'y' && prefix !== 'tj') await field.fill(String(value));
    else await field.selectOption(String(value));
  }
  if (prefix !== 'tj') { await page.locator(`[name="${prefix}-gender"][value="M"]`).check(); await page.locator(`#${prefix}-notime`).check(); }
  return form;
}

for (const lang of ['', '/en']) {
  test(`${lang || 'ko'}: 미래 양력·음력 생일을 거부하고 이전 결과·공유를 지운다`, async ({ page }) => {
    await page.goto(`${lang}/today/`);
    const form = await birth(page, 'a', { y: 1990, m: 5, d: 15 });
    await form.locator('[type="submit"]').click();
    await expect(page.locator('#result .ring')).toBeVisible();
    for (const calendar of ['solar', 'lunar']) {
      await birth(page, 'a', { y: 2026, m: 12, d: 1 }, calendar);
      await form.locator('[type="submit"]').click();
      await expect(page.locator('#tool-form-error')).toContainText(lang ? 'future' : '미래');
      await expect(page.locator('#result .ring, #result .result-share')).toHaveCount(0);
      await expect(page.locator('#a-d')).toHaveAttribute('aria-invalid', 'true');
    }
    expect(await page.evaluate(() => window.priorityEvents.filter(e => e[1] === 'calc_result').length)).toBe(1);
    await birth(page, 'a', { y: 2026, m: 10, d: 24 });
    await form.locator('[type="submit"]').click();
    await expect(page.locator('#result .ring')).toBeVisible();
    await expect(page.locator('#tool-form-error')).toBeHidden();
  });

  test(`${lang || 'ko'}: 모바일 연도 직접 입력은 네 자리 오류를 안내하고 정상 생일 계산으로 복구한다`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(`${lang}/today/`);
    const form = await birth(page, 'a', { m: 5, d: 15 });
    const year = form.getByRole('textbox', { name: lang ? 'Birth year' : '태어난 해' });
    await expect(year).toHaveValue('');
    await expect(year).toHaveAttribute('inputmode', 'numeric');
    await year.fill('199');
    await form.locator('[type="submit"]').click();
    await expect(page.locator('#tool-form-error')).toContainText(lang ? 'four digits' : '숫자 네 자리');
    await expect(year).toBeFocused();
    await expect(year).toHaveAttribute('aria-invalid', 'true');
    await year.fill('1970');
    await expect(year).toBeFocused();
    await form.locator('[type="submit"]').click();
    await expect(page.locator('#result .ring')).toBeVisible();
    await expect(page.locator('#tool-form-error')).toBeHidden();
    await expect(form.locator('#a-y')).not.toHaveAttribute('aria-invalid', 'true');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  });

  test(`${lang || 'ko'}: 토정비결도 미래 생일을 계산 성공으로 집계하지 않는다`, async ({ page }) => {
    await page.goto(`${lang}/tojeong/2027/`);
    const form = await birth(page, 'tj', { y: 2026, m: 12, d: 1 });
    await form.locator('[type="submit"]').click();
    await expect(page.locator('#tj-error')).toContainText(lang ? 'future' : '미래');
    await expect(page.locator('#tojeong-result .result-share')).toHaveCount(0);
    expect(await page.evaluate(() => window.priorityEvents.filter(e => e[1] === 'calc_result').length)).toBe(0);
  });

  test(`${lang || 'ko'}: 홈 재미 카드 클릭을 정확히 한 번 기록한다`, async ({ page }) => {
    for (const path of ['/life-story/', '/saju-ranking/', '/saju/ilju-ranking/']) {
      await page.goto(`${lang}/`);
      const card = page.locator(`.home-feature[href="${lang}${path}"]`);
      // 페이지 이동 후 새 window가 생기므로 콘솔에서 해당 이벤트를 포착한다.
      const logged = [];
      await page.evaluate(() => { window.gtag = (...args) => console.log('priority-event:' + JSON.stringify(args)); });
      const listen = message => {
        if (message.text().startsWith('priority-event:')) logged.push(JSON.parse(message.text().slice(15)));
      };
      page.on('console', listen);
      await card.click();
      await expect(page).toHaveURL(new RegExp(`${lang}${path}$`));
      page.off('console', listen);
      const clicks = logged.filter(e => e[1] === 'select_content');
      expect(clicks).toHaveLength(1);
      expect(clicks[0][2]).toMatchObject({ content_type: 'fun_card', item_id: `${lang}${path}` });
      expect(JSON.stringify(clicks)).not.toMatch(/birth|gender|profile|score_band/);
    }
  });
}

test('오늘 계산은 랭킹 표·명예의 전당을 로드하지 않고 랭킹 진입 때만 로드한다', async ({ page }) => {
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/today/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  expect(requests.some(url => /rank-tool|rank-leaders|rank-table/.test(url))).toBe(false);
  await page.goto('/saju-ranking/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  expect(requests.some(url => url.includes('rank-tool'))).toBe(true);
  expect(requests.some(url => url.includes('rank-leaders.js'))).toBe(true);
});
