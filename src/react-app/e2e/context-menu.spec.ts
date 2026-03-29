import { test, expect } from '@playwright/test';

test.describe('Food Item Context Menu', () => {
  test.describe('@context-menu', () => {
    test('Context menu trigger is visible on the detail modal', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // And I tap on a food item
      const firstFoodCard = page.locator('.food-card').first();
      await firstFoodCard.click();

      // Then I should see the detail modal
      const tray = page.locator('.tray-overlay');
      await expect(tray).toBeVisible();

      // And I should see a context menu trigger button
      const contextMenuTrigger = page.locator('.context-menu-trigger');
      await expect(contextMenuTrigger).toBeVisible();
    });

    test('Context menu opens when clicking the trigger button', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // And I tap on a food item
      const firstFoodCard = page.locator('.food-card').first();
      await firstFoodCard.click();
      const tray = page.locator('.tray-overlay');
      await expect(tray).toBeVisible();

      // And I click the context menu trigger
      const contextMenuTrigger = page.locator('.context-menu-trigger');
      await contextMenuTrigger.click();

      // Then I should see the context menu with actions
      const contextMenu = page.locator('.context-menu');
      await expect(contextMenu).toBeVisible();
    });

    test('Context menu contains a Share action', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // And I tap on a food item
      const firstFoodCard = page.locator('.food-card').first();
      await firstFoodCard.click();
      const tray = page.locator('.tray-overlay');
      await expect(tray).toBeVisible();

      // And I click the context menu trigger
      const contextMenuTrigger = page.locator('.context-menu-trigger');
      await contextMenuTrigger.click();

      // Then the context menu should contain a "Share" action
      const shareAction = page.locator('.context-menu-item').filter({ hasText: 'Share' });
      await expect(shareAction).toBeVisible();
    });

    test('Sharing from the context menu copies a link', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // And I tap on a food item
      const firstFoodCard = page.locator('.food-card').first();
      await firstFoodCard.click();
      const tray = page.locator('.tray-overlay');
      await expect(tray).toBeVisible();

      // And I click the context menu trigger
      const contextMenuTrigger = page.locator('.context-menu-trigger');
      await contextMenuTrigger.click();

      // And I click the "Share" action
      const shareAction = page.locator('.context-menu-item').filter({ hasText: 'Share' });
      await shareAction.click();

      // Then I should see a "Link copied to clipboard" toast
      const toast = page.locator('.share-toast');
      await expect(toast).toBeVisible();
      await expect(toast).toHaveText('Link copied to clipboard');
    });

    test('Context menu contains restaurant filter actions for items with a restaurant', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // And I tap on a food item from "McDonald's"
      const mcdonaldsCard = page.locator('.food-card').filter({ has: page.locator('.restaurant-tag', { hasText: "McDonald's" }) }).first();
      await mcdonaldsCard.click();
      const tray = page.locator('.tray-overlay');
      await expect(tray).toBeVisible();

      // And I click the context menu trigger
      const contextMenuTrigger = page.locator('.context-menu-trigger');
      await contextMenuTrigger.click();

      // Then the context menu should contain restaurant filter actions
      const hideAction = page.locator('.context-menu-item').filter({ hasText: "Hide all McDonald's" });
      await expect(hideAction).toBeVisible();

      const onlyShowAction = page.locator('.context-menu-item').filter({ hasText: "Only show McDonald's" });
      await expect(onlyShowAction).toBeVisible();
    });

    test('Only show restaurant filters to that restaurant', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // Record the initial item count
      const initialCountText = await page.locator('.item-count').textContent();
      const initialCount = parseInt(initialCountText!);
      expect(initialCount).toBeGreaterThan(4);

      // And I tap on a food item from "McDonald's"
      const mcdonaldsCard = page.locator('.food-card').filter({ has: page.locator('.restaurant-tag', { hasText: "McDonald's" }) }).first();
      await mcdonaldsCard.click();
      const tray = page.locator('.tray-overlay');
      await expect(tray).toBeVisible();

      // And I click the context menu trigger
      const contextMenuTrigger = page.locator('.context-menu-trigger');
      await contextMenuTrigger.click();

      // And I click the "Only show McDonald's" action
      const onlyShowAction = page.locator('.context-menu-item').filter({ hasText: "Only show McDonald's" });
      await onlyShowAction.click();

      // Then the detail modal should close
      await expect(tray).not.toBeVisible();

      // And the restaurants pill should show "McDonald's"
      const restaurantsPill = page.locator('.pill').filter({ hasText: 'Restaurants:' });
      await expect(restaurantsPill).toContainText("McDonald's");

      // And all visible food items should be from "McDonald's"
      const restaurantTags = await page.locator('.food-card .restaurant-tag').allTextContents();
      expect(restaurantTags.length).toBeGreaterThan(0);
      for (const tag of restaurantTags) {
        expect(tag).toBe("McDonald's");
      }
    });

    test('Hide all restaurant filters out that restaurant', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // And I tap on a food item from "McDonald's"
      const mcdonaldsCard = page.locator('.food-card').filter({ has: page.locator('.restaurant-tag', { hasText: "McDonald's" }) }).first();
      await mcdonaldsCard.click();
      const tray = page.locator('.tray-overlay');
      await expect(tray).toBeVisible();

      // And I click the context menu trigger
      const contextMenuTrigger = page.locator('.context-menu-trigger');
      await contextMenuTrigger.click();

      // And I click the "Hide all McDonald's" action
      const hideAction = page.locator('.context-menu-item').filter({ hasText: "Hide all McDonald's" });
      await hideAction.click();

      // Then the detail modal should close
      await expect(tray).not.toBeVisible();

      // And no visible food items should be from "McDonald's"
      const restaurantTags = await page.locator('.food-card .restaurant-tag').allTextContents();
      expect(restaurantTags.length).toBeGreaterThan(0);
      for (const tag of restaurantTags) {
        expect(tag).not.toBe("McDonald's");
      }
    });

    test('Context menu closes when clicking outside', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // And I tap on a food item
      const firstFoodCard = page.locator('.food-card').first();
      await firstFoodCard.click();
      const tray = page.locator('.tray-overlay');
      await expect(tray).toBeVisible();

      // And I click the context menu trigger
      const contextMenuTrigger = page.locator('.context-menu-trigger');
      await contextMenuTrigger.click();
      const contextMenu = page.locator('.context-menu');
      await expect(contextMenu).toBeVisible();

      // And I click outside the context menu (on the modal title)
      const modalTitle = page.locator('.modal-title');
      await modalTitle.click();

      // Then the context menu should close
      await expect(contextMenu).not.toBeVisible();
    });
  });
});
