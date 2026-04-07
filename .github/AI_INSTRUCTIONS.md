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
/scripts/merge-food-data.mjs                     - Merges restaurant data into regional food.json
/data/index.json                                 - List of all regions
/data/{region}/index.json                        - List of restaurants in region
/data/{region}/{restaurant}/food.json            - Menu items per restaurant
/src/react-app/public/data/{region}/food.json    - Small regional food.json for local dev/BDD tests
/src                                             - Application source code
```

> **Note:** The regional merged `food.json` (`/data/{region}/food.json`) is no longer committed
> to the repository. It is automatically generated at build time by `scripts/merge-food-data.mjs`
> and written to `src/react-app/public/data/{region}/food.json` (overwriting the small
> committed version). See [Build-Time Data Merging](#build-time-data-merging) for details.

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

Each item may include optional `url`, `ingestionDate`, and `archiveDate` fields.

- If the source material or restaurant site provides a stable product or menu page URL for the item, record it in `url`.
- Set `ingestionDate` to your current local date whenever you create a new item or materially refresh an item's extracted data from source documents.
- If you omit it, the merge step will backfill today's local date automatically when generating merged regional data.
- If an item existed previously but is no longer present in the latest source documents, do not delete it from the restaurant `food.json`; instead set `archiveDate` to your current local date so the record remains historically traceable while being excluded from merged active data.

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

### 5. Verify Merge Script

The regional merged `food.json` is now generated automatically at build time by `scripts/merge-food-data.mjs`. You no longer need to manually regenerate it. To verify locally:

```bash
cd src/react-app
npm run merge-food-data
```

This reads all restaurant `food.json` files and writes the merged output to `src/react-app/public/data/{region}/food.json`.

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
6. **Stamp ingestion date**: Set `ingestionDate` to the local `YYYY-MM-DD` date for newly ingested or refreshed items; if missed, the merge step will apply today's date
7. **Archive removals**: When an item disappears from the latest source data, set `archiveDate` to today's local `YYYY-MM-DD` date instead of deleting the historical record

## Build-Time Data Merging

The regional merged `food.json` is **automatically generated** at build time by `scripts/merge-food-data.mjs`. The CI pipeline runs this before building the React app, so the deployed application always has the full merged data from all restaurants.

**You do NOT need to manually regenerate the merged file.** Simply update the individual restaurant `food.json` and the merge script handles the rest during CI.

A small committed version of `src/react-app/public/data/{region}/food.json` exists for local development and BDD testing. It contains a representative subset of items covering all test scenarios (see [Maintaining the Small food.json for BDD Tests](#maintaining-the-small-foodjson-for-bdd-tests)).

After any restaurant change:
1. Update the individual restaurant's `food.json` under `data/{region}/{restaurant}/`
2. Sync non-merged data to `/src/react-app/public/data/` (restaurant files, index files)
3. The CI pipeline will auto-merge all restaurant data at build time

## Common Tasks

### Adding a New Restaurant

1. Place source document in `/raw/{region}/{restaurant}/`
2. Create `/data/{region}/{restaurant}/food.json` with extracted items
3. Add restaurant to `/data/{region}/index.json`
4. Sync data to `/src/react-app/public/data/` (restaurant files and index)
5. The CI pipeline will auto-merge all restaurant data at build time

### Updating Restaurant Menu

1. Update source document in `/raw/{region}/{restaurant}/`
2. Re-extract items to `/data/{region}/{restaurant}/food.json`
3. For any previously known item missing from the latest source, keep the record and set `archiveDate` to today's local date instead of removing it
4. Sync updated restaurant data to `/src/react-app/public/data/`
5. The CI pipeline will auto-merge all restaurant data at build time

### Removing a Restaurant

1. Remove `/data/{region}/{restaurant}/` directory
2. Remove restaurant from `/data/{region}/index.json`
3. Sync changes to `/src/react-app/public/data/`
4. The CI pipeline will auto-merge remaining restaurant data at build time

### Adding a New Region

1. Create `/raw/{region}/` directory
2. Create `/data/{region}/` directory
3. Create `/data/{region}/index.json` with empty restaurants array
4. Add region to `/data/index.json`
5. Create `/src/react-app/public/data/{region}/` directory with a small `food.json` for local dev
6. Sync index data to `/src/react-app/public/data/`
7. The CI pipeline will auto-merge restaurant data at build time

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
| McDonald's | `mcdonalds` | ~32 | Web (mcdonalds.com) + PDFs in `/raw/uk/mcdonalds/` | Live web source — see `raw/uk/mcdonalds/INGESTION.md` for scraping guide. |
| Nando's | `nandos` | ~137 | `Nandos-Calories.pdf.pdf` | Sodium converted to salt (×2.5/1000). Excludes alcohol/baste items. |
| Pret A Manger | `pret` | ~32 | Various in `/raw/uk/pret/` | |
| Starbucks | `starbucks` | ~20 | Various in `/raw/uk/starbucks/` | |

### PDF Processing Tips

- **Install pdfplumber** (`pip install pdfplumber`) for PDF extraction — it handles tables and text well.
- **Caffe Nero PDFs** use a mixed layout: allergen tables on early pages, then nutrition data interleaved with ingredient text. Extract per-portion values (second column), not per-100g.
- **Nando's PDFs** use a tabular US-style format with Sodium (mg) — convert to Salt (g) via `salt_g = sodium_mg × 2.5 / 1000`. Values like `<1` should be approximated as `0.5`.
- Always use **per-portion** nutritional values, not per-100g.
- For `<X` values (e.g. `<0.1`, `<1`), use the value itself as an approximation (e.g., `0.1`, `0.5`).

### Web Scraping Tips (Live Websites)

- **Always check for a restaurant-specific INGESTION.md** in `raw/{region}/{restaurant}/` before scraping — it documents site structure, DOM selectors, and known pitfalls.
- **Cross-check extracted calories** using `protein×4 + carbs×4 + fat×9 ≈ calories (±15%)`. If an item fails this check, re-inspect the page — you likely read the wrong column.
- **Multiple nutrition columns are common**: e.g. McDonald's pages show per-100g, per-portion, and %RI side by side. Always confirm which column index maps to per-portion values.
- **Diet flags are not always displayed**: Check the product description text for meat/dairy/egg keywords to infer vegetarian/vegan status. A false negative is safer than a false positive.
- **Product names may have prefixes**: Strip prefixes like `"Limited Time Only "` or `"Not available in all Restaurants "` before storing.
- **Collapsed sections**: Nutrition summaries may be behind an expandable toggle — check `aria-expanded` and click if needed before reading the table.
- Use `raw/{region}/mapping.csv` to track which menu category URLs to scrape for each restaurant.

### Data Sync (After Ingestion)

After updating `data/{region}/{restaurant}/food.json`, sync the restaurant file to the app's public directory:

```bash
mkdir -p src/react-app/public/data/{region}/{restaurant}
cp data/{region}/{restaurant}/food.json src/react-app/public/data/{region}/{restaurant}/food.json
```

**Do NOT run `npm run merge-food-data` locally.** The CI pipeline runs it at build time. Running it locally overwrites the small 16-item BDD test file at `src/react-app/public/data/{region}/food.json` — this file must remain intact for local tests to pass.

### Maintaining the Small food.json for BDD Tests

A small representative `food.json` is committed at `src/react-app/public/data/{region}/food.json`
for local development and BDD testing. This file contains a curated subset of items that covers
all test scenarios. **When adding a new BDD test that requires specific food data characteristics
(e.g. a new allergen type, a new dietary flag, or a specific nutritional range), you MUST add
appropriate items to this small `food.json` to ensure the test passes locally and in CI
before the merge step runs.**

The small `food.json` must always satisfy these requirements:

- Items from **multiple restaurants** (including McDonald's — referenced in sharing tests)
- At least 1 **vegetarian** item and 1 **non-vegetarian** item
- At least 1 **vegan** item
- Items **≤300 calories** and items **>300 calories**
- Items **with** and **without** salt data (for "items without salt at end" sort tests)
- Items **with** and **without** fibre data (for "items without fibre at end" sort tests)
- At least 1 item **with allergen data** (for allergen display tests)
- Items with **saturated fat** and **sugar** data (for detail modal tests)

## BDD Testing Guidelines

This project uses a **hybrid BDD approach**: user-facing behaviour is described in Gherkin
`.feature` files under `src/react-app/e2e/features/`, and each scenario is implemented as a
Playwright test in the corresponding `.spec.ts` file under `src/react-app/e2e/`.

### When to Write BDD Scenarios

When making any user-facing change you **must** consider whether BDD scenarios are
appropriate. Apply this checklist:

1. **Does the change alter observable behaviour?** (new feature, changed interaction,
   different persistence rule) → **Add or update `.feature` scenarios.**
2. **Is it a pure refactor with no behaviour change?** → BDD scenarios are not needed, but
   verify existing scenarios still pass.
3. **Is it a data-only change (new restaurant, updated menu)?** → BDD scenarios are not
   needed.

State your decision explicitly when proposing changes, e.g.:
> *"BDD scenarios updated — added a new scenario for daily disclaimer reset."*
> *"No BDD changes needed — this is a CSS-only refactor with no behaviour change."*

### Writing a New Scenario

1. Add the Gherkin scenario to the appropriate `.feature` file (or create a new one).
2. Implement the matching Playwright test in the `.spec.ts` file, using BDD-style comments
   (`// Given`, `// When`, `// Then`) to map steps.
