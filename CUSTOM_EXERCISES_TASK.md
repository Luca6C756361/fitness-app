# Task — Sviluppatore 2: Gestione Esercizi Custom (Logica & Supabase)

Istruzioni operative per Claude Code sul repo `fitness-app` (Next.js 16.2.12, React 19, Tailwind 4, Supabase `@supabase/ssr`, lucide-react).

---

## 0. Contesto tecnico rilevato nel repo

| Cosa | Dove | Vincolo che ne deriva |
|---|---|---|
| `ExerciseDefinition { id: string; name; primaryMuscle: MuscleGroup; secondaryMuscles: MuscleGroup[]; equipment: Equipment }` | `app/today/_lib/types.ts:105-111` | L'esercizio custom deve essere **questo tipo**, non uno nuovo. Si aggiungono solo campi opzionali (precedente già in repo: `Food` esteso dallo scanner). |
| `exerciseDatabase: ExerciseDefinition[]` — 36 esercizi, id parlanti (`"squat"`, `"panca-piana"`) | `app/today/_lib/exerciseData.ts:11-68` | **Immutabile.** È il seed di default, referenziato da `defaultWeeklyPlan`. Nessun esercizio custom viene scritto qui; nessun id custom deve poter collidere con questi. |
| `muscleGroupLabels`, `equipmentLabels` | `app/today/_lib/exerciseData.ts` | Le label del form di creazione si generano da qui, non hardcodate. |
| `usePlan().exercises` = `exerciseDatabase` (riga 219) e `getExerciseDef(id)` = `exerciseDatabase.find(...)` (riga 144) | `app/today/_lib/PlanContext.tsx` | ⚠️ **Unico punto di fusione.** Cambiando queste due righe, `ExercisePicker`, `ExerciseBrowser`, `SessionEditor`, `WorkoutCard`, `SessionList` e `/allenamento` vedono gli esercizi custom **senza modifiche**. Se `getExerciseDef` non viene esteso, ogni esercizio custom appare come `"?"` in tutta l'app (fallback `?? "?"` presente in 5 file). |
| `ExercisePicker` legge `usePlan().exercises` internamente; props: `open/onClose/onSelect/excludeIds` | `app/scheda/_components/ExercisePicker.tsx:26-32` | La sorgente dati **non cambia**: arriva già fusa dal context. Si aggiunge solo la UI di creazione. |
| `ExerciseBrowser` è puramente presentazionale: riceve `exercises/onAdd/addedIds` da `componi/page.tsx` (che a sua volta usa `usePlan().exercises`) | `app/allenamento/componi/_components/ExerciseBrowser.tsx:15-19` | Le props nuove (badge "Custom", `onDelete`) devono essere **opzionali**, per non rompere il chiamante esistente. |
| `filtered` filtra con `e.name.toLowerCase().includes(query.toLowerCase())` in entrambi i componenti | `ExercisePicker.tsx:43-52`, `ExerciseBrowser.tsx:34-41` | La ricerca è già case-insensitive: la stessa normalizzazione va riusata per la deduplica, non reinventata. |
| `supabase` = `createBrowserClient` da `@supabase/ssr`, singleton client-side | `app/_lib/supabase/client.ts` | Ogni query gira nel browser: **la sicurezza è tutta nella RLS**, non nel codice React. |
| `useAuth()` → `{ user, loading }` da `AuthContext` | `app/_lib/AuthContext.tsx` | Nessuna scrittura senza `user`: replicare la guardia `if (!user) return;` già usata in `PlanContext`/`WorkoutSessionContext`. |
| `middleware.ts` redirige a `/login` ogni rotta senza sessione | `middleware.ts:33` | Non esistono utenti anonimi dentro l'app: `user_id` è sempre disponibile nelle pagine. |
| `resetAll()` cancella `diary_entries`, `weight_entries`, `workout_logs`, `active_sessions` con `.eq("user_id", ...)` — commento in repo: *"PostgREST rifiuta le DELETE senza filtro"* | `app/today/_lib/SettingsContext.tsx:103-118` | La nuova tabella va aggiunta a questa lista, e ogni DELETE deve avere `.eq()` esplicito anche con RLS attiva. |
| `public/sw.js` non intercetta mai altre origini (Supabase incluso) | `public/sw.js:23-30` | Offline, le query Supabase **falliscono e basta**: il service worker non le salva. L'unica difesa offline è una cache applicativa in `localStorage`. |
| `supabase/migrations/` **non esiste**; nel repo non c'è nessun `.sql` e il `package.json` non ha la CLI Supabase | root | La migration va creata come file versionato **e** scritta per essere eseguibile con copia-incolla nella SQL Editor di Supabase Studio. Non aggiungere `supabase` alle dipendenze. |
| `AGENTS.md`: "This is NOT the Next.js you know" | root | Ogni prompt include l'obbligo di leggere `node_modules/next/dist/docs/` prima di toccare config, route handler o convenzioni di file. |

