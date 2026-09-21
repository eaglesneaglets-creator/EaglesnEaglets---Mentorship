import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { aliases } from './vite.config.js';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
    css: false,
    // Playwright E2E specs live in tests/e2e/ and use @playwright/test — they
    // throw "test.describe() not expected here" when vitest tries to load them.
    exclude: ['node_modules/', 'dist/', 'tests/e2e/**', '**/*.e2e.*'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/', '**/*.config.*', 'dist/', 'tests/e2e/**'],
    },
  },
  resolve: {
    alias: aliases,
  },
});
