import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Duplex } from 'node:stream';
import { IncomingMessage, ServerResponse } from 'node:http';
import { createOrderStore, createCommerceService, createCommerceRouter } from '../src/server/fortune-commerce.js';
import { createFortuneReport } from '../src/server/fortune-report.js';
import { nicepayConfig, createNicepayGateway, sha256, verifyNicepayPayment } from '../src/server/nicepay.js';
import { FORTUNE_PRODUCTS } from '../src/domain/fortune-products.js';
import { createSite } from '../src/site/render.js';

const person = { name: '테스트', calendar: 'solar', y: 1990, m: 5, d: 17, gender: 'M', noTime: true, timeMode: 'exact' };
const input = (productId = 'lifetime') => ({ productId, people: productId === 'compatibility' ? [person, { ...person, name: '상대', gender: 'F', y: 1991 }] : [person], targetYear: 2026, privacyConsent: true, purchaseConsent: true, amount: 1 });
async function fixture(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'fortune-commerce-test-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const config = { enabled: true, mode: 'sandbox', origin: 'https://fortune.example', clientId: 'S2_test_only', secretKey: 'unit-test-key', directory: dir, methods: ['card', 'naverpayCard', 'kakaopay'] };
  const store = createOrderStore(dir), payments = new Map();
  let approvals = 0, cancellations = 0, failApproval = false, failCancel = false;
  const payment = (order, status = 'ready') => { const p = { resultCode: '0000', tid: 'TEST_TID', orderId: order.id, amount: 990, balanceAmt: status === 'cancelled' ? 0 : 990, currency: 'KRW', ediDate: '2026-11-16T12:00:00+09:00', status }; p.signature = sha256(`${p.tid}${p.amount}${p.ediDate}${config.secretKey}`); return p; };
  const gateway = {
    async lookup(tid) { return payments.get(tid); },
    async approve(tid) { approvals++; if (failApproval) throw new Error('timeout'); const p = { ...payments.get(tid), status: 'paid' }; payments.set(tid, p); return p; },
    async netCancel() { cancellations++; if (failCancel) throw new Error('timeout'); return {}; },
  };
  const service = createCommerceService({ config, store, gateway });
  const order = await service.create(input(), 'owner-a');
  payments.set('TEST_TID', payment(order));
  const auth = { orderId: order.id, tid: 'TEST_TID', amount: '990', clientId: config.clientId, authToken: 'unit-auth', authResultCode: '0000' };
  auth.signature = sha256(`${auth.authToken}${auth.clientId}${auth.amount}${config.secretKey}`);
  return { config, store, service, order, auth, payment, payments, approvals: () => approvals, cancellations: () => cancellations, fail: (cancel = false) => { failApproval = true; failCancel = cancel; } };
}

