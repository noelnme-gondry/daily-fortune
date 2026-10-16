import { tr } from '../i18n/runtime.js';
import { term } from '../i18n/terms.js';
import { rankGuidance } from '../engine/rank-guidance.js';
import { uiIcon } from '../site/icons.js';
import { esc } from '../site/util.js';

export function rankGuidanceView(chart, rank) {
  const g = rankGuidance(chart, rank);
  return `<section class="box card rank-guidance" aria-labelledby="rank-guidance-title">
    <div class="sec-head"><h3 id="rank-guidance-title">${tr("내게 복이 되는 습관", "Habits that support your balance")}</h3><span class="chip">${tr("나의 개운 가이드", "My balance guide")}</span></div>
    <p>${tr("용신·희신과 이번 점수의 약한 항목을 일상에서 실천할 방법으로 풀었습니다.", "Everyday suggestions based on your balancing and supporting elements and lower-scoring components.")}</p>
    <div class="support-grid">${g.supports.map((s) => `<article class="support-element el-${s.element}"><h4><span class="element-token">${s.name}</span>${term(s.role)} · ${tr(`나를 ${s.role === term('용신') ? '균형 잡아 주는' : '도와주는'} 기운`, s.role === term('용신') ? 'Balancing energy' : 'Supporting energy')}</h4>
      <dl><div><dt>${uiIcon('palette')}${tr("색", "Colors")}</dt><dd>${s.colors.join(' · ')}</dd></div><div><dt>${uiIcon('compass')}${tr("방향", "Direction")}</dt><dd>${s.direction}</dd></div><div><dt>${uiIcon('book')}${tr("소품", "Item")}</dt><dd>${s.item}</dd></div></dl><p>${s.action}</p></article>`).join('')}</div>
    <h4>${tr("점수가 낮게 나온 부분, 이렇게 챙겨 보세요", "Ways to support lower-scoring areas")}</h4>
    ${g.repairs.length ? `<div class="repair-list">${g.repairs.map((r) => `<article><div><span class="repair-score">${r.name} · ${tr(`평균 대비 ${r.pts}점`, `${r.pts} pts vs. average`)}</span><h5>${r.title}</h5><p class="hint">${esc(r.text)}</p></div><div><p>${r.action}</p><p class="repair-caution"><b>${tr("조심할 점", "Watch out for")}</b> ${r.caution}</p></div></article>`).join('')}</div>` : `<p>${tr('평균보다 낮게 나온 항목은 없습니다. 지금의 균형을 지키는 생활 습관에 집중해 보세요.', 'No components fall below average. Focus on habits that maintain your current balance.')}</p>`}
    <p class="guidance-caution">${uiIcon('shield')}<span><b>${tr(`기신 ${g.caution.name} 기운을 조절할 때`, `Moderating challenging ${g.caution.name} energy`)}</b> · ${tr(`${g.caution.text}을 살펴보세요.`, g.caution.text)}</span></p>
    <p class="hint">${tr("색·방향·소품은 전통 오행의 상징을 활용한 생활 제안입니다. 물건을 사거나 방향을 바꿔도 계산 점수가 올라가지는 않습니다.", "Colors, directions and items are lifestyle suggestions drawn from traditional Five Elements symbolism. Buying objects or changing direction will not increase your calculated score.")}</p>
  </section>`;
}
