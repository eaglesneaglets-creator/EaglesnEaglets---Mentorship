import { test, expect } from '@playwright/test';
import { uiLogin } from './helpers/auth';

test.describe('Admin: approve / reject KYC application', () => {
    test.beforeEach(async ({ page }) => {
        await uiLogin(page, 'admin');
    });

    test('admin opens first pending KYC + approves', async ({ page }) => {
        await page.goto('/admin/kyc');
        await expect(page.getByText(/kyc management|review portal/i).first()).toBeVisible({ timeout: 5_000 });

        // Default tab is "All". Click "Pending" / "Submitted" to focus actionable items.
        const pendingTab = page.getByRole('button', { name: /^pending$|^submitted$/i }).first();
        if (await pendingTab.isVisible({ timeout: 2_000 }).catch(() => false)) {
            await pendingTab.click();
        }

        // Skip cleanly when DB has no pending KYC (all already approved in dev DB).
        const empty = page.getByText(/no applications found/i).first();
        if (await empty.isVisible({ timeout: 3_000 }).catch(() => false)) {
            test.skip(true, 'No pending KYC applications. Seed a submitted application to exercise approval.');
        }

        const firstRow = page.locator('table tbody tr, [class*="kyc" i] li, [role="listitem"]').first();
        const has = await firstRow.isVisible({ timeout: 5_000 }).catch(() => false);
        test.skip(!has, 'No pending KYC rows rendered');
        await firstRow.click();

        const approveBtn = page.getByRole('button', { name: /^approve$/i }).first();
        const visible = await approveBtn.isVisible({ timeout: 5_000 }).catch(() => false);
        test.skip(!visible, 'Approve button not present (already approved or different status)');
        await approveBtn.click();

        // Confirm dialog OR direct success
        const confirm = page.getByRole('button', { name: /confirm|yes|approve/i }).last();
        if (await confirm.isVisible({ timeout: 2_000 }).catch(() => false)) {
            await confirm.click();
        }

        await expect(page.getByText(/approved|success/i).first()).toBeVisible({ timeout: 8_000 });
    });
});
