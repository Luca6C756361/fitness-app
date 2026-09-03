# Task — Atlante Esercizi Esteso: Scheda Dettaglio, Descrizione Tecnica e Preview Anatomica

Istruzioni operative per Claude Code sul repo `fitness-app` (Next.js 16, React 19, Tailwind 4, Supabase `@supabase/ssr`, lucide-react).

---

## 0. Contesto tecnico rilevato nel repo

| Cosa | Dove | Vincolo che ne deriva |
|---|---|---|
| `ExerciseDefinition { id; name; primaryMuscle: MuscleGroup; secondaryMuscles: MuscleGroup[]; equipment; media?; source?; createdAt? }` | `app/today/_lib/types.ts:96-104` | `primaryMuscle` è **singolare** ed è la chiave usata da filtri/chip in tutta l'app. **Non va reso plurale**: si rompe `ExercisePicker`, `ExerciseBrowser`, `CustomExerciseForm`, `validateExercise`. Ogni arricchimento è **additivo**. |
| `media?: { kind: "video" \| "lottie" \| "image"; src: string; poster?: string }` | `types.ts:100` | Campo già esistente, oggi non valorizzato da nessun esercizio. Va **riusato**, non ridichiarato. |
| `MuscleGroup` = 11 valori coarse (`petto`, `schiena`, ... `cardio`) | `types.ts:69-80` | È la tassonomia di **filtro/UI**, non quella anatomica fine (es. "capo lungo tricipite" vs "capo laterale"). Serve un secondo livello, non una sostituzione. |
| `exerciseDatabase: ExerciseDefinition[]` — 36 esercizi, id parlanti (`"panca-piana"`, `"squat"`) | `app/today/_lib/exerciseData.ts:11-68` | Referenziato da `defaultWeeklyPlan`: **nessun id esistente va rinominato o rimosso**. L'ampliamento è solo in append. |
| `muscleGroupLabels`, `equipmentLabels` | `exerciseData.ts` | Le chip di `ExercisePicker`/`CustomExerciseForm` si generano da qui: ogni nuova tassonomia anatomica segue lo stesso pattern (oggetto `Record<Id, string>`), mai stringhe hardcoded nei componenti. |
| `usePlan().exercises` = fusione `exerciseDatabase` + `customExercises` (Supabase) | `app/today/_lib/PlanContext.tsx` (`mergeExercises`, `getExerciseDef`) | **Unico punto di lettura.** `ExerciseDetailModal` deve ricevere l'`ExerciseDefinition` già risolto da qui, mai leggere `exerciseDatabase` direttamente (altrimenti gli esercizi custom non avrebbero mai la scheda dettaglio). |
| Cache offline: `customExercises` → `localStorage` con chiave `CUSTOM_CACHE_KEY`, idratata prima del round-trip Supabase | `PlanContext.tsx` | `exerciseDatabase` **non richiede caching**: è già statico nel bundle JS, disponibile offline by definizione. Solo gli asset multimediali (video/lottie) necessitano di una strategia di cache (Cache API via service worker, non localStorage — i binari non ci stanno). |
| Service worker: network-first per le navigazioni, cache-first per gli asset statici | PWA config (`sw.js`) | Gli asset dei loop esercizio vanno serviti da `public/exercises/` o Supabase Storage con path stabile, così il cache-first esistente li intercetta **senza modifiche al service worker**. |
| `Modal.tsx` — pattern condiviso (usato da `CustomExerciseForm`, `ExercisePicker`) | `app/today/_components/Modal.tsx` | `ExerciseDetailModal` riusa questo componente, non un `<dialog>` nuovo. |
| Token colore A11Y (`text-fg-primary`, `text-fg-secondary`, `text-fg-muted`, `text-fg-accent`, `text-fg-danger`) | `app/globals.css`, migrazione completata in `A11Y_CONTRAST_TASK.md` | **Zero classi `text-emerald-NNN/opacity` nuove.** Ogni testo del nuovo componente usa i token esistenti. |
| `ExercisePicker.tsx`, `SessionEditor.tsx` (riga esercizio ~L376), `ExerciseSetCard.tsx` (testata ~L93) | `app/scheda/_components/`, `app/allenamento/_components/` | Punti di innesto del trigger "dettaglio esercizio": un'icona/bottone che apre `ExerciseDetailModal`, senza alterare le props esistenti dei tre componenti (props nuove solo opzionali). |
| Formati media a basso peso | — | Video: **WebM (VP9), max ~300 KB, loop 2-4s, senza audio**. In alternativa Lottie JSON (tipicamente 5-20 KB) con `lottie-react` — **non ancora installato nel repo** (visto in `FOCUS_TASK.md`: evitato di proposito finché non ci sono asset reali). SVG statico con evidenziazione via CSS/JS: **0 KB extra**, nessuna richiesta di rete. |

