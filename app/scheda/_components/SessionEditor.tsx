"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Minus, Save, StickyNote } from "lucide-react";
import Modal from "../../today/_components/Modal";
import { usePlan } from "../../today/_lib/PlanContext";
import type {
  WorkoutSession,
  PlannedExercise,
  ExerciseDefinition,
} from "../../today/_lib/types";
import ExercisePicker from "./ExercisePicker";

interface SessionEditorProps {
  open: boolean;
  onClose: () => void;
  session: WorkoutSession | null;
}

interface EditableExercise extends PlannedExercise {
  exerciseName: string;
  showNotes: boolean; // UI: la textarea note è nascosta di default per non appesantire
}

function Stepper({
  value,
  onChange,
  min = 1,
  max = 20,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="rounded-md bg-emerald-50 p-1 text-emerald-700 transition hover:bg-emerald-100"
        aria-label="Diminuisci"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="min-w-[2ch] text-center text-sm font-bold text-emerald-950 tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="rounded-md bg-emerald-50 p-1 text-emerald-700 transition hover:bg-emerald-100"
        aria-label="Aumenta"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}

export default function SessionEditor({
  open,
  onClose,
  session,
}: SessionEditorProps) {
  const { updateSession, createSession, getExerciseDef } = usePlan();

  const [name, setName] = useState("");
  const [focus, setFocus] = useState("");
  const [minutes, setMinutes] = useState(45);
  const [exercises, setExercises] = useState<EditableExercise[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (session) {
      setName(session.name);
      setFocus(session.focus);
      setMinutes(session.estimatedMinutes);
      setExercises(
        session.exercises.map((pe) => ({
          ...pe,
          exerciseName: getExerciseDef(pe.exerciseId)?.name ?? "?",
          // Se ha già una nota, mostra la textarea aperta
          showNotes: !!pe.notes,
        }))
      );
    } else {
      setName("");
      setFocus("");
      setMinutes(45);
      setExercises([]);
    }
  }, [open, session, getExerciseDef]);

  const addExerciseFromPicker = (ex: ExerciseDefinition) => {
    setExercises((prev) => [
      ...prev,
      {
        id: `pe-${Date.now()}-${ex.id}`,
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: 3,
        reps: 10,
        showNotes: false,
      },
    ]);
  };

  const updateEx = (id: string, patch: Partial<EditableExercise>) => {
    setExercises((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const removeEx = (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSave = () => {
    if (!name.trim() || exercises.length === 0) return;

    const cleaned: PlannedExercise[] = exercises.map((e) => ({
      id: e.id,
      exerciseId: e.exerciseId,
      sets: e.sets,
      reps: e.reps,
      // Salviamo la nota solo se non vuota
      ...(e.notes && e.notes.trim() ? { notes: e.notes.trim() } : {}),
    }));

    if (session) {
      updateSession({
        ...session,
        name: name.trim(),
        focus: focus.trim(),
        estimatedMinutes: minutes,
        exercises: cleaned,
      });
    } else {
      createSession({
        id: `sess-${Date.now()}`,
        name: name.trim(),
        focus: focus.trim(),
        estimatedMinutes: minutes,
        exercises: cleaned,
      });
    }
    onClose();
  };

  const canSave = name.trim().length > 0 && exercises.length > 0;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={session ? "Modifica sessione" : "Nuova sessione"}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-emerald-800/70">
              Nome sessione
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Push — Petto, Spalle, Tricipiti"
              className="w-full rounded-xl border border-emerald-900/10 bg-white px-3 py-2 text-sm text-emerald-950 placeholder:text-emerald-800/30 outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-emerald-800/70">
              Focus muscolare
            </label>
            <input
              type="text"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="Es. Petto · Spalle · Tricipiti"
              className="w-full rounded-xl border border-emerald-900/10 bg-white px-3 py-2 text-sm text-emerald-950 placeholder:text-emerald-800/30 outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-emerald-800/70">
              Durata stimata (min)
            </label>
            <input
              type="number"
              value={minutes}
              min={5}
              max={180}
              onChange={(e) => setMinutes(parseInt(e.target.value, 10) || 0)}
              className="w-24 rounded-xl border border-emerald-900/10 bg-white px-3 py-2 text-sm text-emerald-950 tabular-nums outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wide text-emerald-800/70">
                Esercizi ({exercises.length})
              </label>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-emerald-700"
              >
                <Plus className="h-3 w-3" />
                Aggiungi
              </button>
            </div>

            {exercises.length === 0 ? (
              <p className="rounded-xl border border-dashed border-emerald-900/15 py-6 text-center text-xs text-emerald-800/50">
                Nessun esercizio. Aggiungine almeno uno.
              </p>
            ) : (
              <ul className="space-y-2">
                {exercises.map((ex) => (
                  <li
                    key={ex.id}
                    className="rounded-xl border border-emerald-900/10 bg-[#FAF7F0] p-3"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-emerald-950">
                          {ex.exerciseName}
                        </p>
                        {ex.notes && !ex.showNotes && (
                          <p className="mt-0.5 flex items-start gap-1 text-[11px] italic text-emerald-800/60">
                            <StickyNote className="mt-0.5 h-3 w-3 shrink-0" />
                            <span className="line-clamp-1">{ex.notes}</span>
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEx(ex.id)}
                        className="rounded-lg p-1 text-emerald-800/40 transition hover:bg-red-50 hover:text-red-600"
                        aria-label="Rimuovi"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Controlli set/reps + toggle nota */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase text-emerald-800/60">
                          Set
                        </span>
                        <Stepper
                          value={ex.sets}
                          onChange={(v) => updateEx(ex.id, { sets: v })}
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase text-emerald-800/60">
                          Reps
                        </span>
                        <Stepper
                          value={ex.reps}
                          onChange={(v) => updateEx(ex.id, { reps: v })}
                          max={50}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateEx(ex.id, { showNotes: !ex.showNotes })
                        }
                        className={`ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase transition ${
                          ex.showNotes || ex.notes
                            ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        <StickyNote className="h-3 w-3" />
                        {ex.notes ? "Nota" : "+ Nota"}
                      </button>
                    </div>

                    {/* Textarea note (visibile su richiesta) */}
                    {ex.showNotes && (
                      <textarea
                        value={ex.notes ?? ""}
                        onChange={(e) => updateEx(ex.id, { notes: e.target.value })}
                        placeholder="Es. Attento alla spalla destra, scendere lento"
                        rows={2}
                        maxLength={200}
                        className="mt-2 w-full resize-none rounded-lg border border-emerald-900/10 bg-white px-3 py-2 text-xs text-emerald-950 placeholder:text-emerald-800/30 outline-none focus:ring-2 focus:ring-amber-300"
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save className="h-4 w-4" />
            {session ? "Salva modifiche" : "Crea sessione"}
          </button>
        </div>
      </Modal>

      <ExercisePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={addExerciseFromPicker}
        excludeIds={exercises.map((e) => e.exerciseId)}
      />
    </>
  );
}
