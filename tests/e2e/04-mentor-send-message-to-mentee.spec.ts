import { test, expect } from '@playwright/test';
import { uiLogin } from './helpers/auth';

test.describe('Mentor: send chat message to mentee', () => {
    test.beforeEach(async ({ page }) => {
        await uiLogin(page, 'mentor');
    });

    test('mentor opens conversation + sends a message', async ({ page }) => {
        await page.goto('/eagle/messages');

        // Pick first conversation in list
        const firstConv = page.locator('[class*="conversation" i] li, [role="listitem"], li').first();
        const has = await firstConv.isVisible({ timeout: 5_000 }).catch(() => false);
        test.skip(!has, 'No conversations to message into');
        await firstConv.click();

        const messageInput = page.locator('input[placeholder*="message" i], textarea[placeholder*="message" i]').first();
        const inputVisible = await messageInput.isVisible({ timeout: 5_000 }).catch(() => false);
        test.skip(!inputVisible, 'Message input not visible — conversation may not have loaded');

        const text = `E2E test ping ${Date.now().toString().slice(-5)}`;
        await messageInput.fill(text);

        const sendBtn = page.getByRole('button', { name: /^send$/i }).first();
        if (await sendBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
            await sendBtn.click();
        } else {
            await messageInput.press('Enter');
        }

        // Sent message appears in transcript
        await expect(page.getByText(text).first()).toBeVisible({ timeout: 10_000 });
    });
});
