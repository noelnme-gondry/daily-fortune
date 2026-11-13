import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';

// Operational minimum, not a search-engine guarantee. Increase here if old URLs remain in use.
export const RETENTION_DAYS = 30;
const DAY = 86_400_000;
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const timestamp = value => {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) throw new Error('Invalid release timestamp');
  return Date.parse(value);
};

function assetPath(value) {
  if (typeof value !== 'string' || !/^assets\/(?:[\w-]+\/)*[\w-][\w.-]*$/.test(value)) throw new Error(`Unsafe asset path: ${value}`);
  return value;
}

function regular(file) {
  if (!fs.lstatSync(file).isFile()) throw new Error(`Expected regular file: ${file}`);
  return fs.readFileSync(file);
}

function directory(dir, create = false) {
  if (create) fs.mkdirSync(dir, { recursive: true });
  if (!fs.lstatSync(dir).isDirectory()) throw new Error(`Expected directory: ${dir}`);
}

function filesIn(dir, prefix = 'assets') {
  directory(dir);
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const name = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) return filesIn(path.join(dir, entry.name), name);
    if (!entry.isFile()) throw new Error(`Unsupported asset entry: ${name}`);
    return [assetPath(name)];
  }).sort();
}

function checkedFile(root, name) {
  assetPath(name);
  let parent = root;
  for (const part of name.split('/').slice(0, -1)) {
    parent = path.join(parent, part);
    directory(parent);
  }
  return regular(path.join(root, name));
}

const mime = name => ({ '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml' }[path.extname(name)] || 'application/octet-stream');

export function snapshot(dist) {
  directory(path.join(dist, '.vite'));
  const manifest = JSON.parse(regular(path.join(dist, '.vite/manifest.json')));
  if (!manifest['src/client/main.js'] || !manifest['src/styles/main.css']) throw new Error('Missing current manifest entry points');
  const names = filesIn(path.join(dist, 'assets'));
  const assets = {};
  const bytes = new Map();
  for (const name of names) {
    const content = checkedFile(dist, name);
    bytes.set(name, content);
    // Keep all emitted files, including worker bundles absent from Vite's manifest.
    // This conservative reference graph supplements the exact import/dynamicImport graph in manifest.
    const text = /\.(?:js|css)$/.test(name) ? content.toString('utf8') : '';
    assets[name] = {
      sha256: sha256(content), bytes: content.length, mime: mime(name),
      references: names.filter(other => other !== name && text.includes(path.posix.basename(other))),
    };
  }
  for (const entry of Object.values(manifest)) {
    for (const name of [entry.file, ...entry.css || [], ...entry.assets || []]) {
      if (name.startsWith('assets/') && !assets[name]) throw new Error(`Missing manifest asset: ${name}`);
    }
    for (const key of [...entry.imports || [], ...entry.dynamicImports || []]) {
      if (!manifest[key]) throw new Error(`Missing manifest dependency: ${key}`);
    }
  }
  const id = sha256(JSON.stringify({ manifest, assets }));
  return { id, manifest, assets, bytes };
}

function refreshReferences(catalog) {
  for (const [name, asset] of Object.entries(catalog.assets)) {
    const users = catalog.releases.filter(release => release.files.includes(name));
    if (!users.length) { delete catalog.assets[name]; continue; }
    asset.lastReferencedAt = users.map(release => release.lastReferencedAt).sort((a, b) => timestamp(b) - timestamp(a))[0];
  }
}

export function readCatalog(store) {
  directory(store);
  directory(path.join(store, 'blobs'));
  const catalog = JSON.parse(regular(path.join(store, 'catalog.json')));
  if (catalog.version !== 1 || !Array.isArray(catalog.releases) || !catalog.assets || typeof catalog.assets !== 'object') throw new Error('Invalid asset catalog');
  const ids = new Set();
  const referenced = new Set();
  for (const release of catalog.releases) {
    if (!/^[a-f0-9]{64}$/.test(release.id) || ids.has(release.id)) throw new Error('Invalid/duplicate release ID');
    ids.add(release.id);
    timestamp(release.preparedAt);
    timestamp(release.lastReferencedAt);
    if (release.retiredAt !== null) timestamp(release.retiredAt);
    if (!Array.isArray(release.files) || new Set(release.files).size !== release.files.length) throw new Error('Invalid release files');
    for (const name of release.files) {
      assetPath(name);
      if (!catalog.assets[name]) throw new Error(`Unrecorded release asset: ${name}`);
      referenced.add(name);
    }
  }
  if (!ids.has(catalog.currentRelease) || (catalog.activeRelease !== null && !ids.has(catalog.activeRelease))) throw new Error('Unknown current/active release');
  for (const [name, asset] of Object.entries(catalog.assets)) {
    assetPath(name);
    if (!referenced.has(name) || !/^[a-f0-9]{64}$/.test(asset.sha256) || !Number.isSafeInteger(asset.bytes) || asset.bytes < 0) throw new Error(`Invalid asset record: ${name}`);
    timestamp(asset.lastReferencedAt);
    if (!Array.isArray(asset.references) || asset.references.some(ref => !catalog.assets[assetPath(ref)])) throw new Error(`Missing asset dependency: ${name}`);
  }
  return catalog;
}

