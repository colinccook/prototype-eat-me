import { test, expect } from '@playwright/test';

test.describe('Sharing', () => {
  test.describe('@share', () => {
    test('Share button is visible on the card list screen', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // Then I should see a share button in the food list header
      const shareButton = page.locator('.share-button');
      await expect(shareButton).toBeVisible();
    });

    test('Clicking the share button on the card list shows a toast message', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // And I click the share button
      const shareButton = page.locator('.share-button');
      await shareButton.click();

      // Then I should see a "Link copied to clipboard" toast
      const toast = page.locator('.share-toast');
      await expect(toast).toBeVisible();
      await expect(toast).toHaveText('Link copied to clipboard');
    });

    test('Share button is visible on the item detail modal via context menu', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // And I tap on a food item to open the detail modal
      const firstFoodCard = page.locator('.food-card').first();
      await firstFoodCard.click();

      // Then I should see the detail modal
      const tray = page.locator('.tray-overlay');
      await expect(tray).toBeVisible();

      // And I should see a context menu trigger button (replaces the old share button)
      const contextMenuTrigger = page.locator('.context-menu-trigger');
      await expect(contextMenuTrigger).toBeVisible();

      // When I open the context menu
      await contextMenuTrigger.click();

      // Then I should see a Share action in the menu
      const shareAction = page.locator('.context-menu-item').filter({ hasText: 'Share' });
      await expect(shareAction).toBeVisible();
    });

    test('Clicking the share action on a detail modal context menu shows a toast message', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // And I tap on a food item to open the detail modal
      const firstFoodCard = page.locator('.food-card').first();
      await firstFoodCard.click();

      // Then I should see the detail modal
      const tray = page.locator('.tray-overlay');
      await expect(tray).toBeVisible();

      // When I open the context menu and click Share
      const contextMenuTrigger = page.locator('.context-menu-trigger');
      await contextMenuTrigger.click();
      const shareAction = page.locator('.context-menu-item').filter({ hasText: 'Share' });
      await shareAction.click();

      // Then I should see a "Link copied to clipboard" toast
      const toast = page.locator('.share-toast');
      await expect(toast).toBeVisible();
      await expect(toast).toHaveText('Link copied to clipboard');
    });
  });

  test.describe('@share-url', () => {
    test('Shared filter URL applies sort filter on load', async ({ page }) => {
      // Given a shared URL with sort=fat-asc
      await page.goto('/?sort=fat-asc');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // Then the sort pill should show "Lowest Fat"
      const sortPill = page.locator('.pill').filter({ hasText: 'Sort:' });
      await expect(sortPill).toContainText('Lowest Fat');
    });

    test('Shared filter URL applies diet filter on load', async ({ page }) => {
      // Given a shared URL with diet=vegetarian
      await page.goto('/?diet=vegetarian');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // Then the diet pill should show "Veggie"
      const dietPill = page.locator('.pill').filter({ hasText: 'Diet:' });
      await expect(dietPill).toContainText('Veggie');

      // And all visible items should have the vegetarian badge
      const foodCards = page.locator('.food-card');
      const count = await foodCards.count();
      if (count > 0) {
        const vegetarianBadges = page.locator('.badge.vegetarian');
        const badgeCount = await vegetarianBadges.count();
        expect(badgeCount).toBe(count);
      }
    });

    test('Shared filter URL applies calorie range on load', async ({ page }) => {
      // Given a shared URL with maxCal=400
      await page.goto('/?maxCal=400');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // Then the calories pill should show "≤400"
      const caloriesPill = page.locator('.pill').filter({ hasText: 'Calories:' });
      await expect(caloriesPill).toContainText('≤400');
    });

    test('Shared filter URL applies restaurant filter on load', async ({ page }) => {
      // Given a shared URL with restaurants=McDonald's
      await page.goto("/?restaurants=McDonald's");
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // Then the restaurants pill should show "McDonald's"
      const restaurantsPill = page.locator('.pill').filter({ hasText: 'Restaurants:' });
      await expect(restaurantsPill).toContainText("McDonald's");
    });

    test('Shared filter URL applies multiple filters on load', async ({ page }) => {
      // Given a shared URL with sort=fat-asc, diet=vegetarian, and maxCal=600
      await page.goto('/?sort=fat-asc&diet=vegetarian&maxCal=600');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // Then the sort pill should show "Lowest Fat"
      const sortPill = page.locator('.pill').filter({ hasText: 'Sort:' });
      await expect(sortPill).toContainText('Lowest Fat');

      // And the diet pill should show "Veggie"
      const dietPill = page.locator('.pill').filter({ hasText: 'Diet:' });
      await expect(dietPill).toContainText('Veggie');

      // And the calories pill should show "≤600"
      const caloriesPill = page.locator('.pill').filter({ hasText: 'Calories:' });
      await expect(caloriesPill).toContainText('≤600');

      // And all items should be vegetarian
      const foodCards = page.locator('.food-card');
      const count = await foodCards.count();
      if (count > 0) {
        const vegetarianBadges = page.locator('.badge.vegetarian');
        const badgeCount = await vegetarianBadges.count();
        expect(badgeCount).toBe(count);
      }
    });

    test('Shared item URL opens the item detail modal automatically', async ({ page }) => {
      // Given I first find an item name to use for the test
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // Get the name and restaurant of the first food item
      const firstCard = page.locator('.food-card').first();
      const itemName = await firstCard.locator('.food-name').textContent();
      const itemRestaurant = await firstCard.locator('.restaurant-tag').textContent();
      expect(itemName).toBeTruthy();

      // When I navigate to the shared item URL
      const params = new URLSearchParams();
      params.set('item', itemName!);
      if (itemRestaurant) {
        params.set('itemRestaurant', itemRestaurant);
      }
      await page.goto(`/?${params.toString()}`);
      await page.waitForLoadState('networkidle');

      // Then the detail modal should open automatically
      const tray = page.locator('.tray-overlay');
      await expect(tray).toBeVisible();

      // And the modal should show the correct item name
      const modalTitle = page.locator('.modal-title');
      await expect(modalTitle).toHaveText(itemName!);
    });

    test('URL updates when filters are changed', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // And I change the sort to Lowest Fat
      const sortPill = page.locator('.pill').filter({ hasText: 'Sort:' });
      await sortPill.click();

      const fatOption = page.locator('.tray-option').filter({ hasText: 'Lowest Fat' });
      await fatOption.click();

      await page.waitForTimeout(500);

      // Then the URL should contain sort=fat-asc
      const url = page.url();
      expect(url).toContain('sort=fat-asc');
    });

    test('URL updates when diet filter is applied', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // And I apply a diet filter
      const dietPill = page.locator('.pill').filter({ hasText: 'Diet:' });
      await dietPill.click();

      const veganOption = page.locator('.tray-option').filter({ hasText: 'Vegan' });
      await veganOption.click();

      await page.waitForTimeout(500);

      // Then the URL should contain diet=vegan
      const url = page.url();
      expect(url).toContain('diet=vegan');
    });
  });
});
