import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { capture, restore, readCatalog } from '../../scripts/lib/release-assets.mjs';
import { completeProfile } from './helpers/profile.js';
import { EXAMPLE_INPUT } from '../../src/site/public-examples.js';
import { buildChart, day, addDays, isoDate } from '../../src/engine/index.js';

const repo = path.resolve('.');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const beforeMidnight = '2026-11-13T23:59:59+09:00';
const afterMidnight = '2026-11-14T00:00:01+09:00';

function workspace(root, name) {
  const target = path.join(root, name);
  fs.mkdirSync(target);
  // No previous dist, build cache or unrelated user files are copied.
  for (const file of ['src', 'public', 'scripts', 'package.json', 'package-lock.json', 'vite.config.js', 'server.js']) {
    fs.cpSync(path.join(repo, file), path.join(target, file), { recursive: true });
  }
  fs.symlinkSync(path.join(repo, 'node_modules'), path.join(target, 'node_modules'), 'dir');
  return target;
}

function build(cwd) {
  execFileSync('npm', ['run', 'build:current'], { cwd, env: { ...process.env, ADSENSE_CLIENT: 'off' }, stdio: 'pipe', timeout: 90000 });
}

async function serve(cwd, clock) {
  const preload = path.join(cwd, 'test-clock.mjs');
  fs.writeFileSync(preload, `import fs from 'node:fs';
const OriginalDate = Date;
globalThis.Date = class extends OriginalDate {
  constructor(...args) { super(...(args.length ? args : [fs.readFileSync(process.env.TEST_CLOCK, 'utf8')])); }
  static now() { return new OriginalDate(fs.readFileSync(process.env.TEST_CLOCK, 'utf8')).getTime(); }
};\n`);
  const child = spawn(process.execPath, ['--import', preload, 'server.js'], {
    cwd, env: { ...process.env, PORT: '0', ADSENSE_CLIENT: 'off', SITE_URL: 'https://makeyourownday-fortune.com', TEST_CLOCK: clock }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  const close = async () => { if (child.exitCode === null && child.signalCode === null) { const done = once(child, 'exit'); child.kill(); await done; } };
  try {
    const origin = await new Promise((resolve, reject) => {
      let output = '';
      const timer = setTimeout(() => reject(new Error(`Server startup timed out: ${output}`)), 15000);
      const finish = (fn, value) => { clearTimeout(timer); fn(value); };
      child.on('error', error => finish(reject, error));
      child.on('exit', code => finish(reject, new Error(`Server exited ${code}: ${output}`)));
      child.stderr.on('data', chunk => { output += chunk; });
      child.stdout.on('data', chunk => {
        output += chunk;
        const match = output.match(/서버가 (\d+) 포트/);
        if (match) finish(resolve, `http://127.0.0.1:${match[1]}`);
      });
    });
    return { origin, close };
  } catch (error) { await close(); throw error; }
}

async function calculate(page) {
  await expect(page.locator('#tool')).toHaveAttribute('data-ready', 'true');
  await completeProfile(page);
  await page.locator('#save-device').uncheck();
  await page.locator('#tool-form button[type="submit"]').click();
  await expect(page.locator('#result .chart-card')).toBeAttached();
}

test('clean A→B release preserves original GET/HEAD bytes and executes old dynamic imports; new HTML and KST rollover stay current', async ({ browser, request }, testInfo) => {
  test.setTimeout(180000);
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fortune-release-browser-'));
  const clock = path.join(root, 'clock.txt');
  fs.writeFileSync(clock, beforeMidnight);
  const servers = [], contexts = [];
  try {
    const a = workspace(root, 'a');
    build(a);
    const aSnapshot = capture({ dist: path.join(a, 'dist'), store: path.join(a, 'release-assets'), sourceRevision: 'isolated-test-A' });
    const catalog = readCatalog(path.join(a, 'release-assets'));
    const aServer = await serve(a, clock); servers.push(aServer);
    const aHtml = await (await request.get(`${aServer.origin}/today/`)).text();
    await aServer.close();
    const b = workspace(root, 'b');
    expect(fs.existsSync(path.join(b, 'dist'))).toBe(false);
    fs.cpSync(path.join(a, 'release-assets'), path.join(b, 'release-assets'), { recursive: true });
    fs.appendFileSync(path.join(b, 'src/client/main.js'), '\ndocument.documentElement.dataset.releaseSmoke = "B";\n');
    fs.appendFileSync(path.join(b, 'src/styles/main.css'), '\nhtml{--release-smoke: B}\n');
    build(b);
    const bManifest = fs.readFileSync(path.join(b, 'dist/.vite/manifest.json'));
    const oldEntry = catalog.releases[0].manifest['src/client/main.js'].file;
    const newEntry = JSON.parse(bManifest)['src/client/main.js'].file;
    expect(newEntry).not.toBe(oldEntry);
    const unrepaired = await serve(b, clock); servers.push(unrepaired);
    // Reproduce the original deployment failure before applying restoration.
    expect((await request.get(`${unrepaired.origin}/${oldEntry}`)).status()).toBe(404);
    await unrepaired.close();
    expect(() => restore({ dist: path.join(b, 'dist'), store: path.join(b, 'release-assets'), verifyCurrent: true })).toThrow(/Unprepared/);
    const bSnapshot = capture({ dist: path.join(b, 'dist'), store: path.join(b, 'release-assets'), sourceRevision: 'isolated-test-B' });
    // Exercise the actual Railway/CI command from the source-carried archive.
    fs.rmSync(path.join(b, 'dist'), { recursive: true });
    execFileSync('npm', ['run', 'build:release'], { cwd: b, env: { ...process.env, ADSENSE_CLIENT: 'off' }, stdio: 'pipe', timeout: 90000 });
    expect(fs.readFileSync(path.join(b, 'dist/.vite/manifest.json'))).toEqual(bManifest);
    const server = await serve(b, clock); servers.push(server);
    const observations = [];
    for (const userAgent of ['Mozilla/5.0 retention-regression', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)']) {
      for (const [name, asset] of Object.entries(catalog.assets)) {
        for (const method of ['GET', 'HEAD']) {
          const response = await request.fetch(`${server.origin}/${name}`, { method, headers: { 'User-Agent': userAgent } });
          expect(response.status(), name).toBe(200);
          expect(response.headers()['content-type'], name).toContain(asset.mime);
          expect(response.headers()['x-content-type-options']).toBe('nosniff');
          expect(response.headers()['cache-control']).toContain('max-age=31536000');
          expect(response.headers()['cache-control']).toContain('immutable');
          const body = await response.body();
          if (method === 'GET') expect(hash(body), name).toBe(asset.sha256);
          else expect(body.length).toBe(0);
          observations.push({ name, method, userAgent, status: response.status() });
        }
      }
    }
    for (const method of ['GET', 'HEAD']) {
      expect((await request.fetch(`${server.origin}/assets/never-built.js`, { method })).status()).toBe(404);
    }
    for (const input of ['%2e%2e%2fserver.js', '%2e%2e%2f%2e%2e%2fpackage.json', '%2fetc%2fpasswd']) {
      expect((await request.get(`${server.origin}/assets/${input}`)).status()).not.toBe(200);
    }
    const oldContext = await browser.newContext({ locale: 'ko-KR' }); contexts.push(oldContext);
    await oldContext.route('https://**/*', route => route.abort());
    const oldPage = await oldContext.newPage();
    await oldPage.clock.setFixedTime(new Date(beforeMidnight));
    const loaded = [];
    oldPage.on('response', response => { if (response.url().startsWith(`${server.origin}/assets/`)) loaded.push(response.url().replace(`${server.origin}/`, '')); });
    await oldPage.route(`${server.origin}/today/`, route => route.fulfill({ contentType: 'text/html', body: aHtml }));
    await oldPage.goto(`${server.origin}/today/`);
    await calculate(oldPage);
    expect(await oldPage.locator('html').getAttribute('data-release-smoke')).toBeNull();
    expect(loaded).toContain(oldEntry);
    const dynamicKeys = catalog.releases[0].manifest['src/client/main.js'].dynamicImports;
    expect(dynamicKeys.some(key => loaded.includes(catalog.releases[0].manifest[key].file))).toBe(true);
    const currentContext = await browser.newContext({ locale: 'ko-KR' }); contexts.push(currentContext);
    await currentContext.route('https://**/*', route => route.abort());
    const page = await currentContext.newPage();
    await page.clock.setFixedTime(new Date(beforeMidnight));
    for (const route of ['/today/', '/tomorrow/', '/en/today/', '/manseryeok/']) {
      await page.goto(`${server.origin}${route}`);
      await expect(page.locator('html')).toHaveAttribute('data-release-smoke', 'B');
      await expect(page.locator(`script[src="/${newEntry}"]`)).toBeAttached();
      await calculate(page);
    }
    const chart = buildChart({ ...EXAMPLE_INPUT });
    for (const [time, date] of [[beforeMidnight, '2026-11-13'], [afterMidnight, '2026-11-14']]) {
      fs.writeFileSync(clock, time);
      await page.clock.setFixedTime(new Date(time));
      for (const mode of ['today', 'tomorrow']) {
        await page.goto(`${server.origin}/${mode}/`);
        const [y, m, d] = date.split('-').map(Number);
        const targetDate = mode === 'tomorrow' ? addDays({ y, m, d }, 1) : { y, m, d };
        const expected = day(chart, targetDate, mode);
        await expect(page.locator('#public-example')).toHaveAttribute('data-example-date', isoDate(targetDate));
        await expect(page.locator('[data-example-overall]')).toHaveText(`${expected.overall.score}점`);
      }
    }
    await testInfo.attach('release-retention-verification', { body: JSON.stringify({ a: aSnapshot, b: bSnapshot, checks: observations, oldDynamicImportsLoaded: loaded, limitation: 'Local UA simulation, not an actual Googlebot crawl' }, null, 2), contentType: 'application/json' });
  } finally {
    for (const context of contexts) await context.close();
    for (const server of servers) await server.close();
    fs.rmSync(root, { recursive: true, force: true });
  }
});
