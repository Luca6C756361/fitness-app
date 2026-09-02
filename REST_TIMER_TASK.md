# Task — Sviluppatore 1: Timer di Recupero Personalizzato per Singolo Esercizio (UI & State Management)

Istruzioni operative per Claude Code sul repo `fitness-app` (Next.js 16.2.12, React 19, Tailwind 4, Supabase, lucide-react, @dnd-kit).

---

## 0. Contesto tecnico rilevato nel repo

| Cosa | Dove | Vincolo che ne deriva |
|---|---|---|
| `PlannedExercise { id, exerciseId, sets, reps, suggestedWeight?, notes? }` | `app/today/_lib/types.ts` | Il campo nuovo si aggiunge qui come **opzionale**. È il tipo salvato dentro `profiles.plan` (jsonb): ogni scheda già salvata ne è priva, quindi `undefined` deve essere uno stato legittimo, non un errore. |
| `CompletedSet { reps, weights[], restSeconds? }` — ⚠️ **`restSeconds` esiste già qui** e non è mai scritto da nessuno | `app/today/_lib/types.ts` | 🔴 Collisione di nome. `CompletedSet.restSeconds` è il recupero *effettivamente osservato* dopo un set; `PlannedExercise.restSeconds` è il recupero *pianificato*. Non confonderli e non riusare il primo per il secondo. |
| `handleSave()` in `SessionEditor` costruisce `cleaned: PlannedExercise[]` con **whitelist esplicita** dei campi (`...(e.notes ? { notes } : {})`) | `app/scheda/_components/SessionEditor.tsx` :226-237 | 🔴 **Il trap principale del task.** Puoi aggiungere il campo al tipo, allo state e alla UI, avere `tsc` verde, e vedere il valore sparire al salvataggio: `cleaned` non lo copia. Va aggiunto lì esplicitamente. |
| `replaceExercise()` usa lo spread e ha già un commento *"mantiene sets, reps, notes, showNotes e ogni campo futuro"* | `SessionEditor.tsx` :188-196 | Sostituire un esercizio conserva il recupero. Comportamento corretto: non toccarlo. |
| `EditableExercise extends PlannedExercise` con `exerciseName` e `showNotes` | `SessionEditor.tsx` :34-37 | Il picker inline aggiunge un flag UI locale (`showRest`) **a questo tipo**, non a `PlannedExercise`. La separazione fra stato UI e stato persistito esiste già: rispettala. |
| Barra controlli della riga: `flex flex-wrap items-center gap-3` con Stepper Set, Stepper Reps, pill "Carico N kg", bottone Nota spinto da `ml-auto` | `SessionEditor.tsx` :376-423 | Il controllo recupero entra **in questa barra**, prima del `ml-auto`. Nessuna riga nuova nel layout, nessun accordion. |
| `RestTimer` riceve `active: number | null` (secondi) e costruisce `endAt = Date.now() + active * 1000` | `app/allenamento/_components/RestTimer.tsx` :42-53 | ✅ **RestTimer accetta già qualunque durata.** Non va modificato: il valore per-esercizio è solo un numero diverso passato nella stessa prop. |
| `useCountdown(endAt, onEnd)` lavora su scadenza assoluta, con resync su `visibilitychange` e `firedForRef` per non richiamare `onEnd` due volte | `app/allenamento/_lib/useDeadline.ts` :81-130 | ✅ **`useDeadline.ts` non va toccato.** È già agnostico rispetto alla durata. Ogni cambio di `active` genera un `endAt` nuovo, quindi un `firedForRef` nuovo: nessun beep fantasma. |
| `REST_PRESETS = [60, 90, 120, 180]` è esportato **da dentro** `RestTimer.tsx` (`export { PRESETS as REST_PRESETS }`) | `RestTimer.tsx` :33, :236 | 🔴 Importarlo in `SessionEditor` trascinerebbe nel bundle di `/scheda` anche `FocusShell`, `useWakeLock`, `SessionTimer` e la Web Audio API. La costante va estratta in un modulo neutro (decisione 2). |
| La formattazione dell'etichetta (`s < 60 ? "Ns" : "Nm..."`) è scritta inline dentro `RestPresetPicker` | `RestPresetPicker.tsx` :36 | Va estratta insieme alla costante, o la duplichi per la terza volta nell'editor. |
| `restDefault` è `useState(90)` **locale a `allenamento/page.tsx`**, e `RestPresetPicker` è renderizzato solo nel ramo `!active` | `app/allenamento/page.tsx` :36, :102 | 🔴 Il "preset globale" oggi **non è persistito**: si azzera a 90 a ogni ricarica, e a sessione avviata non è più modificabile. Il fallback richiesto dal task non esiste ancora davvero (decisione 3). |
| `handleCompleteSet(exIndex, set)` chiama `setRestActive(restDefault)` e **ha già `exIndex` in mano** | `allenamento/page.tsx` :129-134 | ✅ Il punto di risoluzione `per-esercizio ?? globale` è **una sola riga, in un solo posto**. Non serve propagare nulla dentro RestTimer. |
| `startSession()` costruisce `ActiveExercise` copiando `targetSets: pe.sets, targetReps: pe.reps` | `app/today/_lib/WorkoutSessionContext.tsx` :159-175 | Precedente architetturale già presente: la sessione attiva **fotografa** i parametri del piano. Il recupero segue la stessa regola (decisione 1). |
| `active` è persistito su `active_sessions.data` (jsonb, PK `user_id`) e ricaricato al mount; `persistActive` è fire-and-forget | `WorkoutSessionContext.tsx` :106-157 | Un campo nuovo dentro `ActiveExercise` **non richiede migrazione**. Le righe salvate prima leggeranno `undefined` → fallback globale. |
| `allenamento/page.tsx` legge nota e carico da `todaySession.exercises[i]` per indice posizionale | `allenamento/page.tsx` :173-175 | 🔴 Pattern fragile: `active` sopravvive al reload e alla mezzanotte, `todaySession` no (`PlanContext` scarta `todayOverride` se `parsed.date !== todayISO()`). Non estendere questo pattern al recupero (decisione 1). |
| `Settings` è un jsonb letto con `{ ...defaultSettings, ...data.settings }` | `app/today/_lib/SettingsContext.tsx` :68 | ✅ Aggiungere una chiave a `Settings` è retrocompatibile **per costruzione**: i profili salvati prima ereditano il default. Zero migrazione. |
| `ExerciseSetCard` riceve già `notes?` e `suggestedWeight?` opzionali e li mostra in testata | `app/allenamento/_components/ExerciseSetCard.tsx` :15-23 | Il recupero attivo si mostra con lo stesso pattern: prop opzionale, chip in testata accanto a `{targetSets} × {targetReps}`. |
| `FocusShell` è un contenitore puro (`open`, `label`, `onExit`, `accent`, `wakeLockActive`, `children`) | `app/allenamento/_components/FocusShell.tsx` | ✅ **Non va toccato.** Riceve il countdown già calcolato da RestTimer; la durata non lo riguarda. |
| Palette: `bg-[#FAF7F0]`, card `rounded-2xl border border-emerald-900/5 bg-white shadow-sm`, chip `rounded-md bg-teal-50 px-2 py-1 text-[10px] font-bold uppercase text-teal-700`, label `text-[10px] font-bold uppercase text-emerald-800/60` | tutto il repo | Il picker inline usa il chip teal già in uso per "Carico N kg". Nessun colore nuovo. |
| `AGENTS.md`: "This is NOT the Next.js you know" | root | Leggere `node_modules/next/dist/docs/` prima di toccare route o config. Consultare `graph.json` prima di ogni import. |

