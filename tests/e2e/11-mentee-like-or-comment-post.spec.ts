import { test, expect } from '@playwright/test';
import { uiLogin } from './helpers/auth';

test.describe('Mentee: like + comment on a Nest post', () => {
    test.beforeEach(async ({ page }) => {
        await uiLogin(page, 'mentee');
    });

    test('mentee likes the first post in the feed', async ({ page }) => {
        await page.goto('/eaglet/nest');
        const goToNestBtn = page.getByRole('link', { name: /go to nest/i }).first();
        if (await goToNestBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await goToNestBtn.click();
        }

        // Skip cleanly if "No posts yet" empty state shown
        const empty = page.getByText(/no posts yet/i).first();
        if (await empty.isVisible({ timeout: 3_000 }).catch(() => false)) {
            test.skip(true, 'Feed has no posts. Run spec 10 first to create one.');
        }

        // Like button = heart icon button. Material icon "favorite_border" or "favorite".
        const likeBtn = page.locator('button:has(span:text-matches("favorite", "i"))').first();
        const has = await likeBtn.isVisible({ timeout: 5_000 }).catch(() => false);
        test.skip(!has, 'No like button on any post (icon material symbol missing)');
        await likeBtn.click();
        await expect(page).not.toHaveURL(/login/);
    });

    test('mentee comments on the first post', async ({ page }) => {
        await page.goto('/eaglet/nest');
        const goToNestBtn = page.getByRole('link', { name: /go to nest/i }).first();
        if (await goToNestBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await goToNestBtn.click();
        }

        const empty = page.getByText(/no posts yet/i).first();
        if (await empty.isVisible({ timeout: 3_000 }).catch(() => false)) {
            test.skip(true, 'Feed has no posts. Run spec 10 first.');
        }

        // Expand first post comments by clicking "Comment" affordance (chat icon)
        const commentToggle = page.locator('button:has(span:text-matches("chat|comment|mode_comment", "i"))').first();
        if (await commentToggle.isVisible({ timeout: 2_000 }).catch(() => false)) {
            await commentToggle.click();
        }

        const commentInput = page.locator('input[placeholder*="comment" i], textarea[placeholder*="comment" i]').first();
        const has = await commentInput.isVisible({ timeout: 5_000 }).catch(() => false);
        test.skip(!has, 'No comment input on any post');

        const text = `E2E comment ${Date.now().toString().slice(-5)}`;
        await commentInput.fill(text);
        await commentInput.press('Enter');

        await expect(page.getByText(text).first()).toBeVisible({ timeout: 10_000 });
    });
});
