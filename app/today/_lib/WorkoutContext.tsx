"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * WorkoutContext: log delle sessioni completate.
 * Espone stats derivate (mese corrente, streak, ultima sessione).
 */

export interface WorkoutLog {
  id: number;
  date: string; // ISO YYYY-MM-DD
  session: string;
  durationSeconds: number;
}

interface WorkoutStats {
  thisMonthCount: number;
  streak: number;
  last: WorkoutLog | null;
}

interface WorkoutContextValue {
  logs: WorkoutLog[];
  logWorkout: (session: string, durationSeconds: number) => void;
  stats: WorkoutStats;
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null);
const STORAGE_KEY = "fitness-app:workoutLogs";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Seed iniziale: qualche allenamento per far vedere subito streak/stats. */
const initialLogs: WorkoutLog[] = [
  { id: 1, date: "2026-07-30", session: "Sessione B — Gambe", durationSeconds: 2400 },
  { id: 2, date: "2026-07-31", session: "Sessione A — Forza Base", durationSeconds: 2100 },
];

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<WorkoutLog[]>(initialLogs);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setLogs(JSON.parse(saved));
    } catch {
      /* fallback: seed */
    }
  }, []);

  const persist = (next: WorkoutLog[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setLogs(next);
  };

  const logWorkout = (session: string, durationSeconds: number) => {
    // Evita di registrare più volte lo stesso allenamento nello stesso giorno
    const today = todayISO();
    const alreadyToday = logs.find(
      (l) => l.date === today && l.session === session
    );
    if (alreadyToday) return;

    const newLog: WorkoutLog = {
      id: Date.now(),
      date: today,
      session,
      durationSeconds,
    };
    persist([...logs, newLog]);
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

    // Streak: giorni consecutivi con allenamento
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

    // Ultima sessione (ordinata per data)
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    const last = sorted.length > 0 ? sorted[sorted.length - 1] : null;

    return { thisMonthCount, streak, last };
  }, [logs]);

  return (
    <WorkoutContext.Provider value={{ logs, logWorkout, stats }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error("useWorkout deve essere usato dentro <WorkoutProvider>");
  return ctx;
}
