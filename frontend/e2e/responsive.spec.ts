import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('Mobile Layout - page loads', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Mobile Layout - auth buttons accessible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    // Le formulaire est directement visible
    const authForm = page.locator('.auth-form');
    await expect(authForm).toBeVisible();
    // Les boutons de connexion/inscription sont dans le formulaire
    await expect(authForm.getByRole('button', { name: /Connexion/i })).toBeVisible();
    await expect(authForm.getByRole('button', { name: /Inscription/i })).toBeVisible();
  });

  test('Tablet Layout - page loads', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Desktop Layout - page loads', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Desktop Layout - all sections visible', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    // Le formulaire d'auth est visible
    const authForm = page.locator('.auth-form');
    await expect(authForm).toBeVisible();
  });
});