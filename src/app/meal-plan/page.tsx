"use client";

import { useState, useEffect } from "react";
import { WeekPlan } from "@/types/meal-plan";
import { DayCard } from "@/components/day-card";

export default function MealPlanPage() {
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/current-week.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load meal plan");
        return res.json();
      })
      .then((data: WeekPlan) => {
        setWeekPlan(data);
        const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
        const match = data.days.find((d) => d.day === today);
        setExpandedDay(match ? match.day : data.days[0].day);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-destructive">{error}</div>
      </div>
    );
  }

  if (!weekPlan) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-muted-foreground">Loading meal plan...</div>
      </div>
    );
  }

  const startDate = new Date(weekPlan.startDate + "T00:00:00");
  const endDate = new Date(weekPlan.endDate + "T00:00:00");
  const formatOpts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const dateRange = `${startDate.toLocaleDateString("en-US", formatOpts)}–${endDate.toLocaleDateString("en-US", formatOpts)}`;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">
          🗓️ Week {weekPlan.week} · {dateRange}
        </h2>
      </div>
      {weekPlan.days.map((day) => (
        <DayCard
          key={day.day}
          day={day}
          isExpanded={expandedDay === day.day}
          onToggle={() =>
            setExpandedDay(expandedDay === day.day ? null : day.day)
          }
        />
      ))}
    </div>
  );
}
