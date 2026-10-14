import js from '@eslint/js';
const readonly = Object.fromEntries(['window', 'document', 'navigator', 'location', 'localStorage', 'sessionStorage', 'indexedDB', 'HTMLDialogElement', 'URL', 'URLSearchParams', 'File', 'Blob', 'Image', 'Worker', 'console', 'setTimeout', 'clearTimeout', 'process', 'Buffer', 'fetch', 'DOMParser', 'history', 'AbortController', 'requestAnimationFrame'].map((k) => [k, 'readonly']));
export default [
  { ignores: ['node_modules/**', 'dist/**', '.legacy-local/**', '.agents/**', 'test-results/**', 'playwright-report/**', 'src/content/rank-table.js', 'src/content/rank-leaders.js'] },
  js.configs.recommended,
  { files: ['**/*.js', '**/*.mjs'], languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: readonly }, rules: { 'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none', varsIgnorePattern: '^_' }] } },
];
