# AI Instructions for Menu Data Processing

This document provides instructions for AI agents to process restaurant menu documents and maintain the data structure idempotently.

## Important Data Quality Rules

1. **All data must be realistic and extracted from source documents** - Never make up or estimate nutritional values
2. **If data is not available in the source document, omit the field** - Do not guess or infer values
3. **Verify extracted values are reasonable** - Cross-check that calories align with macro totals (protein×4 + carbs×4 + fat×9 ≈ calories)
4. **Use consistent units** - All weights in grams (g), calories in kcal, salt in grams

## Directory Structure

```
/raw/{region}/{restaurant}/{document.extension}  - Original PDF/document sources
/schemas/food.json.md                            - Schema for food.json files
/data/index.json                                 - List of all regions
/data/{region}/index.json                        - List of restaurants in region
/data/{region}/{restaurant}/food.json            - Menu items per restaurant
/data/{region}/food.json                         - Merged items for entire region
/src                                             - Application source code
```

## Processing Workflow

When adding or updating restaurant menu data, follow these steps idempotently:

### 1. Check Raw Documents

Look in `/raw/{region}/{restaurant}/` for any source documents (PDFs, images, etc.) that need processing.

### 2. Extract Menu Data

Parse the source document and extract menu items. Each item should conform to the schema in `/schemas/food.json.md`:

```json
{
  "name": "string",
  "calories": "number",
  "macros": {
    "protein": "number",
    "carbohydrates": "number",
    "fat": "number",
    "fibre": "number (optional - only if in source)",
    "salt": "number (optional - only if in source)"
  },
  "ingredients": ["string"],
  "vegetarian": "boolean",
  "vegan": "boolean"
}
```

### 3. Create/Update Restaurant food.json

Create or update `/data/{region}/{restaurant}/food.json` with the format:

```json
{
  "restaurant": "Restaurant Display Name",
  "items": [
    // array of menu items conforming to schema
  ]
}
```

### 4. Update Region Index

Ensure the restaurant is listed in `/data/{region}/index.json`:

```json
{
  "restaurants": [
    {
      "id": "restaurant-id",
      "name": "Restaurant Display Name"
    }
  ]
}
```

**Note**: Keep restaurants sorted alphabetically by `id`.

### 5. Update Regional Merged food.json

Regenerate `/data/{region}/food.json` by merging all restaurant items. Each item should include the restaurant name:

```json
{
  "region": "Region Display Name",
  "items": [
    {
      "name": "Item Name",
      "restaurant": "Restaurant Display Name",
      "calories": 100,
      "macros": { ... },
      "vegetarian": true,
      "vegan": false
    }
  ]
}
```

### 6. Update Global Index (if new region)

If adding a new region, ensure it's listed in `/data/index.json`:

```json
{
  "regions": [
    {
      "id": "region-id",
      "name": "Region Display Name"
    }
  ]
}
```

## Idempotency Rules

1. **Check before creating**: Always verify if files/entries already exist before adding
2. **Preserve existing data**: When updating, merge new data with existing data
3. **Consistent ordering**: Sort arrays alphabetically to ensure consistent diffs
4. **Validate schema**: Ensure all data conforms to the food.json schema
5. **Remove duplicates**: Prevent duplicate entries when regenerating merged files

## Important: Always Update Regional Merged Data

**Whenever a restaurant's data is added, updated, or removed, you MUST regenerate the regional merged `food.json`.**

The regional merged file (`/data/{region}/food.json`) contains all items from all restaurants in that region. It must always be kept in sync with the individual restaurant data files. Failing to update this file will cause the application to show stale or incomplete data.

After any restaurant change:
1. Regenerate `/data/{region}/food.json` by merging all restaurant items
2. Sync the updated data to `/src/react-app/public/data/` so the application serves the latest data

## Common Tasks

### Adding a New Restaurant

1. Place source document in `/raw/{region}/{restaurant}/`
2. Create `/data/{region}/{restaurant}/food.json` with extracted items
3. Add restaurant to `/data/{region}/index.json`
4. Regenerate `/data/{region}/food.json` (merge all restaurant items)
5. Sync data to `/src/react-app/public/data/`

### Updating Restaurant Menu

1. Update source document in `/raw/{region}/{restaurant}/`
2. Re-extract items to `/data/{region}/{restaurant}/food.json`
3. Regenerate `/data/{region}/food.json` (merge all restaurant items)
4. Sync data to `/src/react-app/public/data/`

### Removing a Restaurant

1. Remove `/data/{region}/{restaurant}/` directory
2. Remove restaurant from `/data/{region}/index.json`
3. Regenerate `/data/{region}/food.json` (merge remaining restaurant items)
4. Sync data to `/src/react-app/public/data/`

### Adding a New Region

1. Create `/raw/{region}/` directory
2. Create `/data/{region}/` directory
3. Create `/data/{region}/index.json` with empty restaurants array
4. Create `/data/{region}/food.json` with empty items array
5. Add region to `/data/index.json`
6. Sync data to `/src/react-app/public/data/`

