"use client";

import { useId, useState } from "react";
import { Check, CheckCircle2, Undo2, Zap, Copy, StickyNote, Timer, Info } from "lucide-react";
import type { CompletedSet } from "../../today/_lib/types";
import { formatRestLabel } from "../_lib/restPresets";
import RestPicker from "../../scheda/_components/RestPicker";

interface ExerciseSetCardProps {
  index: number;
  name: string;
  /**
   * Id dell'esercizio nel database (per aprire ExerciseDetailModal dal
   * genitore). Opzionale: se assente o se onShowDetail non è definito,
   * l'icona Info non compare — nessuna rottura per chi non la passa.
   */
  exerciseId?: string;
  /** Se definita (insieme a exerciseId), rende cliccabile il nome/icona Info in testata. */
  onShowDetail?: (exerciseId: string) => void;
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
  /** Recupero effettivo (già risolto: per-esercizio oppure default globale). */
  restSeconds?: number;
  /** true se il recupero è un override per-esercizio (snapshot o impostato oggi). */
  restIsCustom?: boolean;
  /**
   * Default globale "grezzo" (settings.restDefaultSeconds), per l'etichetta
   * "Globale (Xs)" del RestPicker incorporato — restSeconds da solo non
   * basta quando è già un override per-esercizio.
   */
  restGlobalDefault?: number;
  /** Override "solo per oggi". null = torna al default globale. */
  onRestChange?: (seconds: number | null) => void;
}

type Mode = "simple" | "advanced";

export default function ExerciseSetCard({
  index,
  name,
  exerciseId,
  onShowDetail,
  targetSets,
  targetReps,
  completedSets,
  onCompleteSet,
  onUndo,
  notes,
  suggestedWeight,
  restSeconds,
  restIsCustom,
  restGlobalDefault,
  onRestChange,
}: ExerciseSetCardProps) {
  const [singleWeight, setSingleWeight] = useState(
    suggestedWeight !== undefined ? String(suggestedWeight) : ""
  );
  const [repWeights, setRepWeights] = useState<string[]>(
    Array.from({ length: targetReps }, () => "")
  );
  const [mode, setMode] = useState<Mode>("simple");
  const [showRestPicker, setShowRestPicker] = useState(false);
  const simpleWeightInputId = useId();

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
            <span className="text-[10px] font-bold uppercase tracking-wide text-fg-muted">
              Esercizio {index + 1}
            </span>
            {isFullyDone && (
              <span className="flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Completo
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-fg-primary">
            {onShowDetail && exerciseId ? (
              <button
                type="button"
                onClick={() => onShowDetail(exerciseId)}
                className="flex items-center gap-1 text-left transition hover:text-fg-accent"
                aria-label={`Dettagli di ${name}`}
              >
                {name}
                <Info className="h-3.5 w-3.5 shrink-0 text-fg-muted" aria-hidden="true" />
              </button>
            ) : (
              name
            )}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium text-fg-muted tabular-nums">
              {targetSets} × {targetReps}
            </p>
            {restSeconds !== undefined && (
              <button
                type="button"
                onClick={() => onRestChange && setShowRestPicker((v) => !v)}
                disabled={!onRestChange}
                title={
                  restIsCustom
                    ? "Recupero impostato per questo esercizio"
                    : "Recupero predefinito"
                }
                aria-label={
                  restIsCustom
                    ? "Recupero impostato per questo esercizio"
                    : "Recupero predefinito"
                }
                className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase transition ${
                  restIsCustom
                    ? "bg-teal-50 text-teal-700"
                    : "bg-emerald-50 text-fg-secondary"
                } ${onRestChange ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
              >
                <Timer className="h-3 w-3" />
                {formatRestLabel(restSeconds)}
              </button>
            )}
          </div>

          {onRestChange && showRestPicker && (
            <div className="mt-2">
              <RestPicker
                value={restIsCustom ? restSeconds : undefined}
                globalDefault={restGlobalDefault ?? restSeconds ?? 0}
                onChange={(s) => onRestChange(s ?? null)}
              />
              <p className="mt-1 text-[10px] text-fg-muted">
                Vale solo per la sessione di oggi. Per cambiarlo in modo
                permanente modifica la scheda.
              </p>
            </div>
          )}

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
            <p className="text-xs font-bold uppercase tracking-wide text-fg-secondary">
              Set {completedSets.length + 1} di {targetSets}
            </p>

            <div className="flex gap-0.5 rounded-full bg-emerald-50 p-0.5">
              <button
                type="button"
                onClick={() => setMode("simple")}
                aria-pressed={mode === "simple"}
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase transition ${
                  mode === "simple"
                    ? "bg-pill-on text-pill-on-fg shadow-sm"
                    : "text-fg-secondary hover:text-emerald-800"
                }`}
              >
                Semplice
              </button>
              <button
                type="button"
                onClick={() => setMode("advanced")}
                aria-pressed={mode === "advanced"}
                className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase transition ${
                  mode === "advanced"
                    ? "bg-pill-on text-pill-on-fg shadow-sm"
                    : "text-fg-secondary hover:text-emerald-800"
                }`}
              >
                <Zap className="h-2.5 w-2.5" />
                Avanzata
              </button>
            </div>
          </div>

          {mode === "simple" ? (
            <div>
              <label
                htmlFor={simpleWeightInputId}
                className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-fg-secondary"
              >
                Peso per {targetReps} ripetizioni
              </label>
              <div className="flex gap-2">
                <input
                  id={simpleWeightInputId}
                  type="number"
                  step="0.5"
                  value={singleWeight}
                  onChange={(e) => setSingleWeight(e.target.value)}
                  placeholder="Kg"
                  className="w-full rounded-lg border border-emerald-900/10 bg-white px-3 py-2 text-sm text-fg-primary tabular-nums outline-none focus:ring-2 focus:ring-emerald-300"
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
                <label className="text-[10px] font-bold uppercase tracking-wide text-fg-secondary">
                  Kg per ogni ripetizione
                </label>
                <button
                  type="button"
                  onClick={copyFirstToAll}
                  disabled={!repWeights[0]}
                  aria-disabled={!repWeights[0]}
                  className="flex items-center gap-1 rounded-md bg-surface-accent px-2 py-0.5 text-[10px] font-bold text-fg-accent transition hover:opacity-80 disabled:cursor-not-allowed disabled:text-fg-muted"
                >
                  <Copy className="h-3 w-3" />
                  Copia
                </button>
              </div>

              <div className="mb-2 grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                {repWeights.map((w, i) => (
                  <div key={i} className="text-center">
                    <span aria-hidden="true" className="mb-0.5 block text-[9px] font-bold uppercase text-fg-muted">
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
                      aria-label={`Peso ripetizione ${i + 1}`}
                      className="w-full rounded-md border border-emerald-900/10 bg-white px-1 py-1.5 text-center text-xs text-fg-primary tabular-nums outline-none focus:ring-2 focus:ring-emerald-300"
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
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border-subtle bg-surface py-1.5 text-xs font-medium text-fg-muted transition hover:bg-white hover:text-emerald-800"
        >
          <Undo2 className="h-3 w-3" />
          Annulla ultimo set
        </button>
      )}
    </section>
  );
}