### Schema database

Esistente (ricavato dalle query nel repo, nessun file SQL versionato):

| Tabella | Colonne usate dal codice | Rilevanza qui |
|---|---|---|
| `profiles` | `id`, `plan` (jsonb `WeeklyPlan`), `goals`, `settings`, dati anagrafici | `plan.sessions[].exercises[].exerciseId` **può puntare a un esercizio custom** → vincolo di integrità referenziale a carico dell'app (nessuna FK possibile: è jsonb). |
| `workout_logs` | `id` uuid, `user_id`, `date`, `session_name`, `duration_seconds`, `exercises` (jsonb `CompletedExercise[]`) | `CompletedExercise` salva **`name` inline** ("salvato inline per storico stabile anche se rinomini", `types.ts:165`) → lo storico sopravvive alla cancellazione di un esercizio custom. Questo è ciò che rende accettabile la hard delete. |
| `active_sessions` | `user_id` (PK), `data` (jsonb) | Idem: la sessione in corso porta il nome inline. |

Nuova (da creare nel micro-prompt 1):

```
custom_exercises
  id                 uuid        PK, default gen_random_uuid()
  user_id            uuid        NULL, references auth.users(id) on delete cascade
  name               text        NOT NULL, check length 2..60
  primary_muscle     text        NOT NULL, check IN (11 valori di MuscleGroup)
  secondary_muscles  text[]      NOT NULL default '{}'
  equipment          text        NOT NULL, check IN (7 valori di Equipment)
  created_at         timestamptz NOT NULL default now()
  unique nulls not distinct (user_id, lower(name))
```

### Le 3 decisioni architetturali da rispettare

1. **`user_id` nullable = una sola tabella per esercizi personali e futuri esercizi globali.** `user_id IS NULL` significa "esercizio di catalogo, visibile a tutti"; `user_id = auth.uid()` significa "mio". La RLS traduce questa semantica in **immutabilità gratuita dei default**: la policy di SELECT ammette `user_id IS NULL OR auth.uid() = user_id`, mentre INSERT/UPDATE/DELETE richiedono `auth.uid() = user_id` — una riga globale non è modificabile da nessun client, anon key compresa, senza scrivere una riga di codice difensivo in React. I 36 esercizi di `exerciseData.ts` **restano nel file**: non vanno seedati nella tabella (romperebbero i `defaultWeeklyPlan` e la build statica).
2. **Deduplica a due livelli, perché il DB da solo non basta.** Il `unique nulls not distinct (user_id, lower(name))` impedisce due "Panca Scott" dello stesso utente, ma **non sa nulla dei 36 esercizi statici**: "Squat con bilanciere" passerebbe il vincolo. Quindi la validazione applicativa è obbligatoria e va fatta su una chiave normalizzata (trim → lowercase → collasso degli spazi → rimozione dei diacritici via `normalize("NFD")`) confrontata con la lista **fusa**. Il vincolo DB resta come rete di sicurezza per le race condition tra due tab: l'errore Postgres `23505` va intercettato e tradotto in un messaggio italiano, non lasciato passare come "errore generico".
3. **La UI non aspetta mai la rete.** Gli esercizi custom si caricano in `PlanContext` allo stesso modo del `plan`, ma con due protezioni in più: (a) una cache `localStorage` (`fitness-app:customExercises`) letta **sincronicamente al primo render**, così il picker è popolato anche offline o con rete lenta; (b) inserimento e cancellazione **ottimistici** con rollback sull'errore, come già fa `persistPlan` (`PlanContext.tsx:121-135`). Il service worker non intercetta Supabase: senza questa cache, offline il picker mostrerebbe solo i 36 esercizi statici e l'utente crederebbe di aver perso i suoi.

### Librerie da installare

