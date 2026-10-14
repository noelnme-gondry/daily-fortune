// 주요 시기의 선정·점수 계산은 엔진에 두고, 화면에서 읽을 설명만 덧붙인다.
import { bandOf, year } from '../engine/fortune.js';
import { yearSignals } from '../engine/lifetime.js';

const GROUPS = {
  marriage: { name: '결혼·인연', category: 'love', selection: '인연을 상징하는 십신·합·신살과 대운, 연령 조건을 함께 계산해 신호가 두드러지는 해를 최대 3개 표시합니다. 연애운 점수 순위와는 별개입니다.' },
  child: { name: '자녀', selection: '전통적으로 자녀를 상징하는 십신과 자녀궁의 합, 연령 조건을 계산해 신호가 두드러지는 해를 최대 3개 표시합니다.' },
  money: { name: '재물 흐름', category: 'money', selection: '앞으로 15년 중 금전운 점수가 높은 3개 해입니다. 다른 해보다 높다는 뜻이며, 실제 수입 증가를 예측하는 수치는 아닙니다.' },
  move: { name: '이사·이동', category: 'move', selection: '역마와 일지·월지·년지의 충을 계산해 변화 신호가 두드러지는 해를 최대 3개 표시합니다. 이동운 점수가 높은 순서로 고른 목록은 아닙니다.' },
  caution: { name: '신중히 살필 시기', selection: '앞으로 15년 중 종합 점수가 낮은 2개 해입니다. 건강 점수가 아니라 종합 점수를 기준으로 선정하므로, 질병이나 사고를 뜻하지 않습니다.' },
};
const MOODS = {
  high: { label: '매우 좋음', badge: '기회', tone: 'positive' },
  good: { label: '좋음', badge: '기회', tone: 'positive' },
  mid: { label: '보통', badge: '보통', tone: 'neutral' },
  low: { label: '주의', badge: '주의', tone: 'caution' },
};
const TERMS = {
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
function explainTerm(term, key) {
  if (TERMS[term]) return TERMS[term];
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
      const scores = [scoreDetail('overall', '종합', annual.overall.score), ...annual.cats.map((cat) => scoreDetail(cat.key, cat.name, cat.score))];
      const related = config.category ? scores.find((score) => score.key === config.category) : scores[0];
      let { badge, tone } = related;
      const scoreText = `${related.name} ${related.score}점으로 ‘${related.label}’ 범위입니다.`;
      let summary;
      if (group.key === 'marriage') summary = `인연 관련 신호가 눈에 띄는 해입니다. ${scoreText} 만남의 신호와 관계의 전반적인 흐름을 함께 살펴보세요.`;
      if (group.key === 'money') summary = `${scoreText} 15년 중 상대적으로 높은 해에 해당하지만, 목록에 있다는 이유만으로 모든 점수가 좋은 범위인 것은 아닙니다.`;
      if (group.key === 'child') {
        badge = '관심'; tone = 'neutral';
        summary = '자녀·돌봄이라는 주제가 부각되는 것으로 읽는 해입니다. 좋고 나쁨을 매긴 점수나 임신·출산의 예측은 아닙니다. 별도의 자녀운 점수는 계산하지 않습니다.';
      }
      if (group.key === 'move') {
        badge = '변화'; tone = 'change';
        summary = `생활 환경이나 활동 범위의 변화를 상징하는 해입니다. ${scoreText} 변화 신호 자체는 좋은 일 또는 나쁜 일을 뜻하지 않습니다.`;
      }
      if (group.key === 'caution') {
        badge = related.tone === 'caution' ? '주의' : '점검'; tone = related.tone === 'caution' ? 'caution' : 'neutral';
        summary = `${scoreText} 다른 해보다 종합 점수가 낮아 표시한 시기입니다. ‘보통’이나 ‘좋음’ 범위여도 15년 안에서 상대적으로 낮으면 포함될 수 있습니다.`;
      }
      const reasons = (signals.reasons[group.key] || []).map((term) => ({ term, text: explainTerm(term, group.key) }));
      return { ...item, badge, tone, summary, selection: config.selection, scores, reasons,
        timeNote: chart.hasTime ? '' : '출생 시각을 몰라 시주를 제외해 계산했습니다. 자녀궁(시지)의 합은 확인하지 않았습니다.' };
    }) };
  });
}
