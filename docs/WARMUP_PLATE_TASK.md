# Task — Sviluppatore 4: Motore Warm-up Automatico e Plate Calculator Visivo

Istruzioni operative per Claude Code sul repo `fitness-app` (Next.js 16.2.12, React 19, Tailwind 4, Supabase `@supabase/ssr`, lucide-react, recharts).

Due funzionalità matematico-visive per la gestione dei carichi:
1. **Warm-up Engine** — data la serie allenante in kg, genera la rampa di avvicinamento (50/70/85/95%), la registra come set `kind: "warmup"` e la **esclude** dal volume di `volumeStats.ts` e dai record di `prStats.ts`.
2. **Plate Calculator** — modale che calcola e **disegna** i dischi per lato (25/20/15/10/5/2.5/1.25 kg, colori IPF) sottraendo la tara del bilanciere (20 o 15 kg, configurabile).

---

## 0. Contesto tecnico rilevato nel repo

| Cosa | Dove | Vincolo che ne deriva |
|---|---|---|
| `CompletedSet` è **`{ reps: number; weights: number[] }`** — un peso **per ogni ripetizione**, non un peso per set | `app/today/_lib/types.ts`; costruito in `ExerciseSetCard.handleComplete()` come `{ reps: targetReps, weights }` | ⚠️ **Il modello dati non è quello che ci si aspetta.** Il volume di un set è `sum(weights)`, non `reps × weight`. In modalità "Semplice" il componente fa `Array(targetReps).fill(w)`: il peso singolo è già espanso in array. Ogni funzione nuova deve accettare questa forma, non introdurne una seconda. |
| `onCompleteSet(set: CompletedSet)` → `addSet(exIndex, set)` → `active.exercises[i].sets.push(set)` | `ExerciseSetCard.tsx` → `allenamento/page.tsx:handleCompleteSet` → `WorkoutSessionContext` | Il set di warm-up deve entrare **da questo stesso canale**. Non creare un secondo array `warmupSets`: si sdoppierebbe la persistenza, il rollback e il salvataggio su `workout_logs`. |
| `CompletedExercise` salva **`name` inline** ("salvato inline per storico stabile anche se rinomini", `types.ts:165`) e contiene `sets: CompletedSet[]` | `app/today/_lib/types.ts` | I set di warm-up finiscono nello stesso array `sets` dello storico. È questa la ragione per cui l'esclusione dalle statistiche va fatta **in lettura** (`volumeStats`/`prStats`), non in scrittura. |
| `workout_logs.exercises` è una colonna **jsonb** con `CompletedExercise[]`; `active_sessions.data` è jsonb con la sessione in corso | `WorkoutSessionContext`, schema ricavato dalle query (nessun `.sql` versionato nel repo) | ⚠️ **Retrocompatibilità obbligatoria.** Ogni riga già salvata contiene `CompletedSet` **senza** il campo nuovo. Nessuna migration può riscriverle (sono dentro un jsonb annidato). Quindi il campo va aggiunto **opzionale**, e l'assenza deve significare "serie allenante". |
| `progressPct = totalCompleted / totalTargetSets`, con `totalCompleted = Σ ex.sets.length` e `totalTargetSets = Σ ex.targetSets` | `app/allenamento/page.tsx` | ⚠️ Se i set di warm-up finiscono in `sets`, la barra di avanzamento della sessione **supera il 100%** e `isFullyComplete` scatta in anticipo. Va corretto contestualmente, altrimenti la feature rompe il flusso di allenamento. |
| `isFullyDone = completedSets.length >= targetSets` | `app/allenamento/_components/ExerciseSetCard.tsx` | Stesso difetto in scala di card: l'esercizio risulterebbe "completato" dopo 4 riscaldamenti. |
| `volumeStats.ts` espone `logsInPeriod(logs, days, offset?)`, `periodDays`, `totalVolume(logs)`, `volumeByMuscle(logs)`, `type VolumePeriod = "week" \| "month"` | consumato da `app/stats/_components/VolumeChart.tsx` | L'esclusione dei warm-up va messa **dentro** queste funzioni, in un unico punto di filtro. Le firme pubbliche **non cambiano**: `VolumeChart` non va toccato. |
| `prStats.ts` espone `prTypeLabels`, `type PRType = "weight" \| "volume" \| "e1rm"`; i record hanno `{ exerciseId, name, e1rm, maxWeight, bestSetVolume, date }`; `lastPR` ha `{ name, types: PRType[], maxWeight, volume, e1rm, previous }` | consumato da `PersonalRecordsCard.tsx` e `PRToast.tsx` via `useWorkoutSession()` | Un warm-up al 95% di un massimale **non deve** poter generare un PR. Anche qui il filtro va in un punto solo, prima del calcolo, senza cambiare le firme. |
| `useWorkoutSession()` espone `active, startSession, addSet, removeLastSet, cancelSession, finishSession, logs, records, lastPR, dismissPR` | `app/today/_lib/WorkoutSessionContext.tsx` | `addSet` è l'unico ingresso: il warm-up lo riusa. `removeLastSet` deve continuare a funzionare anche sui warm-up (annullamento). |
| `SettingsContext` gestisce `settings.notifications.{water,workout,meals}`, `setSubPref(key, value)`, `resetAll()`; persiste in `profiles.settings` (jsonb) | `app/today/_lib/SettingsContext.tsx`, sezioni in `app/impostazioni/_components/` | Le preferenze bilanciere/dischi vanno **qui**, non in un contesto nuovo: `profiles.settings` è già la sacca jsonb delle preferenze e `resetAll()` è già il punto di azzeramento. |
| `resetAll()` cancella `diary_entries`, `weight_entries`, `workout_logs`, `active_sessions` con `.eq("user_id", ...)` — commento in repo: *"PostgREST rifiuta le DELETE senza filtro"* | `app/today/_lib/SettingsContext.tsx:103-118` | Le nuove preferenze e la loro cache `localStorage` vanno aggiunte a questa lista. |
| `<Modal>` riusabile con `open / onClose / title` | `app/today/_components/Modal.tsx` | Il Plate Calculator riusa **questo** Modal (stesso pattern di `ExercisePicker` e `SessionEditor`). Non introdurre una seconda implementazione di dialog. |
| `public/sw.js` non intercetta Supabase | `public/sw.js:23-30` | Offline le preferenze non si leggono dal DB: serve la cache `localStorage`, come già fatto per gli esercizi custom (`fitness-app:customExercises`). |
| Nel repo **non risulta un test runner configurato** (nessuno script `test` in `package.json`, nessun `vitest.config`/`jest.config`) | root | I motori puri di questo task sono i **primi** candidati a test unitari dell'app. Il micro-prompt 2 impone di verificare `node -v` e scegliere: `node --test --experimental-strip-types` (Node ≥ 22.6, zero dipendenze) oppure `vitest` in devDependencies. Non aggiungere Jest. |
| `recharts` è già in dipendenze e usa SVG | `VolumeChart`, `WeightHistoryChart` | Il disegno dei dischi si fa con **SVG inline scritto a mano**: nessuna libreria di grafica va aggiunta, e recharts non c'entra (non è una libreria di disegno generico). |
| L'app usa colori con opacità sul testo, oggetto della scheda accessibilità (`claude/A11Y_CONTRAST_TASK.md`) | tutta la UI | I nuovi componenti **non devono introdurre nuove `text-*/NN`**: usano i token `text-fg-*` se la scheda accessibilità è già applicata, altrimenti colori pieni. Mai colori con alpha sul testo. |
| `AGENTS.md`: "This is NOT the Next.js you know" | root | Obbligo di leggere `node_modules/next/dist/docs/` prima di toccare config o convenzioni di file. |

