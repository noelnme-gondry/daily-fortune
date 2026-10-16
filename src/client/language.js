import { LANGUAGE_COOKIE, languagePath } from '../site/locale.js';
import { isEnglish } from '../i18n/runtime.js';

export function updateLanguageLinks() {
  document.querySelectorAll('[data-set-language]').forEach((link) => {
    const url = new URL(location.href);
    url.pathname = languagePath(url.pathname, link.dataset.setLanguage);
    url.searchParams.set('lang', link.dataset.setLanguage);
    link.href = `${url.pathname}${url.search}${url.hash}`;
  });
}

export function localizeClientLinks(root) {
  if (!isEnglish()) return;
  root.querySelectorAll('a[href^="/"]:not([data-set-language])').forEach((link) => {
    const url = new URL(link.getAttribute('href'), location.origin);
    if (url.origin !== location.origin || !url.pathname.endsWith('/')) return;
    url.pathname = languagePath(url.pathname, 'en');
    link.href = `${url.pathname}${url.search}${url.hash}`;
  });
}

export function initLanguage() {
  updateLanguageLinks();
  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-set-language]');
    if (!link) return;
    // Also works when serving the generated files on static hosting.
    document.cookie = `${LANGUAGE_COOKIE}=${link.dataset.setLanguage}; Path=/; Max-Age=31536000; SameSite=Lax`;
    updateLanguageLinks();
  });
  window.addEventListener('popstate', updateLanguageLinks);
}
