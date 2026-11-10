import assert from 'node:assert/strict';
import test from 'node:test';
import RANK_TABLE from '../src/content/rank-table.js';
import { rankDistribution } from '../src/domain/rank-distribution.js';

test('2점 구간의 조합 수는 각 분포표 합계와 일치하고 100점을 포함한다', () => {
  for (const table of [RANK_TABLE.four, RANK_TABLE.three]) {
    const { points, maxCount } = rankDistribution(table.total, 68);
    const bins = points.slice(1, -1);
    assert.equal(bins.length, 50);
    assert.equal(bins.reduce((sum, [, count]) => sum + count, 0), table.n);
    assert.equal(maxCount, Math.max(...bins.map(([, count]) => count)));
  }
  const all = Array(1001).fill(0);
  all[999] = 2;
  all[1000] = 1;
  const { points, markerCount } = rankDistribution(all, 100);
  assert.deepEqual(points.slice(-2), [[99, 3], [100, 3]]);
  assert.equal(markerCount, 3);
});

test('점수 마커는 구간 중심과 경계를 포함해 분포선 위에 놓인다', () => {
  const histogram = RANK_TABLE.four.total;
  const left = histogram.slice(660, 680).reduce((sum, n) => sum + n, 0);
  const right = histogram.slice(680, 700).reduce((sum, n) => sum + n, 0);
  assert.equal(rankDistribution(histogram, 0).markerCount, rankDistribution(histogram, 1).markerCount);
  assert.equal(rankDistribution(histogram, 67).markerCount, left);
  assert.equal(rankDistribution(histogram, 68).markerCount, (left + right) / 2);
  assert.equal(rankDistribution(histogram, 69).markerCount, right);
});
