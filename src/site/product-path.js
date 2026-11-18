// 판매 모드에서는 기존 운세 URL에 공개 예시와 구매 화면이 함께 있다.
// 무료 복구 모드에서는 계산기와 상품의 내용이 다르므로 주소를 구분한다.
export const annualPath = year => `/year/${year}/premium/`;
export function productPath(id, paidReadings, targetYear) {
  if (id === 'annual') return annualPath(targetYear);
  return paidReadings ? `/${id}/` : `/shop/${id}/`;
}
