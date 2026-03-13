Menu items conform to this schema:

```json
{
  "name": "string",
  "calories": "number",
  "macros": {
    "protein": "number",
    "carbohydrates": "number", 
    "fat": "number",
    "fibre": "number (optional)",
    "salt": "number (optional)"
  },
  "ingredients": ["string"],
  "vegetarian": "boolean",
  "vegan": "boolean"
}
```