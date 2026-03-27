export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Ingredient {
  name: string;
  amount: string;
  category: ShoppingCategory;
}

export interface Meal {
  name: string;
  jason: Macros;
  penny: Macros;
  ingredients: Ingredient[];
  notes?: string;
}

export interface DayPlan {
  day: string;
  date: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks: Meal;
  jasonTotal: Macros;
  pennyTotal: Macros;
  isDateNight?: boolean;
  dateNightNote?: string;
}

export interface WeekPlan {
  week: number;
  year: number;
  startDate: string;
  endDate: string;
  days: DayPlan[];
}

export type ShoppingCategory =
  | "Produce"
  | "Meat & Seafood"
  | "Dairy & Eggs"
  | "Pantry"
  | "Frozen"
  | "Bakery"
  | "Drinks"
  | "Spices & Seasonings"
  | "Sauces & Condiments"
  | "Other";

export interface ShoppingItem {
  name: string;
  amount: string;
  category: ShoppingCategory;
  checked: boolean;
}
