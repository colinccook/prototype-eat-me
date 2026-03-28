import { test, expect, type Page } from '@playwright/test';

/** Wait for the food grid to be fully loaded and visible. */
async function waitForFoodGrid(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.locator('.food-grid').waitFor({ state: 'visible' });
}

/** Touch-based swipe for mobile viewport (used by Playwright Pixel 5 config). */
async function touchSwipeCard(
  page: Page,
  direction: 'left' | 'right',
  selector = '.swipeable-card-inner'
): Promise<void> {
  const card = page.locator(selector).first();
  await card.waitFor({ state: 'visible' });
  const box = await card.boundingBox();
  if (!box) throw new Error('Card bounding box not found');

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  const distance = direction === 'left' ? -150 : 150;

  await page.touchscreen.tap(startX, startY);
  // Use dispatchEvent for touch swipe since Playwright touchscreen is limited
  await card.dispatchEvent('touchstart', {
    touches: [{ clientX: startX, clientY: startY, identifier: 0 }],
  });
  for (let i = 1; i <= 5; i++) {
    await card.dispatchEvent('touchmove', {
      touches: [{ clientX: startX + (distance * i) / 5, clientY: startY, identifier: 0 }],
    });
  }
  await card.dispatchEvent('touchend', {
    changedTouches: [{ clientX: startX + distance, clientY: startY, identifier: 0 }],
  });

  // Wait for swipe animation to complete (slightly longer than ANIMATION_DURATION_MS=300)
  await page.waitForTimeout(400);
}

/** Navigate with clean localStorage for the given keys. */
async function loadWithCleanState(page: Page, keys: string[]): Promise<void> {
  await page.goto('/');
  await page.evaluate((ks) => ks.forEach((k) => localStorage.removeItem(k)), keys);
  await page.reload();
  await waitForFoodGrid(page);
}

