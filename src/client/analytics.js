// GA4 이벤트. GA_MEASUREMENT_ID가 없으면 아무것도 하지 않는다. 이름·생년월일 같은 개인정보는 보내지 않는다.
import { adExperimentParams } from './ad-experiment.js';
import { todayKST, isoDate } from '../engine/core.js';

export function track(name, params = {}) {
  try {
    let entrySource;
    if (name.startsWith('calc_')) {
      try {
        const entry = JSON.parse(sessionStorage.getItem('myod:share-entry'));
        if (entry?.path === location.pathname && Date.now() - entry.at >= 0 && Date.now() - entry.at < 1800000) entrySource = 'shared_result';
      } catch { /* 저장 차단 */ }
    }
    if (typeof window.gtag === 'function') window.gtag('event', name, {
      ...adExperimentParams(), measurement_version: '2', usage_date: isoDate(todayKST()), ...params,
      ...(entrySource ? { entry_source: entrySource } : {}),
    });
  } catch (e) { /* 분석 실패는 무시 */ }
}

// 첫 입력 변경 또는 제출만 기록하며 입력값은 읽지 않는다.
export function trackInputStart(form, tool, entryPoint = tool) {
  let started = false;
  const start = (event) => {
    if (started || event.target.matches('#save-device, #tj-save')) return;
    started = true;
    track('calc_start', { tool, entry_point: entryPoint });
  };
  for (const event of ['input', 'change', 'submit']) form.addEventListener(event, start);
}

// 페이지 공통 클릭 이벤트: 카드·CTA·탭·FAQ
export function initAutoEvents() {
  if (document.querySelector('.share-cta')) track('share_landing_view', { content_type: 'shared_result' });
  document.addEventListener('click', (e) => {
    const faq = e.target.closest('.faq-button');
    if (faq?.getAttribute('aria-expanded') === 'false') track('faq_open', { question: faq.textContent.slice(0, 90) });
    const a = e.target.closest('a');
    if (a) {
      // 공유 링크 등에 포함된 이름·결과 쿼리와 fragment를 보내지 않는다.
      const href = (a.getAttribute('href') || '').split(/[?#]/)[0];
      if (a.dataset.gaCta) {
        track('select_content', { content_type: a.dataset.gaCta, item_id: href });
        if (a.dataset.gaCta === 'share_landing') {
          try { sessionStorage.setItem('myod:share-entry', JSON.stringify({ path: href, at: Date.now() })); } catch { /* 저장 제한 */ }
        }
      }
      else if (a.closest('.tabs')) track('select_content', { content_type: 'result_tab', item_id: href });
      else if (a.classList.contains('home-feature')) track('select_content', { content_type: 'fun_card', item_id: href });
      else if (a.classList.contains('link-card')) track('select_content', { content_type: a.classList.contains('fun-card') ? 'fun_card' : 'card', item_id: href });
      else if (a.closest('.cta')) track('select_content', { content_type: 'cta', item_id: href });
    }
  });
}
