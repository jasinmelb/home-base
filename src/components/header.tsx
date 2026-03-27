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

function getPageEmoji(pathname: string): string {
  if (pathname.startsWith("/shopping-list")) return "🛒";
  if (pathname.startsWith("/meal-plan")) return "🍽️";
  return "🏠";
}

export function Header() {
  const pathname = usePathname();

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
        <div className="rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold text-brand-dark">
          {getWeekLabel()}
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </header>
  );
}
