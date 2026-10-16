// vite build 다음 단계: 모든 경로를 정적 HTML로 미리 생성하고 sitemap·robots·rss·llms.txt를 쓴다.
// 운영 서버(server.js)는 날짜가 바뀌어도 맞도록 같은 렌더러로 즉석 생성하지만, 정적 호스팅에서도 동작하도록 파일을 남긴다.
import fs from 'node:fs';
import path from 'node:path';
import { createSite } from '../src/site/render.js';
import { siteUrl } from '../src/site/util.js';
import { readAssets } from '../src/site/assets.js';

const dist = path.resolve('dist');
const assets = readAssets(dist);
const url = siteUrl();
if (url.startsWith('http://localhost')) console.warn('⚠ SITE_URL이 설정되지 않아 canonical 주소가 localhost로 생성됩니다. 배포 환경에는 SITE_URL을 지정하세요.');
const site = createSite({ site: url, assets });

const write = (rel, body) => {
  const file = path.join(dist, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
};
let n = 0;
for (const r of site.routes) { write(path.join(r.path, 'index.html'), site.render(r.path)); n++; }
write('404.html', site.notFound());
write('sitemap.xml', site.sitemap());
write('robots.txt', site.robots());
write('rss.xml', site.rss());
write('llms.txt', site.llms());
write('llms-full.txt', site.llmsFull());
if (site.adsTxt()) write('ads.txt', site.adsTxt());
write('share/index.html', site.renderShare(null));
write('en/share/index.html', site.renderShare(null, 'en'));
write('en/404.html', site.notFound('en'));
console.log(`✓ ${n}개 페이지와 sitemap.xml·robots.txt·rss.xml·llms.txt 생성 (${url})`);
