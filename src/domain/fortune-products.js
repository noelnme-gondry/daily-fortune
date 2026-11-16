// 가격과 구매 단위의 단일 기준. 요청 본문의 가격은 사용하지 않는다.
export const FORTUNE_PRODUCTS = Object.freeze([
  Object.freeze({ id: 'tojeong', name: '토정비결', price: 990, currency: 'KRW', people: 1, description: '한 해의 총운과 음력 열두 달의 흐름', includes: ['한 해의 총운', '음력 1~12월 상세 풀이', '괘 계산 근거와 운세 파일'] }),
  Object.freeze({ id: 'lifetime', name: '평생 사주', price: 990, currency: 'KRW', people: 1, description: '타고난 성향부터 인생의 흐름까지', includes: ['사주 원국과 오행', '성향·직업·재물·인연 풀이', '대운·주요 시기와 운세 파일'] }),
  Object.freeze({ id: 'compatibility', name: '궁합', price: 990, currency: 'KRW', people: 2, description: '두 사람의 닮은 점과 서로를 채우는 방법', includes: ['두 사람의 사주 원국', '다섯 분야 궁합과 오행 보완', '함께 맞을 시기와 운세 파일'] }),
]);
export const fortuneProduct = id => FORTUNE_PRODUCTS.find(p => p.id === id) || null;
