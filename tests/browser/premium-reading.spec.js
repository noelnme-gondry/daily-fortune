import { test, expect } from '@playwright/test';
import { createFortuneReport } from '../../src/server/fortune-report.js';
import { READING_CHAPTERS } from '../../src/domain/premium-reading.js';
import { presentStoredReport } from '../../src/server/premium-report.js';
import { lifeView } from '../../src/client/life-tool.js';
import { buildChart, lifetime, todayKST } from '../../src/engine/index.js';

const today = { y: 2026, m: 11, d: 16 };
const person = { name: '구매 검증', calendar: 'solar', y: 1990, m: 5, d: 17, gender: 'M', noTime: true, timeMode: 'exact' };
const ids = ['tojeong', 'lifetime', 'compatibility', 'annual'];
const report = id => createFortuneReport({ productId: id, people: id === 'compatibility' ? [person, { ...person, name: '두 번째', gender: 'F', y: 1991 }] : [person], targetYear: id === 'annual' ? today.y + 1 : 2026, privacyConsent: true }, today);
async function mockOrder(page, productId, { status = 'PAID', mode = 'live', reportStatus = 200, html } = {}) {
  const r = report(productId), id = `fortune_00000000-0000-4000-8000-00000000000${ids.indexOf(productId) + 1}`;
  const order = { id, productId, status, mode, amount: 990, targetYear: r.normalized.targetYear, title: r.title, canPay: false };
  await page.route(`**/api/commerce/orders/${id}`, route => route.fulfill({ json: order }));
  await page.route(`**/api/commerce/orders/${id}/report`, route => route.fulfill(reportStatus === 200 ? { contentType: 'text/html', body: html || r.html } : { status: reportStatus, json: { message: '결제 확인이 필요합니다.' } }));
  await page.goto(`/shop/result/?orderId=${id}`);
  return id;
}
test.beforeEach(async ({ context }) => {
  await context.route('https://**/*', route => route.abort());
  await context.addInitScript(() => { window.commerceEvents = []; window.gtag = (...args) => window.commerceEvents.push(args); });
});
for (const productId of ids) for (const colorScheme of ['light', 'dark']) test(`${productId} ${colorScheme}: 실제 구매 화면·박스 구성·목차·펼침·높이·오프라인·GA`, async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme });
  await page.goto(productId === 'annual' ? `/year/${todayKST().y + 1}/premium/` : `/shop/${productId}/`);
  await expect(page.locator('.shop-contents .reading-contents-cell')).toHaveCount(READING_CHAPTERS[productId].length);
  await expect(page.locator('.shop-contents img')).toHaveCount(0);
  const orderId = await mockOrder(page, productId);
  await expect(page.locator('[data-purchase-result-status]')).toHaveText('구매가 완료되었습니다.');
  const frame = page.frameLocator('[data-purchase-report]');
  await expect(frame.locator('body')).toHaveClass('report-embedded');
  await expect(frame.locator('.reading-cover')).toBeHidden();
  await expect(frame.locator('.reading-chapter')).toHaveCount(READING_CHAPTERS[productId].length);
  const colors = await page.locator('[data-purchase-report]').evaluate(el => ({ outer: window.getComputedStyle(document.body).backgroundColor, inner: el.contentWindow.getComputedStyle(el.contentDocument.body).backgroundColor }));
  expect(colors.inner).toBe(colors.outer);
  const fold = frame.locator('.reading-fold').nth(await frame.locator('.reading-fold').evaluateAll(els => els.findIndex(el => !el.open)));
  const before = await page.locator('[data-purchase-report]').evaluate(el => el.clientHeight);
  await fold.locator('summary').click();
  await expect(fold).toHaveAttribute('open', '');
  await expect.poll(() => page.locator('[data-purchase-report]').evaluate(el => el.clientHeight)).toBeGreaterThan(before + 20);
  await fold.locator('summary').click();
  await expect.poll(() => page.locator('[data-purchase-report]').evaluate(el => el.clientHeight)).toBeLessThan(before + 20);
  await frame.getByRole('link', { name: '풀이를 읽고 난 뒤', exact: true }).click();
  await expect(frame.locator('#reading-closing')).toBeFocused();
  const top = await page.locator('[data-purchase-report]').evaluate(el => el.getBoundingClientRect().top + el.contentDocument.querySelector('#reading-closing').getBoundingClientRect().top);
  expect(Math.abs(top - 16)).toBeLessThan(4);
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    expect(await frame.locator('html').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    if (width === 320) {
      expect(await frame.locator('.download-report').evaluate(el => parseFloat(window.getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(18);
      for (const link of await frame.locator('.reading-toc a').all()) {
        expect(await link.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(48);
        expect(await link.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      }
      if (productId === 'compatibility') {
        await frame.locator('#reading-years .reading-fold > summary').first().click();
        const table = frame.locator('.reading-table-wrap[role="region"]');
        await table.scrollIntoViewIfNeeded();
        const firstColumn = table.locator('tbody th').first();
        const beforeX = (await firstColumn.boundingBox()).x;
        await table.focus();
        await table.press('ArrowRight', { delay: 150 });
        await expect.poll(() => table.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
        expect(Math.abs((await firstColumn.boundingBox()).x - beforeX)).toBeLessThan(2);
      }
    }
  }
  const events = await page.evaluate(() => window.commerceEvents.filter(e => e[1] === 'purchase'));
  expect(events).toHaveLength(1);
  const specific = await page.evaluate(id => window.commerceEvents.filter(e => e[1] === `purchase_${id}`), productId);
  expect(specific).toHaveLength(1);
  expect(specific[0][2]).not.toHaveProperty('value');
  if (productId === 'annual') expect(specific[0][2].reading_year).toBe(today.y + 1);
  expect(events[0][2]).toMatchObject({ transaction_id: orderId, value: 990, currency: 'KRW', items: [{ item_id: productId, quantity: 1 }] });
  expect(JSON.stringify(events)).not.toContain(person.name);
  await page.reload();
  await expect(page.locator('[data-purchase-download]')).toBeVisible();
  expect(await page.evaluate(() => window.commerceEvents.filter(e => e[1] === 'purchase'))).toHaveLength(0);
  // HTML 파일은 서버나 스크립트 없이도 목차와 상세 해설을 제공한다.
  const offline = await context.newPage();
  await offline.setContent(report(productId).html);
  await expect(offline.locator('.reading-cover')).toBeVisible();
  const detail = offline.locator('.reading-fold').nth(await offline.locator('.reading-fold').evaluateAll(els => els.findIndex(el => !el.open)));
  await detail.locator('summary').click(); await expect(detail).toHaveAttribute('open', '');
  await offline.close();
});
for (const status of ['PENDING', 'REVIEW', 'CANCELLED']) test(`${status}: 결과 화면에서 구매 이벤트와 본문을 열지 않는다`, async ({ page }) => {
  await mockOrder(page, 'lifetime', { status });
  await expect(page.locator('[data-purchase-report]')).toBeHidden();
  await expect(page.locator('[data-purchase-result-status]')).toHaveText('결제가 완료되지 않았습니다.');
  expect(await page.evaluate(() => window.commerceEvents.filter(e => e[1] === 'purchase'))).toHaveLength(0);
});
test('테스트 결제와 보고서 권한 재검증 실패는 매출로 기록하지 않는다', async ({ page }) => {
  await mockOrder(page, 'tojeong', { mode: 'sandbox' });
  await expect(page.locator('[data-purchase-download]')).toBeVisible();
  expect(await page.evaluate(() => window.commerceEvents.filter(e => e[1] === 'purchase'))).toHaveLength(0);
  await mockOrder(page, 'lifetime', { reportStatus: 402 });
  await expect(page.locator('[data-purchase-error]')).toHaveText('결제 확인이 필요합니다.');
  await expect(page.locator('[data-purchase-download]')).toBeHidden();
  expect(await page.evaluate(() => window.commerceEvents.filter(e => e[1] === 'purchase'))).toHaveLength(0);
});
test('기존 사주 구매: 숨겨졌던 연도별 근거가 실제 읽기 화면에서 열린다', async ({ page }) => {
  const c = buildChart(person), body = lifeView(lifetime(c, today), c, today);
  const html = presentStoredReport({ productId: 'lifetime', title: '기존 구매', html: `<html><main class="download-report"><header>풀이 기준일 2026-11-16</header>${body}</main></html>` });
  await mockOrder(page, 'lifetime', { html });
  const frame = page.frameLocator('[data-purchase-report]');
  const detail = frame.locator('details[id^="life-event-"]').first();
  await detail.locator('summary').click();
  await expect(detail).toContainText('목록에 표시된 이유');
  await expect(detail.locator('.life-event-body')).toBeVisible();
  await expect(frame.locator('#reading-closing')).toContainText('신강·신약');
});
