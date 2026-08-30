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
      <section className="flex flex-col rounded-[12px] border border-[#23252a] bg-[#0f1011] p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#141516] text-[#00E5FF]">
            <Dumbbell className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-[#d0d6e0]">
              Allenamento del giorno
            </h2>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8a8f98]">
              Giorno di riposo
            </p>
          </div>
        </div>
        <p className="mb-4 text-[16px] text-[#d0d6e0]">
          Nessuna sessione in programma oggi. Vuoi allenarti comunque?
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSwitchOpen(true)}
            className="rounded-[6px] border border-[#23252a] bg-[#141516] py-3 text-[16px] font-medium text-[#F8F2FC] transition hover:bg-[#23252a]"
          >
            Scegli sessione
          </button>
          <Link
            href="/allenamento/componi"
            className="flex items-center justify-center gap-1 rounded-[6px] bg-[#F8F2FC] py-3 text-[16px] font-medium text-[#010102] transition hover:bg-[#d0d6e0]"
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
      <section className="flex flex-col rounded-[12px] border border-[#23252a] bg-[#0f1011] p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#141516] text-[#00E5FF]">
              <Dumbbell className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-[12px] font-bold uppercase tracking-widest text-[#d0d6e0]">
                Allenamento del giorno
              </h2>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#00E5FF]">
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
              className="rounded-[6px] p-1.5 text-[#8a8f98] transition hover:bg-[#141516] hover:text-[#F8F2FC]"
              aria-label="Opzioni sessione"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-[6px] border border-[#23252a] bg-[#0f1011]">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setSwitchOpen(true);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-[#d0d6e0] transition hover:bg-[#141516]"
                >
                  <Dumbbell className="h-4 w-4 text-[#d0d6e0]" />
                  Scegli un'altra sessione
                </button>
                <Link
                  href="/allenamento/componi"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-[#d0d6e0] transition hover:bg-[#141516]"
                >
                  <Wand2 className="h-4 w-4 text-[#d0d6e0]" />
                  Componi al volo
                </Link>
                {isTodayComposed && (
                  <>
                    <div className="my-1 border-t border-[#23252a]" />
                    <button
                      type="button"
                      onClick={() => {
                        resetTodayOverride();
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-[#d0d6e0] transition hover:bg-[#141516]"
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
          <h3 className="text-[22px] font-medium tracking-[-0.4px] text-[#F8F2FC]">
            {todaySession.name}
          </h3>
          <p className="text-[16px] text-[#8a8f98]">{todaySession.focus}</p>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] font-mono text-[#62666d]">
            <Clock className="h-3 w-3" />
            {todaySession.exercises.length} esercizi • ~{todaySession.estimatedMinutes} min
          </p>
        </div>

        <ul className="mb-6 space-y-0">
          {todaySession.exercises.map((pe) => {
            const def = getExerciseDef(pe.exerciseId);
            return (
              <li key={pe.id} className="border-b border-[#23252a] py-3 first:border-t-0">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[13px] font-mono text-[#d0d6e0]">
                    {def?.name ?? "?"}
                    {pe.notes && (
                      <StickyNote
                        className="h-3.5 w-3.5 shrink-0 text-[#951DD1]"
                        aria-label="Ha una nota"
                      />
                    )}
                  </span>
                  <span className="rounded-[4px] bg-[#141516] px-2.5 py-1 text-[13px] font-mono text-[#F8F2FC]">
                    {pe.sets} × {pe.reps}
                  </span>
                </div>
                {pe.notes && (
                  <p className="mt-1 pl-0 text-[12px] italic text-[#62666d]">
                    {pe.notes}
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        <Link
          href="/allenamento"
          className="mt-auto flex items-center justify-center gap-2 rounded-full bg-[#00E5FF] py-4 text-[22px] font-medium tracking-[-0.4px] text-[#010102] transition hover:bg-[#5CEBFF] hover:shadow-[0_0_15px_rgba(0,229,255,0.4)]"
        >
          Inizia workout
          <ChevronRight className="h-5 w-5" />
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
      <p className="mb-4 text-[12px] text-[#8a8f98]">
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
                className={`flex w-full items-center justify-between gap-3 rounded-[6px] border px-4 py-3 text-left transition ${
                  isCurrent
                    ? "border-[#00E5FF] bg-[#141516]"
                    : "border-[#23252a] bg-[#0f1011] hover:bg-[#141516]"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-[16px] font-medium text-[#F8F2FC]">{s.name}</p>
                  <p className="truncate text-[12px] text-[#8a8f98]">{s.focus}</p>
                </div>
                {isCurrent && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#00E5FF]">
                    <Check className="h-3 w-3" />
                    Attuale
                  </span>
                )}
              </button>
            </li>
          );
        })}
        {(sessions?.length || 0) === 0 && (
          <p className="py-6 text-center text-[16px] text-[#62666d]">
            Nessuna sessione nella scheda.
          </p>
        )}
      </ul>
    </Modal>
  );
}