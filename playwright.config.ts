import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests', fullyParallel: false, workers: 1, timeout: 30_000,
  expect: { timeout: 8000 }, reporter: [['list'], ['json', { outputFile: 'output/playwright/results.json' }]],
  outputDir: 'test-results',
  use: { baseURL: 'http://127.0.0.1:4173', headless: true, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: { command: 'npm run preview', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI, timeout: 30_000 },
  projects: [
    ...['chrome', 'edge'].flatMap(browser => [
      { name: `${browser}-1920`, use: { viewport: { width: 1920, height: 1080 }, launchOptions: { executablePath: browser === 'chrome' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' } } },
      { name: `${browser}-1366`, use: { viewport: { width: 1366, height: 768 }, launchOptions: { executablePath: browser === 'chrome' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' } } },
    ]),
  ],
})
