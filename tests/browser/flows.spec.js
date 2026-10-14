import { test, expect } from '@playwright/test';
import { todayKST } from '../../src/engine/core.js';

test.beforeEach(async ({ context }) => {
  await context.route('https://**/*', (route) => route.abort());
});
async function ready(page, path) {
  await page.goto(path);
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#tool-form')).not.toHaveAttribute('inert', '');
  await expect(page.locator('input[type="time"]')).toHaveCount(0);
}
async function calculate(page, persist = false) {
  await page.locator('#a-name').fill('검증');
  await page.locator('#a-y').selectOption('1993');
  await page.locator('#a-m').selectOption('1');
  await page.locator('#a-d').selectOption('28');
  await page.locator('#a-time').selectOption('3');
  await page.locator('#save-device').setChecked(persist);
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('#result .chart-card')).toBeVisible();
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

test('묘시 입력 · 저장 선택 · 새 탭 복원 · 삭제', async ({ page, context }) => {
  await ready(page, '/today/');
  await calculate(page);
  await expect(page.locator('.chart-head')).toContainText('묘시');
  expect(await saved(page)).toBeNull();
  await calculate(page, true);
  await expect(page.locator('[data-storage-status]')).toContainText('IndexedDB에 저장');
  expect((await saved(page)).timeBranch).toBe('3');
  const next = await context.newPage();
  await ready(next, '/tomorrow/');
  await expect(next.locator('#a-name')).toHaveValue('검증');
  await expect(next.locator('#a-time')).toHaveValue('3');
  await expect(next.locator('#result .chart-card')).toBeVisible();
  await next.locator('[data-delete-profile]').click();
  await expect(next.locator('[data-storage-status]')).toContainText('삭제했습니다');
  expect(await saved(next)).toBeNull();
  await next.reload();
  await expect(next.locator('#result .result-empty')).toBeVisible();
});

test('예시는 영구 저장하지 않고 기존 localStorage의 정확한 시각을 안전하게 이전', async ({ page }) => {
  await ready(page, '/today/');
  await page.locator('[data-sample]').click();
  expect(await saved(page)).toBeNull();
  await page.evaluate(() => localStorage.setItem('ohaeng:profile', JSON.stringify({ name: '이전값', gender: 'F', calendar: 'solar', y: 1993, m: 1, d: 28, time: '03:40', noTime: false })));
  await page.reload();
  await expect(page.locator('#a-time')).toHaveValue('legacy');
  await expect(page.locator('.chart-head')).toContainText('03:40');
  expect((await saved(page)).time).toBe('03:40');
  expect(await page.evaluate(() => localStorage.getItem('ohaeng:profile'))).toBeNull();
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
  await page.locator('[data-sample]').click();
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
  await page.locator('[data-sample]').click();
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
  await page.locator('#a-time').selectOption('3');
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
  await page.locator('[data-sample]').click();
  await expect(page.locator('[data-leader-panel="total"] .leader-button')).toHaveCount(5);
  await page.locator('[data-leader-category]').selectOption('wealth');
  await expect(page.locator('[data-leader-panel="wealth"]')).toBeVisible();
  await expect(page.locator('[data-leader-panel="total"]')).toBeHidden();
  await page.locator('[data-leader-panel="wealth"] .leader-button').first().click();
  await expect(page.locator('dialog[open]')).toContainText('내 재물 점수');
  await page.locator('dialog[open] [data-close-dialog]').click();
  await expect(page.locator('dialog[open]')).toHaveCount(0);
});

test('랭킹 날짜·시진·장단점과 감점별 개운 가이드가 실제 진입 경로에 연결된다', async ({ page }) => {
  await ready(page, '/saju-ranking/');
  await page.locator('[data-sample]').click();
  const guidance = page.locator('.rank-guidance');
  await expect(guidance).toContainText('내게 복이 되는 습관');
  await expect(guidance.locator('.support-element')).toHaveCount(2);
  await expect(guidance.locator('.repair-list article').first()).toContainText('평균 대비 -');
  expect(await guidance.evaluate((el) => !!(el.compareDocumentPosition(document.querySelector('.rank-leaders')) & window.Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  const top = page.locator('[data-leader-panel="total"] .leader-button').first();
  await expect(top).toContainText('양력 1997년 1월 27일');
  await expect(top).toContainText('자시');
  await page.setViewportSize({ width: 390, height: 844 });
  await top.click();
  const dialog = page.locator('dialog[open]');
  await expect(dialog.locator('.leader-pillars dt')).toHaveText(['년주', '월주', '일주', '시주']);
  await expect(dialog).toContainText('이 사주의 장점');
  await expect(dialog).toContainText('단점·보완할 점');
  await expect(dialog.locator('.leader-categories > div')).toHaveCount(5);
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(top).toBeFocused();
});

test('캐릭터 배지의 SVG 중심과 원국 표의 행 경계가 정렬된다', async ({ page }) => {
  await ready(page, '/life-story/');
  await page.locator('[data-sample]').click();
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

for (const width of [320, 768, 1024, 1440]) test(`${width}px 실제 도구 경로 · 줄바꿈 · 가로 넘침`, async ({ page }) => {
  await page.setViewportSize({ width, height: 960 });
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  const paths = width === 320 ? ['/today/', '/tomorrow/', '/week/', '/month/', `/year/${todayKST().y}/`, '/lifetime/', '/manseryeok/', '/life-story/', '/saju-ranking/', '/compatibility/', '/tti/', `/tti/${todayKST().y}/rat/`] : ['/today/', '/life-story/', '/tti/'];
  for (const path of paths) {
    await page.goto(path);
    const sample = page.locator('[data-sample]');
    if (await sample.count()) { await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true'); await sample.click(); await expect(page.locator('.sample-note')).toBeVisible(); }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), path).toBe(true);
    expect(await page.locator('body').evaluate((el) => window.getComputedStyle(el).wordBreak)).toBe('keep-all');
    expect(await page.locator('body').evaluate((el) => window.getComputedStyle(el).overflowWrap)).not.toBe('anywhere');
  }
  expect(errors).toEqual([]);
});

test('홈 입력 전달 · 궁합 두 사람 시진과 시간 모름 · 저장 복원', async ({ page }) => {
  await ready(page, '/');
  await page.locator('#a-time').selectOption('3');
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
  await expect(page.locator('[data-storage-status]')).toContainText('IndexedDB에 저장');
  expect((await saved(page, 'b')).noTime).toBe(true);
  await page.reload();
  await expect(page.locator('#result .report-head')).toBeVisible();
  await expect(page.locator('#b-notime')).toBeChecked();
});

test('작은 화면 캐릭터 상세 · 툴팁 경계 · 키보드 포커스', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await ready(page, '/life-story/');
  await page.locator('[data-sample]').click();
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
  await page.locator('#a-d').selectOption('1'); await page.locator('#a-time').selectOption('zi-late');
  await expect(page.locator('#a-leap')).toBeEnabled();
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('.chart-head')).toContainText('자시 · 밤');
  await expect(page.locator('[data-storage-status]')).toContainText('IndexedDB에 저장');
  expect((await saved(page)).calendar).toBe('lunar');
});
