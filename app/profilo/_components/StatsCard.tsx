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
    <section className="rounded-2xl border border-emerald-900/5 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#111111]/70">
        Statistiche personali
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* BMI */}
        <div className="rounded-xl bg-[#FAF7F0] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-700" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#111111]/60">
              BMI
            </span>
          </div>
          <p className="text-2xl font-bold text-[#111111] tabular-nums">
            {bmi.toFixed(1)}
          </p>
          <p className={`text-xs font-semibold ${bmiCat.color}`}>{bmiCat.label}</p>
        </div>

        {/* TDEE */}
        <div className="rounded-xl bg-[#FAF7F0] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-600" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#111111]/60">
              Fabbisogno
            </span>
          </div>
          <p className="text-2xl font-bold text-[#111111] tabular-nums">
            {tdee}
          </p>
          <p className="text-xs font-medium text-[#111111]/50">
            kcal/giorno · {activityLabels[profile.activity].label}
          </p>
        </div>

        {/* Distanza dal peso obiettivo */}
        <div className="rounded-xl bg-[#FAF7F0] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Target className="h-4 w-4 text-teal-600" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#111111]/60">
              Al target
            </span>
          </div>
          <p className="text-2xl font-bold text-[#111111] tabular-nums">
            {weightDiff > 0 ? "-" : "+"}
            {Math.abs(weightDiff).toFixed(1)} kg
          </p>
          <p className="text-xs font-medium text-[#111111]/50">
            obiettivo {goals.weightTarget} kg
          </p>
        </div>
      </div>
    </section>
  );
}