3. Keep feature files and spec files in sync — every scenario in the feature file must have
   a corresponding test, and vice-versa.

### Running BDD / E2E Tests

```bash
cd src/react-app
npm run test:e2e          # headless
npm run test:e2e:ui       # interactive UI mode
```

## Analytics Intent Guidelines

The app uses **Firebase Analytics** (analytics-only, no auth/database) gated behind GDPR
cookie consent. **When adding any user-facing feature or interaction, you MUST always
consider whether Google Analytics events are appropriate.** If the change introduces a new
user action (button click, gesture, navigation, etc.), add a tracking event. State your
decision explicitly, e.g.:
> *"Added `context_menu_open` and `favourite_item` analytics events for the new context menu."*
> *"No analytics changes needed — this is a styling-only change with no new interactions."*

### What to Track

| Category | Example Events | Why |
|----------|---------------|-----|
| **Navigation** | `region_change`, `restaurant_filter` | Understand which regions/restaurants are popular and guide data expansion |
| **Discovery** | `sort_change`, `dietary_filter`, `calorie_filter` | Learn which filters matter most to users for feature prioritisation |
| **Engagement** | `food_item_view`, `share`, `context_menu_open`, `favourite_item`, `hide_item` | Measure how deeply users engage with individual items and which actions they take |
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

