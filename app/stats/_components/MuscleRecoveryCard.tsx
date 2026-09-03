"use client";

import { useMemo } from "react";
import { Activity } from "lucide-react";
import { useWorkoutSession } from "../../today/_lib/WorkoutSessionContext";
import {
  calculateMuscleRecovery,
  countByStatus,
  RECOVERY_COLORS,
  RECOVERY_MACRO_GROUPS,
  RECOVERY_STATUS_LABELS,
  type RecoveryStatus,
} from "../../today/_lib/muscleRecovery";
import BodyRecoveryMap from "../../today/_components/BodyRecoveryMap";

/**
 * Card "Muscle Recovery" stile Fitbod: sagome fronte/retro cyber-mesh +
 * lista compatta per macro-area. Sfondo scuro dedicato (spec: #0F172A),
 * a contrasto con il resto della pagina /stats (tema chiaro) — la card
 * si comporta come un pannello a sé, non eredita i colori di sezione.
 */
export default function MuscleRecoveryCard() {
  const { logs } = useWorkoutSession();

  const recovery = useMemo(() => calculateMuscleRecovery(logs), [logs]);
  const counts = useMemo(() => countByStatus(recovery), [recovery]);
  const colorByMuscle = useMemo(
    () => Object.fromEntries(recovery.map((r) => [r.muscle, r.color])),
    [recovery]
  );

  const statusOrder: RecoveryStatus[] = ["rest", "recovering", "ready"];
  const summary = statusOrder
    .filter((s) => counts[s] > 0)
    .map((s) => `${counts[s]} ${RECOVERY_STATUS_LABELS[s].toLowerCase()}`)
    .join(" · ");

  return (
    <section className="rounded-2xl border border-slate-800 bg-[#0F172A] p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-sky-400" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Muscle Recovery
          </h2>
        </div>
        {summary && (
          <span className="text-[11px] font-bold tabular-nums text-slate-400">
            {summary}
          </span>
        )}
      </div>

      {/* Alto: sagome + legenda. */}
      <BodyRecoveryMap
        colorByMuscle={colorByMuscle}
        className="mb-5"
        srLabel="Mappa del corpo con lo stato di recupero per gruppo muscolare, elencato in dettaglio sotto."
      />

      <div className="mb-6 flex items-center justify-center gap-5">
        {statusOrder.map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: RECOVERY_COLORS[s] }}
              aria-hidden="true"
            />
            <span className="text-[11px] font-semibold text-slate-400">
              {RECOVERY_STATUS_LABELS[s]}
            </span>
          </div>
        ))}
      </div>

      {/* Basso: lista compatta per macro-area, barra colorata + percentuale. */}
      <div className="space-y-4">
        {RECOVERY_MACRO_GROUPS.map((group) => (
          <div key={group.label}>
            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {group.label}
            </h3>
            <ul className="space-y-1.5">
              {group.muscles.map((muscle) => {
                const r = recovery.find((rec) => rec.muscle === muscle);
                if (!r) return null;
                return (
                  <li
                    key={muscle}
                    className="flex items-center gap-3 rounded-lg bg-slate-900/60 px-3 py-2"
                  >
                    <span
                      className="h-6 w-1 rounded-full"
                      style={{ backgroundColor: r.color }}
                      aria-hidden="true"
                    />
                    <span className="flex-1 text-sm font-medium text-slate-200">
                      {r.label}
                    </span>
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{ color: r.color }}
                    >
                      {r.percent}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
