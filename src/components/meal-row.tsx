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

const mealColors: Record<string, { bg: string; accent: string; text: string }> = {
  Breakfast: { bg: "bg-meal-breakfast/60", accent: "bg-meal-breakfast-accent", text: "text-amber-700" },
  Lunch: { bg: "bg-meal-lunch/60", accent: "bg-meal-lunch-accent", text: "text-green-700" },
  Dinner: { bg: "bg-meal-dinner/60", accent: "bg-meal-dinner-accent", text: "text-purple-700" },
  Snacks: { bg: "bg-meal-snacks/60", accent: "bg-meal-snacks-accent", text: "text-pink-700" },
};

export function MealRow({ label, meal }: MealRowProps) {
  const [open, setOpen] = useState(false);
  const colors = mealColors[label] || mealColors.Snacks;

  return (
    <div className="rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all",
          open ? colors.bg : "hover:bg-secondary/50"
        )}
      >
        <span className="text-base">{mealIcons[label]}</span>
        <div className="min-w-0 flex-1">
          <div className={cn("text-[10px] font-semibold uppercase tracking-wider", colors.text)}>
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
              "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-90"
            )}
          />
        )}
      </button>

      {open && meal.ingredients.length > 0 && (
        <div className={cn("mx-3 mb-2 mt-1 rounded-lg p-3 space-y-1.5", colors.bg)}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-muted-foreground">
            <div className="font-medium text-foreground/80">
              Jason: {meal.jason.calories} cal · {meal.jason.protein}g P ·{" "}
              {meal.jason.carbs}g C · {meal.jason.fat}g F
            </div>
            <div className="font-medium text-foreground/80">
              Penny: {meal.penny.calories} cal · {meal.penny.protein}g P ·{" "}
              {meal.penny.carbs}g C · {meal.penny.fat}g F
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
