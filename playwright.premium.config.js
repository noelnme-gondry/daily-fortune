import { defineConfig } from '@playwright/test';
import config from './playwright.config.js';

// 기본 판매 흐름은 복구 모드와 별도로 검증한다.
export default defineConfig({
  ...config, testIgnore: [], testMatch: ['**/premium-ux.spec.js', '**/premium-reading.spec.js', '**/premium-funnel.spec.js'],
  webServer: { ...config.webServer, env: { ...config.webServer.env, FORTUNE_PAID_READINGS: '1' } },
});
