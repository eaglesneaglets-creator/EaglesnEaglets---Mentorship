import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM equivalent of __dirname (package.json has "type": "module").
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Credentials live in .env.test (gitignored).
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
    testDir: './tests/e2e',
    timeout: 60_000,
    expect: { timeout: 10_000 },

    fullyParallel: false,
    workers: 1, // headed mode — sequential prevents window chaos
    retries: 0, // bug-hunting run; flakes should fail, not retry

    reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],

    use: {
        baseURL: 'http://localhost:5173',
        headless: false,
        viewport: { width: 1440, height: 900 },
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
        actionTimeout: 10_000,
        navigationTimeout: 15_000,
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    // Vite + Django already running in Docker per user — no webServer block.
});
