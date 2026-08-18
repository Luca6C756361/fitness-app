"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type {
  CompletedExercise,
  CompletedSet,
  DetailedWorkoutLog,
  WorkoutSession,
} from "./types";
import {
  buildAllRecords,
  detectPR,
  recordForExercise,
  type ExerciseRecord,
  type PRHit,
} from "./prStats";
/**
 * WorkoutSessionContext: gestisce l'allenamento in corso e lo storico completato.
 *
 * Concetti:
 * - active: la sessione in corso (con dati compilati durante l'esecuzione)
 * - logs: storico di sessioni completate (persistente in localStorage)
 * - stats: derivati per la pagina /stats (mese, streak, ultima)
 *
 * Il timer NON vive qui — sta nella pagina /allenamento, che lo gestisce
 * localmente. Qui salviamo solo il totale al momento del salvataggio.
 */

interface ActiveExercise {
  exerciseId: string;
  name: string;
  targetSets: number;
  targetReps: number;
  sets: CompletedSet[]; // set completati finora
}

interface ActiveSession {
  sessionName: string;
  startedAt: number; // timestamp ms
  exercises: ActiveExercise[];
}

interface WorkoutStats {
  thisMonthCount: number;
  streak: number;
  last: DetailedWorkoutLog | null;
}

interface WorkoutSessionContextValue {
  active: ActiveSession | null;
  logs: DetailedWorkoutLog[];
  stats: WorkoutStats;
  records: ExerciseRecord[];
  /** PR appena battuto nella sessione live (null se nessuno). */
  lastPR: PRHit | null;
  dismissPR: () => void;

  // Gestione sessione attiva
  startSession: (session: WorkoutSession, exerciseDefName: (id: string) => string) => void;
  addSet: (exerciseIndex: number, set: CompletedSet) => void;
  removeLastSet: (exerciseIndex: number) => void;
  cancelSession: () => void;
  finishSession: (durationSeconds: number) => DetailedWorkoutLog | null;
}

const WorkoutSessionContext = createContext<WorkoutSessionContextValue | null>(null);
const STORAGE_KEY_LOGS = "fitness-app:workoutLogs";
const STORAGE_KEY_ACTIVE = "fitness-app:activeSession";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Seed iniziale per far vedere subito qualche statistica. */
const initialLogs: DetailedWorkoutLog[] = [
  {
    id: 1,
    date: "2026-07-30",
    sessionName: "Push — Petto, Spalle, Tricipiti",
    durationSeconds: 2400,
    exercises: [],
  },
  {
    id: 2,
    date: "2026-07-31",
    sessionName: "Pull — Schiena, Bicipiti",
    durationSeconds: 2100,
    exercises: [],
  },
];

export function WorkoutSessionProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<DetailedWorkoutLog[]>(initialLogs);
  const [active, setActive] = useState<ActiveSession | null>(null);
  const [lastPR, setLastPR] = useState<PRHit | null>(null);

  const dismissPR = useCallback(() => setLastPR(null), []);

  /** Record storici, ricalcolati solo quando cambiano i log. */
  const records = useMemo(() => buildAllRecords(logs), [logs]);

  // Carica da localStorage
  useEffect(() => {
    try {
      const savedLogs = localStorage.getItem(STORAGE_KEY_LOGS);
      if (savedLogs) setLogs(JSON.parse(savedLogs));
    } catch {
      /* seed */
    }
    try {
      const savedActive = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (savedActive) setActive(JSON.parse(savedActive));
    } catch {
      /* ignora */
    }
  }, []);

  const persistLogs = (next: DetailedWorkoutLog[]) => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(next));
    setLogs(next);
  };

  const persistActive = (next: ActiveSession | null) => {
    if (next) {
      localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(next));
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE);
    }
    setActive(next);
  };

  const startSession = (
    session: WorkoutSession,
    getName: (id: string) => string
  ) => {
    const activeSession: ActiveSession = {
      sessionName: session.name,
      startedAt: Date.now(),
      exercises: session.exercises.map((pe) => ({
        exerciseId: pe.exerciseId,
        name: getName(pe.exerciseId),
        targetSets: pe.sets,
        targetReps: pe.reps,
        sets: [],
      })),
    };
    persistActive(activeSession);
  };

  const addSet = (exerciseIndex: number, set: CompletedSet) => {
    if (!active) return;

    // Rilevamento PR: confronto con storico + set già fatti in questa sessione
    const ex = active.exercises[exerciseIndex];
    if (ex) {
      const base = recordForExercise(logs, ex.exerciseId, ex.sets, ex.name);
      const hit = detectPR(base, ex.exerciseId, ex.name, set);
      if (hit) setLastPR(hit);
    }

    const next: ActiveSession = {
      ...active,
      exercises: active.exercises.map((e, i) =>
        i === exerciseIndex ? { ...e, sets: [...e.sets, set] } : e
      ),
    };
    persistActive(next);
  };

  const removeLastSet = (exerciseIndex: number) => {
    setLastPR(null);
    if (!active) return;
    const next: ActiveSession = {
      ...active,
      exercises: active.exercises.map((ex, i) =>
        i === exerciseIndex ? { ...ex, sets: ex.sets.slice(0, -1) } : ex
      ),
    };
    persistActive(next);
  };

  const cancelSession = () => {
    setLastPR(null); 
    persistActive(null);
  };

  const finishSession = (durationSeconds: number): DetailedWorkoutLog | null => {
    setLastPR(null);
    if (!active) return null;

    const log: DetailedWorkoutLog = {
      id: Date.now(),
      date: todayISO(),
      sessionName: active.sessionName,
      durationSeconds,
      exercises: active.exercises
        .filter((ex) => ex.sets.length > 0) // solo esercizi con almeno un set
        .map<CompletedExercise>((ex) => ({
          exerciseId: ex.exerciseId,
          name: ex.name,
          sets: ex.sets,
        })),
    };

    // Evita duplicati dello stesso allenamento nello stesso giorno
    const today = todayISO();
    const alreadyToday = logs.some(
      (l) => l.date === today && l.sessionName === active.sessionName
    );
    if (!alreadyToday) {
      persistLogs([...logs, log]);
    }
    persistActive(null);
    return log;
  };

  // Statistiche derivate
  const stats = useMemo<WorkoutStats>(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const thisMonthCount = logs.filter((l) => {
      const d = new Date(l.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    const dates = new Set(logs.map((l) => l.date));
    let streak = 0;
    const cursor = new Date();
    if (!dates.has(cursor.toISOString().slice(0, 10))) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (dates.has(cursor.toISOString().slice(0, 10))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    const last = sorted.length > 0 ? sorted[sorted.length - 1] : null;

    return { thisMonthCount, streak, last };
  }, [logs]);

  return (
    <WorkoutSessionContext.Provider
      value={{
        active,
        logs,
        stats,
        records,     
        lastPR,       
        dismissPR,
        startSession,
        addSet,
        removeLastSet,
        cancelSession,
        finishSession,
      }}
    >
      {children}
    </WorkoutSessionContext.Provider>
  );
}

export function useWorkoutSession() {
  const ctx = useContext(WorkoutSessionContext);
  if (!ctx)
    throw new Error(
      "useWorkoutSession deve essere usato dentro <WorkoutSessionProvider>"
    );
  return ctx;
}
