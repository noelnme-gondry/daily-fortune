import { ADSTERRA_FRAME_ORIGIN, ADSTERRA_FRAME_PREFIX, ADSTERRA_SANDBOX, adsterraDocument } from '../domain/adsterra.js';
import { DEFAULT_SITE_URL } from './util.js';

// Runs before canonical redirects, but only the ad document may stay on this host.
// No renderer, profile, calculation data, cookies or user-controlled SDK options.
export function handleAdsterraFrame(req, res) {
  const url = new URL(req.url, ADSTERRA_FRAME_ORIGIN);
  if (!url.pathname.startsWith(ADSTERRA_FRAME_PREFIX)) return false;
  const host = req.headers.host?.toLowerCase();
  const readable = req.method === 'GET' || req.method === 'HEAD';
  const html = readable && host === new URL(ADSTERRA_FRAME_ORIGIN).host && !url.search
    ? adsterraDocument(url.pathname.slice(ADSTERRA_FRAME_PREFIX.length)) : null;
  res.statusCode = !readable ? 405 : html ? 200 : 404;
  res.setHeader('Content-Type', html ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'origin');
  res.setHeader('Content-Security-Policy', html
    ? `frame-ancestors ${DEFAULT_SITE_URL} https://www.${new URL(DEFAULT_SITE_URL).hostname}; sandbox ${ADSTERRA_SANDBOX}`
    : "frame-ancestors 'none'; sandbox");
  res.end(req.method === 'HEAD' ? '' : html || 'Not found');
  return true;
}
