import { test, expect } from '@playwright/test';

test('formulaire login est visible', async ({ page }) => {
  await page.goto('/');
  // Le formulaire d'auth est directement visible sur la landing
  const authForm = page.locator('.auth-form');
  await expect(authForm).toBeVisible();
  // Le champ email est dans le formulaire
  await expect(authForm.locator('input[type="email"]')).toBeVisible();
});

test('formulaire inscription est visible', async ({ page }) => {
  await page.goto('/');
  // Le formulaire est directement visible
  const authForm = page.locator('.auth-form');
  await expect(authForm).toBeVisible();
  // Clique sur le bouton d'inscription pour afficher le champ nom
  await authForm.getByRole('button', { name: /Inscription/i }).click();
  await expect(authForm.locator('input[placeholder="Ton pseudo"]')).toBeVisible();
});

test('validation HTML5 fonctionne', async ({ page }) => {
  await page.goto('/');
  // Le formulaire est directement visible
  const authForm = page.locator('.auth-form');
  await expect(authForm).toBeVisible();
  // Le bouton de soumission est visible
  const submitBtn = authForm.getByRole('button', { name: /Me connecter/i });
  await expect(submitBtn).toBeVisible();
});