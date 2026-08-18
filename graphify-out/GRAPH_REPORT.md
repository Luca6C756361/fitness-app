# Graph Report - fitness-app  (2026-08-18)

## Corpus Check
- 75 files · ~24,902 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 360 nodes · 700 edges · 20 communities (13 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1c025d75`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- PlanContext.tsx
- UserContext.tsx
- WorkoutSessionContext.tsx
- SettingsContext.tsx
- compilerOptions
- types.ts
- allenamento/page.tsx
- dependencies
- layout.tsx
- devDependencies
- middleware.ts
- WorkoutContext.tsx
- README.md
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- next-env.d.ts

## God Nodes (most connected - your core abstractions)
1. `useUser()` - 23 edges
2. `compilerOptions` - 16 edges
3. `usePlan()` - 15 edges
4. `useSettings()` - 11 edges
5. `useWorkoutSession()` - 11 edges
6. `Food` - 11 edges
7. `ExerciseDefinition` - 10 edges
8. `WorkoutSession` - 10 edges
9. `useWeight()` - 9 edges
10. `CompletedSet` - 9 edges

## Surprising Connections (you probably didn't know these)
- `NutritionPage()` --calls--> `useDiary`  [EXTRACTED]
  app/nutrition/page.tsx → app/today/_lib/DiaryContext.tsx
- `ExerciseSetCardProps` --references--> `CompletedSet`  [EXTRACTED]
  app/allenamento/_components/ExerciseSetCard.tsx → app/today/_lib/types.ts
- `CartItem` --inherits--> `PlannedExercise`  [EXTRACTED]
  app/allenamento/componi/_components/CompositionCart.tsx → app/today/_lib/types.ts
- `ExerciseBrowserProps` --references--> `ExerciseDefinition`  [EXTRACTED]
  app/allenamento/componi/_components/ExerciseBrowser.tsx → app/today/_lib/types.ts
- `ComponiPage()` --calls--> `usePlan()`  [EXTRACTED]
  app/allenamento/componi/page.tsx → app/today/_lib/PlanContext.tsx

## Import Cycles
- None detected.

## Communities (20 total, 7 thin omitted)

### Community 0 - "PlanContext.tsx"
Cohesion: 0.08
Nodes (38): CartItem, CompositionCart(), CompositionCartProps, ExerciseBrowser(), ExerciseBrowserProps, CartItem, ComponiPage(), ExercisePicker() (+30 more)

### Community 1 - "UserContext.tsx"
Cohesion: 0.17
Nodes (23): GoalsForm(), ProfileForm(), StatsCard(), WeightHistoryChart(), ProfilePage(), KcalWeekChart(), Range, WeightRangeChart() (+15 more)

### Community 2 - "WorkoutSessionContext.tsx"
Cohesion: 0.09
Nodes (40): ExerciseSetCard(), ExerciseSetCardProps, Mode, PRToast(), PersonalRecordsCard(), muscleColors, periodLabels, VolumeChart() (+32 more)

### Community 3 - "SettingsContext.tsx"
Cohesion: 0.11
Nodes (18): AppearanceSection(), LanguageSection(), NotificationsSection(), ResetSection(), Toggle(), ToggleProps, UnitsSection(), defaultSettings (+10 more)

### Community 4 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 5 - "types.ts"
Cohesion: 0.08
Nodes (30): categoryLabels, FoodPicker(), FoodPickerProps, DiaryEntry, FoodDiaryProps, categoryLabels, FoodPickerProps, dailyKcalHistory (+22 more)

### Community 6 - "allenamento/page.tsx"
Cohesion: 0.23
Nodes (10): RestPresetPicker(), RestPresetPickerProps, playBeep(), PRESETS, RestTimer(), RestTimerProps, formatTime(), SessionTimer() (+2 more)

### Community 7 - "dependencies"
Cohesion: 0.08
Nodes (23): lucide-react, next, dependencies, lucide-react, next, react, react-dom, recharts (+15 more)

### Community 8 - "layout.tsx"
Cohesion: 0.08
Nodes (24): BottomNav(), items, items, Sidebar(), metadata, AuthContext, AuthProvider(), useAuth() (+16 more)

### Community 9 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+9 more)

### Community 11 - "WorkoutContext.tsx"
Cohesion: 0.25
Nodes (7): initialLogs, todayISO(), WorkoutContext, WorkoutContextValue, WorkoutLog, WorkoutProvider(), WorkoutStats

## Knowledge Gaps
- **106 isolated node(s):** `items`, `items`, `AuthContext`, `Mode`, `RestPresetPickerProps` (+101 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useUser()` connect `UserContext.tsx` to `layout.tsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `usePlan()` connect `PlanContext.tsx` to `allenamento/page.tsx`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `items`, `items`, `AuthContext` to the rest of the system?**
  _106 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `PlanContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07532467532467532 - nodes in this community are weakly interconnected._
- **Should `WorkoutSessionContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08734693877551021 - nodes in this community are weakly interconnected._
- **Should `SettingsContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11397849462365592 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._