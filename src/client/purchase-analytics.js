import { track } from './analytics.js';
import { fortuneProduct } from '../domain/fortune-products.js';

const sent = new Set();
const item = product => ({ item_id: product.id, item_name: product.name, item_category: '프리미엄 운세', price: product.price, quantity: 1 });
export function trackCommerceStep(event, productId) {
  const product = fortuneProduct(productId);
  if (product && ['view_item', 'begin_checkout'].includes(event)) track(event, { currency: product.currency, value: product.price, items: [item(product)] });
}
// 보고서 권한 재검증 후 호출한다. 테스트 주문·미결제·개인화 제목은 매출에 보내지 않는다.
export function trackPurchase(order) {
  const product = fortuneProduct(order.productId);
  if (order.mode !== 'live' || order.status !== 'PAID' || !product || order.amount !== product.price || !/^fortune_[a-f0-9-]{36}$/.test(order.id)) return false;
  const key = `myod:purchase:${order.id}`;
  if (sent.has(key)) return false;
  try { if (localStorage.getItem(key) === 'sent') return false; } catch { /* GA4 transaction_id 중복 방지와 메모리 기록을 사용한다. */ }
  if (!track('purchase', { transaction_id: order.id, currency: product.currency, value: order.amount, items: [item(product)] })) return false;
  sent.add(key);
  try { localStorage.setItem(key, 'sent'); } catch { /* 저장소 접근 제한은 구매에 영향을 주지 않는다. */ }
  return true;
}
