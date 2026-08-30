"use client";

import { CalendarDays } from "lucide-react";
import { usePlan } from "../../today/_lib/PlanContext";
import { dayLabels } from "../../today/_lib/exerciseData";

/**
 * Vista settimana: 7 righe, una per giorno.
 * Ogni giorno ha un <select> per assegnare/rimuovere una sessione.
 * L'ordine visivo parte da Lunedì (indice 1) e mette Domenica per ultima.
 */

// Ordine "europeo": lun, mar, mer, gio, ven, sab, dom
const displayOrder = [1, 2, 3, 4, 5, 6, 0];

export default function WeekView() {
  const { plan, overrideDay } = usePlan();
  const todayDayIndex = new Date().getDay();

  return (
    <section className="rounded-2xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] p-6 shadow-[var(--kh-card-shadow)]">
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-[var(--kh-primary)]" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--kh-ink-muted)]">
          Piano settimanale
        </h2>
      </div>

      <ul className="space-y-2">
        {displayOrder.map((dayIndex) => {
          const sessionId = plan?.weekMap?.[dayIndex];
          const session = sessionId
            ? plan?.sessions?.find((s) => s.id === sessionId)
            : null;
          const isToday = dayIndex === todayDayIndex;

          return (
            <li
              key={dayIndex}
              className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                isToday
                  ? "border-[var(--kh-primary)] bg-[var(--kh-primary)]/10"
                  : "border-[var(--kh-hairline)] bg-[var(--kh-surface-2)]"
              }`}
            >
              {/* Giorno */}
              <div className="w-24 shrink-0">
                <p className="text-sm font-bold text-[var(--kh-ink)]">
                  {dayLabels[dayIndex]}
                </p>
                {isToday && (
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--kh-primary)]">
                    Oggi
                  </p>
                )}
              </div>

              {/* Sessione assegnata (o select) */}
              <div className="min-w-0 flex-1">
                <select
                  value={sessionId ?? ""}
                  onChange={(e) =>
                    overrideDay(dayIndex, e.target.value || null)
                  }
                  className="w-full truncate rounded-lg border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] px-3 py-2 text-sm text-[var(--kh-ink)] outline-none transition focus:border-[var(--kh-primary)] focus:ring-2 focus:ring-[var(--kh-primary)]/30"
                >
                  <option value="">— Riposo —</option>
                  {plan?.sessions?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {session && (
                  <p className="mt-1 text-[11px] text-[var(--kh-ink-subtle)]">
                    {session.exercises.length} esercizi · ~
                    {session.estimatedMinutes} min
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-[11px] text-[var(--kh-ink-subtle)]">
        Le modifiche qui aggiornano la scheda base per tutte le settimane.
      </p>
    </section>
  );
}