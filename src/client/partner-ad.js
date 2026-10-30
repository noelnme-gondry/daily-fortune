import { ADSTERRA_FORMATS, ADSTERRA_SANDBOX, adsterraFormat, adsterraSource } from '../domain/adsterra.js';
import { tr } from '../i18n/runtime.js';
import { localizeClientLinks } from './language.js';
import { track } from './analytics.js';
import { adExperimentParams } from './ad-experiment.js';

const selector = '[data-partner-ad-slot="common"]';
const viewedPaths = new Set();
const luckyViewedPaths = new Set();
const resultViewedPaths = new Set();
const exposedPaths = new Set();
let stopTracking;
let stopLuckyTracking;
let stopResultTracking;
let resultReady = false;
let partnerSdk;

// 재계산으로 결과 HTML을 교체해도 기존 광고 지면을 한 개만 유지한다.
export function clearResultWithPartnerAd(out) {
  stopResultTracking?.();
  stopTracking?.();
  stopLuckyTracking?.();
  resultReady = false;
  const ad = out.querySelector('.partner-ad');
  if (ad) document.querySelector('main').after(ad);
  out.replaceChildren();
}

// iframe은 같은 DOM 노드를 다시 삽입해도 재로드된다. 광고와 그 조상만 연결된 채
// 남기고 나머지 결과를 교체한다. 평생운의 .life 내부 배치에도 같은 규칙을 쓴다.
function replaceAroundAd(out, next, ad, marker) {
  const branches = [];
  let current = ad, replacement = marker;
  while (current && replacement && current !== out && replacement !== next) {
    if (current !== ad && current.nodeName !== replacement.nodeName) return false;
    branches.push([current, replacement]);
    current = current.parentNode;
    replacement = replacement.parentNode;
  }
  if (current !== out || replacement !== next) return false;
  for (const [retained, incoming] of branches) {
    if (retained !== ad) {
      for (const { name } of [...retained.attributes]) retained.removeAttribute(name);
      for (const { name, value } of incoming.attributes) retained.setAttribute(name, value);
    }
    const parent = retained.parentNode;
    for (const child of [...parent.childNodes]) if (child !== retained) child.remove();
    let before = true;
    for (const child of [...incoming.parentNode.childNodes]) {
      if (child === incoming) before = false;
      else parent.insertBefore(child, before ? retained : null);
    }
  }
  return true;
}

