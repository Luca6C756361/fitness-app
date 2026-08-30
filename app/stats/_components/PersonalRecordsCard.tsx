"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";
import { useWorkoutSession } from "../../today/_lib/WorkoutSessionContext";
import { formatShortDate } from "../../today/_lib/utils";

const PREVIEW = 5;

export default function PersonalRecordsCard() {
  const { records } = useWorkoutSession();
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? records : records.slice(0, PREVIEW);

  return (
    <section className="rounded-2xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] p-6 shadow-[var(--kh-card-shadow)]">
      <div className="mb-1 flex items-center gap-2">
        <Trophy className="h-4 w-4 text-[var(--kh-secondary)]" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--kh-ink-muted)]">
          I tuoi record
        </h2>
      </div>
      <p className="mb-4 text-sm font-medium text-[var(--kh-ink-muted)]">
        Massimali rilevati automaticamente dai tuoi allenamenti.
      </p>

      {records.length === 0 ? (
        <div className="rounded-xl bg-[var(--kh-surface-2)] p-6 text-center">
          <p className="text-sm font-medium text-[var(--kh-ink-muted)]">
            Nessun record ancora registrato.
          </p>
          <p className="mt-1 text-xs text-[var(--kh-ink-subtle)]">
            Completa un allenamento con i carichi per iniziare.
          </p>
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {visible.map((r) => (
              <li
                key={r.exerciseId}
                className="rounded-xl bg-[var(--kh-surface-2)] px-4 py-3"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="min-w-0 flex-1 truncate text-sm font-bold text-[var(--kh-ink)]">
                    {r.name}
                  </p>
                  <p className="font-mono shrink-0 text-sm font-bold text-[var(--kh-secondary)] tabular-nums">
                    {r.e1rm} kg
                  </p>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[11px] font-medium text-[var(--kh-ink-subtle)] tabular-nums">
                  <span>Peso max {r.maxWeight} kg</span>
                  <span>
                    Miglior set {Math.round(r.bestSetVolume).toLocaleString("it-IT")} kg
                  </span>
                  {r.date && <span>{formatShortDate(r.date)}</span>}
                </div>
              </li>
            ))}
          </ul>

          {records.length > PREVIEW && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-3 w-full rounded-lg border border-[var(--kh-hairline)] py-1.5 text-xs font-bold text-[var(--kh-ink-muted)] transition hover:bg-[var(--kh-surface-2)]"
            >
              {expanded
                ? "Mostra meno"
                : `Mostra tutti (${records.length})`}
            </button>
          )}
        </>
      )}
    </section>
  );
}