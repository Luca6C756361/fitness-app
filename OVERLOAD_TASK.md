# Task — Sviluppatore 2: Motore di Sovraccarico Progressivo (Logica & Supabase)

Istruzioni operative per Claude sul repo `fitness-app` (Next.js 16.2.12, React 19, Tailwind 4, Supabase, lucide-react, recharts).

---

## 0. Contesto tecnico rilevato nel repo

| Cosa | Dove | Vincolo che ne deriva |
|---|---|---|
| `CompletedSet { reps, weights: number[], restSeconds? }` — **un peso per ogni ripetizione**, non un peso per set | `app/today/_lib/types.ts` | L'algoritmo non può leggere `set.weight`: deve ricavare il carico di lavoro dall'array `weights` (set piramidali già supportati). |
| `CompletedExercise { exerciseId, name, sets }` e `DetailedWorkoutLog { id: string, date, sessionName, durationSeconds, exercises }` | `app/today/_lib/types.ts` | Lo storico è **già tipizzato**: nessun tipo nuovo per i log. Si aggiunge solo il tipo del *suggerimento*. |
| `PlannedExercise.suggestedWeight?: number` — **campo già dichiarato e mai usato in tutto il repo** | `app/today/_lib/types.ts:120` | È il campo di destinazione del suggerimento di carico. Nessuna migrazione, nessun tipo nuovo lato scheda. |
| `SessionEditor.handleSave()` costruisce `cleaned: PlannedExercise[]` con **solo** `id, exerciseId, sets, reps, notes` | `app/scheda/_components/SessionEditor.tsx:121-128` | ⚠️ Oggi `suggestedWeight` verrebbe **silenziosamente scartato al salvataggio**. Va aggiunto a `cleaned`, altrimenti la feature non persiste. |
| `useWorkoutSession()` espone già `logs: DetailedWorkoutLog[]` (ultimi 200, `order date desc`) + `records: ExerciseRecord[]` + `loading` | `app/today/_lib/WorkoutSessionContext.tsx:41-55, 106-135` | Lo storico è **già in memoria lato client**: il motore non deve fare nessuna nuova query Supabase. |
| `WorkoutSessionProvider` avvolge tutta l'app (dentro `PlanProvider`) | `app/layout.tsx:50-52` | `SessionEditor` (in `/scheda`) può chiamare `useWorkoutSession()` **senza toccare i provider**. |
| `setVolume(set)`, `logsInPeriod(logs, days, offset)`, `logVolume` | `app/today/_lib/volumeStats.ts` | Sono le stesse funzioni che alimentano `VolumeChart`. Riusare `setVolume`, non riscriverlo. |
| `setMaxWeight(set)`, `setE1RM(set)` (Epley generalizzata ai piramidali), `recordForExercise(logs, exerciseId, extraSets, name)`, `buildAllRecords` | `app/today/_lib/prStats.ts` | Sono le stesse funzioni che alimentano `PersonalRecordsCard`. `setMaxWeight` e `setE1RM` sono la base del motore: **importarle, non duplicarle**. |
| `exerciseDatabase` con `equipment: "bilanciere" \| "manubri" \| "cavi" \| "macchina" \| "corpo-libero" \| "kettlebell" \| "elastici"` | `app/today/_lib/exerciseData.ts` | L'incremento di carico **dipende dall'attrezzo**: +2.5 kg su bilanciere non ha senso su elastici o corpo libero. |
| `getExerciseDef(id)` esposto da `usePlan()` | `app/today/_lib/PlanContext.tsx:144` | Il lookup attrezzatura passa da qui, non da un import diretto di `exerciseDatabase` nei componenti. |
| `supabase` = `createBrowserClient` da `@supabase/ssr`, singleton | `app/_lib/supabase/client.ts` | Client-side. Qualsiasi query nuova gira nel browser e dipende dalla RLS. |
| `AGENTS.md`: "This is NOT the Next.js you know" | root | Ogni prompt include l'obbligo di leggere `node_modules/next/dist/docs/` prima di scrivere route handler o config. |

