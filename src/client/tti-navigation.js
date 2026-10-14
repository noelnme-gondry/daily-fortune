import { collapseDisclosures } from './interactions.js';
import { initPageShare } from './share.js';
import { initAdSlotTracking } from './partner-ad.js';
let pending;
export function initTtiNavigation() {
  if (!document.querySelector('.tti-nav')) return;
  async function navigate(url, push) {
    pending?.abort();
    const controller = new AbortController(); pending = controller;
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error('페이지를 불러올 수 없습니다.');
      const next = new DOMParser().parseFromString(await response.text(), 'text/html');
      const content = next.querySelector('[data-tti-content]');
      if (!content) throw new Error('띠별 운세 페이지가 아닙니다.');
      if (controller.signal.aborted) return;
      document.querySelector('[data-tti-content]').replaceWith(content);
      document.querySelector('.crumbs')?.replaceWith(next.querySelector('.crumbs'));
      const share = next.querySelector('[data-share-page]');
      if (share) { document.querySelector('[data-share-page]')?.replaceWith(share); initPageShare(); }
      document.title = next.title;
      for (const selector of ['link[rel="canonical"]', 'meta[name="description"]', 'meta[property^="og:"]', 'meta[name^="twitter:"]', 'script[type="application/ld+json"]']) {
        const old = [...document.head.querySelectorAll(selector)];
        const replacement = [...next.head.querySelectorAll(selector)];
        old.forEach((n) => n.remove()); replacement.forEach((n) => document.head.append(n));
      }
      const nav = document.querySelector('.tti-nav'), newNav = next.querySelector('.tti-nav');
      const activeHref = newNav.querySelector('[aria-current]')?.getAttribute('href');
      if ([...nav.querySelectorAll('a')].map((a) => a.getAttribute('href')).join() !== [...newNav.querySelectorAll('a')].map((a) => a.getAttribute('href')).join()) nav.replaceChildren(...newNav.childNodes);
      document.querySelectorAll('.tti-nav a').forEach((a) => {
        const chosen = a.getAttribute('href') === activeHref;
        if (chosen) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
      });
      document.body.dataset.page = new URL(url, location.origin).pathname;
      if (push) history.pushState(null, '', url);
      initAdSlotTracking();
      collapseDisclosures(content);
      if (content.querySelector('[data-cohort]')) import('./tti-client.js').then((m) => m.mountTti()).catch(() => {});
      const h1 = content.querySelector('h1');
      if (h1) { h1.tabIndex = -1; h1.focus({ preventScroll: true }); }
    } catch (error) {
      if (error.name !== 'AbortError') location.assign(url);
    }
  }
  document.addEventListener('click', (event) => {
    const a = event.target.closest('.tti-nav a');
    if (!a || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); navigate(a.href, true);
  });
  window.addEventListener('popstate', () => navigate(location.href, false));
}
