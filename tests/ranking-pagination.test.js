import test from 'node:test';
import assert from 'node:assert/strict';
import { RANKING_LIMIT, RANKING_PAGE_SIZE, rankingPage } from '../src/domain/ranking-list.js';

test('100개 항목이 5개씩 20페이지로 나뉘며 누락·중복·순서 변경이 없다', () => {
  assert.equal(RANKING_LIMIT, 100);
  assert.equal(RANKING_PAGE_SIZE, 5);
  const rows = Array.from({ length: 100 }, (_, index) => ({ id: index, rank: index < 12 ? 1 : index + 1, score: index < 12 ? 99 : 98 }));
  const collected = [];
  for (let number = 1; number <= 20; number++) {
    const p = rankingPage(rows, number);
    assert.equal(p.page, number);
    assert.equal(p.pages, 20);
    assert.equal(p.items.length, 5);
    assert.equal(p.start, (number - 1) * 5);
    assert.equal(p.end, number * 5);
    collected.push(...p.items);
  }
  assert.deepEqual(collected, rows);
  assert.equal(rankingPage(rows, 3).items[0].rank, 1, '페이지가 바뀌어도 공동 순위를 유지한다');
});

test('경계 밖 페이지·부족한 결과·빈 목록은 실제 데이터 범위에서 처리한다', () => {
  const rows = Array.from({ length: 98 }, (_, i) => i);
  assert.deepEqual(rankingPage(rows, 21).items, [95, 96, 97]);
  assert.equal(rankingPage(rows, -1).page, 1);
  assert.equal(rankingPage(rows, 'wrong').page, 1);
  assert.equal(rankingPage(rows, 1.8).page, 1);
  assert.deepEqual(rankingPage([], 20), { page: 1, pages: 1, start: 0, end: 0, total: 0, items: [] });
});