### Struttura dati coinvolta

```
profiles.plan  (jsonb)
└── WeeklyPlan
    ├── sessions: WorkoutSession[]
    │   └── exercises: PlannedExercise[]
    │       └── restSeconds?: number      ← 🆕 CAMPO NUOVO, opzionale
    └── weekMap: (string|null)[7]

profiles.settings  (jsonb)
└── Settings
    └── restDefaultSeconds: number        ← 🆕 CHIAVE NUOVA, default 90

active_sessions.data  (jsonb)
└── ActiveSession
    └── exercises: ActiveExercise[]
        └── restSeconds?: number          ← 🆕 SNAPSHOT preso da startSession
```

⚠️ **Nessuna migrazione SQL.** Tutte e tre le colonne toccate sono già jsonb esistenti.

### Catena di fallback (la regola completa, in un posto solo)

```
recupero effettivo =
    active.exercises[i].restSeconds          // override "solo per oggi" nella card
 ?? snapshot preso da PlannedExercise.restSeconds al momento di startSession
 ?? settings.restDefaultSeconds              // preset globale persistito
 ?? 90                                       // default hard-coded in defaultSettings
```

I primi due livelli vivono **entrambi** in `ActiveExercise.restSeconds` (lo snapshot ci viene scritto alla partenza, l'override lo sovrascrive), quindi a runtime la risoluzione è letteralmente `ex.restSeconds ?? settings.restDefaultSeconds`.

---

## Le 4 decisioni architetturali da rispettare

**1. La sessione attiva fotografa il recupero, non lo rilegge dal piano.**
La tentazione è leggere `todaySession.exercises[i].restSeconds` in `handleCompleteSet`, come già si fa per `notes` e `suggestedWeight`. È il pattern esistente ed è già sottilmente rotto: `active` è persistito su Supabase e sopravvive a reload, chiusura dell'app e mezzanotte, mentre `todaySession` è ricalcolato da `plan` + `todayOverride`, e `PlanContext` **scarta l'override quando la data cambia**. Se l'utente modifica la scheda a metà allenamento, o riordina gli esercizi col drag&drop, o la sessione attraversa la mezzanotte, l'indice `i` punta a un esercizio diverso o a `undefined`. Per una nota che sparisce è un fastidio; per un timer che governa l'allenamento è un bug che l'utente non riesce nemmeno a descrivere. `startSession` copia già `targetSets` e `targetReps` dentro `ActiveExercise` proprio per questo motivo: `restSeconds` segue la stessa strada, e da quel momento la sessione è immune a qualunque modifica del piano.

**2. `REST_PRESETS` esce da `RestTimer.tsx` e finisce in un modulo neutro.**
Oggi la costante è esportata in coda a un componente client che importa `FocusShell`, `useWakeLock`, `SessionTimer` e istanzia un `AudioContext`. Importarla da `SessionEditor` significa trascinare tutto quel grafo nel bundle di `/scheda`, una pagina che con il timer non c'entra nulla. Un file `app/allenamento/_lib/restPresets.ts` senza `"use client"` e senza import — la costante più la funzione di etichettatura oggi duplicata inline in `RestPresetPicker` — costa dieci righe e risolve sia il bundle sia la terza duplicazione della stessa formattazione. `RestTimer.tsx` continua a ri-esportare `REST_PRESETS` così `RestPresetPicker` non si accorge di niente.

**3. Il "preset globale" va reso davvero globale, altrimenti il fallback non esiste.**
`restDefault` è `useState(90)` dentro `allenamento/page.tsx`: si azzera a ogni ricarica e, poiché `RestPresetPicker` è renderizzato solo nel ramo `!active`, a sessione avviata non è più raggiungibile. Chiamarlo "preset globale" nel design del task sarebbe una finzione. Diventa `settings.restDefaultSeconds`, e la retrocompatibilità è gratuita: `SettingsContext` fa già `{ ...defaultSettings, ...data.settings }`, quindi ogni profilo salvato prima eredita 90 senza migrazione e senza codice di upgrade. È una riga in `Settings`, una in `defaultSettings`, e `onChange` che chiama `updateSettings` invece di `setState`.

**4. `RestTimer.tsx`, `useDeadline.ts` e `FocusShell.tsx` non si toccano.**
Vale la pena dirlo esplicitamente perché il titolo del task li nomina. `RestTimer` riceve `active: number | null` e ne ricava `endAt = Date.now() + active * 1000`: qualunque durata funziona già. `useCountdown` lavora su scadenza assoluta con resync su `visibilitychange` e `firedForRef` ancorato a `endAt`, quindi un cambio di durata produce un `endAt` nuovo e quindi un `onEnd` nuovo, senza beep fantasma dalla scadenza precedente. `FocusShell` è un guscio che non sa nemmeno cosa sta mostrando. **Tutta la feature si risolve cambiando quale numero viene passato nella prop `active` già esistente.** Se ti ritrovi a modificare uno di questi tre file, ti sei allontanato dalla soluzione.

### Librerie da installare

**Nessuna.** Le icone (`Timer`, `X`, `RotateCcw`, `Check`) sono già in `lucide-react`. `@dnd-kit` è già installato e il picker inline deve solo evitare di rompere il drag (vedi nota finale).

---

## MICRO-PROMPT 1 — Fondamenta: tipo, modulo preset, default globale persistito

Copia da qui:

```
Lavora sul repo fitness-app. Task: livello dati del recupero per-esercizio. NON toccare SessionEditor, ExerciseSetCard, WorkoutSessionContext né allenamento/page.tsx in questo step.

Consulta graph.json e leggi PRIMA questi file:
 - app/today/_lib/types.ts                        (PlannedExercise, CompletedSet)
 - app/allenamento/_components/RestTimer.tsx      (dove vive oggi REST_PRESETS)
 - app/allenamento/_components/RestPresetPicker.tsx
 - app/today/_lib/SettingsContext.tsx             (Settings, defaultSettings, merge coi default)

1) app/today/_lib/types.ts — aggiungi UN campo opzionale a PlannedExercise, dopo suggestedWeight:

   /**
    * Recupero pianificato per questo esercizio, in secondi.
    * undefined = usa il default globale (settings.restDefaultSeconds).
    * NON confondere con CompletedSet.restSeconds, che è il recupero
    * effettivamente osservato dopo un set.
    */
   restSeconds?: number;

   Non modificare nessun altro campo. Non toccare CompletedSet.

2) Crea app/allenamento/_lib/restPresets.ts. NESSUN "use client", NESSUN import:

   /** Preset di recupero, in secondi. */
   export const REST_PRESETS = [60, 90, 120, 180] as const;

   /** Default globale di fabbrica, usato da defaultSettings. */
   export const REST_DEFAULT_SECONDS = 90;

   /** Limiti di un valore di recupero personalizzato. */
   export const REST_MIN_SECONDS = 15;
   export const REST_MAX_SECONDS = 600;

   /** "45s", "1m30s", "2m" — etichetta compatta per chip e pill. */
   export function formatRestLabel(seconds: number): string

   /** Clampa e arrotonda ai 5s; ritorna null per input non validi o <= 0. */
   export function normalizeRest(input: number | string): number | null

   formatRestLabel deve replicare ESATTAMENTE la logica oggi inline in
   RestPresetPicker.tsx riga 36 (s < 60 ? `${s}s` : `${s/60}m${s%60 ? `${s%60}s` : ""}`),
   gestendo anche i valori non multipli di 60 (es. 45 -> "45s", 105 -> "1m45s").

3) app/allenamento/_components/RestTimer.tsx — SOLO due modifiche chirurgiche:
   - importa PRESETS da ../_lib/restPresets invece di dichiararlo:
       import { REST_PRESETS } from "../_lib/restPresets";
     e usalo dove oggi c'è la costante locale PRESETS
   - mantieni in coda la ri-esportazione `export { REST_PRESETS };` così
     RestPresetPicker continua a funzionare senza modifiche ai suoi import
   NON toccare nient'altro di questo file: né useCountdown, né endAt, né il beep,
   né FocusShell. La logica del countdown è già corretta per qualunque durata.

4) app/allenamento/_components/RestPresetPicker.tsx:
   - importa formatRestLabel da ../_lib/restPresets e usala al posto della
     formattazione inline alla riga 36
   - nessun altro cambiamento: le prop { value, onChange } restano identiche

5) app/today/_lib/SettingsContext.tsx:
   - aggiungi a `interface Settings`:  restDefaultSeconds: number;
   - aggiungi a `defaultSettings`:     restDefaultSeconds: REST_DEFAULT_SECONDS,
     (importa la costante da ../../allenamento/_lib/restPresets)
   - NON scrivere codice di migrazione: la riga 68 fa già
     { ...defaultSettings, ...data.settings }, quindi i profili salvati prima
     ereditano automaticamente il default. Aggiungi solo un commento che lo dica.

6) VERIFICA obbligatoria:
   - npx tsc --noEmit && npm run lint && npm run build → tutti verdi
   - crea uno script temporaneo /tmp/check-rest.ts, eseguilo con npx --yes tsx e
     asserisci: formatRestLabel su [15, 45, 60, 90, 105, 120, 180, 600] e
     normalizeRest su [0, -5, "abc", "90", 7, 12.4, 900] (deve clampare a 600,
     arrotondare ai 5s e ritornare null su input non validi).
     Cancella lo script e incolla l'output nel riepilogo.
```

---

## MICRO-PROMPT 2 — Picker inline compatto in `SessionEditor`

```
Lavora sul repo fitness-app. Task: impostare il recupero per singolo esercizio nell'editor della scheda. Presuppone il MICRO-PROMPT 1 applicato.

Leggi PRIMA app/scheda/_components/SessionEditor.tsx per intero. Nota tre punti:
 - EditableExercise (riga ~34) estende PlannedExercise con campi di sola UI
 - la barra controlli della riga è a riga ~376: flex flex-wrap items-center gap-3
 - handleSave (riga ~226) costruisce `cleaned` con whitelist ESPLICITA dei campi

1) EditableExercise: aggiungi il flag di sola UI
     showRest: boolean;   // il picker recupero è chiuso di default
   Inizializzalo a `!!pe.restSeconds` nell'useEffect che carica la sessione
   (stesso identico pattern di showNotes) e a `false` in addExerciseFromPicker.

2) Crea app/scheda/_components/RestPicker.tsx, "use client":

     interface RestPickerProps {
       value?: number;                          // undefined = eredita il globale
       globalDefault: number;                   // solo per l'etichetta "Globale (90s)"
       onChange: (seconds: number | undefined) => void;
     }

   Rendering: una riga di chip che sta dentro la card senza allargarla.
     - chip "Globale (Xs)" → onChange(undefined), attivo quando value === undefined
     - un chip per ogni REST_PRESETS, etichetta da formatRestLabel
     - un input numerico compatto (w-16, step 15, inputMode numeric) per un valore
       fuori preset, che passa da normalizeRest prima di chiamare onChange
   Stile: chip `rounded-full px-2 py-0.5 text-[10px] font-bold uppercase`,
   attivo `bg-teal-600 text-white`, inattivo `bg-emerald-50 text-emerald-800/60
   hover:bg-emerald-100`. Contenitore `flex flex-wrap items-center gap-1
   rounded-lg bg-[#FAF7F0] p-2`.
   Nessuno stato interno oltre alla stringa dell'input libero: il componente è
   controllato.

3) SessionEditor, barra controlli della riga — inserisci PRIMA del bottone Nota
   (quello con ml-auto), così l'allineamento a destra della nota resta invariato:

     <button
       type="button"
       onClick={() => updateEx(ex.id, { showRest: !ex.showRest })}
       className={ ex.restSeconds !== undefined
         ? "flex items-center gap-1 rounded-md bg-teal-50 px-2 py-1 text-[10px] font-bold uppercase text-teal-700 hover:bg-teal-100"
         : "flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700 hover:bg-emerald-100" }
     >
       <Timer className="h-3 w-3" />
       {ex.restSeconds !== undefined ? formatRestLabel(ex.restSeconds) : "Recupero"}
     </button>

   e sotto la barra, prima di <ProgressionHint>, il pannello condizionale:

     {ex.showRest && (
       <RestPicker
         value={ex.restSeconds}
         globalDefault={settings.restDefaultSeconds}
         onChange={(s) => updateEx(ex.id, { restSeconds: s })}
       />
     )}

   Importa useSettings da ../../today/_lib/SettingsContext per globalDefault.
   Importa Timer da lucide-react e formatRestLabel da ../../allenamento/_lib/restPresets.

4) 🔴 handleSave — IL PUNTO CRITICO DI QUESTO TASK.
   Dentro il map che costruisce `cleaned`, aggiungi accanto agli spread esistenti:

     ...(typeof e.restSeconds === "number" && e.restSeconds > 0
       ? { restSeconds: e.restSeconds }
       : {}),

   Senza questa riga tutto compila, la UI funziona, e il valore viene silenziosamente
   scartato al salvataggio. `showRest` NON deve finire in `cleaned`: è stato di UI,
   esattamente come showNotes.

