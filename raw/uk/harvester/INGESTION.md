# Harvester — Ingestion Guide

## Source

- **Type**: PDF
- **URL**: `https://www.harvester.co.uk/content/dam/harvester/pdf/nutrition/nutrition-main.pdf` (from mapping.csv)
- **Tool**: `pdfplumber` (Python)

## PDF Structure

- 4 pages, organised by category sections (Steaks, Grills, Fish & Vegetarian, etc.).
- Category headers appear as table rows where the second cell contains "Energy".
- Columns: Name, kJ, kcal, Fat, Saturated Fat, Carbs, Sugars, Protein, Salt.
- **No fibre column** — set fibre to `null`.

## Extraction Steps

1. Download the PDF via `curl`.
2. Parse each page with `pdfplumber`.
3. Detect category headers: rows where cell[1] contains "Energy".
4. Track the current category from the text in cell[0] of header rows.
5. For data rows: cell[0]=name, cell[2]=kcal, cell[3]=fat, cell[4]=saturated fat, cell[5]=carbs, cell[6]=sugars, cell[7]=protein, cell[8]=salt.

## Type Classification

- All items are `"food"` (Harvester doesn't list drinks in their nutrition PDF).

## Diet Flags

- Product names with `(V)` suffix = vegetarian.
- Product names with `(Ve)` suffix = vegan.
- Strip these suffixes from the final name.

## Known Issues

- The PDF layout changes periodically — column order may shift.
- Some items span multiple rows (e.g., long names) — join with the next row if kcal is missing.
