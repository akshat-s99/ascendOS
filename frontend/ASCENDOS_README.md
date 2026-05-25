# AscendOS — Personal Evolution Operating System

AscendOS is a **behavior-driven** evolution OS. It does not assign study tasks or generate academic objectives. You define activities and goals; the system tracks, analyzes, visualizes, and scores your evolution.

## Core philosophy

- **You define** activities, goals, routines, and path
- **AscendOS** tracks, analyzes, visualizes, evaluates, evolves

## Features

| Module | Purpose |
|--------|---------|
| Activity Log | Log any activity (study, coding, gym, sleep, gaming, etc.) |
| Your Goals | User-created daily / weekly / monthly / yearly goals |
| Evolution Core | Focus, discipline, balance, consistency, growth scoring |
| Life Analytics | Productivity trends, category balance, focus patterns |
| Evolution Log | Timeline of activities, goals, milestones |
| System Insights | Rule-based adaptive messages (no backend AI) |

## Tech

- Next.js 16 · React 19 · TypeScript · Tailwind · Framer Motion
- **LocalStorage only** (`ascendos-state-v2`)
- No backend, APIs, or database

## Evolution engine

Scores are computed from logged behavior:

- **Focus** — productive time ratio
- **Discipline** — streak + goal progress
- **Balance** — category diversity
- **Consistency** — active days per week
- **Growth** — evolution points + goal completion

## Project structure (B.Tech friendly)

```
lib/types/       Data models
lib/storage/     LocalStorage persistence
data/            Categories, defaults
utils/           evolution.ts, analytics.ts, insights.ts, streak.ts
hooks/           useAscend.tsx (global store)
components/      onboarding + dashboard panels
app/             page.tsx, onboarding/
```

## Run locally

```bash
cd frontend && npm install && npm run dev
```

First visit → onboarding. Then log activities and create goals on the dashboard.
