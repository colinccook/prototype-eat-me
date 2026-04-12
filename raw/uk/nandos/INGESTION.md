# Nando's — Ingestion Guide

## Source

- **Type**: Web scraping (Playwright)
- **URL**: `https://www.nandos.co.uk/food/menu/`

## Site Structure

Nando's renders the full menu on a single page with all items visible in sectioned categories. Data is embedded directly in HTML — no API calls, no `__NEXT_DATA__`.

## Scraping Steps

1. Navigate with `wait_until="domcontentloaded"` and wait ~8 seconds for rendering.
2. **Dismiss the cookie banner first** — remove `#trustarc-banner-overlay` and `#consent_blackbar` elements via JS, otherwise click events will be intercepted.
3. Extract items via DOM:
   ```js
   document.querySelectorAll('button[title*="Open product"]')
   ```
4. For each button:
   - **Name**: `title` attribute, strip the "Open product description for " prefix.
   - **Calories**: Extract from button text content with regex `(\d+)\s*kcal`.
   - **Category**: Find parent `<section>`, then its `<h2>` heading.

## Nutrition Data Limitations

**Nando's only provides kcal on the menu page.** There is no detailed macronutrient breakdown (protein, fat, carbs, etc.) available on the website. No separate nutrition PDF or allergen data page exists with this data.

All macro fields (`protein`, `fat`, `carbohydrates`, `saturatedFat`, `sugar`, `fibre`, `salt`) should be set to `null`.

## Menu Categories

The Lunch Fix, Starters, PERi-PERi Chicken, Burgers Pittas Wraps, Salads & Bowls, Sharing Platters, Veggie, Nandinos (Kids), Nandino's Sides, Sides, Dips & Extras, Drinks, Desserts.

## Type Classification

- `"drink"`: Items in the "Drinks" category, or names matching common drink keywords (coca-cola, juice, water, etc.).
- `"food"`: Everything else.

## Diet Flags

- Items in the "Veggie" category: set `vegetarian: true`.
- Items with "plant" or "beanie" in name: also set `vegan: true`.
- Halloumi items: `vegetarian: true`.
- Limited inference possible — no explicit flags on the site.

## Items to Skip

- Items without kcal (e.g., "Dare to share", sharing platters with no calorie data).

## Known Issues

- The cookie consent overlay (`#trustarc-banner-overlay`) blocks all click interactions — must be removed via JS before any DOM interaction.
- `networkidle` may timeout — use `domcontentloaded` with a manual sleep.
- Category headings may change with seasonal menu updates.