test('네 상품은 각각 990원 KRW 단건 구매 단위를 갖는다', () => {
  assert.deepEqual(FORTUNE_PRODUCTS.map(p => [p.id, p.price, p.people]), [['tojeong', 990, 1], ['lifetime', 990, 1], ['compatibility', 990, 2], ['annual', 990, 1]]);
  for (const p of FORTUNE_PRODUCTS) assert.equal(p.currency, 'KRW');
});
for (const id of ['tojeong', 'lifetime', 'compatibility']) test(`${id}: 기존 엔진으로 상세 파일을 생성하고 모든 토정 월을 파일에 포함한다`, () => {
  const r = createFortuneReport(input(id), { y: 2026, m: 11, d: 16 });
  assert.ok(r.summary); assert.ok(r.html.startsWith('<!doctype html>')); assert.match(r.html, /Content-Security-Policy/);
  assert.doesNotMatch(r.html, /<script\b/); assert.equal(r.product.price, 990);
  if (id === 'tojeong') for (let month = 1; month <= 12; month++) assert.ok(r.html.includes(`id="tj-month-${month}"`));
  if (id !== 'tojeong') assert.match(r.html, /사주 원국/);
});
test('잘못된 상품·동의 누락·미래 생일·잘못된 시진·잘못된 궁합 인원을 거절한다', () => {
  for (const invalid of [{ ...input(), productId: '__proto__' }, { ...input(), privacyConsent: false }, { ...input(), people: [{ ...person, y: 2099 }] }, { ...input(), people: [{ ...person, noTime: false, timeMode: 'branch', timeBranch: '<invalid>' }] }, { ...input('compatibility'), people: [person] }]) assert.throws(() => createFortuneReport(invalid));
});
test('서버 가격을 사용하고 같은 대상의 반복 주문을 재사용하며 재시작 후에도 보관한다', async t => {
  const f = await fixture(t);
  assert.equal(f.order.amount, 990);
  const duplicates = await Promise.all(Array.from({ length: 4 }, () => f.service.create(input(), 'owner-a')));
  assert.ok(duplicates.every(o => o.id === f.order.id));
  const restarted = createOrderStore(f.config.directory);
  assert.equal((await restarted.get(f.order.id)).html, f.order.html);
});
test('미승인 주문·타인 주문으로 상세 풀이를 받지 못한다', async t => {
  const f = await fixture(t);
  await assert.rejects(f.service.get(f.order.id, 'owner-a', true), e => e.status === 402);
  await assert.rejects(f.service.get(f.order.id, 'owner-b', true), e => e.status === 404);
  assert.deepEqual(await f.service.list('owner-b'), []);
  assert.equal((await f.service.list('owner-a'))[0].html, undefined);
});
test('금액·서명·상점·state 위변조를 승인 전에 차단한다', async t => {
  const f = await fixture(t);
  for (const changed of [{ amount: '1' }, { signature: '0'.repeat(64) }, { clientId: 'other' }, { authResultCode: '9999' }]) await assert.rejects(f.service.callback({ ...f.auth, ...changed }, f.order.state));
  await assert.rejects(f.service.callback(f.auth, 'wrong-state'));
  assert.equal(f.approvals(), 0);
});
test('최초 인증 콜백은 승인 전 거래 조회 없이 POST 승인하고 실제 다운로드까지 연결한다', async t => {
  const f = await fixture(t), calls = [];
  const config = { ...f.config, base: 'https://pg.example' };
  const gateway = createNicepayGateway(config, async (url, options) => {
    calls.push(options.method);
    assert.equal(url, 'https://pg.example/v1/payments/TEST_TID');
    if (options.method === 'GET' && !calls.includes('POST')) return { ok: false, status: 404, json: async () => ({ resultCode: 'U107', resultMsg: '거래내역이 존재 하지 않습니다.' }) };
    if (options.method === 'POST') {
      assert.deepEqual(JSON.parse(options.body), { amount: 990 });
      assert.equal((await f.store.get(f.order.id)).tid, 'TEST_TID');
    }
    return { ok: true, status: 200, json: async () => f.payment(f.order, 'paid') };
  });
  const app = createCommerceRouter({ config, store: f.store, gateway });
  const cookie = `fortune_buyer=${'a'.repeat(64)}`;
  await f.store.put({ ...f.order, owner: sha256('a'.repeat(64)) });
  const callback = await request(app, `/nicepay/return?state=${f.order.state}`, { method: 'POST', external: true, form: true, body: f.auth });
  assert.equal(callback.headers.location, `/shop/result/?orderId=${f.order.id}`);
  assert.deepEqual(calls, ['POST']);
  assert.equal(callback.headers['set-cookie'], undefined);
  const download = await request(app, `/orders/${f.order.id}/report?download=1`, { cookie });
  assert.equal(download.status, 200);
  assert.match(download.text, /<!doctype html>/);
  assert.deepEqual(calls, ['POST', 'GET']);
});
test('기존 거래의 재전송은 PG 주문번호까지 대조하고 다른 거래를 재승인하지 않는다', async t => {
  const f = await fixture(t);
  await f.store.put({ ...f.order, tid: 'TEST_TID' });
  const p = f.payment({ id: 'another-order' }); f.payments.set('TEST_TID', p);
  await assert.rejects(f.service.callback(f.auth, f.order.state));
  assert.equal(f.approvals(), 0);
});
test('정상 승인과 동시 콜백 재전송은 한 번만 청구하고 전체 파일을 연다', async t => {
  const f = await fixture(t);
  const ids = await Promise.all([f.service.callback(f.auth, f.order.state), f.service.callback(f.auth, f.order.state)]);
  assert.deepEqual(ids, [f.order.id, f.order.id]); assert.equal(f.approvals(), 1);
  assert.equal((await f.service.get(f.order.id, 'owner-a', true)).html, f.order.html);
});
test('재시작 후 승인 여부가 불확실한 기존 거래는 콜백으로 재청구하지 않는다', async t => {
  const f = await fixture(t);
  await f.store.put({ ...f.order, tid: 'TEST_TID' });
  await assert.rejects(f.service.callback(f.auth, f.order.state), e => e.status === 409);
  assert.equal(f.approvals(), 0);
  await assert.rejects(f.service.get(f.order.id, 'owner-a', true), e => e.status === 402);
  f.payments.set('TEST_TID', f.payment(f.order, 'paid'));
  assert.equal(await f.service.callback(f.auth, f.order.state), f.order.id);
  assert.equal(f.approvals(), 0);
});
test('최초 승인 응답의 다른 주문·금액·서명·통화는 다운로드 권한을 열지 않는다', async t => {
  for (const changed of [{ orderId: 'another-order' }, { amount: 1 }, { signature: 'bad' }, { currency: 'USD' }]) {
    const f = await fixture(t);
    const invalid = { ...f.payment(f.order, 'paid'), ...changed };
    const service = createCommerceService({ config: f.config, store: f.store, gateway: { approve: async () => invalid, lookup: async () => invalid, netCancel: async () => { throw new Error('unconfirmed cancellation'); } } });
    await assert.rejects(service.callback(f.auth, f.order.state), e => e.status === 409);
    assert.equal((await f.store.get(f.order.id)).status, 'REVIEW');
    await assert.rejects(service.get(f.order.id, 'owner-a', true));
  }
});
test('승인 응답 유실 뒤에는 PG 조회로 복구하고 취소·부분취소 후에는 다운로드를 차단한다', async t => {
  const f = await fixture(t);
  await f.store.put({ ...f.order, tid: 'TEST_TID' });
  f.payments.set('TEST_TID', f.payment(f.order, 'paid'));
  assert.equal((await f.service.get(f.order.id, 'owner-a', true)).status, 'PAID'); assert.equal(f.approvals(), 0);
  f.payments.set('TEST_TID', f.payment(f.order, 'cancelled'));
  await assert.rejects(f.service.get(f.order.id, 'owner-a', true), e => e.status === 402);
  const p = f.payment(f.order, 'partialCancelled'); p.balanceAmt = 900; f.payments.set('TEST_TID', p);
  await assert.rejects(f.service.get(f.order.id, 'owner-a', true), e => e.status === 402);
});
test('승인 시간초과는 망취소를 호출하고 권한을 열지 않는다', async t => {
  const f = await fixture(t); f.fail();
  await assert.rejects(f.service.callback(f.auth, f.order.state));
  assert.equal(f.cancellations(), 1); assert.equal((await f.store.get(f.order.id)).status, 'CANCELLED');
});
test('망취소도 실패하면 확인 필요 상태를 보존한다', async t => {
  const f = await fixture(t); f.fail(true);
  await assert.rejects(f.service.callback(f.auth, f.order.state));
  assert.equal((await f.store.get(f.order.id)).status, 'REVIEW');
});
test('승인은 성공하고 응답만 유실된 경우 재조회로 복구하고 정상 결제를 취소하지 않는다', async t => {
  const f = await fixture(t);
  let cancels = 0;
  const gateway = {
    lookup: async tid => f.payments.get(tid),
    approve: async tid => { f.payments.set(tid, f.payment(f.order, 'paid')); throw new Error('response lost'); },
    netCancel: async () => { cancels++; },
  };
  const service = createCommerceService({ config: f.config, store: f.store, gateway });
  await service.callback(f.auth, f.order.state);
  assert.equal(cancels, 0); assert.equal((await f.store.get(f.order.id)).status, 'PAID');
});
test('승인 응답 서명·통화·금액까지 일치해야 구매 완료다', async t => {
  const f = await fixture(t), order = { ...f.order, tid: 'TEST_TID' }, p = f.payment(f.order, 'paid');
  assert.equal(verifyNicepayPayment(p, order, f.config), true);
  for (const changes of [{ currency: 'USD' }, { amount: 1 }, { signature: 'bad' }, { tid: 'OTHER' }]) assert.throws(() => verifyNicepayPayment({ ...p, ...changes }, order, f.config));
});
test('설정이 없으면 결제는 닫히고 시크릿을 공개 설정에 넣지 않는다', () => {
  assert.equal(nicepayConfig({}).enabled, false);
  assert.equal(nicepayConfig({ NICEPAY_MODE: 'wrong' }).enabled, false);
});
test('기본값과 유료 설정은 구매 흐름이며 명시적 0에서만 이전 계산기로 복구한다', () => {
  const previous = process.env.FORTUNE_PAID_READINGS;
  try {
    for (const setting of [undefined, '1']) {
      if (setting === undefined) delete process.env.FORTUNE_PAID_READINGS;
      else process.env.FORTUNE_PAID_READINGS = setting;
      const s = createSite({ site: 'https://fortune.example', assets: {} });
      for (const id of ['tojeong', 'lifetime', 'compatibility']) assert.match(s.render(`/${id}/`), /data-fortune-product=/);
      assert.match(s.render('/today/'), /id="tool-form"/);
      assert.doesNotMatch(s.render('/shop/result/'), /data-purchase-download[^>]*href=/);
    }
    process.env.FORTUNE_PAID_READINGS = '0';
    const rollback = createSite({ site: 'https://fortune.example', assets: {} });
    assert.match(rollback.render('/tojeong/'), /id="tojeong-form"/);
    assert.match(rollback.render('/lifetime/'), /id="tool-form"/);
    assert.match(rollback.render('/shop/lifetime/'), /data-fortune-product=/);
  } finally { if (previous === undefined) delete process.env.FORTUNE_PAID_READINGS; else process.env.FORTUNE_PAID_READINGS = previous; }
});

