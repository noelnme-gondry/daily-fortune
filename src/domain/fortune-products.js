import { READING_CHAPTERS } from './premium-reading.js';
// 가격·구매 단위·실제 목차의 단일 기준. 요청 본문의 가격은 사용하지 않는다.
export const FORTUNE_PRODUCTS = Object.freeze([
  ...[
    { id: 'tojeong', name: '토정비결', people: 1, description: '한 해의 흐름을 읽고, 내 생활에 맞게 준비하는 시간' },
    { id: 'lifetime', name: '평생 사주', people: 1, description: '타고난 성향을 이해하고, 앞으로의 흐름을 살펴보세요' },
    { id: 'compatibility', name: '궁합', people: 2, description: '두 사람의 차이를 이해하고, 함께 지낼 방법을 찾아보세요' },
  ].map(p => Object.freeze({ ...p, price: 990, currency: 'KRW', chapters: READING_CHAPTERS[p.id], includes: READING_CHAPTERS[p.id].map(c => c.title) })),
]);
export const fortuneProduct = id => FORTUNE_PRODUCTS.find(p => p.id === id) || null;
