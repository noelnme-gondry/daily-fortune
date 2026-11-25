import { READING_CHAPTERS } from './premium-reading.js';
// 가격·구매 단위·실제 목차의 단일 기준. 요청 본문의 가격은 사용하지 않는다.
const products = Object.freeze([
  ...[
    { id: 'bundle', name: '내 운세 3종 묶음', nameEn: 'Three-reading fortune bundle', people: 1, description: '한 사람의 토정비결, 평생 사주, 내년 신년운세를 990원에 한 번에 읽어보세요.' },
    { id: 'tojeong', name: '토정비결', nameEn: 'Tojeong', people: 1, description: '한 해의 흐름을 읽고, 내 생활에 맞게 준비하는 시간' },
    { id: 'lifetime', name: '평생 사주', nameEn: 'Lifetime saju', people: 1, description: '타고난 성향을 이해하고, 앞으로의 흐름을 살펴보세요' },
    { id: 'compatibility', name: '궁합', nameEn: 'Compatibility', people: 2, description: '두 사람의 차이를 이해하고, 함께 지낼 방법을 찾아보세요' },
    { id: 'annual', name: '프리미엄 신년운세', nameEn: 'Premium annual fortune', people: 1, description: '일곱 분야의 흐름을 열두 달에 펼쳐 보고, 나에게 맞는 한 해 계획을 세워 보세요.' },
  ].map(p => Object.freeze({ ...p, price: 990, currency: 'KRW', chapters: READING_CHAPTERS[p.id], includes: READING_CHAPTERS[p.id].map(c => c.title) })),
]);
export function productEdition(product, targetYear) {
  if (product.id !== 'annual') return product;
  return { ...product, name: `${targetYear}년 프리미엄 운세`, nameEn: `${targetYear} premium fortune` };
}
// 이전 단품 ID는 기존 주문의 결제 조회와 파일 복원에 사용한다.
export const fortuneProduct = id => products.find(p => p.id === id) || null;
export const FORTUNE_PRODUCTS = Object.freeze(products.filter(p => p.id === 'bundle' || p.id === 'compatibility'));
export const bundleReadings = fortuneProduct('bundle').chapters;
