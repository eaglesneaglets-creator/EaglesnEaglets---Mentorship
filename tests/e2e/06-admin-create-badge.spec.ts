import { test, expect } from '@playwright/test';
import { uiLogin } from './helpers/auth';
import { uniq } from './helpers/forms';

test.describe('Admin: create badge', () => {
    test.beforeEach(async ({ page }) => {
        await uiLogin(page, 'admin');
    });

    test('admin reaches badge admin + creates a new badge (if surface exists)', async ({ page }) => {
        // Verified during 2026-05-19 audit: no admin badge management UI exists.
        // Badges are seeded server-side via `python manage.py seed_badges`.
        // Spec kept as documentation-of-intent in case admin UI ever ships.
        test.skip(true, 'Badges seeded via management command, no admin UI surface (intentional, per audit)');

        // --- Below kept for future when admin badge UI lands ---
        await page.goto('/admin/points/badges');
        const newBtn = page.getByRole('button', { name: /new badge|add badge|create badge/i }).first();
        await newBtn.click();
        await page.getByPlaceholder(/name|badge name/i).first().fill(uniq('E2E Badge'));
        await page.getByRole('button', { name: /save|create/i }).first().click();
        await expect(page.getByText(/created|saved/i).first()).toBeVisible({ timeout: 8_000 });
    });
});
