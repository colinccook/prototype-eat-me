import { test, expect } from '@playwright/test';

test.describe('Food Display', () => {
  test.describe('@smoke', () => {
    test('Default region is selected and data loads without interaction', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Then I should open the settings panel
      const settingsToggle = page.locator('.settings-toggle');
      await settingsToggle.click();

      // And the United Kingdom region should already be selected
      const regionSelect = page.locator('#region-select');
      await expect(regionSelect).toHaveValue('uk');

      // And restaurant options should appear without choosing a region
      const restaurantSelect = page.locator('#restaurant-select');
      await expect(restaurantSelect).toBeVisible();
      const optionCount = await restaurantSelect.locator('option').count();
      expect(optionCount).toBeGreaterThan(1);

      // And food should load
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });
      await expect(foodGrid).toBeVisible();
    });

    test('Shows loading state when switching regions', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Then I should open the settings panel
      const settingsToggle = page.locator('.settings-toggle');
      await settingsToggle.click();

      // When I clear the region selection
      const regionSelect = page.locator('#region-select');
      await expect(regionSelect).toBeEnabled({ timeout: 15000 });
      await regionSelect.selectOption({ label: 'Select a region' });
      await expect(page.locator('.welcome-message')).toBeVisible();
      await expect(regionSelect).toHaveValue('');

      // And I select the "United Kingdom" region
      await regionSelect.selectOption({ label: 'United Kingdom' });
      await expect(regionSelect).toHaveValue('uk');

      // And data should load afterwards
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });
      await expect(foodGrid).toBeVisible();
    });
  });

  test.describe('@filter', () => {
    test('Filter vegetarian foods - should see only vegetarian items', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Then I should open the settings panel
      const settingsToggle = page.locator('.settings-toggle');
      await settingsToggle.click();

      // When I select the "United Kingdom" region
      const regionSelect = page.locator('#region-select');
      await regionSelect.selectOption({ label: 'United Kingdom' });
      await page.waitForLoadState('networkidle');

      // And I select vegetarian only filter (now in settings panel)
      const vegetarianCheckbox = page.locator('.settings-section').filter({ hasText: 'Dietary' }).locator('label').filter({ hasText: 'Vegetarian' }).locator('input[type="checkbox"]');
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

      // Then I should open the settings panel
      const settingsToggle = page.locator('.settings-toggle');
      await settingsToggle.click();

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

      // Then I should open the settings panel
      const settingsToggle = page.locator('.settings-toggle');
      await settingsToggle.click();

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

      // Then I should open the settings panel
      const settingsToggle = page.locator('.settings-toggle');
      await settingsToggle.click();

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

  test.describe('@detail', () => {
    test('Tap menu item to view details - modal should slide up from bottom', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // And I tap on a food item
      const firstFoodCard = page.locator('.food-card').first();
      const foodName = await firstFoodCard.locator('.food-name').textContent();
      await firstFoodCard.click();

      // Then I should see a detail modal slide up from the bottom
      const modal = page.locator('.modal-overlay');
      await expect(modal).toBeVisible();

      // And the modal should display the food name and nutritional information
      const modalTitle = page.locator('.modal-title');
      await expect(modalTitle).toHaveText(foodName!);

      // Check that calories are displayed
      const caloriesSection = page.locator('.modal-calories-section');
      await expect(caloriesSection).toBeVisible();

      // Check that macros are displayed
      const macrosGrid = page.locator('.macros-grid');
      await expect(macrosGrid).toBeVisible();
    });

    test('Dismiss detail modal by tapping backdrop', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // And I tap on a food item
      const firstFoodCard = page.locator('.food-card').first();
      await firstFoodCard.click();

      // Verify modal is visible
      const modal = page.locator('.modal-overlay');
      await expect(modal).toBeVisible();

      // And I tap on the modal backdrop (outside the modal sheet)
      await modal.click({ position: { x: 10, y: 10 } });

      // Then the detail modal should close
      await expect(modal).not.toBeVisible();
    });

    test('Dismiss detail modal using close button', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // And I tap on a food item
      const firstFoodCard = page.locator('.food-card').first();
      await firstFoodCard.click();

      // Verify modal is visible
      const modal = page.locator('.modal-overlay');
      await expect(modal).toBeVisible();

      // And I tap the close button on the modal
      const closeButton = page.locator('.modal-close-button');
      await closeButton.click();

      // Then the detail modal should close
      await expect(modal).not.toBeVisible();
    });

    test('Modal displays restaurant name for items with restaurant', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // And I tap on a food item that has a restaurant tag
      const foodCardWithRestaurant = page.locator('.food-card').filter({ has: page.locator('.restaurant-tag') }).first();
      const restaurantName = await foodCardWithRestaurant.locator('.restaurant-tag').textContent();
      await foodCardWithRestaurant.click();

      // Then the modal should display the restaurant name
      const modalRestaurant = page.locator('.modal-restaurant');
      await expect(modalRestaurant).toBeVisible();
      await expect(modalRestaurant).toHaveText(restaurantName!);
    });
  });
});