### Tipi da estendere

```ts
// app/today/_lib/types.ts — SOLO aggiunte opzionali

/** Natura della serie. Assente = "work": tutti gli storici già salvati lo sono. */
export type SetKind = "work" | "warmup";

export interface CompletedSet {
  reps: number;
  weights: number[];
  kind?: SetKind;        // ← NUOVO, opzionale
  targetLoad?: number;   // ← NUOVO, opzionale: carico bersaglio da cui la rampa è stata generata
}
```

Nuovi tipi, in file separati (nessun import React):

```ts
// app/today/_lib/plateMath.ts
export type PlateKg = 25 | 20 | 15 | 10 | 5 | 2.5 | 1.25;
export type PlateInventory = Record<PlateKg, number>;   // pezzi disponibili PER LATO
export interface PlateSolution {
  perSide: { plate: PlateKg; count: number }[];  // ordine decrescente
  achievable: number;   // carico totale effettivamente componibile, in kg
  requested: number;    // carico richiesto
  leftover: number;     // requested - achievable, 0 se esatto
  exact: boolean;
  belowBar: boolean;    // requested < barWeight
}

// app/today/_lib/warmupEngine.ts
export interface WarmupStep {
  pct: number;          // 0.5 | 0.7 | 0.85 | 0.95
  load: number;         // kg, già arrotondato al componibile
  reps: number;
  plates: PlateSolution;
}
```

---

## Le 4 decisioni architetturali da rispettare

