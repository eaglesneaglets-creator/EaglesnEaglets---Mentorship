import { Page, expect } from '@playwright/test';

type Role = 'mentee' | 'mentor' | 'admin';

function creds(role: Role) {
    const map = {
        mentee: { email: process.env.MENTEE_EMAIL!, password: process.env.MENTEE_PASSWORD! },
        mentor: { email: process.env.MENTOR_EMAIL!, password: process.env.MENTOR_PASSWORD! },
        admin: { email: process.env.ADMIN_EMAIL!, password: process.env.ADMIN_PASSWORD! },
    } as const;
    const c = map[role];
    if (!c.email || !c.password) {
        throw new Error(`Missing creds for role=${role}. Check .env.test`);
    }
    return c;
}

/**
 * UI login flow (per session instructions: UI each test).
 * - Fills email + password on /login
 * - Clicks Sign In
 * - Waits for post-login redirect (dashboard or pending-approval)
 *
 * Tests that hit role-specific surfaces should call this in beforeEach.
 */
export async function uiLogin(page: Page, role: Role) {
    const { email, password } = creds(role);

    // Clear cookies + storage so prior test's session doesn't auto-redirect.
    await page.context().clearCookies();
    await page.goto('/login');
    await page.evaluate(() => {
        try { localStorage.clear(); } catch (_) { /* ignore */ }
        try { sessionStorage.clear(); } catch (_) { /* ignore */ }
    }).catch(() => { /* ignore */ });
    // Second goto ensures we're on /login after storage wipe (no auto-redirect).
    await page.goto('/login');

    await page.getByPlaceholder(/name@example\.com/i).fill(email);
    await page.getByPlaceholder(/enter your password/i).fill(password);

    // Wait for the login POST to resolve — more reliable than URL watching
    // because some roles land on /pending-approval, others on dashboard, and
    // a 4xx response would never change URL at all.
    const loginResponse = page.waitForResponse(
        (resp) => /\/auth\/login\/?$/.test(resp.url()) && resp.request().method() === 'POST',
        { timeout: 15_000 },
    );
    await page.getByRole('button', { name: /^sign in$/i }).click();
    const resp = await loginResponse;
    if (!resp.ok()) {
        throw new Error(`Login failed (${resp.status()}) for role=${role}`);
    }

    // Now wait briefly for the SPA redirect to settle.
    await page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 10_000 })
        .catch(() => { /* role-dependent landing, OK */ });
}

/**
 * Assert user is logged in by finding sidebar nav (DashboardLayout) OR
 * pending-approval banner. Use to verify uiLogin succeeded before test body.
 */
export async function expectLoggedIn(page: Page) {
    await expect(page.locator('nav, [aria-label*="dashboard" i]').first()).toBeVisible({ timeout: 10_000 });
}

export async function logout(page: Page) {
    // Sidebar "Log Out" or header avatar dropdown
    const logoutBtn = page.getByRole('button', { name: /log\s*out|sign\s*out/i }).first();
    if (await logoutBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await logoutBtn.click();
        await page.waitForURL(/\/(login|$)/, { timeout: 5_000 }).catch(() => { });
    }
}