5) Non toccare replaceExercise: usa già lo spread e conserva restSeconds. Non toccare
   il drag&drop.

6) VERIFICA obbligatoria:
   - npx tsc --noEmit && npm run lint && npm run build → tutti verdi
   - Collaudo manuale su /scheda:
     1. apri una sessione, imposta 120s su un esercizio e 180s su un altro, lasciane
        uno su "Globale", salva
     2. RICARICA LA PAGINA e riapri la stessa sessione → i valori devono esserci
        ancora (è questo il test che smaschera il punto 4)
     3. su Supabase, ispeziona profiles.plan: gli oggetti esercizio devono contenere
        "restSeconds": 120 e "restSeconds": 180, e l'esercizio su "Globale" NON deve
        avere affatto la chiave (non `null`, non `0`: assente)
     4. rimetti un esercizio su "Globale" e salva → la chiave sparisce dal jsonb
     5. usa "Sostituisci esercizio" su una riga con recupero impostato → il valore
        deve sopravvivere al cambio
     6. trascina le righe per riordinarle → nessun errore e i valori seguono la riga
   - Riporta l'esito dei 6 punti nel riepilogo.
```

---

## MICRO-PROMPT 3 — Runtime: snapshot nella sessione attiva e avvio automatico

```
Lavora sul repo fitness-app. Task: far partire il timer col valore dell'esercizio durante la sessione. Presuppone i MICRO-PROMPT 1 e 2 applicati.

