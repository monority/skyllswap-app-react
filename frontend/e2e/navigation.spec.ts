import { test, expect } from '@playwright/test';

test.describe('Navigation et structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page se charge correctement', async ({ page }) => {
    await expect(page).toHaveTitle(/SkillSwap|Echange/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('toutes les sections principales sont visibles', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('form').first()).toBeVisible();
  });

  test('accessibilite - elements focusables', async ({ page }) => {
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});