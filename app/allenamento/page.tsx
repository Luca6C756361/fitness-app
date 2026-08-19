"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Flag,
  Clock,
  Sparkles,
  CheckCircle2,
  StickyNote,
} from "lucide-react";
import { usePlan } from "../today/_lib/PlanContext";
import { useWorkoutSession } from "../today/_lib/WorkoutSessionContext";
import SessionTimer from "./_components/SessionTimer";
import RestTimer from "./_components/RestTimer";
import RestPresetPicker from "./_components/RestPresetPicker";
import ExerciseSetCard from "./_components/ExerciseSetCard";
import type { CompletedSet } from "../today/_lib/types";
import PRToast from "./_components/PRToast";

export default function AllenamentoPage() {
  const router = useRouter();
  const { todaySession, isTodayComposed, getExerciseDef } = usePlan();
  const {
    active,
    startSession,
    addSet,
    removeLastSet,
    cancelSession,
    finishSession,
  } = useWorkoutSession();

  const [restDefault, setRestDefault] = useState(90);
  const [restActive, setRestActive] = useState<number | null>(null);
  const [durationSec, setDurationSec] = useState(0);

  if (!todaySession) {
    return (
      <ShellWithBack>
        <div className="rounded-2xl border border-emerald-900/5 bg-white p-8 text-center shadow-sm">
          <p className="mb-4 text-sm text-emerald-800/60">
            Nessuna sessione in programma oggi.
          </p>
          <Link
            href="/allenamento/componi"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700"
          >
            <Sparkles className="h-4 w-4" />
            Componi al volo
          </Link>
        </div>
      </ShellWithBack>
    );
  }

  if (!active) {
    return (
      <ShellWithBack subtitle={isTodayComposed ? "Sessione composta" : "Sessione proposta"}>
        <section className="rounded-2xl border border-emerald-900/5 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-xl font-bold text-emerald-950">
            {todaySession.name}
          </h2>
          <p className="mb-4 flex items-center gap-1.5 text-sm font-medium text-emerald-800/60">
            <Clock className="h-3.5 w-3.5" />
            {todaySession.focus} · ~{todaySession.estimatedMinutes} min ·{" "}
            {todaySession.exercises.length} esercizi
          </p>

          <ul className="mb-4 space-y-2">
            {todaySession.exercises.map((pe) => {
              const def = getExerciseDef(pe.exerciseId);
              return (
                <li
                  key={pe.id}
                  className="rounded-xl bg-[#FAF7F0] px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium text-emerald-950">
                      {def?.name ?? "?"}
                      {pe.notes && (
                        <StickyNote className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                      )}
                    </span>
                    <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-bold text-teal-700 tabular-nums">
                      {pe.sets} × {pe.reps}
                    </span>
                  </div>
                  {pe.notes && (
                    <p className="mt-1 text-[11px] italic text-emerald-800/60">
                      {pe.notes}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <RestPresetPicker value={restDefault} onChange={setRestDefault} />

        <button
          type="button"
          onClick={() =>
            startSession(todaySession, (id) => getExerciseDef(id)?.name ?? "?")
          }
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 py-4 text-base font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-teal-700"
        >
          <Play className="h-5 w-5" />
          Inizia sessione
        </button>
      </ShellWithBack>
    );
  }

  const totalTargetSets = active.exercises.reduce(
    (s, ex) => s + ex.targetSets,
    0
  );
  const totalCompleted = active.exercises.reduce(
    (s, ex) => s + ex.sets.length,
    0
  );
  const progressPct = Math.round((totalCompleted / totalTargetSets) * 100);
  const isFullyComplete = totalCompleted >= totalTargetSets;

  const handleCompleteSet = (exIndex: number, set: CompletedSet) => {
    addSet(exIndex, set);
    if (totalCompleted + 1 < totalTargetSets) {
      setRestActive(restDefault);
    }
  };

    const handleFinish = async () => {                      // <-- MODIFICATA
    const log = await finishSession(durationSec);         // <-- MODIFICATA
    if (log) router.push("/today");
  };

  const handleCancel = () => {
    if (
      confirm(
        "Sei sicuro di voler annullare la sessione? I dati non verranno salvati."
      )
    ) {
      cancelSession();
      router.push("/today");
    }
  };

  return (
    <ShellWithBack subtitle="Sessione in corso" onBack={handleCancel}>
      <SessionTimer onTick={setDurationSec} onStop={() => setDurationSec(durationSec)} />

      <div className="rounded-2xl border border-emerald-900/5 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-emerald-800/60">
          <span>Progresso</span>
          <span className="tabular-nums">
            {totalCompleted} / {totalTargetSets} set
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
          <div
            className="h-full rounded-full bg-teal-600 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {active.exercises.map((ex, i) => {
          // Recupero la nota dall'esercizio pianificato originale (stessa posizione)
          const plannedNote = todaySession.exercises[i]?.notes;
          return (
            <ExerciseSetCard
              key={`${ex.exerciseId}-${i}`}
              index={i}
              name={ex.name}
              targetSets={ex.targetSets}
              targetReps={ex.targetReps}
              completedSets={ex.sets}
              onCompleteSet={(set) => handleCompleteSet(i, set)}
              onUndo={() => removeLastSet(i)}
              notes={plannedNote}
            />
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleFinish}
        disabled={totalCompleted === 0}
        className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold uppercase tracking-wide shadow-md transition ${
          isFullyComplete
            ? "bg-teal-600 text-white hover:bg-teal-700"
            : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        }`}
      >
        {isFullyComplete ? (
          <>
            <CheckCircle2 className="h-5 w-5" />
            Termina e salva
          </>
        ) : (
          <>
            <Flag className="h-5 w-5" />
            Termina sessione
          </>
        )}
      </button>

      <RestTimer
        active={restActive}
        onCancel={() => setRestActive(null)}
        onEnd={() => setRestActive(null)}
        onExtend={(extra) => setRestActive((r) => (r === null ? null : r + extra))}
      />
    </ShellWithBack>
  );
}

function ShellWithBack({
  children,
  subtitle,
  onBack,
}: {
  children: React.ReactNode;
  subtitle?: string;
  onBack?: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#FAF7F0] px-4 py-6 pb-32 md:px-8 md:py-10">
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="flex items-center gap-4">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-900/10 bg-white shadow-sm transition hover:bg-emerald-50"
              aria-label="Annulla sessione"
            >
              <ArrowLeft className="h-4 w-4 text-emerald-800" />
            </button>
          ) : (
            <Link
              href="/today"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-900/10 bg-white shadow-sm transition hover:bg-emerald-50"
              aria-label="Torna alla dashboard"
            >
              <ArrowLeft className="h-4 w-4 text-emerald-800" />
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-emerald-950">
              Allenamento
            </h1>
            {subtitle && (
              <p className="text-sm font-medium text-emerald-800/60">{subtitle}</p>
            )}
          </div>
        </div>
        {children}
      </div>
      <PRToast />
    </main>
  );
}