Leggi PRIMA:
 - app/today/_lib/WorkoutSessionContext.tsx  (ActiveExercise, startSession, persistActive)
 - app/allenamento/page.tsx                  (restDefault, handleCompleteSet, RestTimer)
 - app/allenamento/_components/ExerciseSetCard.tsx

⚠️ NON modificare RestTimer.tsx, useDeadline.ts, FocusShell.tsx. Accettano già
qualunque durata: questo step cambia solo QUALE numero arriva nella prop `active`.

1) WorkoutSessionContext.tsx

   a. interface ActiveExercise — aggiungi:
        /** Recupero in secondi fotografato dal piano all'avvio, o impostato
            al volo durante la sessione. undefined = default globale. */
        restSeconds?: number;

   b. startSession — nel map che costruisce le exercises aggiungi
        restSeconds: pe.restSeconds,
      accanto a targetSets/targetReps. È uno SNAPSHOT: da qui in poi la sessione
      non rilegge più il piano.

   c. Aggiungi un metodo al context value:
        setExerciseRest: (exerciseIndex: number, seconds: number | null) => void;
      Implementazione: se !active esci; costruisci il next con
      exercises.map((e,i) => i === exerciseIndex
        ? { ...e, restSeconds: seconds ?? undefined }
        : e)
      e chiama persistActive(next). `null` significa "torna al globale".
      Nessuna query nuova: persistActive fa già l'upsert su active_sessions.

   d. Retrocompatibilità: una riga active_sessions salvata prima di oggi non ha
      restSeconds → undefined → fallback globale. Non scrivere codice di migrazione,
      aggiungi solo un commento.

