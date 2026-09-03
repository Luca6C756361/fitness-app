"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "../../today/_components/Modal";
import { usePlan } from "../../today/_lib/PlanContext";
import { exerciseDatabase } from "../../today/_lib/exerciseData";
import { PLAN_TEMPLATES, type PlanTemplate } from "../../onboarding/_lib/planTemplates";
import type { WorkoutSession } from "../../today/_lib/types";

interface TemplatePickerModalProps {
  open: boolean;
  onClose: () => void;
}

type Task =
  | { kind: "session"; session: WorkoutSession }
  | { kind: "day"; day: number; sessionId: string | null };

const applicableTemplates = PLAN_TEMPLATES.filter((t) => t.id !== "vuoto");

function exerciseName(exerciseId: string): string {
  return exerciseDatabase.find((e) => e.id === exerciseId)?.name ?? "?";
}

/** createSession per ogni sessione, poi un task "day" per ognuno dei 7 giorni del weekMap. */
function buildQueue(template: PlanTemplate): Task[] {
  const sessionTasks: Task[] = template.plan.sessions.map((session) => ({
    kind: "session",
    session,
  }));
  const dayTasks: Task[] = template.plan.weekMap.map((sessionId, day) => ({
    kind: "day",
    day,
    sessionId,
  }));
  return [...sessionTasks, ...dayTasks];
}

/**
 * Applica un PlanTemplate usando SOLO i metodi esistenti di PlanContext
 * (createSession, overrideDay) — nessuna scrittura diretta su Supabase.
 *
 * ATTENZIONE ARCHITETTURALE: createSession/overrideDay costruiscono il nuovo
 * piano a partire dal `plan` corrente catturato nella closure del render in
 * cui sono stati letti da usePlan(). Chiamarli più volte di fila nella STESSA
 * closure (es. in un semplice for-loop) farebbe leggere a ognuno lo stesso
 * `plan` non aggiornato: la seconda sessione sovrascriverebbe la prima invece
 * di sommarsi. Per questo l'applicazione procede una task alla volta tramite
 * una coda pilotata da un effect: ogni avanzamento di `queueIndex` forza un
 * nuovo render di questo componente, che rilegge usePlan() e ottiene un
 * `createSession`/`overrideDay` aggiornati sul piano appena scritto.
 */
export default function TemplatePickerModal({ open, onClose }: TemplatePickerModalProps) {
  const { plan, createSession, overrideDay } = usePlan();
  const [pending, setPending] = useState<PlanTemplate | null>(null);
  const [queue, setQueue] = useState<Task[] | null>(null);
  const [queueIndex, setQueueIndex] = useState(0);

  const planNotEmpty = (plan?.sessions?.length ?? 0) > 0;
  const applying = queue !== null;

  useEffect(() => {
    if (!queue) return;

    if (queueIndex >= queue.length) {
      window.setTimeout(() => {
        setQueue(null);
        setQueueIndex(0);
        setPending(null);
        onClose();
      }, 0);
      return;
    }

    const task = queue[queueIndex];
    let cancelled = false;
    (async () => {
      if (task.kind === "session") await createSession(task.session);
      else await overrideDay(task.day, task.sessionId);
      if (!cancelled) window.setTimeout(() => setQueueIndex((i) => i + 1), 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [queue, queueIndex, createSession, overrideDay, onClose]);

  const startApplying = (template: PlanTemplate) => {
    setPending(null);
    setQueueIndex(0);
    setQueue(buildQueue(template));
  };

  const handlePick = (t: PlanTemplate) => {
    if (planNotEmpty) setPending(t);
    else startApplying(t);
  };

  const handleClose = () => {
    if (applying) return; // non interrompere un'applicazione in corso
    setPending(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Scegli un template" size="lg">
      {pending ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="mb-3 flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-900">
              Sostituire la scheda attuale con &quot;{pending.name}&quot;? I giorni della
              settimana verranno riassegnati al nuovo template.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPending(null)}
              className="rounded-lg border border-amber-300 bg-white py-2 text-xs font-bold text-fg-secondary"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={() => startApplying(pending)}
              className="rounded-lg bg-amber-600 py-2 text-xs font-bold text-white"
            >
              Sostituisci
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {applicableTemplates.map((t) => (
            <button
              key={t.id}
              type="button"
              disabled={applying}
              onClick={() => handlePick(t)}
              className="w-full rounded-xl border border-emerald-900/10 bg-white p-4 text-left transition hover:border-emerald-600 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:bg-surface-raised"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-fg-primary">{t.name}</span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-fg-muted">
                  {t.daysPerWeek}g/sett
                </span>
              </div>
              <p className="mb-2 text-xs text-fg-secondary">{t.description}</p>
              <ul className="space-y-1">
                {t.plan.sessions.map((s) => {
                  const preview = s.exercises
                    .slice(0, 3)
                    .map((pe) => exerciseName(pe.exerciseId))
                    .join(" · ");
                  const extra = s.exercises.length > 3 ? ` +${s.exercises.length - 3}` : "";
                  return (
                    <li key={s.id} className="text-[11px] font-medium text-fg-muted">
                      <span className="font-bold text-fg-secondary">{s.name}:</span> {preview}
                      {extra}
                    </li>
                  );
                })}
              </ul>
            </button>
          ))}
          {applying && (
            <p className="text-center text-xs font-medium text-fg-secondary">
              Applico il template…
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
