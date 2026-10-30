import { tr } from '../i18n/runtime.js';
import { ZODIAC_OPPORTUNITY, ZODIAC_CAREFUL_OPPORTUNITY, ZODIAC_CAUTION, ZODIAC_ELEMENT_CAUTION, ZODIAC_CATEGORY_OUTLOOK } from '../content/zodiac-outlook.js';

const localized = (pair) => tr(...pair);
const ELEMENT_OPPORTUNITY = { 0: 'peers', 2: 'money', 4: 'learning' };

export function zodiacOutlook({ rel, e, es, score }) {
  const relation = rel === '합' ? 'agreement' : rel === '삼합' ? 'teamwork' : null;
  const elements = [...new Set([e, es].filter((value) => value !== undefined))];
  const opportunities = [relation, ...elements.map((value) => ELEMENT_OPPORTUNITY[value])].filter(Boolean);
  const cautions = [ZODIAC_CAUTION[rel], ...elements.map((value) => ZODIAC_ELEMENT_CAUTION[value])].filter(Boolean);
  const opening = score >= 75
    ? tr('기다리던 반응이나 반가운 만남에 기대를 걸어 볼 만한 흐름입니다.', 'There is room to look forward to an awaited response or a welcome encounter.')
    : score >= 60 ? '' : tr('전체적으로는 속도를 조절하며 챙길 것을 챙기는 편이 좋습니다.', 'Overall, take a measured pace and attend to practical details.');
  const copy = score >= 60 ? ZODIAC_OPPORTUNITY : ZODIAC_CAREFUL_OPPORTUNITY;
  const strength = opportunities.length ? opportunities.map((key) => localized(copy[key])).join(' ')
    : score >= 60
      ? tr('업무운에서는 내 아이디어가 호응을 얻거나 맡은 일을 마무리하는 뿌듯함을 기대해 볼 만합니다.', 'At work, your idea may receive interest, or finishing a task may bring satisfaction.')
      : tr('업무운은 반응이 늦어도 내 수고를 낮춰 보지 않는 것이 필요합니다. 부담을 나누며 한 가지씩 이어 가세요.', 'At work, a slow response need not diminish your effort. Share the load and continue one thing at a time.');
  return {
    outlook: [opening, strength].filter(Boolean).join(' '),
    caution: cautions.length ? cautions.map(localized).join(' ') : tr('새로운 약속은 지금 맡은 일과 겹치지 않는지 확인하세요.', 'Check that new commitments fit with what you already have to do.'),
  };
}

export function zodiacCategoryOutlook(cat, score) {
  return localized(ZODIAC_CATEGORY_OUTLOOK[cat][score >= 75 ? 0 : score >= 60 ? 1 : 2]);
}

export function zodiacYearSummary(cats) {
  const high = Math.max(...cats.map((c) => c.score)), low = Math.min(...cats.map((c) => c.score));
  if (high === low) return tr(`다섯 분야가 모두 ${high}점으로, 어느 한 운이 더 높지는 않습니다.`, `All five areas score ${high}; none ranks above the others.`)
    + ' ' + (high >= 60 ? tr('일과 관계에서 작은 계획을 꾸준히 이어 가기 좋은 흐름입니다.', 'The reading favors steady, manageable plans in work and relationships.')
      : tr('새 일을 늘리기보다 지출과 일정을 점검하고 충분히 쉬는 편이 좋습니다.', 'Review spending and schedules, and make room for rest before taking on more.'));
  const top = cats.filter((c) => c.score === high), bottom = cats.filter((c) => c.score === low);
  const names = (rows) => rows.map((c) => c.name).join(tr('·', ', '));
  const lead = high >= 60
    ? tr(`가장 활용해 볼 운은 ${names(top)}(${high}점)입니다.`, `The strongest area to make use of is ${names(top)} (${high}).`)
    : tr(`${names(top)}(${high}점)이 상대적으로 높지만, 전반적으로는 신중하게 움직이는 편이 좋습니다.`, `${names(top)} (${high}) ranks higher, but the overall reading still calls for care.`);
  const contrast = low < 60
    ? tr(`${names(bottom)}(${low}점)은 주의해서 살필 부분입니다.`, `${names(bottom)} (${low}) needs care.`)
    : tr(`${names(bottom)}도 ${low}점으로, 낮은 점수대는 아닙니다.`, `${names(bottom)} still scores ${low}, outside the cautious range.`);
  return `${lead} ${zodiacCategoryOutlook(top[0].key, high)} ${contrast} ${low < 60 ? zodiacCategoryOutlook(bottom[0].key, low) : ''}`.trim();
}
