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
        "overflow-hidden transition-all warm-shadow",
        isToday && "today-glow ring-2 ring-brand/30"
      )}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{day.day}</span>
              {isToday && (
                <Badge className="bg-brand/15 text-brand-dark border-0 text-[10px] px-2 py-0 font-semibold">
                  Today
                </Badge>
              )}
              {day.isDateNight && (
                <Badge className="bg-gradient-to-r from-pink-100 to-rose-100 text-rose-600 border-0 text-[10px] px-2 py-0 font-semibold date-night-sparkle">
                  <span className="mr-0.5">💕</span> Date Night
                </Badge>
              )}
            </div>
            <div className="mt-1 flex gap-3 text-[11px] text-muted-foreground">
              <span>J: {day.jasonTotal.calories} cal · {day.jasonTotal.protein}g P</span>
              <span>P: {day.pennyTotal.calories} cal · {day.pennyTotal.protein}g P</span>
            </div>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {isExpanded && (
        <CardContent className="border-t border-border/50 px-4 py-3 space-y-1">
          <MealRow label="Breakfast" meal={day.breakfast} />
          <MealRow label="Lunch" meal={day.lunch} />
          <MealRow label="Dinner" meal={day.dinner} />
          <MealRow label="Snacks" meal={day.snacks} />

          {day.dateNightNote && (
            <div className="mt-3 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 px-4 py-3 text-xs text-rose-700 border border-rose-100">
              <span className="mr-1">💕</span> {day.dateNightNote}
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

function MacroBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className={cn("h-full rounded-full transition-all duration-500", color)}
        style={{ width: `${pct}%` }}
      />
    </div>
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
    <div className="rounded-xl bg-gradient-to-br from-secondary/80 to-secondary/40 px-3 py-2.5">
      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <div className={cn("text-sm font-bold", inRange ? "text-brand-dark" : "text-warm-orange")}>
        {macros.calories} cal
      </div>
      <MacroBar value={macros.calories} max={target.max} color={inRange ? "bg-brand" : "bg-warm-orange"} />
      <div className="mt-1 text-[11px] text-muted-foreground">
        {macros.protein}g P · {macros.carbs}g C · {macros.fat}g F
      </div>
    </div>
  );
}