---

## 1. Decisioni architetturali

**A. Struttura dati polimorfica, additiva, compatibile con i custom**
- `ExerciseDefinition` si estende con campi **tutti opzionali** (stesso pattern già usato per `source`/`createdAt`):
  - `instructions?: { setup: string[]; concentric: string[]; eccentric: string[]; commonMistakes: string[] }`
  - `muscleMap?: { primary: MuscleAnatomyId[]; secondary: MuscleAnatomyId[] }` — tassonomia anatomica **fine** (nuovo tipo `MuscleAnatomyId`, es. `"pettorale-superiore"`, `"tricipite-capo-laterale"`, `"deltoide-anteriore"`), distinta da `MuscleGroup` che resta la tassonomia coarse per filtri/chip. Un esercizio senza `muscleMap` fa fallback su `[primaryMuscle]`/`secondaryMuscles` mappati 1:1 su un `MuscleGroup → MuscleAnatomyId[]` di default (così ogni esercizio, anche custom, ha **sempre** una evidenziazione minima).
  - Nessun nuovo campo tocca `primaryMuscle`, `secondaryMuscles`, `equipment`: i filtri esistenti restano invariati.
- Gli esercizi **custom** creati dall'utente non hanno `instructions`/`muscleMap` dettagliati: `ExerciseDetailModal` deve degradare con garbo (mostra solo muscolo coarse + fallback anatomico), mai un errore o una sezione vuota rotta.

**B. SVG anatomico: un solo componente condiviso, non un asset per esercizio**
- `MuscleMapSvg` è **un componente unico** (front + back come due `<g>` o due `<svg>` affiancati), con ogni fascio muscolare come `<path id="MuscleAnatomyId">`. L'evidenziazione è runtime: si passano gli id `primary`/`secondary` come prop e si applica `fill` via CSS var (rosso scuro per primario, rosso più chiaro/opacità per secondario), **zero richieste di rete, zero peso per-esercizio**.
- Questo risolve il vincolo "non appesantire il bundle": il costo è fisso (un SVG, una volta), non lineare col numero di esercizi.
- Il loop video/Lottie ("omino grigio" animato) è un **livello opzionale aggiuntivo**, per gli esercizi che lo hanno (`media` esistente), lazy-caricato solo quando il modal è aperto — mai nel bundle iniziale.

**C. Asset multimediali: dove vivono**
- Path pubblico stabile `public/exercises/<exerciseId>.webm` per i pochi esercizi con demo reale (evita una tabella Storage per iniziare), oppure Supabase Storage bucket pubblico `exercise-media` se si prevede upload futuro lato admin — **decisione da confermare prima del MICRO-PROMPT 4**, ma l'interfaccia (`media.src` come URL assoluto o path pubblico) è identica in entrambi i casi, quindi non blocca lo sviluppo del resto.
- Nessun asset video è **obbligatorio**: il modal funziona already con solo `MuscleMapSvg` + `instructions`.

**D. Conformità WCAG AA**
- Testi del modal: token `text-fg-primary`/`text-fg-secondary` esistenti, mai nuove classi opacità.
- Contrasto rosso evidenziazione muscolare: colore validato contro lo sfondo grigio neutro dell'omino (rapporto ≥ 3:1, essendo elemento grafico non testuale, soglia WCAG 1.4.11).
- `role="dialog"` + `aria-modal` + focus trap: **eredita da `Modal.tsx`**, che nel repo attuale — per lo stesso audit citato in memoria — potrebbe già essere in corso di fix; se non ancora applicato, non è compito di questo task correggerlo (dipendenza da `A11Y` in corso, non duplicare lavoro).