2) app/allenamento/page.tsx

   a. Sostituisci `const [restDefault, setRestDefault] = useState(90);` con la
      lettura da SettingsContext:
        const { settings, updateSettings } = useSettings();
        const restDefault = settings.restDefaultSeconds;
      e nel RestPresetPicker:
        onChange={(s) => updateSettings({ restDefaultSeconds: s })}
      Ora il preset globale è persistito su profiles.settings invece di azzerarsi
      a ogni ricarica.

   b. 🔴 LA RIGA CHIAVE — in handleCompleteSet, che ha già exIndex in mano:
        const handleCompleteSet = (exIndex: number, set: CompletedSet) => {
          addSet(exIndex, set);
          if (totalCompleted + 1 < totalTargetSets) {
            const perExercise = active?.exercises[exIndex]?.restSeconds;
            setRestActive(perExercise ?? restDefault);
          }
        };
      Leggi da `active.exercises`, NON da `todaySession.exercises[exIndex]`:
      todaySession può cambiare o svuotarsi a metà sessione (PlanContext scarta
      todayOverride al cambio di data), active no.

   c. Nel map che renderizza le ExerciseSetCard passa due prop nuove:
        restSeconds={ex.restSeconds ?? restDefault}
        restIsCustom={ex.restSeconds !== undefined}
        onRestChange={(s) => setExerciseRest(i, s)}
      e prendi setExerciseRest da useWorkoutSession().

   d. Non toccare il blocco <RestTimer ... /> in fondo alla pagina.

