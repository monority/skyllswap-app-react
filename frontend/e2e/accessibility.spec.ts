import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('can navigate with Tab', async ({ page }) => {
    // Le premier élément focusable est le lien "HumanWorkForce"
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    const tagName = await focused.evaluate(el => el.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(tagName);
  });

  test('form fields are focusable', async ({ page }) => {
    // Le formulaire est dans le panneau "Compte"
    const comptePanel = page.locator('article:has(h2:has-text("Compte"))');
    await expect(comptePanel).toBeVisible();
    // Le formulaire d'auth est le premier .auth-form dans le panneau
    const authForm = comptePanel.locator('.auth-form').first();
    await expect(authForm).toBeVisible();
    const emailInput = authForm.locator('input[placeholder="Email"]');
    await expect(emailInput).toBeVisible();
    await emailInput.focus();
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});