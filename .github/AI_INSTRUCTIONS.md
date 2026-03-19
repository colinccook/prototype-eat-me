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
