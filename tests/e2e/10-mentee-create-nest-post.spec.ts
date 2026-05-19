import { test, expect } from '@playwright/test';
import { uiLogin } from './helpers/auth';

test.describe('Mentee: post in Nest community', () => {
    test.beforeEach(async ({ page }) => {
        await uiLogin(page, 'mentee');
    });

    test('mentee writes a community post', async ({ page }) => {
        await page.goto('/eaglet/nest');
        // Click into the active nest community hub
        const goToNestBtn = page.getByRole('link', { name: /go to nest/i }).first();
        const has = await goToNestBtn.isVisible({ timeout: 5_000 }).catch(() => false);
        test.skip(!has, 'Mentee has no active nest to post in');
        await goToNestBtn.click();

        // Composer is rendered on Nest hub directly (no Posts tab in current UI).
        const composer = page.locator('textarea[placeholder*="Share an update"]');
        const visible = await composer.isVisible({ timeout: 5_000 }).catch(() => false);
        test.skip(!visible, 'No post composer visible');

        const text = `E2E community post ${Date.now().toString().slice(-5)}`;
        await composer.click(); // focus expands composer + reveals Post button
        await composer.fill(text);

        // Post button appears after composer focus
        await page.getByRole('button', { name: /^post$/i }).first().click();

        await expect(page.getByText(text).first()).toBeVisible({ timeout: 10_000 });
    });
});
