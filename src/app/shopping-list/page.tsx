"use client";

import { useState, useEffect, useCallback } from "react";
import { week16 } from "@/data/week-16";
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

export default function ShoppingListPage() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCheckedItems(loadCheckedItems());
    setMounted(true);
  }, []);

  const shoppingList = generateShoppingList(week16);
  const grouped = groupByCategory(shoppingList);

  const totalItems = shoppingList.length;
  const checkedCount = shoppingList.filter((i) =>
    checkedItems.has(i.name)
  ).length;

  const toggleItem = useCallback(
    (name: string) => {
      setCheckedItems((prev) => {
        const next = new Set(prev);
        if (next.has(name)) {
          next.delete(name);
        } else {
          next.add(name);
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

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {checkedCount} of {totalItems} items
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
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{
              width: `${totalItems > 0 ? (checkedCount / totalItems) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Shopping list by category */}
      {grouped.map((group) => {
        const groupChecked = group.items.filter((i) =>
          checkedItems.has(i.name)
        ).length;
        const allChecked = groupChecked === group.items.length;

        return (
          <div key={group.category} className="space-y-1">
            <div className="flex items-center gap-2 py-1">
              <span className="text-sm">
                {categoryIcons[group.category] || "📦"}
              </span>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.category}
              </h3>
              <span className="text-[10px] text-muted-foreground">
                {groupChecked}/{group.items.length}
              </span>
              {allChecked && (
                <span className="text-[10px] text-emerald-500 font-medium">Done</span>
              )}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isChecked = checkedItems.has(item.name);
                return (
                  <button
                    key={item.name}
                    onClick={() => toggleItem(item.name)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all active:scale-[0.98]",
                      isChecked
                        ? "bg-secondary/40"
                        : "bg-card hover:bg-secondary/50"
                    )}
                  >
                    <Checkbox checked={isChecked} className="pointer-events-none" />
                    <span
                      className={cn(
                        "flex-1 text-sm transition-all",
                        isChecked && "line-through text-muted-foreground"
                      )}
                    >
                      {item.name}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 text-xs text-muted-foreground",
                        isChecked && "line-through"
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
