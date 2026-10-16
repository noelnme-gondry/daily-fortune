import { tr } from '../i18n/runtime.js';
import { TIERS } from '../engine/rank.js';
import { rankLeadersView } from './rank-leaders-view.js';
import { uiIcon } from '../site/icons.js';
export function rankPlay(r, leaderRank) {
  const medals = r.cats.filter((c) => c.pct <= 20);
  return `<section class="box card rank-play"><div class="sec-head"><h3>${uiIcon('trophy')} ${tr("나의 사주 업적", "Your saju achievements")}</h3><span class="chip">${r.tier.code} · ${r.tier.name}</span></div><div class="achievement-grid">${(medals.length ? medals : [r.cats.slice().sort((a, b) => a.pct - b.pct)[0]]).map((m) => `<article><span aria-hidden="true">✦</span><b>${m.name} ${m.pct <= 20 ? tr('특화', 'specialty') : tr('주력', 'strength')}</b><span>${tr(`상위 ${m.pct}% · ${m.score}점`, `Top ${m.pct}% · ${m.score} points`)}</span></article>`).join('')}</div><h4>${tr("등급 지도", "Tier guide")}</h4><ol class="tier-ladder">${TIERS.slice().reverse().map(([lim, code, name]) => `<li${code === r.tier.code ? ' aria-current="step"' : ''}><b>${code}</b><span>${name}</span><small>${tr(`상위 ${lim}% 이내`, `Top ${lim}%`)}</small></li>`).join('')}</ol><p class="hint">${tr("이론상 원국 조합의 순위입니다. 실제 사람의 분포나 인생의 성적표가 아닙니다.", "These ranks compare theoretical birth-chart combinations, not real people or life outcomes.")}</p></section>
  ${rankLeadersView(leaderRank)}`;
}