---

## MICRO-PROMPT 1 — Tipi ed helper anatomia

```
Lavora sul repo fitness-app. Task: fondamenta dati per l'atlante esercizi esteso. In questo step NON toccare exerciseData.ts (i 36 esercizi restano invariati) e NON creare componenti React: solo tipi e un helper puro.

Leggi PRIMA app/today/_lib/types.ts per intero (ExerciseDefinition, MuscleGroup, Equipment) e app/today/_lib/exerciseData.ts (muscleGroupLabels, equipmentLabels, pattern degli id).

1) app/today/_lib/types.ts — estendi SOLO in modo additivo:

   /** Tassonomia anatomica fine, distinta da MuscleGroup (che resta per filtri/chip). */
   export type MuscleAnatomyId =
     | "pettorale-superiore" | "pettorale-medio" | "pettorale-inferiore"
     | "gran-dorsale" | "trapezio-medio" | "trapezio-inferiore" | "romboidi" | "lombari"
     | "deltoide-anteriore" | "deltoide-laterale" | "deltoide-posteriore"
     | "bicipite-brachiale" | "brachiale" | "avambraccio"
     | "tricipite-capo-lungo" | "tricipite-capo-laterale" | "tricipite-capo-mediale"
     | "quadricipite-retto-femorale" | "quadricipite-vasti"
     | "femorale-bicipite" | "femorale-semitendinoso"
     | "gluteo-massimo" | "gluteo-medio"
     | "gastrocnemio" | "soleo"
     | "retto-addominale" | "obliqui" | "core-profondo";

   export interface ExerciseInstructions {
     setup: string[];
     concentric: string[];
     eccentric: string[];
     commonMistakes: string[];
   }

   export interface MuscleMap {
     primary: MuscleAnatomyId[];
     secondary: MuscleAnatomyId[];
   }

   Aggiungi a ExerciseDefinition (dopo `media?`, prima di `source?`), entrambi opzionali:
     instructions?: ExerciseInstructions;
     muscleMap?: MuscleMap;

2) Crea app/today/_lib/muscleAnatomy.ts. Nessun import React. Esporta:

   /** Label leggibili, stesso pattern di muscleGroupLabels in exerciseData.ts. */
   export const muscleAnatomyLabels: Record<MuscleAnatomyId, string> = { ... }
     (una entry per ogni id del punto 1, in italiano, es. "pettorale-superiore": "Pettorale (fascio superiore)")

   /**
    * Fallback: ogni MuscleGroup coarse mappa su 1-3 MuscleAnatomyId rappresentativi.
    * Usato quando un esercizio (specialmente custom) non ha muscleMap esplicito.
    */
   export const muscleGroupToAnatomyFallback: Record<MuscleGroup, MuscleAnatomyId[]> = { ... }
     (copertura ESAUSTIVA dei 11 MuscleGroup esistenti, nessuno escluso)

   /**
    * Risolve la mappa da evidenziare per un esercizio: usa muscleMap se presente,
    * altrimenti deriva dal fallback su primaryMuscle/secondaryMuscles.
    */
   export function resolveMuscleMap(ex: ExerciseDefinition): MuscleMap {
     if (ex.muscleMap) return ex.muscleMap;
     return {
       primary: muscleGroupToAnatomyFallback[ex.primaryMuscle] ?? [],
       secondary: ex.secondaryMuscles.flatMap((m) => muscleGroupToAnatomyFallback[m] ?? []),
     };
   }

3) VERIFICA obbligatoria:
   - npx tsc --noEmit → zero errori (in particolare: muscleAnatomyLabels e
     muscleGroupToAnatomyFallback devono essere TOTALI, TypeScript deve segnalare
     se manca anche un solo id — non usare `as Record<...>` per silenziare)
   - npm run build → verde
   - Nessun file oltre a types.ts e muscleAnatomy.ts deve comparire in `git diff --stat`
   - Incolla l'output di tsc nel riepilogo.
```

