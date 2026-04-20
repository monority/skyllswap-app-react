import { test, expect } from '@playwright/test';

test.describe('Profil utilisateur', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('affiche la section profil', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
  });

  test('affiche le formulaire de profil', async ({ page }) => {
    // Le formulaire de profil est dans un article avec h2 "Mon profil"
    const profileSection = page.locator('article:has(h2:has-text("Mon profil"))');
    await expect(profileSection).toBeVisible();
  });
});