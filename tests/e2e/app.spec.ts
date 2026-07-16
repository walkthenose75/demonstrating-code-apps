import { test, expect } from '@playwright/test';

test.describe('App — E2E smoke', () => {
  test('renders the app shell', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Project Tracker')).toBeVisible();
    await expect(page.getByText('Command Center')).toBeVisible();
  });

  test('navigates to the AI Build Cost dashboard', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'AI Build Cost' }).click();
    await expect(page.getByRole('heading', { name: 'AI Build Cost' })).toBeVisible();
  });
});
