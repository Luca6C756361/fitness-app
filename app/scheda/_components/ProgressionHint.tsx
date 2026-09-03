"use client";

import { Info, TrendingDown, TrendingUp } from "lucide-react";
import type { ProgressionSuggestion } from "../../today/_lib/progressionStats";

interface ProgressionHintProps {
  suggestion: ProgressionSuggestion;
  onApply: (s: ProgressionSuggestion) => void;
}

const confidenceStyles: Record<ProgressionSuggestion["confidence"], string> = {
  alta: "bg-emerald-100 text-emerald-700",
  media: "bg-amber-50 text-amber-700",
  bassa: "bg-emerald-50 text-fg-secondary",
};

/** "+2.5 kg → 42.5 kg" per weight/deload, "+1 rep → 11" per reps. */
function deltaLabel(s: ProgressionSuggestion): string {
  const sign = s.delta > 0 ? "+" : "";
  if (s.kind === "reps") return `${sign}${s.delta} rep → ${s.nextReps}`;
  return `${sign}${s.delta} kg → ${s.nextWeight} kg`;
}

/**
 * Suggerimento di sovraccarico progressivo per una riga esercizio.
 * Componente controllato: non muta nulla da solo, notifica il padre con
 * onApply. Riceve la suggestion per prop (nessun useWorkoutSession qui
 * dentro) così resta riusabile anche in /allenamento.
 */
export default function ProgressionHint({ suggestion, onApply }: ProgressionHintProps) {
  if (suggestion.kind === "none") return null;

  if (suggestion.kind === "hold") {
    return (
      <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-fg-secondary">
        <Info className="h-3 w-3 shrink-0" />
        {suggestion.reason}
      </p>
    );
  }

  const isDeload = suggestion.kind === "deload";
  const Icon = isDeload ? TrendingDown : TrendingUp;
  const label = deltaLabel(suggestion);

  return (
    <button
      type="button"
      onClick={() => onApply(suggestion)}
      aria-label={suggestion.reason}
      className={`mt-1.5 flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition ${
        isDeload ? "bg-amber-50 hover:bg-amber-100" : "bg-emerald-50 hover:bg-emerald-100"
      }`}
    >
      <Icon className={`h-3.5 w-3.5 shrink-0 ${isDeload ? "text-amber-700" : "text-emerald-700"}`} />
      <span className="min-w-0 flex-1">
        <span className={`block text-xs font-bold ${isDeload ? "text-fg-warning" : "text-fg-secondary"}`}>
          {label}
        </span>
        <span className="block text-[10px] text-fg-secondary">{suggestion.reason}</span>
      </span>
      <span
        className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${confidenceStyles[suggestion.confidence]}`}
      >
        {suggestion.confidence}
      </span>
    </button>
  );
}
