// 랭킹에서만 필요한 표와 명예의 전당은 다른 계산기에 로드하지 않는다.
import { tr } from '../i18n/runtime.js';
import { TIPS } from '../content/tips.js';
import RANK_TABLE from '../content/rank-table.js';
import { esc, tip } from './views.js';
import { rankPlay } from './rank-view.js';
import { rankGuidanceView } from './rank-guidance-view.js';
import { rankRevealView } from './rank-reveal.js';
import { rankLeadersView } from './rank-leaders-view.js';
export { RANK_TABLE };
export { wireRankReveal } from './rank-reveal.js';
export { sajuRank } from '../engine/rank.js';
export { mountRankLeaders } from './rank-leaders-view.js';

/* ── 사주 랭킹 ───────────────────────────── */
export function rankView(r, c, leaderRank) {
  const table = r.withHour ? RANK_TABLE.four : RANK_TABLE.three;
  const reasons = r.reasons.map((x) => `<li class="${x.pts >= 0 ? 'up' : 'down'}"><span class="pts num">${x.pts >= 0 ? '+' : ''}${x.pts}</span><span><b>${x.name}</b> ${esc(x.text)}</span></li>`).join('');
  return `${rankRevealView(r, c.name, table.total)}
    <div id="rank-details" class="rank-details" data-rank-locked hidden>
    <section class="box card"><div class="box-head"><h3>${tr("사주 점수", "Chart score")} <b class="num">${r.total}</b>${tr("점", " pts")} <span class="muted">${tr(`(전체 평균 ${r.avgTotal}점)`, `(Average ${r.avgTotal} points)`)}</span> ${tip(TIPS.rankScore, tr('사주 점수 설명', 'Chart score explained'))}</h3></div>
      <h4 class="sub-h">${tr("이 순위가 나온 이유 (전체 사주 평균과 비교)", "Why this rank? Compared with the average of all chart combinations")}</h4><ul class="reasons">${reasons}</ul></section>
    <section class="box card"><h3>${tr("분야별 순위", "Category rankings")}</h3><div class="rank-cats">${r.cats.map((k) => `<div class="rank-cat"><span>${k.name}</span><div class="track"><i style="width:${Math.max(2, 100 - k.pct)}%"></i></div><b>${tr("상위", "Top")} ${k.pct}%</b></div>`).join('')}</div>
      <p class="hint">${tr("사주 랭킹은 여덟 글자의 균형과 조화만 본 재미 지표입니다. 실제 삶은 대운·세운과 노력에 따라 크게 달라집니다.", "This ranking is an entertainment measure of chart balance. It is not a ranking of people or a prediction of success.")}</p></section>${rankGuidanceView(c, r)}${rankPlay(r)}</div>${rankLeadersView(leaderRank)}`;
}