## Quick Reference: Current State

This section summarises the current data so agents can orient quickly without reprocessing the entire repository.

### Regions

| Region | ID | Restaurants |
|--------|----|-------------|
| United Kingdom | `uk` | caffe-nero, costa, gails, greggs, harvester, kfc, mcdonalds, nandos, pret, starbucks |

### UK Restaurant Summary

| Restaurant | ID | Items | Source PDF | Notes |
|------------|----|-------|------------|-------|
| Caffè Nero | `caffe-nero` | ~477 | `caffenero_nutrition_allergens-en_GB.pdf` | Full nutrition + allergens. Has (V)/(Vg) diet markers. Includes food and beverages. |
| Costa Coffee | `costa` | ~62 | Various in `/raw/uk/costa/` | |
| GAIL's Bakery | `gails` | ~7 | N/A (web-sourced from gails.com, FatSecret, MyNetDiary) | Calories from gails.com; macros from FatSecret/MyNetDiary where available. Per-item values. |
| Greggs | `greggs` | ~283 | Various in `/raw/uk/greggs/` | Full nutrition including fibre, salt, saturatedFat, sugar. |
| Harvester | `harvester` | ~108 | Various in `/raw/uk/harvester/` | Full nutrition including salt, saturatedFat, sugar. |
| KFC | `kfc` | ~54 | Various in `/raw/uk/kfc/` | |
| McDonald's | `mcdonalds` | ~12 | Various in `/raw/uk/mcdonalds/` | |
| Nando's | `nandos` | ~137 | `Nandos-Calories.pdf.pdf` | Sodium converted to salt (×2.5/1000). Excludes alcohol/baste items. |
| Pret A Manger | `pret` | ~32 | Various in `/raw/uk/pret/` | |
| Starbucks | `starbucks` | ~20 | Various in `/raw/uk/starbucks/` | |

### PDF Processing Tips

- **Install pdfplumber** (`pip install pdfplumber`) for PDF extraction — it handles tables and text well.
- **Caffe Nero PDFs** use a mixed layout: allergen tables on early pages, then nutrition data interleaved with ingredient text. Extract per-portion values (second column), not per-100g.
- **Nando's PDFs** use a tabular US-style format with Sodium (mg) — convert to Salt (g) via `salt_g = sodium_mg × 2.5 / 1000`. Values like `<1` should be approximated as `0.5`.
- Always use **per-portion** nutritional values, not per-100g.
- For `<X` values (e.g. `<0.1`, `<1`), use the value itself as an approximation (e.g., `0.1`, `0.5`).

### Syncing Data

After any data change, sync canonical data to the app's public directory:

```bash
rsync -av --delete data/ src/react-app/public/data/
```

### Regenerating Regional Merged food.json

Use this Python snippet to regenerate `/data/{region}/food.json` from all restaurant files:

```python
import json, os

region = "uk"
with open(f'data/{region}/index.json') as f:
    index = json.load(f)

all_items = []
for r in index['restaurants']:
    path = f'data/{region}/{r["id"]}/food.json'
    if os.path.exists(path):
        with open(path) as f:
            data = json.load(f)
        for item in data['items']:
            item['restaurant'] = r['name']
            all_items.append(item)

all_items.sort(key=lambda x: (x['name'].lower(), x['restaurant'].lower()))
with open(f'data/{region}/food.json', 'w') as f:
    json.dump({"region": "United Kingdom", "items": all_items}, f, indent=2, ensure_ascii=False)
```

## Analytics Intent Guidelines

The app uses **Firebase Analytics** (analytics-only, no auth/database) gated behind GDPR
cookie consent. When adding new features, consider what user-intent signals would be
valuable and follow these principles:

### What to Track

| Category | Example Events | Why |
|----------|---------------|-----|
| **Navigation** | `region_change`, `restaurant_filter` | Understand which regions/restaurants are popular and guide data expansion |
| **Discovery** | `sort_change`, `dietary_filter`, `calorie_filter` | Learn which filters matter most to users for feature prioritisation |
| **Engagement** | `food_item_view`, `share` | Measure how deeply users engage with individual items |
| **Consent** | `consent_response`, `disclaimer_dismissed` | Monitor opt-in rates and trust signals |

### Rules for New Events

1. **GDPR-first** – All events go through `trackEvent()` in `firebase.ts` which respects the
   user's cookie consent. Never bypass this.
2. **No PII** – Never log personally identifiable information (names, emails, IP addresses).
3. **Descriptive names** – Use `snake_case` event names that describe intent
   (e.g. `filter_applied`, `item_compared`).
4. **Keep parameters minimal** – Only include parameters that answer a specific question.
5. **Document intent** – Add a JSDoc comment on every new tracking helper in `analytics.ts`
   explaining *what question* the event answers.

### Adding a New Tracked Feature

1. Add a helper function in `src/react-app/src/analytics.ts`
2. Call it at the appropriate interaction point
3. Verify the event appears in Firebase DebugView during development
4. Update this table if a new *category* of intent is introduced
