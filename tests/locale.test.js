import test from 'node:test';
import assert from 'node:assert/strict';
import { preferredLanguage, savedLanguage, languagePath, languageRedirect } from '../src/site/locale.js';

test('primary browser language, including preference weights, chooses Korean or English', () => {
  for (const language of ['ko', 'ko-KR,en;q=0.9', 'en;q=0.5,ko;q=1']) assert.equal(preferredLanguage(language), 'ko');
  for (const language of ['en-US,ko;q=0.9', 'ja-JP,en;q=0.5', 'zh-Hant-TW', 'fr,ko;q=0']) assert.equal(preferredLanguage(language), 'en');
  for (const language of ['', '*', 'invalid', 'en;q=0', 'en;q=nope']) assert.equal(preferredLanguage(language), null);
});

test('only supported saved language values are honored', () => {
  assert.equal(savedLanguage('other=1; fortune-language=ko'), 'ko');
  assert.equal(savedLanguage('fortune-language=en; other=1'), 'en');
  assert.equal(savedLanguage('fortune-language=ja'), null);
  assert.equal(savedLanguage('other-fortune-language=en'), null);
});

test('locale paths preserve the matching page without repeated prefixes', () => {
  assert.equal(languagePath('/', 'en'), '/en/');
  assert.equal(languagePath('/en/', 'ko'), '/');
  assert.equal(languagePath('/today/', 'en'), '/en/today/');
  assert.equal(languagePath('/en/today/', 'en'), '/en/today/');
  assert.equal(languagePath('/en/today/', 'ko'), '/today/');
});

test('automatic redirects preserve campaign queries and allow user preference and explicit URLs', () => {
  const request = { path: '/today/', search: '?utm_source=instagram', acceptLanguage: 'en-US', hasPath: (path) => path === '/en/today/' };
  assert.equal(languageRedirect(request), '/en/today/?utm_source=instagram');
  assert.equal(languageRedirect({ ...request, path: '/today' }), '/en/today/?utm_source=instagram');
  assert.equal(languageRedirect({ ...request, cookie: 'fortune-language=ko' }), null);
  assert.equal(languageRedirect({ ...request, acceptLanguage: 'ko-KR' }), null);
  assert.equal(languageRedirect({ ...request, acceptLanguage: '' }), null);
  assert.equal(languageRedirect({ ...request, path: '/en/today/' }), null);
  assert.equal(languageRedirect({ ...request, userAgent: 'Googlebot' }), null);
  assert.equal(languageRedirect({ ...request, userAgent: 'Mozilla/5.0 (compatible; Google-InspectionTool/1.0)' }), null);
  assert.equal(languageRedirect({ ...request, path: '/missing/' }), null);
  assert.equal(languageRedirect({ ...request, path: '/assets/app.js' }), null);
});
