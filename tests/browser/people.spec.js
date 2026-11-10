import { test, expect } from '@playwright/test';
import { buildChart, compat, todayKST } from '../../src/engine/index.js';

test.beforeEach(async ({ context }) => { await context.route('https://**/*', route => route.abort()); });
const ready = async (page, path = '/today/') => { await page.goto(path); await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true'); };
const fill = async (page, prefix = 'a', name = '나', year = '1990') => {
  await page.locator(`#${prefix}-name`).fill(name);
  await page.locator(`#${prefix}-y`).fill(year);
  for (const [key, value] of [['m', '5'], ['d', '15']]) await page.locator(`#${prefix}-${key}`).selectOption(value);
  await page.locator(`#${prefix}-time`).fill('12:00');
};
const people = page => page.evaluate(async () => (await import('/src/client/profile.js')).listPeople());
const open = async page => { await page.locator('.profiles-tab').click(); await expect(page.locator('[data-add-person]')).toBeVisible(); };
const save = async page => { await page.locator('#save-device').check(); await page.locator('#tool-form [type=submit]').click(); await expect(page.locator('[data-storage-status]')).toContainText('저장했습니다'); };

test('서로 다른 세 사람을 계산해도 덮어쓰지 않고 새 탭과 궁합에서 선택한다', async ({ page, context }) => {
  await ready(page); await fill(page); await save(page);
  await expect(page.locator('[data-profile-coach]')).toBeVisible();
  await page.locator('[data-dismiss-profile-guide]').click();
  await fill(page, 'a', '엄마', '1960'); await save(page);
  await fill(page, 'a', '동생', '1995'); await save(page);
  await save(page);
  expect((await people(page)).map(p => p.profile.name)).toEqual(['나', '엄마', '동생']);
  await expect(page.locator('[data-profile-coach]')).toBeHidden();
  const list = await people(page);
  const next = await context.newPage(); await ready(next, '/compatibility/');
  await next.locator('#a-saved-person').selectOption(list[0].id);
  await next.locator('#b-saved-person').selectOption(list[1].id);
  await expect(next.locator('#a-y')).toHaveValue('1990'); await expect(next.locator('#b-y')).toHaveValue('1960');
  await expect(next.locator('#result')).toContainText('나'); await expect(next.locator('#result')).toContainText('엄마');
  const expected = compat(buildChart(list[0].profile), buildChart(list[1].profile), todayKST());
  await expect(next.locator('#result .report-head .val b')).toHaveText(String(expected.total));
  await next.close();
});

test('저장한 가족을 토정비결에서도 재입력 없이 선택한다', async ({ page }) => {
  await ready(page); await fill(page, 'a', '토정 가족', '1960'); await save(page);
  const person = (await people(page))[0];
  await page.goto('/tojeong/'); await expect(page.locator('#tojeong-tool')).toHaveAttribute('data-ready', 'true');
  await page.locator('#tj-saved-person').selectOption(person.id);
  await expect(page.locator('#tj-y')).toHaveValue('1960');
  await expect(page.locator('#tojeong-result .tojeong-summary')).toContainText('토정 가족');
  await page.locator('[data-reading-size]').selectOption('large');
  await expect(page.locator('#tojeong-result')).toHaveClass(/reading-large/);
});

test('관리 메뉴에서 추가·수정·선택·삭제하고 현재 결과와 저장본을 함께 갱신한다', async ({ page }) => {
  await ready(page); await open(page);
  await page.locator('[data-add-person]').click(); await fill(page, 'person', '가족', '1987');
  await page.locator('#person-notime').check();
  await page.locator('#person-editor [type=submit]').click();
  await expect(page.locator('.profile-list')).toContainText('가족');
  await page.locator('[data-use-person]').click();
  await expect(page.locator('#a-notime')).toBeChecked();
  await expect(page.locator('#result .chart-head')).toContainText('가족');
  await open(page); await page.locator('[data-edit-person]').click();
  await page.locator('#person-name').fill('가족 수정'); await page.locator('#person-y').fill('1988');
  await page.locator('#person-editor [type=submit]').click();
  await expect(page.locator('.profile-list')).toContainText('가족 수정');
  await page.locator('#profile-manager [data-close-dialog]').click();
  await expect(page.locator('#a-y')).toHaveValue('1988');
  await expect(page.locator('#result .chart-head')).toContainText('가족 수정');
  expect(await people(page)).toHaveLength(1);
  await open(page); await page.locator('[data-delete-person]').click();
  await page.locator('[data-cancel-delete]').click(); expect(await people(page)).toHaveLength(1);
  await page.locator('[data-delete-person]').click(); await page.locator('[data-confirm-delete]').click();
  await expect(page.locator('.profile-empty')).toBeVisible();
  await page.keyboard.press('Escape'); await expect(page.locator('.profiles-tab')).toBeFocused();
  await expect(page.locator('#result .chart-card')).toHaveCount(0);
  await page.reload(); await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#a-y')).toHaveValue('');
});

test('기존 동의된 a/b는 목록으로 옮기고 토정비결과 미동의 세션을 구분한다', async ({ page }) => {
  await ready(page);
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      const req = indexedDB.open('ohaeng-profiles', 1);
      req.onsuccess = () => {
        const db = req.result, tx = db.transaction('profiles', 'readwrite'), store = tx.objectStore('profiles');
        store.delete('people:v1');
        store.put({ name: '기존 사용자', gender: 'M', calendar: 'solar', y: 1990, m: 5, d: 15, time: '12:00' }, 'a');
        store.put({ name: '기존 상대', gender: 'F', calendar: 'lunar', y: 1990, m: 4, d: 21, noTime: true }, 'b');
        store.put({ calendar: 'solar', y: 1990, m: 5, d: 15 }, 'tojeong');
        tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => reject(tx.error);
      };
    });
    localStorage.setItem('ohaeng:profile', JSON.stringify({ name: '미동의', gender: 'M', calendar: 'solar', y: 1992, m: 1, d: 1, time: '12:00' }));
  });
  await page.reload(); await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  expect((await people(page)).map(p => p.profile.name)).toEqual(['기존 사용자', '기존 상대']);
  await expect(page.locator('#a-name')).toHaveValue('미동의');
  await page.locator('[data-delete-profile]').click(); await page.locator('[data-confirm-delete-all]').click();
  expect(await people(page)).toHaveLength(0);
  expect(await page.evaluate(async () => (await import('/src/client/profile.js')).load('tojeong'))).toMatchObject({ y: 1990 });
});

