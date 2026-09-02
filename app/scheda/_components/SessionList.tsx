"use client";

import { useState } from "react";
import { Dumbbell, Pencil, Trash2, Plus, AlertTriangle, ClipboardList, LayoutTemplate } from "lucide-react";
import { usePlan } from "../../today/_lib/PlanContext";
import type { WorkoutSession } from "../../today/_lib/types";
import SessionEditor from "./SessionEditor";
import TemplatePickerModal from "./TemplatePickerModal";

/**
 * Lista delle sessioni della scheda.
 * - Modifica → apre l'editor con la sessione precompilata
 * - Elimina → conferma inline (evita cancellazioni accidentali)
 * - Nuova sessione → apre l'editor vuoto
 */

export default function SessionList() {
  const { plan, deleteSession, getExerciseDef, hasPersistedPlan } = usePlan();
  const [editing, setEditing] = useState<WorkoutSession | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  const openEdit = (s: WorkoutSession) => setEditing(s);
  const closeEdit = () => setEditing(null);

  const openNew = () => setCreating(true);
  const closeNew = () => setCreating(false);

  return (
    <>
      <section className="rounded-2xl border border-emerald-900/5 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-teal-700" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-800/70">
              Le mie sessioni ({plan?.sessions?.length || 0})
            </h2>
          </div>
          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Nuova
          </button>
        </div>

        {(plan?.sessions?.length || 0) === 0 ? (
          hasPersistedPlan ? (
            // hasPersistedPlan true + 0 sessioni = scelta reale dell'utente (onboarding
            // "parto da zero" o scheda svuotata), non il fallback PPL legacy: qui l'empty
            // state non è una bugia.
            <div className="py-4 text-center">
              <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                <ClipboardList className="h-5 w-5 text-emerald-600" />
              </span>
              <p className="mb-1 text-sm font-bold text-emerald-950">Nessuna scheda attiva</p>
              <p className="mx-auto mb-4 max-w-xs text-xs text-emerald-800/60">
                Costruiscila esercizio per esercizio, oppure parti da un template.
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={openNew}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4" />
                  Crea da zero
                </button>
                <button
                  type="button"
                  onClick={() => setTemplatePickerOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700"
                >
                  <LayoutTemplate className="h-4 w-4" />
                  Scegli un template
                </button>
              </div>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-emerald-800/50">
              Nessuna sessione. Creane una per iniziare a costruire la scheda.
            </p>
          )
        ) : (
          <ul className="space-y-2">
            {plan.sessions.map((s) => {
              // Piccola anteprima esercizi (primi 3 nomi)
              const preview = s.exercises
                .slice(0, 3)
                .map((pe) => getExerciseDef(pe.exerciseId)?.name ?? "?")
                .join(" · ");
              const extra =
                s.exercises.length > 3 ? ` +${s.exercises.length - 3}` : "";

              return (
                <li
                  key={s.id}
                  className="rounded-xl border border-emerald-900/10 bg-white p-3"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-emerald-950">{s.name}</p>
                      <p className="text-xs font-medium text-emerald-800/60">
                        {s.focus} · ~{s.estimatedMinutes} min
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(s)}
                        className="rounded-lg border border-emerald-900/10 bg-white p-2 text-emerald-700 transition hover:bg-emerald-50"
                        aria-label="Modifica"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(s.id)}
                        className="rounded-lg border border-emerald-900/10 bg-white p-2 text-red-600 transition hover:bg-red-50"
                        aria-label="Elimina"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {preview && (
                    <p className="truncate text-[11px] font-medium text-emerald-800/50">
                      {preview}
                      {extra}
                    </p>
                  )}

                  {/* Conferma inline eliminazione */}
                  {confirmDelete === s.id && (
                    <div className="mt-3 rounded-lg bg-red-50 p-3">
                      <div className="mb-2 flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                        <p className="text-xs text-red-900">
                          Eliminare questa sessione? Verrà rimossa anche dai
                          giorni in cui era assegnata.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(null)}
                          className="rounded-lg border border-red-200 bg-white py-1.5 text-xs font-bold text-emerald-800"
                        >
                          Annulla
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteSession(s.id);
                            setConfirmDelete(null);
                          }}
                          className="rounded-lg bg-red-600 py-1.5 text-xs font-bold text-white"
                        >
                          Elimina
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Editor (uno per volta: edit o create) */}
      <SessionEditor open={editing !== null} onClose={closeEdit} session={editing} />
      <SessionEditor open={creating} onClose={closeNew} session={null} />
      <TemplatePickerModal
        open={templatePickerOpen}
        onClose={() => setTemplatePickerOpen(false)}
      />
    </>
  );
}
