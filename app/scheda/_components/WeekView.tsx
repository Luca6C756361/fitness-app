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
    <section className="rounded-2xl border border-emerald-900/5 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-emerald-700" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-800/70">
          Piano settimanale
        </h2>
      </div>

      <ul className="space-y-2">
  {displayOrder.map((dayIndex) => {
    // 1. Aggiungi i punti interrogativi qui:
    const sessionId = plan?.weekMap?.[dayIndex];
    
    const session = sessionId
      // 2. E aggiungi i punti interrogativi anche qui:
      ? plan?.sessions?.find((s) => s.id === sessionId)
      : null;
      
    const isToday = dayIndex === todayDayIndex;

    return (
            <li
              key={dayIndex}
              className={`flex items-center gap-3 rounded-xl border p-3 ${
                isToday
                  ? "border-teal-300 bg-teal-50/50"
                  : "border-emerald-900/10 bg-white"
              }`}
            >
              {/* Giorno */}
              <div className="w-24 shrink-0">
                <p className="text-sm font-bold text-emerald-950">
                  {dayLabels[dayIndex]}
                </p>
                {isToday && (
                  <p className="text-[10px] font-bold uppercase tracking-wide text-teal-700">
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
                  className="w-full truncate rounded-lg border border-emerald-900/10 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  <option value="">— Riposo —</option>
                  {plan?.sessions?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {session && (
                  <p className="mt-1 text-[11px] text-emerald-800/50">
                    {session.exercises.length} esercizi · ~
                    {session.estimatedMinutes} min
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-[11px] text-emerald-800/50">
        Le modifiche qui aggiornano la scheda base per tutte le settimane.
      </p>
    </section>
  );
}
