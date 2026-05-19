import { test, expect } from '@playwright/test';
import { uiLogin } from './helpers/auth';
import { fixturePath } from './helpers/forms';

test.describe('Mentee: submit assignment', () => {
    test.beforeEach(async ({ page }) => {
        await uiLogin(page, 'mentee');
    });

    test('mentee opens first available assignment + submits text + file', async ({ page }) => {
        await page.goto('/eaglet/assignments');
        // Toggle to Assignments tab if separate from Modules
        const assignmentsTab = page.getByRole('button', { name: /^assignments$/i }).first();
        if (await assignmentsTab.isVisible({ timeout: 2_000 }).catch(() => false)) {
            await assignmentsTab.click();
        }

        const firstAssignment = page.locator('a[href*="/assignments/"], [class*="assignment" i]').first();
        const has = await firstAssignment.isVisible({ timeout: 5_000 }).catch(() => false);
        test.skip(!has, 'No assignments published yet. Mentor must publish first (spec 03).');
        await firstAssignment.click();

        const textArea = page.locator('textarea').first();
        if (await textArea.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await textArea.fill('E2E submission body — automated test.');
        }

        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.isVisible({ timeout: 1_000 }).catch(() => false)) {
            await fileInput.setInputFiles(fixturePath('sample.pdf'));
        }

        const submitBtn = page.getByRole('button', { name: /submit/i }).first();
        await submitBtn.click();

        await expect(page.getByText(/submitted|success/i).first()).toBeVisible({ timeout: 10_000 });
    });
});
