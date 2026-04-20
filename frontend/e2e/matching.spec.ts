import { test, expect } from '@playwright/test';

test.describe('Recherche et Matching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('affiche la section de recherche', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Echange');
  });
});