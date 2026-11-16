import test from 'node:test';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';
import { createPostgresOrderStore } from '../src/server/postgres-orders.js';
import { createCommerceService } from '../src/server/fortune-commerce.js';
import { nicepayConfig, sha256 } from '../src/server/nicepay.js';
import { PurchaseError } from '../src/server/fortune-report.js';

// 동일 PostgreSQL SQL 엔진에서 DDL·JSONB·제약·커밋을 검사한다.
// PGlite는 단일 세션이므로 별도 서버 간 잠금 경쟁은 실 Postgres에서 검증해야 한다.
function embeddedPool(db) {
  let queue = Promise.resolve(), serial = 0;
  const log = [];
  const pool = {
    log,
    async connect() {
      const previous = queue; let unlock;
      queue = new Promise(resolve => { unlock = resolve; });
      await previous;
      const id = ++serial;
      return {
        async query(sql, values) {
          log.push({ id, sql });
          if (!values && sql.includes(';')) { const results = await db.exec(sql); return results.at(-1); }
          return db.query(sql, values);
        },
        release(error) { log.push({ id, release: true, discarded: !!error }); unlock(); },
      };
    },
    async query(sql, values) { const client = await this.connect(); try { return await client.query(sql, values); } finally { client.release(); } },
    end: () => db.close(),
  };
  return pool;
}
const config = { enabled: true, mode: 'sandbox', clientId: 'S2_postgres_test', secretKey: 'test-secret', origin: 'https://fortune.example' };
const input = { productId: 'lifetime', people: [{ name: 'DB 검증', gender: 'F', calendar: 'solar', y: 1990, m: 5, d: 17, timeMode: 'exact', noTime: true }], privacyConsent: true, purchaseConsent: true };

test('Postgres 전환: 실제 SQL 엔진에서 주문·승인·권한·재시작·기존 데이터 보존', async t => {
  const db = new PGlite(), pool = embeddedPool(db);
  t.after(() => db.close());
  await db.exec('CREATE TABLE public.library_marker (value TEXT); INSERT INTO public.library_marker VALUES (\'keep\')');
  const store = createPostgresOrderStore('', { pool }), second = createPostgresOrderStore('', { pool });
  const payments = new Map(); let approvals = 0;
  function payment(order, status = 'ready') {
    const p = { resultCode: '0000', tid: 'PG_TEST_TID', orderId: order.id, amount: 990, balanceAmt: status === 'cancelled' ? 0 : 990, ediDate: '2026-11-16T12:00:00+09:00', currency: 'KRW', status };
    p.signature = sha256(`${p.tid}${p.amount}${p.ediDate}${config.secretKey}`); return p;
  }
  const gateway = { lookup: async tid => payments.get(tid), approve: async tid => { approvals++; const p = { ...payments.get(tid), status: 'paid' }; payments.set(tid, p); return p; }, netCancel: async () => ({}) };
  const one = createCommerceService({ config, store, gateway }), two = createCommerceService({ config, store: second, gateway });
  let order;
  await t.test('스키마 초기화 재시도에도 Library 데이터를 보존한다', async () => {
    await Promise.all([store.ready(), second.ready()]);
    assert.deepEqual((await db.query('SELECT value FROM public.library_marker')).rows, [{ value: 'keep' }]);
    assert.equal((await db.query("SELECT count(*)::int AS n FROM pg_indexes WHERE schemaname='fortune_commerce'")).rows[0].n, 3);
  });
  await t.test('두 서비스의 중복 주문과 JSONB 운세 파일 보존', async () => {
    const orders = await Promise.all([one.create(input, 'owner-db'), two.create(input, 'owner-db')]);
    order = orders[0]; assert.equal(orders[0].id, orders[1].id);
    const loaded = await second.get(order.id); assert.deepEqual(loaded, order); assert.match(loaded.html, /DB 검증/);
    assert.deepEqual(await second.own('someone-else'), []);
  });
  await t.test('승인 이전·타인 접근 차단과 재전송 승인 멱등성', async () => {
    await assert.rejects(one.get(order.id, 'owner-db', true), e => e.status === 402);
    await assert.rejects(one.get(order.id, 'not-owner', true), e => e.status === 404);
    payments.set('PG_TEST_TID', payment(order));
    const auth = { orderId: order.id, tid: 'PG_TEST_TID', amount: '990', clientId: config.clientId, authToken: 'test-auth', authResultCode: '0000' };
    auth.signature = sha256(`${auth.authToken}${auth.clientId}${auth.amount}${config.secretKey}`);
    await Promise.all([one.callback(auth, order.state), two.callback(auth, order.state)]);
    assert.equal(approvals, 1); assert.equal((await two.get(order.id, 'owner-db', true)).html, order.html);
  });
  await t.test('소유자·보고서 원문 변경 및 같은 상점의 거래번호 중복을 거절한다', async () => {
    const paid = await store.get(order.id);
    await assert.rejects(store.put({ ...paid, owner: 'hijack' }), e => e.status === 409);
    await assert.rejects(store.put({ ...paid, html: '<h1>changed</h1>' }), e => e.status === 409);
    await assert.rejects(store.put({ ...paid, id: 'fortune_00000000-0000-4000-8000-000000000099' }), e => e.status === 409);
    assert.equal((await store.get(order.id)).html, order.html);
  });
  await t.test('실패 후 잠금 해제와 승인 직전 저장의 커밋을 확인한다', async () => {
    const fresh = await one.create({ ...input, people: [{ ...input.people[0], name: '별도 주문' }] }, 'owner-db');
    await assert.rejects(store.withLock(fresh.id, async scoped => { await scoped.put({ ...fresh, tid: 'DURABLE_BEFORE_APPROVAL' }); throw new PurchaseError('intentional'); }));
    assert.equal((await second.get(fresh.id)).tid, 'DURABLE_BEFORE_APPROVAL');
    await store.withLock(fresh.id, async scoped => assert.equal((await scoped.get(fresh.id)).id, fresh.id));
    const sessions = new Map();
    for (const entry of pool.log) {
      if (entry.sql?.startsWith('SELECT pg_advisory_lock(')) sessions.set(entry.id, false);
      if (entry.sql?.startsWith('SELECT pg_advisory_unlock(')) { assert.ok(sessions.has(entry.id)); sessions.set(entry.id, true); }
    }
    assert.ok([...sessions.values()].every(Boolean));
  });
  await t.test('취소 후에는 DB에 남은 파일도 다운로드 권한을 열지 않는다', async () => {
    payments.set('PG_TEST_TID', payment(order, 'cancelled'));
    await assert.rejects(two.get(order.id, 'owner-db', true), e => e.status === 402);
    assert.equal((await store.get(order.id)).status, 'CANCELLED');
  });
});

