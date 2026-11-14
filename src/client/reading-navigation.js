import { track } from './analytics.js';

// 주소에는 분야 이름만 남긴다. 인물 입력은 기존 탭 세션을 통해 이어 쓴다.
export function syncReadingNavigation(root, hash = location.hash, focus = false) {
  const target = /^#(?:reading-(?:summary|[a-z]+)|detail-\d{4}-\d{2}-\d{2}-[a-z]+)$/.test(hash) && root.querySelector(hash);
  if (target && target.id.startsWith('detail-')) {
    if (focus) { target.open = true; target.focus({ preventScroll: true }); target.scrollIntoView({ block: 'start' }); }
    return;
  }
  const nextHash = target ? hash : '#reading-summary';
  root.querySelectorAll('[data-period-link]').forEach(link => {
    const url = new URL(link.href);
    link.setAttribute('href', `${url.pathname}${url.search}${nextHash}`);
  });
  root.querySelectorAll('[data-reading-area]').forEach(link => {
    if (target && link.getAttribute('href') === hash) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  if (focus && target) {
    if (target.matches('details')) target.open = true;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'start' });
  }
}
export function wireReadingNavigation(root) {
  root.addEventListener('click', event => {
    const link = event.target.closest('.area-switch a');
    if (link) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      track('reading_area_select', { area: link.hash.split('-').at(-1), tool: root.closest('[data-tool]')?.dataset.tool });
      if (location.hash !== link.hash) window.history.pushState(null, '', link.hash);
      syncReadingNavigation(root, link.getAttribute('href'), true);
    }
  });
  window.addEventListener('hashchange', () => syncReadingNavigation(root, location.hash, true));
}
