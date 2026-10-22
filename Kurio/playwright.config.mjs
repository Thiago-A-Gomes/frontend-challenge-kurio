import { defineConfig } from '@playwright/test';

const optimizedBuild = process.env.PLAYWRIGHT_BUILD === '1';
const port = Number(process.env.PLAYWRIGHT_PORT || (optimizedBuild ? 5191 : 5180));
const externalURL = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './tests/e2e', timeout: 45000, fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'reports/tests/results.json' }]],
  use: { baseURL: externalURL || `http://127.0.0.1:${port}`, trace: 'retain-on-failure', screenshot: 'only-on-failure',
    launchOptions: process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {},
  },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 } } },
  ],
  webServer: externalURL ? undefined : { command: `npm run ${optimizedBuild ? 'preview' : 'dev'} -- --host 127.0.0.1 --port ${port} --strictPort`, url: `http://127.0.0.1:${port}`, reuseExistingServer: !process.env.CI, timeout: 30000 },
});