### Schema Supabase coinvolto (ricavato dalle query nel repo — nel repo non esiste un file `.sql`)

| Tabella | Colonne usate dal codice | Note per questo task |
|---|---|---|
| `workout_logs` | `id` (uuid, generato dal DB), `user_id`, `date` (date, ISO `YYYY-MM-DD`), `session_name` (text), `duration_seconds` (numeric → castato con `Number()`), `exercises` (**jsonb**, array di `CompletedExercise`) | Unica fonte dello storico. `exercises` è jsonb: **ogni analisi per esercizio è già in RAM, non filtrabile efficientemente in SQL** senza un indice GIN o una vista. |
| `active_sessions` | `user_id` (PK), `data` (jsonb, `ActiveSession`) | Sessione in corso, upsert fire-and-forget. Non serve al motore (i set in corso arrivano da `active` nel context). |
| `profiles` | `id`, `plan` (**jsonb**, `WeeklyPlan` intero) | Qui finisce `suggestedWeight`: si scrive riscrivendo l'intero `plan` via `persistPlan` → `updateSession`. Nessuna colonna nuova. |
| `weight_entries`, `diary_entries` | — | Non coinvolte. |

⚠️ `WorkoutSessionContext.tsx:109` fa `select` su `workout_logs` **senza `.eq("user_id", user.id)`**, affidandosi alla RLS. È il pattern esistente: se aggiungi query, filtra esplicitamente per `user_id` e non replicare l'omissione.

### Le 3 decisioni architetturali da rispettare

1. **Zero nuove query Supabase. Il motore è puro e sincrono.** `logs` è già caricato una volta sola all'avvio da `WorkoutSessionContext` (200 righe, `date desc`, `exercises` jsonb incluso): un suggerimento per esercizio è un calcolo in RAM. Fare `supabase.from("workout_logs").select(...)` per ogni esercizio della sessione sarebbe un **N+1 sulla rete** dentro un modale — latenza percepita di centinaia di ms e rate limit inutile. Il motore vive in un file puro (`progressionStats.ts`, zero import React, zero import Supabase) esattamente come `prStats.ts` e `volumeStats.ts`.
2. **Un solo passaggio sui log, indicizzato, memoizzato.** L'analisi costruisce **una volta** una `Map<exerciseId, ExercisePerformance[]>` scorrendo i log — O(numero di set totali) — e poi risponde a ogni esercizio in O(1). Va calcolata in un `useMemo` con deps `[logs]` a livello del componente, **mai dentro il `.map()` della lista esercizi** (sarebbe O(n·m) a ogni battuta di tastiera nel form, e `SessionEditor` ri-renderizza a ogni `setState`).
3. **Progressione doppia (reps prima, carico poi), con incremento dipendente dall'attrezzo e fallback esplicito.** Non si suggerisce mai un carico senza storico: senza dati il motore ritorna un esito `"none"` e la UI resta identica a oggi. Il limite di 200 log e la finestra di analisi (ultime 4 prestazioni dell'esercizio, max 120 giorni) sono costanti esportate, così il giorno in cui servirà una RPC lato Postgres il contratto della funzione non cambia.

### Librerie da installare

**Nessuna.** Il motore è TypeScript puro; le icone (`TrendingUp`, `Sparkles`, `Check`, `Info`) sono già in `lucide-react`. Non installare librerie di statistica, non aggiungere un test runner al `package.json` (le verifiche girano con `npx --yes tsx` in un file temporaneo, poi cancellato).

---

## MICRO-PROMPT 1 — Motore puro: `progressionStats.ts`

Copia da qui:

