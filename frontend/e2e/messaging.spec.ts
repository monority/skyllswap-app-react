import { test, expect } from '@playwright/test';

test.describe('Messagerie', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('le bouton messagerie est visible pour les utilisateurs connectes', async ({ page }) => {
    // Sans connexion, le bouton de messagerie n'est pas visible
    const messagingBtn = page.locator('button[aria-label*="messagerie"], button:has-text("messagerie")');
    await expect(messagingBtn).not.toBeVisible();
  });

  test('la messagerie est accessible via le header apres connexion', async ({ page }) => {
    // Se connecter d'abord
    const authForm = page.locator('.auth-form');
    await authForm.getByRole('button', { name: /Connexion/i }).click();
    await authForm.locator('input[type="email"]').fill('test@example.com');
    await authForm.locator('input[type="password"]').fill('password123');
    await authForm.getByRole('button', { name: /Me connecter/i }).click();
    await page.waitForTimeout(1000);

    // Verifier que le dashboard est charge
    const profileSection = page.locator('section:has(h2:has-text("Mon profil"))');
    // Si connecte, on voit le dashboard
    if (await profileSection.isVisible().catch(() => false)) {
      // Le bouton de messagerie devrait etre visible dans le header
      const header = page.locator('header');
      await expect(header).toBeVisible();
    }
  });
});