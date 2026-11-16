import { test, expect } from '@playwright/test';

const orderId = 'fortune_00000000-0000-4000-8000-000000000001';
test.beforeEach(async ({ page }) => {
  // 회귀 검증이 실제 결제 상점 설정에 영향을 주지 않도록 공개 설정만 고정한다.
  await page.route('**/api/commerce/config', route => route.fulfill({ json: { enabled: false, mode: 'sandbox' } }));
});
async function fillPerson(page, who, year = '1990') {
  await page.locator(`#${who}-y`).fill(year);
  await page.locator(`#${who}-m`).selectOption('5');
  await page.locator(`#${who}-d`).selectOption('17');
  const gender = page.locator(`[name="${who}-gender"][value="F"]`);
  if (await gender.count()) await gender.check();
}
test('홈 상품군은 세 개이고 각각 990원 단건 구매 경로로 연결된다', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('.home-purchases .fortune-product');
  await expect(cards).toHaveCount(3);
  for (const id of ['tojeong', 'lifetime', 'compatibility']) await expect(page.locator(`.home-purchases a[href="/shop/${id}/"]`)).toBeVisible();
  await page.locator('.home-purchases a[href="/shop/lifetime/"]').click();
  await expect(page.locator('[data-fortune-product]')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('.shop-price')).toContainText('990');
});
for (const product of ['tojeong', 'lifetime', 'compatibility']) test(`${product}: 정보 입력에서 서버 미리보기·주문 확인까지, 결제 미설정 시 구매 차단`, async ({ page }) => {
  await page.goto(`/shop/${product}/`);
  await expect(page.locator('[data-fortune-product]')).toHaveAttribute('data-ready', 'true');
  await fillPerson(page, 'a');
  if (product === 'compatibility') await fillPerson(page, 'b', '1991');
  if (product === 'tojeong') { await expect(page.locator('.field-gender')).toHaveCount(0); await expect(page.locator('.field-time')).toHaveCount(0); }
  await page.locator('#purchase-privacy').check();
  await page.getByRole('button', { name: '미리보기·주문 확인', exact: true }).click();
  await expect(page.locator('[data-purchase-review]')).toBeVisible();
  await expect(page.locator('[data-preview-summary]')).not.toBeEmpty();
  await expect(page.locator('#purchase-form')).toBeHidden();
  await expect(page.locator('[data-purchase-download]')).toHaveCount(0);
  await page.locator('#purchase-confirm').check();
  await expect(page.locator('[data-purchase-pay]')).toBeDisabled();
  await page.getByRole('button', { name: '입력 정보 수정' }).click();
  await expect(page.locator('#a-y')).toHaveValue('1990');
  await expect(page.locator('#a-y')).toBeFocused();
});
test('개인정보 동의와 존재하지 않는 날짜는 미리보기 전에 안내한다', async ({ page }) => {
  await page.goto('/shop/lifetime/');
  await expect(page.locator('[data-fortune-product]')).toHaveAttribute('data-ready', 'true');
  await page.getByRole('button', { name: '미리보기·주문 확인', exact: true }).click();
  await expect(page.locator('[data-purchase-error]')).toContainText('동의');
  await fillPerson(page, 'a'); await page.locator('#a-m').selectOption('2'); await page.locator('#a-d').selectOption('31');
  await page.locator('#purchase-privacy').check();
  await page.getByRole('button', { name: '미리보기·주문 확인', exact: true }).click();
  await expect(page.locator('[data-purchase-error]')).toContainText('없습니다');
  await expect(page.locator('[data-purchase-review]')).toBeHidden();
});
test('모의 승인: 서버가 돌려준 파일만 결과에 표시하고 동일 파일을 다운로드한다', async ({ page }) => {
  const html = '<!doctype html><html lang="ko"><title>구매 운세</title><h1>검증된 상세 풀이</h1><p>음력 12월 풀이</p></html>';
  await page.route(`**/api/commerce/orders/${orderId}`, route => route.fulfill({ json: { id: orderId, status: 'PAID', title: '구매 운세', amount: 990 } }));
  await page.route(`**/api/commerce/orders/${orderId}/report*`, route => route.fulfill({ status: 200, contentType: 'text/html', headers: route.request().url().includes('download=1') ? { 'content-disposition': 'attachment; filename="fortune-test.html"' } : {}, body: html }));
  await page.goto(`/shop/result/?orderId=${orderId}`);
  await expect(page.locator('[data-purchase-result-status]')).toContainText('구매가 완료');
  await expect(page.frameLocator('[data-purchase-report]').getByRole('heading', { name: '검증된 상세 풀이' })).toBeVisible();
  const downloaded = page.waitForEvent('download'); await page.locator('[data-purchase-download]').click();
  expect((await downloaded).suggestedFilename()).toBe('fortune-test.html');
});
test('미승인 주문에는 상세 풀이와 다운로드 버튼을 열지 않는다', async ({ page }) => {
  await page.route(`**/api/commerce/orders/${orderId}`, route => route.fulfill({ json: { id: orderId, status: 'PENDING', title: '승인 대기', amount: 990, canPay: false } }));
  await page.goto(`/shop/result/?orderId=${orderId}`);
  await expect(page.locator('[data-purchase-result-status]')).toContainText('완료되지');
  await expect(page.locator('[data-purchase-download]')).toBeHidden();
  await expect(page.locator('[data-purchase-report]')).toBeHidden();
});
test('320px에서도 상품 선택과 궁합 입력이 가로로 넘치지 않는다', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const url of ['/shop/', '/shop/compatibility/']) {
    await page.goto(url);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});