// 소켓을 열지 않고 실제 Express 요청·본문 파서·쿠키·응답을 통과시킨다.
async function request(app, url, { method = 'GET', cookie, body, external = false, form = false } = {}) {
  const chunks = [], socket = new Duplex({ read() {}, write(chunk, encoding, done) { chunks.push(Buffer.from(chunk)); done(); } });
  const req = new IncomingMessage(socket);
  req.method = method; req.url = url;
  const text = body ? form ? new URLSearchParams(body).toString() : JSON.stringify(body) : '';
  req.headers = { host: 'fortune.example', ...(external ? {} : { origin: 'https://fortune.example' }), ...(cookie ? { cookie } : {}), ...(body ? { 'content-type': form ? 'application/x-www-form-urlencoded' : 'application/json', 'content-length': Buffer.byteLength(text) } : {}) };
  const res = new ServerResponse(req); res.assignSocket(socket);
  let timer;
  const finish = new Promise((resolve, reject) => { res.on('finish', resolve); res.on('error', reject); timer = setTimeout(() => reject(new Error(`Response timed out: ${method} ${url}`)), 2500); });
  app(req, res);
  req.complete = true;
  if (text) req.push(text); req.push(null);
  try { await finish; } finally { clearTimeout(timer); }
  const raw = Buffer.concat(chunks).toString('utf8'), payload = raw.slice(raw.indexOf('\r\n\r\n') + 4);
  socket.destroy();
  return { status: res.statusCode, headers: res.getHeaders(), text: payload, json: () => JSON.parse(payload) };
}
test('실제 API: 설정 미완료는 503, 미리보기는 동의·동일 출처를 검증하고 전체 파일을 노출하지 않는다', async () => {
  const app = createCommerceRouter({ config: { ...nicepayConfig({}), origin: 'https://fortune.example' } });
  const config = await request(app, '/config');
  assert.deepEqual(config.json(), { enabled: false, mode: 'sandbox', methods: ['card'] });
  assert.match(String(config.headers['set-cookie']), /HttpOnly/); assert.match(String(config.headers['set-cookie']), /SameSite=Lax/);
  assert.equal((await request(app, '/orders', { method: 'POST', body: input() })).status, 503);
  assert.equal((await request(app, '/preview', { method: 'POST', body: input(), external: true })).status, 403);
  const preview = await request(app, '/preview', { method: 'POST', body: input() });
  assert.equal(preview.status, 200); assert.ok(preview.json().summary); assert.equal(preview.json().html, undefined);
  assert.equal(preview.headers['cache-control'], 'no-store');
});
test('실제 API: 외부 POST 콜백은 구매자 쿠키를 바꾸지 않으며 승인 전·타인은 다운로드할 수 없다', async t => {
  const f = await fixture(t);
  const gateway = { lookup: async tid => f.payments.get(tid), approve: async tid => { const p = { ...f.payments.get(tid), status: 'paid' }; f.payments.set(tid, p); return p; }, netCancel: async () => ({}) };
  const app = createCommerceRouter({ config: f.config, store: f.store, gateway });
  const c = await request(app, '/config'), cookie = String(c.headers['set-cookie']).split(';')[0];
  const created = await request(app, '/orders', { method: 'POST', cookie, body: input() });
  assert.equal(created.status, 201); const id = created.json().id;
  const order = await f.store.get(id); f.payments.set('TEST_TID', f.payment(order));
  assert.equal((await request(app, `/orders/${id}/report?download=1`, { cookie })).status, 402);
  assert.equal((await request(app, `/orders/${id}/report?download=1`)).status, 404);
  const callback = await request(app, `/nicepay/return?state=${order.state}`, { method: 'POST', form: true, external: true, body: { ...f.auth, orderId: id } });
  assert.equal(callback.status, 303); assert.equal(callback.headers['set-cookie'], undefined); assert.equal(callback.headers.location, `/shop/result/?orderId=${id}`);
  const download = await request(app, `/orders/${id}/report?download=1`, { cookie });
  assert.equal(download.status, 200); assert.match(download.headers['content-disposition'], /attachment; filename="fortune-lifetime-/); assert.match(download.text, /<!doctype html>/); assert.match(download.headers['content-security-policy'], /sandbox/);
  f.payments.set('TEST_TID', f.payment(order, 'cancelled'));
  assert.equal((await request(app, `/orders/${id}/report?download=1`, { cookie })).status, 402);
});

test('DB 연결 실패 시 공개 설정도 결제를 닫고 접속 정보를 노출하지 않는다', async () => {
  const app = createCommerceRouter({ config: { enabled: true, mode: 'sandbox', origin: 'https://fortune.example' }, store: { ready: async () => { throw new Error('postgres://secret@private-db/'); } } });
  const response = await request(app, '/config');
  assert.deepEqual(response.json(), { enabled: false, mode: 'sandbox', methods: ['card'] });
  assert.doesNotMatch(response.text, /secret|private-db/);
});
test('콜백 실패 로그에는 주문번호·작업·PG 코드만 남기고 토큰·키·PG 원문은 제외한다', async t => {
  const f = await fixture(t), events = [];
  const gateway = createNicepayGateway({ ...f.config, base: 'https://pg.example' }, async () => ({ ok: false, status: 401, json: async () => ({ resultCode: 'U100', resultMsg: 'private-provider-detail', authToken: f.auth.authToken, secretKey: f.config.secretKey }) }));
  const app = createCommerceRouter({ config: f.config, store: f.store, gateway, reportPaymentError: e => events.push(e) });
  const callback = await request(app, `/nicepay/return?state=${f.order.state}`, { method: 'POST', external: true, form: true, body: f.auth });
  assert.equal(callback.headers.location, '/shop/orders/?payment=check');
  assert.deepEqual(events, [{ orderId: f.order.id, status: 502, operation: 'approve', resultCode: 'U100', httpStatus: 401 }]);
  const text = JSON.stringify(events);
  for (const privateValue of [f.order.state, f.auth.authToken, f.auth.signature, f.config.clientId, f.config.secretKey, 'private-provider-detail']) assert.ok(!text.includes(privateValue));
  assert.equal((await f.store.get(f.order.id)).status, 'REVIEW');
});
test('PG 네트워크·비 JSON 오류도 내부 응답을 노출하지 않는 작업별 오류로 변환한다', async t => {
  const f = await fixture(t);
  for (const fetcher of [async () => { throw new Error('private-network-url'); }, async () => ({ json: async () => { throw new Error('private-response'); } })]) {
    const gateway = createNicepayGateway(f.config, fetcher);
    await assert.rejects(gateway.approve('TEST_TID', 990), e => e.status === 502 && e.paymentOperation === 'approve' && !e.message.includes('private'));
  }
});

test('결제수단 설정은 세 SDK 값을 보존하고 간편결제만 허용한 상점도 열며 잘못된 목록은 닫는다', () => {
  const env = { NICEPAY_CLIENT_ID: 'S2_test', NICEPAY_SECRET_KEY: 'test', SITE_URL: 'https://fortune.example', FORTUNE_ORDERS_DIR: '/tmp/fortune-test', NICEPAY_METHODS: 'card,naverpayCard,kakaopay' };
  const config = nicepayConfig(env);
  assert.equal(config.enabled, true);
  assert.deepEqual(config.methods, ['card', 'naverpayCard', 'kakaopay']);
  const easyOnly = nicepayConfig({ ...env, NICEPAY_METHODS: ' NAVERPAYCARD, kakaopay,naverpayCard ' });
  assert.equal(easyOnly.enabled, true);
  assert.deepEqual(easyOnly.methods, ['naverpayCard', 'kakaopay']);
  for (const invalid of ['', 'card,', 'card,vbank', 'NICEPAY_METHODS']) assert.equal(nicepayConfig({ ...env, NICEPAY_METHODS: invalid }).enabled, false);
});

for (const method of ['card', 'naverpayCard', 'kakaopay']) test(`${method}: 선택한 결제수단을 SDK 요청에 전달하고 가격·주문·서버 복귀 주소를 유지한다`, async t => {
  const f = await fixture(t);
  const payment = await f.service.payment(f.order.id, 'owner-a', method);
  assert.equal(payment.method, method);
  assert.equal(payment.orderId, f.order.id);
  assert.equal(payment.amount, 990);
  assert.equal(payment.returnUrl, `https://fortune.example/api/commerce/nicepay/return?state=${f.order.state}`);
  assert.equal(payment.secretKey, undefined);
  assert.equal(f.approvals(), 0);
});

test('미설정 결제수단·잘못된 SDK 값·타인 주문은 결제 요청을 만들지 못한다', async t => {
  const f = await fixture(t);
  const restricted = createCommerceService({ config: { ...f.config, methods: ['naverpayCard'] }, store: f.store });
  for (const method of ['card', 'kakaopay', 'naverpaycard', 'card,naverpayCard,kakaopay', '', null, ['naverpayCard']]) await assert.rejects(restricted.payment(f.order.id, 'owner-a', method), e => e.status === 400);
  await assert.rejects(restricted.payment(f.order.id, 'owner-a'), e => e.status === 400);
  await assert.rejects(restricted.payment(f.order.id, 'owner-b', 'naverpayCard'), e => e.status === 404);
});

test('실제 API: 공개 수단 목록과 선택한 결제수단을 연결하고 조작된 금액·수단을 차단한다', async t => {
  const f = await fixture(t);
  const app = createCommerceRouter({ config: f.config, store: f.store });
  const config = await request(app, '/config');
  assert.deepEqual(config.json(), { enabled: true, mode: 'sandbox', methods: ['card', 'naverpayCard', 'kakaopay'] });
  assert.doesNotMatch(config.text, /unit-test-key|S2_test_only/);
  const cookie = String(config.headers['set-cookie']).split(';')[0];
  const created = await request(app, '/orders', { method: 'POST', cookie, body: input() });
  const url = `/orders/${created.json().id}/payment`;
  for (const method of f.config.methods) {
    const response = await request(app, url, { method: 'POST', cookie, body: { method, amount: 1, clientId: 'other' } });
    assert.equal(response.status, 200);
    assert.equal(response.json().method, method);
    assert.equal(response.json().amount, 990);
    assert.equal(response.json().clientId, f.config.clientId);
  }
  assert.equal((await request(app, url, { method: 'POST', cookie, body: { method: 'vbank' } })).status, 400);
  assert.equal((await request(app, url, { method: 'POST', cookie, body: {} })).json().method, 'card');
});

test('한국 시간 새해에 상세판이 무료로 이동하고 지난 연도의 미결제 주문은 다시 결제할 수 없다', async t => {
  let clock = Date.parse('2026-12-31T23:59:59+09:00');
  const next = clock + 1000;
  const siteAt = now => createSite({ site: 'https://example.org', assets: {}, now });
  const before = siteAt(clock), after = siteAt(next);
  for (const prefix of ['', '/en']) {
    assert.ok(before.has(prefix + '/year/2027/premium/'));
    assert.match(before.render(prefix + '/shop/'), /href="(?:\/en)?\/year\/2027\/premium\/"/);
    assert.equal(after.redirect(prefix + '/year/2027/premium/'), prefix + '/year/2027/');
    assert.match(before.render(prefix + '/year/2026/'), /data-annual-tier="full"/);
    assert.match(before.render(prefix + '/year/2027/'), /data-annual-tier="preview"/);
    assert.match(after.render(prefix + '/year/2027/'), /data-annual-tier="full"/);
    assert.match(after.render(prefix + '/year/2028/'), /data-annual-tier="preview"/);
    assert.ok(after.has(prefix + '/year/2028/premium/'));
    assert.match(after.render(prefix + '/shop/'), /href="(?:\/en)?\/year\/2028\/premium\/"/);
  }
  const { config, store } = await fixture(t);
  const service = createCommerceService({ config, store, now: () => clock });
  const buy = { ...input('annual'), targetYear: 2027 };
  const order = await service.create(buy, 'annual-buyer');
  assert.match((await service.payment(order.id, 'annual-buyer')).goodsName, /2027년 프리미엄 운세/);
  clock = next;
  assert.equal((await service.list('annual-buyer'))[0].canPay, false);
  await assert.rejects(service.create(buy, 'annual-buyer'), /연도/);
  await assert.rejects(service.payment(order.id, 'annual-buyer'), /무료/);
  const nextOrder = await service.create({ ...buy, targetYear: 2028 }, 'annual-buyer');
  assert.match(nextOrder.title, /2028년/);
  assert.notEqual(order.id, nextOrder.id);
  assert.equal((await store.get(order.id)).html, order.html);
});