**Nessuna.** `@supabase/ssr`, `@supabase/supabase-js` e `lucide-react` (icone `Plus`, `Trash2`, `Sparkles`, `AlertTriangle`, `Loader2`) sono già in `package.json`. Non aggiungere la CLI Supabase, non aggiungere librerie di validazione: i check sono 4 campi e stanno in una funzione pura.

---

## MICRO-PROMPT 1 — Migration SQL, tipi, data layer

Copia da qui:

```
Lavora sul repo fitness-app. Task: livello dati degli esercizi custom. NON toccare nessun componente UI e nessun context in questo step.

Leggi prima app/today/_lib/types.ts (ExerciseDefinition, MuscleGroup, Equipment) e app/_lib/supabase/client.ts.

1) Crea la cartella supabase/migrations/ (non esiste) e dentro il file
   supabase/migrations/0001_custom_exercises.sql, eseguibile anche con copia-incolla
   nella SQL Editor di Supabase Studio (nel repo non c'è la CLI Supabase e non va aggiunta):

   create table if not exists public.custom_exercises (
     id                uuid primary key default gen_random_uuid(),
     user_id           uuid references auth.users(id) on delete cascade,
     name              text not null check (char_length(trim(name)) between 2 and 60),
     primary_muscle    text not null check (primary_muscle in ('petto','schiena','spalle','bicipiti','tricipiti','quadricipiti','femorali','glutei','polpacci','core','cardio')),
     secondary_muscles text[] not null default '{}',
     equipment         text not null check (equipment in ('bilanciere','manubri','cavi','macchina','corpo-libero','kettlebell','elastici')),
     created_at        timestamptz not null default now()
   );

   -- user_id NULL = esercizio globale di catalogo. "nulls not distinct" richiede PG15+ (Supabase è PG15+).
   create unique index if not exists custom_exercises_user_name_uniq
     on public.custom_exercises (user_id, lower(trim(name))) nulls not distinct;

   create index if not exists custom_exercises_user_idx on public.custom_exercises (user_id);

   alter table public.custom_exercises enable row level security;

   -- Lettura: i miei + quelli globali (user_id IS NULL)
   create policy "custom_exercises_select" on public.custom_exercises
     for select using (user_id is null or auth.uid() = user_id);

   -- Scrittura: solo i miei. Le righe globali diventano così IMMUTABILI da qualsiasi client.
   create policy "custom_exercises_insert" on public.custom_exercises
     for insert with check (auth.uid() = user_id);
   create policy "custom_exercises_update" on public.custom_exercises
     for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
   create policy "custom_exercises_delete" on public.custom_exercises
     for delete using (auth.uid() = user_id);

   NON inserire i 36 esercizi di exerciseData.ts in questa tabella: restano nel file TypeScript,
   sono referenziati da defaultWeeklyPlan e non devono dipendere dalla rete.
   Aggiungi in testa al file un commento con data e scopo, e in coda un blocco commentato
   "-- rollback: drop table public.custom_exercises cascade;".

2) In app/today/_lib/types.ts estendi ExerciseDefinition con SOLO campi opzionali
   (stesso pattern già usato per Food nello scanner nutrizionale — non modificare i campi esistenti):
     source?: "default" | "custom";
     createdAt?: string;   // ISO, solo per i custom

3) Crea app/today/_lib/customExercises.ts. Nessun import React. Esporta:

   export const CUSTOM_CACHE_KEY = "fitness-app:customExercises";

   /** Chiave di confronto: trim, lowercase, spazi collassati, diacritici rimossi. */
   export function normalizeName(name: string): string
     → name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ")

   export interface CustomExerciseInput {
     name: string;
     primaryMuscle: MuscleGroup;
     secondaryMuscles: MuscleGroup[];
     equipment: Equipment;
   }

   export type ValidationError =
     | "name_too_short" | "name_too_long" | "duplicate" | "invalid_muscle" | "invalid_equipment";

   /** Validazione pura, usata dal form PRIMA di chiamare la rete. `existing` = lista FUSA (statici + custom). */
   export function validateExercise(
     input: CustomExerciseInput,
     existing: ExerciseDefinition[]
   ): ValidationError | null
     - nome normalizzato < 2 caratteri → "name_too_short"; > 60 → "name_too_long"
     - normalizeName già presente in `existing` → "duplicate"   ← copre anche i 36 statici, che il DB non conosce
     - primaryMuscle non in muscleGroupLabels → "invalid_muscle"
     - equipment non in equipmentLabels → "invalid_equipment"
     - secondaryMuscles: rimuovi duplicati e l'eventuale primaryMuscle, non è un errore

   export const validationMessages: Record<ValidationError, string>  // messaggi in italiano, pronti per la UI

   /** Riga DB → ExerciseDefinition. snake_case → camelCase, source sempre "custom". */
   export function rowToExercise(row: CustomExerciseRow): ExerciseDefinition

   /** Fusione: statici prima, custom dopo, ordinati per nome (localeCompare "it"). Dedup per id. */
   export function mergeExercises(base: ExerciseDefinition[], custom: ExerciseDefinition[]): ExerciseDefinition[]

   Funzioni di rete (usano il singleton `supabase` da app/_lib/supabase/client.ts, mai un client nuovo):
   export async function fetchCustomExercises(userId: string): Promise<ExerciseDefinition[]>
     - select("id, user_id, name, primary_muscle, secondary_muscles, equipment, created_at")
     - .or(`user_id.eq.${userId},user_id.is.null`)   // i miei + i globali
     - .order("created_at", { ascending: false })
     - errori: console.error("[exercises]", error.message) e ritorna [] (mai un throw: la UI non deve rompersi)

   export async function insertCustomExercise(userId: string, input: CustomExerciseInput): Promise<{ exercise?: ExerciseDefinition; error?: "duplicate" | "network" }>
     - insert({ user_id: userId, name: input.name.trim(), primary_muscle, secondary_muscles, equipment })
       .select("id, user_id, name, primary_muscle, secondary_muscles, equipment, created_at").single()
     - se error.code === "23505" → { error: "duplicate" }   ← race tra due tab: il vincolo DB è l'ultima difesa
     - altro errore → { error: "network" }

   export async function deleteCustomExercise(userId: string, id: string): Promise<boolean>
     - .delete().eq("id", id).eq("user_id", userId)
     - il doppio filtro è obbligatorio: PostgREST rifiuta le DELETE senza filtro anche con RLS attiva
       (vedi il commento in SettingsContext.tsx:107)

4) Verifica prima di dichiarare finito:
   - npx tsc --noEmit && npm run lint  → zero errori
   - npm run build  → deve passare
   - esegui la migration nella SQL Editor del progetto Supabase, poi verifica in Studio:
     * la tabella esiste e mostra "RLS enabled"
     * le 4 policy sono elencate
     * un INSERT manuale con user_id di un altro utente viene RIFIUTATO
     * un secondo INSERT con lo stesso nome in maiuscolo ("panca scott" dopo "Panca Scott") viene RIFIUTATO con 23505
   - Incolla nel riepilogo l'esito dei 4 controlli.
```

