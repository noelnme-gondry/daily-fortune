import { test, expect } from '@playwright/test';
import { todayKST } from '../../src/engine/core.js';
import { buildChart, lifetime, month, year, sajuRank } from '../../src/engine/index.js';
import { navItems } from '../../src/site/layout.js';
import { BRAND } from '../../src/content/brand.js';
import LEADERS from '../../src/content/rank-leaders.js';
import RANK_TABLE from '../../src/content/rank-table.js';

test.beforeEach(async ({ context }) => {
  await context.route('https://**/*', (route) => route.abort());
});
async function ready(page, path) {
  await page.goto(path);
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#tool-form')).not.toHaveAttribute('inert', '');
  // 시각 입력과 시진 선택 중 하나만 보인다(저장된 방식에 따라 다름)
  await expect(page.locator('#a-time:visible, #a-branch:visible')).toHaveCount(1);
}
async function calculate(page, persist = false) {
  await page.locator('#a-name').fill('검증');
  await page.locator('#a-y').selectOption('1993');
  await page.locator('#a-m').selectOption('1');
  await page.locator('#a-d').selectOption('28');
  await page.locator('input[name="a-tmode"][value="branch"]').check();
  await page.locator('#a-branch').selectOption('3');
  await page.locator('#save-device').setChecked(persist);
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('#result .chart-card')).toBeVisible();
}
async function calculateExact(page) {
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await page.locator('#a-name').fill('검증');
  await page.locator('input[name="a-gender"][value="F"]').check();
  await page.locator('#a-y').selectOption('1993');
  await page.locator('#a-m').selectOption('1');
  await page.locator('#a-d').selectOption('28');
  await page.locator('#a-notime').uncheck();
  await page.locator('input[name="a-tmode"][value="exact"]').check();
  await page.locator('#a-time').fill('03:40');
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('#result .chart-card, #result .report-head').first()).toBeVisible();
}
async function saved(page, who = 'a') {
  return page.evaluate((who) => new Promise((resolve, reject) => {
    const req = indexedDB.open('ohaeng-profiles', 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const db = req.result, tx = db.transaction('profiles', 'readonly');
      const record = tx.objectStore('profiles').get(who);
      tx.oncomplete = () => { resolve(record.result ?? null); db.close(); };
    };
  }), who);
}

test('월간 달력의 모든 날짜에 실제 종합 점수가 표시되고 모바일에서도 칸 안에 들어간다', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-14T07:00:00+09:00'));
  await ready(page, '/month/');
  await calculateExact(page);
  const chart = buildChart({ gender: 'F', calendar: 'solar', y: 1993, m: 1, d: 28, time: '03:40' });
  const days = month(chart, 2026, 10).days;
  const cells = page.locator('#result .cal .c:not(.blank)');
  await expect(cells).toHaveCount(days.length);
  await expect(cells.locator('.day-score')).toHaveText(days.map((d) => `${d.score}점`));
  await expect(page.locator('.cal .today .dn')).toHaveText('14');
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await cells.evaluateAll((items) => items.every((cell) => {
      const bounds = cell.getBoundingClientRect();
      return [...cell.children].every((child) => {
        const range = document.createRange();
        range.selectNodeContents(child);
        const text = range.getBoundingClientRect();
        return text.width > 0 && text.left >= bounds.left && text.right <= bounds.right && text.top >= bounds.top && text.bottom <= bounds.bottom;
      });
    })), `${width}px에서 날짜·간지·점수가 칸 안에 표시되어야 한다`).toBe(true);
  }
});

test('평생 주요 시기의 연도를 누르면 실제 점수와 선정 이유를 확인하고 키보드로 닫는다', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-14T07:00:00+09:00'));
  await ready(page, '/lifetime/');
  await calculateExact(page);
  const chart = buildChart({ gender: 'F', calendar: 'solar', y: 1993, m: 1, d: 28, time: '03:40' });
  const events = lifetime(chart, { y: 2026, m: 10, d: 14 }).events;
  const ids = [];
  for (const group of events) {
    for (const item of group.items) {
      const trigger = page.locator(`[data-dialog="life-event-${group.key}-${item.y}"]`);
      await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      const id = await trigger.getAttribute('aria-controls');
      ids.push(id);
      await trigger.focus();
      await page.keyboard.press('Enter');
      const dialog = page.getByRole('dialog');
      await expect(dialog).toHaveAttribute('id', id);
      await expect(dialog).toHaveAccessibleName(new RegExp(`${item.y}년`));
      await expect(dialog.getByRole('heading', { name: '목록에 표시된 이유' })).toBeVisible();
      const annual = year(chart, item.y, 'next');
      await expect(dialog.locator('[data-score="overall"]')).toContainText(`${annual.overall.score}점`);
      for (const cat of annual.cats) await expect(dialog.locator(`[data-score="${cat.key}"]`)).toContainText(`${cat.score}점`);
      const close = dialog.getByRole('button', { name: '닫기', exact: true });
      await expect(close).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(close).toBeFocused();
      // open 속성 제거 뒤 비동기로 오는 close 이벤트(포커스 복귀)까지 기다린다.
      await dialog.evaluate((el) => {
        el.addEventListener('close', () => { el.dataset.closeComplete = 'true'; }, { once: true });
      });
      await page.keyboard.press('Escape');
      await expect(page.locator(`#${id}`)).toHaveAttribute('data-close-complete', 'true');
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
    }
  }
  expect(new Set(ids).size).toBe(ids.length);
  await page.locator('[data-dialog="life-event-caution-2035"]').click();
  await expect(page.getByRole('dialog')).toContainText('건강 점수가 아니라 종합 점수');
  await page.getByRole('button', { name: '닫기', exact: true }).click();
  await page.locator('#a-y').selectOption('1991');
  await page.locator('button[type="submit"]').click();
  const updated = buildChart({ gender: 'F', calendar: 'solar', y: 1991, m: 1, d: 28, time: '03:40' });
  const nextYear = lifetime(updated, { y: 2026, m: 10, d: 14 }).events.find((g) => g.key === 'money').items[0].y;
  await page.locator(`[data-dialog="life-event-money-${nextYear}"]`).click();
  await expect(page.getByRole('dialog').locator('[data-score="money"]')).toContainText(`${year(updated, nextYear, 'next').cats.find((c) => c.key === 'money').score}점`);
});

