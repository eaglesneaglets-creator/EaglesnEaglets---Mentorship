/**
 * Shared selector helpers — keep brittle queries in one place.
 * No data-testid in app code; rely on role + visible-text queries.
 */
import { Page } from '@playwright/test';

export const goto = async (page: Page, path: string) => {
    await page.goto(path);
    await page.waitForLoadState('domcontentloaded');
};

export const sidebarLink = (page: Page, name: string | RegExp) =>
    page.locator('nav').getByRole('link', { name }).first();

export const primaryButton = (page: Page, name: string | RegExp) =>
    page.getByRole('button', { name }).first();