```
Lavora sul repo fitness-app. Task: motore di sovraccarico progressivo, livello logico. NON toccare nessun componente UI, nessun context, nessuna query Supabase in questo step.

Leggi prima questi tre file e riusali, non duplicarli:
 - app/today/_lib/types.ts        (CompletedSet, CompletedExercise, DetailedWorkoutLog, Equipment, PlannedExercise)
 - app/today/_lib/prStats.ts      (setMaxWeight, setE1RM — esportate, generalizzate ai set piramidali)
 - app/today/_lib/volumeStats.ts  (setVolume)

Crea app/today/_lib/progressionStats.ts. Vincoli: nessun import di React, di next/*, di supabase. File puro e testabile, stesso stile di prStats.ts (commenti in italiano, funzioni esportate singolarmente).

1) Costanti esportate:
   export const MAX_SESSIONS_ANALYZED = 4;   // ultime N prestazioni dell'esercizio
   export const MAX_HISTORY_DAYS = 120;      // oltre questa età il dato è considerato stale
   export const STALL_SESSIONS = 3;          // sessioni consecutive senza progresso = stallo
   export const REP_RANGE_TOP = 2;           // reps target + 2 = tetto prima di alzare il carico
   export const DELOAD_FACTOR = 0.9;         // -10% in caso di stallo

   /** Incremento minimo realistico in palestra, per attrezzo (kg). */
   export const WEIGHT_STEP: Record<Equipment, number> = {
     bilanciere: 2.5,     // coppia di dischi da 1.25
     manubri: 2,          // salto tipico della rastrelliera
     macchina: 2.5,
     cavi: 2.5,
     kettlebell: 4,       // taglie discrete: 16 → 20 → 24
     "corpo-libero": 0,   // 0 = progressione SOLO a ripetizioni
     elastici: 0,
   };

2) Tipi esportati:
   export interface ExercisePerformance {
     date: string;          // ISO YYYY-MM-DD, dal log
     sets: number;          // numero di set eseguiti quel giorno
     workWeight: number;    // carico di lavoro del giorno (vedi 4)
     topWeight: number;     // max(setMaxWeight) del giorno
     minReps: number;       // reps del set peggiore (il collo di bottiglia)
     totalVolume: number;   // somma di setVolume sui set del giorno
     e1rm: number;          // max(setE1RM) del giorno
   }

   export type SuggestionKind = "weight" | "reps" | "hold" | "deload" | "none";

   export interface ProgressionSuggestion {
     exerciseId: string;
     kind: SuggestionKind;
     /** Carico consigliato per il prossimo allenamento (kg). undefined se kind è "reps"/"none". */
     nextWeight?: number;
     /** Ripetizioni consigliate. undefined se il suggerimento non tocca le reps. */
     nextReps?: number;
     /** Delta rispetto all'ultima prestazione, per la label ("+2.5", "+1"). */
     delta: number;
     /** Frase pronta per la UI, in italiano, max ~90 caratteri. */
     reason: string;
     confidence: "alta" | "media" | "bassa";
     /** Ultima prestazione usata per il calcolo (null se assente). */
     last: ExercisePerformance | null;
     sessionsAnalyzed: number;
   }

3) export function buildPerformanceIndex(logs: DetailedWorkoutLog[], today = new Date()): Map<string, ExercisePerformance[]>
   - un solo passaggio su logs → exercises → sets
   - scarta i log con date più vecchia di MAX_HISTORY_DAYS rispetto a `today` (confronto tra stringhe ISO, come fa logsInPeriod in volumeStats.ts)
   - scarta gli esercizi senza set
   - per ogni (exerciseId, date) produce UNA ExercisePerformance aggregata
   - ordina ogni array per date DESCRESCENTE (più recente in testa) e tronca a MAX_SESSIONS_ANALYZED
   - `today` come parametro con default: serve per i test deterministici, non chiamare new Date() dentro il loop

4) export function workWeightOf(sets: CompletedSet[]): number
   - "carico di lavoro" = il peso su cui l'utente ha davvero lavorato, robusto ai set di riscaldamento e ai piramidali
   - implementazione: calcola setMaxWeight (da prStats) per ogni set, scarta gli 0 (corpo libero), poi prendi la MODA (valore più frequente); a parità di frequenza vince il peso più alto; se non c'è nessun peso > 0 ritorna 0
   - NON usare la media: un set di riscaldamento a 20 kg dopo tre set a 60 kg falserebbe tutto

5) export function suggestProgression(
     history: ExercisePerformance[] | undefined,
     opts: { exerciseId: string; equipment: Equipment; targetSets: number; targetReps: number }
   ): ProgressionSuggestion

   Logica, nell'ordine esatto (prima regola che matcha, vince):

   a) history vuoto/undefined → kind "none", delta 0, confidence "bassa", last null,
      reason "Nessuno storico: completa un allenamento per ricevere un suggerimento."

   b) Esercizio senza carico (WEIGHT_STEP[equipment] === 0 oppure last.workWeight === 0):
      - se last.minReps >= targetReps → kind "reps", nextReps = targetReps + 1, delta 1,
        reason `Ultima volta ${last.sets}×${last.minReps} completate: prova ${targetReps + 1} ripetizioni.`
      - altrimenti → kind "hold", nextReps = targetReps, delta 0,
        reason "Consolida: chiudi tutti i set al target prima di aumentare."

   c) STALLO — le ultime STALL_SESSIONS prestazioni (se ce ne sono almeno STALL_SESSIONS) hanno lo stesso workWeight (tolleranza 0.01) e minReps non crescente:
      → kind "deload", nextWeight = roundToStep(last.workWeight * DELOAD_FACTOR, step),
        delta = nextWeight - last.workWeight (negativo), confidence "alta",
        reason `Fermo a ${last.workWeight} kg da ${STALL_SESSIONS} sessioni: scarica a ${nextWeight} kg e risali.`

   d) PROGRESSIONE DI CARICO — last.sets >= targetSets E last.minReps >= targetReps + REP_RANGE_TOP:
      → kind "weight", nextWeight = last.workWeight + step, nextReps = targetReps, delta = step,
        reason `${last.sets}×${last.minReps} a ${last.workWeight} kg: sali a ${nextWeight} kg tornando a ${targetReps} reps.`

   e) PROGRESSIONE DI RIPETIZIONI — last.sets >= targetSets E last.minReps >= targetReps:
      → kind "reps", nextReps = last.minReps + 1, nextWeight = last.workWeight, delta = 1,
        reason `Tutti i set chiusi a ${last.workWeight} kg: aggiungi 1 ripetizione (${last.minReps + 1}).`

   f) altrimenti → kind "hold", nextWeight = last.workWeight, nextReps = targetReps, delta 0,
      reason `Ripeti ${targetSets}×${targetReps} a ${last.workWeight} kg: obiettivo non ancora chiuso.`

   confidence: "alta" se history.length >= 3, "media" se 2, "bassa" se 1.
   sessionsAnalyzed = history.length.

6) export function roundToStep(value: number, step: number): number
   - arrotonda al multiplo di step più vicino, minimo `step` (mai 0 o negativo), 1 decimale max
   - se step === 0 ritorna Math.round(value * 10) / 10

7) Helper di comodo, unica funzione che la UI chiamerà:
   export function suggestFromLogs(
     logs: DetailedWorkoutLog[],
     opts: { exerciseId: string; equipment: Equipment; targetSets: number; targetReps: number }
   ): ProgressionSuggestion
   → buildPerformanceIndex + suggestProgression. Documenta nel JSDoc che per liste di esercizi va usato buildPerformanceIndex UNA volta e poi suggestProgression per ciascuno (evita di riscorrere i log n volte).

8) Verifica, obbligatoria prima di dichiarare finito:
   - npx tsc --noEmit && npm run lint  → zero errori
   - crea un file temporaneo scripts/progression.check.ts che costruisce log finti in memoria (nessuna rete, nessun Supabase) e stampa un OK/FAIL per ciascuno di questi casi:
     1. storico vuoto → kind "none"
     2. 3 set × 12 reps a 40 kg, target 3×10 → kind "weight", nextWeight 42.5 (bilanciere), nextReps 10
     3. 3 set × 10 reps a 40 kg, target 3×10 → kind "reps", nextReps 11
     4. 2 set × 8 reps a 40 kg, target 3×10 → kind "hold"
     5. 3 sessioni consecutive a 60 kg con minReps 8, 8, 8, target 3×10 → kind "deload", nextWeight 55 (roundToStep(54, 2.5))
     6. push-up (corpo-libero), 3×15 con weights tutti 0, target 3×12 → kind "reps", nessun nextWeight
     7. set piramidale weights [60,60,50,50] → workWeightOf === 60 (moda, non media)
     8. log più vecchio di 120 giorni → escluso dall'indice (kind "none")
   - eseguilo con: npx --yes tsx scripts/progression.check.ts
   - incolla l'output nel riepilogo, poi CANCELLA scripts/progression.check.ts e verifica che `git status` non lo mostri più.
```

