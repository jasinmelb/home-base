"use client";

import { DayPlan } from "@/types/meal-plan";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MealRow } from "@/components/meal-row";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DayCardProps {
  day: DayPlan;
  isExpanded: boolean;
  onToggle: () => void;
}

export function DayCard({ day, isExpanded, onToggle }: DayCardProps) {
  const isToday =
    new Date().toLocaleDateString("en-US", { weekday: "long" }) === day.day;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all",
        isToday && "ring-2 ring-foreground/10"
      )}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{day.day}</span>
              {isToday && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Today
                </Badge>
              )}
              {day.isDateNight && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-pink-300 text-pink-600">
                  Date Night
                </Badge>
              )}
            </div>
            <div className="mt-0.5 flex gap-3 text-[11px] text-muted-foreground">
              <span>J: {day.jasonTotal.calories} cal &middot; {day.jasonTotal.protein}g P</span>
              <span>P: {day.pennyTotal.calories} cal &middot; {day.pennyTotal.protein}g P</span>
            </div>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {isExpanded && (
        <CardContent className="border-t px-4 py-3 space-y-1">
          <MealRow label="Breakfast" meal={day.breakfast} />
          <MealRow label="Lunch" meal={day.lunch} />
          <MealRow label="Dinner" meal={day.dinner} />
          <MealRow label="Snacks" meal={day.snacks} />

          {day.dateNightNote && (
            <div className="mt-3 rounded-lg bg-pink-50 px-3 py-2 text-xs text-pink-700">
              {day.dateNightNote}
            </div>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <DailyTotal label="Jason" macros={day.jasonTotal} target={{ min: 1900, max: 2000 }} />
            <DailyTotal label="Penny" macros={day.pennyTotal} target={{ min: 1400, max: 1500 }} />
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function DailyTotal({
  label,
  macros,
  target,
}: {
  label: string;
  macros: { calories: number; protein: number; carbs: number; fat: number };
  target: { min: number; max: number };
}) {
  const inRange = macros.calories >= target.min && macros.calories <= target.max;
  return (
    <div className="rounded-lg bg-secondary/60 px-3 py-2">
      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <div className={cn("text-sm font-bold", inRange ? "text-emerald-600" : "text-amber-600")}>
        {macros.calories} cal
      </div>
      <div className="text-[11px] text-muted-foreground">
        {macros.protein}g P &middot; {macros.carbs}g C &middot; {macros.fat}g F
      </div>
    </div>
  );
}
