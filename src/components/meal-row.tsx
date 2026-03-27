"use client";

import { useState } from "react";
import { Meal } from "@/types/meal-plan";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MealRowProps {
  label: string;
  meal: Meal;
}

const mealIcons: Record<string, string> = {
  Breakfast: "🌅",
  Lunch: "☀️",
  Dinner: "🌙",
  Snacks: "🍎",
};

export function MealRow({ label, meal }: MealRowProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-secondary/50"
      >
        <span className="text-sm">{mealIcons[label]}</span>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="truncate text-sm font-medium">{meal.name}</div>
        </div>
        <div className="flex flex-col items-end text-[11px] text-muted-foreground shrink-0">
          <span>J: {meal.jason.calories}</span>
          <span>P: {meal.penny.calories}</span>
        </div>
        {meal.ingredients.length > 0 && (
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-90"
            )}
          />
        )}
      </button>

      {open && meal.ingredients.length > 0 && (
        <div className="ml-8 mr-2 mb-2 space-y-1">
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-muted-foreground">
            <div className="font-medium text-foreground/80">
              Jason: {meal.jason.calories} cal &middot; {meal.jason.protein}g P &middot;{" "}
              {meal.jason.carbs}g C &middot; {meal.jason.fat}g F
            </div>
            <div className="font-medium text-foreground/80">
              Penny: {meal.penny.calories} cal &middot; {meal.penny.protein}g P &middot;{" "}
              {meal.penny.carbs}g C &middot; {meal.penny.fat}g F
            </div>
          </div>
          {meal.notes && (
            <p className="text-[11px] italic text-muted-foreground">{meal.notes}</p>
          )}
          <div className="mt-1 space-y-0.5">
            {meal.ingredients.map((ing, i) => (
              <div
                key={i}
                className="flex justify-between text-[11px] text-muted-foreground"
              >
                <span>{ing.name}</span>
                <span className="shrink-0 ml-2 text-right">{ing.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
