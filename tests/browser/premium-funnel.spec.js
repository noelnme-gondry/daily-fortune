import { test, expect } from '@playwright/test';
import { todayKST } from '../../src/engine/core.js';

const orderId = 'fortune_00000000-0000-4000-8000-000000000011';
const events = (page, name) => page.evaluate(name => window.funnelEvents.filter(e => e[1] === name).map(e => e[2]), name);
test.beforeEach(async ({ context, page }) => {
  await context.route('https://**/*', route => route.abort());
  await page.addInitScript(() => {
    window.funnelEvents = [];
    window.gtag = (...args) => window.funnelEvents.push(args);
    window.AUTHNICE = { requestPay(p) { p.fnError({ message: 'private provider response' }); } };
  });
  await page.route('**/api/commerce/config', route => route.fulfill({ json: { enabled: true, mode: 'sandbox', methods: ['card'] } }));
});
async function preview(page, product = 'lifetime') {
  await page.goto(product === 'annual' ? `/year/${todayKST().y + 1}/premium/` : `/${product}/`);
  await expect(page.locator('[data-fortune-product]')).toHaveAttribute('data-ready', 'true');
  for (const who of product === 'compatibility' ? ['a', 'b'] : ['a']) {
    await page.locator(`#${who}-name`).fill('비공개테스트');
    await page.locator(`#${who}-y`).fill('1990');
    await page.locator(`#${who}-m`).selectOption('5');
    await page.locator(`#${who}-d`).selectOption('17');
    if (product !== 'tojeong') await page.locator(`[name="${who}-gender"][value="F"]`).check();
  }
  await page.locator('#purchase-privacy').check();
  await page.getByRole('button', { name: '미리보기·주문 확인', exact: true }).click();
  await expect(page.locator('[data-purchase-review]')).toBeVisible();
}
for (const width of [320, 390, 768, 1440]) test(`${width}px: 콘텐츠의 목차 박스는 관련 상품으로 연결되고 노출·선택을 구분한다`, async ({ page }) => {
  await page.setViewportSize({ width, height: 800 });
  for (const [path, product] of [['/tti/today/rat/', 'lifetime'], ['/tti/compatibility/', 'compatibility'], [`/tti/${todayKST().y}/rat/`, 'tojeong'], ['/en/saju/ilju/eulchuk/', 'lifetime']]) {
    await page.goto(path);
    const card = page.locator('.premium-entry'), link = card.locator('[data-commerce-select]');
    await expect(card).toHaveCount(1);
    await expect(card.locator('li')).toHaveCount(3);
    await expect(link).toHaveAttribute('href', `${path.startsWith('/en/') ? '/en' : ''}/${product}/`);
    expect(await events(page, 'view_item_list')).toHaveLength(0);
    await link.scrollIntoViewIfNeeded();
    await expect.poll(() => events(page, 'view_item_list')).toHaveLength(1);
    await page.evaluate(async () => (await import('/src/client/purchase-analytics.js')).initCommerceLists());
    expect(await events(page, 'view_item_list')).toHaveLength(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    // Preserve this page's event buffer while inspecting the click payload.
    await link.evaluate(el => el.addEventListener('click', e => e.preventDefault(), { once: true }));
    await link.click();
    expect(await events(page, 'select_item')).toMatchObject([{ item_list_id: 'reading_footer', items: [{ item_id: product, price: 990 }] }]);
    expect(JSON.stringify(await events(page, 'select_item'))).not.toContain('source');
  }
});
test('띠별 SPA 메뉴 이동에서도 추천 상품과 노출의 페이지 경로가 갱신된다', async ({ page }) => {
  await page.goto('/tti/today/rat/');
  await page.locator('.premium-entry [data-commerce-select]').scrollIntoViewIfNeeded();
  await expect.poll(() => events(page, 'view_item_list')).toHaveLength(1);
  await page.locator(`.tti-nav a[href="/tti/${todayKST().y}/"]`).click();
  await expect(page.locator('.premium-entry')).toHaveAttribute('data-commerce-item', 'tojeong');
  await page.locator('.premium-entry [data-commerce-select]').scrollIntoViewIfNeeded();
  await expect.poll(() => events(page, 'view_item_list')).toHaveLength(2);
  expect((await events(page, 'view_item_list'))[1].page_path).toBe(`/tti/${todayKST().y}/`);
});
test('모바일 상품 목록은 읽을 크기의 목차와 넓은 구매 버튼을 제공한다', async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/shop/');
    for (const card of await page.locator('.fortune-product').all()) {
      const metrics = await card.evaluate(el => {
        const button = el.querySelector('.btn'), s = window.getComputedStyle(el), b = button.getBoundingClientRect();
        return { buttonWidth: b.width, buttonHeight: b.height, contentWidth: el.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight), size: parseFloat(window.getComputedStyle(el.querySelector('.reading-contents-cell strong')).fontSize) };
      });
      expect(metrics.buttonWidth).toBeCloseTo(metrics.contentWidth, 0);
      expect(metrics.buttonHeight).toBeGreaterThanOrEqual(52);
      expect(metrics.size).toBeGreaterThanOrEqual(16);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await preview(page);
    const pay = page.locator('[data-purchase-pay]');
    expect(await pay.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(52);
    expect(await pay.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  }
});
test('개인 무료 결과를 계산한 뒤에만 프리미엄 박스를 제공한다', async ({ page }) => {
  await page.goto('/today/');
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('.premium-entry')).toHaveCount(0);
  await page.locator('#a-y').fill('1990');
  await page.locator('#a-m').selectOption('5');
  await page.locator('#a-d').selectOption('17');
  await page.locator('[name="a-gender"][value="F"]').check();
  await page.locator('#tool-form [type=submit]').click();
  await expect(page.locator('#result .premium-entry')).toHaveCount(1);
  await expect(page.locator('#reading-summary')).toBeInViewport();
  await page.locator('.premium-entry [data-commerce-select]').scrollIntoViewIfNeeded();
  await expect.poll(() => events(page, 'view_item_list')).toHaveLength(1);
});
for (const product of ['tojeong', 'lifetime', 'compatibility', 'annual']) test(`${product}: 미리보기·결제 시도·PG 전달·오류는 별개이고 매출을 만들지 않는다`, async ({ page }) => {
  await page.route('**/api/commerce/orders', route => route.fulfill({ json: { id: orderId, status: 'PENDING' } }));
  await page.route(`**/api/commerce/orders/${orderId}/payment`, route => route.fulfill({ json: { orderId, method: 'card', amount: 990 } }));
  await preview(page, product);
  expect(await events(page, 'view_item')).toHaveLength(1);
  expect(await events(page, `view_${product}`)).toHaveLength(1);
  expect(await events(page, 'begin_checkout')).toHaveLength(1);
  expect(await events(page, 'payment_attempt')).toHaveLength(0);
  expect(await events(page, 'add_payment_info')).toHaveLength(0);
  await page.locator('#purchase-confirm').check();
  await page.locator('[data-purchase-pay]').click();
  await expect(page.locator('[data-purchase-error]')).toBeVisible();
  expect(await events(page, 'payment_attempt')).toMatchObject([{ payment_type: 'card', items: [{ item_id: product }] }]);
  expect(await events(page, 'add_payment_info')).toHaveLength(1);
  expect(await events(page, 'purchase_error')).toMatchObject([{ checkout_stage: 'payment_window', error_code: 'provider_error' }]);
  expect(await events(page, 'purchase')).toHaveLength(0);
  expect(JSON.stringify(await page.evaluate(() => window.funnelEvents))).not.toMatch(/비공개테스트|private provider response|1990|fortune_000/);
});
for (const stage of ['order_create', 'payment_prepare']) test(`${stage}: HTTP 오류 단계는 한 번만 기록되고 SDK 전달 전에 멈춘다`, async ({ page }) => {
  await page.route('**/api/commerce/orders', route => route.fulfill(stage === 'order_create' ? { status: 503, json: { message: 'private order failure' } } : { json: { id: orderId, status: 'PENDING' } }));
  await page.route(`**/api/commerce/orders/${orderId}/payment`, route => route.fulfill({ status: 409, json: { message: 'private payment failure' } }));
  await preview(page);
  await page.locator('#purchase-confirm').check();
  await page.locator('[data-purchase-pay]').click();
  await expect(page.locator('[data-purchase-error]')).toBeVisible();
  expect(await events(page, 'purchase_error')).toMatchObject([{ checkout_stage: stage, error_code: stage === 'order_create' ? 'http_5xx' : 'http_4xx' }]);
  expect(await events(page, 'purchase_error')).toHaveLength(1);
  expect(await events(page, 'add_payment_info')).toHaveLength(0);
});
test('PG 반환 후 확인이 필요한 주문은 결제 완료가 아닌 진단으로 기록한다', async ({ page }) => {
  await page.route('**/api/commerce/orders', route => route.fulfill({ json: [] }));
  await page.goto('/shop/orders/?payment=check');
  await expect(page.locator('[data-purchase-error]')).toBeVisible();
  expect(await events(page, 'purchase_error')).toMatchObject([{ checkout_stage: 'payment_return', error_code: 'provider_check_required' }]);
  expect(await events(page, 'purchase_error')).toHaveLength(1);
  expect(await events(page, 'purchase')).toHaveLength(0);
});
test('내부 계산 source를 획득 소스로 보내지 않고 정상 캠페인 값은 유지한다', async ({ page }) => {
  await page.goto('/today/');
  await page.evaluate(async () => {
    const { track } = await import('/src/client/analytics.js');
    for (const source of ['form', 'saved', 'sample', 'shared_result']) track('calc_result', { source });
    track('test_campaign', { source: 'newsletter' });
  });
  const result = await events(page, 'calc_result');
  expect(result).toHaveLength(4);
  for (const params of result) { expect(params).not.toHaveProperty('source'); expect(params).toHaveProperty('calc_origin'); }
  expect(await events(page, 'test_campaign')).toMatchObject([{ source: 'newsletter' }]);
});

test('상점 조회와 내년 무료 운세의 유료 진입은 각 경로에서 한 번만 기록한다', async ({ page }) => {
  const year = todayKST().y + 1;
  await page.goto('/shop/');
  await expect.poll(() => events(page, 'view_shop')).toHaveLength(1);
  await page.goto(`/year/${year}/`);
  expect(await events(page, 'view_annual')).toEqual([]);
  await page.locator('.reading-entry a').filter({ hasText: '프리미엄' }).click();
  await expect(page).toHaveURL(new RegExp(`/year/${year}/premium/$`));
  await expect.poll(() => events(page, 'view_annual')).toMatchObject([{ reading_year: year }]);
  expect(await events(page, 'view_shop')).toEqual([]);
});
