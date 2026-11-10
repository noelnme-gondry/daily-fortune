// 분포표는 0.1점 단위다. 2점 구간으로 묶고 100점은 마지막 구간에 포함한다.
export function rankDistribution(histogram, score) {
  const counts = Array.from({ length: 50 }, (_, i) =>
    histogram.slice(i * 20, i === 49 ? 1001 : (i + 1) * 20).reduce((sum, count) => sum + count, 0));
  const points = [[0, counts[0]], ...counts.map((count, i) => [i * 2 + 1, count]), [100, counts.at(-1)]];
  const right = Math.max(1, points.findIndex(([x]) => x >= score));
  const [x0, y0] = points[right - 1];
  const [x1, y1] = points[right];
  // 점수는 그대로 쓰고, 마커의 높이는 화면에 그린 구간 사이의 선에서 찾는다.
  const markerCount = y0 + (y1 - y0) * (score - x0) / (x1 - x0);
  return { points, maxCount: Math.max(...counts), markerCount };
}
