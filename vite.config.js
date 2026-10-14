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
          let html = site.render(path);
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

export default defineConfig({
  publicDir: 'public',
  plugins: [sitePages()],
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
