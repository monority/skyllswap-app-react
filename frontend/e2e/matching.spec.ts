import { test, expect } from '@playwright/test';

test.describe('Recherche et Matching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('affiche la section de recherche', async ({ page }) => {
    // La page a un h1 avec le titre principal
    await expect(page.locator('h1')).toBeVisible();
  });
});