test('DB 초기화 실패는 재시도 가능하고 연결 URL·비밀번호를 오류로 노출하지 않는다', async () => {
  let fail = true, releases = 0;
  const pool = { connect: async () => ({ query: async () => { if (fail) { fail = false; throw new Error('postgres://private-secret@db/'); } return { rows: [] }; }, release: () => { releases++; } }), end: async () => {} };
  const store = createPostgresOrderStore('', { pool });
  await assert.rejects(store.ready(), e => e.status === 503 && !e.message.includes('private-secret'));
  await store.ready(); assert.equal(releases, 2);
});

test('DATABASE_URL 우선순위, 기존 파일 경로 호환과 실결제 허용 설정을 검증한다', () => {
  const env = { NICEPAY_MODE: 'sandbox', NICEPAY_CLIENT_ID: 'S2_test', NICEPAY_SECRET_KEY: 'test', SITE_URL: 'https://fortune.example', DATABASE_URL: 'postgresql://user:password@postgres.railway.internal/railway' };
  assert.equal(nicepayConfig(env).enabled, true);
  assert.equal(nicepayConfig({ ...env, FORTUNE_ORDERS_DIR: '/tmp/unused' }).directory, '');
  assert.equal(nicepayConfig({ ...env, DATABASE_URL: 'invalid', FORTUNE_ORDERS_DIR: '/tmp/valid' }).enabled, false);
  assert.equal(nicepayConfig({ ...env, DATABASE_URL: '', FORTUNE_ORDERS_DIR: '/tmp/valid' }).enabled, true);
  for (const flag of [undefined, 'false', '0']) assert.equal(nicepayConfig({ ...env, NICEPAY_MODE: 'live', PAYMENTS_LIVE_ENABLED: flag }).enabled, false);
  assert.equal(nicepayConfig({ ...env, NICEPAY_MODE: 'live', PAYMENTS_LIVE_ENABLED: 'true' }).enabled, true);
  assert.equal(nicepayConfig({ ...env, NICEPAY_APPROVAL_MODEL: 'client' }).enabled, false);
  assert.equal(nicepayConfig({ ...env, PAYMENTS_PROVIDER: 'other' }).enabled, false);
  assert.equal(nicepayConfig({ ...env, NICEPAY_METHODS: 'vbank' }).enabled, false);
});
