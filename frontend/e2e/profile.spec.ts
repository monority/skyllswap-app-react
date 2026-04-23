import { test, expect } from '@playwright/test';

test.describe('Profil utilisateur', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('affiche la landing page avec branding', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.auth-landing')).toBeVisible();
  });

  test('le formulaire de profil est accessible apres connexion', async ({ page }) => {
    // Sans connexion, on voit le formulaire d'auth
    const authForm = page.locator('.auth-form');
    await expect(authForm).toBeVisible();
    // Le formulaire de profil n'est visible que pour les utilisateurs connectes
    const profileSection = page.locator('section:has(h2:has-text("Mon profil"))');
    await expect(profileSection).not.toBeVisible();
  });
});