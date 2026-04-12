# Wetherspoons — Ingestion Guide

## Source

- **Type**: JSON API (accessed via Playwright for auth headers)
- **Entry URL**: `https://allergens.jdwetherspoon.com/?pubId=5`
- **API Base**: `https://ca.jdw-apps.net/api/allergens/v0.1/jdw`

## API Endpoints

The allergen site makes three API calls on page load:

1. **Brand info**: `GET /api/allergens/v0.1/jdw` — metadata
2. **Categories**: `GET /api/allergens/v0.1/jdw/food-categories` — returns category ID→name mapping
3. **Food data**: `GET /api/allergens/v0.1/jdw/venues/{pubId}/food` — full menu with nutrition

> **Important**: The API requires auth headers set by the frontend. Use Playwright to load the page and intercept the API responses rather than calling the API directly (direct `curl` returns 401).

## Scraping Steps

1. Launch Playwright, register a `response` listener to capture JSON responses.
2. Navigate to `https://allergens.jdwetherspoon.com/?pubId=5` with `wait_until="networkidle"`.
3. Collect the three API responses.
4. Build a category ID→name map from the categories endpoint.
5. Process each food item from the venues food endpoint.

## Food Item Structure

Each item in the food data array has:

```json
{
  "id": 146562,
  "name": "Warm chocolate fudge cake",
  "calories": 639,
  "fat": 35,
  "saturated_fat": 15,
  "carbohydrates": 73,
  "sugar": 55,
  "fibre": 3,
  "protein": 8,
  "salt": 1,
  "category": 16361,
  "vegetarians": true,
  "vegans": false
}
```

All nutrition values are per-serving integers. Field mapping:
- `calories` → `calories`
- `fat` → `macros.fat`
- `saturated_fat` → `macros.saturatedFat`
- `carbohydrates` → `macros.carbohydrates`
- `sugar` → `macros.sugar`
- `fibre` → `macros.fibre`
- `protein` → `macros.protein`
- `salt` → `macros.salt`
- `vegetarians` → `vegetarian`
- `vegans` → `vegan`

## Type Classification

- `"drink"`: Items in the "drinks" category (ID may vary), or names containing common drink keywords.
- `"food"`: Everything else.

## Known Issues

- The `pubId` parameter controls which venue's menu is returned. `pubId=5` is used as a representative venue. Menus can vary slightly between venues.
- Category IDs are not stable across API versions — always fetch the categories endpoint and build the mapping dynamically.
- The API is behind authentication that the frontend JavaScript handles — you cannot call it directly with `curl`/`fetch`.
