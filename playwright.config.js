import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', workers: 1, retries: 0,
  use: { baseURL: 'http://127.0.0.1:4176', channel: 'chrome', headless: true, screenshot: 'off', trace: 'off' },
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 4176', url: 'http://127.0.0.1:4176', reuseExistingServer: false, env: { ADSENSE_CLIENT: 'off' } },
});
