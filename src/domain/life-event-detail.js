import { tr, isEnglish, bilingual } from '../i18n/runtime.js';
import { term as displayTerm } from '../i18n/terms.js';
// 주요 시기의 선정·점수 계산은 엔진에 두고, 화면에서 읽을 설명만 덧붙인다.
import { bandOf, year } from '../engine/fortune.js';
import { yearSignals, signalLabel } from '../engine/lifetime.js';

const GROUPS_KO = {
  marriage: { name: '결혼·인연', category: 'love', selection: '인연을 상징하는 십신·합·신살과 대운, 연령 조건을 함께 계산해 신호가 두드러지는 해를 최대 3개 표시합니다. 연애운 점수 순위와는 별개입니다.' },
  child: { name: '자녀', selection: '전통적으로 자녀를 상징하는 십신과 자녀궁의 합, 연령 조건을 계산해 신호가 두드러지는 해를 최대 3개 표시합니다.' },
  money: { name: '재물 흐름', category: 'money', selection: '앞으로 15년 중 금전운 점수가 높은 3개 해입니다. 다른 해보다 높다는 뜻이며, 실제 수입 증가를 예측하는 수치는 아닙니다.' },
  move: { name: '이사·이동', category: 'move', selection: '역마와 일지·월지·년지의 충을 계산해 변화 신호가 두드러지는 해를 최대 3개 표시합니다. 이동운 점수가 높은 순서로 고른 목록은 아닙니다.' },
  caution: { name: '신중히 살필 시기', selection: '앞으로 15년 중 종합 점수가 낮은 2개 해입니다. 건강 점수가 아니라 종합 점수를 기준으로 선정하므로, 질병이나 사고를 뜻하지 않습니다.' },
};
const MOODS_KO = {
  high: { label: '매우 좋음', badge: '기회', tone: 'positive' },
  good: { label: '좋음', badge: '기회', tone: 'positive' },
  mid: { label: '보통', badge: '보통', tone: 'neutral' },
  low: { label: '주의', badge: '주의', tone: 'caution' },
};
const TERMS_KO = {
  '일지 육합': '그 해의 지지와 태어난 날의 지지가 육합을 이룹니다. 전통 해석에서는 관계가 연결되는 상징으로 읽습니다.',
  '일지 삼합': '그 해의 지지와 태어난 날의 지지가 같은 삼합 무리에 속합니다. 함께 어울리는 관계의 상징입니다.',
  '홍란·천희': '기쁜 만남이나 인연을 상징하는 전통 신살입니다. 실제 결혼이 정해진다는 뜻은 아닙니다.',
  '도화': '매력과 대인 관심을 상징합니다. 관심이 늘어나는 것과 안정적인 관계가 되는 것은 별개입니다.',
  '자녀궁(시지) 합': '태어난 시간의 지지와 그 해의 지지 사이에 합 또는 삼합 관계가 있습니다. 전통 해석에서 자녀·돌봄의 주제와 연결합니다.',
  '역마': '이동과 활동 범위의 변화를 상징합니다. 이사·여행·역할 변화처럼 여러 모습으로 해석하며, 그 자체로 길흉을 정하지 않습니다.',
  '일지 충': '태어난 날의 지지와 그 해의 지지가 충을 이룹니다. 가까운 관계나 일상에 변화가 생기는 상징이며, 갈등이 반드시 발생한다는 뜻은 아닙니다.',
  '월지 충': '태어난 달의 지지와 그 해의 지지가 충을 이룹니다. 일이나 생활 환경의 변화를 살펴보는 상징입니다.',
  '년지 충': '태어난 해의 지지와 그 해의 지지가 충을 이룹니다. 주변 환경이나 사회적 관계의 변화를 살펴보는 상징입니다.',
};
const GROUPS = bilingual(GROUPS_KO, {
  marriage: { name: 'Marriage & relationships', selection: 'Up to three years are selected from traditional partner stars, combinations, special stars, major luck cycles and age conditions. This is separate from the love-score ranking.' },
  child: { name: 'Children', selection: 'Up to three years are selected from traditional child-related stars, combinations with the hour branch and age conditions.' },
  money: { name: 'Financial flow', selection: 'These are the three highest money scores in the next 15 years. They are high relative to the other years, not a prediction of increased income.' },
  move: { name: 'Moving & travel', selection: 'Up to three years with prominent change signals are selected from Travel Horse and clashes with the day, month or year branch. These are not ranked by the travel score.' },
  caution: { name: 'Years to review carefully', selection: 'These are the two lowest overall scores in the next 15 years. Selection uses the overall score, not the wellbeing score, and does not indicate illness or accidents.' },
});
const MOODS = bilingual(MOODS_KO, {
  high: { label: 'Very favorable', badge: 'Opportunity' }, good: { label: 'Favorable', badge: 'Opportunity' }, mid: { label: 'Steady', badge: 'Steady' }, low: { label: 'Take care', badge: 'Care' },
});
const TERMS = bilingual(TERMS_KO, {
  '일지 육합': 'The year branch forms a six-combination with your birth day branch. Traditional interpretation reads this as a symbol of connection.',
  '일지 삼합': 'The year branch and your birth day branch belong to the same trine group, a symbol of people coming together.',
  '홍란·천희': 'These traditional stars symbolize joyful meetings and relationships. They do not mean a marriage is certain.',
  '도화': 'Peach Blossom symbolizes charm and attention. More attention does not necessarily mean a stable relationship.',
  '자녀궁(시지) 합': 'Your birth hour branch forms a combination or trine with the year branch. Traditional interpretation links this with children and caregiving.',
  '역마': 'Travel Horse symbolizes movement and changing activities. It can refer to moving, travel or a change of role, without being favorable or unfavorable by itself.',
  '일지 충': 'The birth day branch clashes with the year branch. This symbolizes change in close relationships or routines, without making conflict inevitable.',
  '월지 충': 'The birth month branch clashes with the year branch, a symbol used to reflect on changes in work or daily surroundings.',
  '년지 충': 'The birth year branch clashes with the year branch, a symbol used to reflect on changes in surroundings or social relationships.',
});
function explainTerm(term, key) {
  if (TERMS[term]) return TERMS[term];
  if (isEnglish()) {
    if (term.endsWith('운')) return key === 'child'
      ? `${displayTerm(term.slice(0, -1))} is a Ten God traditionally associated with children in this chart. It is not an indicator of conception or childbirth.`
      : `${displayTerm(term.slice(0, -1))} is a Ten God traditionally associated with partners in this chart. It contributes to this year’s relationship signal.`;
    return 'A traditional Saju signal used when selecting this year.';
  }
  if (term.endsWith('운')) return key === 'child'
    ? `${term.slice(0, -1)}은 이 명식에서 전통적으로 자녀와 연결해 읽는 십신입니다. 임신 가능성이나 출산 여부를 나타내는 지표는 아닙니다.`
    : `${term.slice(0, -1)}은 이 명식에서 전통적으로 배우자·인연과 연결해 읽는 십신입니다. 해당 해에 인연 관련 신호로 반영되었습니다.`;
  return '이 해를 선정할 때 반영된 전통 명리의 신호입니다.';
}
const scoreDetail = (key, name, score) => ({ key, name, score, ...MOODS[bandOf(score)] });

