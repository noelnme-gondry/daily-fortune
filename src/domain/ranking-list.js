// 명예의 전당과 궁합 추천의 목록 크기·페이지 단위는 한곳에서 관리한다.
export const RANKING_LIMIT = 100;
export const RANKING_PAGE_SIZE = 5;

export function rankingPage(rows, requested = 1) {
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / RANKING_PAGE_SIZE));
  const page = Math.max(1, Math.min(pages, Math.trunc(Number(requested)) || 1));
  const start = (page - 1) * RANKING_PAGE_SIZE;
  const end = Math.min(start + RANKING_PAGE_SIZE, total);
  return { page, pages, start, end, total, items: rows.slice(start, end) };
}
