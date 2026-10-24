import { bilingual } from '../i18n/runtime.js';
export const GUIDE_PUBLISHED = '2026-10-24';

// 경로·제목·목록·관련 링크의 단일 원본. 본문은 site/pages/guides.js에서 렌더링한다.
export const READING_GUIDES = [
  { slug: 'birth-time', copy: bilingual({
    title: '태어난 시간을 모를 때, 어디까지 읽을 수 있나요?',
    description: '출생 시각 미상, 시진 입력, 입춘과 밤 11시 30분 경계를 실제 원국 비교로 설명합니다. 다른 만세력과 결과가 다를 때 확인할 순서도 안내합니다.',
    lead: '같은 생일을 넣었는데 만세력마다 일주가 다르거나, 시간을 모른다는 이유로 아무 시각이나 넣어 본 적이 있나요? 먼저 달력과 시계 기준을 맞춰야 해석의 차이와 입력의 차이를 구분할 수 있습니다.',
  }, {
    title: 'What can you read without a birth time?',
    description: 'Compare actual charts with and without a birth time. Understand hour periods, solar-term boundaries and the 23:30 day boundary before comparing calculators.',
    lead: 'Two calculators can show different pillars for the same birthday. Before interpreting that difference, check the calendar, clock time and calculation convention. Entering a made-up time can conceal uncertainty.',
  }) },
  { slug: 'fortune-scores', copy: bilingual({
    title: '운세 60점은 무슨 뜻일까요? 점수와 해설 읽는 법',
    description: '오늘·주간·월간 운세의 실제 계산 예시로 종합 점수, 분야별 점수, 날짜 비교의 차이를 설명합니다. 성공 확률과 구분해 읽는 방법입니다.',
    lead: '오늘은 60점인데 금전운은 더 높고, 다음 날에는 종합 점수가 달라집니다. 이 숫자로 무엇을 비교할 수 있고 무엇은 알 수 없는지, 같은 가상 입력을 유지한 계산으로 살펴봅니다.',
  }, {
    title: 'What does a fortune score of 60 mean?',
    description: 'Worked daily, weekly and monthly calculations explain overall scores, area scores and date comparisons without treating them as probabilities.',
    lead: 'An overall score and a money score can differ, and tomorrow can produce another result. Keep the fictional birth details fixed to see what these numbers compare and what they cannot establish.',
  }) },
  { slug: 'compatibility', copy: bilingual({
    title: '궁합 점수를 두 사람의 대화로 바꾸는 방법',
    description: '띠 궁합, 일주 관계, 사주 궁합의 범위를 구분하고 실제 계산 예시로 분야별 차이와 시간 미상의 영향을 설명합니다.',
    lead: '궁합이 낮게 나오면 관계가 나쁘다는 뜻일까요? 이 서비스의 궁합은 전통적인 글자 관계를 정해진 규칙으로 환산한 값입니다. 두 사람이 실제로 어떻게 지내는지는 점수만으로 판단할 수 없습니다.',
  }, {
    title: 'Turn compatibility scores into a conversation',
    description: 'Understand the scope of zodiac, day-pillar and full-chart comparisons through a worked pair and a birth-time comparison.',
    lead: 'A low compatibility score cannot establish a poor relationship. This service translates traditional character relationships into numbers using its own rules. A couple’s actual experience requires a conversation.',
  }) },
  { slug: 'tojeong', copy: bilingual({
    title: '토정비결과 사주 신년운세가 다르게 나오는 이유',
    description: '같은 생일로 토정비결 괘와 사주 연간 점수를 각각 계산합니다. 음력 생일, 윤달, 월별 풀이와 판본의 차이를 확인하세요.',
    lead: '한쪽에서는 좋은 해라고 하고 다른 쪽에서는 조심하라고 하면 어느 쪽을 믿어야 할지 막막합니다. 토정비결과 사주 신년운세는 입력을 쓰는 방식부터 다릅니다. 같은 생일로 두 계산을 나란히 확인해 봅니다.',
  }, {
    title: 'Why Tojeong and annual saju readings differ',
    description: 'Calculate a Tojeong code and an annual saju score for the same fictional birthday. Learn about lunar dates, leap months and edition differences.',
    lead: 'Tojeong and annual saju readings can appear to disagree because they use different inputs and rules. Compare both calculations for the same fictional birthday before treating either as a verdict.',
  }) },
];
