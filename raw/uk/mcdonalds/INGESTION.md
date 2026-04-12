# McDonald's UK — Ingestion Guide

## Source

- **Type**: Web scraping (Playwright)
- **Base URL**: `https://www.mcdonalds.com/gb/en-gb/menu/{category}.html`
- **Mapping CSV**: `raw/uk/mapping.csv` lists 10 category URLs

## Menu Categories

Categories are sub-pages of `/menu/`: `breakfast`, `burgers`, `chicken-fish`, `wraps`, `sides`, `desserts`, `drinks`, `happy-meal`, `salads`, `mccafe`.

> **Note (April 2026)**: The URL structure changed from `/full-menu/{category}.html` to `/menu/{category}.html`. The mapping.csv may still have old URLs — use the `/menu/` prefix.

## Scraping Steps

1. Navigate to each category page.
2. Collect product links: `a[href*="/gb/en-gb/product/"]`.
3. For each product page:
   - **Name**: `h1` element text. Strip common prefixes: `Limited Time Only`, `Not available in all Restaurants`, `Here to stay`.
   - **Nutrition table**: Expand collapsed sections — click elements matching `[aria-expanded="false"]` whose text includes "nutri".
   - **Table columns**: `th` = label, `td[0]` = per 100g, `td[1]` = per portion. **Use per-portion (td[1])**.
   - Nutrition rows: Energy (kcal), Fat, Saturated Fat (as "of which Saturates"), Carbohydrate, Sugars, Fibre, Protein, Salt.
4. Deduplicate by URL (same product can appear in multiple categories).

## Type Classification

- `"drink"`: Items from `drinks` and `mccafe` categories, or names containing coffee/latte/shake/juice/water/cola keywords.
- `"food"`: Everything else.

## Diet Flags

Infer from product name — no explicit flags on the site:
- **Not vegetarian**: Names containing chicken, beef, burger, bacon, fish, sausage, mcnugget, filet.
- **Not vegan**: Above plus cheese, mayo, egg, milk, cream, mcflurry.

## Known Issues

- Many product URLs from older category scans now return 404 (products removed).
- Some products appear in multiple categories — deduplicate by URL.
- Product pages may fail to load nutrition tables (Playwright timing) — retry with longer waits.
