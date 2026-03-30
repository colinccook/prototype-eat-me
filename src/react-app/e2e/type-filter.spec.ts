import { test, expect } from '@playwright/test';

test.describe('Item Type Filter', () => {
  test.describe('@type-filter', () => {
    test('Default view shows food items and not drink items', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Wait for food to load
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // Then the type pill should show "Food"
      const typePill = page.locator('.pill').filter({ hasText: 'Type:' });
      await expect(typePill).toBeVisible();
      await expect(typePill).toContainText('Food');

      // URL should not contain type param (Food is the default)
      await expect(page).not.toHaveURL(/type=/);

      // And a known food item (Big Mac) should be visible
      const allCardNames = await page.locator('.food-card .food-name').allTextContents();
      const bigMacVisible = allCardNames.some(name => name.toLowerCase().includes('big mac'));
      expect(bigMacVisible).toBe(true);

      // And drink items should not be visible (Americano is a drink in test data)
      const drinkVisible = allCardNames.some(name => name.toLowerCase().includes('americano'));
      expect(drinkVisible).toBe(false);
    });

    test('Switch to drinks view shows drinks and hides food', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Wait for food to load
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // Click the Type pill to open the tray
      const typePill = page.locator('.pill').filter({ hasText: 'Type:' });
      await typePill.click();

      // Select "Drinks" option
      const drinksOption = page.locator('.tray-option').filter({ hasText: 'Drinks' });
      await drinksOption.click();

      // Wait for URL to reflect the drink filter
      await expect(page).toHaveURL(/type=drink/);

      // Then the type pill should show "Drinks"
      await expect(typePill).toContainText('Drinks');

      // And drink items should be visible (Americano is a drink in test data)
      const allCardNames = await page.locator('.food-card .food-name').allTextContents();
      const drinkVisible = allCardNames.some(name => name.toLowerCase().includes('americano'));
      expect(drinkVisible).toBe(true);

      // And food items should not be visible (Big Mac is a food item in test data)
      const foodVisible = allCardNames.some(name => name.toLowerCase().includes('big mac'));
      expect(foodVisible).toBe(false);
    });

    test('Switch back to food view restores food items', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Wait for food to load
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // Switch to drinks
      const typePill = page.locator('.pill').filter({ hasText: 'Type:' });
      await typePill.click();
      const drinksOption = page.locator('.tray-option').filter({ hasText: 'Drinks' });
      await drinksOption.click();
      await expect(page).toHaveURL(/type=drink/);

      // Switch back to food
      await typePill.click();
      const foodOption = page.locator('.tray-option').filter({ hasText: 'Food' });
      await foodOption.click();

      // URL type param should be removed when switching back to the default
      await expect(page).not.toHaveURL(/type=/);

      // Then the type pill should show "Food"
      await expect(typePill).toContainText('Food');

      // And food items should be visible again
      const allCardNames = await page.locator('.food-card .food-name').allTextContents();
      const foodVisible = allCardNames.some(name => name.toLowerCase().includes('big mac'));
      expect(foodVisible).toBe(true);
    });
  });
});
