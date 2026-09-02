"use client";

import { goalLabels, experienceLabels, type FitnessGoal, type ExperienceLevel } from "../_lib/tdee";

interface StepGoalExperienceProps {
  goal: FitnessGoal | null;
  experience: ExperienceLevel | null;
  onGoalChange: (g: FitnessGoal) => void;
  onExperienceChange: (e: ExperienceLevel) => void;
}

/** Step 2 — obiettivo ed esperienza. Selezione singola, entrambe obbligatorie. */
export default function StepGoalExperience({
  goal,
  experience,
  onGoalChange,
  onExperienceChange,
}: StepGoalExperienceProps) {
  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-emerald-950">Qual è il tuo obiettivo?</h2>
      <p className="mb-4 text-xs text-emerald-800/60">Determina come calcoliamo le tue calorie.</p>

      <div className="mb-6 space-y-2">
        {(Object.keys(goalLabels) as FitnessGoal[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onGoalChange(key)}
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
              goal === key
                ? "border-emerald-600 bg-emerald-50"
                : "border-emerald-900/10 bg-white hover:bg-emerald-50/50"
            }`}
          >
            <span>
              <span className="block text-sm font-bold text-emerald-950">
                {goalLabels[key].label}
              </span>
              <span className="block text-xs text-emerald-800/60">
                {goalLabels[key].description}
              </span>
            </span>
          </button>
        ))}
      </div>

      <h2 className="mb-1 text-lg font-bold text-emerald-950">Quanta esperienza hai?</h2>
      <p className="mb-4 text-xs text-emerald-800/60">
        Ci serve per suggerirti una scheda iniziale adatta.
      </p>

      <div className="space-y-2">
        {(Object.keys(experienceLabels) as ExperienceLevel[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onExperienceChange(key)}
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
              experience === key
                ? "border-teal-600 bg-teal-50"
                : "border-emerald-900/10 bg-white hover:bg-emerald-50/50"
            }`}
          >
            <span>
              <span className="block text-sm font-bold text-emerald-950">
                {experienceLabels[key].label}
              </span>
              <span className="block text-xs text-emerald-800/60">
                {experienceLabels[key].description}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
