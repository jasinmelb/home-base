"use client";

import { useState, useEffect, useCallback } from "react";
import { WeekPlan } from "@/types/meal-plan";
import {
  generateShoppingList,
  groupByCategory,
  loadCheckedItems,
  saveCheckedItems,
} from "@/lib/shopping";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, string> = {
  Produce: "🥬",
  "Meat & Seafood": "🥩",
  "Dairy & Eggs": "🥛",
  Bakery: "🍞",
  Pantry: "🫙",
  Frozen: "🧊",
  Drinks: "🥤",
  "Spices & Seasonings": "🌿",
  "Sauces & Condiments": "🫙",
  Other: "📦",
};

const categoryColors: Record<string, string> = {
  Produce: "bg-green-100 text-green-700",
  "Meat & Seafood": "bg-red-50 text-red-700",
  "Dairy & Eggs": "bg-blue-50 text-blue-700",
  Bakery: "bg-amber-50 text-amber-700",
  Pantry: "bg-orange-50 text-orange-700",
  Frozen: "bg-cyan-50 text-cyan-700",
  Drinks: "bg-purple-50 text-purple-700",
  "Spices & Seasonings": "bg-emerald-50 text-emerald-700",
  "Sauces & Condiments": "bg-yellow-50 text-yellow-700",
  Other: "bg-gray-100 text-gray-700",
};

export default function ShoppingListPage() {
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [justChecked, setJustChecked] = useState<string | null>(null);

  useEffect(() => {
    setCheckedItems(loadCheckedItems());
    fetch("/data/current-week.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load meal plan");
        return res.json();
      })
      .then((data: WeekPlan) => {
        setWeekPlan(data);
        setMounted(true);
      })
      .catch((err) => {
        setError(err.message);
        setMounted(true);
      });
  }, []);

  const toggleItem = useCallback(
    (name: string) => {
      setCheckedItems((prev) => {
        const next = new Set(prev);
        if (next.has(name)) {
          next.delete(name);
          setJustChecked(null);
        } else {
          next.add(name);
          setJustChecked(name);
          setTimeout(() => setJustChecked(null), 300);
        }
        saveCheckedItems(next);
        return next;
      });
    },
    []
  );

  const resetAll = useCallback(() => {
    setCheckedItems(new Set());
    saveCheckedItems(new Set());
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !weekPlan) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-destructive">{error || "Failed to load meal plan"}</div>
      </div>
    );
  }

  const shoppingList = generateShoppingList(weekPlan);
  const grouped = groupByCategory(shoppingList);

  const totalItems = shoppingList.length;
  const checkedCount = shoppingList.filter((i) =>
    checkedItems.has(i.name)
  ).length;

  const progressPct = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {checkedCount} of {totalItems} items
            {progressPct === 100 && " ✨"}
          </span>
          {checkedCount > 0 && (
            <button
              onClick={resetAll}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset All
            </button>
          )}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              progressPct === 100 ? "bg-brand" : "progress-shimmer"
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Shopping list by category */}
      {grouped.map((group) => {
        const groupChecked = group.items.filter((i) =>
          checkedItems.has(i.name)
        ).length;
        const allChecked = groupChecked === group.items.length;
        const colorClass = categoryColors[group.category] || categoryColors.Other;

        return (
          <div key={group.category} className="space-y-1">
            <div className="flex items-center gap-2 py-1">
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", colorClass)}>
                {categoryIcons[group.category] || "📦"} {group.category}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {groupChecked}/{group.items.length}
              </span>
              {allChecked && (
                <span className="text-[10px] text-brand font-semibold">✓ Done</span>
              )}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isChecked = checkedItems.has(item.name);
                const isPopping = justChecked === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => toggleItem(item.name)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 active:scale-[0.98]",
                      isChecked
                        ? "bg-brand/5"
                        : "bg-card warm-shadow hover:bg-secondary/50"
                    )}
                  >
                    <div className={cn(isPopping && "checkbox-pop")}>
                      <Checkbox checked={isChecked} className={cn("pointer-events-none", isChecked && "border-brand bg-brand text-white")} />
                    </div>
                    <span
                      className={cn(
                        "flex-1 text-sm transition-all duration-200",
                        isChecked && "line-through text-muted-foreground"
                      )}
                    >
                      {item.name}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 text-xs text-muted-foreground transition-all duration-200",
                        isChecked && "line-through opacity-50"
                      )}
                    >
                      {item.amount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
