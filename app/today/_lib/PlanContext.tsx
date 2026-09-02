"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { supabase } from "../../_lib/supabase/client";   // <-- NUOVO
import { useAuth } from "../../_lib/AuthContext";        // <-- NUOVO
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
  loading: boolean;                                              // <-- NUOVO
  /** true SOLO se la colonna `plan` conteneva un oggetto valido (mai su fallback legacy). */
  hasPersistedPlan: boolean;                                     // <-- NUOVO
  todaySession: WorkoutSession | null;
  isTodayComposed: boolean;
  getSessionById: (id: string) => WorkoutSession | undefined;
  getExerciseDef: (id: string) => ExerciseDefinition | undefined;

  composeToday: (exercises: PlannedExercise[], name?: string) => void;
  resetTodayOverride: () => void;
  overrideDay: (dayIndex: number, sessionId: string | null) => Promise<void>;

  updateSession: (session: WorkoutSession) => Promise<void>;
  createSession: (session: WorkoutSession) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;

  exercises: ExerciseDefinition[];
}

const PlanContext = createContext<PlanContextValue | null>(null);
// const STORAGE_KEY = "fitness-app:plan";      ← CANCELLA
const STORAGE_KEY_TODAY = "fitness-app:todayOverride";   // resta

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
  const { user } = useAuth();
  const [plan, setPlan] = useState<WeeklyPlan>(defaultWeeklyPlan);
  const [todayOverride, setTodayOverride] = useState<TodayOverride | null>(null);
  const [dayIndex, setDayIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPersistedPlan, setHasPersistedPlan] = useState(false);

  // Il giorno corrente si calcola SOLO lato client: new Date() nel render
  // darebbe un indice diverso su server e browser → hydration mismatch.
  useEffect(() => {
    setDayIndex(todayDayIndex());
  }, []);

  // plan → DB
  useEffect(() => {
    if (!user) {
      setPlan(defaultWeeklyPlan);
      setHasPersistedPlan(false);
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();

      if (error) console.error("[plan]", error.message);
      // JSONB può essere null OPPURE {} (default colonna): valida la forma
      const raw = data?.plan as Partial<WeeklyPlan> | null;
      if (raw && Array.isArray(raw.sessions) && Array.isArray(raw.weekMap)) {
        setPlan(raw as WeeklyPlan);
        setHasPersistedPlan(true);
      } else {
        // Fallback legacy: NON è un piano "scelto e vuoto", va tenuto distinto
        // (decisione 4) perché l'empty state di /scheda non deve scattare qui.
        setPlan(defaultWeeklyPlan);
        setHasPersistedPlan(false);
      }
      setLoading(false);
    })();
  }, [user]);

  // todayOverride → localStorage (effimero, non sincronizzato tra dispositivi)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TODAY);
      if (!saved) return;
      const parsed: TodayOverride = JSON.parse(saved);
      if (parsed.date === todayISO()) setTodayOverride(parsed);
      else localStorage.removeItem(STORAGE_KEY_TODAY);
    } catch {
      /* ignora */
    }
  }, []);

  /** Scrive l'intero WeeklyPlan sul JSONB. Ottimistico con rollback. */
  const persistPlan = async (next: WeeklyPlan) => {
    if (!user) return;
    const previous = plan;
    setPlan(next);

    const { error } = await supabase
      .from("profiles")
      .update({ plan: next })
      .eq("id", user.id);

    if (error) {
      console.error("[plan]", error.message);
      setPlan(previous);
    }
  };

  const persistTodayOverride = (next: TodayOverride | null) => {
    if (next) localStorage.setItem(STORAGE_KEY_TODAY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY_TODAY);
    setTodayOverride(next);
  };

  const getSessionById = (id: string) => (plan.sessions ?? []).find((s) => s.id === id);
  const getExerciseDef = (id: string) => exerciseDatabase.find((e) => e.id === id);

  const todaySession = useMemo<WorkoutSession | null>(() => {
    if (todayOverride) return todayOverride.session;
    if (dayIndex === null) return null;          // primo render
    
    // PROTEZIONE AGGIUNTA QUI: usiamo ?. per evitare il crash se weekMap non esiste
        const sessionId = (plan.weekMap ?? [])[dayIndex];
    if (!sessionId) return null;
    
    // Stessa cosa qui: proteggiamo sessions
    return plan?.sessions?.find((s) => s.id === sessionId) ?? null;
  }, [plan, todayOverride, dayIndex]);

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

  const resetTodayOverride = () => persistTodayOverride(null);

  

  const updateSession = async (session: WorkoutSession) => {
    await persistPlan({
      ...plan,
      sessions: plan.sessions.map((s) => (s.id === session.id ? session : s)),
    });
  };

    const createSession = async (session: WorkoutSession) => {
    await persistPlan({
      ...plan,
      sessions: [...(plan.sessions ?? []), session],       // <-- MODIFICATA
      weekMap: plan.weekMap ?? defaultWeeklyPlan.weekMap,  // <-- NUOVA
    });
  };

  const deleteSession = async (sessionId: string) => {
    await persistPlan({
      ...plan,
      sessions: (plan.sessions ?? []).filter((s) => s.id !== sessionId),   // <-- MODIFICATA
      weekMap: (plan.weekMap ?? defaultWeeklyPlan.weekMap).map((id) =>
        id === sessionId ? null : id
      ),
    });
  };

  const overrideDay = async (dayIdx: number, sessionId: string | null) => {
    const nextMap = [...(plan.weekMap ?? defaultWeeklyPlan.weekMap)];   // <-- MODIFICATA
    nextMap[dayIdx] = sessionId;
    await persistPlan({ ...plan, weekMap: nextMap });
  };

  return (
    <PlanContext.Provider
      value={{
        plan,
        loading,
        hasPersistedPlan,
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
