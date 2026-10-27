import { test, expect } from '@playwright/test';
import { buildChart, day } from '../../src/engine/index.js';

const profile = { gender: 'M', calendar: 'solar', y: 1990, m: 5, d: 17, time: '14:30' };
test.beforeEach(async ({ context, page }) => {
  await context.route('https://**/*', r => r.abort());
  await page.clock.setFixedTime(new Date('2026-10-20T12:00:00+09:00'));
  await context.addInitScript(() => { window.growthEvents = []; window.gtag = (...args) => window.growthEvents.push(args); });
});
async function ready(page, path = '/today/') {
  await page.goto(path);
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
}
async function fill(page) {
  await page.locator('#a-y').selectOption('1990');
  await page.locator('#a-m').selectOption('5');
  await page.locator('#a-d').selectOption('17');
  await page.locator('[name="a-gender"][value="M"]').check();
  await page.locator('#a-time').fill('14:30');
}
const submit = page => page.locator('#tool-form [type="submit"]').click();

test('미입력 생일은 계산하지 않고 생일 필드와 오류를 연결한다', async ({ page }) => {
  await ready(page);
  await submit(page);
  await expect(page.locator('#result .report-head')).toHaveCount(0);
  await expect(page.locator('#a-y')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('.form-error')).toBeVisible();
});
test('잘못된 날짜를 제출하면 이전 결과와 공유를 제거하고 정상 입력으로 복구한다', async ({ page }) => {
  await ready(page);
  await fill(page); await submit(page);
  await expect(page.locator('#result .report-head')).toBeVisible();
  await page.locator('#a-m').selectOption('2');
  await page.locator('#a-d').selectOption('31');
  await submit(page);
  await expect(page.locator('.form-error')).toBeVisible();
  await expect(page.locator('#result .report-head, #result .result-share')).toHaveCount(0);
  await fill(page); await submit(page);
  await expect(page.locator('#result .report-head')).toBeVisible();
});
test('KST 자정을 지난 재계산은 새 날짜의 실제 점수와 공유 날짜를 사용한다', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-20T23:59:00+09:00'));
  await ready(page); await fill(page); await submit(page);
  await page.clock.setFixedTime(new Date('2026-10-21T00:01:00+09:00'));
  await submit(page);
  await expect(page.locator('#result > .reading-overview > .report-head .when')).toContainText('21');
  await expect(page.locator('#result > .reading-overview > .report-head .val b')).toHaveText(String(day(buildChart(profile), { y: 2026, m: 10, d: 21 }).overall.score));
  await expect(page.locator('#tool')).toHaveAttribute('data-date', '2026-10-21');
  await expect(page.locator('#public-example')).toHaveAttribute('data-example-date', '2026-10-21');
});