test.describe('Swipe Actions & Favourites', () => {
  test.describe('@navigation', () => {
    test('Bottom app bar shows Search and Favourites tabs', async ({ page }) => {
      await page.goto('/');
      await waitForFoodGrid(page);

      const bar = page.locator('.bottom-app-bar');
      await expect(bar).toBeVisible();

      // Search tab
      const searchTab = bar.locator('.bottom-app-bar__tab').filter({ hasText: 'Search' });
      await expect(searchTab).toBeVisible();
      await expect(searchTab).toHaveAttribute('aria-current', 'page');

      // Favourites tab
      const favTab = bar.locator('.bottom-app-bar__tab').filter({ hasText: 'Favourites' });
      await expect(favTab).toBeVisible();
    });

    test('Switching between Search and Favourites tabs', async ({ page }) => {
      await page.goto('/');
      await waitForFoodGrid(page);

      // Tap Favourites
      const favTab = page.locator('.bottom-app-bar__tab').filter({ hasText: 'Favourites' });
      await favTab.click();

      // Should see the favourites view (empty state text)
      const emptyState = page.locator('.food-list-status');
      await expect(emptyState).toContainText('No favourites yet');

      // Switch back to Search
      const searchTab = page.locator('.bottom-app-bar__tab').filter({ hasText: 'Search' });
      await searchTab.click();

      // Should see food grid again
      await expect(page.locator('.food-grid')).toBeVisible();
    });
  });

  test.describe('@swipe', () => {
    test.use({
      storageState: { cookies: [], origins: [] },
    });

    test('Hidden count displays and show-all works', async ({ page }) => {
      await loadWithCleanState(page, ['eatme-hidden-items', 'eatme-favourite-items']);

      // Record initial item count
      const initialCount = await page.locator('.food-card').count();
      expect(initialCount).toBeGreaterThan(0);

      // Swipe left on first card using touch events
      await touchSwipeCard(page, 'left');

      // Wait for the hidden count to appear
      await expect(page.locator('.hidden-count')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('.hidden-count')).toContainText('hidden');

      // Show all link should be visible
      const showAllLink = page.locator('.show-all-link');
      await expect(showAllLink).toBeVisible();

      // Click show all
      await showAllLink.click();

      // Hidden count should disappear
      await expect(page.locator('.hidden-count')).not.toBeVisible();

      // All items should be back
      const restoredCount = await page.locator('.food-card').count();
      expect(restoredCount).toBe(initialCount);
    });

    test('Swipe right to favourite hides item from search view', async ({ page }) => {
      await loadWithCleanState(page, ['eatme-hidden-items', 'eatme-favourite-items']);

      // Get the name of the first food item before swiping
      const firstCardName = await page.locator('.food-name').first().textContent();
      expect(firstCardName).toBeTruthy();

      // Swipe right to favourite
      await touchSwipeCard(page, 'right');

      // Wait for animation and the hidden count to appear
      await expect(page.locator('.hidden-count')).toBeVisible({ timeout: 5000 });

      // The favourited item's name should no longer appear in the visible cards
      const visibleNames = await page.locator('.food-name').allTextContents();
      expect(visibleNames).not.toContain(firstCardName);
    });
  });

  test.describe('@favourite', () => {
    test.use({
      storageState: { cookies: [], origins: [] },
    });

    test('Favourited items appear in the favourites tab', async ({ page }) => {
      await loadWithCleanState(page, ['eatme-hidden-items', 'eatme-favourite-items']);

      // Get the name of the first food item
      const firstCardName = await page.locator('.food-name').first().textContent();
      expect(firstCardName).toBeTruthy();

      // Swipe right to favourite it
      await touchSwipeCard(page, 'right');

      // Wait for the item to be hidden from search (hidden count appears)
      await expect(page.locator('.hidden-count')).toBeVisible({ timeout: 5000 });

      // Check that the badge shows 1
      const badge = page.locator('.bottom-app-bar__badge');
      await expect(badge).toBeVisible();
      await expect(badge).toHaveText('1');

      // Switch to Favourites tab
      const favTab = page.locator('.bottom-app-bar__tab').filter({ hasText: 'Favourites' });
      await favTab.click();

      // Should see the favourite item
      const favCards = page.locator('.food-card');
      await expect(favCards).toHaveCount(1);
      await expect(page.locator('.food-name').first()).toContainText(firstCardName!);
    });

    test('Swipe left on favourites view removes the favourite', async ({ page }) => {
      await loadWithCleanState(page, ['eatme-hidden-items', 'eatme-favourite-items']);

      // Favourite an item
      await touchSwipeCard(page, 'right');
      await expect(page.locator('.hidden-count')).toBeVisible({ timeout: 5000 });

      // Go to favourites tab
      const favTab = page.locator('.bottom-app-bar__tab').filter({ hasText: 'Favourites' });
      await favTab.click();

      // Should have one favourite
      await expect(page.locator('.food-card')).toHaveCount(1);

      // Swipe left to remove
      await touchSwipeCard(page, 'left');

      // Wait and check empty state
      await expect(page.locator('.food-list-status')).toContainText('No favourites yet', { timeout: 5000 });
    });

    test('Swipe right on favourites view does nothing', async ({ page }) => {
      await loadWithCleanState(page, ['eatme-hidden-items', 'eatme-favourite-items']);

      // Favourite an item
      await touchSwipeCard(page, 'right');
      await expect(page.locator('.hidden-count')).toBeVisible({ timeout: 5000 });

      // Go to favourites tab
      const favTab = page.locator('.bottom-app-bar__tab').filter({ hasText: 'Favourites' });
      await favTab.click();

      // Should have one favourite
      await expect(page.locator('.food-card')).toHaveCount(1);

      // Attempt to swipe right – should have no effect since no onSwipeRight handler
      await touchSwipeCard(page, 'right');

      // The favourite should still be there
      await expect(page.locator('.food-card')).toHaveCount(1);
    });

    test('Clear all favourites removes all favourited items', async ({ page }) => {
      await loadWithCleanState(page, ['eatme-hidden-items', 'eatme-favourite-items']);

      // Favourite an item
      await touchSwipeCard(page, 'right');
      await expect(page.locator('.hidden-count')).toBeVisible({ timeout: 5000 });

      // Go to favourites tab
      const favTab = page.locator('.bottom-app-bar__tab').filter({ hasText: 'Favourites' });
      await favTab.click();

      // Should have one favourite and a clear all button
      await expect(page.locator('.food-card')).toHaveCount(1);
      const clearAllButton = page.locator('.clear-all-button');
      await expect(clearAllButton).toBeVisible();
      await expect(clearAllButton).toHaveText('Clear all');

      // Click clear all
      await clearAllButton.click();

      // Should see empty state
      await expect(page.locator('.food-list-status')).toContainText('No favourites yet', { timeout: 5000 });
    });

    test('Show all in search view resets favourites and hidden items', async ({ page }) => {
      await loadWithCleanState(page, ['eatme-hidden-items', 'eatme-favourite-items']);

      // Record initial count
      const initialCount = await page.locator('.food-card').count();

      // Favourite an item (hides it)
      await touchSwipeCard(page, 'right');
      await expect(page.locator('.hidden-count')).toBeVisible({ timeout: 5000 });

      // Hide another item
      await touchSwipeCard(page, 'left');

      // Should show hidden count of 2
      await expect(page.locator('.hidden-count')).toContainText('2 hidden');

      // Click show all
      const showAllLink = page.locator('.show-all-link');
      await showAllLink.click();

      // Hidden count should disappear
      await expect(page.locator('.hidden-count')).not.toBeVisible();

      // All items should be back
      const restoredCount = await page.locator('.food-card').count();
      expect(restoredCount).toBe(initialCount);
    });
  });

  test.describe('@persistence', () => {
    test.use({
      storageState: { cookies: [], origins: [] },
    });

    test('Hidden items persist across page reloads', async ({ page }) => {
      await loadWithCleanState(page, ['eatme-hidden-items', 'eatme-favourite-items']);

      // Get the first item name before hiding
      const firstCardName = await page.locator('.food-name').first().textContent();

      // Hide an item
      await touchSwipeCard(page, 'left');
      await expect(page.locator('.hidden-count')).toBeVisible({ timeout: 5000 });

      // Reload
      await page.reload();
      await waitForFoodGrid(page);

      // Hidden count should still show
      await expect(page.locator('.hidden-count')).toBeVisible();

      // The hidden item should not be in the visible list
      const visibleNames = await page.locator('.food-name').allTextContents();
      expect(visibleNames).not.toContain(firstCardName);
    });

    test('Favourite items persist across page reloads', async ({ page }) => {
      await loadWithCleanState(page, ['eatme-hidden-items', 'eatme-favourite-items']);

      // Favourite an item
      await touchSwipeCard(page, 'right');
      await expect(page.locator('.hidden-count')).toBeVisible({ timeout: 5000 });

      // Reload
      await page.reload();
      await waitForFoodGrid(page);

      // Badge should show (item is still favourited)
      await expect(page.locator('.bottom-app-bar__badge')).toBeVisible();

      // Item should still be hidden from search (in favourites)
      await expect(page.locator('.hidden-count')).toBeVisible();
    });
  });

  test.describe('@progressive', () => {
    test.use({
      storageState: { cookies: [], origins: [] },
    });

    test('Items load progressively as user scrolls', async ({ page }) => {
      await loadWithCleanState(page, ['eatme-hidden-items', 'eatme-favourite-items']);

      // Count initial visible food cards (should be limited by BATCH_SIZE=6)
      const initialCount = await page.locator('.food-card').count();
      expect(initialCount).toBeLessThanOrEqual(6);
      expect(initialCount).toBeGreaterThan(0);

      // There should be a sentinel element indicating more items to load
      const sentinel = page.locator('.load-more-sentinel');
      await expect(sentinel).toBeAttached();

      // Scroll the sentinel into view to trigger IntersectionObserver
      await sentinel.scrollIntoViewIfNeeded();
      // Give IntersectionObserver time to fire and React to re-render
      await page.waitForTimeout(1000);

      // If the observer fired, the sentinel may have moved further down.
      // Keep scrolling until we see more than the initial count.
      const sentinel2 = page.locator('.load-more-sentinel');
      if (await sentinel2.isVisible()) {
        await sentinel2.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
      }

      // More items should now be visible
      const afterScrollCount = await page.locator('.food-card').count();
      expect(afterScrollCount).toBeGreaterThan(initialCount);
    });
  });
});
