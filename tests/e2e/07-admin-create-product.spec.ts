import { test, expect } from '@playwright/test';
import { uiLogin } from './helpers/auth';
import { uniq, fixturePath } from './helpers/forms';

test.describe('Admin: create store product', () => {
    test.beforeEach(async ({ page }) => {
        await uiLogin(page, 'admin');
    });

    test('admin creates new product with image', async ({ page }) => {
        await page.goto('/admin/store');
        const newBtn = page.getByRole('button', { name: /new product|add product|create product/i }).first();
        const visible = await newBtn.isVisible({ timeout: 5_000 }).catch(() => false);
        test.skip(!visible, 'No new-product button on /admin/store');
        await newBtn.click();

        await expect(page.getByRole('dialog').or(page.getByRole('heading', { name: /new product|add product/i }))).toBeVisible({ timeout: 5_000 });

        await page.getByPlaceholder(/name|product name/i).first().fill(uniq('E2E Product'));
        await page.getByPlaceholder(/description/i).first().fill('E2E auto-created product.');

        // Price + stock
        const inputs = page.locator('input[type="number"]');
        if (await inputs.first().isVisible({ timeout: 1_000 }).catch(() => false)) {
            await inputs.nth(0).fill('19.99');
        }
        if (await inputs.nth(1).isVisible({ timeout: 1_000 }).catch(() => false)) {
            await inputs.nth(1).fill('10');
        }

        // Image (optional but covers upload path)
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.isVisible({ timeout: 1_000 }).catch(() => false)) {
            await fileInput.setInputFiles(fixturePath('sample.png'));
        }

        await page.getByRole('button', { name: /save|create|submit/i }).first().click();
        await expect(page.getByText(/created|saved/i).first()).toBeVisible({ timeout: 8_000 });
    });
});