test('시간 미입력 오류는 생일이 아닌 시간 필드에 연결한다', async ({ page }) => {
  await ready(page); await fill(page);
  await page.locator('#a-time').fill('');
  await submit(page);
  await expect(page.locator('#a-time')).toBeFocused();
  await expect(page.locator('#a-time')).toHaveAttribute('aria-errormessage', 'tool-form-error');
  await expect(page.locator('#a-y')).not.toHaveAttribute('aria-invalid');
});
test('홈 제출 뒤 오늘 페이지의 결과에도 홈 진입과 직접 입력 출처를 유지한다', async ({ page }) => {
  await ready(page, '/'); await fill(page); await submit(page);
  await expect(page).toHaveURL(/\/today\/$/);
  await expect(page.locator('.report-head')).toBeVisible();
  const result = await page.evaluate(() => window.growthEvents.find(e => e[1] === 'calc_result')?.[2]);
  expect(result).toMatchObject({ tool: 'today', entry_point: 'home', calc_origin: 'form' });
});
test('토정비결도 미입력 생일로 계산하지 않고 이전 결과·공유를 남기지 않는다', async ({ page }) => {
  await page.goto('/tojeong/');
  await expect(page.locator('#tojeong-tool')).toHaveAttribute('data-ready', 'true');
  await page.locator('#tojeong-form [type="submit"]').click();
  await expect(page.locator('#tj-error')).toContainText('생년월일을 모두 선택');
  await expect(page.locator('#tj-y')).toBeFocused();
  for (const [field, value] of [['y', '1990'], ['m', '5'], ['d', '17']]) await page.locator(`#tj-${field}`).selectOption(value);
  await page.locator('#tojeong-form [type="submit"]').click();
  await expect(page.locator('.tojeong-summary')).toBeVisible();
  await page.locator('#tj-y').selectOption('');
  await page.locator('#tojeong-form [type="submit"]').click();
  await expect(page.locator('#tojeong-result .tojeong-summary, #tojeong-result .result-share')).toHaveCount(0);
  await expect(page.locator('#tojeong-result')).not.toHaveAttribute('aria-busy');
});
test('사주 삭제는 별도 토정비결 저장정보를 보존한다', async ({ page }) => {
  await ready(page);
  await page.evaluate(async () => {
    const { save } = await import('/src/client/profile.js');
    await save('tojeong', { calendar: 'solar', y: 1990, m: 5, d: 17 });
  });
  await fill(page); await page.locator('#save-device').check(); await submit(page);
  await expect(page.locator('[data-storage-status]')).toContainText('저장했습니다');
  await page.locator('[data-delete-profile]').click();
  await expect(page.locator('[data-storage-status]')).toContainText('삭제했습니다');
  expect(await page.evaluate(async () => (await import('/src/client/profile.js')).load('tojeong'))).toMatchObject({ y: 1990, m: 5, d: 17 });
  expect(await page.evaluate(async () => (await import('/src/client/profile.js')).load('a'))).toBeNull();
});
test('기기·세션 저장소가 모두 막혀도 홈에서 현재 화면에 결과를 표시한다', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'indexedDB', { get() { throw new Error('blocked'); } });
    Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('blocked'); } });
  });
  await ready(page, '/'); await fill(page); await submit(page);
  await expect(page.locator('#result .report-head')).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#tool-form .form-error:visible')).toHaveCount(0);
});
for (const lang of ['', '/en']) {
  test(`${lang || 'ko'} 결과 우선·원국 펼침·월간 날짜 선택과 포커스 복귀`, async ({ page }) => {
    await ready(page, `${lang}/month/`); await fill(page); await submit(page);
    await expect(page.locator('#result > .reading-overview > .report-head')).toBeVisible();
    await expect(page.locator('.chart-disclosure')).not.toHaveAttribute('open', '');
    const button = page.locator('[data-reading-date="2026-10-31"]');
    await button.click();
    const detail = page.locator('#calendar-day-detail');
    await expect(detail).toBeVisible();
    await expect(detail).toBeFocused();
    const expected = day(buildChart(profile), { y: 2026, m: 10, d: 31 });
    await expect(detail.locator('.val b')).toHaveText(String(expected.overall.score));
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await detail.locator('[data-close-day]').click();
    await expect(detail).toBeHidden();
    await expect(button).toBeFocused();
    await page.locator('.chart-disclosure > summary').click();
    await expect(page.locator('.chart-card')).toBeVisible();
    await expect(page.locator('.result-next a').first()).toHaveAttribute('href', `${lang}/year/2026/`);
  });
}
test('저장 사용자 홈 바로 보기는 재입력 없이 실제 오늘 결과를 연다', async ({ page }) => {
  await ready(page); await fill(page); await page.locator('#save-device').check(); await submit(page);
  await expect(page.locator('[data-storage-status]')).toContainText('저장했습니다');
  await ready(page, '/');
  await expect(page.locator('[data-saved-entry]')).toBeVisible();
  await page.locator('[data-saved-result]').click();
  await expect(page.locator('#result > .reading-overview > .report-head')).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  const events = await page.evaluate(() => window.growthEvents.filter(e => e[1] === 'calc_result'));
  expect(events[0][2]).toMatchObject({ tool: 'today', calc_origin: 'session_restore', usage_date: '2026-10-20' });
});
test('공유 취소와 복사를 분리하며 개인 입력·결과는 이벤트에 넣지 않는다', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: async () => { throw new window.DOMException('cancelled', 'AbortError'); } });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async text => { window.copied = text; } } });
  });
  await ready(page); await fill(page);
  await page.locator('#a-name').fill('개인검증이름');
  await submit(page);
  await page.locator('[data-share="native"]').click();
  await page.locator('[data-share="copy"]').click();
  const events = await page.evaluate(() => window.growthEvents);
  expect(events.filter(e => e[1] === 'share')).toHaveLength(2);
  expect(events.filter(e => e[1] === 'share_cancel')).toHaveLength(1);
  expect(events.filter(e => e[1] === 'share_complete')).toHaveLength(1);
  expect(events.find(e => e[1] === 'share_complete')[2].completion_type).toBe('clipboard');
  expect(JSON.stringify(events)).not.toMatch(/개인검증이름|1990|14:30|[?&]n=/);
  const copied = await page.evaluate(() => window.copied);
  const url = new URL(copied);
  expect(url.searchParams.get('d')).toBe('2026-10-20');
});
test('월말과 연말 재계산은 새 기간을 사용하고 열어 둔 날짜 상세는 유지한다', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-12-31T23:59:00+09:00'));
  await ready(page, '/month/'); await fill(page); await submit(page);
  await page.locator('[data-reading-date="2026-12-31"]').click();
  await page.clock.setFixedTime(new Date('2027-01-01T00:01:00+09:00'));
  await page.evaluate(() => window.dispatchEvent(new window.Event('focus')));
  await expect(page.locator('#calendar-day-detail')).toBeVisible();
  await expect(page.locator('[data-reading-date="2026-12-31"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-close-day]').click();
  await submit(page);
  await expect(page.locator('#tool')).toHaveAttribute('data-date', '2027-01-01');
  await expect(page.locator('[data-reading-date="2027-01-01"]')).toHaveCount(1);
  await expect(page.locator('main .daybox')).toContainText('2027년 1월');
});