test('모바일에서 주요 시기 상세를 터치로 열고 긴 내용을 가로 넘침 없이 읽는다', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  await context.route('https://**/*', (route) => route.abort());
  const page = await context.newPage();
  await ready(page, '/lifetime/');
  await calculateExact(page);
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 700 });
    const trigger = page.locator('.life-event-trigger').first();
    await trigger.tap();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    expect(await dialog.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return r.left >= 0 && r.right <= window.innerWidth && r.top >= 0 && r.bottom <= window.innerHeight && el.scrollWidth <= el.clientWidth;
    })).toBe(true);
    await dialog.evaluate((el) => { el.scrollTop = el.scrollHeight; });
    await expect(dialog.locator('.life-event-note')).toBeInViewport();
    await dialog.getByRole('button', { name: '닫기', exact: true }).tap();
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
  await context.close();
});

test('전체 메뉴는 PC 한 줄·모바일 두 줄이며 위아래 열이 일치한다', async ({ page }) => {
  await page.goto('/today/');
  const menu = page.getByRole('navigation', { name: '주요 메뉴', exact: true });
  const controls = menu.getByRole('link');
  const expected = navItems({ today: todayKST() });
  await expect(controls).toHaveCount(14);
  await expect(menu.locator('summary, button, details')).toHaveCount(0);
  for (const width of [1440, 1145, 1024, 901, 900, 768, 561, 560, 430, 390, 375, 320, 1920]) {
    await page.setViewportSize({ width, height: 960 });
    const sizes = await controls.evaluateAll((items) => items.map((el) => {
      const rect = el.getBoundingClientRect();
      const text = document.createRange();
      text.selectNodeContents(el);
      const label = text.getBoundingClientRect();
      return { top: rect.top, left: rect.left, right: rect.right, height: rect.height, labelLeft: label.left, labelRight: label.right, lines: text.getClientRects().length };
    }));
    expect(new Set(sizes.map((s) => s.top)).size, `${width}px 메뉴 줄 수`).toBe(width <= 900 ? 2 : 1);
    await expect(controls).toHaveText(expected.map(([, label]) => label));
    expect(await controls.evaluateAll((links) => links.map((a) => a.getAttribute('href')))).toEqual(expected.map(([path]) => path));
    for (const size of sizes) {
      expect(size.left).toBeGreaterThanOrEqual(0);
      expect(size.right, `${width}px 메뉴 잘림`).toBeLessThanOrEqual(width);
      expect(size.height).toBeGreaterThanOrEqual(38);
      expect(size.lines, `${width}px 메뉴 이름 줄바꿈`).toBe(1);
      expect(size.labelLeft).toBeGreaterThanOrEqual(size.left);
      expect(size.labelRight).toBeLessThanOrEqual(size.right);
    }
    if (width <= 900) for (let i = 0; i < 7; i++) {
      expect(sizes[i].top).toBe(sizes[0].top);
      expect(sizes[i + 7].top).toBe(sizes[7].top);
      expect(sizes[i].left, `${width}px ${i + 1}열 왼쪽 정렬`).toBeCloseTo(sizes[i + 7].left, 1);
      expect(sizes[i].right, `${width}px ${i + 1}열 오른쪽 정렬`).toBeCloseTo(sizes[i + 7].right, 1);
    }
    expect(await menu.evaluate((el) => el.scrollWidth <= el.clientWidth), `${width}px 메뉴 스크롤`).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${width}px 본문 넘침`).toBe(true);
  }
  await page.setViewportSize({ width: 320, height: 800 });
  await expect(menu.getByRole('link', { name: '오늘의 운세', exact: true })).toHaveAttribute('aria-current', 'page');
  await controls.first().focus();
  await page.keyboard.press('Tab');
  await expect(controls.nth(1)).toBeFocused();
  await menu.getByRole('link', { name: '사주 백과', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/saju\/$/);
  await expect(menu.getByRole('link', { name: '사주 백과', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('모바일에서 펼쳐진 메뉴를 바로 터치해 토정비결까지 이동한다', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  await context.route('https://**/*', (route) => route.abort());
  const page = await context.newPage();
  await page.goto('/');
  const menu = page.getByRole('navigation', { name: '주요 메뉴', exact: true });
  await expect(menu.getByRole('link')).toHaveCount(14);
  await menu.getByRole('link', { name: '무료 토정비결', exact: true }).tap();
  await expect(page).toHaveURL(/\/tojeong\/$/);
  await expect(page.locator('#tojeong-tool')).toHaveAttribute('data-ready', 'true');
  await expect(page.getByRole('button', { name: /예시/ })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await context.close();
});

test('묘시 입력 · 저장 선택 · 새 탭 복원 · 삭제', async ({ page, context }) => {
  await ready(page, '/today/');
  await calculate(page);
  await expect(page.locator('.chart-head')).toContainText('묘시');
  expect(await saved(page)).toBeNull();
  await calculate(page, true);
  await expect(page.locator('[data-storage-status]')).toContainText('이 기기에 저장했습니다');
  expect((await saved(page)).timeBranch).toBe('3');
  const next = await context.newPage();
  await ready(next, '/tomorrow/');
  await expect(next.locator('#a-name')).toHaveValue('검증');
  await expect(next.locator('#a-branch')).toHaveValue('3');
  await expect(next.locator('#a-branch')).toBeVisible();
  await expect(next.locator('#result .chart-card')).toBeVisible();
  await next.locator('[data-delete-profile]').click();
  await expect(next.locator('[data-storage-status]')).toContainText('삭제했습니다');
  expect(await saved(next)).toBeNull();
  await next.reload();
  await expect(next.locator('#result .result-empty')).toBeVisible();
});

test('직접 입력은 저장 선택 없이 기기에 남기지 않고, 이전 localStorage 입력은 현재 탭으로 옮긴다', async ({ page }) => {
  await ready(page, '/today/');
  await calculateExact(page);
  await expect(page.locator('#a-time')).toHaveValue('03:40');
  await expect(page.locator('#a-time')).toBeVisible();
  expect(await saved(page)).toBeNull();
  await page.evaluate(() => { sessionStorage.clear(); localStorage.setItem('ohaeng:profile', JSON.stringify({ name: '이전값', gender: 'F', calendar: 'solar', y: 1993, m: 1, d: 28, time: '03:40', noTime: false })); });
  await page.reload();
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#a-time')).toHaveValue('03:40');
  await expect(page.locator('.chart-head')).toContainText('03:40');
  await expect(page.locator('[data-storage-status]')).toContainText('이전 버전');
  await expect(page.locator('#save-device')).not.toBeChecked();
  expect(await saved(page)).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('ohaeng:profile'))).toBeNull();
});

test('시각과 시진은 서로 같은 시간대로 바뀌고 서머타임 날짜는 구간이 바뀐다', async ({ page }) => {
  await ready(page, '/today/');
  await page.locator('#a-time').fill('23:10');
  await page.locator('input[name="a-tmode"][value="branch"]').check();
  await expect(page.locator('#a-branch')).toHaveValue('11');
  await expect(page.locator('#a-branch option:checked')).toHaveText('해시 · 21:30~23:30');
  await page.locator('#a-y').selectOption('1987');
  await page.locator('#a-m').selectOption('7');
  await page.locator('#a-d').selectOption('10');
  await expect(page.locator('#a-branch option').first()).toHaveText('해시 · 00:00~00:30 (전날 일주)');
  await expect(page.locator('#a-time-hint')).toContainText('서머타임');
  await page.locator('#a-branch').selectOption('0');
  await page.locator('input[name="a-tmode"][value="exact"]').check();
  await expect(page.locator('#a-time')).toHaveValue('01:30');
  await page.locator('#a-notime').check();
  await expect(page.locator('#a-time')).toBeDisabled();
  await expect(page.locator('#a-time-hint')).toContainText('세 기둥');
});

test('IndexedDB 접근 실패를 표시하고 계산은 계속 동작', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'indexedDB', { value: undefined }));
  await ready(page, '/today/');
  await expect(page.locator('[data-storage-status]')).toContainText('불러오지 못했습니다');
  await calculate(page, true);
  await expect(page.locator('[data-storage-status]')).toContainText('저장에 실패');
  await expect(page.locator('.report-head')).toBeVisible();
});

test('공통 설명과 FAQ는 버튼으로 열리고 ARIA 대상이 존재한다', async ({ page }) => {
  await ready(page, '/today/');
  await page.evaluate(() => { window._events = []; window.gtag = (...args) => window._events.push(args); });
  const method = page.getByRole('button', { name: '계산 방법과 점수 기준' });
  await expect(method).toHaveAttribute('aria-expanded', 'false');
  await method.click();
  await expect(page.locator('#tool-method')).toBeVisible();
  await page.getByRole('button', { name: '자주 묻는 질문', exact: true }).click();
  const q = page.getByRole('button', { name: '오늘의 운세는 어떤 기준으로 계산하나요?' });
  await q.focus(); await page.keyboard.press('Enter');
  await expect(q).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#faq-answer-0')).toBeVisible();
  expect(await page.evaluate(() => window._events.filter((e) => e[1] === 'faq_open').length)).toBe(1);
  expect(await page.locator('[aria-controls]').evaluateAll((els) => els.every((e) => document.getElementById(e.getAttribute('aria-controls'))))).toBe(true);
});

test('아홉 캐릭터 · 이미지/능력치/10년 데이터 · Escape 및 포커스 복귀', async ({ page }) => {
  await ready(page, '/life-story/');
  await calculateExact(page);
  const cards = page.locator('.chapter-card');
  await expect(cards).toHaveCount(9);
  await expect(cards.first()).toContainText('0~9세');
  await expect(cards.last()).toContainText('80~89세');
  const portraits = await cards.locator('img').evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src')));
  expect(new Set(portraits).size).toBe(9);
  await cards.nth(3).click();
  const dialog = page.locator('dialog[open]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.stat')).toHaveCount(5);
  await expect(dialog.locator('.chapter-years article')).toHaveCount(10);
  await expect(dialog.locator('.portrait img')).toHaveJSProperty('naturalWidth', 640);
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await expect(cards.nth(3)).toBeFocused();
});

test('직업 도감: 계열별 6종 · 몰락형 상세 · 키보드 복귀 · 모바일 폭', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page, '/life-story/');
  await calculateExact(page);
  await page.getByRole('button', { name: '캐릭터 도감 · 60종' }).click();
  await expect(page.locator('#job-catalog-body')).toBeVisible();
  await expect(page.locator('[data-job-panel="비견"] .job-card')).toHaveCount(6);
  await page.locator('[data-job-family]').selectOption('정재');
  await expect(page.locator('[data-job-panel="비견"]')).toBeHidden();
  await expect(page.locator('[data-job-panel="정재"]')).toBeVisible();
  const trigger = page.getByRole('button', { name: /합격을 기다리는 백수 선비/ });
  await trigger.click();
  const dialog = page.locator('#job-jobseeker');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('img')).toHaveJSProperty('naturalWidth', 640);
  await expect(dialog).toContainText('오늘도 출석');
  await expect(dialog.locator('.job-bonuses > div')).toHaveCount(5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('나쁜 운세 챕터: 몰락 캐릭터와 실패 서사·낮은 분야의 점수 표시', async ({ page }) => {
  await ready(page, '/life-story/');
  await page.getByRole('radio', { name: '남성', exact: true }).check();
  await page.locator('#a-y').selectOption('1980');
  await page.locator('#a-m').selectOption('6');
  await page.locator('#a-d').selectOption('1');
  await page.locator('input[name="a-tmode"][value="branch"]').check();
  await page.locator('#a-branch').selectOption('3');
  await page.locator('button[type="submit"]').click();
  const card = page.locator('.chapter-card').nth(4);
  await expect(card).toContainText('시련기 · 흐름 44점');
  await card.click();
  const dialog = page.locator('#story-decade-40');
  await expect(dialog.locator('.portrait-low')).toBeVisible();
  await expect(dialog.locator('.chapter-cautions')).toBeVisible();
  await expect(dialog).toContainText('다시 일어설 퀘스트');
  expect(await dialog.locator('.chapter-cautions small').allTextContents()).toEqual(expect.arrayContaining([expect.stringMatching(/\d+점 · (시련|주의)/)]));
});

test('랭킹 분야 변경 · 실제 상위 5개 · 비교 상세', async ({ page }) => {
  await ready(page, '/saju-ranking/');
  await calculateExact(page);
  await expect(page.locator('[data-leader-panel="total"] .leader-button')).toHaveCount(5);
  await page.locator('[data-leader-category]').selectOption('wealth');
  await expect(page.locator('[data-leader-panel="wealth"]')).toBeVisible();
  await expect(page.locator('[data-leader-panel="total"]')).toBeHidden();
  await page.locator('[data-leader-panel="wealth"] .leader-button').first().click();
  await expect(page.locator('dialog[open]')).toContainText('내 재물 점수');
  await page.locator('dialog[open] [data-close-dialog]').click();
  await expect(page.locator('dialog[open]')).toHaveCount(0);
});

test('명예의 전당은 시간 제외 기준으로 고정되고 모든 분야에서 내 생일·성별·시간 유무와 무관하다', async ({ page }) => {
  await ready(page, '/saju-ranking/');
  await calculateExact(page);
  for (const kind of ['four', 'three']) {
    await page.locator('#a-notime').setChecked(kind === 'three');
    await page.locator('button[type="submit"]').click();
    for (const [category, rows] of Object.entries(LEADERS.three)) {
      await page.locator('[data-leader-category]').selectOption(category);
      const panel = page.locator(`[data-leader-panel="${category}"]`);
      await expect(panel).toBeVisible();
      await expect(panel.locator('.leader-place').first()).toHaveText('1위');
      await expect(panel.locator('.leader-place')).toHaveText(rows.slice(0, 5).map((r) => `${r.rank}위`));
      await expect(panel.locator('.leader-score')).toHaveText(rows.slice(0, 5).map((r) => `${r.score}점`));
      await expect(panel.locator('.ranking-page-numbers button')).toHaveCount(20);
      await expect(panel.getByRole('button', { name: '이전 페이지', exact: true })).toBeDisabled();
      await panel.getByRole('button', { name: '20페이지', exact: true }).click();
      await expect(panel.locator('.leader-score')).toHaveText(rows.slice(95).map((r) => `${r.score}점`));
      await expect(panel.locator('.leader-place')).toHaveText(rows.slice(95).map((r) => `${r.rank}위`));
      await expect(panel.getByRole('button', { name: '다음 페이지', exact: true })).toBeDisabled();
      await expect(panel.locator('.ranking-page-summary')).toContainText('96–100 / 100개');
      await expect(page.locator('.rank-leaders .leader-button')).toHaveCount(5);
    }
    await page.locator('[data-leader-category]').selectOption('total');
    const before = await page.locator('.leader-button').allTextContents();
    await page.locator('#a-y').selectOption(kind === 'four' ? '1991' : '1992');
    await page.locator(`input[name="a-gender"][value="${kind === 'four' ? 'M' : 'F'}"]`).check();
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.leader-button')).toHaveText(before);
  }
  const second = page.locator('[data-leader-panel="total"] .leader-button').nth(1);
  await expect(second).toContainText('2위');
  await expect(second).toContainText('88.8점');
  await expect(second).toContainText('양력 출생일 미확인');
  await second.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toHaveAccessibleName('종합 2위 · 경오일주');
  await expect(dialog.locator('.leader-birth')).toContainText('일치하는 양력 출생일은 미확인');
  await expect(dialog.locator('.leader-pillars dd')).toHaveCount(3);
  await expect(dialog.locator('.comparison')).toContainText('88.8점');
});

test('개인 랭킹은 출생시간을 반영하고 명예의 전당 비교 점수는 밤 자시·시간 모름에도 같은 날짜 기준이다', async ({ page }) => {
  await ready(page, '/saju-ranking/');
  await calculateExact(page);
  const input = { gender: 'F', calendar: 'solar', y: 1993, m: 1, d: 28 };
  const comparison = sajuRank(buildChart({ ...input, time: null }), RANK_TABLE);
  const cases = [{ time: '03:40' }, { time: null }, { time: '23:40' }, { timeBranch: 'n0' }];
  for (const time of cases) {
    await page.locator('#a-notime').setChecked(time.time === null);
    if (time.timeBranch) {
      await page.locator('input[name="a-tmode"][value="branch"]').check();
      await page.locator('#a-branch').selectOption(time.timeBranch);
    } else if (time.time) {
      await page.locator('input[name="a-tmode"][value="exact"]').check();
      await page.locator('#a-time').fill(time.time);
    }
    await page.locator('button[type="submit"]').click();
    const personal = sajuRank(buildChart({ ...input, ...time }), RANK_TABLE);
    await expect(page.locator('.rank-head .rank-num')).toHaveText(`${personal.rank.toLocaleString('ko-KR')}위`);
    await expect(page.locator('.rank-head + .box h3 .num')).toHaveText(String(personal.total));
    await expect(page.locator('.rank-leaders > .hint')).toContainText('출생시간을 제외');
    for (const [category, rows] of Object.entries(LEADERS.three)) {
      await page.locator('[data-leader-category]').selectOption(category);
      await page.locator(`[data-leader-panel="${category}"] .leader-button`).first().click();
      const dialog = page.getByRole('dialog');
      const score = category === 'total' ? comparison.total : comparison.cats.find((c) => c.key === category).score;
      await expect(dialog.locator('.comparison b')).toHaveText([`${rows[0].score}점`, `${score}점`]);
      await expect(dialog.locator('.comparison')).toContainText('시간 제외');
      await expect(dialog.locator('.leader-pillars dt')).toHaveText(['년주', '월주', '일주']);
      await page.keyboard.press('Escape');
    }
  }
  await page.reload();
  await expect(page.locator('.rank-head')).toContainText('4기둥 기준');
  await page.locator('[data-leader-panel="total"] .leader-button').first().click();
  await expect(page.getByRole('dialog').locator('.comparison b')).toHaveText([`${LEADERS.three.total[0].score}점`, `${comparison.total}점`]);
});

test('명예의 전당 20페이지는 100개를 중복 없이 보여주며 하단 이동·포커스·모바일 폭을 지킨다', async ({ page }) => {
  await ready(page, '/saju-ranking/');
  await calculateExact(page);
  const section = page.locator('.rank-leaders');
  const ids = [];
  for (let number = 1; number <= 20; number++) {
    await section.getByRole('button', { name: `${number}페이지`, exact: true }).click();
    await expect(section.locator('.leader-button')).toHaveCount(5);
    const expected = LEADERS.three.total.slice((number - 1) * 5, number * 5);
    await expect(section.locator('.leader-score')).toHaveText(expected.map((r) => `${r.score}점`));
    ids.push(...await section.locator('.leader-button').evaluateAll((buttons) => buttons.map((b) => b.getAttribute('aria-controls'))));
    await expect(section.locator('.ranking-pagination [aria-current="page"]')).toHaveText(String(number));
    await expect(section.getByRole('button', { name: `${number}페이지`, exact: true })).toBeFocused();
  }
  expect(new Set(ids).size).toBe(100);
  const last = section.locator('.leader-button').last();
  const lastId = await last.getAttribute('aria-controls');
  await last.click();
  await expect(page.locator('dialog[open]')).toHaveAttribute('id', lastId);
  await expect(page.locator('dialog[open] .comparison')).toContainText(`${LEADERS.three.total[99].score}점`);
  await page.keyboard.press('Escape');
  await expect(last).toBeFocused();
  await section.getByRole('button', { name: '1페이지', exact: true }).click();
  await section.getByRole('button', { name: '다음 페이지', exact: true }).press('Enter');
  await expect(section.locator('.ranking-pagination [aria-current="page"]')).toHaveText('2');
  await expect(section.getByRole('button', { name: '다음 페이지', exact: true })).toBeFocused();
  await section.getByRole('button', { name: '이전 페이지', exact: true }).press('Enter');
  await expect(section.getByRole('button', { name: '1페이지', exact: true })).toBeFocused();
  await expect(section.getByRole('button', { name: '이전 페이지', exact: true })).toBeDisabled();
  await section.getByRole('button', { name: '20페이지', exact: true }).click();
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await section.locator('.ranking-pagination button').evaluateAll((buttons) => buttons.every((b) => {
      const r = b.getBoundingClientRect();
      return r.width >= 24 && r.left >= 0 && r.right <= window.innerWidth;
    })), `${width}px의 페이지 버튼이 잘리거나 너무 작지 않아야 한다`).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    expect(await section.locator('.leader-place').evaluateAll((labels) => labels.every((label) => {
      const range = document.createRange();
      range.selectNodeContents(label);
      return range.getClientRects().length === 1;
    })), '세 자리 순위도 한 줄로 표시한다').toBe(true);
  }
});

test('랭킹 날짜·년월일주·장단점과 감점별 개운 가이드가 실제 진입 경로에 연결된다', async ({ page }) => {
  await ready(page, '/saju-ranking/');
  await calculateExact(page);
  const guidance = page.locator('.rank-guidance');
  await expect(guidance).toContainText('내게 복이 되는 습관');
  await expect(guidance.locator('.support-element')).toHaveCount(2);
  await expect(guidance.locator('.repair-list article').first()).toContainText('평균 대비 -');
  expect(await guidance.evaluate((el) => !!(el.compareDocumentPosition(document.querySelector('.rank-leaders')) & window.Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  const top = page.locator('[data-leader-panel="total"] .leader-button').first();
  await expect(top).toContainText('양력 1955년 7월 8일');
  await expect(top).not.toContainText('시진');
  await page.setViewportSize({ width: 390, height: 844 });
  await top.click();
  const dialog = page.locator('dialog[open]');
  await expect(dialog.locator('.leader-pillars dt')).toHaveText(['년주', '월주', '일주']);
  await expect(dialog).toContainText('이 사주의 장점');
  await expect(dialog).toContainText('단점·보완할 점');
  await expect(dialog.locator('.leader-categories > div')).toHaveCount(5);
  await expect(dialog.locator('.rank-calculation')).toContainText('종합 90.1점');
  await expect(dialog.locator('[data-rank-part]')).toHaveText(['25점', '17.5점', '12.62점', '12.5점', '10.5점', '0점', '0점']);
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(top).toBeFocused();
});

test('캐릭터 배지의 SVG 중심과 원국 표의 행 경계가 정렬된다', async ({ page }) => {
  await ready(page, '/life-story/');
  await calculateExact(page);
  await expect(page.locator('.pillar-table tbody tr')).toHaveCount(6);
  expect(await page.locator('.pillar-table tbody tr').evaluateAll((rows) => rows.every((row) => {
    const cells = [...row.children];
    const top = cells[0].getBoundingClientRect().top;
    return cells.every((c) => Math.abs(c.getBoundingClientRect().top - top) < 1 && window.getComputedStyle(c).verticalAlign === 'middle');
  }))).toBe(true);
  expect(await page.locator('.chapter-card .portrait-badge').evaluateAll((badges) => badges.every((b) => {
    const icon = b.querySelector('svg'); if (!icon) return false;
    const a = b.getBoundingClientRect(), s = icon.getBoundingClientRect();
    return Math.abs((a.x + a.width / 2) - (s.x + s.width / 2)) < 1 && Math.abs((a.y + a.height / 2) - (s.y + s.height / 2)) < 1;
  }))).toBe(true);
  await expect(page.locator('.result-share [data-share="x"]')).toHaveAccessibleName('X에 공유');
  await expect(page.locator('.result-share [data-share="facebook"] svg')).toHaveAttribute('fill', 'currentColor');
});

test('올해·내년 띠별 표의 아이콘·이름·점수 정렬과 좁은 화면 스크롤', async ({ page }) => {
  for (const y of [todayKST().y, todayKST().y + 1]) {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto(`/tti/${y}/`);
    await expect(page.locator('.zodiac-year-link')).toHaveCount(12);
    expect(await page.locator('.zodiac-year-link').evaluateAll((links) => links.every((link) => {
      const a = link.querySelector('.animal-icon').getBoundingClientRect();
      const b = link.querySelector('span').getBoundingClientRect();
      return Math.abs(a.y + a.height / 2 - b.y - b.height / 2) < 1 && window.getComputedStyle(link).textDecorationLine === 'none';
    }))).toBe(true);
    await page.setViewportSize({ width: 320, height: 800 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await page.locator('.zodiac-year-link').first().click();
    await expect(page).toHaveURL(new RegExp(`/tti/${y}/rat/`));
  }
});

test('새 브랜드와 해 로고가 홈·모바일·공유 페이지에 표시되고 파비콘을 읽을 수 있다', async ({ page }) => {
  await ready(page, '/');
  await expect(page).toHaveTitle(`${BRAND.name} | ${BRAND.descriptor}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(BRAND.name);
  await expect(page.getByRole('link', { name: `${BRAND.name} 홈`, exact: true })).toBeVisible();
  const logo = page.locator('.brand-logo');
  await expect(logo).toHaveJSProperty('naturalWidth', 128);
  const icons = await page.locator('link[rel="icon"], link[rel="apple-touch-icon"]').evaluateAll((links) => links.map((link) => link.href));
  for (const src of icons) {
    expect(await page.evaluate((src) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.naturalWidth > 0);
      img.onerror = () => resolve(false);
      img.src = src;
    }), src)).toBe(true);
  }
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    expect(await page.locator('.brand').evaluate((el) => {
      const r = el.getBoundingClientRect();
      return r.left >= 0 && r.right <= window.innerWidth && el.scrollWidth <= el.clientWidth;
    })).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  }
  await page.setViewportSize({ width: 320, height: 960 });
  await page.goto('/share/');
  await expect(page.locator('.share-card .brand-logo')).toHaveJSProperty('naturalWidth', 128);
  await expect(page.locator('.sc-big')).toHaveText(BRAND.name);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test('결과 이미지 저장에도 해 로고가 로드되고 PNG가 생성된다', async ({ page }) => {
  await ready(page, '/today/');
  await calculateExact(page);
  const logoResponse = page.waitForResponse((r) => r.url().endsWith('/icon-192.png?v=sun') && r.status() === 200);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: '이미지 저장', exact: true }).click();
  await logoResponse;
  expect((await download).suggestedFilename()).toBe('make-your-own-day-today.png');
  await expect(page.locator('#result')).toContainText('이미지를 저장했습니다.');
});

