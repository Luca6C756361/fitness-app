# Graph Report - fitness-app  (2026-08-11)

## Corpus Check
- 64 files · ~21,667 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 314 nodes · 577 edges · 18 communities (14 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- types.ts
- UserContext.tsx
- WorkoutSessionContext.tsx
- SettingsContext.tsx
- compilerOptions
- data.ts
- DiaryContext.tsx
- package.json
- layout.tsx
- devDependencies
- WorkoutCard.tsx
- WorkoutContext.tsx
- README.md
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `useUser()` - 21 edges
2. `compilerOptions` - 16 edges
3. `usePlan()` - 15 edges
4. `useSettings()` - 11 edges
5. `Food` - 11 edges
6. `ExerciseDefinition` - 10 edges
7. `WorkoutSession` - 10 edges
8. `useDiary()` - 9 edges
9. `useWeight()` - 9 edges
10. `PlannedExercise` - 7 edges

## Surprising Connections (you probably didn't know these)
- `ExerciseSetCardProps` --references--> `CompletedSet`  [EXTRACTED]
  app/allenamento/_components/ExerciseSetCard.tsx → app/today/_lib/types.ts
- `CartItem` --inherits--> `PlannedExercise`  [EXTRACTED]
  app/allenamento/componi/_components/CompositionCart.tsx → app/today/_lib/types.ts
- `ExerciseBrowserProps` --references--> `ExerciseDefinition`  [EXTRACTED]
  app/allenamento/componi/_components/ExerciseBrowser.tsx → app/today/_lib/types.ts
- `ComponiPage()` --calls--> `usePlan()`  [EXTRACTED]
  app/allenamento/componi/page.tsx → app/today/_lib/PlanContext.tsx
- `AllenamentoPage()` --calls--> `usePlan()`  [EXTRACTED]
  app/allenamento/page.tsx → app/today/_lib/PlanContext.tsx

## Import Cycles
- None detected.

## Communities (18 total, 4 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.09
Nodes (38): CartItem, CompositionCart(), CompositionCartProps, ExerciseBrowser(), ExerciseBrowserProps, CartItem, ComponiPage(), ExercisePicker() (+30 more)

### Community 1 - "UserContext.tsx"
Cohesion: 0.14
Nodes (26): GoalsForm(), ProfileForm(), StatsCard(), WeightHistoryChart(), ProfilePage(), KcalWeekChart(), Range, WeightRangeChart() (+18 more)

### Community 2 - "WorkoutSessionContext.tsx"
Cohesion: 0.10
Nodes (26): ExerciseSetCard(), ExerciseSetCardProps, Mode, RestPresetPicker(), RestPresetPickerProps, playBeep(), PRESETS, RestTimer() (+18 more)

### Community 3 - "SettingsContext.tsx"
Cohesion: 0.12
Nodes (17): AppearanceSection(), LanguageSection(), NotificationsSection(), ResetSection(), Toggle(), ToggleProps, UnitsSection(), defaultSettings (+9 more)

### Community 4 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 5 - "data.ts"
Cohesion: 0.10
Nodes (19): categoryLabels, FoodPickerProps, DiaryEntry, FoodDiaryProps, categoryLabels, FoodPickerProps, dailyKcalHistory, defaultGoals (+11 more)

### Community 6 - "DiaryContext.tsx"
Cohesion: 0.17
Nodes (15): FoodDiary(), FoodDiaryProps, Totals, FoodPicker(), NutritionPage(), MacroDonut(), NutritionCard(), calcNutrients() (+7 more)

### Community 7 - "package.json"
Cohesion: 0.10
Nodes (19): lucide-react, next, dependencies, lucide-react, next, react, react-dom, recharts (+11 more)

### Community 8 - "layout.tsx"
Cohesion: 0.14
Nodes (10): BottomNav(), items, items, Sidebar(), metadata, Home(), items, SettingsProvider() (+2 more)

### Community 9 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+9 more)

### Community 10 - "WorkoutCard.tsx"
Cohesion: 0.28
Nodes (4): Modal(), ModalProps, SessionSwitchModalProps, WorkoutCard()

### Community 11 - "WorkoutContext.tsx"
Cohesion: 0.25
Nodes (7): initialLogs, todayISO(), WorkoutContext, WorkoutContextValue, WorkoutLog, WorkoutProvider(), WorkoutStats

### Community 12 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **101 isolated node(s):** `items`, `items`, `Mode`, `RestPresetPickerProps`, `RestTimerProps` (+96 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useUser()` connect `UserContext.tsx` to `DiaryContext.tsx`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `usePlan()` connect `types.ts` to `WorkoutSessionContext.tsx`, `WorkoutCard.tsx`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `items`, `items`, `Mode` to the rest of the system?**
  _101 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08748114630467571 - nodes in this community are weakly interconnected._
- **Should `UserContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13630229419703105 - nodes in this community are weakly interconnected._
- **Should `WorkoutSessionContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09982174688057041 - nodes in this community are weakly interconnected._
- **Should `SettingsContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11954022988505747 - nodes in this community are weakly interconnected._