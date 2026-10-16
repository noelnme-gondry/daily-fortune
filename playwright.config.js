import { defineConfig } from '@playwright/test';

// 기본은 Playwright 번들 Chromium(`npx playwright install chromium`).
// 미리 설치된 브라우저를 쓰려면 PLAYWRIGHT_CHROMIUM_PATH에 실행 파일 경로를 넣는다.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;
export default defineConfig({
  testDir: './tests/browser', workers: 1, retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  use: { baseURL: 'http://127.0.0.1:4176', locale: 'ko-KR', headless: true, screenshot: 'off', trace: 'off', launchOptions: { executablePath } },
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 4176', url: 'http://127.0.0.1:4176', reuseExistingServer: false, env: { ADSENSE_CLIENT: 'off' } },
});
