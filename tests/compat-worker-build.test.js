import test from 'node:test';
import assert from 'node:assert/strict';
import { Script } from 'node:vm';
import { build } from 'vite';

test('배포 빌드에 추천 worker와 모든 의존성이 포함되고 실제 추천을 계산한다', async () => {
  const bundle = await build({ logLevel: 'silent', build: { write: false } });
  const worker = bundle.output.find((asset) => /compat-matches\.worker-.*\.js$/.test(asset.fileName));
  assert.ok(worker, 'Vite가 독립 실행 가능한 worker 자산을 생성해야 한다');
  const messages = [];
  const context = { postMessage: (message) => messages.push(message) };
  new Script(String(worker.source)).runInNewContext(context);
  context.onmessage({ data: { base: { y: 1993, m: 1, d: 28, gender: 'F', calendar: 'solar', time: '03:40' }, gender: 'M', today: { y: 2026, m: 10, d: 14 } } });
  const message = messages.at(-1);
  assert.equal(message.type, 'result');
  assert.equal(message.result.rankings.total.length, 100);
  assert.equal(message.result.rankings.total[0].score, 96);
  assert.equal(message.result.range.from, 1983);
  assert.equal(message.result.range.to, 2003);
});
