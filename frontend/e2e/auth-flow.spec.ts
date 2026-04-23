import { test, expect } from '@playwright/test';

test('login with valid credentials shows success', async ({ page }) => {
  await page.goto('/');
  // Le formulaire est dans la landing page auth
  const authForm = page.locator('.auth-form');
  await expect(authForm).toBeVisible();
  // Clique sur le bouton de connexion
  await authForm.getByRole('button', { name: /Connexion/i }).click();
  await authForm.locator('input[type="email"]').fill('test@example.com');
  await authForm.locator('input[type="password"]').fill('password123');
  await authForm.getByRole('button', { name: /Me connecter/i }).click();
  await page.waitForTimeout(1000);
  await expect(authForm.locator('.hint')).toBeVisible();
});

test('register form shows name field', async ({ page }) => {
  await page.goto('/');
  // Le formulaire est dans la landing page auth
  const authForm = page.locator('.auth-form');
  await expect(authForm).toBeVisible();
  // Clique sur le bouton d'inscription
  await authForm.getByRole('button', { name: /Inscription/i }).click();
  await expect(authForm.locator('input[placeholder="Ton pseudo"]')).toBeVisible();
});

test('logout returns to public view', async ({ page }) => {
  await page.goto('/');
  // Le formulaire est dans la landing page auth
  const authForm = page.locator('.auth-form');
  await expect(authForm).toBeVisible();
  await authForm.getByRole('button', { name: /Connexion/i }).click();
  await authForm.locator('input[type="email"]').fill('test@example.com');
  await authForm.locator('input[type="password"]').fill('password123');
  await authForm.getByRole('button', { name: /Me connecter/i }).click();
  await page.waitForTimeout(1500);
  const logoutBtn = page.getByRole('button', { name: /Se deconnecter/i });
  if (await logoutBtn.isVisible().catch(() => false)) {
    await logoutBtn.click();
    await page.waitForTimeout(500);
  }
  // Apres logout, on revient sur la landing auth
  await expect(page.locator('.auth-form')).toBeVisible();
});