---

## MICRO-PROMPT 2 — Ampliamento catalogo ed arricchimento contenuti tecnici

```
Lavora sul repo fitness-app. Task: portare il catalogo esercizi a un set completo di movimenti fondamentali/complementari e arricchire ogni esercizio con instructions + muscleMap. Presuppone il MICRO-PROMPT 1 applicato.

Leggi PRIMA app/today/_lib/exerciseData.ts per intero: nota il raggruppamento a commenti
(// PETTO, // SCHIENA, ...) e il pattern id-kebab-case parlante.

REGOLE NON NEGOZIABILI:
- Nessuno dei 36 id esistenti viene rinominato, rimosso o spostato di `primaryMuscle`/`equipment`:
  defaultWeeklyPlan e le sessioni salvate su Supabase li referenziano per id.
- I nuovi esercizi seguono lo STESSO pattern id (kebab-case, italiano, univoco).
- Ogni esercizio (esistente E nuovo) riceve `instructions` e `muscleMap` in questo step:
  non lasciare a metà il catalogo, altrimenti ExerciseDetailModal avrebbe una qualità
  disomogenea tra esercizi vecchi e nuovi.

1) Amplia exerciseDatabase con i movimenti fondamentali/complementari mancanti per ciascun
   gruppo già presente (PETTO, SCHIENA, SPALLE, BICIPITI, TRICIPITI, GAMBE, CORE, CARDIO):
   copri almeno le varianti di angolo (piana/inclinata/declinata), di presa (prona/supina/neutra),
   e i pattern monoarticolare vs multiarticolare mancanti. Indicativamente porta il catalogo
   da 36 a un intorno di 70-90 esercizi totali, senza duplicare movimenti già coperti.
   Aggiungi anche `level: "principiante" | "intermedio" | "avanzato"` NON esiste ancora come
   campo: se lo introduci, aggiungilo PRIMA in types.ts (torna al MICRO-PROMPT 1 concettualmente,
   ma applicalo qui) come opzionale su ExerciseDefinition, con fallback implicito "intermedio"
   nella UI se assente.

2) Per OGNI esercizio del file (vecchi + nuovi), aggiungi:
     instructions: {
       setup: [...],        // 2-3 punti: posizionamento, presa, postura di partenza
       concentric: [...],   // 1-2 punti: fase attiva/di spinta-trazione
       eccentric: [...],    // 1-2 punti: fase di controllo/ritorno
       commonMistakes: [...] // 2-3 punti: errori tipici da evitare
     },
     muscleMap: { primary: [...], secondary: [...] }  // usa i MuscleAnatomyId di muscleAnatomy.ts

   Testo tecnico, conciso, in italiano, tono coerente con un personal trainer (non da
   Wikipedia): frasi imperative brevi ("Scapole retratte, piedi ancorati a terra").

3) VERIFICA obbligatoria:
   - npx tsc --noEmit → zero errori
   - Crea uno script temporaneo /tmp/check-atlas.ts, eseguilo con `npx --yes tsx`. Deve
     asserire e stampare:
       a) ogni esercizio ha instructions con TUTTI e 4 gli array non vuoti
       b) ogni esercizio ha muscleMap.primary non vuoto
       c) ogni MuscleAnatomyId usato in ogni muscleMap esiste in muscleAnatomyLabels
          (stampa gli id orfani, se ce ne sono il task non è concluso)
       d) nessun id duplicato in exerciseDatabase
       e) i 36 id originali (elencali esplicitamente nello script) sono TUTTI ancora presenti
          con lo stesso primaryMuscle/equipment di prima (protezione anti-regressione)
       f) conteggio finale per gruppo muscolare (stampa la tabella)
   - npm run build → verde
   - cancella lo script e incolla l'output nel riepilogo.
```

---

## MICRO-PROMPT 3 — Componente `MuscleMapSvg` e `ExerciseDetailModal`

