import { test, expect } from '@playwright/test';

test.describe('Food Display', () => {
  test.describe('@smoke', () => {
    test('Display welcome page - should see Eat Me header and welcome message', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Then I should see the "Eat Me" header
      const header = page.locator('h1');
      await expect(header).toBeVisible();
      await expect(header).toContainText('Eat Me');

      // And I should see the welcome message
      const welcomeMessage = page.locator('.welcome-message');
      await expect(welcomeMessage).toBeVisible();
    });

    test('Select a region - should see restaurant options', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When I select the "United Kingdom" region
      const regionSelect = page.locator('#region-select');
      await regionSelect.selectOption({ label: 'United Kingdom' });
      await page.waitForLoadState('networkidle');

      // Then I should see restaurant options
      const restaurantSelect = page.locator('#restaurant-select');
      await expect(restaurantSelect).toBeVisible();
    });
  });

  test.describe('@filter', () => {
    test('Filter vegetarian foods - should see only vegetarian items', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When I select the "United Kingdom" region
      const regionSelect = page.locator('#region-select');
      await regionSelect.selectOption({ label: 'United Kingdom' });
      await page.waitForLoadState('networkidle');

      // And I select vegetarian only filter
      const vegetarianCheckbox = page.locator('label').filter({ hasText: 'Vegetarian' }).locator('input[type="checkbox"]');
      await vegetarianCheckbox.check();
      await page.waitForTimeout(500); // Wait for filter to apply

      // Then I should see only vegetarian food items
      const foodCards = page.locator('.food-card');
      const count = await foodCards.count();

      if (count > 0) {
        // Check that vegetarian badges are present on all visible items
        const vegetarianBadges = page.locator('.badge.vegetarian');
        const badgeCount = await vegetarianBadges.count();
        expect(badgeCount).toBe(count);
      }
    });

    test('Filter by maximum calories - all items should have 300 or fewer calories', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When I select the "United Kingdom" region
      const regionSelect = page.locator('#region-select');
      await regionSelect.selectOption({ label: 'United Kingdom' });
      await page.waitForLoadState('networkidle');

      // And I set maximum calories to 300
      const calorieInput = page.locator('input[type="number"]');
      await calorieInput.fill('300');
      await page.waitForTimeout(500); // Wait for filter to apply

      // Then all displayed items should have 300 or fewer calories
      const foodCards = page.locator('.food-card');
      const count = await foodCards.count();

      for (let i = 0; i < count; i++) {
        const card = foodCards.nth(i);
        const calorieElement = card.locator('.nutrition-item').first().locator('.nutrition-value');
        const calorieText = await calorieElement.textContent();
        if (calorieText) {
          const calories = parseInt(calorieText, 10);
          expect(calories).toBeLessThanOrEqual(300);
        }
      }
    });
  });

  test.describe('@sort', () => {
    test('Sort by highest protein - items should be sorted by protein descending', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When I select the "United Kingdom" region
      const regionSelect = page.locator('#region-select');
      await regionSelect.selectOption({ label: 'United Kingdom' });
      await page.waitForLoadState('networkidle');

      // And I sort by "Protein (High to Low)"
      const sortSelect = page.locator('.filter-section select').last();
      await sortSelect.selectOption({ label: 'Protein (High to Low)' });
      await page.waitForTimeout(500); // Wait for sort to apply

      // Then items should be sorted by protein in descending order
      const proteinValues = page.locator('.nutrition-item:nth-child(2) .nutrition-value');
      const count = await proteinValues.count();

      const proteins: number[] = [];
      for (let i = 0; i < count; i++) {
        const text = await proteinValues.nth(i).textContent();
        if (text) {
          const protein = parseFloat(text.replace('g', ''));
          if (!isNaN(protein)) {
            proteins.push(protein);
          }
        }
      }

      // Verify descending order
      for (let i = 0; i < proteins.length - 1; i++) {
        expect(proteins[i]).toBeGreaterThanOrEqual(proteins[i + 1]);
      }
    });

    test('Sort by lowest salt - items should be sorted by salt ascending with salt info displayed', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When I select the "United Kingdom" region
      const regionSelect = page.locator('#region-select');
      await regionSelect.selectOption({ label: 'United Kingdom' });
      await page.waitForLoadState('networkidle');

      // And I sort by "Salt (Low to High)"
      const sortSelect = page.locator('.filter-section select').last();
      await sortSelect.selectOption({ label: 'Salt (Low to High)' });
      await page.waitForTimeout(500); // Wait for sort to apply

      // Then salt info should be displayed on food cards
      const saltInfoElements = page.locator('.salt-info');
      const count = await saltInfoElements.count();
      expect(count).toBeGreaterThan(0);

      // And items with salt data should be sorted by salt in ascending order
      const saltValues: number[] = [];
      for (let i = 0; i < count; i++) {
        const saltValueElement = saltInfoElements.nth(i).locator('.salt-value');
        if (await saltValueElement.count() > 0) {
          const text = await saltValueElement.textContent();
          if (text) {
            const salt = parseFloat(text.replace('g', ''));
            if (!isNaN(salt)) {
              saltValues.push(salt);
            }
          }
        }
      }

      // Verify ascending order for items with salt data
      for (let i = 0; i < saltValues.length - 1; i++) {
        expect(saltValues[i]).toBeLessThanOrEqual(saltValues[i + 1]);
      }
    });
  });
});
