import { rankGuidance } from '../engine/rank-guidance.js';
import { uiIcon } from '../site/icons.js';
import { esc } from '../site/util.js';

export function rankGuidanceView(chart, rank) {
  const g = rankGuidance(chart, rank);
  return `<section class="box card rank-guidance" aria-labelledby="rank-guidance-title">
    <div class="sec-head"><h3 id="rank-guidance-title">내게 복이 되는 습관</h3><span class="chip">나의 개운 가이드</span></div>
    <p>용신·희신과 이번 점수의 약한 항목을 일상에서 실천할 방법으로 풀었습니다.</p>
    <div class="support-grid">${g.supports.map((s) => `<article class="support-element el-${s.element}"><h4><span class="element-token">${s.name}</span>${s.role} · 나를 ${s.role === '용신' ? '균형 잡아 주는' : '도와주는'} 기운</h4>
      <dl><div><dt>${uiIcon('palette')}색</dt><dd>${s.colors.join(' · ')}</dd></div><div><dt>${uiIcon('compass')}방향</dt><dd>${s.direction}</dd></div><div><dt>${uiIcon('book')}소품</dt><dd>${s.item}</dd></div></dl><p>${s.action}</p></article>`).join('')}</div>
    <h4>점수가 낮게 나온 부분, 이렇게 챙겨 보세요</h4>
    ${g.repairs.length ? `<div class="repair-list">${g.repairs.map((r) => `<article><div><span class="repair-score">${r.name} · 평균 대비 ${r.pts}점</span><h5>${r.title}</h5><p class="hint">${esc(r.text)}</p></div><div><p>${r.action}</p><p class="repair-caution"><b>조심할 점</b> ${r.caution}</p></div></article>`).join('')}</div>` : '<p>평균보다 낮게 나온 항목은 없습니다. 지금의 균형을 지키는 생활 습관에 집중해 보세요.</p>'}
    <p class="guidance-caution">${uiIcon('shield')}<span><b>기신 ${g.caution.name} 기운을 조절할 때</b> · ${g.caution.text}을 살펴보세요.</span></p>
    <p class="hint">색·방향·소품은 전통 오행의 상징을 활용한 생활 제안입니다. 물건을 사거나 방향을 바꿔도 계산 점수가 올라가지는 않습니다.</p>
  </section>`;
}
