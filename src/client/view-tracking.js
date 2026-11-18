import { track } from './analytics.js';

// 실제로 절반 이상 보인 요소만 기록한다. 숨긴 탭·분리된 DOM은 노출이 아니다.
export function observeView(target, eventName, seen, params = {}, viewKey = location.pathname) {
  const path = location.pathname;
  if (seen.has(viewKey) || !window.IntersectionObserver) return;
  let visible = false, stopped = false;
  const report = () => {
    if (stopped || !visible || document.visibilityState !== 'visible' || seen.has(viewKey)) return;
    if (!target.isConnected || target.closest('[hidden], [aria-hidden="true"]')) return;
    const box = target.getBoundingClientRect();
    if (box.width <= 0 || box.height <= 0 || window.getComputedStyle(target).visibility !== 'visible') return;
    if (!track(eventName, { ...params, page_path: path, page_location: `${location.origin}${path}`, page_title: document.title })) return;
    seen.add(viewKey);
    stop();
  };
  const observer = new window.IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
    report();
  }, { threshold: [0, 0.5] });
  const stop = () => {
    stopped = true;
    observer.disconnect();
    document.removeEventListener('visibilitychange', report);
  };
  document.addEventListener('visibilitychange', report);
  observer.observe(target);
  return stop;
}
