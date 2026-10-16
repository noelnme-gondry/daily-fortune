import { test, expect } from '@playwright/test';
import { EXAMPLE_INPUT } from '../../src/site/public-examples.js';
import { buildChart, year, yearMonths, pillarH } from '../../src/engine/index.js';

test.beforeEach(async ({ context, page }) => {
  await context.route('https://**/*', (route) => route.abort());
  await page.clock.setFixedTime(new Date('2026-10-15T12:00:00+09:00'));
  await context.addInitScript(() => { window.searchEvents = []; window.gtag = (...args) => window.searchEvents.push(args); });
});

async function enter(page) {
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await page.locator('#a-name').fill('가상비밀');
  for (const key of ['y', 'm', 'd']) await page.locator(`#a-${key}`).selectOption(String(EXAMPLE_INPUT[key]));
  await page.locator('#a-time').fill(EXAMPLE_INPUT.time);
}
const events = (page) => page.evaluate(() => window.searchEvents.filter((e) => e[0] === 'event'));

test('자바스크립트 없이 가상 예시와 연간 기능 이동을 읽고 모바일에서 탐색할 수 있다', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'ko-KR', javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await context.route('https://**/*', (route) => route.abort());
  const page = await context.newPage();
  try {
    for (const path of ['/manseryeok/', '/year/2027/']) {
      await page.goto(`http://127.0.0.1:4176${path}`);
      await expect(page.locator('#public-example')).toContainText('실제 계산 결과');
      await expect(page.locator('#public-example')).toContainText('해석의 한계');
      await page.getByRole('link', { name: '내 정보로 직접 이용하기' }).click();
      await expect(page).toHaveURL(/#tool$/);
    }
    await page.locator('section[aria-labelledby="year-guide-title"] a[href="/tojeong/2027/"]').click();
    await expect(page.getByRole('heading', { name: '2027년 토정비결', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  } finally { await context.close(); }
});

test('공개 예시 → 직접 입력 → 2027년 결과 → 다음 기능에서 복원, 시간 미상 재계산', async ({ page }) => {
  await page.goto('/year/2027/');
  const c = buildChart({ ...EXAMPLE_INPUT });
  await expect(page.locator('[data-example-overall]')).toHaveText(`${year(c, 2027).overall.score}점`);
  expect((await events(page)).filter((e) => e[1] === 'calc_result')).toHaveLength(0);
  await page.getByRole('link', { name: '내 정보로 직접 이용하기' }).click();
  await enter(page);
  await page.locator('#tool-form button[type="submit"]').click();
  await expect(page.locator('#result .ring')).toHaveAttribute('aria-label', '종합 58점');
  await expect(page.locator('#result .mcard-top .num')).toHaveText(yearMonths(c, 2027).map((m) => String(m.score)));
  await page.locator('#a-notime').check();
  await page.locator('#tool-form button[type="submit"]').click();
  await expect(page.locator('#result .ring')).toHaveAttribute('aria-label', '종합 62점');
  await expect(page.locator('#result .pillar-table')).toContainText('시간 모름');
  await expect(page.locator('[data-example-overall]')).toHaveText('58점');
  const first = await events(page);
  expect(first.filter((e) => e[1] === 'calc_start')).toHaveLength(1);
  expect(first.filter((e) => e[1] === 'calc_result').map((e) => e[2].calc_origin)).toEqual(['form', 'form']);
  expect(JSON.stringify(first)).not.toMatch(/가상비밀|1990|14:30|has_time|calendar|score_band|pct_bucket/);
  await page.locator('#result .tabs a[href="/manseryeok/"]').click();
  await expect(page.locator('#result .pillar-table')).toContainText('시간 모름');
  const next = await events(page);
  expect(next.filter((e) => e[1] === 'calc_start')).toHaveLength(0);
  expect(next.find((e) => e[1] === 'calc_result')[2]).toMatchObject({ tool: 'manseryeok', calc_origin: 'saved' });
  expect(next.find((e) => e[1] === 'calc_result')[2]).not.toHaveProperty('source');
});

test('만세력 예시와 사용자 원국 일치, 실패한 음력 윤달은 성공 이벤트를 내지 않는다', async ({ page }) => {
  await page.goto('/manseryeok/');
  await enter(page);
  await page.locator('#tool-form button[type="submit"]').click();
  const c = buildChart({ ...EXAMPLE_INPUT });
  const chars = await page.locator('#result .pillar-table .char').evaluateAll((nodes) => nodes.map((n) => n.firstChild.textContent));
  expect(chars.slice(0, 4).join('')).toBe(c.cols.slice().reverse().map((p) => pillarH(p)[0]).join(''));
  expect(chars.slice(4).join('')).toBe(c.cols.slice().reverse().map((p) => pillarH(p)[1]).join(''));
  await page.locator('[name="a-cal"][value="lunar"]').check();
  await page.locator('#a-y').selectOption('2021');
  await page.locator('#a-m').selectOption('4');
  await page.locator('#a-leap').check();
  await page.locator('#tool-form button[type="submit"]').click();
  await expect(page.locator('.form-error')).toContainText('존재하지 않는 음력');
  expect((await events(page)).filter((e) => e[1] === 'calc_result')).toHaveLength(1);
});

test('토정비결 입력 시작과 해설 생성 성공을 구분하고 개인 결과를 보내지 않는다', async ({ page }) => {
  await page.goto('/tojeong/2027/');
  await expect(page.locator('#tojeong-tool')).toHaveAttribute('data-ready', 'true');
  await page.locator('#tj-name').fill('가상비밀');
  await page.locator('#tj-y').selectOption('1990');
  await page.locator('#tj-m').selectOption('5');
  await page.locator('#tj-d').selectOption('17');
  await page.locator('#tojeong-form button[type="submit"]').click();
  await expect(page.locator('.tojeong-code')).toBeVisible();
  const logged = await events(page);
  expect(logged.filter((e) => e[1] === 'calc_start')).toHaveLength(1);
  expect(logged.filter((e) => e[1] === 'calc_result')).toHaveLength(1);
  expect(logged.find((e) => e[1] === 'calc_result')[2]).toMatchObject({ tool: 'tojeong', calc_origin: 'form' });
  expect(JSON.stringify(logged)).not.toMatch(/가상비밀|1990|calendar|"code"|"upper"|"middle"|"lower"/);
});

test('캐릭터·랭킹·궁합의 기존 결과 이벤트는 개인 결과 값 없이 유지된다', async ({ page }) => {
  for (const [path, event] of [['/life-story/', 'story_result'], ['/saju-ranking/', 'rank_result'], ['/compatibility/', 'compat_result']]) {
    await page.goto(path);
    await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
    await page.evaluate(() => { window.searchEvents = []; });
    await page.locator('#tool-form button[type="submit"]').click();
    await expect(page.locator('#result .report-head')).toBeVisible();
    const logged = (await events(page)).find((e) => e[1] === event);
    expect(logged).toBeTruthy();
    expect(Object.keys(logged[2]).filter((k) => ['arc', 'tier', 'pct_bucket', 'score_band'].includes(k))).toEqual([]);
  }
});

test('결과 공유는 개인 URL을 자동 이탈 클릭 측정용 링크에 남기지 않는다', async ({ page }) => {
  await page.goto('/year/2027/');
  await enter(page);
  await page.locator('#tool-form button[type="submit"]').click();
  await expect(page.locator('#result .report-head')).toBeVisible();
  expect(await page.locator('.result-share a[href]').count()).toBe(0);
  await page.evaluate(() => { window.shareOpened = []; window.open = (...args) => { window.shareOpened.push(args); return null; }; });
  for (const method of ['x', 'facebook']) await page.locator(`.result-share [data-share="${method}"]`).click();
  const opened = await page.evaluate(() => window.shareOpened);
  expect(opened).toHaveLength(2);
  for (const [url, target, features] of opened) {
    const params = new URL(url).searchParams;
    const shared = new URL(params.get('url') || params.get('u'));
    expect(shared.pathname).toBe('/share/');
    expect(shared.searchParams.get('n')).toBe('가상비밀');
    expect(target).toBe('_blank');
    expect(features).toBe('noopener,noreferrer');
  }
  expect(JSON.stringify(await events(page))).not.toMatch(/가상비밀|1990|14:30|[?&]n=/);
});
