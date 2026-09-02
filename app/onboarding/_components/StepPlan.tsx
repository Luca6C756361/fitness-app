"use client";

import { Check } from "lucide-react";
import { exerciseDatabase } from "../../today/_lib/exerciseData";
import { PLAN_TEMPLATES, type PlanTemplate } from "../_lib/planTemplates";

interface StepPlanProps {
  selectedId: PlanTemplate["id"] | null;
  onSelect: (id: PlanTemplate["id"]) => void;
}

function exerciseName(exerciseId: string): string {
  return exerciseDatabase.find((e) => e.id === exerciseId)?.name ?? "?";
}

/** Step 4 — scelta della scheda iniziale tra i PLAN_TEMPLATES. */
export default function StepPlan({ selectedId, onSelect }: StepPlanProps) {
  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-emerald-950">Da dove parti?</h2>
      <p className="mb-4 text-xs text-emerald-800/60">
        Puoi cambiarla in qualsiasi momento da &quot;Scheda&quot;.
      </p>

      <div className="space-y-3">
        {PLAN_TEMPLATES.map((t) => {
          const active = selectedId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id)}
              className={`w-full rounded-xl border p-4 text-left transition ${
                active
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-emerald-900/10 bg-white hover:bg-emerald-50/50"
              }`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-emerald-950">{t.name}</span>
                <span className="flex items-center gap-2 shrink-0">
                  {t.daysPerWeek > 0 && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-800/50">
                      {t.daysPerWeek}g/sett
                    </span>
                  )}
                  {active && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </span>
              </div>
              <p className="mb-2 text-xs text-emerald-800/60">{t.description}</p>

              {t.plan.sessions.length === 0 ? (
                <p className="text-[11px] font-medium text-emerald-800/40">
                  Nessuna sessione precompilata.
                </p>
              ) : (
                <ul className="space-y-1">
                  {t.plan.sessions.map((s) => {
                    const preview = s.exercises
                      .slice(0, 3)
                      .map((pe) => exerciseName(pe.exerciseId))
                      .join(" · ");
                    const extra = s.exercises.length > 3 ? ` +${s.exercises.length - 3}` : "";
                    return (
                      <li key={s.id} className="text-[11px] font-medium text-emerald-800/50">
                        <span className="font-bold text-emerald-800/70">{s.name}:</span> {preview}
                        {extra}
                      </li>
                    );
                  })}
                </ul>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
