import { test, expect } from '@playwright/test';

test.describe('Notice Cards', () => {
  test.describe('@consent', () => {
    test.use({
      storageState: { cookies: [], origins: [] },
    });

    test('Cookie consent card is shown on first visit', async ({ page }) => {
      // Clear localStorage to simulate first visit
      await page.goto('/');
      await page.evaluate(() => localStorage.removeItem('eatme-cookie-consent'));
      await page.reload();
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // Then I should see the cookie consent card
      const consentCard = page.locator('.notice-card--consent');
      await expect(consentCard).toBeVisible();

      // And it should have the expected title
      await expect(consentCard.locator('.notice-card__title')).toHaveText('🍪 Cookie Preferences');

      // And it should have Accept and Refuse buttons
      const acceptBtn = consentCard.locator('.notice-card__btn--accept');
      const refuseBtn = consentCard.locator('.notice-card__btn--refuse');
      await expect(acceptBtn).toBeVisible();
      await expect(acceptBtn).toHaveText('Accept cookies');
      await expect(refuseBtn).toBeVisible();
      await expect(refuseBtn).toHaveText('Refuse cookies');
    });

    test('Accepting cookies hides the consent card', async ({ page }) => {
      // Clear localStorage to simulate first visit
      await page.goto('/');
      await page.evaluate(() => localStorage.removeItem('eatme-cookie-consent'));
      await page.reload();
      await page.waitForLoadState('networkidle');

      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // When I click "Accept cookies"
      const acceptBtn = page.locator('.notice-card__btn--accept');
      await acceptBtn.click();

      // Then the consent card should disappear
      const consentCard = page.locator('.notice-card--consent');
      await expect(consentCard).not.toBeVisible();
    });

    test('Refusing cookies hides the consent card', async ({ page }) => {
      // Clear localStorage to simulate first visit
      await page.goto('/');
      await page.evaluate(() => localStorage.removeItem('eatme-cookie-consent'));
      await page.reload();
      await page.waitForLoadState('networkidle');

      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // When I click "Refuse cookies"
      const refuseBtn = page.locator('.notice-card__btn--refuse');
      await refuseBtn.click();

      // Then the consent card should disappear
      const consentCard = page.locator('.notice-card--consent');
      await expect(consentCard).not.toBeVisible();
    });

    test('Cookie consent choice persists across page reloads', async ({ page }) => {
      // Clear localStorage to simulate first visit
      await page.goto('/');
      await page.evaluate(() => localStorage.removeItem('eatme-cookie-consent'));
      await page.reload();
      await page.waitForLoadState('networkidle');

      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // Accept cookies
      const acceptBtn = page.locator('.notice-card__btn--accept');
      await acceptBtn.click();

      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      await foodGrid.waitFor({ state: 'visible' });

      // The consent card should not be visible
      const consentCard = page.locator('.notice-card--consent');
      await expect(consentCard).not.toBeVisible();
    });
  });

  test.describe('@disclaimer', () => {
    test.use({
      storageState: { cookies: [], origins: [] },
    });

    test('AI disclaimer card is shown on first visit', async ({ page }) => {
      // Clear localStorage to simulate first visit
      await page.goto('/');
      await page.evaluate(() => localStorage.removeItem('eatme-disclaimer-dismissed'));
      await page.reload();
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // Then I should see the AI disclaimer card
      const disclaimerCard = page.locator('.notice-card--disclaimer');
      await expect(disclaimerCard).toBeVisible();

      // And it should have the expected title
      await expect(disclaimerCard.locator('.notice-card__title')).toHaveText('⚠️ AI Disclaimer');

      // And it should mention AI-processed data
      const text = disclaimerCard.locator('.notice-card__text');
      await expect(text).toContainText('AI');
    });

    test('Dismissing the AI disclaimer hides the card', async ({ page }) => {
      // Clear localStorage to simulate first visit
      await page.goto('/');
      await page.evaluate(() => localStorage.removeItem('eatme-disclaimer-dismissed'));
      await page.reload();
      await page.waitForLoadState('networkidle');

      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // When I click "Got it, dismiss"
      const dismissBtn = page.locator('.notice-card__btn--dismiss');
      await dismissBtn.click();

      // Then the disclaimer card should disappear
      const disclaimerCard = page.locator('.notice-card--disclaimer');
      await expect(disclaimerCard).not.toBeVisible();
    });

    test('AI disclaimer dismissal persists across page reloads', async ({ page }) => {
      // Clear localStorage to simulate first visit
      await page.goto('/');
      await page.evaluate(() => localStorage.removeItem('eatme-disclaimer-dismissed'));
      await page.reload();
      await page.waitForLoadState('networkidle');

      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // Dismiss the disclaimer
      const dismissBtn = page.locator('.notice-card__btn--dismiss');
      await dismissBtn.click();

      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      await foodGrid.waitFor({ state: 'visible' });

      // The disclaimer card should not be visible
      const disclaimerCard = page.locator('.notice-card--disclaimer');
      await expect(disclaimerCard).not.toBeVisible();
    });
  });
});
