import { tr } from '../i18n/runtime.js';
import { localizeClientLinks } from './language.js';
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
export function clearResultWithPartnerAd(out) {
  stopResultTracking?.();
  stopTracking?.();
  resultReady = false;
  const ad = out.querySelector('.partner-ad');
  if (ad) document.querySelector('main').after(ad);
  out.replaceChildren();
}
export function renderResultWithPartnerAd(out, html, resultParams = {}) {
  stopResultTracking?.();
  resultReady = false;
  const ad = document.querySelector('.partner-ad');
  out.innerHTML = html;
  localizeClientLinks(out);
  const summary = out.querySelector(':scope > [data-result-summary], :scope > .report-head, :scope > .tojeong-summary, :scope > .chart-card, :scope > .life > .wide') || out.firstElementChild;
  summary?.setAttribute('data-result-summary', '');
  const start = summary?.querySelector('[data-result-heading], h2, h3');
  if (start) stopResultTracking = observeView(start, 'result_view', resultViewedPaths, { measurement_version: '2', ...resultParams }, `${location.pathname}:${resultParams.reading_date || ''}`);
  if (!ad) return;
  const share = out.querySelector('.result-share + .hint');
  const experiment = adExperimentParams();
  if (share) {
    if (experiment.experiment_variant === 'B') out.prepend(ad);
    else summary.after(ad);
    resultReady = true;
    if (experiment.experiment_id) {
      const path = location.pathname;
      if (!exposedPaths.has(path)) {
        exposedPaths.add(path);
        track('ad_experiment_exposure', { page_path: path });
      }
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
      slot.querySelector('iframe')?.setAttribute('title', tr("쿠팡 파트너스 상품 광고", "Coupang Partners product advertisement"));
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

function observeView(target, eventName, seen, params = {}, viewKey = location.pathname) {
  const path = location.pathname;
  if (seen.has(viewKey) || !window.IntersectionObserver) return;
  let visible = false;
  const report = () => {
    if (!visible || document.visibilityState !== 'visible' || seen.has(viewKey)) return;
    seen.add(viewKey);
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
