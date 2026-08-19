"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../../_lib/supabase/client";   // <-- NUOVO
import { useAuth } from "../../_lib/AuthContext";        // <-- NUOVO
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
  loading: boolean;                                          // <-- NUOVO
  stats: WorkoutStats;
  records: ExerciseRecord[];
  lastPR: PRHit | null;
  dismissPR: () => void;

  startSession: (session: WorkoutSession, exerciseDefName: (id: string) => string) => void;
  addSet: (exerciseIndex: number, set: CompletedSet) => void;
  removeLastSet: (exerciseIndex: number) => void;
  cancelSession: () => void;
  finishSession: (durationSeconds: number) => Promise<DetailedWorkoutLog | null>;
}

const WorkoutSessionContext = createContext<WorkoutSessionContextValue | null>(null);
// const STORAGE_KEY_LOGS = ...      ← CANCELLA
// const STORAGE_KEY_ACTIVE = ...    ← CANCELLA
// const initialLogs = [ ... ]       ← CANCELLA tutto il seed (righe ~65-80)

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Seed iniziale per far vedere subito qualche statistica. */

//Commentato e non cancellato che non so cosa faccia
//Dovrebbero esser i dati finti-- di prova
/*const initialLogs: DetailedWorkoutLog[] = [
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
];*/


export function WorkoutSessionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<DetailedWorkoutLog[]>([]);
  const [active, setActive] = useState<ActiveSession | null>(null);
  const [lastPR, setLastPR] = useState<PRHit | null>(null);
  const [loading, setLoading] = useState(true);

  const dismissPR = useCallback(() => setLastPR(null), []);
  const records = useMemo(() => buildAllRecords(logs), [logs]);

  // Carica storico + eventuale sessione interrotta
  useEffect(() => {
    if (!user) {
      setLogs([]);
      setActive(null);
      setLoading(false);
      return;
    }
    (async () => {
      const [logsRes, activeRes] = await Promise.all([
        supabase
          .from("workout_logs")
          .select("id, date, session_name, duration_seconds, exercises")
          .order("date", { ascending: false })
          .limit(200),
        // maybeSingle: 0 righe non è un errore (nessuna sessione in corso)
        supabase.from("active_sessions").select("data").eq("user_id", user.id).maybeSingle(),
      ]);

      if (logsRes.error) console.error("[workout]", logsRes.error.message);
      if (logsRes.data) {
        setLogs(
          logsRes.data.map((r) => ({
            id: r.id as string,
            date: r.date as string,
            sessionName: r.session_name as string,
            durationSeconds: Number(r.duration_seconds),   // numeric → stringa
            exercises: (r.exercises ?? []) as CompletedExercise[],
          }))
        );
      }

      if (activeRes.error) console.error("[workout:active]", activeRes.error.message);
      if (activeRes.data?.data) setActive(activeRes.data.data as ActiveSession);

      setLoading(false);
    })();
  }, [user]);

  /**
   * Sessione attiva: upsert su PK user_id (una sola sessione in corso per utente).
   * Fire-and-forget: la UI non deve attendere la rete a ogni set.
   */
  const persistActive = (next: ActiveSession | null) => {
    setActive(next);
    if (!user) return;

    if (next) {
      supabase
        .from("active_sessions")
        .upsert({ user_id: user.id, data: next })
        .then(({ error }) => error && console.error("[workout:active]", error.message));
    } else {
      supabase
        .from("active_sessions")
        .delete()
        .eq("user_id", user.id)
        .then(({ error }) => error && console.error("[workout:active]", error.message));
    }
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

  const finishSession = async (
    durationSeconds: number
  ): Promise<DetailedWorkoutLog | null> => {
    setLastPR(null);
    if (!active || !user) return null;

    const today = todayISO();
    const exercises = active.exercises
      .filter((ex) => ex.sets.length > 0)
      .map<CompletedExercise>((ex) => ({
        exerciseId: ex.exerciseId,
        name: ex.name,
        sets: ex.sets,
      }));

    // Anti-duplicato: stesso nome sessione, stesso giorno
    const alreadyToday = logs.some(
      (l) => l.date === today && l.sessionName === active.sessionName
    );

    let saved: DetailedWorkoutLog | null = null;

    if (!alreadyToday) {
      // select().single() obbligatorio: serve l'uuid generato dal DB
      const { data, error } = await supabase
        .from("workout_logs")
        .insert({
          user_id: user.id,
          date: today,
          session_name: active.sessionName,
          duration_seconds: durationSeconds,
          exercises,
        })
        .select("id, date, session_name, duration_seconds, exercises")
        .single();

      if (error) {
        console.error("[workout]", error.message);
      } else if (data) {
        saved = {
          id: data.id as string,
          date: data.date as string,
          sessionName: data.session_name as string,
          durationSeconds: Number(data.duration_seconds),
          exercises: (data.exercises ?? []) as CompletedExercise[],
        };
        // forma funzionale: siamo dopo un await, `logs` in closure è stale
        setLogs((prev) => [saved!, ...prev]);
      }
    }

    persistActive(null);
    return saved;
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
        loading,
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
