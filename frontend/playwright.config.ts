/**
 * TASK MANAGER SYSTEM - PLAYWRIGHT E2E CONFIGURATION
 * NASA/SpaceX Grade End-to-End Testing Configuration
 * 
 * Test Classification: MISSION-CRITICAL
 * Test Control: TMS-ATP-007-E2E-CONFIG
 * Version: 2.0.0
 * Compliance: NASA NPR 7150.2, SpaceX Software Standards
 */

import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'
const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export default defineConfig({
  testDir: './tests-e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Global test setup
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    // API testing project
    {
      name: 'API Tests',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        baseURL: apiBaseURL,
      },
    },
  ],

  webServer: [
    {
      command: 'npm run dev',
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'cd ../backend && python -m uvicorn main:app --reload --port 8000',
      url: apiBaseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./tests-e2e/global-setup.ts'),
  globalTeardown: require.resolve('./tests-e2e/global-teardown.ts'),

  // Test timeouts
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000,
  },

  // Output directory
  outputDir: 'test-results/',
})
