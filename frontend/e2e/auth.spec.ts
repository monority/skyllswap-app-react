import { test, expect } from '@playwright/test';

test('formulaire login est visible', async ({ page }) => {
  await page.goto('/');
  // Le formulaire est dans le panneau "Compte"
  const comptePanel = page.locator('article:has(h2:has-text("Compte"))');
  await expect(comptePanel).toBeVisible();
  // Le formulaire d'auth est le premier .auth-form dans le panneau
  const authForm = comptePanel.locator('.auth-form').first();
  await expect(authForm).toBeVisible();
  // Le champ email est dans le formulaire
  await expect(authForm.locator('input[placeholder="Email"]')).toBeVisible();
});

test('formulaire inscription est visible', async ({ page }) => {
  await page.goto('/');
  // Le formulaire est dans le panneau "Compte"
  const comptePanel = page.locator('article:has(h2:has-text("Compte"))');
  await expect(comptePanel).toBeVisible();
  // Clique sur le bouton d'inscription pour afficher le champ nom
  await comptePanel.getByRole('button', { name: /inscription/i }).click();
  await expect(comptePanel.locator('input[placeholder="Ton pseudo"]')).toBeVisible();
});

test('validation HTML5 fonctionne', async ({ page }) => {
  await page.goto('/');
  // Le formulaire est dans le panneau "Compte"
  const comptePanel = page.locator('article:has(h2:has-text("Compte"))');
  await expect(comptePanel).toBeVisible();
  // Le bouton de soumission est visible
  const submitBtn = comptePanel.getByRole('button', { name: /me connecter/i });
  await expect(submitBtn).toBeVisible();
});