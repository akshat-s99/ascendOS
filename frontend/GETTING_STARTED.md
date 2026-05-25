# AscendOS — Getting Started

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. First visit routes to **onboarding**; complete setup to unlock the dashboard.

## Architecture

```
lib/types/          TypeScript models
lib/storage/        LocalStorage load/save
data/               Default objectives, skills, sprint items
utils/              Dates, EXP, streaks, metrics, insights, GitHub mock
hooks/useAscend.tsx Global state + persistence
components/
  onboarding/       Welcome + profile setup flow
  dashboard/        All dashboard panels
app/
  page.tsx          Dashboard (requires onboarding)
  onboarding/       Profile initialization
```

## Features

- **Onboarding** — name, semester, goals, tech stack, GitHub (optional)
- **Objectives** — click to complete; awards pts, updates streak & skills
- **Streaks** — current, longest, weekly completion %
- **Skill tree** — six CS domains with progress bars
- **Semester sprint** — exams, assignments, projects, placement (slider progress)
- **GitHub consistency** — mock weekly commit chart
- **Weekly report** — frontend-generated summary
- **System insights** — rule-based messages

All data persists in **LocalStorage** (`ascendos-state-v1`).

## Reconfigure

Dashboard footer → **Reconfigure profile** (`/onboarding?edit=1`)

## Reset

Dashboard footer → **Reset system** clears storage and returns to onboarding.
