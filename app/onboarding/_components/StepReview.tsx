"use client";

import { RotateCcw } from "lucide-react";
import type { MacroSplit, TdeeBreakdown } from "../_lib/tdee";

interface StepReviewProps {
  breakdown: TdeeBreakdown;
  macros: MacroSplit;
  weightTarget: string;
  onMacrosChange: (patch: Partial<MacroSplit>) => void;
  onWeightTargetChange: (v: string) => void;
  onReset: () => void;
}

const numberInputClass =
  "w-full rounded-xl border border-emerald-900/10 bg-white px-3 py-2 text-sm font-bold text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-300";

function macroPercent(grams: number, kcalPerGram: number, totalKcal: number): number {
  if (totalKcal <= 0) return 0;
  return Math.round(((grams * kcalPerGram) / totalKcal) * 100);
}

/** Step 3 — calcolo TDEE/macro in RAM (zero rete), 4 valori + peso target editabili. */
export default function StepReview({
  breakdown,
  macros,
  weightTarget,
  onMacrosChange,
  onWeightTargetChange,
  onReset,
}: StepReviewProps) {
  const goalPct = Math.round((breakdown.goalFactor - 1) * 100);
  const goalPctLabel = goalPct === 0 ? "invariato" : `${goalPct > 0 ? "+" : ""}${goalPct}%`;

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h2 className="mb-1 text-lg font-bold text-emerald-950">Il tuo fabbisogno</h2>
          <p className="text-xs text-emerald-800/60">
            Mifflin-St Jeor × moltiplicatore attività, applicato al tuo obiettivo.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-900/10 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800/70 transition hover:bg-emerald-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Ripristina
        </button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-emerald-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800/60">BMR</p>
          <p className="text-lg font-bold text-emerald-950">{breakdown.bmr} kcal</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800/60">TDEE</p>
          <p className="text-lg font-bold text-emerald-950">{breakdown.tdee} kcal</p>
        </div>
      </div>

      <p className="mb-4 text-xs text-emerald-800/60">
        TDEE {breakdown.tdee} kcal ({goalPctLabel}) = <span className="font-bold text-emerald-800">{macros.kcal} kcal</span> obiettivo
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-emerald-800/70">
            Calorie (kcal)
          </label>
          <input
            type="number"
            value={macros.kcal}
            onChange={(e) => onMacrosChange({ kcal: Number(e.target.value) || 0 })}
            className={numberInputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-emerald-800/70">
            Carbo (g) — {macroPercent(macros.carbs, 4, macros.kcal)}%
          </label>
          <input
            type="number"
            value={macros.carbs}
            onChange={(e) => onMacrosChange({ carbs: Number(e.target.value) || 0 })}
            className={numberInputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-emerald-800/70">
            Proteine (g) — {macroPercent(macros.protein, 4, macros.kcal)}%
          </label>
          <input
            type="number"
            value={macros.protein}
            onChange={(e) => onMacrosChange({ protein: Number(e.target.value) || 0 })}
            className={numberInputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-emerald-800/70">
            Grassi (g) — {macroPercent(macros.fat, 9, macros.kcal)}%
          </label>
          <input
            type="number"
            value={macros.fat}
            onChange={(e) => onMacrosChange({ fat: Number(e.target.value) || 0 })}
            className={numberInputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-emerald-800/70">
            Peso target (kg)
          </label>
          <input
            type="number"
            step="0.5"
            value={weightTarget}
            onChange={(e) => onWeightTargetChange(e.target.value)}
            className={numberInputClass}
          />
        </div>
      </div>

      <p className="text-[11px] text-emerald-800/50">
        Stime indicative da rivedere in base ai risultati reali. Non sostituiscono un parere
        professionale.
      </p>
    </div>
  );
}
