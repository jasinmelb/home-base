"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Recipe, RecipesData, RecipeIngredient } from "@/types/recipe";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, { bg: string; text: string }> = {
  Breakfast: { bg: "bg-[#FFF3E0]", text: "text-[#E65100]" },
  Lunch: { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]" },
  Dinner: { bg: "bg-[#EDE7F6]", text: "text-[#5E35B1]" },
  Snacks: { bg: "bg-[#FCE4EC]", text: "text-[#C2185B]" },
  Sides: { bg: "bg-[#E3F2FD]", text: "text-[#1565C0]" },
};

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Recipe | null>(null);

  useEffect(() => {
    fetch("/data/recipes.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load recipes");
        return res.json();
      })
      .then((data: RecipesData) => {
        const found = data.recipes.find((r) => r.slug === slug);
        if (!found) throw new Error("Recipe not found");
        setRecipe(found);
        setDraft(found);
      })
      .catch((err) => setError(err.message));
  }, [slug]);

  const startEditing = useCallback(() => {
    setDraft(recipe ? { ...recipe, ingredients: recipe.ingredients.map((i) => ({ ...i })), method: [...recipe.method] } : null);
    setEditing(true);
  }, [recipe]);

  const cancelEditing = useCallback(() => {
    setDraft(recipe);
    setEditing(false);
  }, [recipe]);

  const save = useCallback(async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const res = await fetch("/api/recipes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error("Failed to save");
      setRecipe(draft);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [draft]);

  const updateDraft = useCallback((updates: Partial<Recipe>) => {
    setDraft((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const updateIngredient = useCallback((idx: number, field: keyof RecipeIngredient, value: string) => {
    setDraft((prev) => {
      if (!prev) return null;
      const ingredients = prev.ingredients.map((ing, i) =>
        i === idx ? { ...ing, [field]: value } : ing
      );
      return { ...prev, ingredients };
    });
  }, []);

  const addIngredient = useCallback(() => {
    setDraft((prev) => {
      if (!prev) return null;
      return { ...prev, ingredients: [...prev.ingredients, { name: "", amount: "" }] };
    });
  }, []);

  const removeIngredient = useCallback((idx: number) => {
    setDraft((prev) => {
      if (!prev) return null;
      return { ...prev, ingredients: prev.ingredients.filter((_, i) => i !== idx) };
    });
  }, []);

  const updateMethod = useCallback((idx: number, value: string) => {
    setDraft((prev) => {
      if (!prev) return null;
      const method = prev.method.map((s, i) => (i === idx ? value : s));
      return { ...prev, method };
    });
  }, []);

  const addMethodStep = useCallback(() => {
    setDraft((prev) => {
      if (!prev) return null;
      return { ...prev, method: [...prev.method, ""] };
    });
  }, []);

  const removeMethodStep = useCallback((idx: number) => {
    setDraft((prev) => {
      if (!prev) return null;
      return { ...prev, method: prev.method.filter((_, i) => i !== idx) };
    });
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-destructive">{error}</div>
      </div>
    );
  }

  if (!recipe || !draft) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-muted-foreground">Loading recipe...</div>
      </div>
    );
  }

  const display = editing ? draft : recipe;
  const colors = categoryColors[display.category] ?? categoryColors.Sides;

  return (
    <div className="space-y-4 pb-4">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/recipes")}
          className="flex items-center gap-1 text-sm font-medium text-brand-dark active:scale-[0.96]"
        >
          ← Back
        </button>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={cancelEditing}
                className="rounded-lg border border-border/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground active:scale-[0.96]"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-sm active:scale-[0.96] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <button
              onClick={startEditing}
              className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand-dark active:scale-[0.96]"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Header card */}
      <div className={cn("flex items-center gap-3 rounded-xl px-4 py-3", colors.bg)}>
        <span className="text-4xl">{display.emoji}</span>
        <div className="flex-1">
          {editing ? (
            <input
              value={draft.name}
              onChange={(e) => updateDraft({ name: e.target.value })}
              className="w-full rounded-lg border border-border/50 bg-white px-2 py-1 font-heading text-lg font-bold text-foreground"
            />
          ) : (
            <h1 className="font-heading text-lg font-bold text-foreground">{display.name}</h1>
          )}
          <div className="mt-1 flex items-center gap-2">
            <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold", colors.bg, colors.text, "border border-current/20")}>
              {display.category}
            </span>
            <span className="text-xs text-muted-foreground">⏱ {display.prepTime}</span>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <section className="rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden">
        <div className="px-4 pt-3 pb-2">
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-[#F5A623]">
            Ingredients
          </h2>
        </div>
        <div className="px-4 pb-3 space-y-1.5">
          {display.ingredients.map((ing, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {editing ? (
                <>
                  <input
                    value={draft.ingredients[i]?.name ?? ""}
                    onChange={(e) => updateIngredient(i, "name", e.target.value)}
                    className="flex-1 rounded-lg border border-border/50 bg-secondary/50 px-2 py-1 text-sm"
                    placeholder="Ingredient"
                  />
                  <input
                    value={draft.ingredients[i]?.amount ?? ""}
                    onChange={(e) => updateIngredient(i, "amount", e.target.value)}
                    className="w-28 rounded-lg border border-border/50 bg-secondary/50 px-2 py-1 text-sm"
                    placeholder="Amount"
                  />
                  <button onClick={() => removeIngredient(i)} className="text-destructive text-xs shrink-0">✕</button>
                </>
              ) : (
                <>
                  <span className="text-foreground">{ing.name}</span>
                  <span className="ml-auto shrink-0 text-muted-foreground">{ing.amount}</span>
                </>
              )}
            </div>
          ))}
          {editing && (
            <button onClick={addIngredient} className="text-xs font-semibold text-brand-dark mt-1">
              + Add ingredient
            </button>
          )}
        </div>
      </section>

      {/* Portions */}
      <section className="rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden">
        <div className="px-4 pt-3 pb-2">
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-[#9575CD]">
            Portions & Macros
          </h2>
        </div>
        <div className="px-4 pb-3 space-y-3">
          {[
            { label: "Jason", data: display.jason, color: "text-[#5E35B1]" },
            { label: "Penny", data: display.penny, color: "text-[#C2185B]" },
          ].map(({ label, data, color }) =>
            data.calories > 0 ? (
              <div key={label}>
                <div className={cn("text-xs font-bold", color)}>{label}</div>
                <div className="text-sm text-foreground mt-0.5">{data.portion}</div>
                <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
                  <span>{data.calories} kcal</span>
                  <span>{data.protein}g P</span>
                  <span>{data.carbs}g C</span>
                  <span>{data.fat}g F</span>
                </div>
              </div>
            ) : null
          )}
        </div>
      </section>

      {/* Method */}
      <section className="rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden">
        <div className="px-4 pt-3 pb-2">
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-[#7CB586]">
            Method
          </h2>
        </div>
        <div className="px-4 pb-3 space-y-2">
          {display.method.map((step, i) => (
            <div key={i} className="flex gap-2.5 text-sm">
              <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-brand/15 text-[10px] font-bold text-brand-dark">
                {i + 1}
              </span>
              {editing ? (
                <div className="flex flex-1 items-center gap-1">
                  <input
                    value={draft.method[i] ?? ""}
                    onChange={(e) => updateMethod(i, e.target.value)}
                    className="flex-1 rounded-lg border border-border/50 bg-secondary/50 px-2 py-1 text-sm"
                  />
                  <button onClick={() => removeMethodStep(i)} className="text-destructive text-xs shrink-0">✕</button>
                </div>
              ) : (
                <span className="text-foreground leading-relaxed">{step}</span>
              )}
            </div>
          ))}
          {editing && (
            <button onClick={addMethodStep} className="text-xs font-semibold text-brand-dark mt-1">
              + Add step
            </button>
          )}
        </div>
      </section>

      {/* Notes */}
      <section className="rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden">
        <div className="px-4 pt-3 pb-2">
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-[#F06292]">
            Notes
          </h2>
        </div>
        <div className="px-4 pb-3">
          {editing ? (
            <textarea
              value={draft.notes}
              onChange={(e) => updateDraft({ notes: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-border/50 bg-secondary/50 px-2 py-1.5 text-sm text-foreground resize-none"
            />
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">{display.notes}</p>
          )}
        </div>
      </section>
    </div>
  );
}
