import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { Pool } from 'pg';
import { PurchaseError } from './fortune-report.js';

const schema = readFileSync(new URL('./sql/fortune-orders-v1.sql', import.meta.url), 'utf8');
const validId = id => /^fortune_[a-f0-9-]{36}$/.test(id || '');
const lockId = key => createHash('sha256').update(`fortune-commerce:${key}`).digest().readBigInt64BE(0).toString();
const databaseError = e => e instanceof PurchaseError ? e : new PurchaseError(e?.code === '23505' ? '이미 다른 주문에 연결된 결제입니다. 주문 상태를 확인해 주세요.' : '주문 저장소에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.', e?.code === '23505' ? 409 : 503);

export function createPostgresOrderStore(connectionString, { pool: suppliedPool } = {}) {
  const pool = suppliedPool || new Pool({ connectionString, max: 5, connectionTimeoutMillis: 10000, idleTimeoutMillis: 30000, statement_timeout: 10000, application_name: 'fortune-commerce' });
  pool.on?.('error', () => {}); // 비동기 idle 연결 오류에 출생 정보·접속 URL을 출력하지 않는다.
  let initialization;
  async function ready() {
    if (!initialization) initialization = (async () => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query('SELECT pg_advisory_xact_lock($1::bigint)', [lockId('schema:v1')]);
        await client.query(schema);
        await client.query('COMMIT');
      } catch (e) { try { await client.query('ROLLBACK'); } catch { /* 원래 오류 유지 */ } throw e; }
      finally { client.release(); }
    })().catch(e => { initialization = null; throw databaseError(e); });
    return initialization;
  }
  function operations(executor) {
    return {
      async get(id) {
        if (!validId(id)) throw new PurchaseError('주문을 찾을 수 없습니다.', 404);
        const result = await executor.query('SELECT record FROM fortune_commerce.orders WHERE id = $1', [id]);
        if (!result.rows.length) throw new PurchaseError('주문을 찾을 수 없습니다.', 404);
        return result.rows[0].record;
      },
      async own(owner) {
        const result = await executor.query('SELECT record FROM fortune_commerce.orders WHERE owner_hash = $1 ORDER BY created_at DESC', [owner]);
        return result.rows.map(row => row.record);
      },
      async put(order) {
        if (!validId(order.id)) throw new PurchaseError('주문번호를 확인해 주세요.');
        const result = await executor.query(`INSERT INTO fortune_commerce.orders AS existing
          (id, owner_hash, fingerprint, mode, client_id, status, amount, created_at, tid, record)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb)
          ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, tid = EXCLUDED.tid, record = EXCLUDED.record
          WHERE existing.owner_hash = EXCLUDED.owner_hash AND existing.fingerprint = EXCLUDED.fingerprint
            AND existing.mode = EXCLUDED.mode AND existing.client_id = EXCLUDED.client_id
            AND existing.amount = EXCLUDED.amount AND existing.created_at = EXCLUDED.created_at
            AND (existing.record - 'status' - 'tid') = (EXCLUDED.record - 'status' - 'tid')
          RETURNING id`, [order.id, order.owner, order.fingerprint, order.mode, order.clientId, order.status, order.amount, order.createdAt, order.tid || null, JSON.stringify(order)]);
        if (!result.rows.length) throw new PurchaseError('기존 주문의 구매 대상과 소유권을 변경할 수 없습니다.', 409);
      },
    };
  }
  async function run(method, ...args) {
    try { await ready(); return await operations(pool)[method](...args); } catch (e) { throw databaseError(e); }
  }
  return {
    ready,
    get: id => run('get', id),
    own: owner => run('own', owner),
    put: order => run('put', order),
    async withLock(key, operation) {
      await ready();
      let client, held = false, discard;
      const disconnected = e => { discard = e; };
      try {
        client = await pool.connect();
        client.on?.('error', disconnected);
        await client.query('SELECT pg_advisory_lock($1::bigint)', [lockId(key)]);
        held = true;
        // 세션 잠금 동안 각 변경을 즉시 커밋해 승인 직전 거래번호를 재시작에도 보존한다.
        return await operation(operations(client));
      } catch (e) { throw databaseError(e); }
      finally {
        if (client) {
          if (held) try {
            const result = await client.query('SELECT pg_advisory_unlock($1::bigint) AS unlocked', [lockId(key)]);
            if (!result.rows[0]?.unlocked) discard = new Error('Order lock was not released');
          } catch (e) { discard = e; }
          client.release(discard);
          client.removeListener?.('error', disconnected);
        }
      }
    },
    close: () => pool.end(),
  };
}
