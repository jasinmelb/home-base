"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { WeekPlan } from "@/types/meal-plan";
import {
  generateShoppingList,
  groupByCategory,
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

function timeSince(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function ShoppingListPage() {
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [justChecked, setJustChecked] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [syncLabel, setSyncLabel] = useState("");
  const syncTimer = useRef<ReturnType<typeof setInterval>>(undefined);
  const lastLocalChange = useRef<number>(0);
  const lastKnownUpdatedAt = useRef<string>("");

  // Update the "synced X ago" label every 5s
  useEffect(() => {
    if (!lastSynced) return;
    const update = () => setSyncLabel(timeSince(lastSynced));
    update();
    syncTimer.current = setInterval(update, 5000);
    return () => clearInterval(syncTimer.current);
  }, [lastSynced]);

  // Load data on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/shopping").then((r) => r.json()),
      fetch("/data/current-week.json").then((r) => {
        if (!r.ok) throw new Error("Failed to load meal plan");
        return r.json();
      }),
    ])
      .then(([state, plan]) => {
        setCheckedItems(new Set(state.checked ?? []));
        lastKnownUpdatedAt.current = state.updatedAt ?? "";
        setLastSynced(new Date());
        setWeekPlan(plan);
        setMounted(true);
      })
      .catch((err) => {
        setError(err.message);
        setMounted(true);
      });
  }, []);

  // Poll for real-time sync every 3 seconds
  useEffect(() => {
    if (!mounted) return;
    const poll = setInterval(async () => {
      try {
        const res = await fetch("/api/shopping");
        if (!res.ok) return;
        const state = await res.json();
        const serverUpdatedAt: string = state.updatedAt ?? "";
        // Only update if server has newer data and no local change in last 2s
        if (
          serverUpdatedAt > lastKnownUpdatedAt.current &&
          Date.now() - lastLocalChange.current > 2000
        ) {
          lastKnownUpdatedAt.current = serverUpdatedAt;
          setCheckedItems(new Set(state.checked ?? []));
          setLastSynced(new Date());
        }
      } catch {
        // Silently ignore poll errors
      }
    }, 3000);
    return () => clearInterval(poll);
  }, [mounted]);

  const syncToServer = useCallback((items: Set<string>) => {
    lastLocalChange.current = Date.now();
    fetch("/api/shopping", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked: [...items] }),
    }).then((res) => res.json()).then((state) => {
      lastKnownUpdatedAt.current = state.updatedAt ?? "";
      setLastSynced(new Date());
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
        syncToServer(next);
        return next;
      });
    },
    [syncToServer]
  );

  const resetAll = useCallback(() => {
    setCheckedItems(new Set());
    lastLocalChange.current = Date.now();
    fetch("/api/shopping", { method: "DELETE" }).then((res) => res.json()).then((state) => {
      lastKnownUpdatedAt.current = state.updatedAt ?? "";
      setLastSynced(new Date());
    });
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

      {/* Sync indicator */}
      {lastSynced && (
        <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground/60 pb-2">
          <span className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-600/70">Live</span>
          </span>
          <span>· Synced {syncLabel}</span>
        </div>
      )}
    </div>
  );
}
