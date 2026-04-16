import { test, expect } from '@playwright/test';

test.describe('Navigation et structure', () => {
  test('page se charge correctement', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/SkillSwap/);
    await expect(page.locator('h1')).toContainText('SkillSwap');
  });

  test('toutes les sections principales sont visibles', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Compte' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Mon profil' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recherche de competences' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Messagerie' })).toBeVisible();
  });

  test('barre de recherche de competences fonctionne', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByPlaceholder(/recherche/i);
    await expect(searchInput).toBeVisible();

    await searchInput.fill('JavaScript');
    await expect(page.locator('.skills-list')).toBeVisible();
  });

  test('accessibilite - elements focusables', async ({ page }) => {
    await page.goto('/');

    const focusableElements = page.locator('button, input, select');
    const count = await focusableElements.count();
    expect(count).toBeGreaterThan(0);
  });
});
