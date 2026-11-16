import express from 'express';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, rename, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createFortuneReport, PurchaseError } from './fortune-report.js';
import { nicepayConfig, createNicepayGateway, sha256, matchesSignature, verifyNicepayPayment } from './nicepay.js';
import { createPostgresOrderStore } from './postgres-orders.js';

const idPattern = /^fortune_[a-f0-9-]{36}$/;
export function createOrderStore(directory) {
  const file = id => { if (!idPattern.test(id || '')) throw new PurchaseError('주문을 찾을 수 없습니다.', 404); return path.join(directory, `${id}.json`); };
  return {
    async get(id) { try { return JSON.parse(await readFile(file(id), 'utf8')); } catch (e) { if (e.code === 'ENOENT') throw new PurchaseError('주문을 찾을 수 없습니다.', 404); throw e; } },
    async put(order) {
      await mkdir(directory, { recursive: true, mode: 0o700 });
      const dest = file(order.id), temp = `${dest}.${randomUUID()}.tmp`;
      await writeFile(temp, JSON.stringify(order), { mode: 0o600, flag: 'wx' });
      await rename(temp, dest);
    },
    async own(owner) {
      let names;
      try { names = await readdir(directory); } catch (e) { if (e.code === 'ENOENT') return []; throw e; }
      const orders = [];
      for (const name of names.filter(n => idPattern.test(n.replace(/\.json$/, '')) && n.endsWith('.json'))) {
        const order = await this.get(name.slice(0, -5));
        if (order.owner === owner) orders.push(order);
      }
      return orders.sort((a, b) => b.createdAt - a.createdAt);
    },
  };
}
const publicOrder = o => ({ id: o.id, productId: o.productId, title: o.title, amount: o.amount, status: o.status, createdAt: o.createdAt, canPay: o.status === 'PENDING' && !o.tid && Date.now() - o.createdAt < 86400000 });

