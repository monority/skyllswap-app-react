import { test, expect } from '@playwright/test';

test.describe('Profil utilisateur', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('affiche la section profil', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
  });

  test('affiche le formulaire de profil', async ({ page }) => {
    const form = page.locator('form');
    await expect(form.first()).toBeVisible();
  });
});