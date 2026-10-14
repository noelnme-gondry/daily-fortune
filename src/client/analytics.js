// GA4 이벤트. GA_MEASUREMENT_ID가 없으면 아무것도 하지 않는다. 이름·생년월일 같은 개인정보는 보내지 않는다.
export function track(name, params = {}) {
  try {
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
  } catch (e) { /* 분석 실패는 무시 */ }
}

// 페이지 공통 클릭 이벤트: 카드·CTA·탭·FAQ
export function initAutoEvents() {
  document.addEventListener('click', (e) => {
    const faq = e.target.closest('.faq-button');
    if (faq?.getAttribute('aria-expanded') === 'false') track('faq_open', { question: faq.textContent.slice(0, 90) });
    const a = e.target.closest('a');
    if (a) {
      const href = a.getAttribute('href') || '';
      if (a.dataset.gaCta) track('select_content', { content_type: a.dataset.gaCta, item_id: href });
      else if (a.closest('.tabs')) track('select_content', { content_type: 'result_tab', item_id: href });
      else if (a.classList.contains('link-card')) track('select_content', { content_type: a.classList.contains('fun-card') ? 'fun_card' : 'card', item_id: href });
      else if (a.closest('.cta')) track('select_content', { content_type: 'cta', item_id: href });
    }
  });
}