---

## MICRO-PROMPT 2 — Fusione nel `PlanContext` con cache e ottimismo

```
Lavora sul repo fitness-app. Task: rendere gli esercizi custom disponibili a tutta l'app. NON modificare ancora nessun componente UI: al termine di questo step l'app deve comportarsi esattamente come prima per chi non ha esercizi custom.

Leggi prima app/today/_lib/PlanContext.tsx per intero: replica il suo stile (guardia `if (!user)`, console.error("[tag]", msg), persistenza ottimistica con rollback come persistPlan alle righe 121-135).

A) app/today/_lib/PlanContext.tsx

  1. Nuovi stati:
       const [customExercises, setCustomExercises] = useState<ExerciseDefinition[]>(() => readCustomCache());
       const [exercisesLoading, setExercisesLoading] = useState(true);
     readCustomCache() è una funzione locale che legge CUSTOM_CACHE_KEY da localStorage in try/catch
     e ritorna [] su qualsiasi errore. DEVE essere l'inizializzatore lazy di useState, non un useEffect:
     serve popolata al primo render per non far lampeggiare il picker.
     ATTENZIONE hydration: il file è "use client" ma viene comunque pre-renderizzato sul server, dove
     localStorage non esiste. Usa la stessa strategia già adottata per dayIndex (righe 75-79): stato
     iniziale [] + idratazione della cache dentro un useEffect al mount. Se scegli l'inizializzatore
     lazy devi guardare typeof window === "undefined"; in caso di dubbio segui il pattern di dayIndex,
     è quello che il repo ha già validato contro l'hydration mismatch.

  2. useEffect([user]): se !user → setCustomExercises([]), svuota la cache, setExercisesLoading(false).
     Altrimenti fetchCustomExercises(user.id) → setCustomExercises(rows) e scrivi la cache
     (localStorage.setItem(CUSTOM_CACHE_KEY, JSON.stringify(rows)) in try/catch: la quota può essere piena).
     Se la fetch fallisce (offline), NON svuotare lo stato: la cache già caricata resta valida.

  3. Lista fusa, memoizzata:
       const exercises = useMemo(
         () => mergeExercises(exerciseDatabase, customExercises),
         [customExercises]
       );

  4. ⚠️ PUNTO CRITICO — getExerciseDef (riga 144) oggi cerca solo in exerciseDatabase.
     Deve cercare nella lista FUSA:
       const exerciseIndex = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
       const getExerciseDef = useCallback((id: string) => exerciseIndex.get(id), [exerciseIndex]);
     Senza questa modifica, ogni esercizio custom appare come "?" in SessionEditor, SessionList,
     WorkoutCard, /allenamento e /allenamento/componi (fallback `?? "?"` presente in tutti e cinque).
     NOTA: getExerciseDef diventa una funzione memoizzata; SessionEditor la usa già in un useEffect
     con deps [open, session, getExerciseDef] (riga 94) — verifica che non si inneschi un loop
     (con useCallback non succede: l'identità cambia solo quando cambia la lista).

  5. Nuove funzioni esposte, ottimistiche:

     createExercise(input: CustomExerciseInput): Promise<{ ok: boolean; error?: ValidationError | "network" }>
       - se !user → { ok: false, error: "network" }
       - valida con validateExercise(input, exercises) → se errore, ritornalo SENZA chiamare la rete
       - inserimento ottimistico: crea un oggetto temporaneo con id `tmp-${Date.now()}` e source "custom",
         setCustomExercises(prev => [temp, ...prev])
       - chiama insertCustomExercise; al successo SOSTITUISCI il temporaneo con la riga reale
         (l'id definitivo viene dal DB: quello temporaneo non deve mai finire dentro plan.sessions,
         quindi la UI non deve permettere di selezionare l'esercizio finché la Promise non risolve)
       - su errore: rollback (rimuovi il temporaneo) e ritorna l'errore
       - al successo aggiorna la cache localStorage

     deleteExercise(id: string): Promise<{ ok: boolean; usedIn?: string[] }>
       - PRIMA di cancellare, cerca l'id in plan.sessions[].exercises[].exerciseId.
         Se è referenziato, NON cancellare e ritorna { ok: false, usedIn: [nomi delle sessioni] }.
         Motivo: plan è jsonb, non esiste FK, e un exerciseId orfano diventerebbe "?" nella scheda.
       - altrimenti: rimozione ottimistica dallo stato, deleteCustomExercise(user.id, id),
         rollback su false, aggiorna la cache.
       - NON toccare workout_logs: CompletedExercise salva `name` inline (types.ts:165), quindi
         lo storico, VolumeChart e PersonalRecordsCard restano corretti anche dopo la cancellazione.

  6. Aggiorna PlanContextValue con: customExercises, exercisesLoading, createExercise, deleteExercise.
     `exercises` resta nel value con lo stesso nome e lo stesso tipo: i consumatori esistenti non cambiano.

B) app/today/_lib/SettingsContext.tsx — dentro resetAll(), aggiungi al Promise.all:
     supabase.from("custom_exercises").delete().eq("user_id", user.id),
   e subito dopo localStorage.removeItem("fitness-app:customExercises")
   accanto alla riga che rimuove "fitness-app:todayOverride".

C) Verifica:
   - npx tsc --noEmit && npm run lint → zero errori
   - npm run build → deve passare (nessun uso di localStorage in fase di render server)
   - npm run dev: apri /scheda e /allenamento/componi con un utente SENZA esercizi custom →
     comportamento identico a prima, 36 esercizi, nessun errore in console, nessun warning di hydration
   - inserisci una riga a mano in Supabase Studio nella tabella custom_exercises con il tuo user_id →
     ricarica → l'esercizio compare nel picker e in ExerciseBrowser, e il suo nome NON è "?" quando lo
     aggiungi a una sessione
   - DevTools → Application → Local Storage: la chiave fitness-app:customExercises contiene la riga
   - modalità offline (DevTools → Network → Offline) → ricarica → l'esercizio custom è ancora nel picker
```

