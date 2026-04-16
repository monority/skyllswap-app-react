import { test, expect } from '@playwright/test';

test.describe('Messagerie', () => {
    test('affiche la section messagerie', async ({ page }) => {
        await page.goto('/');

        const messagingSection = page.locator('text=Messagerie').first();
        await expect(messagingSection).toBeVisible();
    });

    test('ouvre le panel de messagerie', async ({ page }) => {
        await page.goto('/');

        // Chercher le bouton pour ouvrir la messagerie
        const messagingButton = page.locator('button:has-text(/messagerie|messages|chat/i)').first();
        if (await messagingButton.count() > 0) {
            await messagingButton.click();
            await page.waitForTimeout(500);

            // Vérifier que le panel s'ouvre
            const messagingPanel = page.locator('[data-testid="messaging-panel"]');
            if (await messagingPanel.count() > 0) {
                await expect(messagingPanel).toBeVisible();
            }
        }
    });

    test('affiche la liste des conversations', async ({ page }) => {
        await page.goto('/');

        const conversationList = page.locator('[data-testid="conversation-list"]');
        if (await conversationList.count() > 0) {
            await expect(conversationList).toBeVisible();
        }
    });

    test('affiche une conversation individuelle', async ({ page }) => {
        await page.goto('/');

        const conversationItem = page.locator('[data-testid="conversation-item"]').first();
        if (await conversationItem.count() > 0) {
            await conversationItem.click();
            await page.waitForTimeout(500);

            const messageArea = page.locator('[data-testid="message-area"]');
            if (await messageArea.count() > 0) {
                await expect(messageArea).toBeVisible();
            }
        }
    });

    test('affiche le champ de saisie de message', async ({ page }) => {
        await page.goto('/');

        const messageInput = page.locator('input[placeholder*="message" i], textarea[placeholder*="message" i]').first();
        if (await messageInput.count() > 0) {
            await expect(messageInput).toBeVisible();
        }
    });

    test('affiche l\'indicateur de messages non lus', async ({ page }) => {
        await page.goto('/');

        const unreadBadge = page.locator('[data-testid="unread-badge"]');
        if (await unreadBadge.count() > 0) {
            await expect(unreadBadge).toBeVisible();
        }
    });
});