3) ExerciseSetCard.tsx — visualizzazione e override "solo per oggi"

   a. Prop nuove, tutte opzionali (il componente deve restare usabile senza):
        restSeconds?: number;
        restIsCustom?: boolean;
        onRestChange?: (seconds: number | null) => void;

   b. In testata, accanto a `{targetSets} × {targetReps}` (riga ~93), un chip:
        <Timer className="h-3 w-3" /> {formatRestLabel(restSeconds)}
      stile `bg-teal-50 text-teal-700` se restIsCustom, `bg-emerald-50
      text-emerald-800/60` altrimenti. Title/aria-label esplicito:
      "Recupero impostato per questo esercizio" oppure "Recupero predefinito".
      Se restSeconds è undefined non renderizzare il chip.

   c. Se onRestChange è definito, il chip è cliccabile e apre lo stesso RestPicker
      del MICRO-PROMPT 2 (importalo da ../../scheda/_components/RestPicker) sotto
      la testata, con onChange={(s) => onRestChange(s ?? null)}.
      Chiarisci con una riga text-[10px] text-emerald-800/50 sotto il picker:
      "Vale solo per la sessione di oggi. Per cambiarlo in modo permanente modifica
      la scheda."

4) VERIFICA obbligatoria:
   - npx tsc --noEmit && npm run lint && npm run build → tutti verdi
   - git diff --stat deve mostrare RestTimer.tsx, useDeadline.ts e FocusShell.tsx
     COMPLETAMENTE INVARIATI in questo step. Se compaiono, hai sbagliato strada.
   - Collaudo manuale:
     1. imposta 120s sul primo esercizio della sessione di oggi e lascia il secondo
        su Globale; imposta il globale a 60s dal RestPresetPicker
     2. ricarica /allenamento → il preset globale deve essere ancora 60s (prima si
        azzerava a 90)
     3. avvia la sessione, completa un set del PRIMO esercizio → il timer parte da
        2:00, non da 1:00
     4. completa un set del SECONDO esercizio → il timer parte da 1:00
     5. su Supabase, ispeziona active_sessions.data: il primo esercizio deve avere
        "restSeconds": 120, il secondo non deve avere la chiave
     6. RICARICA la pagina a sessione avviata → il recupero per-esercizio deve
        sopravvivere (viene dallo snapshot, non dal piano)
     7. modifica la scheda in un'altra tab mentre la sessione è attiva → i valori
        della sessione in corso NON devono cambiare (è il punto della decisione 1)
     8. usa il chip nella card per portare il secondo esercizio a 180s, completa un
        set → timer da 3:00; il valore NON deve essere finito in profiles.plan
     9. apri il Focus durante il recupero e lascia scadere il timer → un solo beep,
        nessun doppio onEnd
   - Riporta l'esito dei 9 punti nel riepilogo.
