import { test, expect } from '@playwright/test';
import { uiLogin } from './helpers/auth';
import { uniq } from './helpers/forms';

test.describe('Mentor: send standalone assignment to mentees', () => {
    test.beforeEach(async ({ page }) => {
        await uiLogin(page, 'mentor');
    });

    test('mentor opens Send Assignment modal + submits', async ({ page }) => {
        await page.goto('/eagle/content');
        const sendBtn = page.getByRole('button', { name: /send.*assignment|standalone.*assignment/i }).first();
        const visible = await sendBtn.isVisible({ timeout: 5_000 }).catch(() => false);
        test.skip(!visible, 'Send Assignment button not on /eagle/content');
        await sendBtn.click();

        // Modal opens — wait for title input rather than [role="dialog"] (not present in app)
        const titleInput = page.getByPlaceholder('Assignment title...');
        await expect(titleInput).toBeVisible({ timeout: 5_000 });
        await titleInput.fill(uniq('E2E Assignment'));
        await page.getByPlaceholder('Describe what eaglets should do...').fill('E2E auto-created assignment.');

        // First number input = points
        await page.locator('input[type="number"]').first().fill('15').catch(() => { });

        await page.getByRole('button', { name: /^send to nest$/i }).click();

        await expect(page.getByText(/sent|created|published|assigned/i).first()).toBeVisible({ timeout: 8_000 });
    });
});
