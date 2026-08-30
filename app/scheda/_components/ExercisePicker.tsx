"use client";

import { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import Modal from "../../today/_components/Modal";
import { usePlan } from "../../today/_lib/PlanContext";
import {
  muscleGroupLabels,
  equipmentLabels,
} from "../../today/_lib/exerciseData";
import type { ExerciseDefinition, MuscleGroup } from "../../today/_lib/types";

/**
 * Picker esercizi per l'editor sessione.
 * A differenza di ExerciseBrowser (che è una card sempre visibile),
 * questo è un modale con lista filtrata e onSelect.
 */

interface ExercisePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (ex: ExerciseDefinition) => void;
  excludeIds?: string[];
}

export default function ExercisePicker({
  open,
  onClose,
  onSelect,
  excludeIds = [],
}: ExercisePickerProps) {
  const { exercises } = usePlan();

  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup | "all">("all");

  const availableMuscles = useMemo(() => {
    const set = new Set<MuscleGroup>();
    exercises.forEach((e) => set.add(e.primaryMuscle));
    return Array.from(set);
  }, [exercises]);

  const filtered = useMemo(() => {
    return exercises.filter((e) => {
      if (excludeIds.includes(e.id)) return false;
      const matchMuscle = muscle === "all" || e.primaryMuscle === muscle;
      const matchQuery =
        query.trim() === "" ||
        e.name.toLowerCase().includes(query.toLowerCase());
      return matchMuscle && matchQuery;
    });
  }, [exercises, query, muscle, excludeIds]);

  return (
    <Modal open={open} onClose={onClose} title="Aggiungi esercizio">
      {/* Ricerca */}
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--kh-ink-subtle)]" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca (es. panca, squat, curl)…"
          className="w-full rounded-xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] py-2.5 pl-10 pr-4 text-sm text-[var(--kh-ink)] outline-none transition placeholder:text-[var(--kh-ink-subtle)] focus:border-[var(--kh-primary)] focus:ring-2 focus:ring-[var(--kh-primary)]/30"
        />
      </div>

      {/* Chip gruppi muscolari */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setMuscle("all")}
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
            muscle === "all"
              ? "bg-[var(--kh-primary)] text-white"
              : "border border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] text-[var(--kh-ink-muted)] hover:border-[var(--kh-primary)] hover:text-[var(--kh-ink)]"
          }`}
        >
          Tutti
        </button>
        {availableMuscles.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMuscle(m)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
              muscle === m
                ? "bg-[var(--kh-primary)] text-white"
                : "border border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] text-[var(--kh-ink-muted)] hover:border-[var(--kh-primary)] hover:text-[var(--kh-ink)]"
            }`}
          >
            {muscleGroupLabels[m] ?? m}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--kh-ink-subtle)]">
            {excludeIds.length > 0 && exercises.length - excludeIds.length === 0
              ? "Tutti gli esercizi disponibili sono già nella sessione."
              : "Nessun esercizio trovato."}
          </p>
        ) : (
          filtered.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => {
                onSelect(ex);
                onClose();
              }}
              className="flex w-full items-center justify-between rounded-xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] px-3 py-2.5 text-left transition hover:border-[var(--kh-primary)] hover:bg-[var(--kh-primary)]/5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--kh-ink)]">{ex.name}</p>
                <p className="text-xs text-[var(--kh-ink-subtle)]">
                  {muscleGroupLabels[ex.primaryMuscle]} ·{" "}
                  {equipmentLabels[ex.equipment]}
                </p>
              </div>
              <Plus className="ml-2 h-4 w-4 shrink-0 text-[var(--kh-primary)]" />
            </button>
          ))
        )}
      </div>
    </Modal>
  );
}