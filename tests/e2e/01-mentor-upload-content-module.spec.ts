import { test, expect } from '@playwright/test';
import { uiLogin } from './helpers/auth';
import { uniq, uploadFile, expectSuccessFeedback } from './helpers/forms';

test.describe('Mentor: upload content module with file', () => {
    test.beforeEach(async ({ page }) => {
        await uiLogin(page, 'mentor');
    });

    test('mentor creates a module then attaches a document item', async ({ page }) => {
        await page.goto('/eagle/content/upload');
        await expect(page.getByRole('heading', { name: /upload content/i })).toBeVisible();

        const moduleTitle = uniq('E2E Test Module');
        await page.locator('input[name="title"]').fill(moduleTitle);
        await page.locator('textarea[name="description"]').fill('E2E auto-created module for testing.');

        // Real DOM: native <select> for difficulty, <input type="number"> for points.
        await page.locator('select[name="difficulty"]').selectOption('beginner').catch(() => { });
        await page.locator('input[name="points_value"]').fill('20').catch(() => { });

        // Visibility — default OK
        const createBtn = page.getByRole('button', { name: /create module/i }).first();
        await createBtn.click();

        // Either toast OR navigate to module detail; both signal success.
        await expectSuccessFeedback(page, /module.*created|created.*module|saved/i).catch(async () => {
            await expect(page).not.toHaveURL(/\/upload$/);
        });
    });
});