---

## MICRO-PROMPT 3 — UI: creazione, badge, cancellazione

```
Lavora sul repo fitness-app. Task: interfaccia degli esercizi custom. Non cambiare la firma di usePlan().exercises, non aggiungere query Supabase in questo step (usa solo createExercise/deleteExercise dal context).

A) Crea app/scheda/_components/CustomExerciseForm.tsx ("use client"):

   interface CustomExerciseFormProps {
     open: boolean;
     onClose: () => void;
     onCreated?: (ex: ExerciseDefinition) => void;   // per selezionarlo subito dopo la creazione
   }

   - Riusa <Modal> da app/today/_components/Modal.tsx (stesso pattern di ExercisePicker).
   - Campi: nome (input text, maxLength 60), gruppo primario (chip da muscleGroupLabels),
     attrezzatura (chip da equipmentLabels), gruppi secondari (chip multi-selezione, opzionale).
     Le opzioni si generano da exerciseData.ts: nessuna lista hardcodata nel componente.
   - Validazione live: chiama validateExercise(input, exercises) a ogni cambio e mostra
     validationMessages[errore] sotto il campo interessato; il bottone "Crea esercizio" è disabled
     finché c'è un errore. Il messaggio di duplicato deve dire quale esercizio esiste già.
   - Submit: setSaving(true) → await createExercise(input). Il bottone mostra Loader2 in spin ed è
     disabled durante l'attesa (l'id temporaneo non deve poter essere selezionato).
     * ok → onCreated?.(nuovo esercizio); chiudi; resetta il form
     * error "duplicate" → mostra il messaggio, NON chiudere
     * error "network" → "Esercizio non salvato: controlla la connessione." + bottone Riprova
   - Stile coerente: rounded-2xl, border-emerald-900/10, bg-emerald-600 per l'azione primaria,
     label text-[11px] font-bold uppercase tracking-wide text-emerald-800/70.

B) app/scheda/_components/ExercisePicker.tsx

   - Aggiungi in testa alla lista un bottone "Crea esercizio" (icona Sparkles, bg-emerald-50,
     testo emerald-700) che apre CustomExerciseForm.
   - onCreated: chiama onSelect(nuovo) e chiudi il picker — l'utente ha creato l'esercizio
     per usarlo subito, non per ritrovarlo in fondo alla lista.
   - Nella riga di un esercizio con source === "custom", aggiungi una pill "Custom"
     (bg-teal-50 text-teal-700 text-[10px] font-bold uppercase) accanto al nome.
   - Non toccare la logica di `filtered` né le props del componente.

C) app/allenamento/componi/_components/ExerciseBrowser.tsx

   - Props NUOVE e OPZIONALI (il chiamante componi/page.tsx non deve cambiare firma):
       onDelete?: (id: string) => void;
       deletingId?: string | null;
   - Esercizio con source === "custom": pill "Custom" + bottone Trash2 visibile solo se onDelete
     è passato. Conferma inline a due passaggi (stesso pattern di SessionList.tsx: primo click
     apre il pannellino rosso con AlertTriangle, secondo conferma). Mai window.confirm().
   - In app/allenamento/componi/page.tsx passa onDelete che chiama deleteExercise(id) dal context:
     * se ritorna { ok: false, usedIn } → mostra un avviso ambra
       "Usato in: <nomi>. Rimuovilo da quelle sessioni prima di eliminarlo." e NON cancellare
     * se ok → l'elemento sparisce dalla lista (lo stato del context è già ottimistico)
   - Nessuna modifica ai filtri, alla ricerca o al layout esistente.

D) Verifica finale, obbligatoria prima di dichiarare il task chiuso:
   - npx tsc --noEmit && npm run lint → zero errori
   - npm run build → deve passare
   - Flusso manuale, in quest'ordine:
       1. /scheda → Modifica sessione → Aggiungi → "Crea esercizio" → nome "Panca Scott",
          primario bicipiti, attrezzo bilanciere → l'esercizio viene creato E aggiunto alla sessione
       2. "Salva modifiche" → ricarica la pagina → l'esercizio è ancora nella sessione col nome giusto
          (NON "?"): prova che getExerciseDef legge la lista fusa
       3. riapri "Crea esercizio" e riprova con "panca scott" (minuscolo) → errore duplicato, niente rete
       4. prova con "Squat con bilanciere" → errore duplicato contro un esercizio STATICO
       5. /allenamento/componi → l'esercizio ha la pill Custom e il cestino → prova a eliminarlo
          mentre è usato nella sessione → avviso "Usato in: ..." e nessuna cancellazione
       6. rimuovilo dalla sessione in /scheda, torna su componi → elimina → sparisce; ricarica → assente
       7. esegui un allenamento con un esercizio custom, terminalo, POI elimina l'esercizio →
          /stats: PersonalRecordsCard e VolumeChart mostrano ancora il nome corretto (name inline)
       8. DevTools Offline → ricarica → gli esercizi custom sono ancora nel picker (cache localStorage)
       9. Impostazioni → Reset totale → gli esercizi custom spariscono da DB, stato e localStorage
   - Riporta l'esito dei 9 punti nel riepilogo.
```