## Component Documentation Guidelines

Component documentation lives in `docs/components.md`. It must be kept in sync with the
codebase whenever components are added, removed, or significantly changed.

### When to Update `docs/components.md`

Apply this checklist for any change under `src/react-app/src/components/` or
`src/react-app/src/perspectives/`:

1. **Adding a new component** → Add a full section to `docs/components.md` including:
   - Component name, file path, and purpose
   - Props table (name, type, description)
   - Internal state table (if any `useState` / class state)
   - Key behaviours and interactions
   - Update the [Component Hierarchy](docs/components.md#component-hierarchy) tree to show where it fits
   - Update the [Table of Contents](docs/components.md#table-of-contents)
2. **Removing a component** → Remove its section from the docs and update the hierarchy tree.
3. **Changing a component's props or behaviour** → Update the relevant props table,
   state table, or behaviour description.
4. **Adding a new perspective** → Add a row to the perspectives table in the
   [Perspectives System](#perspectives-system) section.
5. **Pure CSS / styling refactor with no API change** → No docs update needed.

State your decision explicitly when proposing changes, e.g.:
> *"Updated docs/components.md — added section for new FilterChip component."*
> *"No docs update needed — this is an internal refactor with no prop or behaviour change."*

### Documentation Structure

The document is organised top-down by role:

1. **Layout & Navigation** — App, HeaderPills, BottomAppBar
2. **Food Display** — FoodList, FoodCard, FoodDetailModal, FavouritesList
3. **Interactive Primitives** — SwipeableCard, Pill, Tray
4. **Notice Cards** — CookieConsentCard, DisclaimerCard
5. **Utility Components** — SkeletonCard, ErrorBoundary
6. **Perspectives System** — Nutrition insight perspectives

Place new components in the category that best matches their role. If a new category
is needed, add it in a logical position and update the table of contents.

### Screenshots

Screenshots are stored in `docs/screenshots/`. If a new component introduces a
significant visual change, add a screenshot and reference it from the component's section
using a relative path: `![Alt text](screenshots/filename.png)`.

### Ingestion process

Can you read `raw/mapping.csv`. This is a CSV list of places to read nutritional information from. It consists of region, restaurant, and a url to inspect.

When asked to to run the 'ingestion process', can you go to each url specified, retrieve information as defined in `schemas/food.json.md`, and then update the results in `/data/{region}/{restaurant}/food.json`.

Do not hallucinate any information from the website. The websites may be javascript heavy. Do your best to navigate them with Playwright, browse and extract the information. Browse and extract all the menu items you find connected to that URL.

