// 기존 랭킹 산식으로 실제 상위 원국 5개씩을 추출한다. 골든 분포표는 변경하지 않는다.
import fs from 'node:fs';
import { allPillars, rankScore, RANK_CATS, rankFromTable } from '../src/engine/rank.js';
import { analyze } from '../src/engine/chart.js';
import TABLE from '../src/content/rank-table.js';
const result = {};
for (const [kind, withHour] of [['four', true], ['three', false]]) {
  const keys = ['total', ...RANK_CATS.map(([k]) => k)];
  const top = Object.fromEntries(keys.map((k) => [k, []]));
  for (const pillars of allPillars(withHour)) {
    const scores = rankScore(analyze(pillars));
    for (const key of keys) {
      const score = key === 'total' ? scores.total : scores.cats[key];
      if (top[key].length === 5 && score <= top[key][4].score) continue;
      top[key].push({ score, pillars, total: scores.total, cats: scores.cats });
      top[key].sort((a, b) => b.score - a.score);
      top[key] = top[key].slice(0, 5);
    }
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
fs.writeFileSync('src/content/rank-leaders.js', `// scripts/gen-leaders.mjs 자동 생성: 실제 전수 계산 상위 조합\nexport default ${JSON.stringify(result)};\n`);
console.log('3·4기둥 × 종합·5분야 상위 5개 조합 생성');