---

## MICRO-PROMPT 2 — Hook `useProgression` + componente `ProgressionHint`

```
Lavora sul repo fitness-app. Task: esporre il motore alla UI. NON modificare ancora SessionEditor, non toccare Supabase, non aggiungere provider.

A) Crea app/today/_lib/useProgression.ts ("use client"):

   export function useProgression() {
     const { logs, loading } = useWorkoutSession();   // da ./WorkoutSessionContext
     const { getExerciseDef } = usePlan();            // da ./PlanContext
     const index = useMemo(() => buildPerformanceIndex(logs), [logs]);
     const suggestFor = useCallback((exerciseId, targetSets, targetReps) => { ... }, [index, getExerciseDef]);
     return { suggestFor, loading, hasHistory: index.size > 0 };
   }

   Requisiti:
   - firma esatta: suggestFor(exerciseId: string, targetSets: number, targetReps: number): ProgressionSuggestion
   - l'equipment si ricava con getExerciseDef(exerciseId)?.equipment ?? "macchina" (default prudente: incremento 2.5)
   - l'indice si costruisce UNA sola volta per cambio di `logs`. Se scrivi buildPerformanceIndex dentro suggestFor, hai sbagliato: rifallo.
   - nessun useState, nessun useEffect, nessuna fetch. L'hook è derivazione pura.
   - se loading è true, suggestFor deve comunque ritornare un oggetto valido con kind "none" (la UI non deve gestire undefined).

B) Crea app/scheda/_components/ProgressionHint.tsx ("use client"):

   interface ProgressionHintProps {
     suggestion: ProgressionSuggestion;
     onApply: (s: ProgressionSuggestion) => void;
   }

   - kind "none" → renderizza null. Zero rumore visivo per chi non ha ancora storico.
   - kind "hold" → riga informativa NON cliccabile: icona Info (h-3 w-3), testo text-[11px] text-emerald-800/60, nessun bottone.
   - kind "weight" | "reps" → bottone cliccabile a piena larghezza:
       icona TrendingUp, label bold con il delta (`+2.5 kg → 42.5 kg` oppure `+1 rep → 11`),
       sotto il campo `reason` in text-[10px], e a destra una pill con la confidence
       ("alta" emerald-100/emerald-700, "media" amber-50/amber-700, "bassa" emerald-50/emerald-800/60).
       Stile coerente col resto: rounded-lg, bg-emerald-50 hover:bg-emerald-100, px-2.5 py-1.5, transition.
   - kind "deload" → stessa struttura ma palette ambra (bg-amber-50, text-amber-800), icona TrendingDown.
   - onApply(suggestion) al click. Il componente NON muta nulla da solo: è controllato dal padre.
   - accessibilità: type="button", aria-label esplicito che ripete la reason.
   - Nessun import di Supabase, nessun useWorkoutSession qui dentro: la suggestion arriva per prop (così il componente resta riusabile anche in /allenamento).

C) Verifica: npx tsc --noEmit && npm run lint. Nessun test manuale in questo step: il componente non è ancora montato da nessuna parte, ed è corretto così.
```