export function lifeEventDetails(chart, events) {
  const cache = new Map();
  return events.map((group) => {
    const config = GROUPS[group.key];
    return { key: group.key, name: config.name, items: group.items.map((item) => {
      if (!cache.has(item.y)) cache.set(item.y, { annual: year(chart, item.y, 'next'), signals: yearSignals(chart, item.y) });
      const { annual, signals } = cache.get(item.y);
      const scores = [scoreDetail('overall', tr('종합', 'Overall'), annual.overall.score), ...annual.cats.map((cat) => scoreDetail(cat.key, cat.name, cat.score))];
      const related = config.category ? scores.find((score) => score.key === config.category) : scores[0];
      let { badge, tone } = related;
      const scoreText = tr(`${related.name} ${related.score}점으로 ‘${related.label}’ 범위입니다.`, `${related.name} scores ${related.score}, in the “${related.label}” range.`);
      let summary;
      if (group.key === 'marriage') summary = tr(`인연 관련 신호가 눈에 띄는 해입니다. ${scoreText} 만남의 신호와 관계의 전반적인 흐름을 함께 살펴보세요.`, `Relationship signals stand out this year. ${scoreText} Consider both the meeting signals and the overall relationship reading.`);
      if (group.key === 'money') summary = tr(`${scoreText} 15년 중 상대적으로 높은 해에 해당하지만, 목록에 있다는 이유만으로 모든 점수가 좋은 범위인 것은 아닙니다.`, `${scoreText} This is relatively high within the 15-year period, but inclusion does not mean every score is favorable.`);
      if (group.key === 'child') {
        badge = tr('관심', 'Focus'); tone = 'neutral';
        summary = tr('자녀·돌봄이라는 주제가 부각되는 것으로 읽는 해입니다. 좋고 나쁨을 매긴 점수나 임신·출산의 예측은 아닙니다. 별도의 자녀운 점수는 계산하지 않습니다.', 'This year highlights children and caregiving as a traditional theme. It is not a favorable-or-unfavorable rating or a prediction of pregnancy or childbirth. No separate children score is calculated.');
      }
      if (group.key === 'move') {
        badge = tr('변화', 'Change'); tone = 'change';
        summary = tr(`생활 환경이나 활동 범위의 변화를 상징하는 해입니다. ${scoreText} 변화 신호 자체는 좋은 일 또는 나쁜 일을 뜻하지 않습니다.`, `This year symbolizes changes in your surroundings or activities. ${scoreText} A change signal alone does not imply a favorable or unfavorable event.`);
      }
      if (group.key === 'caution') {
        badge = related.tone === 'caution' ? tr('주의', 'Care') : tr('점검', 'Review'); tone = related.tone === 'caution' ? 'caution' : 'neutral';
        summary = tr(`${scoreText} 다른 해보다 종합 점수가 낮아 표시한 시기입니다. ‘보통’이나 ‘좋음’ 범위여도 15년 안에서 상대적으로 낮으면 포함될 수 있습니다.`, `${scoreText} This year is shown because its overall score is lower than other years. Even a steady or favorable score may appear if it is relatively low within the 15-year period.`);
      }
      const reasons = (signals.reasons[group.key] || []).map((term) => ({ term: signalLabel(term), text: explainTerm(term, group.key) }));
      return { ...item, badge, tone, summary, selection: config.selection, scores, reasons,
        timeNote: chart.hasTime ? '' : tr('출생 시각을 몰라 시주를 제외해 계산했습니다. 자녀궁(시지)의 합은 확인하지 않았습니다.', 'The birth time is unknown, so the hour pillar is excluded. Combinations involving the hour branch, the traditional children palace, were not checked.') };
    }) };
  });
}
