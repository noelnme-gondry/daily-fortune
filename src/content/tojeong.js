import { BRAND } from './brand.js';
import { bilingual } from '../i18n/runtime.js';

export const TOJEONG = bilingual({
  title: '[무료] 토정비결 — 올해 총운과 12개월 월별 풀이',
  h1: '무료 토정비결',
  description: '토정비결을 무료로 확인하세요. 생년월일로 144괘 중 나의 괘를 구해 총운과 음력 1~12월 풀이를 보여 드립니다. 양력·음력·윤달 입력을 지원합니다.',
  lead: '생년월일로 찾는 한 해의 이야기. 144괘에 담긴 총운과 음력 열두 달의 흐름을 읽어 보세요. 좋은 흐름과 조심할 대목까지, 모든 해설을 무료로 볼 수 있습니다.',
  source: 'https://github.com/molpass/mcp-tojeong/tree/d252dbfe9ad68a91665490f9800cefa86f90f07d',
  encyclopedia: 'https://encykorea.aks.ac.kr/Article/E0059207',
  convention: '윤달 생일은 같은 월의 평달로 보고, 보는 해에 생일 30일이 없으면 29일로 계산합니다. 이는 이 사이트의 날짜 처리 기준이며 다른 판본과 괘가 달라질 수 있습니다.',
  readingNote: '공개 한글 해설 판본을 읽는 콘텐츠입니다. 옛 표현 속 길흉은 미래에 일어날 사건의 확정이나 확률을 뜻하지 않습니다.',
  editionNote: `제공자가 1998년 개인 소장 자료를 현대 맞춤법으로 윤문했다고 밝힌 판본입니다. 원자료의 서지 정보와 전문가 감수 이력은 미확인이며, ${BRAND.name}에서 144괘 전체를 고서 원문과 대조하지는 않았습니다.`,
  faq: [
    { q: '토정비결은 월별 풀이까지 무료인가요?', a: '네. 회원가입이나 결제 없이 총운과 음력 1월부터 12월까지 모든 해설을 볼 수 있습니다.' },
    { q: '사주 신년운세와 무엇이 다른가요?', a: '사주 신년운세는 사주 원국과 세운·대운의 관계를 계산합니다. 토정비결은 음력 생년월일과 보는 해의 수로 상괘·중괘·하괘를 구하고, 그 번호에 해당하는 한글 해설을 읽습니다. 생시와 성별은 계산에 쓰지 않습니다.' },
    { q: '토정비결의 월별 운세는 양력 기준인가요?', a: '음력 1~12월 기준입니다. 한 해의 범위는 해당 연도 설날부터 다음 설날 전날까지이며, 윤달은 같은 월의 풀이를 함께 읽습니다.' },
    { q: '다른 사이트와 괘가 다를 수 있나요?', a: '네. 음력 출생 연도로 세는나이를 구하고, 보는 해의 음력 생월 날수와 월건수로 중괘를 구하는 방식을 사용합니다. 윤달과 생일 30일의 처리, 판본에 따라 결과가 달라질 수 있어 계산에 사용한 수를 결과에 공개합니다.' },
  ],
}, {
  title: 'Free Tojeong reading — annual outlook and all 12 lunar months',
  h1: 'Free Tojeong reading',
  description: 'Explore Tojeong Bigyeol for free. Your birth date selects one of 144 readings, with an annual outlook and guidance for all 12 lunar months. Solar, lunar, and leap-month birthdays are supported.',
  lead: 'A year of stories found through your birth date. Read the annual outlook and the flow of twelve lunar months in the 144 Tojeong readings. Every interpretation, including opportunities and cautions, is free.',
  convention: 'A leap-month birthday is treated as the regular month with the same number. If the target year has no day 30 in that month, day 29 is used. These are this site’s date conventions; other editions may produce a different reading.',
  readingNote: 'This is an English translation of a publicly available Korean interpretation. Favorable and unfavorable signs in this traditional text are neither certain future events nor probabilities.',
  editionNote: 'The provider describes this edition as a modern-spelling revision, made in 1998, of materials in a private collection. Bibliographic details of those materials and expert review are unverified. K-Fortune has not compared all 144 readings with historical source texts.',
  faq: [
    { q: 'Are the monthly Tojeong readings also free?', a: 'Yes. The annual outlook and all twelve lunar-month readings are available without registration or payment.' },
    { q: 'How does this differ from a Saju annual reading?', a: 'A Saju annual reading calculates relationships between the natal Four Pillars, annual influences, and ten-year cycles. Tojeong uses your lunar birth date and numbers for the target year to calculate upper, middle, and lower numbers, then looks up the corresponding interpretation. Birth time and gender are not used.' },
    { q: 'Do the monthly readings follow the solar calendar?', a: 'No. They follow lunar months 1–12. The year runs from Lunar New Year to the day before the following Lunar New Year. A leap month uses the reading for the regular month with the same number.' },
    { q: 'Can another website give me a different reading?', a: 'Yes. Here, traditional counting age is based on the lunar birth year, and the middle number uses the length and month value of the lunar birth month in the target year. Leap-month handling, birthdays on day 30, and the edition used can change the result. We show the numbers used in your calculation.' },
  ],
});

// 공유 카드 제목: 총운의 첫 문장(괘사의 첫 구절)
export const tojeongHeadline = (reading) => String(reading?.chongun || '').split(/(?<=[.!?])\s+/)[0].trim().slice(0, 80);
