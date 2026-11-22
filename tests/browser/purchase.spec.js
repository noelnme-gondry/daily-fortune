import { test, expect } from '@playwright/test';

const orderId = 'fortune_00000000-0000-4000-8000-000000000001';
const methods = ['card', 'naverpayCard', 'kakaopay'];
test.beforeEach(async ({ page }) => {
  // 회귀 검증이 실제 결제 상점 설정에 영향을 주지 않도록 공개 설정만 고정한다.
  await page.route('**/api/commerce/config', route => route.fulfill({ json: { enabled: false, mode: 'sandbox', methods } }));
});
async function mockCheckout(page, enabledMethods = methods) {
  await page.route('**/api/commerce/config', route => route.fulfill({ json: { enabled: true, mode: 'sandbox', methods: enabledMethods } }));
  await page.addInitScript(() => {
    window.AUTHNICE = { requestPay(p) { window.__nicepayRequested = { method: p.method, amount: p.amount, orderId: p.orderId }; p.fnError(); } };
  });
  await page.route('**/api/commerce/orders', route => route.fulfill({ json: { id: orderId, status: 'PENDING', amount: 990 } }));
  await page.route(`**/api/commerce/orders/${orderId}/payment`, route => route.fulfill({ json: { clientId: 'S2_browser_test', method: route.request().postDataJSON().method, amount: 990, orderId, goodsName: '운세 평생 사주', returnUrl: 'http://127.0.0.1:4176/api/commerce/nicepay/return' } }));
}
async function fillPerson(page, who, year = '1990') {
  await page.locator(`#${who}-y`).fill(year);
  await page.locator(`#${who}-m`).selectOption('5');
  await page.locator(`#${who}-d`).selectOption('17');
  const gender = page.locator(`[name="${who}-gender"][value="F"]`);
  if (await gender.count()) await gender.check();
}
test('홈 상품군은 네 개이고 각각 990원 단건 구매 경로로 연결된다', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('.home-purchases .fortune-product');
  await expect(cards).toHaveCount(4);
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
  await page.getByRole('button', { name: '운세보기', exact: true }).click();
  await expect(page.locator('[data-purchase-review]')).toBeVisible();
  await page.locator('[data-preview-options] summary').click();
  await page.locator('[data-preview-request]').click();
  await expect(page.locator('[data-preview-summary]')).not.toBeEmpty();
  await expect(page.locator('#purchase-form')).toBeHidden();
  await expect(page.locator('[data-purchase-download]')).toHaveCount(0);
  await expect(page.locator('[data-purchase-pay]')).toBeDisabled();
  await page.getByRole('button', { name: '대상 수정' }).click();
  await expect(page.locator('#a-y')).toHaveValue('1990');
  await expect(page.locator('[data-purchase-person="a"] summary').first()).toBeFocused();
});
test('누락·존재하지 않는 날짜는 대상 확정 전에 안내한다', async ({ page }) => {
  await page.goto('/shop/lifetime/');
  await expect(page.locator('[data-fortune-product]')).toHaveAttribute('data-ready', 'true');
  await page.getByRole('button', { name: '운세보기', exact: true }).click();
  await expect(page.locator('[data-purchase-error]')).toContainText('생년월일');
  await fillPerson(page, 'a'); await page.locator('#a-m').selectOption('2'); await page.locator('#a-d').selectOption('31');
  await page.getByRole('button', { name: '운세보기', exact: true }).click();
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

for (const method of methods) test(`${method}: 선택한 결제수단이 서버 요청과 NICEPAY 호출까지 유지된다`, async ({ page }) => {
  await mockCheckout(page);
  await page.goto('/shop/lifetime/');
  await expect(page.locator('[data-fortune-product]')).toHaveAttribute('data-ready', 'true');
  await fillPerson(page, 'a');
  await page.getByRole('button', { name: '운세보기', exact: true }).click();
  await expect(page.getByLabel('결제수단', { exact: true }).locator('option')).toHaveCount(3);
  await page.getByLabel('결제수단', { exact: true }).selectOption(method);
  const button = page.getByRole('button', { name: '동의하고 990원 결제하기', exact: true });
  await expect(button).toBeEnabled();
  const requested = page.waitForRequest(r => r.url().endsWith(`/orders/${orderId}/payment`));
  await button.click();
  expect((await requested).postDataJSON()).toEqual({ method });
  await expect.poll(() => page.evaluate(() => window.__nicepayRequested)).toEqual({ method, amount: 990, orderId });
  await expect(button).toBeEnabled();
});

test('미결제 주문도 설정된 간편결제만 표시하고 다른 수단으로 다시 시도한다', async ({ page }) => {
  await mockCheckout(page, ['naverpayCard', 'kakaopay']);
  await page.route(`**/api/commerce/orders/${orderId}`, route => route.fulfill({ json: { id: orderId, status: 'PENDING', amount: 990, title: '평생 사주', canPay: true } }));
  await page.goto(`/shop/result/?orderId=${orderId}`);
  const select = page.getByLabel('결제수단', { exact: true });
  await expect(select.locator('option')).toHaveCount(2);
  await expect(select).toHaveValue('naverpayCard');
  await select.selectOption('kakaopay');
  await page.getByRole('button', { name: '990원 결제 다시 시도', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__nicepayRequested)).toEqual({ method: 'kakaopay', amount: 990, orderId });
  await expect(select).toBeEnabled();
});
