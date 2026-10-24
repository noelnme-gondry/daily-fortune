// 본문 변경 이력. 빌드 날짜로 모든 페이지의 수정일을 덮지 않는다.
// 언어판은 동일 편집에서 함께 갱신했으므로 경로의 /en 접두사를 제거한다.
export const CONTENT_BASE_DATE = '2026-10-16';
export const CONTENT_REVISIONS = Object.freeze([
  { date: '2026-10-24', match: /^\/(?:$|guides\/|editorial\/|contact\/|about\/|privacy\/|saju\/|week\/|month\/|compatibility\/|saju-ranking\/)/ },
  { date: '2026-10-20', match: /^\/(?:tojeong(?:\/|$)|year(?:\/|$)|manseryeok(?:\/|$)|tti(?:\/|$)|today\/|tomorrow\/|week\/|month\/|lifetime\/|compatibility\/|life-story\/|saju-ranking\/)/ },
  { date: '2026-10-18', match: /^\/(?:about\/)/ },
]);
export function contentModified(path) {
  const base = path.replace(/^\/en(?=\/)/, '');
  return CONTENT_REVISIONS.find(r => r.match.test(base))?.date || CONTENT_BASE_DATE;
}
export const LATEST_CONTENT_DATE = CONTENT_REVISIONS.reduce((date, r) => r.date > date ? r.date : date, CONTENT_BASE_DATE);

export const FIRST_ARCHIVE_YEAR = 2026;
export function retainedYears(currentYear) {
  return Array.from({ length: Math.max(2, currentYear + 2 - FIRST_ARCHIVE_YEAR) }, (_, i) => FIRST_ARCHIVE_YEAR + i);
}
