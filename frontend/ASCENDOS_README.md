# AscendOS — Adaptive Evolution Operating System

A minimal, futuristic productivity dashboard for computer science students. Track focus, daily objectives, skill progress, and milestones with a subtle system-interface aesthetic.

## Features

### Dashboard Sections

1. **System Status** — Profile, semester track, and focus metrics
2. **Skill Progress** — Progress bar with daily, objectives, and streak bonuses
3. **Primary Objective** — Current high-priority learning goal
4. **Daily Objectives** — Task list with completion states
5. **Performance Metrics** — Focus time, problems solved, concept mastery, consistency
6. **Milestones** — Unlocked and locked achievement grid

### Design

- Dark, GitHub-inspired palette with blue accents
- Monospace section labels and panel layout
- Subtle Framer Motion entrance animations
- Responsive grid (mobile-first)
- No heavy glow or neon effects

## Tech Stack

- React 19
- Next.js 16 (App Router)
- Tailwind CSS 4
- Framer Motion
- TypeScript

## Project Structure

```
lib/constants/
└── branding.ts              # App name, tagline, version

components/dashboard/
├── SystemStatus.tsx
├── ExpProgressBar.tsx
├── DailyObjectives.tsx
├── EvolutionMetrics.tsx
├── PriorityObjective.tsx
└── AchievementArchive.tsx

app/
├── page.tsx
├── layout.tsx
└── globals.css
```

## Customization

### Branding

Edit `lib/constants/branding.ts` for app name, tagline, and version.

### Colors

Edit `app/globals.css` CSS variables (`--background`, `--primary`, etc.).

### Mock Data

Each dashboard component contains inline mock data arrays/objects you can replace.

## Running Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## CSS Utilities

- `.panel` — Card container
- `.section-label` — Uppercase mono section header
- `.section-title` — Primary section title
- `.section-subtitle` — Muted description
- `.progress-bar` / `.progress-fill` — Progress indicators
- `.soft-pulse` — Status indicator animation

## License

Open source for personal and commercial use.
