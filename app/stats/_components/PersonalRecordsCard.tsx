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
    <section className="rounded-2xl border border-emerald-900/5 bg-white p-6 shadow-sm">
      <div className="mb-1 flex items-center gap-2">
        <Trophy className="h-4 w-4 text-amber-600" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#111111]/70">
          I tuoi record
        </h2>
      </div>
      <p className="mb-4 text-sm font-medium text-[#111111]/60">
        Massimali rilevati automaticamente dai tuoi allenamenti.
      </p>

      {records.length === 0 ? (
        <div className="rounded-xl bg-[#FAF7F0] p-6 text-center">
          <p className="text-sm font-medium text-[#111111]/60">
            Nessun record ancora registrato.
          </p>
          <p className="mt-1 text-xs text-[#111111]/40">
            Completa un allenamento con i carichi per iniziare.
          </p>
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {visible.map((r) => (
              <li
                key={r.exerciseId}
                className="rounded-xl bg-[#FAF7F0] px-4 py-3"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="min-w-0 flex-1 truncate text-sm font-bold text-[#111111]">
                    {r.name}
                  </p>
                  <p className="shrink-0 text-sm font-bold text-amber-700 tabular-nums">
                    {r.e1rm} kg
                  </p>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-medium text-[#111111]/50 tabular-nums">
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
              className="mt-3 w-full rounded-lg border border-emerald-900/10 py-1.5 text-xs font-bold text-[#111111]/70 transition hover:bg-emerald-50"
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