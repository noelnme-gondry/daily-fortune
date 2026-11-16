import { createHash, timingSafeEqual } from 'node:crypto';
import path from 'node:path';
import { PurchaseError } from './fortune-report.js';

export const sha256 = value => createHash('sha256').update(value).digest('hex');
export function matchesSignature(actual, expected) {
  return typeof actual === 'string' && /^[a-f0-9]{64}$/i.test(actual) && timingSafeEqual(Buffer.from(actual.toLowerCase(), 'hex'), Buffer.from(expected, 'hex'));
}
export function nicepayConfig(env = process.env) {
  const mode = env.NICEPAY_MODE || 'sandbox';
  let origin = '';
  try { const url = new URL(env.SITE_URL); if (url.protocol === 'https:' || (mode === 'sandbox' && url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) origin = url.origin; } catch { /* 설정 전에는 구매 불가 */ }
  const clientId = env.NICEPAY_CLIENT_ID || '', secretKey = env.NICEPAY_SECRET_KEY || '';
  const databaseConfigured = !!env.DATABASE_URL;
  let databaseUrl = '';
  try { const u = new URL(env.DATABASE_URL); if (['postgres:', 'postgresql:'].includes(u.protocol) && u.hostname) databaseUrl = env.DATABASE_URL; } catch { /* 잘못된 DB URL은 파일 저장으로 우회하지 않는다. */ }
  const directory = typeof env.FORTUNE_ORDERS_DIR === 'string' && path.isAbsolute(env.FORTUNE_ORDERS_DIR) ? env.FORTUNE_ORDERS_DIR : '';
  const storageReady = databaseConfigured ? !!databaseUrl : !!directory;
  const approvalModel = (env.NICEPAY_APPROVAL_MODEL || 'server').toLowerCase();
  const provider = (env.PAYMENTS_PROVIDER || 'nicepay').toLowerCase();
  const cardAllowed = (env.NICEPAY_METHODS || 'card').split(',').map(m => m.trim().toLowerCase()).includes('card');
  const liveAllowed = mode !== 'live' || ['true', '1'].includes(env.PAYMENTS_LIVE_ENABLED);
  const enabled = ['sandbox', 'live'].includes(mode) && !!clientId && !!secretKey && !!origin && storageReady && approvalModel === 'server' && provider === 'nicepay' && cardAllowed && liveAllowed;
  return { enabled, mode, origin, clientId, secretKey, directory: databaseConfigured ? '' : directory, databaseUrl, base: mode === 'live' ? 'https://api.nicepay.co.kr' : 'https://sandbox-api.nicepay.co.kr' };
}
export function createNicepayGateway(config, fetcher = fetch) {
  async function call(path, body) {
    const response = await fetcher(`${config.base}/v1/payments${path}`, { method: body ? 'POST' : 'GET', headers: { Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.secretKey}`).toString('base64')}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(15000) });
    const data = await response.json();
    if (!response.ok || data.resultCode !== '0000') throw new PurchaseError('결제 상태를 확인하지 못했습니다. 구매 보관함에서 다시 확인해 주세요.', 502);
    return data;
  }
  return {
    approve: (tid, amount) => call(`/${encodeURIComponent(tid)}`, { amount }),
    lookup: tid => call(`/${encodeURIComponent(tid)}`),
    netCancel: orderId => call('/netcancel', { orderId }),
  };
}
export function verifyNicepayPayment(payment, order, config) {
  if (payment.tid !== order.tid || payment.orderId !== order.id || payment.amount !== order.amount || payment.currency !== 'KRW' || !matchesSignature(payment.signature, sha256(`${payment.tid}${payment.amount}${payment.ediDate}${config.secretKey}`))) throw new PurchaseError('결제 정보가 주문과 일치하지 않습니다.', 409);
  return payment.status === 'paid' && payment.balanceAmt === order.amount;
}