1. **Il campo `kind` è opzionale e l'assenza significa "allenante". Il filtro vive in lettura, non in scrittura.**
   `workout_logs.exercises` è un jsonb annidato: le righe già salvate contengono `CompletedSet` senza `kind` e **non sono migrabili** senza riscrivere ogni riga con una funzione Postgres. Rendere `kind` obbligatorio significherebbe rompere ogni storico esistente al primo `tsc`. Quindi: campo opzionale, e un solo predicato condiviso — `isWorkSet(s) => s.kind !== "warmup"` — esportato da `types.ts` e usato **ovunque** si sommi o si confronti un carico. La conseguenza operativa è che il warm-up viene **salvato** nello storico (utile: l'utente rivede la rampa che ha usato) ma è **invisibile** a `totalVolume`, `volumeByMuscle` e al calcolo dei record. Chi in futuro aggiunge una statistica deve passare da `isWorkSet`, non da un `.filter()` scritto a mano: per questo il predicato sta nei tipi e non dentro `volumeStats`.

2. **Greedy sì, ma con fallback esatto — perché l'inventario limitato rompe il greedy.**
   Su inventario **illimitato** l'algoritmo greedy (prendi sempre il disco più pesante che ci sta) è dimostrabilmente ottimo per la serie IPF: verificato per tutti i carichi da 1.25 a 60 kg/lato a passo 1.25, zero divergenze dal minimo assoluto. Ma appena l'inventario è **limitato** il greedy può incastrarsi: con `20×1, 15×2` per lato e un bersaglio di 30 kg/lato, il greedy prende il 20 e resta con 10 kg non componibili, mentre `15+15` è una soluzione esatta. Non è un caso di laboratorio: è la palestra di casa con due dischi da 15. Quindi: **greedy come primo tentativo** (O(7), istantaneo, e nel 100% dei casi a inventario pieno è già ottimo) e, **solo se lascia un resto**, una DFS esaustiva con potatura sul numero di dischi — lo spazio è ≤ 7 denominazioni × conteggi a una cifra, quindi qualche centinaio di nodi, invisibile. Se nemmeno la DFS trova una soluzione esatta, si restituisce la migliore approssimazione **per difetto** con `exact: false` e `leftover` valorizzato: l'utente deve vedere "componibile 27.5 kg, mancano 2.5", mai un risultato silenziosamente sbagliato.

3. **Tutta l'aritmetica dei carichi si fa in centesimi di kg interi.**
   `82.5 * 0.7` in JavaScript vale `57.74999999999999`, non `57.75`. Un `Math.round(x / 2.5) * 2.5` su quel valore è ancora fortunato, ma la stessa catena applicata dentro il solver — sottrazioni ripetute di `1.25` da un accumulatore float — produce resti come `2.220446049250313e-16` che fanno fallire il confronto `rem === 0` e mandano il calcolatore in "non componibile" su un carico perfettamente valido. Regola: **appena un peso entra in una funzione di calcolo viene convertito in `Math.round(kg * 100)` (centesimi interi), tutta l'aritmetica è su interi, e la conversione a kg avviene solo al `return`.** Nessun confronto `=== 0` su float, nessun `%` su float. Il minimo incremento componibile è `2 × (disco più piccolo disponibile)` — 2.5 kg con i dischi da 1.25, 5 kg senza — e va **calcolato dall'inventario**, non hardcodato: chi ha solo dischi da 5 non deve vedere proposte da 57.5 kg.

4. **Calcolo e disegno sono due file diversi, e il colore non è mai l'unica informazione.**
   `plateMath.ts` e `warmupEngine.ts` sono moduli puri: nessun import di React, nessun accesso a `localStorage`, nessuna lettura di context, funzioni deterministiche input→output. Il rendering (`PlateStack.tsx`) riceve un `PlateSolution` già risolto e si limita a disegnarlo. Questa separazione è ciò che rende i motori testabili senza DOM e riutilizzabili altrove (la rampa serve sia in `/allenamento` sia in `SessionEditor`). Sul disegno vale un vincolo di accessibilità non negoziabile: i colori IPF (25 rosso, 20 blu, 15 giallo, 10 verde, 5 bianco, 2.5 rosso piccolo, 1.25 cromo) **non possono essere l'unico veicolo dell'informazione** (WCAG 1.4.1) — su ogni disco va stampato il numero di kg, ogni disco ha un `<title>` accessibile, e l'SVG intero ha un `role="img"` con `aria-label` testuale del tipo *"Per lato: 1 disco da 25, 1 da 5, 1 da 1.25. Totale 82.5 kg"*. Il bianco e il cromo su fondo chiaro richiedono inoltre un bordo esplicito, altrimenti spariscono.

### Esempio di riferimento (valori verificati)

Target **82.5 kg**, bilanciere **20 kg**, inventario pieno:

| Step | Grezzo | Arrotondato (giù, passo 2.5) | Rip. | Dischi per lato |
|---|---|---|---|---|
| 50% | 41.25 | **40.0 kg** | 8 | 10 |
| 70% | 57.74999999999999 ← *float* | **57.5 kg** | 5 | 15 + 2.5 + 1.25 |
| 85% | 70.125 | **70.0 kg** | 3 | 25 |
| 95% | 78.375 | **77.5 kg** | 1 | 25 + 2.5 + 1.25 |
| **Lavoro** | — | **82.5 kg** | target | 25 + 5 + 1.25 |

---

## MICRO-PROMPT 1 — Data model e tipi TypeScript

Copia da qui:

```
Lavora sul repo fitness-app. Task: SOLO l'estensione del modello dati. Nessun algoritmo, nessun componente, nessuna UI in questo step. Al termine l'app deve comportarsi ESATTAMENTE come adesso e `npm run build` deve passare senza che una sola riga di comportamento sia cambiata.

Leggi prima per intero app/today/_lib/types.ts e app/today/_lib/WorkoutSessionContext.tsx.
Leggi node_modules/next/dist/docs/ prima di toccare convenzioni di file (AGENTS.md).

1) In app/today/_lib/types.ts, SOPRA la definizione di CompletedSet, aggiungi:

   /** Natura di una serie registrata. */
   export type SetKind = "work" | "warmup";

2) Estendi CompletedSet con DUE campi OPZIONALI. Non modificare, non riordinare e non
   rendere obbligatorio nulla di esistente:

   export interface CompletedSet {
     reps: number;
     weights: number[];
     /** Assente = "work". Gli storici già in workout_logs non hanno questo campo. */
     kind?: SetKind;
     /** Carico allenante da cui la rampa è stata generata. Solo sui set warmup. */
     targetLoad?: number;
   }

   ⚠️ NON rendere `kind` obbligatorio e NON mettergli un default nel tipo.
   workout_logs.exercises è jsonb annidato: le righe esistenti non sono migrabili
   e ogni riga già salvata verrebbe invalidata.

3) Sempre in types.ts, subito sotto, esporta i DUE predicati condivisi. Sono l'unico
   punto in cui l'app decide cosa è allenante:

   /** Una serie conta come allenante se NON è esplicitamente un riscaldamento. */
   export function isWorkSet(set: CompletedSet): boolean {
     return set.kind !== "warmup";
   }

   /** Volume di una serie: somma dei pesi per ripetizione (NON reps × peso). */
   export function setVolume(set: CompletedSet): number {
     return set.weights.reduce((sum, w) => sum + w, 0);
   }

   Il commento su setVolume è obbligatorio: CompletedSet.weights ha un peso PER
   RIPETIZIONE (vedi ExerciseSetCard.handleComplete, che fa Array(targetReps).fill(w)),
   e questo è il primo errore che chiunque commette leggendo il tipo.

4) Aggiungi in types.ts i tipi delle preferenze bilanciere, che serviranno al prompt 3:

   export type PlateKg = 25 | 20 | 15 | 10 | 5 | 2.5 | 1.25;
   export type PlateInventory = Record<PlateKg, number>;   // pezzi disponibili PER LATO

   export interface BarbellSettings {
     barWeight: number;              // kg, default 20
     plates: PlateInventory;         // pezzi per lato
   }

   export const DEFAULT_BARBELL: BarbellSettings = {
     barWeight: 20,
     plates: { 25: 4, 20: 4, 15: 2, 10: 4, 5: 4, 2.5: 4, 1.25: 2 },
   };

   DEFAULT_BARBELL va in types.ts e non in un componente: lo leggeranno sia il context
   sia i motori puri sia i test.

5) Verifica prima di dichiarare finito:
   - `npx tsc --noEmit` → zero errori. Se un file esistente ora non compila, il campo
     è stato reso obbligatorio per errore: torna al punto 2.
   - `npm run lint` → zero errori
   - `npm run build` → deve passare
   - `grep -rn "kind" app/today/_lib/WorkoutSessionContext.tsx` → nessun risultato
     (il context non è ancora stato toccato: è corretto)
   - `npm run dev`: completa una serie in /allenamento, termina la sessione, apri /stats →
     volume e record identici a prima. Nessun comportamento è cambiato in questo step.
   - Riporta nel riepilogo l'elenco dei file toccati (deve essere UNO SOLO: types.ts).
```

---

## MICRO-PROMPT 2 — Motori puri e test unitari

```
Lavora sul repo fitness-app. Task: SOLO i due motori di calcolo puri e i loro test. Nessun componente React, nessun context, nessuna UI, nessun import di React o di next/* in questo step.

Prerequisito: il micro-prompt 1 è applicato (SetKind, isWorkSet, setVolume, PlateKg, PlateInventory, BarbellSettings, DEFAULT_BARBELL esistono in types.ts).

REGOLA ARITMETICA NON NEGOZIABILE, valida per entrambi i file:
tutta la matematica si fa in CENTESIMI DI KG INTERI. Ogni peso in ingresso diventa
Math.round(kg * 100), tutte le operazioni sono su interi, la conversione a kg avviene
solo nel return. Motivo concreto: in JavaScript 82.5 * 0.7 === 57.74999999999999, e le
sottrazioni ripetute di 1.25 da un accumulatore float lasciano resti dell'ordine di 1e-16
che fanno fallire il confronto `resto === 0` e dichiarano "non componibile" un carico valido.
Nessun `=== 0` su float, nessun `%` su float, in nessun punto dei due file.

A) Crea app/today/_lib/plateMath.ts. Nessun import tranne i tipi da ./types.

   export const PLATE_ORDER: PlateKg[] = [25, 20, 15, 10, 5, 2.5, 1.25];   // decrescente

   export interface PlateSolution {
     perSide: { plate: PlateKg; count: number }[];   // ordine decrescente, solo count > 0
     achievable: number;   // kg totali effettivamente componibili (bilanciere incluso)
     requested: number;    // kg richiesti
     leftover: number;     // requested - achievable, >= 0
     exact: boolean;       // leftover === 0
     belowBar: boolean;    // requested < barWeight
   }

   /** Minimo incremento componibile = 2 × disco più piccolo DISPONIBILE. Mai hardcodato. */
   export function minIncrement(plates: PlateInventory): number
     - considera solo le denominazioni con count > 0
     - inventario vuoto → ritorna 0

   /** Arrotonda un carico al valore componibile più vicino PER DIFETTO. */
   export function roundToLoadable(kg: number, bar: number, plates: PlateInventory): number
     - se kg <= bar → ritorna bar
     - step = minIncrement(plates); se step === 0 → ritorna bar
     - lavora in centesimi: bar + floor((kg - bar) / step) * step

   /** Risolutore. Greedy, con fallback esatto se il greedy lascia un resto. */
   export function solvePlates(
     targetKg: number,
     bar: number,
     plates: PlateInventory
   ): PlateSolution

     Algoritmo, in quest'ordine:
     1. se targetKg < bar → ritorna { perSide: [], achievable: bar, requested: targetKg,
        leftover: 0, exact: false, belowBar: true }
     2. perSideCents = Math.round((targetKg - bar) * 100) / 2 → se non è intero,
        il target non è simmetrico: arrotonda per difetto al centesimo pari.
     3. GREEDY: scorri PLATE_ORDER, per ogni disco prendi
        min(disponibili, floor(resto / valore)), sottrai. O(7).
     4. se il resto è 0 → soluzione esatta, ritorna.
     5. FALLBACK ESATTO (solo se resto > 0): DFS su PLATE_ORDER con potatura sul numero
        totale di dischi già usati; cerca la combinazione ESATTA con MENO dischi.
        Motivo per cui serve: con inventario { 20: 1, 15: 2 } e bersaglio 30 kg/lato il
        greedy prende il 20 e resta bloccato con 10 kg non componibili, mentre 15+15 è
        una soluzione esatta. Il greedy è ottimo solo a inventario illimitato.
     6. se nemmeno la DFS trova una soluzione esatta → ritorna la MIGLIORE APPROSSIMAZIONE
        PER DIFETTO trovata dal greedy, con exact: false e leftover valorizzato.
        Non arrotondare mai per eccesso: caricare più del richiesto è un rischio fisico.

   /** Etichetta accessibile, per l'aria-label dell'SVG. Nessun colore, solo testo. */
   export function describeSolution(sol: PlateSolution): string
     - es. "Per lato: 1 disco da 25 kg, 1 da 5 kg, 1 da 1,25 kg. Totale 82,5 kg."
     - numeri formattati con toLocaleString("it-IT")
     - se belowBar → "Carico inferiore al bilanciere: solo bilanciere da N kg."
     - se !exact → aggiunge "Non componibile esattamente: mancano N kg."

B) Crea app/today/_lib/warmupEngine.ts. Importa SOLO i tipi e solvePlates/roundToLoadable
   da ./plateMath. Nessun React.

   export const DEFAULT_RAMP = [
     { pct: 0.5,  reps: 8 },
     { pct: 0.7,  reps: 5 },
     { pct: 0.85, reps: 3 },
     { pct: 0.95, reps: 1 },
   ] as const;

   export interface WarmupStep {
     pct: number;
     load: number;      // kg, già arrotondato al componibile
     reps: number;
     plates: PlateSolution;
   }

   export function buildWarmupRamp(
     targetKg: number,
     bar: number,
     plates: PlateInventory,
     ramp: readonly { pct: number; reps: number }[] = DEFAULT_RAMP
   ): WarmupStep[]

     Regole, tutte obbligatorie:
     - percentuale calcolata in centesimi interi: Math.round(targetCents * pct100 / 100)
     - ogni carico passa per roundToLoadable (arrotondamento PER DIFETTO)
     - SCARTA gli step il cui carico risulta <= bar (riscaldare col solo bilanciere è
       già implicito e produrrebbe 4 righe identiche per i carichi bassi)
     - DEDUPLICA gli step che arrotondano allo STESSO carico, tenendo quello con più
       ripetizioni (il primo della rampa)
     - garantisci la MONOTONIA STRETTA: se dopo la deduplica un carico non è maggiore
       del precedente, scartalo
     - se targetKg <= bar → ritorna [] (nessun riscaldamento sensato)
     - ogni step porta il proprio PlateSolution già risolto: la UI non ricalcola nulla

   /** Converte uno step in un CompletedSet pronto per addSet(). */
   export function stepToSet(step: WarmupStep, targetKg: number): CompletedSet
     - { reps: step.reps, weights: Array(step.reps).fill(step.load),
         kind: "warmup", targetLoad: targetKg }
     - la forma `weights` con un peso PER RIPETIZIONE è obbligatoria: è il contratto di
       CompletedSet usato da ExerciseSetCard e da setVolume.

C) Test unitari. PRIMA di scriverli esegui `node -v` e leggi package.json, poi scegli:
   - Node >= 22.6 → nessuna dipendenza: file `*.test.ts` con `node:test` + `node:assert/strict`,
     script in package.json: "test": "node --test --experimental-strip-types app/today/_lib/*.test.ts"
   - Node < 22.6 → aggiungi vitest a devDependencies e "test": "vitest run"
   NON usare Jest in nessun caso. Riporta nel riepilogo quale delle due strade hai preso e perché.

   Crea i test in app/today/_lib/plateMath.test.ts e app/today/_lib/warmupEngine.test.ts.
   Casi OBBLIGATORI, non negoziabili — ognuno esiste perché corrisponde a un bug reale:

   plateMath:
     1. 82.5 kg, bar 20, inventario pieno → per lato [25×1, 5×1, 1.25×1], exact true
     2. 60 kg, bar 20 → per lato [20×1], exact true
     3. 20 kg, bar 20 → perSide vuoto, exact true, belowBar false
     4. 15 kg, bar 20 → belowBar true, achievable 20
     5. ⚠️ CONTROESEMPIO GREEDY: 80 kg, bar 20, inventario { 25:0, 20:1, 15:2, 10:0,
        5:0, 2.5:0, 1.25:0 } → 30 kg per lato → DEVE risolvere [15×2], exact true.
        Un'implementazione solo-greedy restituisce [20×1] con leftover 20: questo test
        è la ragione per cui il fallback esiste.
     6. inventario senza 1.25 → minIncrement === 5; roundToLoadable(57.5, 20, inv) === 55
     7. inventario vuoto → minIncrement 0, roundToLoadable ritorna bar, solvePlates
        ritorna exact false senza lanciare eccezioni
     8. carico non componibile: 100 kg con solo [25×1] per lato → achievable 70,
        leftover 30, exact false, e MAI un achievable superiore al requested
     9. FLOAT: solvePlates(57.75 - 0.00000000001, 20, pieno) deve dare lo stesso
        risultato di solvePlates(57.75, ...). Se fallisce, l'aritmetica non è in centesimi.

   warmupEngine:
     10. target 82.5, bar 20, pieno → 4 step con carichi [40, 57.5, 70, 77.5] e
         ripetizioni [8, 5, 3, 1]. Sono i valori verificati della scheda: se il tuo
         output differisce, è l'implementazione a essere sbagliata, non il test.
     11. target 25, bar 20 → gli step al 50% e 70% cadono sotto il bilanciere e vengono
         scartati; il risultato è strettamente crescente e nessun carico è <= 20
     12. target 20 o inferiore → []
     13. monotonia: per 50 target casuali tra 20 e 300, ogni rampa è strettamente
         crescente, ogni carico è < target, e nessun carico si ripete
     14. stepToSet: weights.length === reps, kind === "warmup", targetLoad === target,
         e setVolume(set) === reps × load

D) Verifica prima di dichiarare finito:
   - `npm test` → tutti i test passano, incluso il caso 5 e il caso 9
   - `npx tsc --noEmit && npm run lint` → zero errori
   - `npm run build` → deve passare
   - `grep -rn "from \"react\"\|from 'react'\|next/" app/today/_lib/plateMath.ts app/today/_lib/warmupEngine.ts`
     → ZERO risultati. I motori devono essere puri.
   - `grep -rn "=== 0\|!== 0" app/today/_lib/plateMath.ts` → ogni occorrenza deve operare
     su una variabile in centesimi interi, non su kg. Verificalo a mano e dichiaralo.
   - Incolla nel riepilogo l'output di `npm test` e i carichi prodotti dal caso 10.
```

---

## MICRO-PROMPT 3 — Preferenze bilanciere e inventario dischi

```
Lavora sul repo fitness-app. Task: SOLO la persistenza delle preferenze bilanciere/dischi e la loro sezione in /impostazioni. Nessun calcolo nuovo (usa minIncrement da plateMath solo per l'anteprima), nessuna modifica ai motori, nessuna modifica a ExerciseSetCard.

Prerequisiti: prompt 1 e 2 applicati (BarbellSettings, DEFAULT_BARBELL, PlateInventory, minIncrement esistono).

Leggi prima per intero app/today/_lib/SettingsContext.tsx: replica il suo stile — guardia
`if (!user) return;`, console.error("[tag]", msg), persistenza su profiles.settings (jsonb),
e il pattern anti-hydration già usato nel repo (stato iniziale statico + idratazione della
cache dentro un useEffect al mount, MAI localStorage nell'inizializzatore di useState).

A) app/today/_lib/SettingsContext.tsx

  1. Estendi la forma di `settings` con una chiave NUOVA e OPZIONALE, accanto a
     `notifications`. Non riorganizzare le chiavi esistenti:
       barbell?: BarbellSettings;
     In lettura usa sempre `settings.barbell ?? DEFAULT_BARBELL`: i profili già salvati
     non hanno la chiave e devono continuare a funzionare senza migration.

  2. Aggiungi la cache localStorage con chiave "fitness-app:barbell", stesso pattern di
     "fitness-app:customExercises": letta in un useEffect al mount, riscritta a ogni
     salvataggio, in try/catch (la quota può essere piena). Motivo: public/sw.js non
     intercetta Supabase, quindi offline le preferenze non arriverebbero dal DB e il
     calcolatore proporrebbe l'inventario di default invece del tuo.

  3. Esponi nel value del context:
       barbell: BarbellSettings                     // già con il fallback applicato
       setBarWeight(kg: number): void               // ammessi solo 20, 15 e 10
       setPlateCount(plate: PlateKg, count: number): void   // clamp 0..10
     Entrambi persistono in modo OTTIMISTICO con rollback sull'errore, come già fa il
     context per le altre preferenze. La UI non deve mai attendere la rete.

  4. In resetAll(), accanto alla riga che rimuove "fitness-app:todayOverride", aggiungi
     localStorage.removeItem("fitness-app:barbell") e riporta `barbell` a DEFAULT_BARBELL
     nello stato. La colonna profiles.settings viene già azzerata dal codice esistente:
     NON aggiungere una nuova DELETE.

B) Crea app/impostazioni/_components/BarbellSection.tsx ("use client"):

   - Struttura identica alle sezioni sorelle (UnitsSection, NotificationsSection):
     `rounded-2xl border border-emerald-900/5 bg-white p-6 shadow-sm`, heading
     `text-xs font-bold uppercase tracking-widest`, icona lucide-react (usa `Dumbbell`).
   - Blocco 1 — Bilanciere: tre chip 20 / 15 / 10 kg, selezione singola.
     Ogni chip ha `aria-pressed`: lo stato non deve essere veicolato dal solo colore.
   - Blocco 2 — Dischi disponibili per lato: una riga per denominazione (25, 20, 15, 10,
     5, 2.5, 1.25) con uno Stepper 0..10. Riusa il pattern dello Stepper già presente in
     app/scheda/_components/SessionEditor.tsx: NON scriverne uno nuovo, e se lo estrai in
     un componente condiviso fallo senza cambiare il comportamento di SessionEditor.
   - Sotto, una riga di riepilogo viva: "Incremento minimo: X kg" (da minIncrement) e
     "Carico massimo componibile: Y kg" (bar + 2 × Σ plate×count). Se l'inventario è
     vuoto, mostra un avviso ambra: "Senza dischi il calcolatore può proporre solo il
     bilanciere."
   - ⚠️ NESSUNA classe di testo con opacità (`text-emerald-800/60` e simili). Se la
     scheda claude/A11Y_CONTRAST_TASK.md è già applicata usa i token `text-fg-*`;
     altrimenti usa colori pieni. Questo componente non deve nascere già non conforme.

C) app/impostazioni/page.tsx — inserisci <BarbellSection /> tra <UnitsSection /> e
   <LanguageSection />. Nessun'altra modifica al file.

D) Verifica:
   - `npx tsc --noEmit && npm run lint` → zero errori
   - `npm run build` → deve passare
   - `npm run dev` → /impostazioni: cambia bilanciere a 15 kg e azzera i dischi da 1.25 →
     l'incremento minimo passa da 2.5 a 5 kg nella riga di riepilogo
   - ricarica la pagina → le scelte sono ancora lì (cache + DB)
   - DevTools → Application → Local Storage → la chiave fitness-app:barbell contiene le scelte
   - Supabase Studio → profiles → la colonna settings contiene ora la chiave "barbell";
     le altre chiavi (notifications, ecc.) sono INTATTE
   - accedi con un utente il cui profilo NON ha ancora la chiave barbell → la sezione
     mostra i default senza errori in console (fallback DEFAULT_BARBELL funzionante)
   - DevTools → Network → Offline → ricarica → le preferenze sono ancora quelle scelte
   - Impostazioni → Reset totale → il bilanciere torna a 20 kg e la chiave localStorage sparisce
   - Riporta nel riepilogo l'esito degli 8 controlli.
```

---

## MICRO-PROMPT 4 — Plate Calculator visivo

```
Lavora sul repo fitness-app. Task: SOLO i due componenti di visualizzazione dei dischi. Nessuna modifica ai motori (plateMath.ts è già corretto e chiuso), nessuna modifica al context, nessuna integrazione con il flusso di allenamento (è il prompt 5).

Prerequisiti: prompt 1, 2 e 3 applicati.

A) Crea app/allenamento/_components/PlateStack.tsx ("use client" NON necessario se non usa
   stato: preferisci un componente server-compatibile, puramente presentazionale).

   interface PlateStackProps {
     solution: PlateSolution;   // GIÀ risolto: questo componente NON calcola nulla
     barWeight: number;
     className?: string;
   }

   - Disegna un bilanciere in SVG inline scritto a mano. NON aggiungere librerie di
     grafica: recharts è per i grafici dati e non c'entra.
   - Struttura: barra orizzontale centrale (rettangolo grigio con arrotondamento),
     manicotto (sleeve) più spesso, e i dischi impilati verso l'esterno partendo dal
     più pesante, uno per `count`. Disegna UN SOLO lato più il mozzo, con l'etichetta
     "per lato" ben visibile: disegnare entrambi i lati raddoppia la larghezza e dimezza
     la leggibilità su mobile, che è il contesto d'uso reale (telefono in palestra).
   - Altezza del disco PROPORZIONALE al peso, non uguale per tutti: il 25 deve essere
     visibilmente più grande del 1.25, altrimenti il disegno non aggiunge nulla al numero.
     Usa una scala compressa (es. altezza = 40 + 60 × (kg/25)) per evitare che l'1.25
     diventi invisibile.
   - Colori IPF, come costante esportata:
       25 → #DC2626 (rosso)   20 → #2563EB (blu)    15 → #EAB308 (giallo)
       10 → #16A34A (verde)    5 → #F5F5F5 (bianco)  2.5 → #DC2626 (rosso)
       1.25 → #D4D4D8 (cromo)
   - ⚠️ ACCESSIBILITÀ, vincoli non negoziabili (WCAG 1.4.1 — il colore non è mai l'unica
     informazione, e la scheda claude/A11Y_CONTRAST_TASK.md è già stata aperta su questo repo):
       * su OGNI disco è stampato il numero di kg, in bianco o nero a seconda della
         luminanza del disco (bianco e cromo → testo scuro; rosso, blu, verde → testo bianco)
       * ogni disco ha un <title> figlio con "Disco da N kg"
       * il bianco (#F5F5F5) e il cromo (#D4D4D8) hanno un `stroke` scuro esplicito,
         altrimenti spariscono sul fondo chiaro
       * l'<svg> ha role="img" e aria-label={describeSolution(solution)} — la funzione
         esiste già in plateMath.ts, NON riscrivere il testo a mano
       * il disegno NON deve essere l'unico output: sotto l'SVG stampa sempre la riga
         testuale "25 × 1 · 5 × 1 · 1,25 × 1 per lato" con numeri in it-IT
   - Stato `belowBar`: disegna il solo bilanciere e mostra "Solo bilanciere (N kg)".
   - Stato `!exact`: banda ambra sotto il disegno — "Componibile: X kg. Mancano Y kg
     con i dischi che hai." + link testuale a /impostazioni.

B) Crea app/allenamento/_components/PlateCalculatorModal.tsx ("use client"):

   interface PlateCalculatorModalProps {
     open: boolean;
     onClose: () => void;
     initialKg?: number;         // precompila dal set che lo ha aperto
     onUse?: (kg: number) => void;   // opzionale: "Usa questo carico"
   }

   - Riusa <Modal> da app/today/_components/Modal.tsx. NON scrivere un secondo dialog.
   - Legge `barbell` da useSettings(): bilanciere e inventario NON si ridigitano qui.
   - Un input numerico "Carico totale (kg)" + due bottoni rapidi -/+ che si muovono di
     `minIncrement(barbell.plates)`, non di 2.5 fisso.
   - A ogni cambio: `solvePlates(kg, barbell.barWeight, barbell.plates)` dentro un
     useMemo, e il risultato passato a <PlateStack />. Il componente NON implementa
     aritmetica propria: se ti serve un calcolo che plateMath non espone, fermati e
     segnalalo nel riepilogo invece di scriverlo qui.
   - Se `onUse` è passato, un bottone "Usa questo carico" che chiama
     onUse(solution.achievable) — NON il valore digitato: si usa ciò che è davvero
     componibile, mai un numero che l'utente non può caricare.
   - L'input ha una <label> legata con htmlFor/id (usa useId() di React 19).

C) Verifica:
   - `npx tsc --noEmit && npm run lint` → zero errori
   - `npm run build` → deve passare
   - Monta temporaneamente <PlateCalculatorModal open onClose={()=>{}} initialKg={82.5} />
     in una pagina di prova (o usa /allenamento come host provvisorio) e verifica a schermo:
       1. 82.5 kg → disegna 25 + 5 + 1.25 per lato, riga testuale coerente
       2. 15 kg con bilanciere 20 → "Solo bilanciere (20 kg)"
       3. 100 kg con inventario ridotto a [25×1] → banda ambra "mancano 30 kg"
       4. -/+ si muovono di 2.5 kg con i dischi da 1.25, di 5 kg senza
       5. i dischi hanno altezze VISIBILMENTE diverse tra 25 e 1.25
       6. il numero di kg è leggibile su OGNI disco, bianco e cromo compresi
       7. screen reader (o DevTools → Accessibility → verifica aria-label sull'svg):
          l'etichetta descrive la soluzione a parole
   - `grep -n "0\.\|Math\." app/allenamento/_components/PlateCalculatorModal.tsx` →
     nessuna aritmetica sui carichi al di fuori delle chiamate a plateMath
   - RIMUOVI il montaggio temporaneo prima di chiudere lo step.
   - Riporta l'esito dei 7 punti nel riepilogo.
```

---

## MICRO-PROMPT 5 — Integrazione warm-up e isolamento delle statistiche

```
Lavora sul repo fitness-app. Task: collegare la rampa di riscaldamento al flusso di allenamento ed ESCLUDERLA da volume e record. È lo step più delicato: tocca le statistiche, che sono già in produzione con dati reali.

Prerequisiti: prompt 1-4 applicati.
Leggi prima per intero: app/today/_lib/volumeStats.ts, app/today/_lib/prStats.ts,
app/allenamento/page.tsx, app/allenamento/_components/ExerciseSetCard.tsx.

A) ISOLAMENTO STATISTICO — farlo PER PRIMO, prima di qualsiasi UI.
   Le firme pubbliche di entrambi i file NON cambiano: VolumeChart.tsx,
   PersonalRecordsCard.tsx e PRToast.tsx non vanno toccati.

   1. app/today/_lib/volumeStats.ts
      - importa isWorkSet e setVolume da ./types
      - in OGNI punto che itera i set di un CompletedExercise, filtra con
        `.filter(isWorkSet)` PRIMA di sommare. I punti sono dentro totalVolume() e
        volumeByMuscle(): trovali leggendo il file, non assumerne il numero.
      - sostituisci ogni somma di pesi scritta a mano con setVolume(set): deve esistere
        UNA sola formula del volume in tutto il repo.
      - NON toccare logsInPeriod né periodDays: filtrano per data, non per set.

   2. app/today/_lib/prStats.ts
      - stessa importazione; filtra i set con isWorkSet PRIMA di calcolare maxWeight,
        bestSetVolume ed e1rm.
      - ⚠️ Questo è il punto che giustifica l'intera feature: un warm-up al 95% di un
        massimale, senza filtro, genera un falso PR e fa apparire il PRToast a metà
        riscaldamento. Se dopo la modifica un warm-up produce ancora un record, la
        modifica è incompleta.
      - verifica che il confronto con `previous` usi la stessa lista filtrata: filtrare
        solo il "nuovo" e non lo "storico" produce PR fantasma al primo allenamento
        dopo il deploy.

   3. Test di regressione, obbligatorio: aggiungi a app/today/_lib/volumeStats.test.ts
      (creandolo con lo stesso runner scelto nel prompt 2) un caso con un
      CompletedExercise contenente 2 set warmup e 3 set work, e verifica che
      totalVolume conti SOLO i 3. Aggiungi il caso simmetrico per prStats.
      Aggiungi inoltre un caso con set SENZA il campo kind (storico legacy):
      devono contare tutti. È la retrocompatibilità del prompt 1, e va testata.

B) CONTEGGIO DEI SET — correggere PRIMA della UI, altrimenti la feature rompe il flusso.

   1. app/allenamento/page.tsx
      - `totalCompleted` oggi è `Σ ex.sets.length`: diventa
        `Σ ex.sets.filter(isWorkSet).length`.
      - Senza questa modifica la barra di avanzamento supera il 100% e `isFullyComplete`
        scatta dopo 4 riscaldamenti. Verificalo prima e dopo.
   2. app/allenamento/_components/ExerciseSetCard.tsx
      - `isFullyDone = completedSets.length >= targetSets` diventa
        `completedSets.filter(isWorkSet).length >= targetSets`.
   3. `removeLastSet` deve continuare a rimuovere l'ULTIMO set qualunque sia il suo kind:
      non filtrare lì, o l'utente non può più annullare un riscaldamento sbagliato.

C) UI DELLA RAMPA — app/allenamento/_components/ExerciseSetCard.tsx

   1. Nuove props, tutte OPZIONALI (il componente è usato da allenamento/page.tsx e la
      sua firma non deve rompersi):
        onAddWarmup?: (sets: CompletedSet[]) => void;
        onOpenPlates?: (kg: number) => void;
   2. Sopra il blocco di inserimento, una riga di azioni con due bottoni piccoli:
      - "Riscaldamento" (icona Flame di lucide-react): apre un pannello INLINE (non un
        modale: l'utente è in palestra, un modale in più è un tap in più) che mostra la
        rampa calcolata da buildWarmupRamp(carico, barbell.barWeight, barbell.plates).
        Il carico usato è quello digitato nel campo peso; se il campo è vuoto, il bottone
        è disabilitato con `disabled` + `aria-disabled` e un titolo esplicativo.
      - "Dischi" (icona Layers): chiama onOpenPlates(carico digitato).
   3. Il pannello della rampa elenca gli step come righe: "50% · 40 kg · 8 rip" più un
      <PlateStack compatto per lato. In coda due bottoni:
        - "Aggiungi tutte" → onAddWarmup(ramp.map(s => stepToSet(s, target)))
        - una X per chiudere senza aggiungere
      Ogni riga ha anche un "+" per aggiungere il SINGOLO step: in palestra si salta
      spesso il primo.
   4. I set warmup già registrati vanno mostrati nella lista dei set completati con una
      pill "W" DISTINTA: `bg-amber-100 text-amber-800` in tema chiaro, e — attenzione —
      quel fondo NON ha override nel dark theme di globals.css, quindi usa i token
      `bg-surface-accent text-fg-warning` se claude/A11Y_CONTRAST_TASK.md è già applicata.
      La pill deve avere anche un `title`/`aria-label` "Serie di riscaldamento": la lettera
      W da sola non è comprensibile a uno screen reader.
   5. NON introdurre classi di testo con opacità in nessuna delle parti nuove.

D) CABLAGGIO — app/allenamento/page.tsx
   1. Stato locale `platesFor: number | null` e un solo <PlateCalculatorModal
      open={platesFor !== null} initialKg={platesFor ?? 0} onClose={...} /> montato
      a livello di pagina, NON uno per card.
   2. `onAddWarmup` chiama `addSet(exIndex, set)` per ogni set della rampa, in ordine.
      NON introdurre una nuova azione nel context: addSet è già il canale unico e già
      gestisce persistenza e active_sessions.
   3. Passa `onOpenPlates={(kg) => setPlatesFor(kg)}` a ogni ExerciseSetCard.

E) SessionEditor — app/scheda/_components/SessionEditor.tsx
   Aggiungi accanto a ogni esercizio pianificato un bottone icona "Dischi" che apre il
   PlateCalculatorModal con `initialKg` vuoto. In fase di programmazione NON esiste un
   carico registrato (PlannedExercise ha solo sets/reps/notes, nessun peso): il modale
   qui è uno strumento di consultazione, non deve scrivere nulla nel piano.
   Non aggiungere campi a PlannedExercise in questo step.

F) Verifica finale, obbligatoria prima di dichiarare il task chiuso:
   - `npm test` → tutti i test passano, inclusi i nuovi di volumeStats e prStats
   - `npx tsc --noEmit && npm run lint` → zero errori
   - `npm run build` → deve passare
   - `grep -rn "sets.length" app/allenamento app/today/_lib` → ogni occorrenza rimasta
     deve essere volutamente NON filtrata (es. removeLastSet). Elencale nel riepilogo
     con la motivazione, una per una.
   - Flusso manuale, in quest'ordine:
       1. /impostazioni → bilanciere 20 kg, inventario pieno
       2. /allenamento → avvia una sessione → primo esercizio → digita 82.5 →
          "Riscaldamento" → la rampa mostra 40 / 57.5 / 70 / 77.5 kg con 8/5/3/1 rip.
          Sono i valori verificati della scheda.
       3. "Aggiungi tutte" → compaiono 4 set con pill "W" → ⚠️ la barra di avanzamento
          della sessione NON si muove e l'esercizio NON risulta completato
       4. registra i 3 set allenanti veri → ORA la card risulta completata e la barra è
          coerente
       5. "Dischi" su 82.5 → il modale disegna 25 + 5 + 1.25 per lato
       6. termina la sessione → /stats → il volume conta SOLO i set allenanti.
          Confronto numerico: annota il volume prima e dopo, la differenza deve essere
          esattamente la somma dei set work, non dei 7 totali.
       7. ⚠️ PROVA DEL PR FANTASMA: fai un warm-up al 95% di un carico superiore al tuo
          massimale storico su quell'esercizio → il PRToast NON deve comparire.
          Poi registra il set allenante vero → il PRToast compare.
       8. annulla l'ultimo set con "Annulla ultimo set" mentre l'ultimo è un warm-up →
          viene rimosso correttamente
       9. Supabase Studio → workout_logs → l'ultima riga contiene i set con
          "kind":"warmup" dentro il jsonb, e i set allenanti SENZA il campo o con "work"
      10. apri /stats con un utente che ha SOLO storico vecchio (nessun campo kind) →
          volume e record identici a prima della feature. È la prova della retrocompatibilità.
   - Riporta l'esito dei 10 punti nel riepilogo, con i numeri dei punti 6 e 10.
```

---

## Note di attenzione da tenere d'occhio in review

- **`CompletedSet.weights` è un peso PER RIPETIZIONE.** È il primo malinteso possibile su questo modello dati e produce volumi 8-10× sbagliati. `setVolume` esiste per non lasciare che nessuno scriva `reps * weight` a mano; se in diff compare una somma di pesi fuori da quella funzione, è un bug anche se il numero sembra giusto.
- **Il greedy è ottimo solo a inventario illimitato.** Verificato su tutti i carichi da 1.25 a 60 kg/lato a passo 1.25: zero divergenze dal minimo assoluto. Ma con `20×1, 15×2` e 30 kg/lato si incastra, mentre `15+15` esiste. Se in review il fallback DFS è stato "semplificato via" perché "il greedy basta", il test 5 del prompt 2 deve fallire: se passa lo stesso, il test è stato indebolito.
- **`82.5 * 0.7 === 57.74999999999999`.** Ogni volta che questo task tornerà indietro con un "non componibile" su un carico valido, la causa sarà questa. L'aritmetica in centesimi interi non è pedanteria: è l'unica cosa che rende `resto === 0` un confronto affidabile.
- **`kind` opzionale è una scelta irreversibile e va difesa.** Renderlo obbligatorio "per pulizia" invaliderebbe ogni `CompletedSet` dentro i jsonb di `workout_logs` e `active_sessions`, che non sono migrabili con una `ALTER TABLE`. Il punto 10 della verifica finale (utente con solo storico vecchio) è il test che protegge questa decisione: non va rimosso.
- **Il conteggio dei set è il difetto che l'utente nota per primo.** Prima ancora di volume e PR, se `totalCompleted` non filtra i warm-up la barra va oltre il 100% e la sessione si dichiara finita a metà. È in `allenamento/page.tsx` e in `ExerciseSetCard.tsx`: due punti, entrambi obbligatori.
- **Il PR fantasma è il rischio silenzioso.** Se `prStats` filtra i set nuovi ma non lo storico con cui li confronta, al primo allenamento dopo il deploy comparirà una raffica di record inesistenti — e i record, una volta mostrati, l'utente li crede. Il punto 7 del flusso manuale esiste solo per questo.
- **Il colore dei dischi non è decorazione, è l'informazione.** I colori IPF sono uno standard, ma un daltronico rosso-verde non distingue il 25 dal 10. Il numero stampato su ogni disco, il `<title>` e l'`aria-label` da `describeSolution` non sono rifiniture: senza, il componente non è utilizzabile da chi ne avrebbe più bisogno.
- **Un solo modale a livello di pagina.** Montare un `PlateCalculatorModal` dentro ogni `ExerciseSetCard` significa 8 dialog nel DOM di una sessione tipica, con 8 `useMemo` che ricalcolano a ogni digitazione. Lo stato `platesFor` in pagina è la forma corretta.
- **Fuori scope, e va detto:** il warm-up non è persistito nella *pianificazione* (`PlannedExercise` non ha un carico, quindi la rampa non può essere precalcolata in `/scheda`), le percentuali della rampa non sono configurabili dall'utente (`DEFAULT_RAMP` è una costante), e non esiste il calcolo in libbre. Sono tre estensioni naturali, nessuna delle quali va infilata qui.

## Riferimenti nel repo

- `app/today/_lib/types.ts` — `CompletedSet { reps, weights }`, `CompletedExercise` con `name` inline (riga 165), punto di estensione di questo task
- `app/today/_lib/volumeStats.ts` — `logsInPeriod`, `periodDays`, `totalVolume`, `volumeByMuscle`, `VolumePeriod`
- `app/today/_lib/prStats.ts` — `prTypeLabels`, `PRType`, record `{ exerciseId, name, e1rm, maxWeight, bestSetVolume, date }`
- `app/today/_lib/WorkoutSessionContext.tsx` — `addSet`, `removeLastSet`, `finishSession`, `logs`, `records`, `lastPR`
- `app/today/_lib/SettingsContext.tsx` — `profiles.settings` jsonb, `resetAll` e il commento sulle DELETE senza filtro (103-118)
- `app/allenamento/page.tsx` — `totalCompleted`/`totalTargetSets`/`progressPct`, `handleCompleteSet`
- `app/allenamento/_components/ExerciseSetCard.tsx` — `handleComplete` con `Array(targetReps).fill(w)`, `isFullyDone`
- `app/scheda/_components/SessionEditor.tsx` — `Stepper` riusabile, pattern del Modal
- `app/today/_components/Modal.tsx` — dialog condiviso, unico
- `app/stats/_components/VolumeChart.tsx`, `PersonalRecordsCard.tsx`, `app/allenamento/_components/PRToast.tsx` — consumatori delle statistiche, **da non toccare**
- `public/sw.js` — il service worker non intercetta Supabase (23-30)
- `claude/A11Y_CONTRAST_TASK.md` — token colore e divieto di opacità sul testo, validi anche per i componenti nuovi
- `AGENTS.md` — obbligo di consultare `node_modules/next/dist/docs/`
