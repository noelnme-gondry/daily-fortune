import test from 'node:test';
import assert from 'node:assert/strict';
import { trackedShareUrl } from '../src/domain/share-tracking.js';

test('공유 채널별 UTM은 공유 카드·언어·날짜·분야를 보존하며 기존 UTM을 갱신한다', () => {
  for (const method of ['kakao', 'copy', 'x', 'facebook', 'native']) {
    const url = new URL(trackedShareUrl('https://fortune.example/en/share/?k=today&s=64&d=2026-11-14&utm_source=old#reading', method, 'today'));
    assert.equal(url.pathname, '/en/share/');
    assert.equal(url.searchParams.get('s'), '64');
    assert.equal(url.searchParams.get('d'), '2026-11-14');
    assert.equal(url.searchParams.get('utm_source'), method);
    assert.equal(url.searchParams.get('utm_medium'), 'share');
    assert.equal(url.searchParams.get('utm_campaign'), 'today');
    assert.equal(url.hash, '#reading');
    assert.equal(url.searchParams.getAll('utm_source').length, 1);
  }
  assert.equal(new URL(trackedShareUrl('https://fortune.example/', 'copy')).searchParams.get('utm_campaign'), 'page');
});
