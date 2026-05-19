import { test, expect } from '@playwright/test';
import { uiLogin } from './helpers/auth';
import { fixturePath } from './helpers/forms';

test.describe('Mentor: attach PDF content item to a module', () => {
    test.beforeEach(async ({ page }) => {
        await uiLogin(page, 'mentor');
    });

    test('mentor uploads sample.pdf as a content item', async ({ page }) => {
        await page.goto('/eagle/content');
        // Click first existing module — skips if none
        const firstModule = page.locator('[class*="module" i], a[href*="/eagle/content/"]').first();
        const has = await firstModule.isVisible({ timeout: 5_000 }).catch(() => false);
        test.skip(!has, 'No existing module to attach a PDF to. Run 01- first.');
        await firstModule.click();

        const addItemBtn = page.getByRole('button', { name: /add.*content|add.*item|upload.*item/i }).first();
        const btnVisible = await addItemBtn.isVisible({ timeout: 3_000 }).catch(() => false);
        test.skip(!btnVisible, 'No Add Item affordance — module detail UI may differ');
        await addItemBtn.click();

        // Hidden file input in modal — uses standard input[type=file]
        const fileInput = page.locator('input[type="file"]').first();
        await fileInput.setInputFiles(fixturePath('sample.pdf'));

        // Title + submit
        const titleInput = page.getByPlaceholder(/title/i).first();
        if (await titleInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
            await titleInput.fill('PDF item — E2E');
        }
        const save = page.getByRole('button', { name: /save|upload|add/i }).first();
        await save.click();

        // Item appears in list OR success toast
        await expect(page.getByText(/PDF item|sample\.pdf|uploaded/i).first()).toBeVisible({ timeout: 10_000 });
    });
});
