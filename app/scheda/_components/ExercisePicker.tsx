"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Info } from "lucide-react";
import Modal from "../../today/_components/Modal";
import ExerciseMediaSlot from "../../today/_components/ExerciseMediaSlot";
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
 *
 * Layout aggiornato: modale largo (size="lg"), righe con anteprima
 * (ExerciseMediaSlot) e un'espansione inline per la demo di esecuzione.
 * Logica invariata: usePlan(), availableMuscles, filtered, onSelect+onClose.
 */

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

export default function ExercisePicker({
  open,
  onClose,
  onSelect,
  excludeIds = [],
  prefilterMuscle,
  title = "Aggiungi esercizio",
}: ExercisePickerProps) {
  const { exercises } = usePlan();

  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup | "all">("all");
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setMuscle(prefilterMuscle ?? "all");
    setQuery("");
  }, [open, prefilterMuscle]);

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
    <Modal open={open} onClose={onClose} title={title} size="lg">
      {/* Ricerca */}
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-800/40" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca (es. panca, squat, curl)…"
          className="w-full rounded-xl border border-emerald-900/10 bg-white py-3 pl-10 pr-4 text-base text-emerald-950 placeholder:text-emerald-800/40 outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>

      {/* Chip gruppi muscolari: scorrimento orizzontale su mobile, wrap da sm: in su */}
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:flex-wrap">
        <button
          type="button"
          onClick={() => setMuscle("all")}
          className={`flex min-h-[40px] shrink-0 items-center rounded-full px-3 py-2 text-[11px] font-bold transition ${
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
            className={`flex min-h-[40px] shrink-0 items-center rounded-full px-3 py-2 text-[11px] font-bold transition ${
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
      <div className="max-h-[55dvh] space-y-1.5 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-emerald-800/50">
            {excludeIds.length > 0 && exercises.length - excludeIds.length === 0
              ? "Tutti gli esercizi disponibili sono già nella sessione."
              : "Nessun esercizio trovato."}
          </p>
        ) : (
          filtered.map((ex) => {
            const expanded = previewId === ex.id;
            return (
              <div
                key={ex.id}
                className="overflow-hidden rounded-xl border border-emerald-900/10 bg-white"
              >
                {/* Riga: SOLO onSelect. L'Info è un bottone separato (niente
                    <button> annidati), stessa area cliccabile di prima. */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    onSelect(ex);
                    onClose();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(ex);
                      onClose();
                    }
                  }}
                  className="grid min-h-[64px] cursor-pointer grid-cols-[56px_1fr_auto_auto] items-center gap-3 px-3 py-2 text-left transition hover:bg-emerald-50/50 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <ExerciseMediaSlot
                    media={ex.media}
                    name={ex.name}
                    className="h-14 w-14 shrink-0 !aspect-square"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-emerald-950">
                      {ex.name}
                    </p>
                    <p className="text-xs text-emerald-800/50">
                      {muscleGroupLabels[ex.primaryMuscle]} ·{" "}
                      {equipmentLabels[ex.equipment]}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewId((id) => (id === ex.id ? null : ex.id));
                    }}
                    aria-label={`Vedi esecuzione di ${ex.name}`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-emerald-800/40 transition hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                  <Plus className="h-4 w-4 shrink-0 text-emerald-600" />
                </div>

                {expanded && (
                  <div className="border-t border-emerald-900/10 p-3">
                    <ExerciseMediaSlot media={ex.media} name={ex.name} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}