---

## MICRO-PROMPT 3 — Integrazione in `SessionEditor` e persistenza

```
Lavora sul repo fitness-app. Task: collegare il motore di sovraccarico all'editor sessione. Non cambiare le props di SessionEditor/SessionList, non cambiare la firma di updateSession/createSession, non aggiungere colonne su Supabase.

A) app/scheda/_components/SessionEditor.tsx

  1. EditableExercise: aggiungi il campo mancante ereditandolo già da PlannedExercise (suggestedWeight?: number). Non ridichiararlo.

  2. In cima al componente:
       const { suggestFor } = useProgression();
     È sicuro: WorkoutSessionProvider avvolge l'intera app in app/layout.tsx, sopra la pagina /scheda.

  3. Dentro il .map() della lista esercizi, per ogni riga:
       const suggestion = suggestFor(ex.exerciseId, ex.sets, ex.reps);
     e sotto i controlli Set/Reps renderizza:
       <ProgressionHint suggestion={suggestion} onApply={applySuggestion(ex.id)} />
     ATTENZIONE: suggestFor è O(1) (l'indice è memoizzato nell'hook), quindi chiamarlo nel map è corretto. NON avvolgere ogni riga in un useMemo: violeresti le regole degli hook dentro un map.

  4. applySuggestion(exerciseId) → (s: ProgressionSuggestion) => void:
       - kind "weight" | "deload" → updateEx(exerciseId, { suggestedWeight: s.nextWeight, reps: s.nextReps ?? ex.reps })
       - kind "reps"             → updateEx(exerciseId, { reps: s.nextReps!, suggestedWeight: s.nextWeight })
       - kind "hold" | "none"    → no-op
       Nessun salvataggio automatico: la modifica resta nel form finché l'utente non preme "Salva modifiche". È il comportamento già in vigore per set/reps/note, non cambiarlo.

  5. ⚠️ PUNTO CRITICO — handleSave(): oggi `cleaned` ricostruisce PlannedExercise a mano e NON copia suggestedWeight, quindi il valore verrebbe perso al salvataggio. Aggiungi, con lo stesso stile condizionale già usato per le note:
       ...(typeof e.suggestedWeight === "number" && e.suggestedWeight > 0
            ? { suggestedWeight: e.suggestedWeight }
            : {}),
     Verifica leggendo il file che la riga finisca DENTRO l'oggetto mappato, non dopo.

  6. Se ex.suggestedWeight è valorizzato, mostra accanto agli stepper una pill statica "Carico 42.5 kg" (bg-teal-50 text-teal-700, text-[10px] font-bold uppercase) con una X per azzerarlo → updateEx(ex.id, { suggestedWeight: undefined }).

B) Nessuna modifica a PlanContext. `updateSession`/`createSession` serializzano l'intero WeeklyPlan nel jsonb `profiles.plan`: un campo opzionale in più passa così com'è, esattamente come è successo con `notes`. Non scrivere migrazioni SQL.

C) Facoltativo (fallo solo se A e B passano tsc e lint):
   in app/allenamento/_components/ExerciseSetCard.tsx aggiungi una prop opzionale `suggestedWeight?: number` e, se presente, precompila l'input peso in modalità "simple" con quel valore (solo come defaultValue del primo set, l'utente deve poterlo sovrascrivere). Il valore arriva da todaySession.exercises[i].suggestedWeight in app/allenamento/page.tsx, con lo stesso pattern già usato per `plannedNote`.

D) Verifica finale, obbligatoria prima di dichiarare il task chiuso:
   - npx tsc --noEmit && npm run lint  → zero errori
   - npm run build deve passare
   - Flusso manuale, in quest'ordine:
       1. utente senza storico → apri /scheda → Modifica sessione: nessun hint visibile, il modale è identico a prima (regressione zero)
       2. esegui un allenamento completo su /allenamento (es. 3 set × 12 reps a 40 kg su un esercizio con target 3×10) e termina la sessione
       3. torna su /scheda → Modifica sessione: sull'esercizio compare "+2.5 kg → 42.5 kg"
       4. clicca il suggerimento → compare la pill "Carico 42.5 kg" e le reps tornano a 10
       5. "Salva modifiche" → RICARICA LA PAGINA → riapri l'editor: la pill è ancora lì (prova che suggestedWeight è finito nel jsonb profiles.plan)
       6. in Supabase, tabella profiles, ispeziona la colonna plan: l'esercizio deve contenere "suggestedWeight": 42.5
       7. DevTools → Network durante l'apertura del modale: ZERO richieste nuove verso Supabase (prova che il motore lavora sui log già in memoria)
   - Riporta l'esito dei 7 punti nel riepilogo.
```

