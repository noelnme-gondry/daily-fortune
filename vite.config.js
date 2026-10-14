import fs from 'node:fs';
import { defineConfig } from 'vite';

// 개발 서버: 페이지 HTML을 운영과 같은 렌더러(src/site/render.js)로 즉석 생성한다.
const TEXT_ROUTES = {
  '/sitemap.xml': ['sitemap', 'application/xml'],
  '/robots.txt': ['robots', 'text/plain'],
  '/rss.xml': ['rss', 'application/rss+xml'],
  '/llms.txt': ['llms', 'text/plain'],
  '/llms-full.txt': ['llmsFull', 'text/plain'],
};

function sitePages() {
  return {
    name: 'ohaeng-site-pages',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost');
        const path = url.pathname;
        if (path.startsWith('/@') || path.startsWith('/src/') || path.startsWith('/node_modules/')) return next();
        if (!TEXT_ROUTES[path] && /\.[a-z0-9]+$/i.test(path)) return next();
        try {
          const { createSite } = await server.ssrLoadModule('/src/site/render.js');
          const port = server.config.server.port || 5173;
          const site = createSite({ site: `http://localhost:${port}`, assets: { css: '/src/styles/main.css', js: '/src/client/main.js' } });
          if (TEXT_ROUTES[path]) {
            const [fn, type] = TEXT_ROUTES[path];
            res.setHeader('Content-Type', `${type}; charset=utf-8`);
            return res.end(site[fn]());
          }
          if (!path.endsWith('/')) {
            res.statusCode = 301;
            res.setHeader('Location', `${path}/${url.search}`);
            return res.end();
          }
          const moved = site.redirect(path);
          if (moved) {
            res.statusCode = 301;
            res.setHeader('Location', moved);
            return res.end();
          }
          let html = path === '/share/' ? site.renderShare(url.searchParams) : site.render(path);
          res.statusCode = html ? 200 : 404;
          html = await server.transformIndexHtml(req.url, html || site.notFound());
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(html);
        } catch (e) {
          server.ssrFixStacktrace(e);
          next(e);
        }
      });
    },
  };
}

// 토정비결 해설: 브라우저는 144괘 전체 대신 자기 괘 하나(/data/tojeong/{괘}.json)만 받는다.
// 원본은 src/content/tojeong-144.json 하나로 두고, 개발 서버는 즉석 응답·빌드는 괘별 파일로 내보낸다.
function tojeongData() {
  const file = new URL('./src/content/tojeong-144.json', import.meta.url);
  const read = () => JSON.parse(fs.readFileSync(file, 'utf8'));
  return {
    name: 'ohaeng-tojeong-data',
    configureServer(server) {
      server.middlewares.use('/data/tojeong/', (req, res, next) => {
        const code = /^\/([1-8][1-6][1-3])\.json$/.exec(req.url.split('?')[0])?.[1];
        const reading = code && read()[code];
        if (!reading) return next();
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(reading));
      });
    },
    generateBundle() {
      for (const [code, reading] of Object.entries(read())) {
        this.emitFile({ type: 'asset', fileName: `data/tojeong/${code}.json`, source: JSON.stringify(reading) });
      }
    },
  };
}

export default defineConfig({
  publicDir: 'public',
  plugins: [sitePages(), tojeongData()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: { main: 'src/client/main.js', style: 'src/styles/main.css' },
    },
  },
  server: { port: 5173 },
});
