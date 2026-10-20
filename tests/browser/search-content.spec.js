import { completeProfile } from './helpers/profile.js';
import { test, expect } from '@playwright/test';
import { EXAMPLE_INPUT, MANSE_BOUNDARIES } from '../../src/site/public-examples.js';
import { buildChart, day, year, yearMonths, pillarH } from '../../src/engine/index.js';
import { withLanguage } from '../../src/i18n/runtime.js';

test.beforeEach(async ({ context, page }) => {
  await context.route('https://**/*', (route) => route.abort());
  await page.clock.setFixedTime(new Date('2026-10-15T12:00:00+09:00'));
  await context.addInitScript(() => { window.searchEvents = []; window.gtag = (...args) => window.searchEvents.push(args); });
});

async function enter(page, input = EXAMPLE_INPUT) {
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await page.locator('#a-name').fill('가상비밀');
  for (const key of ['y', 'm', 'd']) await page.locator(`#a-${key}`).selectOption(String(input[key]));
  await page.locator('#a-time').fill(input.time);
}
const events = (page) => page.evaluate(() => window.searchEvents.filter((e) => e[0] === 'event'));

test('KR/EN 만세력 경계 표는 JS 없이 390px에서 탐색하고 유효한 ARIA 대상을 갖는다', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'ko-KR', javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await context.route('https://**/*', (route) => route.abort());
  const page = await context.newPage();
  try {
    for (const prefix of ['', '/en']) {
      await page.goto(`http://127.0.0.1:4176${prefix}/manseryeok/`);
      for (const { id } of MANSE_BOUNDARIES) {
        const section = page.locator(`[data-boundary="${id}"]`);
        await expect(section.locator('tbody tr')).toHaveCount(4);
        await expect(section.locator('[data-changed="true"]')).toHaveCount(id === 'ipchun' ? 3 : 2);
        const region = section.getByRole('region');
        await region.focus();
        await region.press('ArrowRight');
        await expect.poll(() => region.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
      }
      expect(await page.evaluate(() => {
        const root = document.querySelector('#public-example');
        const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
        return [...root.querySelectorAll('[aria-labelledby], [aria-describedby]')].every((el) =>
          ['aria-labelledby', 'aria-describedby'].every((attr) => (el.getAttribute(attr) || '').split(' ').filter(Boolean).every((id) => ids.filter((other) => other === id).length === 1)));
      })).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
      await page.locator('[data-ga-cta="public_example"]').click();
      await expect(page).toHaveURL(/#tool$/);
    }
  } finally { await context.close(); }
});

test('KR/EN 만세력 경계의 네 입력은 직접 계산한 원국과 일치한다', async ({ page }) => {
  for (const prefix of ['', '/en']) {
    await page.goto(`${prefix}/manseryeok/`);
    await page.locator('[data-ga-cta="public_example"]').click();
    for (const { input, times } of MANSE_BOUNDARIES) for (const time of times) {
      const birth = { ...input, time }, c = buildChart(birth);
      await enter(page, birth);
      await completeProfile(page);
      await page.locator('#tool-form button[type="submit"]').click();
      const chars = await page.locator('#result .pillar-table .char').evaluateAll((nodes) => nodes.map((n) => n.firstChild.textContent));
      expect(chars.slice(0, 4).join('')).toBe(c.cols.slice().reverse().map((p) => pillarH(p)[0]).join(''));
      expect(chars.slice(4).join('')).toBe(c.cols.slice().reverse().map((p) => pillarH(p)[1]).join(''));
      await expect(page.locator('#a-d')).toHaveValue(String(input.d));
    }
    await page.locator('[data-delete-profile]').click();
  }
});

test('KR/EN 월별 비교는 JS 없이 모바일에서 읽고 실제 백과로 이동할 수 있다', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'ko-KR', javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await context.route('https://**/*', (route) => route.abort());
  const page = await context.newPage();
  try {
    for (const prefix of ['', '/en']) for (const y of [2026, 2027]) {
      await page.goto(`http://127.0.0.1:4176${prefix}/year/${y}/`);
      await expect(page.locator('[data-example-month]')).toHaveCount(2);
      for (const m of [5, 11]) {
        const section = page.locator(`[data-example-month="${m}"]`);
        const heading = await section.getAttribute('aria-labelledby');
        await expect(section.locator(`#${heading}`)).toHaveCount(1);
        await expect(page.locator(`#${heading}`)).toHaveCount(1);
        await expect(section.locator('[data-month-explanation]')).not.toBeEmpty();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
      const termLink = page.locator('[data-example-month="5"] a').first();
      const href = await termLink.getAttribute('href');
      const termName = await termLink.textContent();
      await termLink.click();
      await expect(page).toHaveURL(new RegExp(`${href}$`));
      await expect(page.locator('h1')).toContainText(termName);
    }
  } finally { await context.close(); }
});

test('KR/EN 월별 공개 해설은 직접 계산·재계산·저장 복원 결과와 같다', async ({ page }) => {
  for (const prefix of ['', '/en']) for (const y of [2026, 2027]) {
    const lang = prefix ? 'en' : 'ko', points = prefix ? ' points' : '점';
    const months = withLanguage(lang, () => yearMonths(buildChart({ ...EXAMPLE_INPUT }), y));
    await page.goto(`${prefix}/year/${y}/`);
    expect((await events(page)).filter((e) => e[1] === 'calc_result')).toHaveLength(0);
    await page.locator('[data-ga-cta="public_example"]').click();
    await enter(page);
    for (let attempt = 0; attempt < 2; attempt++) {
      await completeProfile(page);
      await page.locator('#tool-form button[type="submit"]').click();
      await expect(page.locator('#result .mcard-top .num')).toHaveText(months.map((m) => String(m.score)));
      for (const m of months.filter((m) => [5, 11].includes(m.m))) {
        const example = page.locator(`[data-example-month="${m.m}"]`);
        await expect(example.locator('[data-month-score]')).toHaveText(`${m.score}${points}`);
        await expect(example.locator('[data-month-best]')).toHaveText(`${m.best.name} ${m.best.score}${points}`);
        await expect(example.locator('[data-month-explanation]')).toHaveText(m.text);
        const result = page.locator('#result .mcard').nth(m.m - 1);
        await expect(result.locator('p')).toHaveText(m.text);
        await expect(result.locator('.chip').first()).toContainText(`${m.best.name} ${m.best.score}`);
      }
    }
    const logged = await events(page);
    expect(logged.filter((e) => e[1] === 'calc_start')).toHaveLength(1);
    expect(logged.filter((e) => e[1] === 'calc_result').map((e) => e[2].calc_origin)).toEqual(['form', 'form']);
    expect(JSON.stringify(logged)).not.toMatch(/가상비밀|1990|14:30|score_band/);
    await page.reload();
    await expect(page.locator('#result .mcard-top .num')).toHaveText(months.map((m) => String(m.score)));
    await expect.poll(async () => (await events(page)).filter((e) => e[1] === 'calc_result').map((e) => e[2].calc_origin)).toEqual(['session_restore']);
    await page.locator('[data-delete-profile]').click();
    await expect(page.locator('[data-storage-status]')).toContainText(prefix ? 'Deleted' : '삭제했습니다');
  }
});

test('자바스크립트 없이 가상 예시와 연간 기능 이동을 읽고 모바일에서 탐색할 수 있다', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'ko-KR', javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await context.route('https://**/*', (route) => route.abort());
  const page = await context.newPage();
  try {
    for (const path of ['/today/', '/tomorrow/', '/manseryeok/', '/year/2027/']) {
      await page.goto(`http://127.0.0.1:4176${path}`);
      if (['/today/', '/tomorrow/'].includes(path)) {
        await page.getByRole('link', { name: '결과 예시와 읽는 법', exact: true }).click();
        await expect(page).toHaveURL(/#public-example$/);
      }
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

test('오늘·내일 공개 예시에서 직접 계산하면 같은 점수가 나오며 예시 조회는 계산 이벤트가 아니다', async ({ page }) => {
  // 서버의 KST 날짜와 클라이언트 계산일을 맞춘다. 다른 검색 테스트의 고정일은 연간 예시에 사용한다.
  await page.clock.setFixedTime(new Date());
  const c = buildChart({ ...EXAMPLE_INPUT });
  for (const mode of ['today', 'tomorrow']) {
    await page.goto(`/${mode}/`);
    const example = page.locator('#public-example');
    const [y, m, d] = (await example.getAttribute('data-example-date')).split('-').map(Number);
    const expected = day(c, { y, m, d }, mode);
    await expect(example.locator('[data-example-overall]')).toHaveText(`${expected.overall.score}점`);
    expect((await events(page)).filter((e) => e[1] === 'calc_result')).toHaveLength(0);
    await page.getByRole('link', { name: '결과 예시와 읽는 법', exact: true }).click();
    await expect(page).toHaveURL(/#public-example$/);
    await page.getByRole('link', { name: '내 정보로 직접 이용하기', exact: true }).click();
    await enter(page);
    await completeProfile(page);
    await page.locator('#tool-form button[type="submit"]').click();
    await expect(page.locator('#result .ring')).toHaveAttribute('aria-label', `종합 ${expected.overall.score}점`);
    await expect(example.locator('[data-example-overall]')).toHaveText(`${expected.overall.score}점`);
    const logged = (await events(page)).filter((e) => e[1] === 'calc_result');
    expect(logged.some((e) => e[2].calc_origin === 'form')).toBe(true);
    expect(JSON.stringify(logged)).not.toMatch(/가상비밀|1990|14:30|score_band/);
    await page.locator('[data-delete-profile]').click();
  }
});

test('공개 예시 → 직접 입력 → 2027년 결과 → 다음 기능에서 복원, 시간 미상 재계산', async ({ page }) => {
  await page.goto('/year/2027/');
  const c = buildChart({ ...EXAMPLE_INPUT });
  await expect(page.locator('[data-example-overall]')).toHaveText(`${year(c, 2027).overall.score}점`);
  expect((await events(page)).filter((e) => e[1] === 'calc_result')).toHaveLength(0);
  await page.getByRole('link', { name: '내 정보로 직접 이용하기' }).click();
  await enter(page);
  await completeProfile(page);
  await page.locator('#tool-form button[type="submit"]').click();
  await expect(page.locator('#result .ring')).toHaveAttribute('aria-label', '종합 58점');
  await expect(page.locator('#result .mcard-top .num')).toHaveText(yearMonths(c, 2027).map((m) => String(m.score)));
  await page.locator('#a-notime').check();
  await completeProfile(page);
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
  expect(next.find((e) => e[1] === 'calc_result')[2]).toMatchObject({ tool: 'manseryeok', calc_origin: 'session_restore' });
  expect(next.find((e) => e[1] === 'calc_result')[2]).not.toHaveProperty('source');
});

test('만세력 예시와 사용자 원국 일치, 실패한 음력 윤달은 성공 이벤트를 내지 않는다', async ({ page }) => {
  await page.goto('/manseryeok/');
  await enter(page);
  await completeProfile(page);
  await page.locator('#tool-form button[type="submit"]').click();
  const c = buildChart({ ...EXAMPLE_INPUT });
  const chars = await page.locator('#result .pillar-table .char').evaluateAll((nodes) => nodes.map((n) => n.firstChild.textContent));
  expect(chars.slice(0, 4).join('')).toBe(c.cols.slice().reverse().map((p) => pillarH(p)[0]).join(''));
  expect(chars.slice(4).join('')).toBe(c.cols.slice().reverse().map((p) => pillarH(p)[1]).join(''));
  await page.locator('[name="a-cal"][value="lunar"]').check();
  await page.locator('#a-y').selectOption('2021');
  await page.locator('#a-m').selectOption('4');
  await page.locator('#a-leap').check();
  await completeProfile(page);
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
  await completeProfile(page);
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
    await completeProfile(page);
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
  await completeProfile(page);
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
