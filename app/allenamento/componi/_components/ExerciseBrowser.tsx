"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Trash2, AlertTriangle } from "lucide-react";
import type { ExerciseDefinition, MuscleGroup } from "../../../today/_lib/types";
import {
  muscleGroupLabels,
  equipmentLabels,
} from "../../../today/_lib/exerciseData";

/** Lista esercizi filtrabile per gruppo muscolare / attrezzatura / testo. */

interface ExerciseBrowserProps {
  exercises: ExerciseDefinition[];
  onAdd: (exercise: ExerciseDefinition) => void;
  addedIds: string[];
  /** Opzionale: se assente, nessun esercizio mostra il cestino (retrocompatibile). */
  onDelete?: (id: string) => void;
  /** Id dell'esercizio la cui cancellazione è in corso (disabilita il cestino). */
  deletingId?: string | null;
}

export default function ExerciseBrowser({
  exercises,
  onAdd,
  addedIds,
  onDelete,
  deletingId,
}: ExerciseBrowserProps) {
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup | "all">("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Gruppi muscolari disponibili (solo quelli davvero presenti nel DB)
  const availableMuscles = useMemo(() => {
    const set = new Set<MuscleGroup>();
    exercises.forEach((e) => set.add(e.primaryMuscle));
    return Array.from(set);
  }, [exercises]);

  const filtered = useMemo(() => {
    return exercises.filter((e) => {
      const matchMuscle = muscle === "all" || e.primaryMuscle === muscle;
      const matchQuery =
        query.trim() === "" ||
        e.name.toLowerCase().includes(query.toLowerCase());
      return matchMuscle && matchQuery;
    });
  }, [exercises, query, muscle]);

  return (
    <section className="rounded-2xl border border-emerald-900/5 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-emerald-800/70">
        Database esercizi
      </h2>

      {/* Ricerca */}
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-800/40" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca (es. panca, squat, curl)…"
          className="w-full rounded-xl border border-emerald-900/10 bg-white py-2.5 pl-10 pr-4 text-sm text-emerald-950 placeholder:text-emerald-800/40 outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>

      {/* Chip gruppi muscolari */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMuscle("all")}
          className={`rounded-full px-3 py-1 text-xs font-bold transition ${
            muscle === "all"
              ? "bg-emerald-600 text-white"
              : "bg-emerald-50 text-emerald-800/70 hover:bg-emerald-100"
          }`}
        >
          Tutti
        </button>
        {availableMuscles.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMuscle(m)}
            className={`rounded-full px-3 py-1 text-xs font-bold transition ${
              muscle === m
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-800/70 hover:bg-emerald-100"
            }`}
          >
            {muscleGroupLabels[m] ?? m}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-emerald-800/50">
            Nessun esercizio trovato.
          </p>
        ) : (
          filtered.map((ex) => {
            const isAdded = addedIds.includes(ex.id);
            const isCustom = ex.source === "custom";
            return (
              <div
                key={ex.id}
                className="rounded-xl border border-emerald-900/10 bg-white px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-950">
                      <span className="truncate">{ex.name}</span>
                      {isCustom && (
                        <span className="shrink-0 rounded-full bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-teal-700">
                          Custom
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-emerald-800/50">
                      {muscleGroupLabels[ex.primaryMuscle]} ·{" "}
                      {equipmentLabels[ex.equipment]}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {onDelete && isCustom && (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(ex.id)}
                        disabled={deletingId === ex.id}
                        className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Elimina ${ex.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onAdd(ex)}
                      disabled={isAdded}
                      className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        isAdded
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {isAdded ? "Aggiunto" : "Aggiungi"}
                    </button>
                  </div>
                </div>

                {/* Conferma inline eliminazione: mai window.confirm() */}
                {confirmDeleteId === ex.id && (
                  <div className="mt-3 rounded-lg bg-red-50 p-3">
                    <div className="mb-2 flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                      <p className="text-xs text-red-900">
                        Eliminare &ldquo;{ex.name}&rdquo;? L&apos;azione non è
                        reversibile.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-lg border border-red-200 bg-white py-1.5 text-xs font-bold text-emerald-800"
                      >
                        Annulla
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDelete?.(ex.id);
                          setConfirmDeleteId(null);
                        }}
                        className="rounded-lg bg-red-600 py-1.5 text-xs font-bold text-white"
                      >
                        Elimina
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
