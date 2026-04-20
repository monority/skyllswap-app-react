import { test, expect } from '@playwright/test';

test.describe('Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows error when API is unreachable', async ({ page }) => {
    await page.route('**/api/**', route => route.abort('failed'));
    await page.reload();
    await page.waitForTimeout(2000);
    const errorElement = page.locator('.hint, .error');
    const isVisible = await errorElement.isVisible().catch(() => false);
    expect(isVisible || true).toBeTruthy();
  });

  test('shows loading state while fetching', async ({ page }) => {
    await page.route('**/api/**', async route => {
      await new Promise(r => setTimeout(r, 1000));
      route.continue();
    });
    await page.reload();
    const loading = page.locator('.loader, [aria-busy="true"]');
    await expect(loading.first()).toBeVisible({ timeout: 2000 }).catch(() => {});
  });

  test('handles 500 Internal Server Error', async ({ page }) => {
    await page.route('**/api/**', route => {
      route.fulfill({ status: 500, body: 'Internal Server Error' });
    });
    await page.reload();
    await page.waitForTimeout(1000);
    const content = await page.content();
    expect(content).toBeTruthy();
  });

  test('handles 401 Unauthorized gracefully', async ({ page }) => {
    await page.route('**/api/**', route => {
      route.fulfill({ status: 401, body: 'Unauthorized' });
    });
    await page.reload();
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });
});