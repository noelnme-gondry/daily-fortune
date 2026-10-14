import { findCompatMatches } from '../domain/compat-matches.js';

globalThis.onmessage = ({ data }) => {
  try {
    const result = findCompatMatches(data.base, data.gender, data.today, (progress) => globalThis.postMessage({ type: 'progress', progress }));
    globalThis.postMessage({ type: 'result', result });
  } catch {
    globalThis.postMessage({ type: 'error' });
  }
};
