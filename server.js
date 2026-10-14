// 운영 서버(Railway): 해시 자산은 dist에서, 페이지 HTML은 한국 날짜 기준으로 즉석 렌더링해 하루 동안 캐시한다.
// 오늘·내일·띠별 오늘의 운세처럼 날짜가 바뀌는 페이지도 재배포 없이 매일 갱신된다.
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSite } from './src/site/render.js';
import { siteUrl } from './src/site/util.js';
import { readAssets } from './src/site/assets.js';
import { todayKST, isoDate } from './src/engine/core.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const assets = readAssets(dist);
const PORT = process.env.PORT || 3000;

let cache = { day: '', site: null, html: new Map() };
function current() {
  const day = isoDate(todayKST());
  if (cache.day !== day) cache = { day, site: createSite({ site: siteUrl(), assets }), html: new Map() };
  return cache;
}

const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use('/assets', express.static(path.join(dist, 'assets'), { immutable: true, maxAge: '1y', fallthrough: false }));

const TEXT = {
  '/sitemap.xml': ['sitemap', 'application/xml'],
  '/robots.txt': ['robots', 'text/plain'],
  '/rss.xml': ['rss', 'application/rss+xml'],
  '/llms.txt': ['llms', 'text/plain'],
  '/llms-full.txt': ['llmsFull', 'text/plain'],
};
app.get(Object.keys(TEXT), (req, res) => {
  const [fn, type] = TEXT[req.path];
  res.set('Cache-Control', 'public, max-age=3600');
  res.type(`${type}; charset=utf-8`).send(current().site[fn]());
});

app.get(/.*/, (req, res, next) => {
  const p = req.path;
  if (/\.[a-z0-9]+$/i.test(p)) return next();
  if (!p.endsWith('/')) {
    const q = req.originalUrl.slice(req.path.length);
    return res.redirect(301, `${p}/${q}`);
  }
  const c = current();
  let html = c.html.get(p);
  if (!html) {
    html = c.site.render(p);
    if (!html) return next();
    c.html.set(p, html);
  }
  res.set('Cache-Control', 'public, max-age=300');
  res.type('html').send(html);
});

// favicon·og 이미지·ads.txt 등 public 파일
app.use(express.static(dist, { index: false, maxAge: '1d' }));
app.use((req, res) => res.status(404).type('html').send(current().site.notFound()));

app.listen(PORT, () => console.log(`오행 운세 서버가 ${PORT} 포트에서 실행 중입니다 (${siteUrl()})`));