```

---

## Note di attenzione da tenere d'occhio in review

- **Il chip dentro una riga sortable.** `SortableRow` applica `{...listeners}` solo al grip `GripVertical`, quindi i controlli della riga non intercettano il drag. Il `PointerSensor` ha però `activationConstraint: { distance: 8 }` e il `TouchSensor` `{ delay: 180 }`: se il picker inline diventa alto, su mobile un tap impreciso può essere letto come inizio di drag. Se succede, la soluzione è `style={{ touchAction: "manipulation" }}` sul contenitore del picker, **non** allentare i sensori.
- **`restSeconds: 0` non deve mai essere salvato.** La whitelist di `handleSave` usa `> 0` apposta: uno zero in jsonb passerebbe il `?? ` (nullish, non falsy) e produrrebbe un timer che scade all'istante. `normalizeRest` ritorna `null` sullo zero proprio per questo.
- **`CompletedSet.restSeconds` resta non scritto.** Esiste nei tipi dal primo giorno e nessuno lo popola. Se un giorno vuoi il recupero *reale* per le statistiche, il posto giusto è `addSet`, misurando l'intervallo dal set precedente — è un task separato e non va mescolato con questo.
- **Il picker condiviso fra `/scheda` e `/allenamento`.** `RestPicker.tsx` vive sotto `app/scheda/_components/` ma viene importato anche da `ExerciseSetCard`. Se la cosa dà fastidio, il posto neutro è `app/_components/RestPicker.tsx`; farlo ora costa un `mv` e due import, farlo fra tre feature costa una caccia ai riferimenti.
- **`updateSettings` è ottimistico con rollback**, quindi cambiare il preset globale a rete assente aggiorna la UI e poi torna indietro. È il comportamento già in uso ovunque nel repo: non aggiungere un toast solo per questo caso.
- **Il default globale non è esposto in `/impostazioni`.** Resta dove è sempre stato, nella schermata pre-sessione. Se in futuro lo vuoi anche lì, `UnitsSection.tsx` è il modello da copiare — ma sarà la stessa chiave `settings.restDefaultSeconds`, non una seconda.
