import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: 'tests/qualification',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/qualification.json' }],
  ],
  outputDir: 'test-results/artifacts',
  snapshotPathTemplate:
    'tests/qualification/__screenshots__/{testFilePath}/{arg}-{projectName}{ext}',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 800 },
      },
    },
    {
      name: 'mobile-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      },
    },
  ],
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
