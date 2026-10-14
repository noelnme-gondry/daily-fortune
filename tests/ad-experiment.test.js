import test from 'node:test';
import assert from 'node:assert/strict';
import { AD_POSITION_EXPERIMENT, assignAdVariant } from '../src/domain/ad-experiment.js';

function store(initial) {
  const values = new Map(initial === undefined ? [] : [[AD_POSITION_EXPERIMENT.storageKey, initial]]);
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}
const source = (storage, scope = 'browser') => ({ scope, open: () => storage });
const blocked = { scope: 'browser', open() { throw new Error('storage blocked'); } };

test('50:50 경계로 배정하고 저장된 그룹은 다시 뽑지 않는다', () => {
  for (const [sample, variant] of [[0, 'A'], [0.499999, 'A'], [0.5, 'B'], [0.999999, 'B']]) {
    const storage = store();
    assert.deepEqual(assignAdVariant([source(storage)], () => sample), { variant, scope: 'browser' });
    assert.equal(storage.getItem(AD_POSITION_EXPERIMENT.storageKey), variant);
    assert.deepEqual(assignAdVariant([source(storage)], () => { throw new Error('must not rerandomize'); }), { variant, scope: 'browser' });
  }
});

test('잘못된 저장값은 유효한 그룹으로 다시 배정한다', () => {
  for (const invalid of ['', 'b', 'C', 'null']) {
    const storage = store(invalid);
    assert.deepEqual(assignAdVariant([source(storage)], () => 0.7), { variant: 'B', scope: 'browser' });
  }
});

test('브라우저 저장이 막히면 기존 탭 배정을 유지한다', () => {
  assert.deepEqual(assignAdVariant([blocked, source(store('B'), 'session')]), { variant: 'B', scope: 'session' });
  const unreadable = { getItem() { throw new Error('blocked read'); } };
  assert.deepEqual(assignAdVariant([source(unreadable), source(store(), 'session')], () => 0.2), { variant: 'A', scope: 'session' });
});

test('읽기만 가능한 저장소와 전체 차단에서도 현재 문서의 배정을 유지한다', () => {
  const readonly = { getItem: () => null, setItem() { throw new Error('quota'); } };
  let calls = 0;
  assert.deepEqual(assignAdVariant([source(readonly), blocked], () => { calls++; return 0.8; }), { variant: 'B', scope: 'page' });
  assert.equal(calls, 1);
  assert.deepEqual(assignAdVariant([blocked], () => 0.2), { variant: 'A', scope: 'page' });
  assert.deepEqual(assignAdVariant([], () => 0.8), { variant: 'B', scope: 'page' });
});
