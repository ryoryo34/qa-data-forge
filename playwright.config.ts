import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'line',
  timeout: 30000,
  use: {
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'api-tests',
      testMatch: '**/simple-api.spec.ts',
    },
  ],

  webServer: {
    command: 'npm run server',
    port: 3001,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});