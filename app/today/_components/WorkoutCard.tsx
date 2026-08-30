"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Dumbbell,
  ChevronRight,
  Clock,
  Sparkles,
  MoreVertical,
  Check,
  Wand2,
  Undo2,
  StickyNote,
} from "lucide-react";
import { usePlan } from "../_lib/PlanContext";
import Modal from "./Modal";

export default function WorkoutCard() {
  const {
    plan,
    todaySession,
    isTodayComposed,
    getExerciseDef,
    composeToday,
    resetTodayOverride,
  } = usePlan();

  const [menuOpen, setMenuOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const chooseSession = (sessionId: string) => {
    const session = plan.sessions.find((s) => s.id === sessionId);
    if (!session) return;
    composeToday(session.exercises, session.name);
    setSwitchOpen(false);
  };

  if (!todaySession) {
    return (
      <section className="flex flex-col rounded-none bg-[#f5f5f5] p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#111111]">
            <Dumbbell className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#707072]">
              Allenamento del giorno
            </h2>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#707072]">
              Giorno di riposo
            </p>
          </div>
        </div>
        <p className="mb-4 text-sm text-[#111111]/60">
          Nessuna sessione in programma oggi. Vuoi allenarti comunque?
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSwitchOpen(true)}
            className="rounded-full border border-[#111111] bg-transparent py-3 text-sm font-bold text-[#111111] transition hover:bg-[#f5f5f5]"
          >
            Scegli sessione
          </button>
          <Link
            href="/allenamento/componi"
            className="flex items-center justify-center gap-1 rounded-full bg-[#111111] py-3 text-sm font-bold text-white transition hover:bg-[#2c2c2c]"
          >
            <Wand2 className="h-4 w-4" />
            Componi
          </Link>
        </div>

        <SessionSwitchModal
          open={switchOpen}
          onClose={() => setSwitchOpen(false)}
          currentId={null}
          sessions={plan.sessions}
          onChoose={chooseSession}
        />
      </section>
    );
  }

  return (
    <>
      <section className="flex flex-col rounded-2xl border border-teal-900/5 bg-gradient-to-br from-[#E8F3EE] to-[#DCEFEA] p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-[#111111] shadow-sm">
              <Dumbbell className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-teal-800/70">
                Allenamento del giorno
              </h2>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-600/60">
                {isTodayComposed ? (
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Personalizzato
                  </span>
                ) : (
                  "Proposta"
                )}
              </p>
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="rounded-full p-1.5 text-[#707072] transition hover:bg-white hover:text-[#111111]"
              aria-label="Opzioni sessione"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-none border-t-2 border-[#111111] bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setSwitchOpen(true);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-[#111111] transition hover:bg-[#f5f5f5]"
                >
                  <Dumbbell className="h-4 w-4 text-[#111111]" />
                  Scegli un'altra sessione
                </button>
                <Link
                  href="/allenamento/componi"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-[#111111] transition hover:bg-[#f5f5f5]"
                >
                  <Wand2 className="h-4 w-4 text-[#111111]" />
                  Componi al volo
                </Link>
                {isTodayComposed && (
                  <>
                    <div className="my-1 border-t border-emerald-900/5" />
                    <button
                      type="button"
                      onClick={() => {
                        resetTodayOverride();
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-[#111111] transition hover:bg-[#f5f5f5]"
                    >
                      <Undo2 className="h-4 w-4" />
                      Ripristina proposta
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-bold text-[#111111]">{todaySession.name}</h3>
          <p className="text-sm font-medium text-[#707072]">{todaySession.focus}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[#707072]">
            <Clock className="h-3 w-3" />
            {todaySession.exercises.length} esercizi · ~{todaySession.estimatedMinutes} min
          </p>
        </div>

        <ul className="mb-6 space-y-2">
          {todaySession.exercises.map((pe) => {
            const def = getExerciseDef(pe.exerciseId);
            return (
             <li key={pe.id} className="border-t border-[#cacacb] px-0 py-3 first:border-t-0">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-bold text-[#111111]">
                    {def?.name ?? "?"}
                    {pe.notes && (
                      <StickyNote
                        className="h-3.5 w-3.5 shrink-0 text-amber-600"
                        aria-label="Ha una nota"
                      />
                    )}
                  </span>
                  <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-bold text-[#111111] tabular-nums">
                    {pe.sets} × {pe.reps}
                  </span>
                </div>
                {/* Nota inline (compatta) */}
                {pe.notes && (
                  <p className="mt-1 pl-0 text-[11px] italic text-[#111111]/60">
                    {pe.notes}
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        <Link
          href="/allenamento"
          className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-teal-700"
        >
          Inizia workout
          <ChevronRight className="h-4 w-4" />
        </Link>
      </section>

      <SessionSwitchModal
        open={switchOpen}
        onClose={() => setSwitchOpen(false)}
        currentId={isTodayComposed ? null : todaySession.id}
        sessions={plan.sessions}
        onChoose={chooseSession}
      />
    </>
  );
}

/* --- Sotto-componente: modale di scelta sessione --- */

interface SessionSwitchModalProps {
  open: boolean;
  onClose: () => void;
  currentId: string | null;
  sessions: { id: string; name: string; focus: string; exercises: unknown[] }[];
  onChoose: (sessionId: string) => void;
}

function SessionSwitchModal({
  open,
  onClose,
  currentId,
  sessions,
  onChoose,
}: SessionSwitchModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Scegli una sessione">
      <p className="mb-4 text-xs text-[#111111]/60">
        La scelta sostituisce la proposta di oggi. La scheda base resta invariata.
      </p>
      <ul className="space-y-2">
        {sessions?.map((s) => {
          const isCurrent = s.id === currentId;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onChoose(s.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-none border px-4 py-3 text-left transition ${
                  isCurrent
                    ? "border-2 border-[#111111] bg-white"
                    : "border-[#cacacb] bg-white hover:bg-[#f5f5f5]"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#111111]">{s.name}</p>
                  <p className="truncate text-xs text-[#111111]/60">{s.focus}</p>
                </div>
                {isCurrent && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#111111]">
                    <Check className="h-3 w-3" />
                    Attuale
                  </span>
                )}
              </button>
            </li>
          );
        })}
        {(sessions?.length || 0) === 0 && (
          <p className="py-6 text-center text-sm text-[#111111]/50">
            Nessuna sessione nella scheda.
          </p>
        )}
      </ul>
    </Modal>
  );
}
