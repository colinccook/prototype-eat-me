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

  test.describe('@long-press-context-menu', () => {
    test.use({
      storageState: { cookies: [], origins: [] },
    });

    /** Simulate a long press via touch events (hold for > 500ms). */
    async function longPressCard(
      page: import('@playwright/test').Page,
      selector = '.swipeable-card-inner'
    ): Promise<void> {
      const card = page.locator(selector).first();
      await card.waitFor({ state: 'visible' });
      const box = await card.boundingBox();
      if (!box) throw new Error('Card bounding box not found');

      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;

      await card.dispatchEvent('touchstart', {
        touches: [{ clientX: x, clientY: y, identifier: 0 }],
      });
      // Wait longer than LONG_PRESS_DURATION_MS (500ms)
      await page.waitForTimeout(600);
      await card.dispatchEvent('touchend', {
        changedTouches: [{ clientX: x, clientY: y, identifier: 0 }],
      });
    }

    /** Navigate with clean localStorage for the given keys. */
    async function loadWithCleanState(page: import('@playwright/test').Page, keys: string[]): Promise<void> {
      await page.goto('/');
      await page.evaluate((ks) => ks.forEach((k) => localStorage.removeItem(k)), keys);
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.locator('.food-grid').waitFor({ state: 'visible' });
    }

    test('Long pressing a food item opens a context menu', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // And I long press on a food item
      await longPressCard(page);

      // Then I should see a long press context menu
      const longPressMenu = page.locator('.long-press-menu');
      await expect(longPressMenu).toBeVisible();

      // And it should show the item name
      const menuTitle = page.locator('.long-press-menu-title');
      await expect(menuTitle).toBeVisible();
      const titleText = await menuTitle.textContent();
      expect(titleText!.length).toBeGreaterThan(0);

      // And it should contain Share, Favourite, and Hide actions
      const shareAction = longPressMenu.locator('.context-menu-item').filter({ hasText: 'Share' });
      await expect(shareAction).toBeVisible();

      const favouriteAction = longPressMenu.locator('.context-menu-item').filter({ hasText: 'Favourite' });
      await expect(favouriteAction).toBeVisible();

      const hideAction = longPressMenu.locator('.context-menu-item').filter({ hasText: /^Hide$/ });
      await expect(hideAction).toBeVisible();
    });

    test('Long press context menu contains restaurant filter actions', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // And I long press on a food item from "McDonald's"
      const mcdonaldsCard = page.locator('.swipeable-card-inner').filter({
        has: page.locator('.restaurant-tag', { hasText: "McDonald's" }),
      }).first();
      await mcdonaldsCard.waitFor({ state: 'visible' });
      const box = await mcdonaldsCard.boundingBox();
      if (!box) throw new Error('Card bounding box not found');
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;

      await mcdonaldsCard.dispatchEvent('touchstart', {
        touches: [{ clientX: x, clientY: y, identifier: 0 }],
      });
      await page.waitForTimeout(600);
      await mcdonaldsCard.dispatchEvent('touchend', {
        changedTouches: [{ clientX: x, clientY: y, identifier: 0 }],
      });

      // Then the long press context menu should contain restaurant filter actions
      const longPressMenu = page.locator('.long-press-menu');
      await expect(longPressMenu).toBeVisible();

      const hideAction = longPressMenu.locator('.context-menu-item').filter({ hasText: "Hide all McDonald's" });
      await expect(hideAction).toBeVisible();

      const onlyShowAction = longPressMenu.locator('.context-menu-item').filter({ hasText: "Only show McDonald's" });
      await expect(onlyShowAction).toBeVisible();
    });

    test('Long press context menu closes when tapping outside', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // And I long press on a food item
      await longPressCard(page);

      // Then the long press context menu should be visible
      const longPressMenu = page.locator('.long-press-menu');
      await expect(longPressMenu).toBeVisible();

      // When I click outside the context menu (on the overlay)
      const overlay = page.locator('.long-press-overlay');
      await overlay.click({ position: { x: 10, y: 10 } });

      // Then the long press context menu should close
      await expect(longPressMenu).not.toBeVisible();
    });

    test('Long press context menu closes when pressing Escape', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // And I long press on a food item
      await longPressCard(page);

      // Then the long press context menu should be visible
      const longPressMenu = page.locator('.long-press-menu');
      await expect(longPressMenu).toBeVisible();

      // When I press Escape
      await page.keyboard.press('Escape');

      // Then the long press context menu should close
      await expect(longPressMenu).not.toBeVisible();
    });
    test('Sharing from the long press context menu copies a link', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // And I long press on a food item
      await longPressCard(page);

      // Then the long press context menu should be visible
      const longPressMenu = page.locator('.long-press-menu');
      await expect(longPressMenu).toBeVisible();

      // When I click the "Share" action
      const shareAction = longPressMenu.locator('.context-menu-item').filter({ hasText: 'Share' });
      await shareAction.click();

      // Then I should see a "Link copied to clipboard" toast
      const toast = page.locator('.share-toast');
      await expect(toast).toBeVisible();
      await expect(toast).toHaveText('Link copied to clipboard');
    });

    test('Right clicking a food item opens the context menu', async ({ page }) => {
      // Given I navigate to the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // When food items have loaded
      const foodGrid = page.locator('.food-grid');
      await foodGrid.waitFor({ state: 'visible' });

      // And I right click on a food item
      const firstCard = page.locator('.food-card').first();
      await firstCard.click({ button: 'right' });

      // Then I should see a long press context menu
      const longPressMenu = page.locator('.long-press-menu');
      await expect(longPressMenu).toBeVisible();

      // And it should contain a "Share" action
      const shareAction = longPressMenu.locator('.context-menu-item').filter({ hasText: 'Share' });
      await expect(shareAction).toBeVisible();
    });

    test('Hide from the long press context menu hides the item', async ({ page }) => {
      await loadWithCleanState(page, ['eatme-hidden-items', 'eatme-favourite-items']);

      // Get the name of the first food item
      const firstCardName = await page.locator('.food-name').first().textContent();
      expect(firstCardName).toBeTruthy();

      // Long press on the first food item
      await longPressCard(page);

      // Click the "Hide" action
      const longPressMenu = page.locator('.long-press-menu');
      await expect(longPressMenu).toBeVisible();
      const hideAction = longPressMenu.locator('.context-menu-item').filter({ hasText: /^Hide$/ });
      await hideAction.click();

      // The menu should close
      await expect(longPressMenu).not.toBeVisible();

      // The item should disappear from the list
      await expect(page.locator('.hidden-count')).toBeVisible({ timeout: 5000 });
      const visibleNames = await page.locator('.food-name').allTextContents();
      expect(visibleNames).not.toContain(firstCardName);
    });

    test('Favourite from the long press context menu favourites the item', async ({ page }) => {
      await loadWithCleanState(page, ['eatme-hidden-items', 'eatme-favourite-items']);

      // Get the name of the first food item
      const firstCardName = await page.locator('.food-name').first().textContent();
      expect(firstCardName).toBeTruthy();

      // Long press on the first food item
      await longPressCard(page);

      // Click the "Favourite" action
      const longPressMenu = page.locator('.long-press-menu');
      await expect(longPressMenu).toBeVisible();
      const favouriteAction = longPressMenu.locator('.context-menu-item').filter({ hasText: 'Favourite' });
      await favouriteAction.click();

      // The menu should close
      await expect(longPressMenu).not.toBeVisible();

      // The item should disappear from the search list (favourited items are hidden from search)
      await expect(page.locator('.hidden-count')).toBeVisible({ timeout: 5000 });
      const visibleNames = await page.locator('.food-name').allTextContents();
      expect(visibleNames).not.toContain(firstCardName);
    });
  });
});
