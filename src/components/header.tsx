"use client";

import { usePathname } from "next/navigation";

function getWeekLabel(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000;
  const week = Math.ceil((diff / oneWeek + start.getDay() + 1) / 7);
  return `Week ${week}`;
}

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/shopping-list")) return "Shopping List";
  if (pathname.startsWith("/meal-plan")) return "Meal Plan";
  return "Home Base";
}

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight">
            {getPageTitle(pathname)}
          </h1>
          <p className="text-xs text-muted-foreground">Home Base</p>
        </div>
        <div className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          {getWeekLabel()}
        </div>
      </div>
    </header>
  );
}
