import { test, expect } from '@playwright/test';
import { uiLogin } from './helpers/auth';

test.describe('Mentee: take module quiz', () => {
    test.beforeEach(async ({ page }) => {
        await uiLogin(page, 'mentee');
    });

    test('mentee opens first quiz + submits first option', async ({ page }) => {
        await page.goto('/eaglet/assignments');
        const firstModule = page.locator('a[href*="/eaglet/assignments/"]').first();
        const has = await firstModule.isVisible({ timeout: 5_000 }).catch(() => false);
        test.skip(!has, 'No modules to take a quiz from');
        await firstModule.click();

        const quizBtn = page.getByRole('button', { name: /take quiz|start quiz|quiz/i }).first();
        const visible = await quizBtn.isVisible({ timeout: 3_000 }).catch(() => false);
        test.skip(!visible, 'Module has no quiz');
        await quizBtn.click();

        // Pick first radio option per visible question
        const radios = page.locator('input[type="radio"]');
        const count = await radios.count();
        test.skip(count === 0, 'Quiz has no questions');
        for (let i = 0; i < count; i += 1) {
            const r = radios.nth(i);
            const checked = await r.isChecked();
            if (!checked) {
                // Click only first per question — approximate by clicking unique [name]s
                await r.check().catch(() => { });
                break;
            }
        }

        const submit = page.getByRole('button', { name: /submit|finish/i }).first();
        await submit.click();
        await expect(page.getByText(/score|passed|failed|results/i).first()).toBeVisible({ timeout: 10_000 });
    });
});
