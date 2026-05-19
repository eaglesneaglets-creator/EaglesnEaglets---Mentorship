import { Page, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM equivalent of __dirname (project package.json has "type": "module").
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const FIXTURES = path.resolve(__dirname, '..', 'fixtures');
export const fixturePath = (name: string) => path.join(FIXTURES, name);

/** Unique suffix so reruns don't collide on unique-name BE constraints. */
export const uniq = (prefix: string) => `${prefix} ${Date.now().toString().slice(-6)}`;

/**
 * Resolve a file input near a clickable upload zone. Many forms hide the
 * `<input type="file">` and trigger via styled button. setInputFiles works
 * directly on the hidden input.
 */
export async function uploadFile(page: Page, fileSelector: string, fixtureName: string) {
    await page.locator(fileSelector).setInputFiles(fixturePath(fixtureName));
}

/** Pessimistic toast/notification wait — accepts either success label. */
export async function expectSuccessFeedback(page: Page, copy: RegExp | string = /success|created|saved|submitted|posted/i) {
    const toast = page.locator('[role="status"], [class*="toast" i], [class*="notification" i]').filter({ hasText: copy });
    await expect(toast.first()).toBeVisible({ timeout: 8_000 }).catch(() => {
        // Fallback: any element on page surfaces the copy
        return expect(page.getByText(copy).first()).toBeVisible({ timeout: 5_000 });
    });
}
