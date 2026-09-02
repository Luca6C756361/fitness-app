"use client";

import { useState } from "react";
import { Check, CheckCircle2, Undo2, Zap, Copy, StickyNote } from "lucide-react";
import type { CompletedSet } from "../../today/_lib/types";

interface ExerciseSetCardProps {
  index: number;
  name: string;
  targetSets: number;
  targetReps: number;
  completedSets: CompletedSet[];
  onCompleteSet: (set: CompletedSet) => void;
  onUndo: () => void;
  /** Nota promemoria dell'esercizio (opzionale). */
  notes?: string;
  /**
   * Carico suggerito dal motore di sovraccarico progressivo (kg).
   * Precompila SOLO il defaultValue del primo set in modalità "simple":
   * l'utente deve poter sempre sovrascriverlo.
   */
  suggestedWeight?: number;
}

type Mode = "simple" | "advanced";

export default function ExerciseSetCard({
  index,
  name,
  targetSets,
  targetReps,
  completedSets,
  onCompleteSet,
  onUndo,
  notes,
  suggestedWeight,
}: ExerciseSetCardProps) {
  const [singleWeight, setSingleWeight] = useState(
    suggestedWeight !== undefined ? String(suggestedWeight) : ""
  );
  const [repWeights, setRepWeights] = useState<string[]>(
    Array.from({ length: targetReps }, () => "")
  );
  const [mode, setMode] = useState<Mode>("simple");

  const isFullyDone = completedSets.length >= targetSets;

  const handleComplete = () => {
    let weights: number[];
    if (mode === "simple") {
      const w = parseFloat(singleWeight);
      if (isNaN(w) || w < 0) return;
      weights = Array(targetReps).fill(w);
    } else {
      const parsed = repWeights.map((s) => parseFloat(s));
      if (parsed.some((n) => isNaN(n) || n < 0)) return;
      weights = parsed;
    }

    onCompleteSet({ reps: targetReps, weights });

    setSingleWeight("");
    setRepWeights(Array.from({ length: targetReps }, () => ""));
  };

  const copyFirstToAll = () => {
    if (!repWeights[0]) return;
    setRepWeights(repWeights.map(() => repWeights[0]));
  };

  return (
    <section
      className={`rounded-2xl border p-5 shadow-sm transition ${
        isFullyDone
          ? "border-teal-200 bg-teal-50/40"
          : "border-emerald-900/5 bg-white"
      }`}
    >
      {/* Intestazione */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-800/50">
              Esercizio {index + 1}
            </span>
            {isFullyDone && (
              <span className="flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                <CheckCircle2 className="h-3 w-3" /> Completo
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-emerald-950">{name}</h3>
          <p className="text-xs font-medium text-emerald-800/50 tabular-nums">
            {targetSets} × {targetReps}
          </p>

          {/* Nota promemoria: banner giallo se presente */}
          {notes && (
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2">
              <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
              <p className="text-xs italic text-amber-900">{notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Set completati */}
      {completedSets.length > 0 && (
        <ul className="mb-4 space-y-1.5">
          {completedSets.map((set, i) => {
            const unique = new Set(set.weights).size === 1;
            return (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 text-xs"
              >
                <span className="font-bold text-teal-700 tabular-nums">
                  Set {i + 1}
                </span>
                <span className="font-medium text-emerald-950 tabular-nums">
                  {unique
                    ? `${set.weights[0]} kg × ${set.reps}`
                    : set.weights.map((w) => `${w}`).join(" · ") + " kg"}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* Prossimo set */}
      {!isFullyDone && (
        <div className="rounded-xl border border-emerald-900/10 bg-white p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-800/70">
              Set {completedSets.length + 1} di {targetSets}
            </p>

            <div className="flex gap-0.5 rounded-full bg-emerald-50 p-0.5">
              <button
                type="button"
                onClick={() => setMode("simple")}
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase transition ${
                  mode === "simple"
                    ? "bg-white text-emerald-800 shadow-sm"
                    : "text-emerald-800/50 hover:text-emerald-800"
                }`}
              >
                Semplice
              </button>
              <button
                type="button"
                onClick={() => setMode("advanced")}
                className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase transition ${
                  mode === "advanced"
                    ? "bg-white text-emerald-800 shadow-sm"
                    : "text-emerald-800/50 hover:text-emerald-800"
                }`}
              >
                <Zap className="h-2.5 w-2.5" />
                Avanzata
              </button>
            </div>
          </div>

          {mode === "simple" ? (
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-emerald-800/60">
                Peso per {targetReps} ripetizioni
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={singleWeight}
                  onChange={(e) => setSingleWeight(e.target.value)}
                  placeholder="Kg"
                  className="w-full rounded-lg border border-emerald-900/10 bg-white px-3 py-2 text-sm text-emerald-950 tabular-nums outline-none focus:ring-2 focus:ring-emerald-300"
                />
                <button
                  type="button"
                  onClick={handleComplete}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  <Check className="h-4 w-4" /> OK
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wide text-emerald-800/60">
                  Kg per ogni ripetizione
                </label>
                <button
                  type="button"
                  onClick={copyFirstToAll}
                  disabled={!repWeights[0]}
                  className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-40"
                >
                  <Copy className="h-3 w-3" />
                  Copia
                </button>
              </div>

              <div className="mb-2 grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                {repWeights.map((w, i) => (
                  <div key={i} className="text-center">
                    <span className="mb-0.5 block text-[9px] font-bold uppercase text-emerald-800/40">
                      #{i + 1}
                    </span>
                    <input
                      type="number"
                      step="0.5"
                      value={w}
                      onChange={(e) => {
                        const next = [...repWeights];
                        next[i] = e.target.value;
                        setRepWeights(next);
                      }}
                      placeholder="kg"
                      className="w-full rounded-md border border-emerald-900/10 bg-white px-1 py-1.5 text-center text-xs text-emerald-950 tabular-nums outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleComplete}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                <Check className="h-4 w-4" /> Registra set
              </button>
            </div>
          )}
        </div>
      )}

      {completedSets.length > 0 && (
        <button
          type="button"
          onClick={onUndo}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-900/10 bg-white/60 py-1.5 text-xs font-medium text-emerald-800/60 transition hover:bg-white hover:text-emerald-800"
        >
          <Undo2 className="h-3 w-3" />
          Annulla ultimo set
        </button>
      )}
    </section>
  );
}
