import { test, expect } from '@playwright/test';

test.describe('Content Visibility Based on Auth', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('sees login/register buttons', async ({ page }) => {
    // Les boutons de connexion/inscription sont dans le formulaire d'auth
    const authForm = page.locator('.auth-form');
    await expect(authForm).toBeVisible();
    await expect(authForm.getByRole('button', { name: /Connexion/i })).toBeVisible();
    await expect(authForm.getByRole('button', { name: /Inscription/i })).toBeVisible();
  });

  test('does not see logout button', async ({ page }) => {
    // Pas de bouton de déconnexion car pas connecté
    await expect(page.getByRole('button', { name: /se deconnecter/i })).not.toBeVisible();
  });

  test('sees auth form container', async ({ page }) => {
    // Le formulaire d'auth est directement visible
    const authForm = page.locator('.auth-form');
    await expect(authForm).toBeVisible();
  });
});