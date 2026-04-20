import { test, expect } from '@playwright/test';

test.describe('Content Visibility Based on Auth', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('sees login/register buttons', async ({ page }) => {
    // Les boutons de connexion/inscription sont dans le panneau "Compte"
    const comptePanel = page.locator('article:has(h2:has-text("Compte"))');
    await expect(comptePanel).toBeVisible();
    await expect(comptePanel.getByRole('button', { name: /connexion/i })).toBeVisible();
    await expect(comptePanel.getByRole('button', { name: /inscription/i })).toBeVisible();
  });

  test('does not see logout button', async ({ page }) => {
    // Pas de bouton de déconnexion car pas connecté
    await expect(page.getByRole('button', { name: /se deconnecter/i })).not.toBeVisible();
  });

  test('sees auth form container', async ({ page }) => {
    // Le formulaire est dans le panneau "Compte"
    const comptePanel = page.locator('article:has(h2:has-text("Compte"))');
    await expect(comptePanel).toBeVisible();
    // Le formulaire d'auth est le premier .auth-form dans le panneau
    const authForm = comptePanel.locator('.auth-form').first();
    await expect(authForm).toBeVisible();
  });
});