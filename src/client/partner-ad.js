import { track } from './analytics.js';

const selector = '[data-partner-ad-slot="common"]';
const viewedPaths = new Set();
let stopTracking;

export function initPartnerAd() {
  const slot = document.querySelector(selector);
  if (!slot || slot.dataset.adState) return;
  slot.dataset.adState = 'loading';
  const mount = () => {
    try {
      // 공식 g.js의 container 옵션으로 비동기 로드 후에도 지정한 지면에 삽입한다.
      new window.PartnersCoupang.G({ ...JSON.parse(slot.dataset.partnerAdConfig), container: slot });
      slot.querySelector('iframe')?.setAttribute('title', '쿠팡 파트너스 상품 광고');
      slot.dataset.adState = 'initialized';
    } catch (error) { slot.dataset.adState = 'unavailable'; }
  };
  if (window.PartnersCoupang?.G) return mount();
  const script = document.createElement('script');
  script.src = 'https://ads-partners.coupang.com/g.js';
  script.async = true;
  script.onload = mount;
  script.onerror = () => { slot.dataset.adState = 'unavailable'; };
  document.head.append(script);
}

// 광고의 실제 송출·구매가 아니라, 사용자가 공통 광고 영역까지 도달했는지를 측정한다.
export function initAdSlotTracking() {
  stopTracking?.();
  const slot = document.querySelector(selector);
  const path = location.pathname;
  if (!slot || viewedPaths.has(path) || !window.IntersectionObserver) return;
  let visible = false;
  const report = () => {
    if (!visible || document.visibilityState !== 'visible' || viewedPaths.has(path)) return;
    viewedPaths.add(path);
    track('ad_slot_view', {
      ad_provider: 'coupang', ad_slot: slot.dataset.partnerAdSlot,
      page_path: path, page_location: `${location.origin}${path}`, page_title: document.title,
    });
    stop();
  };
  const observer = new window.IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
    report();
  }, { threshold: [0, 0.5] });
  const stop = () => {
    observer.disconnect();
    document.removeEventListener('visibilitychange', report);
  };
  stopTracking = stop;
  document.addEventListener('visibilitychange', report);
  observer.observe(slot);
}
