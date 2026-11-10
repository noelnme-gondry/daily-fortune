import { tr } from '../i18n/runtime.js';
import { term, elementName } from '../i18n/terms.js';
import { pillarLabel } from '../engine/core.js';
import { daeunAt } from '../engine/chart.js';
import { STRENGTH_BANDS, BALANCE_THRESHOLD, BRANCH_STRENGTH_WEIGHT, SEASON_BONUS } from '../domain/chart-rules.js';
import { esc } from '../site/util.js';

const num = n => Number(n.toFixed(2));
export const cycleAgeNote = () => tr('나이 = 시작 연도 − 출생 연도 · 연도 단위 전환', 'Age = start year − birth year · changes by calendar year');

// 해석값을 다시 계산하지 않고 원국 엔진이 반환한 실제 근거를 표시한다.
export function chartBasis(c, today) {
  const basis = c.analysisBasis, cycle = c.cycleBasis;
  const current = daeunAt(c, today.y), first = c.daeun[0];
  const bands = STRENGTH_BANDS.map((b, i) => `<tr${b.label === c.strengthLabel ? ' class="basis-current"' : ''}><th scope="row">${term(b.label)}</th><td>${b.min * 100}% ${tr('이상', 'or more')}${STRENGTH_BANDS[i + 1] ? ` · ${STRENGTH_BANDS[i + 1].min * 100}% ${tr('미만', 'below')}` : ''}</td></tr>`).join('');
  const groups = ['비겁', '식상', '재성', '관성', '인성'];
  const rows = c.groupW.map((v, i) => `<tr><th scope="row">${tr(groups[i], ['Peers', 'Output', 'Wealth', 'Officer', 'Resource'][i])}</th><td>${num(v)}</td><td>${i === 0 || i === 4 ? tr('돕는 힘에 포함', 'Counted as support') : tr('전체 힘에만 포함', 'Counted in total only')}</td></tr>`).join('');
  const roles = ['yong', 'hee', 'han', 'gu', 'gi'];
  const roleNames = ['용신', '희신', '한신', '구신', '기신'];
  const preference = roles.map((role, i) => `<tr><th scope="row">${elementName(c.roles[role])}</th><td>${num(c.fav[c.roles[role]])}</td><td>${term(roleNames[i])}</td></tr>`).join('');
  return `<details class="chart-basis"><summary>${tr('강약·용신·대운은 어떻게 정했나요?', 'How were strength, useful elements and cycles determined?')}</summary>
    <section><h3>${tr('1. 일간을 돕는 비율', '1. The support ratio')}</h3>
      <p data-strength-evidence>${tr(`돕는 힘 ${num(basis.support)} ÷ 전체 힘 ${num(basis.total)} = ${(c.ratio * 100).toFixed(1)}%. 이 서비스의 기준으로는 ‘${c.strengthLabel}’입니다.`, `Support ${num(basis.support)} ÷ total ${num(basis.total)} = ${(c.ratio * 100).toFixed(1)}%. This falls in the “${term(c.strengthLabel)}” band.`)}</p>
      <p>${tr(`겉글자 개수를 나누는 계산이 아닙니다. 일간 자신은 빼고 다른 천간은 각각 1로 셉니다. 지장간은 배정 일수/30에 월지 ${BRANCH_STRENGTH_WEIGHT.month}배, 일지 ${BRANCH_STRENGTH_WEIGHT.day}배, 년지·시지 1배를 곱합니다. 같은 오행인 비겁과 일간을 생하는 인성을 돕는 힘으로 합칩니다.`, `This is not a percentage of visible characters. The Day Master itself is excluded; other visible stems each count as 1. Hidden stems use their assigned days divided by 30, weighted ${BRANCH_STRENGTH_WEIGHT.month} for the month branch, ${BRANCH_STRENGTH_WEIGHT.day} for the day branch, and 1 for the year/hour branches. Peer and Resource groups contribute to support.`)}</p>
      <div class="table-wrap" tabindex="0" role="region" aria-label="${tr('강약 가중치와 판정 구간', 'Strength weights and bands')}"><table><caption>${tr('이 원국의 가중 합계', 'Weighted totals for this chart')}</caption><thead><tr><th scope="col">${tr('그룹', 'Group')}</th><th scope="col">${tr('가중값', 'Weight')}</th><th scope="col">${tr('반영 방식', 'Use')}</th></tr></thead><tbody>${rows}</tbody></table><table><caption>${tr('이 서비스의 판정 구간', 'Classification bands used here')}</caption><tbody>${bands}</tbody></table></div>
      <p class="hint">${tr('표시값은 반올림하지만 판정에는 반올림 전 값을 씁니다. 가중치와 구간은 이 서비스의 모델 기준이며 능력·건강이나 예측 정확도를 측정한 값이 아닙니다. 다른 서비스의 득령·득지 판정이나 합화 보정과는 결과가 달라질 수 있습니다.', 'Displayed values are rounded; classification uses unrounded values. Weights and thresholds belong to this service’s model, not a measure of ability, health or predictive accuracy. Other services may use different seasonal support, branch support or transformation rules.')}</p>
    </section>
    <section><h3>${tr('2. 용신은 오행 선호도의 첫 번째', '2. Useful elements rank the model’s preferences')}</h3>
      <p>${tr(`이 원국은 억부 기준 ${BALANCE_THRESHOLD * 100}%${c.strong ? ' 이상이므로 기운을 덜어 주는' : ' 미만이므로 기운을 보태는'} 방향에서 선호도를 계산합니다. 이 기준은 위의 다섯 강약 구간과 별개라서 ‘중화’ 안에서도 방향이 갈릴 수 있습니다.`, `This chart is ${c.strong ? 'at or above' : 'below'} the ${BALANCE_THRESHOLD * 100}% balancing threshold, so the model favors ${c.strong ? 'channeling excess' : 'adding support'}. This threshold is separate from the five strength bands; charts within the Balanced band can follow either direction.`)}</p>
      <p data-season-evidence>${basis.seasonalElement === null ? tr('이번 원국에는 계절 가산 조건이 적용되지 않았습니다.', 'No seasonal bonus applies to this chart.') : tr(`이번 원국에는 ${elementName(basis.seasonalElement)} 선호도에 계절 보정 +${SEASON_BONUS}이 적용됐습니다.`, `A seasonal bonus of +${SEASON_BONUS} was added to ${elementName(basis.seasonalElement)}.`)} ${tr('겨울의 해·자·축월에 화 겉글자가 1개 이하이면 화, 여름의 사·오·미월에 수 겉글자가 1개 이하이면 수에 더합니다.', 'The bonus favors Fire in Hai/Zi/Chou months if visible Fire is at most one, or Water in Si/Wu/Wei months if visible Water is at most one.')}</p>
      <div class="table-wrap" tabindex="0" role="region" aria-label="${tr('용신 선호도 순서', 'Element preference ranking')}"><table><caption>${tr('억부와 계절 보정을 합친 순서', 'Combined balancing and seasonal preferences')}</caption><thead><tr><th scope="col">${tr('오행', 'Element')}</th><th scope="col">${tr('모델 선호도', 'Model preference')}</th><th scope="col">${tr('역할', 'Role')}</th></tr></thead><tbody>${preference}</tbody></table></div>
      <p class="hint">${tr('선호도는 확률이나 오행의 양이 아닙니다. 억부용신과 조후용신을 따로 고르는 방식, 격국·종격을 먼저 판정하는 방식과 직접 일치하지 않습니다. 동점이면 목·화·토·금·수 순서가 적용됩니다.', 'Preference is neither a probability nor an element quantity. This combined ranking differs from separate balancing/climate useful elements or special-pattern classifications. Ties follow Wood, Fire, Earth, Metal, Water order.')}</p>
    </section>
    <section><h3>${tr('3. 대운의 방향과 시작 연도', '3. Cycle direction and start year')}</h3>
      <p data-cycle-evidence>${tr(`이 원국은 ${cycle.forward ? '순행으로 다음' : '역행으로 이전'} 절기까지의 간격을 환산합니다. 환산 간격은 ${cycle.years}년 ${cycle.months}개월 ${cycle.days}일이며 첫 대운은 ${first.startYear}년 ${pillarLabel(first)}입니다.`, `This chart runs ${cycle.forward ? 'forward toward the next' : 'backward toward the previous'} solar term. The converted interval is ${cycle.years} years, ${cycle.months} months and ${cycle.days} days; the first cycle is ${pillarLabel(first)} in ${first.startYear}.`)}</p>
      <p>${tr('양년생 남성·음년생 여성은 순행, 반대는 역행합니다. 절기까지 3일을 1년으로 환산하는 계열이며 시진 차이도 반영합니다. 날짜 차이를 정수로 나누고 반올림하는 방식과 시작 연도가 달라질 수 있습니다.', 'Yang-year males and yin-year females run forward; the opposite combinations run backward. The conversion uses three days per year and includes two-hour interval differences. Integer-day division and rounding can produce a different start year.')}</p>
      <p data-current-cycle>${current ? tr(`${today.y}년에는 ${current.startYear}~${current.startYear + 9}년 구간의 ${pillarLabel(current)}을 적용합니다.`, `For ${today.y}, the applied cycle is ${pillarLabel(current)}, covering ${current.startYear}–${current.startYear + 9}.`) : tr(`${today.y}년은 첫 대운 시작 전입니다.`, `${today.y} is before the first cycle.`)} ${tr('이 서비스는 시작 연도부터 대운을 적용하며 정확한 교체 월·일로 전환하지 않습니다.', 'This service switches cycles by start year, not by the exact transition month and day.')}</p>
      <p class="hint">${cycleAgeNote()}. ${tr('생일 기준 만 나이나 출생년을 1세로 세는 나이와 구분하세요. 비교할 때는 나이 숫자뿐 아니라 시작 연도와 첫 간지를 함께 확인하세요.', 'This differs from birthday-based age and counting the birth year as age one. Compare start years and first pillars as well as the age number.')}</p>
      ${!c.hasTime ? `<p class="note">${tr('시간 미상: 시주를 제외하고 강약·용신을 계산했습니다. 절기와 대운은 정오를 참고하므로 실제 생시를 알게 되면 다시 비교하세요.', 'Time unknown: strength and useful elements exclude the hour pillar. Solar terms and cycles use noon as a reference; compare again if the birth time becomes available.')}</p>` : ''}
    </section>
    <a href="/about/#interpretation-differences">${esc(tr('다른 서비스와 비교할 때 확인할 기준', 'What to check when comparing services'))}</a>
  </details>`;
}