test('홈의 주요 콘텐츠가 입력 폼 옆에 보이고 첫 영역이 과하게 늘어나지 않는다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await ready(page, '/');
  const hero = await page.locator('.home-hero').boundingBox();
  const features = await page.locator('.home-features').boundingBox();
  const form = await page.locator('#tool-form').boundingBox();
  expect(hero.height).toBeLessThan(740);
  expect(features.y).toBeLessThan(form.y + form.height / 2);
  await expect(page.locator('.home-feature')).toHaveCount(3);
  const name = await page.locator('#a-name').boundingBox();
  const gender = await page.locator('.field-gender .seg').boundingBox();
  expect(Math.abs(name.y - gender.y)).toBeLessThan(1);
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 960 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  }
});

test('12띠 생성형 심볼이 홈 카드·일별 상세·연간 운세에 로드된다', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('.zodiac-cards .tti-card');
  await expect(cards).toHaveCount(12);
  const sources = [];
  for (const card of await cards.all()) {
    const img = card.locator('img.animal-icon');
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el) => el.naturalWidth)).toBeGreaterThan(0);
    sources.push(await img.getAttribute('src'));
  }
  expect(new Set(sources).size).toBe(12);
  expect(sources.every((src) => /^\/zodiac\/[a-z]+\.webp$/.test(src))).toBe(true);
  await page.goto('/tti/today/');
  await page.locator('.tti-name').first().click();
  const daily = page.locator('dialog[open] .animal-icon');
  await expect(daily).toHaveAttribute('src', sources[0]);
  await expect.poll(() => daily.evaluate((el) => el.naturalWidth)).toBeGreaterThan(0);
  for (const y of [todayKST().y, todayKST().y + 1]) {
    await page.goto(`/tti/${y}/`);
    await expect(page.locator('.zodiac-year-link img.animal-icon')).toHaveCount(12);
    await page.locator('.zodiac-year-link').first().click();
    const annual = page.locator('.zodiac-hero .animal-icon');
    await expect(annual).toHaveAttribute('src', sources[0]);
    await expect.poll(() => annual.evaluate((el) => el.naturalWidth)).toBeGreaterThan(0);
  }
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/');
  await page.locator('.zodiac-cards').scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test('띠 기본은 오늘 · 쥐띠 상세는 일별 라이트박스 · 다섯 메뉴 유지 및 뒤로가기', async ({ page }) => {
  await page.goto('/tti/');
  await expect(page.locator('h1')).toContainText('오늘');
  await expect(page.locator('.tti-nav > a')).toHaveCount(5);
  await page.locator('.tti-name').first().click();
  await expect(page.locator('dialog[open]')).toContainText('쥐띠의 오늘');
  await expect(page).toHaveURL(/\/tti\/$/);
  await page.keyboard.press('Escape');
  await page.evaluate(() => { window._navIdentity = document.querySelector('.tti-nav'); });
  const yearLink = page.locator('.tti-nav > a').nth(1);
  await yearLink.click();
  await expect(page.locator('h1')).toContainText('년 띠별 운세');
  expect(await page.evaluate(() => window._navIdentity === document.querySelector('.tti-nav'))).toBe(true);
  await expect(page.locator('[data-share-page]')).toHaveAttribute('data-url', /\/tti\/\d{4}\/$/);
  await page.goBack();
  await expect(page.locator('h1')).toContainText('오늘');
  await expect(page.locator('.tti-nav > a')).toHaveCount(5);
});

