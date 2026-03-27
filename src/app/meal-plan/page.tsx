"use client";

import { useState } from "react";
import { week16 } from "@/data/week-16";
import { DayCard } from "@/components/day-card";

export default function MealPlanPage() {
  const [expandedDay, setExpandedDay] = useState<string | null>(
    () => {
      const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
      const match = week16.days.find((d) => d.day === today);
      return match ? match.day : week16.days[0].day;
    }
  );

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          Week {week16.week} &middot; Apr 13–19
        </h2>
      </div>
      {week16.days.map((day) => (
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
