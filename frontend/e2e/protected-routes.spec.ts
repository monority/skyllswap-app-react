import { test, expect } from '@playwright/test';

test.describe('Content Visibility Based on Auth', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('sees login/register buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /connexion/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /inscription/i })).toBeVisible();
  });

  test('does not see logout button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /se deconnecter/i })).not.toBeVisible();
  });

  test('sees a form on the page', async ({ page }) => {
    const forms = page.locator('form');
    await expect(forms.first()).toBeVisible();
  });
});