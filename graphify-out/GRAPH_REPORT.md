# Graph Report - fitness-app  (2026-08-30)

## Corpus Check
- 76 files · ~25,645 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 351 nodes · 704 edges · 23 communities (15 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a1695da6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- PlanContext.tsx
- useUser
- WorkoutSessionContext.tsx
- SettingsContext.tsx
- compilerOptions
- layout.tsx
- types.ts
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
- DiaryContext.tsx
- Web Interface Guidelines

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
- `WeightProvider()` --calls--> `useAuth()`  [EXTRACTED]
  app/today/_lib/WeightContext.tsx → app/_lib/AuthContext.tsx
- `WorkoutSessionProvider()` --calls--> `useAuth()`  [EXTRACTED]
  app/today/_lib/WorkoutSessionContext.tsx → app/_lib/AuthContext.tsx
- `ExerciseSetCardProps` --references--> `CompletedSet`  [EXTRACTED]
  app/allenamento/_components/ExerciseSetCard.tsx → app/today/_lib/types.ts

## Import Cycles
- None detected.

## Communities (23 total, 8 thin omitted)

### Community 0 - "PlanContext.tsx"
Cohesion: 0.08
Nodes (38): CartItem, CompositionCart(), CompositionCartProps, ExerciseBrowser(), ExerciseBrowserProps, CartItem, ComponiPage(), ExercisePicker() (+30 more)

### Community 1 - "useUser"
Cohesion: 0.15
Nodes (21): GoalsForm(), ProfileForm(), StatsCard(), WeightHistoryChart(), ProfilePage(), KcalWeekChart(), PersonalRecordsCard(), Range (+13 more)

### Community 2 - "WorkoutSessionContext.tsx"
Cohesion: 0.09
Nodes (36): ExerciseSetCard(), ExerciseSetCardProps, Mode, PRToast(), RestPresetPicker(), RestPresetPickerProps, playBeep(), PRESETS (+28 more)

### Community 3 - "SettingsContext.tsx"
Cohesion: 0.12
Nodes (17): AppearanceSection(), LanguageSection(), NotificationsSection(), ResetSection(), Toggle(), ToggleProps, UnitsSection(), defaultSettings (+9 more)

### Community 4 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 5 - "layout.tsx"
Cohesion: 0.11
Nodes (15): AppShell(), BottomNav(), items, ServiceWorker(), items, Sidebar(), metadata, viewport (+7 more)

### Community 6 - "types.ts"
Cohesion: 0.11
Nodes (25): categoryLabels, FoodPicker(), FoodPickerProps, dailyKcalHistory, defaultGoals, defaultProfile, foodDatabase, kcalGoal (+17 more)

### Community 7 - "dependencies"
Cohesion: 0.08
Nodes (23): lucide-react, next, dependencies, lucide-react, next, react, react-dom, recharts (+15 more)

### Community 8 - "volumeStats.ts"
Cohesion: 0.25
Nodes (12): muscleColors, periodLabels, VolumeChart(), isoDaysAgo(), logsInPeriod(), logVolume(), muscleByExerciseId, MuscleVolume (+4 more)

### Community 9 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+9 more)

### Community 21 - "DiaryContext.tsx"
Cohesion: 0.19
Nodes (14): FoodDiary(), FoodDiaryProps, Totals, NutritionPage(), MacroDonut(), NutritionCard(), calcNutrients(), DailyKcal (+6 more)

### Community 22 - "Web Interface Guidelines"
Cohesion: 0.40
Nodes (4): Guidelines Source, How It Works, Usage, Web Interface Guidelines

## Knowledge Gaps
- **100 isolated node(s):** `items`, `items`, `AuthContext`, `Mode`, `RestPresetPickerProps` (+95 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supabase` connect `layout.tsx` to `PlanContext.tsx`, `useUser`, `WorkoutSessionContext.tsx`, `SettingsContext.tsx`, `types.ts`, `DiaryContext.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `layout.tsx` to `PlanContext.tsx`, `useUser`, `WorkoutSessionContext.tsx`, `SettingsContext.tsx`, `types.ts`, `DiaryContext.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `useUser()` connect `useUser` to `DiaryContext.tsx`, `types.ts`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `items`, `items`, `AuthContext` to the rest of the system?**
  _100 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `PlanContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07896575821104122 - nodes in this community are weakly interconnected._
- **Should `useUser` be split into smaller, more focused modules?**
  _Cohesion score 0.14761904761904762 - nodes in this community are weakly interconnected._
- **Should `WorkoutSessionContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09178743961352658 - nodes in this community are weakly interconnected._