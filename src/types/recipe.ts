export interface RecipeIngredient {
  name: string;
  amount: string;
}

export interface RecipeMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: string;
}

export interface Recipe {
  slug: string;
  name: string;
  category: RecipeCategory;
  emoji: string;
  prepTime: string;
  ingredients: RecipeIngredient[];
  jason: RecipeMacros;
  penny: RecipeMacros;
  method: string[];
  notes: string;
}

export type RecipeCategory = "Breakfast" | "Lunch" | "Dinner" | "Snacks" | "Sides";

export interface RecipesData {
  recipes: Recipe[];
}
