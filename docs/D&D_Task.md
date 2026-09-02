
Scheda tecnica — Drag & Drop + Sostituzione Intelligente
# FEATURE: Drag & Drop e Sostituzione Intelligente Esercizi
Repo: fitness-app · Next.js 16.2.12 · React 19 · Tailwind 4 · Supabase · Lucide React

---

## 1. Contesto tecnico rilevato nel repo

**File impattati**
| File | Ruolo attuale |
|---|---|
| `app/scheda/_components/SessionEditor.tsx` | Modale editor sessione. Stato locale `exercises: EditableExercise[]`, render come `<ul>` di `<li>`. Persistenza via `updateSession` / `createSession` di `PlanContext`. |
| `app/scheda/_components/ExercisePicker.tsx` | Modale di selezione. Props: `open`, `onClose`, `onSelect(ex: ExerciseDefinition)`, `excludeIds?: string[]`. Stato interno `query` + `muscle: MuscleGroup \| "all"`. |
| `app/today/_lib/types.ts` | `PlannedExercise`, `ExerciseDefinition` (`primaryMuscle: MuscleGroup`), `WorkoutSession`. |
| `app/today/_components/Modal.tsx` | Wrapper modale condiviso. |

**Strutture dati già definite**
```ts
// PlannedExercise (types.ts)
{ id: string; exerciseId: string; sets: number; reps: number; notes?: string }

// EditableExercise (locale a SessionEditor.tsx)
extends PlannedExercise + { exerciseName: string; showNotes: boolean }
Vincoli rilevati

exercises[i].id è già univoco e stabile (pe-${Date.now()}-${exerciseId}) → usabile direttamente come id sortable, nessun campo aggiuntivo richiesto.
L'ordine dell'array locale è già l'ordine di persistenza: handleSave fa exercises.map(...) in sequenza. Riordinare l'array locale è sufficiente: nessuna modifica a PlanContext né allo schema Supabase.
ExercisePicker è montato una sola volta in fondo a SessionEditor, controllato da pickerOpen: boolean. Va convertito in una macchina a stati per gestire i due usi (aggiungi / sostituisci).
SessionEditor non usa <form>: solo onClick handlers → nessun conflitto DnD/submit.
⚠️ Discrepanza da segnalaresuggestedWeight non esiste in PlannedExercise nel repo attuale. Il micro-prompt 3 implementa la sostituzione con spread-preserving ({ ...prev, exerciseId, exerciseName }): mantiene automaticamente sets, reps, notes e qualsiasi campo futuro incluso suggestedWeight, senza richiedere modifiche quando verrà aggiunto.
2. Decisioni architetturali
A. Libreria DnD → @dnd-kit

Unica libreria mainstream con peer-dep React 19 (react-beautiful-dnd è deprecato, react-sortable-hoc non supporta React 18+).
useSortable + verticalListSortingStrategy: markup invariato, si aggiungono solo ref/style/listeners alla <li> esistente.
Zero dipendenze runtime pesanti (~30kb), tree-shakeable.
B. Sensori: handle-only, mai drag sull'intera riga

La riga contiene input, stepper e textarea: il drag deve partire solo dalla maniglia GripVertical.
PointerSensor con activationConstraint: { distance: 8 } → il click sui bottoni resta reattivo.
TouchSensor con { delay: 180, tolerance: 8 } → long-press per iniziare il drag, così lo scroll verticale del modale su mobile continua a funzionare.
touch-action: none applicato solo all'handle.
C. Persistenza invariata

onDragEnd → arrayMove() sull'array locale. handleSave resta byte-identico. Nessuna migration, nessun campo order in DB.
D. ExercisePicker parametrizzato, non duplicato

Nuove prop opzionali: prefilterMuscle?: MuscleGroup, title?: string, confirmLabel?: string. Tutte con default → nessun call-site esistente si rompe.
Il prefiltro è un valore iniziale sincronizzato all'apertura (useEffect su open), non un filtro forzato: l'utente può sempre tornare su "Tutti".
E. Stato picker → discriminated union

type PickerState =
  | { mode: "closed" }
  | { mode: "add" }
  | { mode: "replace"; targetId: string; muscle?: MuscleGroup };
Evita il proliferare di boolean e rende esaustivi i check TS.
3. MICRO-PROMPT
🔹 MICRO-PROMPT 1 — Setup dipendenze + wrapper DnD
Nel repo fitness-app.

STEP 1 — Installa:
npm install @dnd-kit/core@^6.3.1 @dnd-kit/sortable@^10.0.0 @dnd-kit/utilities@^3.2.2 @dnd-kit/modifiers@^9.0.0

STEP 2 — In app/scheda/_components/SessionEditor.tsx applica SOLO queste modifiche chirurgiche:

a) Aggiungi agli import esistenti l'icona GripVertical da lucide-react.

b) Aggiungi questi import dopo gli import lucide-react:
   import {
     DndContext, closestCenter, PointerSensor, TouchSensor, KeyboardSensor,
     useSensor, useSensors, type DragEndEvent,
   } from "@dnd-kit/core";
   import {
     SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
     arrayMove, useSortable,
   } from "@dnd-kit/sortable";
   import { CSS } from "@dnd-kit/utilities";
   import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";

c) Crea un componente interno SortableRow, subito DOPO il componente Stepper e PRIMA di
   `export default function SessionEditor`:

   function SortableRow({ id, children }: { id: string; children: React.ReactNode }) {
     const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
       useSortable({ id });
     const style: React.CSSProperties = {
       transform: CSS.Transform.toString(transform),
       transition,
       opacity: isDragging ? 0.5 : 1,
       zIndex: isDragging ? 10 : undefined,
       position: "relative",
     };
     return (
       <li
         ref={setNodeRef}
         style={style}
         className="rounded-xl border border-emerald-900/10 bg-white p-3"
       >
         <div className="flex gap-2">
           <button
             type="button"
             {...attributes}
             {...listeners}
             style={{ touchAction: "none" }}
             className="-ml-1 flex shrink-0 cursor-grab touch-none items-center px-1 text-emerald-800/30 transition hover:text-emerald-700 active:cursor-grabbing"
             aria-label="Trascina per riordinare"
           >
             <GripVertical className="h-5 w-5" />
           </button>
           <div className="min-w-0 flex-1">{children}</div>
         </div>
       </li>
     );
   }

d) Dentro SessionEditor, subito dopo la dichiarazione di `const [pickerOpen, setPickerOpen] = useState(false);`
   aggiungi sensori e handler:

   const sensors = useSensors(
     useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
     useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
     useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
   );

   const handleDragEnd = (event: DragEndEvent) => {
     const { active, over } = event;
     if (!over || active.id === over.id) return;
     setExercises((prev) => {
       const from = prev.findIndex((e) => e.id === active.id);
       const to = prev.findIndex((e) => e.id === over.id);
       if (from === -1 || to === -1) return prev;
       return arrayMove(prev, from, to);
     });
   };

VINCOLI:
- NON toccare handleSave, updateEx, removeEx, addExerciseFromPicker.
- NON modificare il JSX in questo step (lo faccio nel prompt 2).
- Mostra SOLO i blocchi aggiunti/modificati con `// ... resto invariato ...`.

