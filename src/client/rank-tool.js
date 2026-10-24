// 랭킹에서만 필요한 표와 명예의 전당은 다른 계산기에 로드하지 않는다.
import { tr } from '../i18n/runtime.js';
import { TIPS } from '../content/tips.js';
import { esc, tip } from './views.js';
import { rankPlay } from './rank-view.js';
import { rankGuidanceView } from './rank-guidance-view.js';
export { default as RANK_TABLE } from '../content/rank-table.js';
export { sajuRank } from '../engine/rank.js';
export { mountRankLeaders } from './rank-leaders-view.js';

/* ── 사주 랭킹 ───────────────────────────── */
export function rankView(r, c, leaderRank) {
  const of = r.of.toLocaleString('ko-KR');
  const reasons = r.reasons.map((x) => `<li class="${x.pts >= 0 ? 'up' : 'down'}"><span class="pts num">${x.pts >= 0 ? '+' : ''}${x.pts}</span><span><b>${x.name}</b> ${esc(x.text)}</span></li>`).join('');
  return `<section class="report-head card rank-head"><div class="tier tier-${r.tier.code.replace('+', 'p')}"><b>${r.tier.code}</b><span>${tr("등급", "Tier")}</span></div><div class="report-text">
      <div class="when"><span>${tr(`${esc(c.name || "나")}의 사주 랭킹`, `${esc(c.name || "Your")} saju ranking`)}</span><span>${r.withHour ? tr("4기둥 기준", "Four pillars") : tr("3기둥(시간 모름) 기준", "Three pillars (time unknown)")}</span></div>
      <h2><span class="rank-num num">${r.rank.toLocaleString(tr('ko-KR', 'en-US'))}${tr('위', '')}</span> <small>/ ${of}${tr("가지 사주", " chart combinations")}</small></h2>
      <p><b>${tr("상위", "Top")} ${r.pct}%</b> · ${esc(r.tier.name)} — ${esc(r.tier.text)} ${tip(TIPS.rankPct, tr('순위 계산 설명', 'Ranking method'))}</p>
    </div></section>
    <section class="box card"><div class="box-head"><h3>${tr("사주 점수", "Chart score")} <b class="num">${r.total}</b>${tr("점", " pts")} <span class="muted">${tr(`(전체 평균 ${r.avgTotal}점)`, `(Average ${r.avgTotal} points)`)}</span> ${tip(TIPS.rankScore, tr('사주 점수 설명', 'Chart score explained'))}</h3></div>
      <div class="pct-bar" aria-label="${tr("상위", "Top")} ${r.pct}%"><i style="left:${Math.min(99, 100 - r.pct)}%"></i><span>${tr("하위", "Lower")}</span><span>${tr("상위", "Higher")}</span></div>
      <h4 class="sub-h">${tr("이 순위가 나온 이유 (전체 사주 평균과 비교)", "Why this rank? Compared with the average of all chart combinations")}</h4><ul class="reasons">${reasons}</ul></section>
    <section class="box card"><h3>${tr("분야별 순위", "Category rankings")}</h3><div class="rank-cats">${r.cats.map((k) => `<div class="rank-cat"><span>${k.name}</span><div class="track"><i style="width:${Math.max(2, 100 - k.pct)}%"></i></div><b>${tr("상위", "Top")} ${k.pct}%</b></div>`).join('')}</div>
      <p class="hint">${tr("사주 랭킹은 여덟 글자의 균형과 조화만 본 재미 지표입니다. 실제 삶은 대운·세운과 노력에 따라 크게 달라집니다.", "This ranking is an entertainment measure of chart balance. It is not a ranking of people or a prediction of success.")}</p></section>${rankGuidanceView(c, r)}${rankPlay(r, leaderRank)}`;
}
