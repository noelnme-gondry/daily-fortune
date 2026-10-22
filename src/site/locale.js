// Language selection is based on the browser's primary language, never its location.
export const LANGUAGE_COOKIE = 'fortune-language';

export function preferredLanguage(acceptLanguage = '') {
  const languages = acceptLanguage.split(',').map((part, index) => {
    const [tag, ...params] = part.trim().split(';');
    const quality = params.find((p) => p.trim().startsWith('q='));
    const q = quality ? Number(quality.trim().slice(2)) : 1;
    return { tag: tag.toLowerCase(), q, index };
  }).filter(({ tag, q }) => /^[a-z]{2,3}(?:-[a-z0-9]+)*$/i.test(tag) && q > 0 && q <= 1);
  languages.sort((a, b) => b.q - a.q || a.index - b.index);
  if (!languages.length) return null;
  return languages[0].tag.split('-')[0] === 'ko' ? 'ko' : 'en';
}

export function savedLanguage(cookie = '') {
  const value = cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${LANGUAGE_COOKIE}=`))?.slice(LANGUAGE_COOKIE.length + 1);
  return value === 'ko' || value === 'en' ? value : null;
}

export function languagePath(path, language) {
  const base = path === '/en' || path === '/en/' ? '/' : path.startsWith('/en/') ? path.slice(3) : path;
  return language === 'en' ? `/en${base}` : base;
}

export function localizedHref(href, ctx) {
  if (ctx.lang !== 'en' || !href.startsWith('/') || href.startsWith('//')) return href;
  const path = href.split(/[?#]/)[0];
  return ctx.paths?.has(path) ? languagePath(href, 'en') : href;
}

export function localizedLinks(html, ctx) {
  return ctx.lang === 'en' ? html.replace(/(<a\b[^>]*\bhref=")([^"]+)(")/g, (match, before, href, after) =>
    /data-set-language=/.test(before) ? match : `${before}${localizedHref(href, ctx)}${after}`) : html;
}

export function languageRedirect({ path, search = '', cookie = '', acceptLanguage = '', userAgent = '', hasPath }) {
  // An explicit /en/ URL is shareable, including for Korean-language browsers.
  if (path === '/en' || path.startsWith('/en/')) return null;
  if (/bot|crawler|spider|slurp|google|facebookexternalhit|bingpreview/i.test(userAgent)) return null;
  const language = savedLanguage(cookie) || preferredLanguage(acceptLanguage);
  if (language !== 'en') return null;
  const target = languagePath(path.endsWith('/') ? path : `${path}/`, 'en');
  return hasPath(target) ? `${target}${search}` : null;
}
