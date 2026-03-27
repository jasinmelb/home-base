# Home Base Meal Plan Data

This directory contains the weekly meal plan data consumed by the Home Base app.

## Files

- `current-week.json` — The active meal plan displayed in the app
- `schema.json` — JSON Schema describing the expected format

## How Tubby Updates the Meal Plan

Tubby (AI nutritionist agent) generates a new meal plan each week by writing to `current-week.json`:

```bash
cat > /Users/kevin/Projects/home-base/public/data/current-week.json << 'EOF'
{ ... new week data ... }
EOF
```

Since this file lives in `public/`, the app picks it up immediately — no rebuild needed.

## Schema Overview

The JSON file must contain:

### Top-level fields

| Field | Type | Description |
|-------|------|-------------|
| `metadata` | object | Generation metadata (see below) |
| `week` | integer | ISO week number |
| `year` | integer | Year |
| `startDate` | string | First day of the week (YYYY-MM-DD) |
| `endDate` | string | Last day of the week (YYYY-MM-DD) |
| `days` | array | Exactly 7 day plans (Monday–Sunday) |

### `metadata` object

| Field | Type | Description |
|-------|------|-------------|
| `week` | integer | ISO week number |
| `startDate` | string | First day (YYYY-MM-DD) |
| `generatedBy` | string | Agent name, e.g. `"tubby"` |
| `generatedAt` | string | ISO 8601 timestamp |

### Each day in `days`

| Field | Type | Description |
|-------|------|-------------|
| `day` | string | Day name (Monday–Sunday) |
| `date` | string | Date (YYYY-MM-DD) |
| `breakfast` | meal | Breakfast meal |
| `lunch` | meal | Lunch meal |
| `dinner` | meal | Dinner meal |
| `snacks` | meal | Snacks |
| `jasonTotal` | macros | Jason's daily macro totals |
| `pennyTotal` | macros | Penny's daily macro totals |
| `isDateNight` | boolean? | Optional flag for date night |
| `dateNightNote` | string? | Optional date night description |

### `meal` object

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Meal name (can use `/` to separate Jason's and Penny's meals) |
| `jason` | macros | Jason's macros for this meal |
| `penny` | macros | Penny's macros for this meal |
| `ingredients` | array | List of ingredients (can be empty for eating out) |
| `notes` | string? | Optional notes (leftovers, tips, etc.) |

### `macros` object

| Field | Type | Description |
|-------|------|-------------|
| `calories` | number | Calories (kcal) |
| `protein` | number | Protein (g) |
| `carbs` | number | Carbs (g) |
| `fat` | number | Fat (g) |

### `ingredient` object

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Ingredient name |
| `amount` | string | Amount with unit (e.g. "500g", "2 tbsp", "1 bunch") |
| `category` | string | One of: Produce, Meat & Seafood, Dairy & Eggs, Pantry, Frozen, Bakery, Drinks, Spices & Seasonings, Sauces & Condiments, Other |

## Validation

Validate against the schema:

```bash
npx ajv-cli validate -s public/data/schema.json -d public/data/current-week.json
```
