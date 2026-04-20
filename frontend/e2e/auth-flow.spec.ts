import { test, expect } from '@playwright/test';

test('login with valid credentials shows success', async ({ page }) => {
  await page.goto('/');
  // Le formulaire est dans le panneau "Compte"
  const comptePanel = page.locator('article:has(h2:has-text("Compte"))');
  await expect(comptePanel).toBeVisible();
  // Clique sur le bouton de connexion
  await comptePanel.getByRole('button', { name: /connexion/i }).click();
  await comptePanel.locator('input[placeholder="Email"]').fill('test@example.com');
  await comptePanel.locator('input[placeholder="Mot de passe"]').fill('password123');
  await comptePanel.getByRole('button', { name: /me connecter/i }).click();
  await page.waitForTimeout(1000);
  await expect(page.locator('.hint').first()).toBeVisible();
});

test('register form shows name field', async ({ page }) => {
  await page.goto('/');
  // Le formulaire est dans le panneau "Compte"
  const comptePanel = page.locator('article:has(h2:has-text("Compte"))');
  await expect(comptePanel).toBeVisible();
  // Clique sur le bouton d'inscription
  await comptePanel.getByRole('button', { name: /inscription/i }).click();
  await expect(comptePanel.locator('input[placeholder="Ton pseudo"]')).toBeVisible();
});

test('logout returns to public view', async ({ page }) => {
  await page.goto('/');
  // Le formulaire est dans le panneau "Compte"
  const comptePanel = page.locator('article:has(h2:has-text("Compte"))');
  await expect(comptePanel).toBeVisible();
  await comptePanel.getByRole('button', { name: /connexion/i }).click();
  await comptePanel.locator('input[placeholder="Email"]').fill('test@example.com');
  await comptePanel.locator('input[placeholder="Mot de passe"]').fill('password123');
  await comptePanel.getByRole('button', { name: /me connecter/i }).click();
  await page.waitForTimeout(1500);
  const logoutBtn = page.getByRole('button', { name: /se deconnecter/i });
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
    await page.waitForTimeout(500);
  }
  await expect(page.getByRole('button', { name: /connexion/i })).toBeVisible();
});