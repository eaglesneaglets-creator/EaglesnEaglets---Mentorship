import { test, expect, BrowserContext } from '@playwright/test';
import { uiLogin } from './helpers/auth';

/**
 * Cross-actor: mentor approves a pending enrollment, mentee tab reflects Active.
 *
 * Uses two contexts (independent cookie jars). Mentee logs in first to capture
 * baseline ("My Program" empty OR pending). Mentor approves. Mentee refreshes.
 *
 * Skips if no pending enrollment exists at run time.
 */

let menteeCtx: BrowserContext;
let mentorCtx: BrowserContext;

test.beforeAll(async ({ browser }) => {
    menteeCtx = await browser.newContext();
    mentorCtx = await browser.newContext();
});

test.afterAll(async () => {
    await menteeCtx?.close();
    await mentorCtx?.close();
});

test('mentor approval flips mentee enrollment to Active', async () => {
    const menteePage = await menteeCtx.newPage();
    await uiLogin(menteePage, 'mentee');
    await menteePage.goto('/eaglet/nest');
    const wasActiveAlready = await menteePage.getByText(/active program/i).first().isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(wasActiveAlready, 'Mentee already has active program — no fresh approval flow to verify');

    const mentorPage = await mentorCtx.newPage();
    await uiLogin(mentorPage, 'mentor');
    await mentorPage.goto('/eagle/nests');
    // Navigate via UI to first nest's enrollments
    const firstNest = mentorPage.locator('a[href*="/eagle/nests/"]').first();
    const has = await firstNest.isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(!has, 'Mentor has no nest');
    const nestHref = await firstNest.getAttribute('href');
    await mentorPage.goto(`${nestHref}/enrollments`);

    const approveBtn = mentorPage.getByRole('button', { name: /^approve$/i }).first();
    const approveVisible = await approveBtn.isVisible({ timeout: 5_000 }).catch(() => false);
    test.skip(!approveVisible, 'No pending enrollment to approve');
    await approveBtn.click();

    // Switch back to mentee, force refresh (DashboardLayout focus handler fires)
    await menteePage.bringToFront();
    await menteePage.goto('/eaglet/nest');
    await expect(menteePage.getByText(/active program/i).first()).toBeVisible({ timeout: 10_000 });
});