export function createCommerceService({ config, store, gateway, now = Date.now }) {
  const locks = new Map();
  async function lock(key, fn) {
    const previous = locks.get(key) || Promise.resolve();
    const task = previous.catch(() => {}).then(() => store.withLock ? store.withLock(key, fn) : fn(store));
    locks.set(key, task);
    try { return await task; } finally { if (locks.get(key) === task) locks.delete(key); }
  }
  const ready = () => { if (!config.enabled) throw new PurchaseError('결제 준비 중입니다. 지금은 미리보기만 이용할 수 있습니다.', 503); };
  const owned = async (id, owner, db) => { const o = await db.get(id); if (o.owner !== owner) throw new PurchaseError('이 브라우저의 주문이 아닙니다.', 404); return o; };
  const sameShop = o => { if (o.mode !== config.mode || o.clientId !== config.clientId) throw new PurchaseError('이 주문의 결제 상점 설정을 확인해야 합니다. 운영자에게 문의해 주세요.', 409); };
  async function refresh(o, db) {
    sameShop(o);
    if (!o.tid) return o;
    const p = await gateway.lookup(o.tid);
    const paid = verifyNicepayPayment(p, o, config);
    o.status = paid ? 'PAID' : ['cancelled', 'partialCancelled', 'expired', 'failed'].includes(p.status) ? 'CANCELLED' : 'PENDING';
    await db.put(o);
    return o;
  }
  return {
    async create(input, owner) {
      ready();
      if (input.purchaseConsent !== true) throw new PurchaseError('상품과 단건 결제 금액을 확인해 주세요.');
      const report = createFortuneReport(input);
      const fingerprint = sha256(JSON.stringify(report.normalized));
      return lock(`owner:${owner}`, async db => {
        const existing = (await db.own(owner)).find(o => o.fingerprint === fingerprint && o.mode === config.mode && o.clientId === config.clientId && (o.status === 'PAID' || (o.status === 'PENDING' && now() - o.createdAt < 24 * 60 * 60 * 1000)));
        if (existing) return existing;
        const state = randomBytes(32).toString('hex');
        const order = { id: `fortune_${randomUUID()}`, owner, productId: report.product.id, amount: report.product.price, title: report.title, html: report.html, fingerprint, state, status: 'PENDING', createdAt: now(), mode: config.mode, clientId: config.clientId, consentVersion: '2026-11-16' };
        await db.put(order);
        return order;
      });
    },
    async callback(body, state) {
      ready();
      return lock(body.orderId, async db => {
        const o = await db.get(body.orderId);
        sameShop(o);
        if (typeof state !== 'string' || !matchesSignature(sha256(state), sha256(o.state))) throw new PurchaseError('결제 요청을 확인할 수 없습니다.', 403);
        if (body.authResultCode !== '0000') throw new PurchaseError('결제가 완료되지 않았습니다. 구매 보관함에서 다시 시도해 주세요.');
        if (body.clientId !== config.clientId || String(body.amount) !== String(o.amount) || typeof body.authToken !== 'string' || !matchesSignature(body.signature, sha256(`${body.authToken}${body.clientId}${body.amount}${config.secretKey}`))) throw new PurchaseError('결제 인증 정보가 일치하지 않습니다.', 409);
        if (typeof body.tid !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(body.tid) || (o.tid && o.tid !== body.tid)) throw new PurchaseError('결제 거래번호를 확인해 주세요.', 409);
        if (o.status === 'CANCELLED') throw new PurchaseError('취소된 주문입니다. 상품을 다시 선택해 주세요.', 409);
        if (!o.tid && now() - o.createdAt > 24 * 60 * 60 * 1000) throw new PurchaseError('주문 시간이 지났습니다. 상품을 다시 선택해 주세요.', 409);
        o.tid = body.tid;
        await db.put(o); // 승인 전에 거래번호를 보존: 응답 유실·재시작 시 조회로 복구한다.
        let payment = await gateway.lookup(o.tid);
        const alreadyPaid = verifyNicepayPayment(payment, o, config);
        if (!alreadyPaid && payment.status !== 'ready') throw new PurchaseError('결제 가능한 상태가 아닙니다.', 409);
        if (!alreadyPaid) {
          try {
            payment = await gateway.approve(o.tid, o.amount);
            if (!verifyNicepayPayment(payment, o, config)) throw new PurchaseError('결제가 승인되지 않았습니다.', 409);
          }
          catch (e) {
            // 응답만 유실됐거나 중복 콜백이 도착했으면 이미 승인된 동일 거래를 복구한다.
            let recovered = false;
            try { const p = await gateway.lookup(o.tid); if (verifyNicepayPayment(p, o, config)) { payment = p; recovered = true; } } catch { /* 불확실한 거래는 아래 망취소로 보상 */ }
            if (!recovered) {
              try { await gateway.netCancel(o.id); o.status = 'CANCELLED'; } catch { o.status = 'REVIEW'; }
              await db.put(o);
              throw e;
            }
          }
        }
        if (!verifyNicepayPayment(payment, o, config)) throw new PurchaseError('결제가 승인되지 않았습니다.', 409);
        o.status = 'PAID';
        await db.put(o);
        return o.id;
      });
    },
    async list(owner) { ready(); return (await store.own(owner)).map(publicOrder); },
    async get(id, owner, full = false) {
      ready();
      return lock(id, async db => {
        const order = await refresh(await owned(id, owner, db), db);
        if (full && order.status !== 'PAID') throw new PurchaseError('결제 승인 후 상세 풀이와 다운로드를 이용할 수 있습니다.', 402);
        return full ? order : publicOrder(order);
      });
    },
    async payment(id, owner) {
      ready();
      const o = await owned(id, owner, store); sameShop(o);
      if (o.status !== 'PENDING' || o.tid || now() - o.createdAt > 24 * 60 * 60 * 1000) throw new PurchaseError('구매 보관함에서 주문 상태를 확인해 주세요.', 409);
      return { clientId: config.clientId, method: 'card', orderId: o.id, amount: o.amount, goodsName: `운세 ${o.productId === 'lifetime' ? '평생 사주' : o.productId === 'tojeong' ? '토정비결' : '궁합'}`, returnUrl: `${config.origin}/api/commerce/nicepay/return?state=${o.state}` };
    },
  };
}

