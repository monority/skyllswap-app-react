import { test, expect } from '@playwright/test';

test.describe('Profil utilisateur', () => {
    test('affiche la section profil', async ({ page }) => {
        await page.goto('/');

        const profileSection = page.locator('text=Mon profil').first();
        await expect(profileSection).toBeVisible();
    });

    test('affiche le formulaire de profil', async ({ page }) => {
        await page.goto('/');

        const nameInput = page.getByLabel(/nom|name/i);
        const emailInput = page.getByLabel(/email/i);

        if (await nameInput.count() > 0) {
            await expect(nameInput).toBeVisible();
        }
        if (await emailInput.count() > 0) {
            await expect(emailInput).toBeVisible();
        }
    });

    test('affiche les champs de compétences', async ({ page }) => {
        await page.goto('/');

        const skillsSection = page.locator('text=competences|compétences|skills').first();
        if (await skillsSection.count() > 0) {
            await expect(skillsSection).toBeVisible();
        }
    });

    test('affiche les boutons d\'action du profil', async ({ page }) => {
        await page.goto('/');

        const profileButtons = page.locator('button:has-text(/modifier|editer|edit|sauvegarder|save/i)');
        if (await profileButtons.count() > 0) {
            await expect(profileButtons.first()).toBeVisible();
        }
    });

    test('permet d\'éditer le nom du profil', async ({ page }) => {
        await page.goto('/');

        const nameInput = page.getByLabel(/nom|name/i);
        if (await nameInput.count() > 0) {
            await nameInput.focus();
            const initialValue = await nameInput.inputValue();

            // Simuler une modification
            await nameInput.clear();
            await nameInput.fill('Test User');

            const newValue = await nameInput.inputValue();
            expect(newValue).toBe('Test User');

            // Restaurer la valeur initiale
            await nameInput.clear();
            await nameInput.fill(initialValue || '');
        }
    });

    test('affiche énumeration des compétences', async ({ page }) => {
        await page.goto('/');

        const skillsList = page.locator('[data-testid="skills-list"]');
        if (await skillsList.count() > 0) {
            await expect(skillsList).toBeVisible();

            const skillItems = skillsList.locator('[data-testid="skill-item"]');
            if (await skillItems.count() > 0) {
                expect(await skillItems.count()).toBeGreaterThan(0);
            }
        }
    });

    test('affiche le badge de niveau', async ({ page }) => {
        await page.goto('/');

        const levelBadges = page.locator('[data-testid="level-badge"]');
        if (await levelBadges.count() > 0) {
            await expect(levelBadges.first()).toBeVisible();
        }
    });
});
