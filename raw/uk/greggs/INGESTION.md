# Greggs — Ingestion Guide

## Source

- **Type**: PDF
- **URL**: `https://a.storyblok.com/f/94904/x/7dd8489dab/nutritional-information.pdf` (from mapping.csv)
- **Tool**: `pdfplumber` (Python)

## PDF Structure

- Multi-page PDF with tabular nutrition data.
- Rows alternate between per-100g and per-portion values.
- Column layout (per-portion indices): `5`=kcal, `8`=fat, `11`=saturated fat, `14`=carbs, `17`=sugars, `20`=fibre, `22`=protein, `25`=salt.

## Extraction Steps

1. Download the PDF via `curl` (Python urllib has SSL issues with this host).
2. Parse each page with `pdfplumber.open(path).pages[i].extract_table()`.
3. Row 0 is a header info row, Row 1 is a sub-header — skip both.
4. For each data row, extract the per-portion columns at the indices above.
5. Product names may have `(HS)` suffix (Hospital Shop variant) — strip this.

## Type Classification

- `"drink"`: Names containing coffee, latte, tea, juice, smoothie, water, cola, shake, hot chocolate, mocha, or items in a "Drinks" section header.
- `"food"`: Everything else.

## Diet Flags

Infer from name:
- **Vegetarian**: No meat keywords (chicken, beef, ham, bacon, sausage, pork, steak, turkey, tuna, prawn).
- **Vegan**: Vegetarian AND no dairy keywords (cheese, cream, egg, butter, milk, mayo, yoghurt).

## Items to Skip

- Water bottles (no meaningful nutrition)
- Branded crisps (not Greggs-made products)

## Known Issues

- Column indices may shift if Greggs updates the PDF layout — verify header row matches expected structure.
- `(HS)` suffixes create near-duplicates — strip and deduplicate by name.