test('음력 윤달과 시진을 보존하고 잘못된 날짜는 저장하지 않는다', async ({ page }) => {
  await ready(page); await open(page); await page.locator('[data-add-person]').click();
  await fill(page, 'person', '윤달 가족', '2023');
  await page.locator('[name=person-cal][value=lunar]').check();
  await page.locator('#person-m').selectOption('2'); await page.locator('#person-leap').check();
  await page.locator('[name=person-tmode][value=branch]').check(); await page.locator('#person-branch').selectOption('n0');
  await page.locator('#person-editor [type=submit]').click();
  await expect(page.locator('.profile-list')).toContainText('윤달 가족');
  await page.locator('[data-edit-person]').click();
  await expect(page.locator('#person-leap')).toBeChecked(); await expect(page.locator('#person-branch')).toHaveValue('n0');
  await page.locator('#person-m').selectOption('3');
  await page.locator('#person-editor [type=submit]').click();
  await expect(page.locator('[data-person-error]')).toBeVisible();
  expect((await people(page))[0].profile).toMatchObject({ calendar: 'lunar', leap: true, m: 2, timeMode: 'branch', timeBranch: 'n0' });
});

test('저장 차단 시에도 계산하고 관리 오류를 표시하며 민감한 값을 분석 이벤트에 넣지 않는다', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'indexedDB', { value: undefined });
    window.events = []; window.gtag = (...args) => window.events.push(args);
  });
  await ready(page); await fill(page, 'a', '비공개가족'); await page.locator('#save-device').check();
  await page.locator('#tool-form [type=submit]').click();
  await expect(page.locator('.report-head')).toBeVisible();
  await expect(page.locator('[data-storage-status]')).toContainText('저장에 실패');
  await page.locator('.profiles-tab').click(); await expect(page.locator('[data-profile-feedback]')).toContainText('접근하지 못했습니다');
  expect(JSON.stringify(await page.evaluate(() => window.events))).not.toContain('비공개가족');
});

for (const lang of ['', '/en']) test(`${lang || 'ko'} 320px 관리 화면과 읽기 설정은 넘치지 않고 키보드로 닫힌다`, async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await ready(page, `${lang}/manseryeok/`); await fill(page);
  await page.locator('#tool-form [type=submit]').click();
  await page.locator('[data-reading-size]').selectOption('large'); await page.locator('[data-reading-script]').selectOption('hangul');
  await expect(page.locator('#result')).toHaveClass(/reading-large.*reading-hangul/);
  await page.reload(); await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('[data-reading-size]')).toHaveValue('large');
  await open(page); await page.locator('[data-add-person]').click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(await page.locator('#profile-manager').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await expect(page.locator('#person-time')).toHaveCSS('font-size', '16px');
  if (lang) await expect(page.locator('#profile-manager')).not.toContainText(/[가-힣]/);
  await page.keyboard.press('Escape'); await expect(page.locator('.profiles-tab')).toBeFocused();
});

test('홈 첫 저장 후 이동한 결과에 안내가 한 번 나오고 선택한 가족을 다시 연다', async ({ page }) => {
  await ready(page, '/'); await fill(page); await page.locator('#save-device').check(); await page.locator('#tool-form [type=submit]').click();
  await expect(page).toHaveURL(/\/today\/$/); await expect(page.locator('[data-profile-coach]')).toBeVisible();
  await page.locator('[data-dismiss-profile-guide]').click();
  await open(page); await page.locator('[data-add-person]').click(); await fill(page, 'person', '아빠', '1961');
  await page.locator('#person-editor [type=submit]').click(); await expect(page.locator('.profile-list li')).toHaveCount(2);
  await page.locator('#profile-manager [data-close-dialog]').click();
  const id = (await people(page))[1].id;
  await ready(page, '/');
  await page.locator('[data-edit-profile]').click(); await page.locator('#a-saved-person').selectOption(id);
  await expect(page.locator('#result .chart-head')).toContainText('아빠');
  await expect(page.locator('[data-profile-coach]')).toBeHidden();
});
