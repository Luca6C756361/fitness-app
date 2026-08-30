"use client";

import { useState } from "react";
import { Dumbbell, Pencil, Trash2, Plus, AlertTriangle } from "lucide-react";
import { usePlan } from "../../today/_lib/PlanContext";
import type { WorkoutSession } from "../../today/_lib/types";
import SessionEditor from "./SessionEditor";

/**
 * Lista delle sessioni della scheda.
 * - Modifica → apre l'editor con la sessione precompilata
 * - Elimina → conferma inline (evita cancellazioni accidentali)
 * - Nuova sessione → apre l'editor vuoto
 */

export default function SessionList() {
  const { plan, deleteSession, getExerciseDef } = usePlan();
  const [editing, setEditing] = useState<WorkoutSession | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const openEdit = (s: WorkoutSession) => setEditing(s);
  const closeEdit = () => setEditing(null);

  const openNew = () => setCreating(true);
  const closeNew = () => setCreating(false);

  return (
    <>
      <section className="rounded-2xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] p-6 shadow-[var(--kh-card-shadow)]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-[var(--kh-primary)]" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--kh-ink-muted)]">
              Le mie sessioni ({plan?.sessions?.length || 0})
            </h2>
          </div>
          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-1 rounded-lg bg-[var(--kh-primary)] px-3 py-1.5 text-xs font-bold text-white shadow-[var(--kh-glow-primary)] transition hover:bg-[var(--kh-primary-hover)]"
          >
            <Plus className="h-3.5 w-3.5" />
            Nuova
          </button>
        </div>

        {(plan?.sessions?.length || 0) === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--kh-ink-subtle)]">
            Nessuna sessione. Creane una per iniziare a costruire la scheda.
          </p>
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
                  className="rounded-xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] p-3"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[var(--kh-ink)]">{s.name}</p>
                      <p className="text-xs font-medium text-[var(--kh-ink-muted)]">
                        {s.focus} · ~{s.estimatedMinutes} min
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(s)}
                        className="rounded-lg border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] p-2 text-[var(--kh-primary)] transition hover:border-[var(--kh-primary)]"
                        aria-label="Modifica"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(s.id)}
                        className="rounded-lg border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] p-2 text-red-500 transition hover:border-red-500/50 hover:bg-red-500/10"
                        aria-label="Elimina"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {preview && (
                    <p className="truncate text-[11px] font-medium text-[var(--kh-ink-subtle)]">
                      {preview}
                      {extra}
                    </p>
                  )}

                  {/* Conferma inline eliminazione */}
                  {confirmDelete === s.id && (
                    <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                      <div className="mb-2 flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                        <p className="text-xs text-[var(--kh-ink)]">
                          Eliminare questa sessione? Verrà rimossa anche dai
                          giorni in cui era assegnata.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(null)}
                          className="rounded-lg border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] py-1.5 text-xs font-bold text-[var(--kh-ink-muted)] transition hover:text-[var(--kh-ink)]"
                        >
                          Annulla
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteSession(s.id);
                            setConfirmDelete(null);
                          }}
                          className="rounded-lg bg-red-600 py-1.5 text-xs font-bold text-white transition hover:bg-red-700"
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
    </>
  );
}