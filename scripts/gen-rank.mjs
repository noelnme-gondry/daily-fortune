// 사주 랭킹 분포표 생성: 가능한 모든 원국을 점수화해 src/content/rank-table.js에 쓴다.
// 점수 규칙(src/engine/rank.js)을 바꾸면 `node scripts/gen-rank.mjs`로 다시 생성한다.
import fs from 'node:fs';
import { analyze } from '../src/engine/chart.js';
import { rankScore, allPillars, RANK_CATS, PARTS } from '../src/engine/rank.js';
import { sexIndex } from '../src/engine/core.js';

function build(withHour) {
  const total = new Array(1001).fill(0);
  const cats = Object.fromEntries(RANK_CATS.map(([k]) => [k, new Array(101).fill(0)]));
  const ilju = Array.from({ length: 60 }, () => ({ sum: 0, n: 0, top: 0 }));
  const partSum = Object.fromEntries(PARTS.map(([k]) => [k, 0]));
  let totalSum = 0;
  const scores = [];
  let n = 0;
  for (const p of allPillars(withHour)) {
    const s = rankScore(analyze(p));
    total[Math.round(s.total * 10)]++;
    for (const [k] of RANK_CATS) cats[k][s.cats[k]]++;
    const ij = ilju[sexIndex(p.day)];
    ij.sum += s.total; ij.n++;
    scores.push(s.total);
    for (const [k] of PARTS) partSum[k] += s.parts[k];
    totalSum += s.total;
    n++;
  }
  // 상위 10% 경계
  const sorted = Float64Array.from(scores).sort();
  const cut = sorted[Math.floor(n * 0.9)];
  const avg = Object.fromEntries(PARTS.map(([k]) => [k, Math.round((partSum[k] / n) * 100) / 100]));
  return { n, total, cats, ilju, cut, avg, avgTotal: Math.round((totalSum / n) * 10) / 10 };
}
const t0 = Date.now();
const four = build(true);
const three = build(false);
// 일주별 평균과 상위 10% 비율 (4기둥 기준)
const iljuStats = four.ilju.map((x) => ({ mean: Math.round((x.sum / x.n) * 10) / 10 }));
const trim = (arr) => { let e = arr.length; while (e > 0 && arr[e - 1] === 0) e--; return arr.slice(0, e); };
const pack = (t) => ({ n: t.n, avgTotal: t.avgTotal, avg: t.avg, total: trim(t.total), cats: Object.fromEntries(Object.entries(t.cats).map(([k, v]) => [k, trim(v)])) });
const out = `// 자동 생성 파일 — scripts/gen-rank.mjs가 만든다. 직접 고치지 말 것.
// 4기둥 ${four.n.toLocaleString()}가지, 3기둥(시간 모름) ${three.n.toLocaleString()}가지 원국의 점수 분포.
export default ${JSON.stringify({ four: pack(four), three: pack(three), ilju: iljuStats })};
`;
fs.writeFileSync('src/content/rank-table.js', out);
const mean = (h, scale) => h.reduce((s, c, i) => s + c * i / scale, 0) / h.reduce((s, c) => s + c, 0);
console.log(`생성 완료 ${Date.now() - t0}ms · 4기둥 평균 ${mean(four.total, 10).toFixed(1)} · 상위10% 경계 ${four.cut} · 파일 ${(out.length / 1024).toFixed(1)}KB`);
for (const [k] of RANK_CATS) console.log(k, mean(four.cats[k], 1).toFixed(1));
