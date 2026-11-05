// 주소에는 분야 이름만 남긴다. 인물 입력은 기존 탭 세션을 통해 이어 쓴다.
export function syncReadingNavigation(root, hash = location.hash, focus = false) {
  const target = /^#reading-(summary|[a-z]+)$/.test(hash) && root.querySelector(hash);
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
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'start' });
  }
}
export function wireReadingNavigation(root) {
  root.addEventListener('click', event => {
    const link = event.target.closest('[data-reading-area]');
    if (link) syncReadingNavigation(root, link.getAttribute('href'));
  });
  window.addEventListener('hashchange', () => syncReadingNavigation(root, location.hash, true));
}