VERIFICA: npx tsc --noEmit  → 0 errori (SortableRow risulterà non usato: è atteso).
🔹 MICRO-PROMPT 2 — Cablaggio JSX del riordino
In app/scheda/_components/SessionEditor.tsx, nella sezione "Esercizi", sostituisci il blocco
JSX che oggi è:

  <ul className="space-y-2">
    {exercises.map((ex) => (
      <li key={ex.id} className="rounded-xl border border-emerald-900/10 bg-white p-3">
        ... contenuto riga ...
      </li>
    ))}
  </ul>

con la versione wrappata:

  <DndContext
    sensors={sensors}
    collisionDetection={closestCenter}
    modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    onDragEnd={handleDragEnd}
  >
    <SortableContext
      items={exercises.map((e) => e.id)}
      strategy={verticalListSortingStrategy}
    >
      <ul className="space-y-2">
        {exercises.map((ex) => (
          <SortableRow key={ex.id} id={ex.id}>
            ... STESSO contenuto interno della <li>, invariato ...
          </SortableRow>
        ))}
      </ul>
    </SortableContext>
  </DndContext>

REGOLE:
- Il contenuto INTERNO della riga (nome, Stepper sets/reps, bottone Nota, textarea, Trash2)
  deve restare IDENTICO carattere per carattere: sposta solo le classi di layout
  `rounded-xl border border-emerald-900/10 bg-white p-3` dalla <li> (ora vivono in SortableRow).
- NON aggiungere <li> dentro SortableRow: SortableRow È già la <li>.
- Il ramo `exercises.length === 0` (placeholder tratteggiato) resta fuori dal DndContext.

VERIFICA:
1. npx tsc --noEmit → 0 errori
2. npm run dev → apri /scheda → Modifica una sessione:
   - desktop: trascina dalla maniglia, l'ordine cambia
   - il click su +/- e Trash2 funziona ancora (non parte il drag)
   - "Salva modifiche" persiste il nuovo ordine (ricarica la pagina per confermare)
   - mobile/DevTools touch: long-press ~200ms sulla maniglia avvia il drag;
     swipe sul resto della riga scrolla il modale
🔹 MICRO-PROMPT 3 — Sostituzione intelligente con prefiltro muscolare
Due file.

=== FILE 1: app/scheda/_components/ExercisePicker.tsx ===

a) Aggiungi `useEffect` agli import da "react".