---

## Note di attenzione da tenere d'occhio in review

- **`plan` è jsonb: nessuna integrità referenziale.** L'unica protezione contro gli `exerciseId` orfani è il controllo applicativo in `deleteExercise`. Se in futuro arriva la condivisione delle schede tra utenti, quel controllo va rifatto lato server (una funzione Postgres che ispeziona `profiles.plan`), perché il client vedrà solo il proprio piano.
- **`nulls not distinct` richiede PostgreSQL 15+.** Supabase lo è, ma se la migration viene eseguita su un'istanza più vecchia il vincolo va sostituito con due indici parziali (`where user_id is null` / `where user_id is not null`). Verificare con `select version();` prima di lamentarsi dell'errore di sintassi.
- **Id temporaneo `tmp-...`.** È il rischio principale dell'ottimismo: se l'utente riuscisse a selezionare l'esercizio prima della risposta del DB, quell'id finirebbe dentro `profiles.plan` e non risolverebbe più. Il form disabilita l'azione durante il salvataggio; se in review vedi un percorso che aggira quel disabled, è un bug bloccante.
- **La cache `localStorage` non è multi-utente.** È scritta con la chiave fissa `fitness-app:customExercises`: al logout va svuotata (lo fa `useEffect([user])` con `!user`). Su un dispositivo condiviso, senza quello svuotamento un utente vedrebbe i nomi degli esercizi dell'altro — cosmetico, mai persistente, ma va evitato.
- **Ricerca senza accenti.** `normalizeName` toglie i diacritici solo per il confronto di deduplica; la ricerca in `ExercisePicker`/`ExerciseBrowser` resta un `toLowerCase().includes()` accent-sensitive. Se serve coerenza, il posto giusto è un solo helper condiviso, non tre implementazioni diverse.
- **Esercizi globali (`user_id IS NULL`).** Lo schema li prevede ma nessuno li inserisce: sono la porta aperta per spostare un domani i 36 statici nel DB. Finché quel giorno non arriva, `exerciseData.ts` resta la fonte di verità e non va toccato — è ciò che permette all'app di funzionare al primo avvio, offline e senza sessione.
- **Rinomina non prevista.** La policy di UPDATE esiste, ma non c'è UI: rinominare un esercizio è sicuro (lo storico ha il nome inline, il piano usa l'id), quindi è l'estensione naturale successiva.