function blob(store, asset) {
  const compressed = regular(path.join(store, 'blobs', `${asset.sha256}.gz`));
  const bytes = gunzipSync(compressed, { maxOutputLength: Math.max(1, asset.bytes) });
  if (bytes.length !== asset.bytes || sha256(bytes) !== asset.sha256) throw new Error('Asset integrity mismatch');
  return bytes;
}

function save(store, catalog) {
  refreshReferences(catalog);
  const temp = path.join(store, `catalog-${process.pid}.tmp`);
  fs.writeFileSync(temp, `${JSON.stringify(catalog, null, 2)}\n`, { flag: 'wx' });
  fs.renameSync(temp, path.join(store, 'catalog.json'));
}

export function capture({ dist, store, now = new Date().toISOString(), sourceRevision, provenance = 'local release preparation' }) {
  timestamp(now);
  const current = snapshot(dist);
  directory(store, true);
  directory(path.join(store, 'blobs'), true);
  const catalog = fs.existsSync(path.join(store, 'catalog.json')) ? readCatalog(store) : { version: 1, currentRelease: null, activeRelease: null, releases: [], assets: {} };
  for (const [name, asset] of Object.entries(current.assets)) {
    if (catalog.assets[name] && catalog.assets[name].sha256 !== asset.sha256) throw new Error(`Same asset URL has different bytes: ${name}`);
  }
  for (const [name, asset] of Object.entries(current.assets)) {
    const file = path.join(store, 'blobs', `${asset.sha256}.gz`);
    if (fs.existsSync(file)) blob(store, asset);
    else fs.writeFileSync(file, gzipSync(current.bytes.get(name), { level: 9 }), { flag: 'wx' });
    catalog.assets[name] = { ...asset, lastReferencedAt: now };
  }
  let release = catalog.releases.find(item => item.id === current.id);
  if (!release) {
    release = { id: current.id, preparedAt: now, lastReferencedAt: now, retiredAt: null, sourceRevision, provenance, manifest: current.manifest, files: Object.keys(current.assets) };
    catalog.releases.push(release);
  } else {
    if (timestamp(now) < timestamp(release.lastReferencedAt)) throw new Error('Cannot backdate a release');
    release.lastReferencedAt = now;
    release.retiredAt = null;
  }
  catalog.currentRelease = current.id;
  save(store, catalog);
  return { release: current.id, files: release.files.length, bytes: Object.values(current.assets).reduce((n, asset) => n + asset.bytes, 0) };
}

export function restore({ dist, store, verifyCurrent = false }) {
  const current = snapshot(dist);
  const catalog = readCatalog(store);
  if (verifyCurrent && current.id !== catalog.currentRelease) throw new Error('Unprepared release assets: run npm run release:prepare and include release-assets in the release commit');
  // Validate everything before writing. Never substitute new bytes at an old URL.
  const pending = [];
  for (const [name, asset] of Object.entries(catalog.assets)) {
    const content = blob(store, asset);
    const target = path.join(dist, name);
    let parent = dist;
    for (const part of name.split('/').slice(0, -1)) {
      parent = path.join(parent, part);
      if (fs.existsSync(parent)) directory(parent);
    }
    if (fs.existsSync(target)) {
      if (sha256(regular(target)) !== asset.sha256) throw new Error(`Same asset URL has different bytes: ${name}`);
    } else pending.push([target, content]);
  }
  for (const [target, content] of pending) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, { flag: 'wx' });
  }
  return { currentRelease: current.id, restored: pending.length, available: Object.keys(catalog.assets).length };
}

// Run only after a successful deployment has been confirmed; preparation time is not deployment time.
export function recordDeployment({ store, releaseId, at }) {
  timestamp(at);
  const catalog = readCatalog(store);
  const next = catalog.releases.find(release => release.id === releaseId);
  if (!next) throw new Error('Unknown deployed release');
  if (catalog.releases.some(release => timestamp(release.lastReferencedAt) > timestamp(at))) throw new Error('Cannot backdate a deployment');
  const previous = catalog.releases.find(release => release.id === catalog.activeRelease);
  if (previous && previous !== next) { previous.retiredAt = at; previous.lastReferencedAt = at; }
  next.lastReferencedAt = at;
  next.retiredAt = null;
  catalog.activeRelease = next.id;
  save(store, catalog);
}

export function prune({ store, now = new Date().toISOString(), apply = false }) {
  const cutoff = timestamp(now) - RETENTION_DAYS * DAY;
  const catalog = readCatalog(store);
  const expired = catalog.releases.filter(release => release.id !== catalog.currentRelease && release.id !== catalog.activeRelease && release.retiredAt !== null && timestamp(release.retiredAt) < cutoff);
  const ids = new Set(expired.map(release => release.id));
  const kept = catalog.releases.filter(release => !ids.has(release.id));
  const used = new Set(kept.flatMap(release => release.files));
  const removed = Object.keys(catalog.assets).filter(name => !used.has(name));
  const keptHashes = new Set([...used].map(name => catalog.assets[name].sha256));
  const hashes = new Set(removed.map(name => catalog.assets[name].sha256).filter(hash => !keptHashes.has(hash)));
  if (apply) {
    catalog.releases = kept;
    save(store, catalog);
    for (const hash of hashes) {
      const file = path.join(store, 'blobs', `${hash}.gz`);
      regular(file);
      fs.unlinkSync(file);
    }
  }
  return { apply, retentionDays: RETENTION_DAYS, releases: [...ids], files: removed };
}
