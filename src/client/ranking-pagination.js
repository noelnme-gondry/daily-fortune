import { tr } from '../i18n/runtime.js';
import { esc } from '../site/util.js';

export function rankingPagination(p, listId, label) {
  if (!p.total) return '';
  const controls = `aria-controls="${esc(listId)}"`;
  return `<nav class="ranking-pagination" aria-label="${esc(label)}${tr(" 페이지", " pages")}">
    <div class="ranking-page-summary"><p role="status">${tr(`${p.start + 1}–${p.end} / ${p.total}개 · ${p.page} / ${p.pages}페이지`, `${p.start + 1}–${p.end} of ${p.total} · Page ${p.page} of ${p.pages}`)}</p><div class="ranking-page-arrows">
      <button type="button" data-ranking-page="${p.page - 1}" data-ranking-direction="previous" ${controls}${p.page === 1 ? ' disabled' : ''} aria-label="${tr("이전 페이지", "Previous page")}">← ${tr("이전", "Previous")}</button>
      <button type="button" data-ranking-page="${p.page + 1}" data-ranking-direction="next" ${controls}${p.page === p.pages ? ' disabled' : ''} aria-label="${tr("다음 페이지", "Next page")}">${tr("다음", "Next")} →</button>
    </div></div>
    <div class="ranking-page-numbers">${Array.from({ length: p.pages }, (_, i) => `<button type="button" data-ranking-page="${i + 1}" ${controls} aria-label="${tr(`${i + 1}페이지`, `Page ${i + 1}`)}"${p.page === i + 1 ? ' aria-current="page"' : ''}>${i + 1}</button>`).join('')}</div>
  </nav>`;
}

// 페이지를 다시 그려도 키보드 초점이 문서 맨 위로 사라지지 않게 유지한다.
export function restorePaginationFocus(root, previousButton) {
  const direction = previousButton.dataset.rankingDirection;
  const target = direction ? root.querySelector(`[data-ranking-direction="${direction}"]`) : null;
  (target && !target.disabled ? target : root.querySelector('.ranking-pagination [aria-current="page"]'))?.focus({ preventScroll: true });
}
