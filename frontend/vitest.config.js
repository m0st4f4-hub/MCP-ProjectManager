#!/usr/bin/env node
/**
 * TASK MANAGER SYSTEM - FRONTEND TEST SUITE
 * NASA/SpaceX Grade Testing Framework for React Components
 * 
 * Test Classification: MISSION-CRITICAL
 * Test Control: TMS-ATP-001-FRONTEND
 * Version: 2.0.0
 * Compliance: NASA NPR 7150.2, SpaceX Software Standards
 */

const { defineConfig } = require('vitest/config');
const path = require('path');

// Aerospace-Grade Test Configuration
const testConfig = defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      threshold: {
        global: {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100
        }
      },
      include: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.stories.{ts,tsx}',
        '!src/**/__tests__/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

module.exports = testConfig;
