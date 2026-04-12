# Pret A Manger — Ingestion Guide

## Source

- **Type**: Web scraping (Playwright required — data loads client-side)
- **Base URL**: `https://www.pret.co.uk/en-GB/products`
- **Data location**: Next.js `__NEXT_DATA__` script tag on each subcategory page

## Site Structure

Pret uses Next.js. The main `/products` page SSR only includes ~19 hot drinks. All other subcategories require navigating to their specific page to populate `__NEXT_DATA__`.

### Subcategory URL Pattern

```
https://www.pret.co.uk/en-GB/products/categories/{category-slug}/{subcategory-slug}
```

### Categories and Subcategories

- **Hot drinks**: coffee, tea-and-other-hot-drinks
- **Hot food**: porridge, hot-food-boxes, soup-and-breads, toasted-sandwiches-wraps-and-baguettes, hot-pastries, breakfast-rolls, hot-pots
- **Breakfast**: breakfast-porridge, breakfast-pastries, breakfast-baguettes, breakfast-rolls, birchers-and-yoghurt-bowls, breakfast-protein-pot
- **Sandwiches**: sandwiches, baguettes, rye-rolls, wraps-and-flatbreads, toasted-sandwiches-baguettes-and-wraps
- **Cold drinks**: iced-favourites, iced-coffee, juices-and-smoothies, water-and-soft-drinks
- **Salads**: super-plates, salads, protein-pots
- **Snacks**: crisps-and-popcorn, pastries, bars-and-bites, nuts-and-dried-fruit-snacks, yoghurt-bowls-and-birchers, dessert-pots, cookies-and-cakes
- **Fruit**: fresh-fruit, fruit-pots
- **Pret at Home**: coffee-at-home

## Scraping Steps

1. Launch Playwright (headless Chromium).
2. For each subcategory URL:
   - Navigate with `wait_until="networkidle"`.
   - Extract `window.__NEXT_DATA__` via `page.evaluate()`.
   - Iterate `categories[*].subcategories[*].products[]`.
3. Deduplicate by `sku` (same product can appear in overlapping categories).

## Product Data Structure

Each product in `__NEXT_DATA__` has:
- `name`: Product name
- `sku`: Unique identifier (use for deduplication)
- `suitableForVegetarians`: boolean
- `suitableForVegans`: boolean
- `productType.key`: `"barista_beverage"` or `"food"`
- `isBottledDrink`: boolean
- `nutritionals`: Array of rows, each row is an array of `{name, value}` objects:
  - `nutrient`: Label (e.g., "Energy (Kcal)", "Fat (g)")
  - `per100g`: Per 100g value
  - `perServing`: Per serving value — **use this**

### Nutrition Row Labels

Energy (KJ), Energy (Kcal), Fat (g), of which saturates (g), Carbohydrates (g), of which sugars (g), Fibre (g), Protein (g), Salt (g)

## Type Classification

- `"drink"`: `productType.key == "barista_beverage"` OR `isBottledDrink == true` OR category contains "drink", "coffee", "tea", "juice", "smoothie", "water".
- `"food"`: Everything else.

## Known Issues

- The main `/products` page only SSR-loads ~19 products (hot drinks). You must visit each subcategory page individually.
- Some subcategories like "Breakfast porridge" overlap with "Hot food > Porridge" — deduplicate by SKU.
- 2 products out of ~207 may lack nutrition data — skip those.
- The Next.js `buildId` changes on deployments — do not hardcode it.
