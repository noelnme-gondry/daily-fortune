import { LANGUAGE_COOKIE, languagePath, languageRedirect } from './locale.js';

// Shared by Vite and the production server so tests exercise the real policy.
export function handleLanguage(req, res, site) {
  if (!['GET', 'HEAD'].includes(req.method)) return false;
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
  const hasPath = (candidate) => site.has(candidate) || candidate === '/share/' || candidate === '/en/share/' || !!site.redirect(candidate);
  if (!hasPath(path)) return false;
  // Even a Korean response depends on the request's preferences. Never allow a
  // shared cache to reuse one visitor's decision for a different visitor.
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Vary', 'Accept-Language, Cookie, User-Agent');
  const explicit = url.searchParams.get('lang');
  let target;
  if (explicit === 'ko' || explicit === 'en') {
    url.searchParams.delete('lang');
    target = `${languagePath(path, explicit)}${url.search}`;
    res.setHeader('Set-Cookie', `${LANGUAGE_COOKIE}=${explicit}; Path=/; Max-Age=31536000; SameSite=Lax`);
  } else {
    target = languageRedirect({ path, search: url.search, cookie: req.headers.cookie, acceptLanguage: req.headers['accept-language'], userAgent: req.headers['user-agent'], hasPath });
  }
  if (!target) return false;
  res.statusCode = 302;
  res.setHeader('Location', target);
  res.end();
  return true;
}