test('연간 띠 운세: 출생 연도 선택 후 12개월과 내 해석만 갱신', async ({ page }) => {
  await page.goto('/tti/');
  const yearHref = await page.locator('.tti-nav > a').nth(1).getAttribute('href');
  await page.goto(`${yearHref}rat/`);
  await expect(page.locator('[data-monthly-flow] article')).toHaveCount(12);
  await page.locator('[data-cohort]').selectOption('1996');
  await expect(page.locator('[data-cohort-text]')).toContainText('1996년생');
  await expect(page.locator('[data-monthly-flow] article')).toHaveCount(12);
  await expect(page.locator('h2').filter({ hasText: '출생 연도별' })).toHaveCount(0);
});

test('연간 띠 운세는 사주 엔진 없이 연생별 흐름을 보여 주고 저장된 생일로 연도를 고른다', async ({ page }) => {
  const engine = [];
  page.on('request', (req) => { if (/\/src\/engine\/(index|chart|calendar|fortune)\.js|lunar-javascript/.test(req.url())) engine.push(req.url()); });
  await page.addInitScript(() => sessionStorage.setItem('ohaeng:profile', JSON.stringify({ name: '쥐띠', gender: 'M', calendar: 'solar', y: 1996, m: 5, d: 5, timeMode: 'exact', time: '10:00', noTime: false })));
  await page.goto(`/tti/${todayKST().y}/rat/`);
  await expect(page.locator('[data-cohort]')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('[data-cohort]')).toHaveValue('1996');
  await expect(page.locator('[data-cohort-text]')).toContainText('1996년생');
  expect(engine).toEqual([]);
});

