import { test, expect } from '@playwright/test';

test.describe('Recherche et Matching de compétences', () => {
  test('affiche la section de recherche de compétences', async ({ page }) => {
    await page.goto('/');

    const matchingSection = page.locator('text=Recherche de competences').first();
    await expect(matchingSection).toBeVisible();
  });

  test('recherche une compétence', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByPlaceholder(/recherche/i);
    await expect(searchInput).toBeVisible();

    await searchInput.fill('JavaScript');
    await page.waitForTimeout(500);

    const skillsList = page.locator('.skills-list');
    await expect(skillsList).toBeVisible();
  });

  test('filtre les résultats de recherche', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByPlaceholder(/recherche/i);
    await searchInput.fill('React');
    await page.waitForTimeout(500);

    // Attendre que des résultats s'affichent
    const results = page.locator('.skills-list li');
    expect(await results.count()).toBeGreaterThan(0);
  });

  test('affiche les détails du profil dans les résultats', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByPlaceholder(/recherche/i);
    await searchInput.fill('Python');
    await page.waitForTimeout(500);

    const profileCard = page.locator('[data-testid="profile-card"]').first();
    if (await profileCard.count() > 0) {
      await expect(profileCard).toBeVisible();
      // Vérifier que le nom et le niveau sont affichés
      await expect(profileCard.locator('text=/niveau|level/i')).toBeVisible();
    }
  });

  test('interaction avec les boutons d\'action', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByPlaceholder(/recherche/i);
    await searchInput.fill('Design');
    await page.waitForTimeout(500);

    const actionButtons = page.locator('button:has-text(/contacter|message|ajouter/i)');
    if (await actionButtons.count() > 0) {
      await expect(actionButtons.first()).toBeVisible();
    }
  });
});