## Riferimenti nel repo

- `app/today/_lib/types.ts` — `ExerciseDefinition`, `MuscleGroup`, `Equipment`, `CompletedExercise` (nome inline, riga 165)
- `app/today/_lib/exerciseData.ts` — `exerciseDatabase`, `muscleGroupLabels`, `equipmentLabels`, `defaultWeeklyPlan`
- `app/today/_lib/PlanContext.tsx` — `exercises` (219), `getExerciseDef` (144), `persistPlan` con rollback (121-135), pattern anti-hydration `dayIndex` (75-79)
- `app/scheda/_components/ExercisePicker.tsx` — consumatore via `usePlan()`, filtri da non toccare
- `app/allenamento/componi/_components/ExerciseBrowser.tsx` — componente presentazionale, props da estendere in modo opzionale
- `app/scheda/_components/SessionList.tsx` — pattern di conferma inline per la cancellazione
- `app/today/_lib/SettingsContext.tsx` — `resetAll` e il commento sulle DELETE senza filtro (103-118)
- `app/_lib/supabase/client.ts`, `app/_lib/AuthContext.tsx`, `middleware.ts` — client singleton, `user`, protezione rotte
- `public/sw.js` — il service worker non intercetta Supabase (23-30)
- `AGENTS.md` — obbligo di consultare `node_modules/next/dist/docs/`
