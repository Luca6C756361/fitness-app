"use client";

import { Flame, Dumbbell, Calendar, TrendingUp } from "lucide-react";
import { useWorkoutSession } from "../../today/_lib/WorkoutSessionContext";

export default function WorkoutStreakCard() {
  const { stats } = useWorkoutSession();

  return (
    <section className="rounded-2xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] p-6 shadow-[var(--kh-card-shadow)]">
      <div className="mb-4 flex items-center gap-2">
        <Dumbbell className="h-4 w-4 text-[var(--kh-primary)]" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--kh-ink-muted)]">
          Allenamenti
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-[var(--kh-surface-2)] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-teal-600" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--kh-ink-subtle)]">
              Questo mese
            </span>
          </div>
          <p className="font-mono text-2xl font-bold text-[var(--kh-ink)] tabular-nums">
            {stats.thisMonthCount}
          </p>
          <p className="text-xs font-medium text-[var(--kh-ink-subtle)]">sessioni</p>
        </div>

        <div className="rounded-xl bg-[var(--kh-surface-2)] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-600" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--kh-ink-subtle)]">
              Streak
            </span>
          </div>
          <p className="font-mono text-2xl font-bold text-[var(--kh-ink)] tabular-nums">
            {stats.streak}
          </p>
          <p className="text-xs font-medium text-[var(--kh-ink-subtle)]">
            giorn{stats.streak === 1 ? "o" : "i"}
          </p>
        </div>

        <div className="rounded-xl bg-[var(--kh-surface-2)] p-4">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--kh-ink-subtle)]">
              Ultima
            </span>
          </div>
          <p className="text-sm font-bold text-[var(--kh-ink)] leading-tight">
            {stats.last?.sessionName ?? "—"}
          </p>
          <p className="mt-0.5 font-mono text-xs font-medium text-[var(--kh-ink-subtle)] tabular-nums">
            {stats.last?.date ?? "Mai"}
          </p>
        </div>
      </div>
    </section>
  );
}