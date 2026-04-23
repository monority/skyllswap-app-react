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
    // Le formulaire d'auth est directement visible
    const authForm = page.locator('.auth-form');
    await expect(authForm).toBeVisible();
    const emailInput = authForm.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await emailInput.focus();
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});