// 연간·월별 엔진 결과를 나란히 읽는다. 동점인 달은 모두 남긴다.
import { tr } from '../i18n/runtime.js';
import { esc } from '../site/util.js';

const prompts = {
  career: ['새 일을 맡기 전, 마칠 일과 필요한 지원을 먼저 정해 보세요.', 'Before accepting a new project, decide what to finish and what help you need.'],
  money: ['예정된 지출을 달력에 적고, 들어올 돈과 이미 쓸 수 있는 돈을 구분해 보세요.', 'Put planned expenses on the calendar and distinguish expected income from money available now.'],
  love: ['상대에게 기대하는 일 하나를 요청으로 바꾸고, 이야기할 시간을 함께 골라 보세요.', 'Turn one expectation into a request and agree on a time to talk.'],
  move: ['이동이나 변화를 계획할 때 비용, 이동 시간, 취소 가능한 마지막 날을 확인해 보세요.', 'For a move or a change of plans, check the cost, travel time and last cancellation date.'],
  health: ['바쁜 주에도 지킬 수 있는 식사와 휴식 시간을 먼저 잡아 보세요.', 'Choose meal and rest times you can keep even in a busy week.'],
  social: ['일정을 더 잡기 전에 이미 한 약속을 살펴보고, 먼저 안부를 묻고 싶은 사람을 골라 보세요.', 'Review existing commitments and choose someone you would like to catch up with.'],
  study: ['공부할 범위를 작은 단위로 나누고, 책을 덮은 뒤 직접 설명해 볼 날을 잡아 보세요.', 'Break the material into small topics and set a day to explain one without your notes.'],
};
const action = key => tr(...prompts[key]);
const monthName = m => tr(`${m}월`, `M${m}`);

function categoryCalendar(category, months) {
  const rows = months.map(month => ({ m: month.m, score: month.cats.find(c => c.key === category.key).score }));
  const scores = rows.map(r => r.score);
  const high = Math.max(...scores), low = Math.min(...scores);
  const when = score => rows.filter(r => r.score === score).map(r => monthName(r.m)).join(', ');
  const range = high === low ? tr(`열두 달 모두 ${high}점으로 같습니다.`, `All twelve months score ${high}.`)
    : tr(`힘을 써 볼 달은 ${when(high)}(${high}점), 일정을 여유 있게 잡을 달은 ${when(low)}(${low}점)입니다.`,
      `Consider ${when(high)} (${high}) for extra effort. Leave more room in ${when(low)} (${low}).`);
  return `<article class="annual-topic"><h4>${esc(category.name)}</h4><p>${range}</p><p>${action(category.key)}</p></article>`;
}

function quarterPlan(months, start) {
  const segment = months.slice(start, start + 3);
  const first = segment[0], last = segment[2];
  const change = last.score - first.score;
  const trend = change === 0
    ? tr(`시작과 끝의 종합 점수가 ${first.score}점으로 같습니다.`, `The opening and closing months both score ${first.score}.`)
    : tr(`${first.m}월 ${first.score}점에서 ${last.m}월 ${last.score}점으로 ${Math.abs(change)}점 ${change > 0 ? '높아집니다' : '낮아집니다'}.`, `Overall scores move from ${first.score} in M${first.m} to ${last.score} in M${last.m}.`);
  const peak = segment.reduce((a, b) => a.score >= b.score ? a : b);
  const strongest = peak.cats.reduce((a, b) => a.score >= b.score ? a : b);
  return `<article class="annual-topic"><h4>${monthName(first.m)} – ${monthName(last.m)}</h4><p>${trend}
    ${tr(`세 달 중 종합 점수가 가장 높은 달을 하나 꼽으면 ${peak.m}월입니다. 그달의 강점은 ${strongest.name}(${strongest.score}점)입니다.`, `M${peak.m} is one of the strongest overall months in this period. Its leading area is ${strongest.name} (${strongest.score}).`)}</p><p>${action(strongest.key)}</p></article>`;
}

export function annualPlan(yr, months) {
  const lowest = Math.min(...yr.cats.map(c => c.score));
  const focus = yr.cats.filter(c => c.score === lowest);
  return `<section class="reading-chapter box card" id="reading-quarters"><h2>${tr('세 달씩 세우는 계획', 'Planning three months at a time')}</h2>
    ${[0, 3, 6, 9].map(start => quarterPlan(months, start)).join('')}</section>
    <section class="reading-chapter box card" id="reading-plan"><h2>${tr('분야별 계획 달력', 'Your calendar by area')}</h2>
    <p>${tr('같은 분야 안에서 내 열두 달을 비교했습니다. 한 달의 종합 점수가 낮아도 집중할 분야에 따라 흐름은 달라집니다.', 'Each comparison uses twelve scores from the same area. A month with a lower overall score may still suit a particular goal.')}</p>
    ${yr.cats.map(c => categoryCalendar(c, months)).join('')}</section>
    <section class="reading-chapter box card" id="reading-closing"><h2>${tr('풀이를 읽고 난 뒤', 'Practical next steps')}</h2>
    <h3>${tr('좋지 않은 풀이가 마음에 남을 때', 'When a difficult reading stays with you')}</h3>
    <p>${tr('이번 풀이와 함께 살펴볼 점은 내 일정에서 직접 바꿀 수 있는 부분입니다. 중요한 결정을 앞두었다면 운세 점수와 별도로 사실, 비용, 함께 결정할 사람을 먼저 확인하세요.', 'Before a major decision, check the facts, costs and people involved. Use the reading to identify one practical adjustment you can make.')}</p>
    <p>${tr(`${yr.year}년의 일곱 분야 중 ${focus.map(c => c.name).join('·')} 점수가 상대적으로 낮습니다(${lowest}점). 이 분야에서 부담되는 약속 하나를 골라 미리 조정해 보세요.`,
      `In ${yr.year}, ${focus.map(c => c.name).join(', ')} received the lowest annual score (${lowest}). Pick one commitment in that area that you could make easier.`)}</p>
    ${focus.map(c => `<p>${action(c.key)}</p>`).join('')}
    <details class="reading-fold"><summary>${tr('계산 기준과 다시 읽는 방법', 'Calculation and review notes')}</summary>
    <p>${yr.daeun ? tr('연간 점수는 세운 68%와 해당 대운 32%를 반영합니다.', 'The annual score blends the year pillar (68%) and the active major cycle (32%).') : tr('이 해에 적용할 대운이 없어 세운만으로 연간 점수를 계산했습니다.', 'No major cycle applies for this year, so only the year pillar contributes to the annual score.')}</p>
    <p>${tr('월별 점수는 양력 각 달 15일의 절기 월주 65%와 그날의 년주 35%로 계산합니다. 연간 점수와 월별 점수는 서로 다른 기간을 설명합니다. 달이 끝나면 실제 일정과 컨디션을 적고, 다음 달에 지킬 습관 하나를 골라 보세요.', 'Monthly scores combine the solar-term month pillar on the 15th (65%) and the year pillar on that date (35%). At month end, compare the reading with your actual schedule and energy and choose one habit for next month.')}</p>
    </details></section>`;
}
