import { test, expect } from '@playwright/test';
import { todayKST } from '../../src/engine/core.js';
import { calculateTojeong } from '../../src/domain/tojeong.js';

test.beforeEach(async ({ context }) => {
  await context.route('https://**/*', (route) => route.abort());
});
async function ready(page, path = '/tojeong/') {
  await page.goto(path);
  await expect(page.locator('#tojeong-tool')).toHaveAttribute('data-ready', 'true');
}
async function enter(page) {
  await page.locator('#tj-name').fill('검증');
  await page.locator('#tj-y').selectOption('1993');
  await page.locator('#tj-m').selectOption('6');
  await page.locator('#tj-d').selectOption('21');
}

test('홈에서 무료 토정비결 진입 · 12개월 키보드 선택 · 내년 복원', async ({ page }) => {
  await page.goto('/');
  await page.locator('.home-tools a[href="/tojeong/"]').click();
  await expect(page.locator('#tojeong-tool')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('input[type="time"], #a-time, input[name="a-gender"]')).toHaveCount(0);
  await enter(page);
  await page.getByRole('button', { name: '무료 토정비결 보기', exact: true }).click();
  await expect(page.locator('.tojeong-code')).toHaveText(calculateTojeong({ calendar: 'solar', y: 1993, m: 6, d: 21 }, todayKST().y).code);
  await expect(page.locator('[data-tojeong-month]')).toHaveCount(12);
  const december = page.locator('[data-tojeong-month="12"]');
  await december.focus(); await page.keyboard.press('Enter');
  await expect(december).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#tj-month-12')).toBeVisible();
  await expect(page.locator('#tj-month-1')).toBeHidden();
  expect(await page.locator('[aria-controls]').evaluateAll((nodes) => nodes.every((node) => document.getElementById(node.getAttribute('aria-controls'))))).toBe(true);
  await page.locator(`.tojeong-years a[href="/tojeong/${todayKST().y + 1}/"]`).click();
  await expect(page.locator('#tj-name')).toHaveValue('검증');
  await expect(page.locator('.tojeong-code')).toBeVisible();
  await expect(page.locator('.tojeong-summary')).toContainText(`${todayKST().y + 1}년`);
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  }
});

test('토정비결 기기 저장·다른 탭 복원·삭제는 사주 저장본을 보존한다', async ({ page, context }) => {
  await page.goto('/today/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await page.locator('#a-name').fill('사주 보존');
  await page.getByRole('radio', { name: '여성', exact: true }).check();
  await page.locator('#a-y').selectOption('1989');
  await page.locator('input[name="a-tmode"][value="branch"]').check();
  await page.locator('#a-branch').selectOption('3');
  await page.locator('#save-device').check();
  await page.getByRole('button', { name: '오늘의 운세 보기', exact: true }).click();
  await expect(page.locator('[data-storage-status]')).toContainText('이 기기에 저장했습니다');
  await ready(page);
  await enter(page);
  await page.locator('#tj-save').check();
  await page.getByRole('button', { name: '무료 토정비결 보기', exact: true }).click();
  await expect(page.locator('#tj-storage-status')).toContainText('이 기기에 저장했습니다');
  const next = await context.newPage();
  await ready(next);
  await expect(next.locator('#tj-name')).toHaveValue('검증');
  await expect(next.locator('#tj-save')).toBeChecked();
  await next.locator('[data-tojeong-delete]').click();
  await expect(next.locator('#tj-storage-status')).toContainText('삭제했습니다');
  await next.reload();
  await expect(next.locator('#tj-name')).toHaveValue('사주 보존');
  await expect(next.locator('#tj-save')).not.toBeChecked();
  await next.goto('/today/');
  await expect(next.locator('#a-name')).toHaveValue('사주 보존');
  await expect(next.locator('#a-y')).toHaveValue('1989');
  await expect(next.locator('#a-branch')).toHaveValue('3');
  await expect(next.getByRole('radio', { name: '여성', exact: true })).toBeChecked();
});

test('토정비결의 윤달 조정 표시 · 잘못된 날짜 거부 · 저장 실패에도 계산', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'indexedDB', { value: undefined }));
  await ready(page);
  await expect(page.locator('#tj-storage-status')).toContainText('저장소를 불러오지 못했습니다');
  await page.locator('#tj-y').selectOption('1993');
  await page.locator('#tj-m').selectOption('3');
  await page.locator('input[name="tj-calendar"][value="lunar"]').check();
  await page.locator('#tj-leap').check();
  await page.locator('#tj-save').check();
  await page.getByRole('button', { name: '무료 토정비결 보기', exact: true }).click();
  await expect(page.locator('.tojeong-summary')).toContainText('윤달 생일을 같은 월의 평달로');
  await expect(page.locator('#tj-storage-status')).toContainText('기기 저장에 실패');
  await page.locator('#tj-y').selectOption('2021');
  await page.locator('#tj-m').selectOption('4');
  await page.getByRole('button', { name: '무료 토정비결 보기', exact: true }).click();
  await expect(page.locator('#tj-error')).toContainText('존재하지 않는 날짜');
  await expect(page.locator('.tojeong-code')).toHaveCount(0);
  expect(JSON.parse(await page.evaluate(() => sessionStorage.getItem('ohaeng:tojeong'))).y).toBe(1993);
});

test('올해 연도 주소는 /tojeong/으로 이동 · 자기 괘 해설만 받기 · 결과 공유', async ({ page }) => {
  const data = [];
  page.on('request', (req) => { if (req.url().includes('/data/tojeong/')) data.push(new URL(req.url()).pathname); });
  await page.goto(`/tojeong/${todayKST().y}/`);
  expect(new URL(page.url()).pathname).toBe('/tojeong/');
  await ready(page, '/tojeong/');
  await expect(page.locator('.tojeong-year-table')).toContainText(`${todayKST().y}년 토정비결 작괘 기준표`);
  await enter(page);
  await page.getByRole('button', { name: '무료 토정비결 보기', exact: true }).click();
  const code = calculateTojeong({ calendar: 'solar', y: 1993, m: 6, d: 21 }, todayKST().y).code;
  await expect(page.locator('.tojeong-code')).toHaveText(code);
  expect(data).toEqual([`/data/tojeong/${code}.json`]);
  await expect(page.locator('.result-share [data-share="copy"]')).toBeVisible();
  await page.evaluate(() => { window.shareOpened = []; window.open = (...args) => { window.shareOpened.push(args); return null; }; });
  await page.locator('.result-share [data-share="x"]').click();
  const href = await page.evaluate(() => window.shareOpened[0][0]);
  expect(decodeURIComponent(decodeURIComponent(href))).toContain(`k=tojeong&n=검증&y=${todayKST().y}&g=${code}`);
  await page.goto(`/share/?k=tojeong&n=검증&y=${todayKST().y}&g=${code}`);
  await expect(page.locator('.sc-big')).toHaveText(`${code}괘`);
});
