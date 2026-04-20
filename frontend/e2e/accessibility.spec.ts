import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('can navigate with Tab', async ({ page }) => {
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    const tagName = await focused.evaluate(el => el.tagName);
    expect(['BUTTON', 'INPUT']).toContain(tagName);
  });

  test('form fields are focusable', async ({ page }) => {
    await page.getByRole('button', { name: /connexion/i }).click();
    const emailInput = page.locator('input[placeholder="Email"]');
    await expect(emailInput).toBeVisible();
    await emailInput.focus();
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});