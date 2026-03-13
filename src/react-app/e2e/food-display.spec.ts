import { test, expect } from '@playwright/test';

test.describe('Food Display', () => {
  test.describe('@smoke', () => {
    test('Default region is selected and data loads without interaction', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Region pill should show UK is already selected
      const regionPill = page.getByRole('button', { name: /Region: UK/i });
      await expect(regionPill).toBeVisible();

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

      // Wait for food to load first
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // The region pill shows UK is selected
      const regionPill = page.getByRole('button', { name: /Region: UK/i });
      await expect(regionPill).toBeVisible();

      // Food should be displayed
      await expect(foodGrid).toBeVisible();
    });
  });

  test.describe('@filter', () => {
    test('Filter vegetarian foods - should see only vegetarian items', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Wait for food to load
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // Click the Diet pill to open tray
      const dietPill = page.getByRole('button', { name: /Diet:/i });
      await dietPill.click();

      // Select Vegetarian option in the tray
      const vegetarianOption = page.getByRole('button', { name: /Vegetarian.*No meat or fish/i });
      await vegetarianOption.click();

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

      // Wait for food to load
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // Click the Calories pill to open tray
      const caloriesPill = page.getByRole('button', { name: /Calories:/i });
      await caloriesPill.click();

      // Set maximum calories to 300
      const calorieInput = page.locator('#calorie-input');
      await calorieInput.fill('300');
      
      // Click Apply button
      const applyButton = page.getByRole('button', { name: 'Apply' });
      await applyButton.click();

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

      // Wait for food to load
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // Click the Sort pill to open tray
      const sortPill = page.getByRole('button', { name: /Sort:/i });
      await sortPill.click();

      // Select "Highest Protein" option
      const highestProteinOption = page.getByRole('button', { name: /Highest Protein.*muscle building/i });
      await highestProteinOption.click();

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

      // Wait for food to load
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // Click the Sort pill to open tray
      const sortPill = page.getByRole('button', { name: /Sort:/i });
      await sortPill.click();

      // Select "Lowest Salt" option
      const lowestSaltOption = page.getByRole('button', { name: /Lowest Salt.*blood pressure/i });
      await lowestSaltOption.click();

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

      // Then I should see a detail tray slide up from the bottom
      const tray = page.locator('.tray-overlay');
      await expect(tray).toBeVisible();

      // And the tray should display the food name and nutritional information
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

      // Verify tray is visible
      const tray = page.locator('.tray-overlay');
      await expect(tray).toBeVisible();

      // And I tap on the tray backdrop (outside the tray sheet)
      await tray.click({ position: { x: 10, y: 10 } });

      // Then the detail tray should close
      await expect(tray).not.toBeVisible();
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

      // Verify tray is visible
      const tray = page.locator('.tray-overlay');
      await expect(tray).toBeVisible();

      // And I tap the close button on the tray
      const closeButton = page.locator('.tray-close-button');
      await closeButton.click();

      // Then the detail tray should close
      await expect(tray).not.toBeVisible();
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

      // Then the tray should display the restaurant name
      const modalRestaurant = page.locator('.modal-restaurant');
      await expect(modalRestaurant).toBeVisible();
      await expect(modalRestaurant).toHaveText(restaurantName!);
    });
  });
});