export function renderResultWithPartnerAd(out, html, resultParams = {}) {
  stopResultTracking?.();
  stopTracking?.();
  stopLuckyTracking?.();
  resultReady = false;
  const ad = document.querySelector('.partner-ad');
  const next = out.cloneNode(false);
  next.innerHTML = html;
  const summary = next.querySelector(':scope > [data-result-summary], :scope > .report-head, :scope > .tojeong-summary, :scope > .chart-card, :scope > .life > .wide') || next.firstElementChild;
  const share = next.querySelector('.result-share + .hint');
  const experiment = adExperimentParams();
  const marker = document.createComment('partner-ad');
  if (ad && share) {
    if (experiment.experiment_variant === 'B') next.prepend(marker);
    else summary.after(marker);
  }
  if (!ad || !share || !replaceAroundAd(out, next, ad, marker)) {
    out.replaceChildren(...next.childNodes);
    if (ad && share) marker.replaceWith(ad);
  }
  localizeClientLinks(out);
  if (ad) initPartnerAd();
  summary?.setAttribute('data-result-summary', '');
  const start = summary?.querySelector('[data-result-heading], h2, h3');
  if (start) stopResultTracking = observeView(start, 'result_view', resultViewedPaths, { measurement_version: '2', ...resultParams }, `${location.pathname}:${resultParams.reading_date || ''}`);
  if (!ad) return;
  if (share) {
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

const commonObservers = new WeakMap();
function initCommonAd(slot) {
  if (commonObservers.has(slot)) return;
  const resize = () => {
    // CSS preserves this width even in no-fit. Keep fractions: 319.75px cannot fit 320px.
    const format = adsterraFormat(slot.getBoundingClientRect().width);
    if (slot.dataset.adFormat === (format || 'none')) return;
    slot.dataset.adFormat = format || 'none';
    if (!format) {
      slot.replaceChildren();
      slot.dataset.adState = 'no-fit';
      return;
    }
    const { width, height } = ADSTERRA_FORMATS[format];
    const frame = document.createElement('iframe');
    frame.title = tr('Adsterra 디스플레이 광고', 'Adsterra display advertisement');
    frame.width = width;
    frame.height = height;
    frame.loading = 'lazy';
    frame.referrerPolicy = 'origin';
    frame.setAttribute('sandbox', ADSTERRA_SANDBOX);
    frame.src = adsterraSource(format);
    slot.replaceChildren(frame);
    // Initialized means the container was mounted, not that an ad was delivered.
    slot.dataset.adState = 'initialized';
  };
  const observer = new window.ResizeObserver(resize);
  commonObservers.set(slot, observer);
  observer.observe(slot);
  resize();
}

export function initPartnerAd() {
  document.querySelectorAll(selector).forEach(initCommonAd);
  const slots = [...document.querySelectorAll('[data-lucky-banner-slot][data-partner-ad-config]')].filter(slot => !slot.dataset.adState);
  if (!slots.length) return;
  slots.forEach(slot => { slot.dataset.adState = 'loading'; });
  const mount = () => slots.filter(slot => slot.isConnected).forEach(slot => {
    try {
      // 공식 g.js의 container 옵션으로 비동기 로드 후에도 지정한 지면에 삽입한다.
      new window.PartnersCoupang.G({ ...JSON.parse(slot.dataset.partnerAdConfig), container: slot });
      slot.querySelector('iframe')?.setAttribute('title', tr("쿠팡 파트너스 상품 광고", "Coupang Partners product advertisement"));
      slot.dataset.adState = 'initialized';
    } catch (error) { slot.dataset.adState = 'unavailable'; }
  });
  if (window.PartnersCoupang?.G) return mount();
  partnerSdk ||= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://ads-partners.coupang.com/g.js';
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
  partnerSdk.then(mount, () => slots.forEach(slot => { slot.dataset.adState = 'unavailable'; }));
}

// 실제 송출·구매가 아닌 슬롯 도달. 같은 문서의 pathname마다 common/lucky를 각각 한 번 측정한다.
export function initAdSlotTracking() {
  stopTracking?.();
  stopLuckyTracking?.();
  // 계산 전 푸터 도달을 실험 결과로 섞지 않는다. 일반 콘텐츠 페이지는 기존대로 측정한다.
  if (adExperimentParams().experiment_id && !resultReady) return;
  const params = { ad_provider: 'coupang', ad_context: resultReady ? 'result' : 'content', ad_measurement_version: '1' };
  const slot = document.querySelector(selector);
  if (slot) stopTracking = observeView(slot, 'ad_slot_view', viewedPaths, {
    ...params, ad_provider: 'adsterra', ad_slot: 'common',
  });
  const luckySlot = resultReady && document.querySelector('[data-lucky-banner-slot]');
  // 오행별 dataset 값은 배너 선택 전용이며 분석 이벤트에는 넣지 않는다.
  if (luckySlot) stopLuckyTracking = observeView(luckySlot, 'ad_slot_view', luckyViewedPaths, {
    ...params, ad_slot: 'lucky',
  });
}

function observeView(target, eventName, seen, params = {}, viewKey = location.pathname) {
  const path = location.pathname;
  if (seen.has(viewKey) || !window.IntersectionObserver) return;
  let visible = false;
  let stopped = false;
  const report = () => {
    if (stopped || !visible || document.visibilityState !== 'visible' || seen.has(viewKey)) return;
    if (!target.isConnected || target.dataset.adState === 'no-fit' || target.closest('[hidden], [aria-hidden="true"]')) return;
    const box = target.getBoundingClientRect();
    if (box.width <= 0 || box.height <= 0 || window.getComputedStyle(target).visibility !== 'visible') return;
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
    stopped = true;
    observer.disconnect();
    document.removeEventListener('visibilitychange', report);
  };
  document.addEventListener('visibilitychange', report);
  observer.observe(target);
  return stop;
}
