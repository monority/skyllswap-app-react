import { test, expect } from '@playwright/test';

test.describe('Messagerie', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('affiche la section messagerie', async ({ page }) => {
    // La section messagerie est dans un section avec h2 "Messagerie"
    const messagingSection = page.locator('section.messaging-panel:has(h2:has-text("Messagerie"))');
    await expect(messagingSection).toBeVisible();
  });
});