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
    <section className="rounded-2xl border border-emerald-900/5 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Target className="h-4 w-4 text-teal-600" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#111111]/70">
          Obiettivi
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#111111]/70">
            Peso target (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={weightTarget}
            onChange={(e) => setWeightTarget(e.target.value)}
            className="w-full rounded-xl border border-emerald-900/10 bg-white px-4 py-2.5 text-sm text-[#111111] outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#111111]/70">
            Calorie giornaliere (kcal)
          </label>
          <input
            type="number"
            value={kcalTarget}
            onChange={(e) => setKcalTarget(e.target.value)}
            className="w-full rounded-xl border border-emerald-900/10 bg-white px-4 py-2.5 text-sm text-[#111111] outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#111111]/70">
            Carbo (g)
          </label>
          <input
            type="number"
            value={carbsTarget}
            onChange={(e) => setCarbsTarget(e.target.value)}
            className="w-full rounded-xl border border-emerald-900/10 bg-white px-4 py-2.5 text-sm text-[#111111] outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#111111]/70">
            Proteine (g)
          </label>
          <input
            type="number"
            value={proteinTarget}
            onChange={(e) => setProteinTarget(e.target.value)}
            className="w-full rounded-xl border border-emerald-900/10 bg-white px-4 py-2.5 text-sm text-[#111111] outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#111111]/70">
            Grassi (g)
          </label>
          <input
            type="number"
            value={fatTarget}
            onChange={(e) => setFatTarget(e.target.value)}
            className="w-full rounded-xl border border-emerald-900/10 bg-white px-4 py-2.5 text-sm text-[#111111] outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-sm transition ${
          saved ? "bg-emerald-600" : "bg-teal-600 hover:bg-teal-700"
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
