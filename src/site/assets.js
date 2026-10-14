// vite build 결과(manifest)에서 해시가 붙은 CSS·JS 경로를 찾는다.
import fs from 'node:fs';
import path from 'node:path';

export function readAssets(dist) {
  const manifest = JSON.parse(fs.readFileSync(path.join(dist, '.vite', 'manifest.json'), 'utf8'));
  const js = manifest['src/client/main.js'];
  const css = manifest['src/styles/main.css'];
  if (!js || !css) throw new Error('dist/.vite/manifest.json에 진입점이 없습니다. 먼저 `vite build`를 실행하세요.');
  const tool = manifest['src/client/tool.js'];
  return { js: `/${js.file}`, css: `/${css.file}`, tool: tool ? `/${tool.file}` : null };
}
