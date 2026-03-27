import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Recipe, RecipesData } from "@/types/recipe";

const RECIPES_PATH = path.join(process.cwd(), "public", "data", "recipes.json");
const TUBBY_RECIPES_DIR = path.join(
  "/Users/kevin/.openclaw/workspace-tubby/memory/recipes"
);

function recipeToMarkdown(recipe: Recipe): string {
  const lines: string[] = [];

  lines.push(`# ${recipe.name}`);
  lines.push("");

  lines.push("## Ingredients");
  for (const ing of recipe.ingredients) {
    lines.push(`- ${ing.name}: ${ing.amount}`);
  }
  lines.push("");

  lines.push("## Portions");
  if (recipe.jason.calories > 0) {
    lines.push(
      `**Jason:** ${recipe.jason.calories} kcal, ${recipe.jason.protein}g P (${recipe.jason.portion})`
    );
  }
  if (recipe.penny.calories > 0) {
    lines.push(
      `**Penny:** ${recipe.penny.calories} kcal, ${recipe.penny.protein}g P (${recipe.penny.portion})`
    );
  }
  lines.push("");

  lines.push("## Method");
  recipe.method.forEach((step, i) => {
    lines.push(`${i + 1}. ${step}`);
  });
  lines.push("");

  if (recipe.notes) {
    lines.push("## Notes");
    lines.push(`- ${recipe.notes}`);
    lines.push("");
  }

  return lines.join("\n");
}

export async function GET() {
  try {
    const data = await fs.readFile(RECIPES_PATH, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json(
      { error: "Failed to read recipes" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updated: Recipe = await request.json();

    const raw = await fs.readFile(RECIPES_PATH, "utf-8");
    const data: RecipesData = JSON.parse(raw);

    const idx = data.recipes.findIndex((r) => r.slug === updated.slug);
    if (idx === -1) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    data.recipes[idx] = updated;

    await fs.writeFile(RECIPES_PATH, JSON.stringify(data, null, 2) + "\n");

    // Write markdown to Tubby memory
    try {
      await fs.mkdir(TUBBY_RECIPES_DIR, { recursive: true });
      const mdPath = path.join(TUBBY_RECIPES_DIR, `${updated.slug}.md`);
      await fs.writeFile(mdPath, recipeToMarkdown(updated));
    } catch {
      // Non-fatal: Tubby sync can fail silently
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update recipe" },
      { status: 500 }
    );
  }
}
