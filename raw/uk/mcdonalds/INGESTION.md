# McDonald's UK — Ingestion Guide

Source: **mcdonalds.com** (live website)

## Menu Category URLs

Start by visiting each menu category page to discover product URLs:

| Category | URL |
|----------|-----|
| Breakfast | https://www.mcdonalds.com/gb/en-gb/menu/breakfast.html |
| Burgers | https://www.mcdonalds.com/gb/en-gb/menu/burgers.html |
| Chicken & Fish | https://www.mcdonalds.com/gb/en-gb/menu/chicken-fish.html |
| Wraps | https://www.mcdonalds.com/gb/en-gb/menu/wraps.html |
| Sides | https://www.mcdonalds.com/gb/en-gb/menu/sides.html |
| Desserts | https://www.mcdonalds.com/gb/en-gb/menu/desserts.html |
| Drinks | https://www.mcdonalds.com/gb/en-gb/menu/drinks.html |
| Happy Meal | https://www.mcdonalds.com/gb/en-gb/menu/happy-meal.html |
| Salads | https://www.mcdonalds.com/gb/en-gb/menu/salads.html |
| McCafé | https://www.mcdonalds.com/gb/en-gb/menu/mccafe.html |

## Discovering Product URLs

On each category page, product links appear as `<a>` elements with `href` matching:

```
/gb/en-gb/product/*.html
```

Use Playwright to collect all unique product URLs:

```js
const links = await page.$$eval('a[href*="/gb/en-gb/product/"]', els =>
  [...new Set(els.map(a => a.getAttribute('href')))]
);
const productUrls = links.map(h => `https://www.mcdonalds.com${h}`);
```

## Extracting Nutrition from Product Pages

Each product page has a **"Nutrition Summary"** section. It may be collapsed — check the `aria-expanded` attribute on the toggle button and click it if needed before reading the table.

### Nutrition Table Column Mapping

The nutrition table has **three value columns** per nutrient row:

| Column index | Meaning |
|---|---|
| `cells[0]` | Per 100g — **do NOT use** |
| `cells[1]` | **Per portion — USE THIS** |
| `cells[2]` | % Reference Intake — ignore |

Always read `cells[1]`. Reading `cells[0]` (per-100g) is a common mistake that produces wrong values.

### Playwright Extraction Pattern

```js
const rows = await page.$$('table.nutrition-table tr');
for (const row of rows) {
  const label = await row.$eval('th', el => el.textContent.trim()).catch(() => null);
  const cells = await row.$$eval('td', els => els.map(el => el.textContent.trim()));
  // cells[1] is per-portion
}
```

### Field Mapping

| Nutrition label on page | food.json field |
|------------------------|-----------------|
| Energy (kcal) | `calories` |
| Protein (g) | `macros.protein` |
| Carbohydrate (g) | `macros.carbs` |
| Fat (g) | `macros.fat` |
| of which Saturates (g) | `macros.saturatedFat` |
| Sugars (g) | `macros.sugar` |
| Fibre (g) | `macros.fibre` |
| Salt (g) | `macros.salt` |

All values should be stored as numbers (parse with `parseFloat`). If a field is not present on the page, omit it (don't set to `null`).

## Product Name Cleanup

- Remove prefixes: `"Limited Time Only "`, `"Not available in all Restaurants "` (followed by a space).
- Trim whitespace from both ends.
- Preserve case as shown on the site (e.g. "McFlurry®", "Filet-O-Fish®").

## Diet Flag Inference

The product page **does not display diet badges** reliably. Infer flags from the product description text:

- **Vegetarian**: No meat or fish mentioned in the description. Look for keywords like `beef`, `chicken`, `bacon`, `sausage`, `pork`, `fish`, `turkey`, `ham`, `pepperoni`.
- **Vegan**: Vegetarian AND no dairy/egg mentioned (`cheese`, `egg`, `cream`, `milk`, `butter`, `mayo`, `mayonnaise`).
- When in doubt, **do not** set the flag. A false negative is safer than a false positive.

> ⚠️ **Watch out**: "Breakfast Wrap" doesn't sound like it contains meat, but its description mentions pork sausage and bacon. Always read the full description.

## Cross-Check Validation

After extracting all items, verify the energy calculation:

```
protein × 4 + carbs × 4 + fat × 9 ≈ calories (within ±15%)
```

If an item fails this check, re-inspect the product page — you may have read the wrong column.

## food.json Item Structure

```json
{
  "name": "Egg McMuffin",
  "url": "https://www.mcdonalds.com/gb/en-gb/product/egg-mcmuffin.html",
  "ingestionDate": "2025-04-07",
  "calories": 310,
  "macros": {
    "protein": 19,
    "carbs": 32,
    "fat": 12,
    "saturatedFat": 4.8,
    "sugar": 3.4,
    "fibre": 1.7,
    "salt": 1.3
  },
  "vegetarian": true,
  "vegan": false
}
```

Set `ingestionDate` to the local `YYYY-MM-DD` date when you run the ingestion. Set `url` to the product page URL.

## Sync & Data Flow

After updating `data/uk/mcdonalds/food.json`:

```bash
# Sync only the restaurant file (not the small BDD regional file)
mkdir -p src/react-app/public/data/uk/mcdonalds
cp data/uk/mcdonalds/food.json src/react-app/public/data/uk/mcdonalds/food.json
```

**Do NOT run `npm run merge-food-data` locally.** The CI pipeline runs it at build time to produce the full merged `src/react-app/public/data/uk/food.json` from all restaurants. Running it locally would overwrite the small 16-item BDD test file committed at that path.