for (const width of [320, 768, 1024, 1440]) test(`${width}px 실제 도구 경로 · 줄바꿈 · 가로 넘침`, async ({ page }) => {
  await page.setViewportSize({ width, height: 960 });
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  const paths = width === 320 ? ['/today/', '/tomorrow/', '/week/', '/month/', `/year/${todayKST().y}/`, '/lifetime/', '/manseryeok/', '/life-story/', '/saju-ranking/', '/compatibility/', '/tti/', `/tti/${todayKST().y}/rat/`] : ['/today/', '/life-story/', '/tti/'];
  for (const path of paths) {
    await page.goto(path);
    if (await page.locator('#tool').count()) await calculateExact(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), path).toBe(true);
    expect(await page.locator('body').evaluate((el) => window.getComputedStyle(el).wordBreak)).toBe('keep-all');
    expect(await page.locator('body').evaluate((el) => window.getComputedStyle(el).overflowWrap)).not.toBe('anywhere');
  }
  expect(errors).toEqual([]);
});

test('홈 입력 전달 · 궁합 두 사람 시진과 시간 모름 · 저장 복원', async ({ page }) => {
  await ready(page, '/');
  await page.locator('input[name="a-tmode"][value="branch"]').check();
  await page.locator('#a-branch').selectOption('3');
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/today\/$/);
  await expect(page.locator('.chart-head')).toContainText('묘시');
  expect(await saved(page)).toBeNull();
  await ready(page, '/compatibility/');
  await page.locator('#b-notime').check();
  await expect(page.locator('#b-time')).toBeDisabled();
  await page.locator('#save-device').check();
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('#result .report-head')).toBeVisible();
  await expect(page.locator('#result .report-head .hz')).toHaveCount(2);
  await expect(page.locator('[data-storage-status]')).toContainText('이 기기에 저장했습니다');
  expect((await saved(page, 'b')).noTime).toBe(true);
  await page.reload();
  await expect(page.locator('#result .report-head')).toBeVisible();
  await expect(page.locator('#b-notime')).toBeChecked();
});

