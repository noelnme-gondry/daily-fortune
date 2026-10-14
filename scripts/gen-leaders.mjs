// 기존 랭킹 산식으로 분야별 상위 원국을 추출한다. 골든 분포표는 변경하지 않는다.
import fs from 'node:fs';
import { allPillars, rankScore, RANK_CATS, rankFromTable } from '../src/engine/rank.js';
import { analyze } from '../src/engine/chart.js';
import TABLE from '../src/content/rank-table.js';
import { findBirthExamples } from '../src/engine/rank-examples.js';
import { RANKING_LIMIT } from '../src/domain/ranking-list.js';
const exampleCache = new Map();
const candidatesPerCategory = RANKING_LIMIT * 2;
const result = {};
for (const [kind, withHour] of [['four', true], ['three', false]]) {
  const keys = ['total', ...RANK_CATS.map(([k]) => k)];
  const top = Object.fromEntries(keys.map((k) => [k, []]));
  for (const pillars of allPillars(withHour)) {
    const scores = rankScore(analyze(pillars));
    for (const key of keys) {
      const score = key === 'total' ? scores.total : scores.cats[key];
      if (top[key].length === candidatesPerCategory && score <= top[key].at(-1).score) continue;
      top[key].push({ score, pillars, total: scores.total, cats: scores.cats });
      top[key].sort((a, b) => b.score - a.score);
      top[key] = top[key].slice(0, candidatesPerCategory);
    }
  }
  for (const key of keys) {
    const cutoff = top[key][RANKING_LIMIT - 1].score;
    const leaders = top[key].filter((row) => row.score >= cutoff);
    for (const row of leaders) {
      const cacheKey = JSON.stringify(row.pillars);
      if (!exampleCache.has(cacheKey)) exampleCache.set(cacheKey, findBirthExamples(row.pillars));
      row.examples = exampleCache.get(cacheKey);
    }
    // 출생일 확인 여부는 동점 조합의 대표를 고를 때만 사용한다. 더 높은 점수를 제외하지 않는다.
    top[key] = leaders.sort((a, b) => b.score - a.score || Number(b.examples.length > 0) - Number(a.examples.length > 0)).slice(0, RANKING_LIMIT);
  }
  for (const key of keys) for (const row of top[key]) {
    const histogram = key === 'total' ? TABLE[kind].total : TABLE[kind].cats[key];
    const idx = key === 'total' ? Math.round(row.score * 10) : row.score;
    row.rank = histogram.slice(idx + 1).reduce((a, b) => a + b, 0) + 1;
    row.tied = histogram[idx];
    row.tier = rankFromTable(row, TABLE[kind]).tier.code;
  }
  result[kind] = top;
}
fs.writeFileSync('src/content/rank-leaders.js', `// scripts/gen-leaders.mjs 자동 생성: 분야별 상위 조합과 확인된 출생 입력\nexport default ${JSON.stringify(result)};\n`);
console.log('3·4기둥 × 종합·5분야, 1위부터 상위 대표 조합 생성');
