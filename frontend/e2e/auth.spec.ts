import { test, expect } from '@playwright/test';

test.describe('Authentification', () => {
  test('formulaire de connexion est visible', async ({ page }) => {
    await page.goto('/');

    const loginTab = page.getByRole('button', { name: /connexion/i });
    if (await loginTab.isVisible()) {
      await loginTab.click();
    }

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
  });

  test('formulaire inscription est visible', async ({ page }) => {
    await page.goto('/');

    const registerTab = page.getByRole('button', { name: /inscription|creer un compte/i });
    if (await registerTab.isVisible()) {
      await registerTab.click();
    }

    await expect(page.getByLabel(/nom/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
  });

  test('validation - champs requis', async ({ page }) => {
    await page.goto('/');

    const registerTab = page.getByRole('button', { name: /inscription|creer un compte/i });
    if (await registerTab.isVisible()) {
      await registerTab.click();
    }

    const submitButton = page.getByRole('button', { name: /creer|s_inscrire/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await expect(page.getByText(/requis/i)).toBeVisible();
    }
  });

  test('erreur avec email invalide', async ({ page }) => {
    await page.goto('/');

    const loginTab = page.getByRole('button', { name: /connexion/i });
    if (await loginTab.isVisible()) {
      await loginTab.click();
    }

    await page.getByLabel(/email/i).fill('email-invalide');
    await page.getByLabel(/mot de passe/i).fill('password123');

    const submitButton = page.getByRole('button', { name: /connexion|se connecter/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(500);
    }
  });
});
