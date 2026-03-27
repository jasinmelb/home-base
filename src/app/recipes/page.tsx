"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Recipe, RecipeCategory, RecipesData } from "@/types/recipe";
import { cn } from "@/lib/utils";

const categories: Array<RecipeCategory | "All"> = [
  "All",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snacks",
];

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  Breakfast: { bg: "bg-[#FFF3E0]", text: "text-[#E65100]", border: "border-[#F5A623]/30" },
  Lunch: { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]", border: "border-[#7CB586]/30" },
  Dinner: { bg: "bg-[#EDE7F6]", text: "text-[#5E35B1]", border: "border-[#9575CD]/30" },
  Snacks: { bg: "bg-[#FCE4EC]", text: "text-[#C2185B]", border: "border-[#F06292]/30" },
  Sides: { bg: "bg-[#E3F2FD]", text: "text-[#1565C0]", border: "border-[#42A5F5]/30" },
};

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<RecipeCategory | "All">("All");

  useEffect(() => {
    fetch("/data/recipes.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load recipes");
        return res.json();
      })
      .then((data: RecipesData) => setRecipes(data.recipes))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-destructive">{error}</div>
      </div>
    );
  }

  if (!recipes.length) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-muted-foreground">Loading recipes...</div>
      </div>
    );
  }

  const filtered = recipes.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          🔍
        </span>
        <input
          type="text"
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border/50 bg-card py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground ring-1 ring-foreground/10 focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-[0.96]",
              activeCategory === cat
                ? "bg-brand text-white shadow-sm"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recipe grid */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-muted-foreground">No recipes found</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {filtered.map((recipe) => {
            const colors = categoryColors[recipe.category] ?? categoryColors.Sides;
            return (
              <Link
                key={recipe.slug}
                href={`/recipes/${recipe.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-all active:scale-[0.98] warm-shadow"
              >
                {/* Emoji header */}
                <div className={cn("flex items-center justify-center py-4 text-3xl", colors.bg)}>
                  {recipe.emoji}
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col gap-1.5 px-3 py-2.5">
                  <h3 className="font-heading text-sm font-bold leading-tight text-foreground line-clamp-2">
                    {recipe.name}
                  </h3>

                  {/* Category badge */}
                  <span
                    className={cn(
                      "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                      colors.bg,
                      colors.text,
                      colors.border
                    )}
                  >
                    {recipe.category}
                  </span>

                  {/* Calories */}
                  <div className="mt-auto flex flex-col gap-0.5 pt-1 text-[10px] text-muted-foreground">
                    {recipe.jason.calories > 0 && (
                      <span>J: {recipe.jason.calories} kcal</span>
                    )}
                    {recipe.penny.calories > 0 && (
                      <span>P: {recipe.penny.calories} kcal</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
