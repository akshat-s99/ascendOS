# AscendOS — Getting Started

## Quick Start

### Prerequisites

- Node.js 18+
- npm, pnpm, or yarn

### Installation

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.

## Dashboard Overview

**Header:** AscendOS branding and system status indicator

**Top row:**
- System Status (profile + focus metrics)
- Skill Progress (progress bar + bonuses)

**Middle row:**
- Primary Objective
- Daily Objectives

**Bottom:**
- Performance Metrics
- Milestones

## Customization

- **Branding:** `lib/constants/branding.ts`
- **Theme colors:** `app/globals.css`
- **Component data:** Edit mock data in each file under `components/dashboard/`

## File Structure

```
app/
├── page.tsx
├── layout.tsx
└── globals.css

components/dashboard/
├── SystemStatus.tsx
├── ExpProgressBar.tsx
├── DailyObjectives.tsx
├── EvolutionMetrics.tsx
├── PriorityObjective.tsx
└── AchievementArchive.tsx
```

## Production Build

```bash
npm run build
npm start
```

## Documentation

See `ASCENDOS_README.md` for detailed documentation.
