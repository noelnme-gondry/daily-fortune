// 기존 계산 결과를 선택해 읽는 UI. 점수나 관계 산식은 바꾸지 않는다.
import { BR_H, branchRels } from '../engine/core.js';
import { tr } from '../i18n/runtime.js';
import { term } from '../i18n/terms.js';
import { esc } from '../site/util.js';

let sequence = 0;
const explanations = () => ({
  합: tr('육합은 두 지지의 연결과 조화를 읽는 전통 관계입니다.', 'A six-combination is traditionally read as a connection between two branches.'),
  삼합: tr('삼합을 이루는 세 지지 중 두 글자가 있습니다. 세 글자가 모두 갖춰진 삼합과는 구분해 읽습니다.', 'These are two of the three branches in a trine. This pair alone is not a complete three-branch trine.'),
  충: tr('충은 두 지지의 대립과 변화를 읽는 전통 관계입니다. 실제 갈등이나 사고를 예고하지 않습니다.', 'A clash is traditionally associated with contrast and change. It does not predict conflict or accidents.'),
  형: tr('형은 긴장과 조율을 읽는 전통 관계입니다. 실제 처벌이나 사건을 뜻하지 않습니다.', 'A penalty is a traditional symbol of tension and adjustment, not a prediction of punishment or events.'),
  원진: tr('원진은 차이와 오해를 살피는 전통 관계입니다. 사람 사이의 불화를 확정하지 않습니다.', 'Friction is traditionally used to reflect on differences and misunderstandings. It does not determine a relationship’s outcome.'),
  해: tr('해는 어긋남을 읽는 전통 관계입니다. 실제 피해를 예고하지 않습니다.', 'Harm is a traditional symbol of misalignment, not a prediction of actual harm.'),
  파: tr('파는 변화와 재정비를 읽는 전통 관계입니다. 실제 파탄을 뜻하지 않습니다.', 'A break is traditionally associated with change and reorganization, not actual breakdown.'),
});

export function chartRelations(chart) {
  const id = `relations-${++sequence}`;
  const pairs = chart.cols.flatMap((a, i) => chart.cols.slice(i + 1).flatMap(b =>
    branchRels(a.b, b.b).map(kind => ({ a, b, kind }))));
  const descriptions = explanations();
  return `<section class="chart-relations" aria-label="${tr('원국 지지 관계', 'Natal branch relationships')}"><h3>${tr('내 원국에서 관계 읽기', 'Explore relationships in your chart')}</h3>
    ${pairs.length ? `<div class="relation-choices" role="group" aria-label="${tr('관계 선택', 'Choose a relationship')}">${pairs.map(({ a, b, kind }, i) => `<button type="button" class="relation-trigger" data-chart-relation="${a.pos},${b.pos}" aria-pressed="false" aria-controls="${id}-${i}">${term(a.label)} ${BR_H[a.b]} · ${term(b.label)} ${BR_H[b.b]} — ${kind === '삼합' ? tr('삼합의 두 글자', 'Two trine branches') : kind === '합' ? tr('육합', 'Six-combination') : term(kind)}</button>`).join('')}</div>${pairs.map(({ a, b, kind }, i) => `<div class="relation-copy" id="${id}-${i}" hidden><p>${BR_H[a.b]} · ${BR_H[b.b]}: ${esc(descriptions[kind])}</p></div>`).join('')}` : `<p>${tr('이 계산에서 두 지지 사이의 합·삼합·충·형·원진·해·파 관계가 확인되지 않았습니다. 이것만으로 사주의 좋고 나쁨을 판단하지 않습니다.', 'No pairwise combination, trine, clash, penalty, friction, harm or break was found by this calculation. This alone does not determine the quality of a chart.')}</p>`}
    <p class="hint">${tr('원국의 관계와 날짜별 운세 요인은 다릅니다. 이 관계 하나가 오늘 점수에 몇 점을 더하거나 뺐다는 뜻은 아닙니다.', 'Natal relationships differ from the factors in a daily reading. These labels do not assign a specific number of points to today’s score.')}</p>
    <details class="reading-order"><summary>${tr('처음 읽는다면', 'Where to start reading')}</summary><ol><li>${tr('일주의 위 글자인 일간을 먼저 확인하세요.', 'Find the Day Master: the upper character in the day pillar.')}</li><li>${tr('오행 분포와 일간 강약을 함께 읽어보세요.', 'Read the element distribution alongside Day Master strength.')}</li><li>${tr('합충과 월령을 함께 살피고 계산 모델의 범위를 확인하세요.', 'Consider relationships and the birth month together, and check the calculation’s scope.')}</li></ol><a href="/about/#limits">${tr('계산과 해석의 범위', 'Calculation and interpretation limits')}</a> · <a href="/manseryeok/#public-example">${tr('시간 모름 비교', 'Unknown-time comparison')}</a></details></section>`;
}

export function wireReadingExplorer(root) {
  root.addEventListener('click', event => {
    const relation = event.target.closest('[data-chart-relation]');
    if (relation) {
      const chart = relation.closest('.chart-card');
      const selected = relation.getAttribute('aria-pressed') !== 'true';
      chart.querySelectorAll('[data-chart-relation]').forEach(button => button.setAttribute('aria-pressed', String(selected && button === relation)));
      chart.querySelectorAll('.relation-copy').forEach(panel => { panel.hidden = !selected || panel.id !== relation.getAttribute('aria-controls'); });
      const positions = selected ? relation.dataset.chartRelation.split(',') : [];
      chart.querySelectorAll('[data-chart-branch]').forEach(cell => cell.classList.toggle('is-related', positions.includes(cell.dataset.chartBranch)));
    }
  });
}
