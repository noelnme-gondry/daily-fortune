-- Fortune 전용 확장 스키마. 기존 Library 테이블·파일을 변경하지 않는다.
CREATE SCHEMA IF NOT EXISTS fortune_commerce;
CREATE TABLE IF NOT EXISTS fortune_commerce.orders (
  id TEXT PRIMARY KEY CHECK (id ~ '^fortune_[a-f0-9-]{36}$'),
  owner_hash TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('sandbox', 'live')),
  client_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'PAID', 'CANCELLED', 'REVIEW')),
  amount INTEGER NOT NULL CHECK (amount = 990),
  created_at BIGINT NOT NULL,
  tid TEXT,
  record JSONB NOT NULL CHECK (jsonb_typeof(record) = 'object'),
  CHECK (status <> 'PAID' OR tid IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS orders_owner_created_idx ON fortune_commerce.orders (owner_hash, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS orders_shop_tid_idx ON fortune_commerce.orders (mode, client_id, tid) WHERE tid IS NOT NULL;
