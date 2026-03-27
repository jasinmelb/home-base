import { WeekPlan, ShoppingCategory, ShoppingItem } from "@/types/meal-plan";

interface AggregatedItem {
  name: string;
  amounts: string[];
  category: ShoppingCategory;
}

export function generateShoppingList(plan: WeekPlan): ShoppingItem[] {
  const map = new Map<string, AggregatedItem>();

  for (const day of plan.days) {
    const meals = [day.breakfast, day.lunch, day.dinner, day.snacks];
    for (const meal of meals) {
      for (const ing of meal.ingredients) {
        const key = ing.name.toLowerCase();
        const existing = map.get(key);
        if (existing) {
          existing.amounts.push(ing.amount);
        } else {
          map.set(key, {
            name: ing.name,
            amounts: [ing.amount],
            category: ing.category,
          });
        }
      }
    }
  }

  return Array.from(map.values()).map((item) => ({
    name: item.name,
    amount: aggregateAmounts(item.amounts),
    category: item.category,
    checked: false,
  }));
}

function aggregateAmounts(amounts: string[]): string {
  // Try to sum numeric amounts
  const numericPattern = /^(\d+(?:\.\d+)?)\s*(.*)$/;
  const groups = new Map<string, number>();

  for (const amt of amounts) {
    const match = amt.match(numericPattern);
    if (match) {
      const val = parseFloat(match[1]);
      const unit = match[2].trim();
      groups.set(unit, (groups.get(unit) || 0) + val);
    } else {
      // Non-numeric, just count occurrences
      groups.set(amt, (groups.get(amt) || 0) + 1);
    }
  }

  const parts: string[] = [];
  for (const [unit, val] of groups) {
    if (unit === "") {
      parts.push(`${val}`);
    } else {
      // Check if the "unit" is actually the full string counted
      const isCountedString = amounts.includes(unit);
      if (isCountedString) {
        if (val > 1) {
          parts.push(`${val}x ${unit}`);
        } else {
          parts.push(unit);
        }
      } else {
        parts.push(`${val}${unit ? ` ${unit}` : ""}`);
      }
    }
  }

  return parts.join(", ");
}

const CATEGORY_ORDER: ShoppingCategory[] = [
  "Produce",
  "Meat & Seafood",
  "Dairy & Eggs",
  "Bakery",
  "Pantry",
  "Frozen",
  "Drinks",
  "Spices & Seasonings",
  "Sauces & Condiments",
  "Other",
];

export function groupByCategory(
  items: ShoppingItem[]
): { category: ShoppingCategory; items: ShoppingItem[] }[] {
  const map = new Map<ShoppingCategory, ShoppingItem[]>();

  for (const item of items) {
    const list = map.get(item.category) || [];
    list.push(item);
    map.set(item.category, list);
  }

  return CATEGORY_ORDER.filter((cat) => map.has(cat)).map((cat) => ({
    category: cat,
    items: map.get(cat)!.sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

const STORAGE_KEY = "home-base-shopping-checked";

export function loadCheckedItems(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch {
    // ignore
  }
  return new Set();
}

export function saveCheckedItems(checked: Set<string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...checked]));
}
