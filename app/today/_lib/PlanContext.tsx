"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { defaultWeeklyPlan, exerciseDatabase } from "./exerciseData";
import type {
  WeeklyPlan,
  WorkoutSession,
  PlannedExercise,
  ExerciseDefinition,
} from "./types";

/**
 * PlanContext: gestisce la scheda settimanale dell'utente.
 *
 * Livelli di dati (dal più stabile al più temporaneo):
 * 1. plan.weekMap → assegnazione giorni → sessioni (persistente)
 * 2. weeklyOverrides → modifica per una settimana specifica
 * 3. todayOverride → sessione "composta al volo" solo per oggi
 *
 * Espone:
 * - plan: scheda base
 * - todaySession: sessione da fare oggi (rispetta override e composizione)
 * - overrideDay(date, sessionId): cambia sessione di un giorno per la settimana
 * - composeToday(exercises): crea una sessione ad hoc solo per oggi
 * - resetTodayOverride(): torna alla proposta della scheda
 * - CRUD sessioni + esercizi database
 */

interface PlanContextValue {
  plan: WeeklyPlan;
  todaySession: WorkoutSession | null;
  isTodayComposed: boolean; // true se oggi è una composizione al volo
  getSessionById: (id: string) => WorkoutSession | undefined;
  getExerciseDef: (id: string) => ExerciseDefinition | undefined;

  // Composizione e override
  composeToday: (exercises: PlannedExercise[], name?: string) => void;
  resetTodayOverride: () => void;
  overrideDay: (dayIndex: number, sessionId: string | null) => void;

  // Editor scheda (usato dalla Tappa 4)
  updateSession: (session: WorkoutSession) => void;
  createSession: (session: WorkoutSession) => void;
  deleteSession: (sessionId: string) => void;

  exercises: ExerciseDefinition[];
}

const PlanContext = createContext<PlanContextValue | null>(null);
const STORAGE_KEY = "fitness-app:plan";
const STORAGE_KEY_TODAY = "fitness-app:todayOverride";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function todayDayIndex(): number {
  return new Date().getDay(); // 0=domenica, 6=sabato
}

/** Sessione composta al volo (salvata per la data di oggi). */
interface TodayOverride {
  date: string; // ISO
  session: WorkoutSession;
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<WeeklyPlan>(defaultWeeklyPlan);
  const [todayOverride, setTodayOverride] = useState<TodayOverride | null>(null);

  // Carica plan e override da localStorage
  useEffect(() => {
    try {
      const savedPlan = localStorage.getItem(STORAGE_KEY);
      if (savedPlan) setPlan(JSON.parse(savedPlan));
    } catch {
      /* fallback */
    }
    try {
      const savedOverride = localStorage.getItem(STORAGE_KEY_TODAY);
      if (savedOverride) {
        const parsed: TodayOverride = JSON.parse(savedOverride);
        // Se l'override è di un altro giorno, lo scartiamo
        if (parsed.date === todayISO()) {
          setTodayOverride(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY_TODAY);
        }
      }
    } catch {
      /* ignora */
    }
  }, []);

  const persistPlan = (next: WeeklyPlan) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setPlan(next);
  };

  const persistTodayOverride = (next: TodayOverride | null) => {
    if (next) {
      localStorage.setItem(STORAGE_KEY_TODAY, JSON.stringify(next));
    } else {
      localStorage.removeItem(STORAGE_KEY_TODAY);
    }
    setTodayOverride(next);
  };

  const getSessionById = (id: string) =>
    plan.sessions.find((s) => s.id === id);

  const getExerciseDef = (id: string) =>
    exerciseDatabase.find((e) => e.id === id);

  // Sessione di oggi: prima override composto, poi scheda base
  const todaySession = useMemo<WorkoutSession | null>(() => {
    if (todayOverride) return todayOverride.session;
    const sessionId = plan.weekMap[todayDayIndex()];
    if (!sessionId) return null;
    return plan.sessions.find((s) => s.id === sessionId) ?? null;
  }, [plan, todayOverride]);

  const composeToday = (exercises: PlannedExercise[], name = "Sessione libera") => {
    const composed: WorkoutSession = {
      id: `composed-${Date.now()}`,
      name,
      focus: "Composta al volo",
      exercises,
      estimatedMinutes: exercises.reduce((sum, ex) => sum + ex.sets * 2, 5),
    };
    persistTodayOverride({ date: todayISO(), session: composed });
  };

  const resetTodayOverride = () => {
    persistTodayOverride(null);
  };

  const overrideDay = (dayIndex: number, sessionId: string | null) => {
    const nextMap = [...plan.weekMap];
    nextMap[dayIndex] = sessionId;
    persistPlan({ ...plan, weekMap: nextMap });
  };

  const updateSession = (session: WorkoutSession) => {
    persistPlan({
      ...plan,
      sessions: plan.sessions.map((s) => (s.id === session.id ? session : s)),
    });
  };

  const createSession = (session: WorkoutSession) => {
    persistPlan({ ...plan, sessions: [...plan.sessions, session] });
  };

  const deleteSession = (sessionId: string) => {
    persistPlan({
      ...plan,
      sessions: plan.sessions.filter((s) => s.id !== sessionId),
      // Rimuovi anche dalle assegnazioni settimanali
      weekMap: plan.weekMap.map((id) => (id === sessionId ? null : id)),
    });
  };

  return (
    <PlanContext.Provider
      value={{
        plan,
        todaySession,
        isTodayComposed: todayOverride !== null,
        getSessionById,
        getExerciseDef,
        composeToday,
        resetTodayOverride,
        overrideDay,
        updateSession,
        createSession,
        deleteSession,
        exercises: exerciseDatabase,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan deve essere usato dentro <PlanProvider>");
  return ctx;
}
