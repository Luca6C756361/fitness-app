# Graph Report - fitness-app  (2026-08-30)

## Corpus Check
- 77 files · ~26,445 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 357 nodes · 710 edges · 22 communities (14 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c8ab480c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types.ts
- useUser
- WorkoutSessionContext.tsx
- SettingsContext.tsx
- compilerOptions
- UserContext.tsx
- DiaryContext.tsx
- dependencies
- volumeStats.ts
- devDependencies
- middleware.ts
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- next-env.d.ts
- postcss.config.mjs
- sw.js
- README.md
- DESIGN.md

## God Nodes (most connected - your core abstractions)
1. `useUser()` - 23 edges
2. `compilerOptions` - 16 edges
3. `usePlan()` - 15 edges
4. `useAuth()` - 13 edges
5. `supabase` - 11 edges
6. `useSettings()` - 11 edges
7. `useWorkoutSession()` - 11 edges
8. `ExerciseDefinition` - 10 edges
9. `WorkoutSession` - 10 edges
10. `useDiary()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `DiaryProvider()` --calls--> `useAuth()`  [EXTRACTED]
  app/today/_lib/DiaryContext.tsx → app/_lib/AuthContext.tsx
- `PlanProvider()` --calls--> `useAuth()`  [EXTRACTED]
  app/today/_lib/PlanContext.tsx → app/_lib/AuthContext.tsx
- `WorkoutSessionProvider()` --calls--> `useAuth()`  [EXTRACTED]
  app/today/_lib/WorkoutSessionContext.tsx → app/_lib/AuthContext.tsx
- `ExerciseSetCardProps` --references--> `CompletedSet`  [EXTRACTED]
  app/allenamento/_components/ExerciseSetCard.tsx → app/today/_lib/types.ts
- `CartItem` --inherits--> `PlannedExercise`  [EXTRACTED]
  app/allenamento/componi/_components/CompositionCart.tsx → app/today/_lib/types.ts

## Import Cycles
- None detected.

## Communities (22 total, 8 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.08
Nodes (40): CartItem, CompositionCart(), CompositionCartProps, ExerciseBrowser(), ExerciseBrowserProps, CartItem, ComponiPage(), ExercisePicker() (+32 more)

### Community 1 - "useUser"
Cohesion: 0.19
Nodes (17): GoalsForm(), ProfileForm(), StatsCard(), WeightHistoryChart(), ProfilePage(), KcalWeekChart(), PersonalRecordsCard(), Range (+9 more)

### Community 2 - "WorkoutSessionContext.tsx"
Cohesion: 0.09
Nodes (37): ExerciseSetCard(), ExerciseSetCardProps, Mode, PRToast(), RestPresetPicker(), RestPresetPickerProps, playBeep(), PRESETS (+29 more)

### Community 3 - "SettingsContext.tsx"
Cohesion: 0.12
Nodes (17): AppearanceSection(), LanguageSection(), NotificationsSection(), ResetSection(), Toggle(), ToggleProps, UnitsSection(), defaultSettings (+9 more)

### Community 4 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 5 - "UserContext.tsx"
Cohesion: 0.09
Nodes (23): AppShell(), BottomNav(), items, ServiceWorker(), items, Sidebar(), metadata, viewport (+15 more)

### Community 6 - "DiaryContext.tsx"
Cohesion: 0.08
Nodes (32): FoodDiary(), FoodDiaryProps, Totals, categoryLabels, FoodPicker(), FoodPickerProps, NutritionPage(), MacroDonut() (+24 more)

### Community 7 - "dependencies"
Cohesion: 0.08
Nodes (23): lucide-react, next, dependencies, lucide-react, next, react, react-dom, recharts (+15 more)

### Community 8 - "volumeStats.ts"
Cohesion: 0.23
Nodes (13): muscleColors, periodLabels, VolumeChart(), exerciseDatabase, isoDaysAgo(), logsInPeriod(), logVolume(), muscleByExerciseId (+5 more)

### Community 9 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+9 more)

### Community 21 - "DESIGN.md"
Cohesion: 0.25
Nodes (7): 1. Modalità Azione (Live Workout), 2. Modalità Riflessione (Log & Analytics), Do, Do's and Don'ts per il Tema Chiaro, Don't, L'Architettura a Doppio Stato e Tema, Overview

## Knowledge Gaps
- **103 isolated node(s):** `items`, `items`, `AuthContext`, `Mode`, `RestPresetPickerProps` (+98 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supabase` connect `UserContext.tsx` to `types.ts`, `WorkoutSessionContext.tsx`, `SettingsContext.tsx`, `DiaryContext.tsx`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `UserContext.tsx` to `types.ts`, `WorkoutSessionContext.tsx`, `SettingsContext.tsx`, `DiaryContext.tsx`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `useUser()` connect `useUser` to `UserContext.tsx`, `DiaryContext.tsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `items`, `items`, `AuthContext` to the rest of the system?**
  _103 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07894736842105263 - nodes in this community are weakly interconnected._
- **Should `WorkoutSessionContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08880666049953746 - nodes in this community are weakly interconnected._
- **Should `SettingsContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11954022988505747 - nodes in this community are weakly interconnected._