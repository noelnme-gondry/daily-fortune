import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { capture, restore, recordDeployment, prune } from './lib/release-assets.mjs';

const [command, ...args] = process.argv.slice(2);
const store = path.resolve('release-assets');
const dist = path.resolve('dist');
let result;
if (command === 'capture') {
  result = capture({ dist, store, sourceRevision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() });
} else if (command === 'restore' || command === 'verify') {
  result = restore({ dist, store, verifyCurrent: command === 'verify' });
} else if (command === 'record-deployment' && args.length === 2) {
  recordDeployment({ store, releaseId: args[0], at: args[1] });
  result = { deployedRelease: args[0], at: args[1] };
} else if (command === 'prune' && (args.length === 0 || args.join(' ') === '--apply')) {
  result = prune({ store, apply: args.includes('--apply') });
} else throw new Error('Usage: release-assets.mjs capture|restore|verify|record-deployment <release-id> <ISO-time>|prune [--apply]');
console.log(JSON.stringify(result, null, 2));
