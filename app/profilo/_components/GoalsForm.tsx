"use client";

import { useState } from "react";
import { Save, Check, Target } from "lucide-react";
import { useUser } from "../../today/_lib/UserContext";

/** Form modificabile per gli obiettivi nutrizionali. */
export default function GoalsForm() {
  const { goals, updateGoals } = useUser();

  const [weightTarget, setWeightTarget] = useState(goals.weightTarget.toString());
  const [kcalTarget, setKcalTarget] = useState(goals.kcalTarget.toString());
  const [carbsTarget, setCarbsTarget] = useState(goals.carbsTarget.toString());
  const [proteinTarget, setProteinTarget] = useState(goals.proteinTarget.toString());
  const [fatTarget, setFatTarget] = useState(goals.fatTarget.toString());

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateGoals({
      weightTarget: parseFloat(weightTarget) || goals.weightTarget,
      kcalTarget: parseInt(kcalTarget, 10) || goals.kcalTarget,
      carbsTarget: parseInt(carbsTarget, 10) || goals.carbsTarget,
      proteinTarget: parseInt(proteinTarget, 10) || goals.proteinTarget,
      fatTarget: parseInt(fatTarget, 10) || goals.fatTarget,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <section className="rounded-2xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] p-6 shadow-[var(--kh-card-shadow)]">
      <div className="mb-4 flex items-center gap-2">
        <Target className="h-4 w-4 text-[#3F9B95]" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--kh-ink-muted)]">
          Obiettivi
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--kh-ink-muted)]">
            Peso target (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={weightTarget}
            onChange={(e) => setWeightTarget(e.target.value)}
            className="w-full rounded-xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] px-4 py-2.5 text-sm text-[var(--kh-ink)] outline-none transition focus:border-[#3F9B95] focus:ring-2 focus:ring-[#3F9B95]/30"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--kh-ink-muted)]">
            Calorie giornaliere (kcal)
          </label>
          <input
            type="number"
            value={kcalTarget}
            onChange={(e) => setKcalTarget(e.target.value)}
            className="w-full rounded-xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] px-4 py-2.5 text-sm text-[var(--kh-ink)] outline-none transition focus:border-[#3F9B95] focus:ring-2 focus:ring-[#3F9B95]/30"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--kh-ink-muted)]">
            Carbo (g)
          </label>
          <input
            type="number"
            value={carbsTarget}
            onChange={(e) => setCarbsTarget(e.target.value)}
            className="w-full rounded-xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] px-4 py-2.5 text-sm text-[var(--kh-ink)] outline-none transition focus:border-[#3F9B95] focus:ring-2 focus:ring-[#3F9B95]/30"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--kh-ink-muted)]">
            Proteine (g)
          </label>
          <input
            type="number"
            value={proteinTarget}
            onChange={(e) => setProteinTarget(e.target.value)}
            className="w-full rounded-xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] px-4 py-2.5 text-sm text-[var(--kh-ink)] outline-none transition focus:border-[#3F9B95] focus:ring-2 focus:ring-[#3F9B95]/30"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--kh-ink-muted)]">
            Grassi (g)
          </label>
          <input
            type="number"
            value={fatTarget}
            onChange={(e) => setFatTarget(e.target.value)}
            className="w-full rounded-xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] px-4 py-2.5 text-sm text-[var(--kh-ink)] outline-none transition focus:border-[#3F9B95] focus:ring-2 focus:ring-[#3F9B95]/30"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition ${
          saved
            ? "bg-[var(--kh-secondary)] shadow-[var(--kh-glow-secondary)]"
            : "bg-[var(--kh-primary)] shadow-[var(--kh-glow-primary)] hover:bg-[var(--kh-primary-hover)]"
        }`}
      >
        {saved ? (
          <>
            <Check className="h-4 w-4" />
            Salvato!
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Salva obiettivi
          </>
        )}
      </button>
    </section>
  );
}