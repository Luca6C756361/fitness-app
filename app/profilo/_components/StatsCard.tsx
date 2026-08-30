"use client";

import { Activity, Flame, Target } from "lucide-react";
import { useUser } from "../../today/_lib/UserContext";
import { activityLabels } from "../../today/_lib/data";
import { bmiCategory, calcBMI, calcTDEE } from "../../today/_lib/utils";

/** Card in sola lettura con statistiche calcolate dai dati profilo. */
export default function StatsCard() {
  const { profile, goals } = useUser();

  const bmi = calcBMI(profile.weight, profile.height);
  const bmiCat = bmiCategory(bmi);
  const tdee = calcTDEE(profile);
  const weightDiff = profile.weight - goals.weightTarget;

  return (
    <section className="rounded-2xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] p-6 shadow-[var(--kh-card-shadow)]">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--kh-ink-muted)]">
        Statistiche personali
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* BMI */}
        <div className="rounded-xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-[var(--kh-primary)]" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--kh-ink-subtle)]">
              BMI
            </span>
          </div>
          <p className="font-mono text-2xl font-bold tabular-nums text-[var(--kh-ink)]">
            {bmi.toFixed(1)}
          </p>
          <p className={`text-xs font-semibold ${bmiCat.color}`}>{bmiCat.label}</p>
        </div>

        {/* TDEE */}
        <div className="rounded-xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-600" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--kh-ink-subtle)]">
              Fabbisogno
            </span>
          </div>
          <p className="font-mono text-2xl font-bold tabular-nums text-[var(--kh-ink)]">
            {tdee}
          </p>
          <p className="text-xs font-medium text-[var(--kh-ink-subtle)]">
            kcal/giorno · {activityLabels[profile.activity].label}
          </p>
        </div>

        {/* Distanza dal peso obiettivo */}
        <div className="rounded-xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Target className="h-4 w-4 text-[#3F9B95]" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--kh-ink-subtle)]">
              Al target
            </span>
          </div>
          <p className="font-mono text-2xl font-bold tabular-nums text-[var(--kh-ink)]">
            {weightDiff > 0 ? "-" : "+"}
            {Math.abs(weightDiff).toFixed(1)} kg
          </p>
          <p className="text-xs font-medium text-[var(--kh-ink-subtle)]">
            obiettivo {goals.weightTarget} kg
          </p>
        </div>
      </div>
    </section>
  );
}