b) Estendi l'interfaccia props (tutte opzionali, retrocompatibili):

   interface ExercisePickerProps {
     open: boolean;
     onClose: () => void;
     onSelect: (ex: ExerciseDefinition) => void;
     excludeIds?: string[];
     /** Gruppo muscolare preselezionato all'apertura (es. sostituzione esercizio). */
     prefilterMuscle?: MuscleGroup;
     /** Titolo del modale. Default: "Aggiungi esercizio". */
     title?: string;
   }

c) Aggiorna la destrutturazione con prefilterMuscle e title = "Aggiungi esercizio".

d) Sincronizza il filtro all'apertura — aggiungi dopo lo useState di `muscle`:

   useEffect(() => {
     if (!open) return;
     setMuscle(prefilterMuscle ?? "all");
     setQuery("");
   }, [open, prefilterMuscle]);

e) Passa il titolo dinamico: <Modal open={open} onClose={onClose} title={title}>

VINCOLO: nessun'altra logica di filtro va toccata; l'utente deve poter cliccare "Tutti"
e annullare il prefiltro.

=== FILE 2: app/scheda/_components/SessionEditor.tsx ===

a) Aggiungi `Replace` agli import lucide-react e `MuscleGroup` all'import type da types.ts.

b) SOSTITUISCI `const [pickerOpen, setPickerOpen] = useState(false);` con:

   type PickerState =
     | { mode: "closed" }
     | { mode: "add" }
     | { mode: "replace"; targetId: string; muscle?: MuscleGroup };

   const [picker, setPicker] = useState<PickerState>({ mode: "closed" });

c) Sostituisci ogni `setPickerOpen(true)` (bottone "Aggiungi") con `setPicker({ mode: "add" })`.

d) Aggiungi accanto a addExerciseFromPicker:

   const openReplace = (ex: EditableExercise) => {
     setPicker({
       mode: "replace",
       targetId: ex.id,
       muscle: getExerciseDef(ex.exerciseId)?.primaryMuscle,
     });
   };

   // Spread-preserving: mantiene sets, reps, notes, showNotes e ogni campo futuro
   // (es. suggestedWeight) della riga originale. Cambia solo l'esercizio.
   const replaceExercise = (targetId: string, ex: ExerciseDefinition) => {
     setExercises((prev) =>
       prev.map((e) =>
         e.id === targetId ? { ...e, exerciseId: ex.id, exerciseName: ex.name } : e
       )
     );
   };

   const handlePickerSelect = (ex: ExerciseDefinition) => {
     if (picker.mode === "replace") replaceExercise(picker.targetId, ex);
     else addExerciseFromPicker(ex);
     setPicker({ mode: "closed" });
   };

e) Aggiungi il bottone "Sostituisci" nella riga, IMMEDIATAMENTE PRIMA del bottone Trash2 esistente:

   <button
     type="button"
     onClick={() => openReplace(ex)}
     className="rounded-lg bg-teal-50 p-1.5 text-teal-700 transition hover:bg-teal-100"
     aria-label={`Sostituisci ${ex.exerciseName}`}
     title="Sostituisci esercizio"
   >
     <Replace className="h-3.5 w-3.5" />
   </button>

f) Sostituisci il render finale di <ExercisePicker> con:

   <ExercisePicker
     open={picker.mode !== "closed"}
     onClose={() => setPicker({ mode: "closed" })}
     onSelect={handlePickerSelect}
     title={picker.mode === "replace" ? "Sostituisci esercizio" : "Aggiungi esercizio"}
     prefilterMuscle={picker.mode === "replace" ? picker.muscle : undefined}
     excludeIds={
       picker.mode === "replace"
         ? exercises.filter((e) => e.id !== picker.targetId).map((e) => e.exerciseId)
         : exercises.map((e) => e.exerciseId)
     }
   />

NOTA sull'excludeIds in replace: si escludono gli altri esercizi già in sessione ma NON
quello che si sta sostituendo, così resta visibile in lista e l'utente può annullare
riselezionandolo.

VERIFICA:
1. npx tsc --noEmit → 0 errori (il narrowing della union deve reggere senza `as`)
2. npm run dev:
   - click su Replace di "Panca piana" → modale titolo "Sostituisci esercizio",
     chip "Petto" già attivo
   - seleziona un altro esercizio di petto → la riga cambia nome ma mantiene
     sets, reps e la nota eventualmente presente
   - il bottone "Aggiungi" apre il picker con chip "Tutti" (nessuna regressione)
   - drag & drop del prompt 2 continua a funzionare dopo una sostituzione
3. Salva → ricarica → verifica persistenza su Supabase
4. Rollback rapido
git checkout -- app/scheda/_components/SessionEditor.tsx app/scheda/_components/ExercisePicker.tsx
npm uninstall @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @dnd-kit/modifiers