export function createCommerceRouter({ config = nicepayConfig(), store, gateway } = {}) {
  // Express 앱은 Vite의 Connect에서도 요청·응답 API를 초기화한다.
  const router = express();
  router.disable('x-powered-by');
  const orders = store || (config.databaseUrl ? createPostgresOrderStore(config.databaseUrl) : config.directory ? createOrderStore(config.directory) : null);
  const service = createCommerceService({ config, store: orders, gateway: gateway || createNicepayGateway(config) });
  router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); res.set('Referrer-Policy', 'no-referrer'); res.set('X-Content-Type-Options', 'nosniff'); next(); });
  router.use(express.json({ limit: '24kb' }));
  // 외부 POST에는 Lax 쿠키가 없다. 주문 state와 서명으로 인증하며 구매자 쿠키를 바꾸지 않는다.
  router.post('/nicepay/return', express.urlencoded({ extended: false, limit: '16kb' }), async (req, res) => {
    try { const id = await service.callback(req.body, req.query.state); res.redirect(303, `/shop/result/?orderId=${encodeURIComponent(id)}`); }
    catch { res.redirect(303, '/shop/orders/?payment=check'); }
  });
  router.use((req, res, next) => {
    const raw = /(?:^|;\s*)fortune_buyer=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1];
    const token = raw || randomBytes(32).toString('hex');
    if (!raw) res.cookie('fortune_buyer', token, { httpOnly: true, sameSite: 'lax', secure: config.origin.startsWith('https:'), maxAge: 365 * 86400000, path: '/' });
    req.fortuneOwner = sha256(token);
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const expected = config.origin || `${req.protocol}://${req.get('host')}`;
      if (req.get('origin') !== expected) return res.status(403).json({ message: '같은 사이트에서 다시 시도해 주세요.' });
    }
    next();
  });
  router.get('/config', async (req, res) => {
    let enabled = config.enabled;
    if (enabled) try { await orders?.ready?.(); } catch { enabled = false; }
    res.json({ enabled, mode: config.mode });
  });
  router.post('/preview', (req, res, next) => {
    try { const r = createFortuneReport(req.body); res.json({ productId: r.product.id, title: r.title, summary: r.summary, amount: r.product.price, people: r.normalized.people, targetYear: r.normalized.targetYear }); } catch (e) { next(e); }
  });
  router.post('/orders', async (req, res, next) => { try { const order = await service.create(req.body, req.fortuneOwner); res.status(201).json(publicOrder(order)); } catch (e) { next(e); } });
  router.get('/orders', async (req, res, next) => { try { res.json(await service.list(req.fortuneOwner)); } catch (e) { next(e); } });
  router.get('/orders/:id', async (req, res, next) => { try { res.json(await service.get(req.params.id, req.fortuneOwner)); } catch (e) { next(e); } });
  router.post('/orders/:id/payment', async (req, res, next) => { try { res.json(await service.payment(req.params.id, req.fortuneOwner)); } catch (e) { next(e); } });
  router.get('/orders/:id/report', async (req, res, next) => {
    try {
      const o = await service.get(req.params.id, req.fortuneOwner, true);
      res.set('X-Robots-Tag', 'noindex, nofollow');
      res.set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; img-src data:; sandbox; base-uri 'none'; form-action 'none'; frame-ancestors 'self'");
      if (req.query.download === '1') res.attachment(`fortune-${o.productId}-${o.id.slice(-8)}.html`);
      res.type('html').send(o.html);
    } catch (e) { next(e); }
  });
  router.use((err, req, res, next) => res.status(err.status || 500).json({ message: err instanceof PurchaseError ? err.message : '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.' }));
  return router;
}
