import { test, expect } from '@playwright/test';

test.describe('Messagerie', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('affiche la section messagerie', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
  });
});