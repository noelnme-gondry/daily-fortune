import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { capture, restore, readCatalog, recordDeployment, prune, RETENTION_DAYS } from '../scripts/lib/release-assets.mjs';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fortune-assets-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return { root, store: path.join(root, 'archive') };
}

function build(root, version) {
  const dist = path.join(root, version);
  fs.mkdirSync(path.join(dist, '.vite'), { recursive: true });
  fs.mkdirSync(path.join(dist, 'assets/fonts'), { recursive: true });
  const files = {
    [`assets/main-${version}.js`]: `import('./lazy-${version}.js');new Worker(new URL('/assets/worker-${version}.js',import.meta.url))`,
    [`assets/lazy-${version}.js`]: 'export const value=1;',
    [`assets/worker-${version}.js`]: 'postMessage(1)',
    [`assets/style-${version}.css`]: 'body{background:url(./shared.svg)}@font-face{src:url(./fonts/font.woff2)}',
    'assets/shared.svg': '<svg/>', 'assets/fonts/font.woff2': 'font',
  };
  for (const [name, body] of Object.entries(files)) fs.writeFileSync(path.join(dist, name), body);
  const manifest = {
    'src/client/main.js': { file: `assets/main-${version}.js`, isEntry: true, dynamicImports: ['lazy'] },
    lazy: { file: `assets/lazy-${version}.js`, isDynamicEntry: true },
    'src/styles/main.css': { file: `assets/style-${version}.css`, isEntry: true },
  };
  fs.writeFileSync(path.join(dist, '.vite/manifest.json'), JSON.stringify(manifest));
  return dist;
}

test('clean B receives all original A bytes, worker and CSS dependencies without replacing B manifest', t => {
  const { root, store } = fixture(t);
  const a = build(root, 'a'), b = build(root, 'b');
  const result = capture({ dist: a, store, now: '2026-10-01T00:00:00Z', sourceRevision: 'test-a' });
  assert.equal(result.files, 6);
  const catalog = readCatalog(store);
  assert.deepEqual(catalog.assets['assets/main-a.js'].references, ['assets/lazy-a.js', 'assets/worker-a.js']);
  assert.deepEqual(catalog.assets['assets/style-a.css'].references, ['assets/fonts/font.woff2', 'assets/shared.svg']);
  const manifest = fs.readFileSync(path.join(b, '.vite/manifest.json'));
  assert.equal(fs.existsSync(path.join(b, 'assets/main-a.js')), false);
  assert.throws(() => restore({ dist: b, store, verifyCurrent: true }), /Unprepared/);
  capture({ dist: b, store, now: '2026-10-02T00:00:00Z' });
  assert.equal(restore({ dist: b, store, verifyCurrent: true }).restored, 4);
  for (const name of catalog.releases[0].files) assert.deepEqual(fs.readFileSync(path.join(b, name)), fs.readFileSync(path.join(a, name)));
  assert.deepEqual(fs.readFileSync(path.join(b, '.vite/manifest.json')), manifest);
});

test('retention starts at confirmed retirement; exact boundary, active, unconfirmed and shared files are protected', t => {
  const { root, store } = fixture(t);
  const a = capture({ dist: build(root, 'a'), store, now: '2026-01-01T00:00:00Z' });
  recordDeployment({ store, releaseId: a.release, at: '2026-01-02T00:00:00Z' });
  const b = capture({ dist: build(root, 'b'), store, now: '2026-06-01T00:00:00Z' });
  // A has remained active for months; preparation alone cannot expire it.
  assert.deepEqual(prune({ store, now: '2026-06-02T00:00:00Z' }).files, []);
  recordDeployment({ store, releaseId: b.release, at: '2026-06-03T00:00:00Z' });
  const boundary = new Date(Date.parse('2026-06-03T00:00:00Z') + RETENTION_DAYS * 86400000);
  assert.deepEqual(prune({ store, now: boundary.toISOString() }).files, []);
  const expired = new Date(boundary.getTime() + 1).toISOString();
  const preview = prune({ store, now: expired });
  assert.equal(preview.files.length, 4);
  assert.equal(readCatalog(store).releases.length, 2);
  prune({ store, now: expired, apply: true });
  const catalog = readCatalog(store);
  assert.equal(catalog.releases.length, 1);
  assert.ok(catalog.assets['assets/shared.svg']);
  assert.equal(catalog.assets['assets/shared.svg'].lastReferencedAt, '2026-06-03T00:00:00Z');
  capture({ dist: build(root, 'c'), store, now: '2026-07-10T00:00:00Z' });
  capture({ dist: build(root, 'd'), store, now: '2026-07-11T00:00:00Z' });
  assert.deepEqual(prune({ store, now: '2027-01-01T00:00:00Z' }).files, []);
  assert.throws(() => recordDeployment({ store, releaseId: b.release, at: '2026-01-01T00:00:00Z' }), /backdate/);
});

test('same URL cannot acquire new bytes and corrupted blobs fail before any restoration', t => {
  const { root, store } = fixture(t);
  const a = build(root, 'a'), b = build(root, 'b');
  capture({ dist: a, store });
  fs.writeFileSync(path.join(b, 'assets/shared.svg'), 'different');
  assert.throws(() => capture({ dist: b, store }), /different bytes/);
  fs.writeFileSync(path.join(b, 'assets/shared.svg'), '<svg/>');
  const catalog = readCatalog(store);
  fs.writeFileSync(path.join(store, 'blobs', `${catalog.assets['assets/worker-a.js'].sha256}.gz`), 'corrupt');
  assert.throws(() => restore({ dist: b, store }));
  assert.equal(fs.existsSync(path.join(b, 'assets/main-a.js')), false);
});

test('unsafe catalog paths and symlinked input/output directories are rejected', t => {
  const { root, store } = fixture(t);
  const a = build(root, 'a'), b = build(root, 'b');
  capture({ dist: a, store });
  const file = path.join(store, 'catalog.json'), original = fs.readFileSync(file);
  for (const name of ['assets/../secret', 'assets/%2e%2e/secret', '/etc/passwd', 'assets/a\\b.js']) {
    const catalog = JSON.parse(original);
    catalog.releases[0].files.push(name);
    fs.writeFileSync(file, JSON.stringify(catalog));
    assert.throws(() => restore({ dist: b, store }), /Unsafe asset path/);
  }
  fs.writeFileSync(file, original);
  fs.rmSync(path.join(b, 'assets/fonts'), { recursive: true });
  fs.symlinkSync(path.join(a, 'assets/fonts'), path.join(b, 'assets/fonts'));
  assert.throws(() => restore({ dist: b, store }), /Unsupported asset entry/);
  fs.symlinkSync(path.join(a, 'assets/main-a.js'), path.join(a, 'assets/alias.js'));
  assert.throws(() => capture({ dist: a, store }), /Unsupported asset entry/);
});
