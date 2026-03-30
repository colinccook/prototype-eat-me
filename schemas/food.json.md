# Food Item Schema

Menu items conform to this schema. The schema is designed to capture nutritional information, allergens, dietary suitability, and ingredient data available from UK restaurant nutrition PDFs.

## Schema Definition

```json
{
  "name": "string",
  "type": "\"food\" | \"drink\" | \"other\"",
  "calories": "number",
  "macros": {
    "protein": "number",
    "carbohydrates": "number",
    "fat": "number",
    "saturatedFat": "number | null (optional)",
    "sugar": "number | null (optional)",
    "fibre": "number | null (optional)",
    "salt": "number | null (optional)"
  },
  "allergens": {
    "gluten": "boolean | null (optional)",
    "wheat": "boolean | null (optional)",
    "milk": "boolean | null (optional)",
    "eggs": "boolean | null (optional)",
    "soya": "boolean | null (optional)",
    "nuts": "boolean | null (optional)",
    "peanuts": "boolean | null (optional)",
    "sesame": "boolean | null (optional)",
    "celery": "boolean | null (optional)",
    "mustard": "boolean | null (optional)",
    "fish": "boolean | null (optional)",
    "crustaceans": "boolean | null (optional)",
    "molluscs": "boolean | null (optional)",
    "sulphites": "boolean | null (optional)",
    "lupin": "boolean | null (optional)"
  },
  "ingredients": ["string"] | null (optional),
  "vegetarian": "boolean",
  "vegan": "boolean"
}
```

## Field Descriptions

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | The name of the food item |
| `type` | `"food"` \| `"drink"` \| `"other"` | The category of the item: `food` for meals and snacks, `drink` for beverages, `other` for condiments and add-ons |
| `calories` | number | Energy content in kcal |
| `macros.protein` | number | Protein content in grams |
| `macros.carbohydrates` | number | Carbohydrate content in grams |
| `macros.fat` | number | Total fat content in grams |
| `vegetarian` | boolean | Whether the item is suitable for vegetarians |
| `vegan` | boolean | Whether the item is suitable for vegans |

### Optional Macro Fields

| Field | Type | Description |
|-------|------|-------------|
| `macros.saturatedFat` | number \| null | Saturated fat content in grams |
| `macros.sugar` | number \| null | Sugar content in grams |
| `macros.fibre` | number \| null | Fibre content in grams |
| `macros.salt` | number \| null | Salt content in grams |

### Optional Allergen Fields

All allergen fields are optional and nullable. A `true` value indicates the allergen is present, `false` means it is absent, and `null` or omission means the data is unavailable.

| Field | Description |
|-------|-------------|
| `allergens.gluten` | Contains gluten (from any cereal source) |
| `allergens.wheat` | Contains wheat specifically |
| `allergens.milk` | Contains milk or dairy |
| `allergens.eggs` | Contains eggs |
| `allergens.soya` | Contains soya/soy |
| `allergens.nuts` | Contains tree nuts |
| `allergens.peanuts` | Contains peanuts |
| `allergens.sesame` | Contains sesame |
| `allergens.celery` | Contains celery |
| `allergens.mustard` | Contains mustard |
| `allergens.fish` | Contains fish |
| `allergens.crustaceans` | Contains crustaceans |
| `allergens.molluscs` | Contains molluscs |
| `allergens.sulphites` | Contains sulphur dioxide/sulphites |
| `allergens.lupin` | Contains lupin |

### Other Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `ingredients` | array of strings \| null | List of ingredients if available |

## Data Sources

The nutritional and allergen data is extracted from official restaurant nutrition and allergen PDFs located in `/raw/{region}/{restaurant}/`. Data availability varies by restaurant:

- **Complete nutrition data (calories, protein, carbs, fat, fibre, salt)**: Greggs, KFC, Starbucks, Harvester
- **Partial nutrition data**: McDonald's, Costa, Pret
- **Allergen data**: McDonald's, KFC, Costa, Starbucks (varies by detail level)

## Nullable Fields

When data is not available from the source PDFs, fields are set to `null` rather than omitted. This allows sorting and filtering logic to handle missing data appropriately (e.g., items without salt data sort to the end when sorting by salt).