test('작은 화면 캐릭터 상세 · 툴팁 경계 · 키보드 포커스', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await ready(page, '/life-story/');
  await calculateExact(page);
  const info = page.getByRole('button', { name: '용신 설명', exact: true });
  await info.focus();
  const tooltip = page.locator('.tip.show');
  await expect(tooltip).toBeVisible();
  const box = await tooltip.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(320);
  await page.keyboard.press('Escape');
  const card = page.locator('.chapter-card').first();
  await card.click();
  const dialog = page.locator('dialog[open]');
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  await page.keyboard.press('Tab');
  expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(card).toBeFocused();
});

test('잘못된 날짜는 저장하지 않고 음력 선택·시진 계산을 연결', async ({ page }) => {
  await ready(page, '/today/');
  await page.locator('#a-m').selectOption('2'); await page.locator('#a-d').selectOption('31');
  await page.locator('#save-device').check();
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('.form-error')).toContainText('31일이 없습니다');
  expect(await saved(page)).toBeNull();
  await page.locator('input[name="a-cal"][value="lunar"]').check();
  await page.locator('#a-d').selectOption('1');
  await page.locator('input[name="a-tmode"][value="branch"]').check();
  await page.locator('#a-branch').selectOption('n0');
  await expect(page.locator('#a-leap')).toBeEnabled();
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('.chart-head')).toContainText('자시 · 23:30~24:00 (다음 날 일주)');
  await expect(page.locator('[data-storage-status]')).toContainText('이 기기에 저장했습니다');
  expect((await saved(page)).calendar).toBe('lunar');
});
