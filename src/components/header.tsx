"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface MealPlanMeta {
  week: number;
  startDate: string;
  endDate: string;
}

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/shopping-list")) return "Shopping List";
  if (pathname.startsWith("/meal-plan")) return "Meal Plan";
  return "Home Base";
}

function getPageEmoji(pathname: string): string {
  if (pathname.startsWith("/shopping-list")) return "🛒";
  if (pathname.startsWith("/meal-plan")) return "🍽️";
  return "🏠";
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", opts)}–${end.toLocaleDateString("en-US", opts)}`;
}

export function Header() {
  const pathname = usePathname();
  const [meta, setMeta] = useState<MealPlanMeta | null>(null);

  useEffect(() => {
    fetch("/data/current-week.json")
      .then((res) => res.json())
      .then((data) => {
        setMeta({
          week: data.metadata?.week || data.week,
          startDate: data.startDate,
          endDate: data.endDate,
        });
      })
      .catch(() => {});
  }, []);

  const weekLabel = meta ? `Week ${meta.week}` : "Home Base";
  const dateRange = meta ? formatDateRange(meta.startDate, meta.endDate) : "";

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-brand/10 via-warm-orange/5 to-coral/5 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{getPageEmoji(pathname)}</span>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              {getPageTitle(pathname)}
            </h1>
            <p className="text-[11px] font-medium text-muted-foreground">Home Base</p>
          </div>
        </div>
        <div className="text-right">
          <div className="rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold text-brand-dark">
            {weekLabel}
          </div>
          {dateRange && (
            <div className="mt-0.5 text-[10px] text-muted-foreground">
              {dateRange}
            </div>
          )}
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </header>
  );
}
