"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/meal-plan", label: "Meal Plan", icon: "🍽️" },
  { href: "/shopping-list", label: "Shopping", icon: "🛒" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/90 backdrop-blur-lg safe-area-bottom">
      <div className="mx-auto flex max-w-lg">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 py-2 pt-2.5 text-xs font-medium transition-colors",
                isActive
                  ? "text-brand-dark font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className={cn(
                "flex items-center justify-center rounded-full text-xl leading-none transition-all",
                isActive && "h-8 w-8 bg-brand/15 scale-110"
              )}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute top-0 h-[3px] w-12 rounded-full bg-gradient-to-r from-brand to-brand-light" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
