# Home Base

Family dashboard PWA for Jason and Penny Potter. Mobile-first, offline-capable.

## Features

- **Weekly Meal Plan** — View breakfast, lunch, dinner, and snacks for each day. Shows per-person calories and macros (Jason and Penny have different targets). Expandable cards show ingredients and nutritional breakdown.
- **Shopping List** — Auto-generated from the meal plan. Grouped by category (Produce, Meat, Dairy, etc.). Tap to check off items as you shop. Works offline via service worker.

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS + shadcn/ui
- PWA with service worker for offline support
- localStorage for shopping list state

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to the Meal Plan.

## Meal Plan Data

Meal plans live in `src/data/`. Currently `week-16.ts` is loaded. Tubby (AI nutritionist) generates these weekly.

### Calorie Targets

| Person | Calories | Protein |
|--------|----------|---------|
| Jason  | 1,900–2,000 | 150g+ |
| Penny  | 1,400–1,500 | 100–120g |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with header + bottom nav
│   ├── page.tsx            # Redirects to /meal-plan
│   ├── meal-plan/page.tsx  # Weekly meal plan view
│   └── shopping-list/page.tsx # Shopping list with checkboxes
├── components/
│   ├── bottom-nav.tsx      # Mobile bottom tab bar
│   ├── header.tsx          # App header with week indicator
│   ├── day-card.tsx        # Expandable day card for meal plan
│   ├── meal-row.tsx        # Individual meal with macro breakdown
│   └── sw-register.tsx     # Service worker registration
├── data/
│   └── week-16.ts          # Week 16 meal plan data
├── lib/
│   ├── shopping.ts         # Shopping list generation + localStorage
│   └── utils.ts            # shadcn utilities
└── types/
    └── meal-plan.ts        # TypeScript types
```

## Adding a New Week

Create a new file in `src/data/` following the `WeekPlan` type from `src/types/meal-plan.ts`, then import it in the page components.

## PWA / Offline

The app registers a service worker (`public/sw.js`) that caches pages and assets. The shopping list uses localStorage, so checked items persist even without connectivity — critical for Penny at the markets.