```
Lavora sul repo fitness-app. Task: mappa anatomica vettoriale e modal di dettaglio. Presuppone i MICRO-PROMPT 1 e 2 applicati. In questo step crei solo componenti nuovi, non montati da nessuna parte: è corretto che la UI resti invariata a fine step.

Leggi PRIMA app/today/_components/Modal.tsx (pattern già usato da CustomExerciseForm/ExercisePicker)
e app/globals.css (token text-fg-*, variabili CSS del tema chiaro/scuro).

1) Crea app/today/_components/MuscleMapSvg.tsx ("use client")

   interface MuscleMapSvgProps {
     primary: MuscleAnatomyId[];
     secondary: MuscleAnatomyId[];
     className?: string;
   }

   - Due viewBox affiancati (front/back) di una figura anatomica neutra stilizzata
     ("omino grigio"), UN SOLO file SVG inline nel componente (no import esterni pesanti).
   - Ogni fascio muscolare è un <path id="{MuscleAnatomyId}">, con fill di base
     var(--fg-muted-fill) (grigio neutro, coerente col tema chiaro/scuro).
   - Applica dinamicamente (via style inline o classe condizionale sul path, MAI
     manipolazione diretta del DOM con useRef+querySelector — resta dichiarativo):
       id in primary  → fill rosso scuro (nuova CSS var --anatomy-primary, da aggiungere
                         in globals.css sia tema chiaro che scuro)
       id in secondary → fill rosso chiaro/opacità ridotta (--anatomy-secondary)
       altrimenti      → fill di base invariato
   - aria-hidden="true" sull'svg (è puramente illustrativo, l'informazione testuale
     sta altrove nel modal) + <title> descrittivo per lo screen reader a livello di
     contenitore, non del singolo path.
   - Nessuna dipendenza da lottie-react in questo componente: è SVG puro.

2) In app/globals.css aggiungi le due variabili nuove accanto alle altre --fg-*:
   tema chiaro e tema scuro, entrambe testate per un contrasto ≥3:1 sullo sfondo
   grigio neutro dell'omino (elemento grafico, soglia WCAG 1.4.11, non 4.5:1 del testo).

3) Crea app/today/_components/ExerciseDetailModal.tsx ("use client")

   interface ExerciseDetailModalProps {
     open: boolean;
     onClose: () => void;
     exercise: ExerciseDefinition | undefined;   // undefined = non renderizzare nulla
   }

   - Riusa <Modal>. Se exercise è undefined, ritorna null (nessun modal vuoto).
   - const { primary, secondary } = resolveMuscleMap(exercise) — da muscleAnatomy.ts:
     funziona SEMPRE, anche sugli esercizi custom senza muscleMap esplicito.
   - Layout: header con nome esercizio + pill gruppo muscolare/attrezzatura (stile
     coerente con le pill esistenti in ExercisePicker), poi <MuscleMapSvg> centrato,
     poi sezioni instructions (Setup / Fase concentrica / Fase eccentrica / Errori comuni)
     — se exercise.instructions è assente (esercizio custom), nascondi la sezione
     invece di renderla vuota o con placeholder.
   - Se exercise.media è valorizzato: slot per il loop video/Lottie, LAZY (nessun
     <video> montato finché il modal non è open === true), poster come placeholder
     mentre carica. Se kind è "lottie", NON importare lottie-react finché non è
     davvero necessario in un progetto reale (stesso principio di FOCUS_TASK.md):
     per ora un placeholder testuale "Demo video non disponibile" è accettabile
     quando media è assente.
   - Testi: solo token text-fg-primary/text-fg-secondary/text-fg-muted esistenti.
     Zero nuove classi text-emerald-NNN/opacity.

4) VERIFICA obbligatoria:
   - npx tsc --noEmit && npm run lint && npm run build → tutti verdi
   - git diff --stat: solo MuscleMapSvg.tsx, ExerciseDetailModal.tsx, globals.css.
     Nessun file di ExercisePicker/SessionEditor/ExerciseSetCard deve comparire
     (l'integrazione è nel MICRO-PROMPT 4).
   - Collaudo manuale isolato: monta temporaneamente <ExerciseDetailModal open
     exercise={exerciseDatabase[0]} onClose={()=>{}} /> in una pagina di scratch
     (es. app/dev-preview/page.tsx, poi CANCELLALA prima di concludere) per
     verificare visivamente evidenziazione rossa corretta in tema chiaro E scuro.
   - Incolla nel riepilogo conferma che la pagina di scratch è stata rimossa.
```

