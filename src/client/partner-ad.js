import { track } from './analytics.js';
import { adExperimentParams } from './ad-experiment.js';

const selector = '[data-partner-ad-slot="common"]';
const viewedPaths = new Set();
const resultViewedPaths = new Set();
const exposedPaths = new Set();
let stopTracking;
let stopResultTracking;
let resultReady = false;

// 재계산으로 결과 HTML을 교체해도 기존 광고 지면을 한 개만 유지한다.
export function renderResultWithPartnerAd(out, html) {
  stopResultTracking?.();
  resultReady = false;
  const ad = document.querySelector('.partner-ad');
  out.innerHTML = html;
  if (!ad) return;
  const share = out.querySelector('.result-share + .hint');
  const experiment = adExperimentParams();
  if (share) {
    if (experiment.experiment_variant === 'B') out.prepend(ad);
    else share.after(ad);
    resultReady = true;
    if (experiment.experiment_id) {
      const path = location.pathname;
      if (!exposedPaths.has(path)) {
        exposedPaths.add(path);
        track('ad_experiment_exposure', { page_path: path });
      }
      // 큰 결과 카드 전체 대신 첫 제목의 도달을 측정한다. 읽기를 끝냈다는 뜻은 아니다.
      const start = out.querySelector('h2');
      if (start) stopResultTracking = observeView(start, 'result_view', resultViewedPaths);
    }
  } else document.querySelector('main').after(ad);
  initAdSlotTracking();
}

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
  // 계산 전 푸터 도달을 실험 결과로 섞지 않는다. 일반 콘텐츠 페이지는 기존대로 측정한다.
  if (!slot || (adExperimentParams().experiment_id && !resultReady)) return;
  stopTracking = observeView(slot, 'ad_slot_view', viewedPaths, {
    ad_provider: 'coupang', ad_slot: slot.dataset.partnerAdSlot,
  });
}

function observeView(target, eventName, seen, params = {}) {
  const path = location.pathname;
  if (seen.has(path) || !window.IntersectionObserver) return;
  let visible = false;
  const report = () => {
    if (!visible || document.visibilityState !== 'visible' || seen.has(path)) return;
    seen.add(path);
    track(eventName, {
      ...params,
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
  document.addEventListener('visibilitychange', report);
  observer.observe(target);
  return stop;
}
