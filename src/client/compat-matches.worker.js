import { withLanguage } from '../i18n/runtime.js';
import { findCompatMatches } from '../domain/compat-matches.js';

globalThis.onmessage = ({ data }) => {
  try {
    const result = withLanguage(data.language === 'en' ? 'en' : 'ko', () => findCompatMatches(data.base, data.gender, data.today, (progress) => globalThis.postMessage({ type: 'progress', progress })));
    globalThis.postMessage({ type: 'result', result });
  } catch {
    globalThis.postMessage({ type: 'error' });
  }
};
