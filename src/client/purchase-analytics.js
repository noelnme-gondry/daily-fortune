import { track } from './analytics.js';
import { fortuneProduct } from '../domain/fortune-products.js';
import { observeView } from './view-tracking.js';
import { NICEPAY_PAYMENT_METHODS } from '../domain/payment-methods.js';

const sent = new Set();
const item = product => ({ item_id: product.id, item_name: product.name, item_category: '프리미엄 운세', price: product.price, quantity: 1 });
// 경로에 대응하는 독립 조회 이벤트. 언어·연도가 바뀌어도 상품별 시계열을 유지한다.
export function trackShopPage(path = location.pathname) {
  const base = path.replace(/^\/en(?=\/)/, '');
  if (base === '/shop/') return track('view_shop');
  const annual = /^\/year\/(\d{4})\/premium\/$/.exec(base);
  if (annual) return track('view_annual', { reading_year: Number(annual[1]) });
  const match = /^\/(?:shop\/)?(tojeong|compatibility|lifetime)\/$/.exec(base);
  if (match) return track(`view_${match[1]}`);
}

export function trackCommerceStep(event, productId, method) {
  const product = fortuneProduct(productId);
  const paymentType = NICEPAY_PAYMENT_METHODS.find(m => m.id === method)?.id;
  if (product && ['view_item', 'begin_checkout', 'payment_attempt', 'add_payment_info'].includes(event)) track(event, {
    commerce_version: '2', currency: product.currency, value: product.price, items: [item(product)], ...(paymentType ? { payment_type: paymentType } : {}),
  });
}
export function trackCheckoutError(productId, stage, errorCode) {
  const product = fortuneProduct(productId);
  // 수신한 오류 메시지·입력값·주문번호를 진단 이벤트에 포함하지 않는다.
  const stages = ['configuration', 'preview', 'order_create', 'sdk_load', 'payment_prepare', 'payment_window', 'payment_return', 'report_load'];
  const codes = ['consent_required', 'http_4xx', 'http_5xx', 'request_failed', 'provider_error', 'provider_check_required'];
  if (stages.includes(stage) && codes.includes(errorCode)) track('purchase_error', {
    commerce_version: '2', checkout_stage: stage, error_code: errorCode, ...(product ? { items: [item(product)] } : {}),
  });
}

const listIds = ['home_reports', 'shop_catalog', 'reading_footer'];
const listViews = new Set();
let stops = [], listening = false;
function listParams(card) {
  const product = fortuneProduct(card.dataset.commerceItem), list = card.dataset.commerceList;
  return product && listIds.includes(list) ? { commerce_version: '2', item_list_id: list, items: [{ ...item(product), item_list_id: list }] } : null;
}
export function initCommerceLists() {
  stops.forEach(stop => stop?.());
  stops = [];
  for (const card of document.querySelectorAll('[data-commerce-item]')) {
    const params = listParams(card), cta = card.querySelector('[data-commerce-select]');
    if (params && cta) stops.push(observeView(cta, 'view_item_list', listViews, params, `${location.pathname}:${params.item_list_id}:${card.dataset.commerceItem}`));
  }
  if (listening) return;
  listening = true;
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-commerce-select]'), card = link?.closest('[data-commerce-item]');
    const params = card && listParams(card);
    if (params) track('select_item', params);
  });
}
// 보고서 권한 재검증 후 호출한다. 테스트 주문·미결제·개인화 제목은 매출에 보내지 않는다.
export function trackPurchase(order) {
  const product = fortuneProduct(order.productId);
  if (order.mode !== 'live' || order.status !== 'PAID' || !product || order.amount !== product.price || !/^fortune_[a-f0-9-]{36}$/.test(order.id)) return false;
  const key = `myod:purchase:${order.id}`;
  if (sent.has(key)) return false;
  try { if (localStorage.getItem(key) === 'sent') return false; } catch { /* GA4 transaction_id 중복 방지와 메모리 기록을 사용한다. */ }
  if (!track('purchase', { commerce_version: '2', transaction_id: order.id, currency: product.currency, value: order.amount, items: [item(product)] })) return false;
  sent.add(key);
  // 매출과 통화는 표준 purchase 한 건에서만 집계한다.
  track(`purchase_${product.id}`, {
    product_id: product.id,
    ...(Number.isInteger(order.targetYear) ? { reading_year: order.targetYear } : {}),
  });
  try { localStorage.setItem(key, 'sent'); } catch { /* 저장소 접근 제한은 구매에 영향을 주지 않는다. */ }
  return true;
}