---

## Note di attenzione da tenere d'occhio in review

- **Limite di 200 log.** `WorkoutSessionContext` carica `.limit(200)` senza paginazione. Con 4 allenamenti a settimana sono ~12 mesi di storico: abbondante per una finestra di 120 giorni. Se il limite scende o la frequenza sale, il motore vede solo la coda recente — accettabile per design (i dati vecchi non devono guidare il carico di oggi), ma va ricordato prima di aumentare `MAX_HISTORY_DAYS`.
- **`workWeight` come moda, non come media.** È la scelta che regge i set di riscaldamento e i piramidali. Il caso che rompe l'euristica è il "reverse pyramid" (60, 55, 50 senza ripetizioni): nessuna moda, vince il peso più alto. Se diventa un pattern d'uso reale, il fix è aggregare per set e non per giorno.
- **Il suggerimento non conosce l'RPE.** Con soli reps e carico non si distingue un 3×10 chiuso a fatica da uno chiuso agevolmente: la regola "reps prima, carico poi" è la protezione contro l'incremento troppo aggressivo. Aggiungere un campo `rpe?: number` a `CompletedSet` è retrocompatibile (jsonb) e sarebbe il primo upgrade sensato del motore.
- **Deload a -10%.** È una regola conservativa, non una prescrizione. Il messaggio la presenta come proposta e non si applica mai da solo: nessun click, nessuna modifica.
- **Se un giorno serve spostare l'analisi su Postgres** (storico enorme, o suggerimenti calcolati anche server-side): la strada è una RPC `progression_for_exercise(user_id, exercise_id)` con un indice GIN su `workout_logs.exercises`, non una query per esercizio dal browser. Il contratto di `suggestProgression` resta identico: cambia solo chi produce l'array di `ExercisePerformance`.
- **Nessun impatto su `VolumeChart` / `PersonalRecordsCard`.** Il motore importa da `volumeStats.ts` e `prStats.ts` senza modificarli. Se un prompt ti porta a editare quei due file, ti sei allontanato dal task: fermati e rivedi.

## Riferimenti nel repo

- `app/today/_lib/types.ts` — `CompletedSet`, `CompletedExercise`, `DetailedWorkoutLog`, `PlannedExercise.suggestedWeight`, `Equipment`
- `app/today/_lib/prStats.ts` — `setMaxWeight`, `setE1RM`, `recordForExercise` (alimenta `PersonalRecordsCard`)
- `app/today/_lib/volumeStats.ts` — `setVolume`, `logsInPeriod` (alimenta `VolumeChart`)
- `app/today/_lib/WorkoutSessionContext.tsx` — caricamento `logs` da `workout_logs`, `finishSession`, `records`
- `app/today/_lib/PlanContext.tsx` — `persistPlan` → `profiles.plan` (jsonb), `getExerciseDef`
- `app/scheda/_components/SessionEditor.tsx` — `handleSave`/`cleaned` (righe 118-148), punto di integrazione
- `app/layout.tsx` — ordine dei provider (`PlanProvider` → `WorkoutSessionProvider`)
- `AGENTS.md` — obbligo di consultare `node_modules/next/dist/docs/`