---

## MICRO-PROMPT 4 — Integrazione UI in Picker, Editor e Sessione attiva

```
Lavora sul repo fitness-app. Task: agganciare ExerciseDetailModal ai tre punti di consultazione. Presuppone i MICRO-PROMPT 1, 2, 3 applicati. Non cambiare le props obbligatorie esistenti di nessuno dei tre componenti: solo aggiunte opzionali/interne.

Leggi PRIMA app/scheda/_components/ExercisePicker.tsx, app/scheda/_components/SessionEditor.tsx
(riga controlli ~L376) e app/allenamento/_components/ExerciseSetCard.tsx (testata ~L93).

1) app/scheda/_components/ExercisePicker.tsx
   - Per ogni riga della lista, aggiungi un'icona Info (lucide-react, h-4 w-4,
     text-fg-muted hover:text-fg-accent) accanto al nome esercizio. Click:
     stopPropagation() (non deve selezionare l'esercizio) + apre ExerciseDetailModal
     con quell'ExerciseDefinition. Stato locale [detailExercise, setDetailExercise].
   - Non toccare onSelect, filtered, la logica di ricerca.

2) app/scheda/_components/SessionEditor.tsx
   - Nella barra controlli della riga (stesso punto di innesto del bottone Nota/Recupero,
     PRIMA del bottone showNotes con ml-auto), aggiungi un'icona Info che apre
     ExerciseDetailModal con getExerciseDef(ex.exerciseId) — già disponibile nel
     componente. Stesso stato locale [detailExercise, setDetailExercise] di sopra.

3) app/allenamento/_components/ExerciseSetCard.tsx
   - Prop nuova opzionale: onShowDetail?: (exerciseId: string) => void. Se definita,
     rendi cliccabile il nome esercizio in testata (o un'icona Info accanto), che la
     invoca. Il componente NON possiede il modal: lo stato/rendering di
     ExerciseDetailModal resta nel genitore (app/allenamento/page.tsx), passando
     getExerciseDef dal PlanContext — stesso pattern già usato per restSeconds.
   - Nessuna modifica alle prop esistenti (targetSets, targetReps, restSeconds, ecc.).

4) app/allenamento/page.tsx
   - Stato [detailExerciseId, setDetailExerciseId], passa onShowDetail={setDetailExerciseId}
     a ogni ExerciseSetCard nel map, e monta un solo <ExerciseDetailModal
     exercise={detailExerciseId ? getExerciseDef(detailExerciseId) : undefined} ... />
     in fondo alla pagina (stesso livello di <RestTimer>).

5) VERIFICA obbligatoria:
   - npx tsc --noEmit && npm run lint && npm run build → tutti verdi
   - Collaudo manuale:
     1. /scheda → apri il picker, clicca l'icona Info su un esercizio → il modal mostra
        nome corretto, mappa anatomica coerente col gruppo muscolare, istruzioni presenti
     2. /scheda → apri una scheda esistente in SessionEditor, clicca Info su una riga →
        stesso modal, stesso esercizio della riga
     3. Crea/seleziona un esercizio CUSTOM (senza instructions/muscleMap) → il modal si
        apre comunque, mostra la mappa anatomica via fallback (muscleGroupToAnatomyFallback)
        e nasconde la sezione istruzioni senza placeholder vuoti o errori console
     4. /allenamento → durante una sessione attiva, clicca Info su una ExerciseSetCard →
        stesso modal, senza interferire con il timer di sessione/recupero in corso
     5. Tema scuro (da /impostazioni): verifica contrasto leggibile di testi e mappa
        anatomica, nessun testo con classe text-emerald-NNN/opacity residua
     6. DevTools → Network: apri il modal su un esercizio SENZA media → nessuna richiesta
        di rete per video/lottie (conferma che lo slot è davvero lazy/condizionale)
   - Riporta l'esito dei 6 punti nel riepilogo.
```
