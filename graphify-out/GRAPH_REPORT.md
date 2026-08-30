# Graph Report - fitness-app  (2026-08-30)

## Corpus Check
- 77 files · ~30,325 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 387 nodes · 740 edges · 22 communities (14 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5c834fb1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types.ts
- UserContext.tsx
- WorkoutSessionContext.tsx
- SettingsContext.tsx
- compilerOptions
- layout.tsx
- DiaryContext.tsx
- dependencies
- allenamento/page.tsx
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
- `WorkoutSessionProvider()` --calls--> `useAuth()`  [EXTRACTED]
  app/today/_lib/WorkoutSessionContext.tsx → app/_lib/AuthContext.tsx
- `ExerciseSetCardProps` --references--> `CompletedSet`  [EXTRACTED]
  app/allenamento/_components/ExerciseSetCard.tsx → app/today/_lib/types.ts
- `CartItem` --inherits--> `PlannedExercise`  [EXTRACTED]
  app/allenamento/componi/_components/CompositionCart.tsx → app/today/_lib/types.ts
- `ExerciseBrowserProps` --references--> `ExerciseDefinition`  [EXTRACTED]
  app/allenamento/componi/_components/ExerciseBrowser.tsx → app/today/_lib/types.ts

## Import Cycles
- None detected.

## Communities (22 total, 8 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.08
Nodes (37): CartItem, CompositionCart(), CompositionCartProps, ExerciseBrowser(), ExerciseBrowserProps, CartItem, ComponiPage(), ExercisePicker() (+29 more)

### Community 1 - "UserContext.tsx"
Cohesion: 0.10
Nodes (37): AuthContext, supabase, GoalsForm(), ProfileForm(), StatsCard(), WeightHistoryChart(), ProfilePage(), KcalWeekChart() (+29 more)

### Community 2 - "WorkoutSessionContext.tsx"
Cohesion: 0.08
Nodes (41): ExerciseSetCard(), ExerciseSetCardProps, Mode, PRToast(), AllenamentoPage(), PersonalRecordsCard(), muscleColors, periodLabels (+33 more)

### Community 3 - "SettingsContext.tsx"
Cohesion: 0.12
Nodes (17): AppearanceSection(), LanguageSection(), NotificationsSection(), ResetSection(), Toggle(), ToggleProps, UnitsSection(), defaultSettings (+9 more)

### Community 4 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 5 - "layout.tsx"
Cohesion: 0.10
Nodes (18): AppShell(), BottomNav(), items, ServiceWorker(), items, Sidebar(), metadata, viewport (+10 more)

### Community 6 - "DiaryContext.tsx"
Cohesion: 0.14
Nodes (20): FoodDiary(), FoodDiaryProps, Totals, categoryLabels, FoodPicker(), FoodPickerProps, NutritionPage(), MacroDonut() (+12 more)

### Community 7 - "dependencies"
Cohesion: 0.08
Nodes (23): lucide-react, next, dependencies, lucide-react, next, react, react-dom, recharts (+15 more)

### Community 8 - "allenamento/page.tsx"
Cohesion: 0.25
Nodes (9): RestPresetPicker(), RestPresetPickerProps, playBeep(), PRESETS, RestTimer(), RestTimerProps, formatTime(), SessionTimer() (+1 more)

### Community 9 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+9 more)

### Community 21 - "DESIGN.md"
Cohesion: 0.05
Nodes (37): Border Radius Scale, Brand & Accent, Breakpoints, Buttons, Cards & Containers, Category Accents (sport / collection chips), Collapsing Strategy, Colors (+29 more)

## Knowledge Gaps
- **127 isolated node(s):** `items`, `items`, `AuthContext`, `Mode`, `RestPresetPickerProps` (+122 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supabase` connect `UserContext.tsx` to `types.ts`, `WorkoutSessionContext.tsx`, `SettingsContext.tsx`, `layout.tsx`, `DiaryContext.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `layout.tsx` to `types.ts`, `UserContext.tsx`, `WorkoutSessionContext.tsx`, `SettingsContext.tsx`, `DiaryContext.tsx`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `useUser()` connect `UserContext.tsx` to `layout.tsx`, `DiaryContext.tsx`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `items`, `items`, `AuthContext` to the rest of the system?**
  _127 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08181818181818182 - nodes in this community are weakly interconnected._
- **Should `UserContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09579100145137881 - nodes in this community are weakly interconnected._
- **Should `WorkoutSessionContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08470588235294117 - nodes in this community are weakly interconnected._