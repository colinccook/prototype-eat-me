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

    test('Swipe right to favourite an item adds heart indicator', async ({ page }) => {
      await loadWithCleanState(page, ['eatme-hidden-items', 'eatme-favourite-items']);

      // Swipe right
      await touchSwipeCard(page, 'right');

      // The card should remain and show favourite indicator
      await expect(page.locator('.favourite-indicator').first()).toBeVisible({ timeout: 5000 });

      // Verify the favourited card is still visible
      await expect(page.locator('.food-card').first()).toBeVisible();
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

      // Wait for favourite indicator
      await expect(page.locator('.favourite-indicator').first()).toBeVisible({ timeout: 5000 });

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
      await expect(page.locator('.food-name').first()).toContainText(firstCardName!.replace('❤️ ', ''));
    });

    test('Swipe left on favourites view removes the favourite', async ({ page }) => {
      await loadWithCleanState(page, ['eatme-hidden-items', 'eatme-favourite-items']);

      // Favourite an item
      await touchSwipeCard(page, 'right');
      await expect(page.locator('.favourite-indicator').first()).toBeVisible({ timeout: 5000 });

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
  });

  test.describe('@persistence', () => {
    test.use({
      storageState: { cookies: [], origins: [] },
    });

    test('Hidden items persist across page reloads', async ({ page }) => {
      await loadWithCleanState(page, ['eatme-hidden-items', 'eatme-favourite-items']);

      const initialCount = await page.locator('.food-card').count();

      // Hide an item
      await touchSwipeCard(page, 'left');
      await expect(page.locator('.hidden-count')).toBeVisible({ timeout: 5000 });

      // Reload
      await page.reload();
      await waitForFoodGrid(page);

      // Hidden count should still show
      await expect(page.locator('.hidden-count')).toBeVisible();
      const afterReloadCount = await page.locator('.food-card').count();
      expect(afterReloadCount).toBeLessThan(initialCount);
    });

    test('Favourite items persist across page reloads', async ({ page }) => {
      await loadWithCleanState(page, ['eatme-hidden-items', 'eatme-favourite-items']);

      // Favourite an item
      await touchSwipeCard(page, 'right');
      await expect(page.locator('.favourite-indicator').first()).toBeVisible({ timeout: 5000 });

      // Reload
      await page.reload();
      await waitForFoodGrid(page);

      // Favourite indicator should still be visible
      await expect(page.locator('.favourite-indicator').first()).toBeVisible();

      // Badge should show
      await expect(page.locator('.bottom-app-bar__badge')).toBeVisible();
    });
  });
});
