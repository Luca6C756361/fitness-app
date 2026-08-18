"use client";

import { Flame, Dumbbell, Calendar, TrendingUp } from "lucide-react";
import { useWorkoutSession } from "../../today/_lib/WorkoutSessionContext";

export default function WorkoutStreakCard() {
  const { stats } = useWorkoutSession();

  return (
    <section className="rounded-2xl border border-emerald-900/5 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Dumbbell className="h-4 w-4 text-teal-700" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-800/70">
          Allenamenti
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-[#FAF7F0] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-teal-600" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-800/60">
              Questo mese
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-950 tabular-nums">
            {stats.thisMonthCount}
          </p>
          <p className="text-xs font-medium text-emerald-800/50">sessioni</p>
        </div>

        <div className="rounded-xl bg-[#FAF7F0] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-600" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-800/60">
              Streak
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-950 tabular-nums">
            {stats.streak}
          </p>
          <p className="text-xs font-medium text-emerald-800/50">
            giorn{stats.streak === 1 ? "o" : "i"}
          </p>
        </div>

        <div className="rounded-xl bg-[#FAF7F0] p-4">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-800/60">
              Ultima
            </span>
          </div>
          <p className="text-sm font-bold text-emerald-950 leading-tight">
            {stats.last?.sessionName ?? "—"}
          </p>
          <p className="mt-0.5 text-xs font-medium text-emerald-800/50 tabular-nums">
            {stats.last?.date ?? "Mai"}
          </p>
        </div>
      </div>
    </section>
  );
}
