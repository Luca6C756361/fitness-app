/**
 * Motore degli achievement: catalogo statico + calcolo derivato.
 *
 * Nessun achievement è persistito: ogni badge è una funzione pura dei dati
 * già in RAM (log, record, streak, storico kcal). L'unica eccezione è il
 * flag "già celebrato", che vive in localStorage lato UI (fuori da questo
 * file). File puro: zero import di React, next/*, supabase, lucide-react.
 */

import { logVolume } from "./volumeStats";
import { setMaxWeight } from "./prStats";
import type { DetailedWorkoutLog } from "./types";
import type { ExerciseRecord } from "./prStats";

export type AchievementCategory =
  | "forza"
  | "costanza"
  | "volume"
  | "nutrizione"
  | "traguardi";

/** Chiave icona: la mappatura a lucide-react avviene NEL COMPONENTE, non qui. */
export type AchievementIcon =
  | "trophy"
  | "flame"
  | "dumbbell"
  | "medal"
  | "target"
  | "zap"
  | "apple"
  | "clock"
  | "compass";

export interface AchievementTotals {
  sessions: number; // numero di log
  totalVolume: number; // somma di logVolume su tutti i log
  distinctExercises: number; // exerciseId unici mai eseguiti
  longestSessionSec: number; // max durationSeconds
  bestSingleWeight: number; // max setMaxWeight su tutti i set
  firstDate: string | null; // ISO YYYY-MM-DD del log più vecchio
  lastDate: string | null; // ISO del più recente
  totalSets: number;
}

export interface AchievementInput {
  logs: DetailedWorkoutLog[];
  records: ExerciseRecord[];
  streak: number; // da stats.streak, NON ricalcolarlo
  dailyKcal: { date: string; kcal: number }[]; // da dailyKcalHistory (7 giorni)
  kcalTarget: number;
}

export interface AchievementDef {
  id: string;
  title: string; // max 24 caratteri, italiano
  description: string; // la condizione, max 70 caratteri
  category: AchievementCategory;
  icon: AchievementIcon;
  target: number; // valore da raggiungere
  unit: string; // "kg" | "giorni" | "sessioni" | "t" | "esercizi" | "min" | "record"
  /** O(1): legge SOLO da totals/input pre-aggregati. Mai un loop sui log qui dentro. */
  measure: (t: AchievementTotals, i: AchievementInput) => number;
}

export interface AchievementStatus {
  def: AchievementDef;
  value: number; // valore corrente (arrotondato per la UI)
  unlocked: boolean; // value grezzo >= target
  progress: number; // 0..1, clampato
}

/**
 * Un solo passaggio sui log: sessioni, volume, esercizi distinti, durata
 * max, peso singolo max, prime/ultime date, set totali. Ogni achievement
 * legge da qui in O(1), mai riscorrendo `logs`.
 */
export function buildAchievementTotals(
  logs: DetailedWorkoutLog[]
): AchievementTotals {
  if (logs.length === 0) {
    return {
      sessions: 0,
      totalVolume: 0,
      distinctExercises: 0,
      longestSessionSec: 0,
      bestSingleWeight: 0,
      firstDate: null,
      lastDate: null,
      totalSets: 0,
    };
  }

  const exerciseIds = new Set<string>();
  let totalVolume = 0;
  let longestSessionSec = 0;
  let bestSingleWeight = 0;
  let totalSets = 0;
  let firstDate = logs[0].date;
  let lastDate = logs[0].date;

  for (const log of logs) {
    if (log.date < firstDate) firstDate = log.date;
    if (log.date > lastDate) lastDate = log.date;
    if (log.durationSeconds > longestSessionSec) {
      longestSessionSec = log.durationSeconds;
    }
    totalVolume += logVolume(log);

    for (const ex of log.exercises) {
      exerciseIds.add(ex.exerciseId);
      for (const set of ex.sets) {
        totalSets += 1;
        const w = setMaxWeight(set);
        if (w > bestSingleWeight) bestSingleWeight = w;
      }
    }
  }

  return {
    sessions: logs.length,
    totalVolume,
    distinctExercises: exerciseIds.size,
    longestSessionSec,
    bestSingleWeight,
    firstDate,
    lastDate,
    totalSets,
  };
}

/** Peso massimo mai sollevato (0 se nessun record). */
function maxRecordWeight(records: ExerciseRecord[]): number {
  let max = 0;
  for (const r of records) {
    if (r.maxWeight > max) max = r.maxWeight;
  }
  return max;
}

/** Giorni con diario compilato (kcal > 0) nella finestra disponibile. */
function daysWithDiary(dailyKcal: { date: string; kcal: number }[]): number {
  return dailyKcal.filter((d) => d.kcal > 0).length;
}

/** Catalogo statico, ordinato per categoria. 12 achievement esatti. */
export const ACHIEVEMENTS: AchievementDef[] = [
  // --- forza ---
  {
    id: "club-60",
    title: "Club 60 kg",
    description: "Solleva almeno 60 kg in un singolo esercizio.",
    category: "forza",
    icon: "dumbbell",
    target: 60,
    unit: "kg",
    measure: (_t, i) => maxRecordWeight(i.records),
  },
  {
    id: "club-100",
    title: "Club 100 kg",
    description: "Solleva almeno 100 kg in un singolo esercizio.",
    category: "forza",
    icon: "dumbbell",
    target: 100,
    unit: "kg",
    measure: (_t, i) => maxRecordWeight(i.records),
  },
  {
    id: "club-140",
    title: "Club 140 kg",
    description: "Solleva almeno 140 kg in un singolo esercizio.",
    category: "forza",
    icon: "dumbbell",
    target: 140,
    unit: "kg",
    measure: (_t, i) => maxRecordWeight(i.records),
  },
  {
    id: "pr-hunter",
    title: "Cacciatore PR",
    description: "Conquista 10 record personali.",
    category: "forza",
    icon: "target",
    target: 10,
    unit: "record",
    measure: (_t, i) => i.records.length,
  },
  // --- costanza ---
  {
    id: "streak-3",
    title: "Streak 3",
    description: "Allenati 3 giorni di fila.",
    category: "costanza",
    icon: "flame",
    target: 3,
    unit: "giorni",
    measure: (_t, i) => i.streak,
  },
  {
    id: "streak-7",
    title: "Streak 7",
    description: "Allenati 7 giorni di fila.",
    category: "costanza",
    icon: "flame",
    target: 7,
    unit: "giorni",
    measure: (_t, i) => i.streak,
  },
  {
    id: "streak-30",
    title: "Streak 30",
    description: "Allenati 30 giorni di fila.",
    category: "costanza",
    icon: "flame",
    target: 30,
    unit: "giorni",
    measure: (_t, i) => i.streak,
  },
  // --- volume ---
  {
    id: "ton-10",
    title: "10 tonnellate",
    description: "Solleva un totale di 10 tonnellate.",
    category: "volume",
    icon: "zap",
    target: 10,
    unit: "t",
    measure: (t) => t.totalVolume / 1000,
  },
  {
    id: "ton-100",
    title: "100 tonnellate",
    description: "Solleva un totale di 100 tonnellate.",
    category: "volume",
    icon: "zap",
    target: 100,
    unit: "t",
    measure: (t) => t.totalVolume / 1000,
  },
  // --- nutrizione ---
  {
    id: "week-closed",
    title: "Prima settimana chiusa",
    description: "7 giorni consecutivi con il diario compilato.",
    category: "nutrizione",
    icon: "apple",
    target: 7,
    unit: "giorni",
    measure: (_t, i) => daysWithDiary(i.dailyKcal),
  },
  // --- traguardi ---
  {
    id: "first-blood",
    title: "Primo allenamento",
    description: "Completa il tuo primo allenamento.",
    category: "traguardi",
    icon: "trophy",
    target: 1,
    unit: "sessioni",
    measure: (t) => t.sessions,
  },
  {
    id: "centurion",
    title: "Centurione",
    description: "Completa 100 allenamenti.",
    category: "traguardi",
    icon: "medal",
    target: 100,
    unit: "sessioni",
    measure: (t) => t.sessions,
  },
];

/**
 * Valuta l'intero catalogo. `buildAchievementTotals` gira una sola volta;
 * ogni definizione legge poi da `totals`/`input` in O(1). L'ordine di
 * uscita è quello di ACHIEVEMENTS (stabile, la UI non riordina).
 *
 * unlocked/progress usano il valore grezzo del measure(), NON quello
 * arrotondato esposto in `value` — evita falsi sblocchi/blocchi
 * sull'arrotondamento (es. le tonnellate a 1 decimale).
 */
export function evaluateAchievements(
  input: AchievementInput
): AchievementStatus[] {
  const totals = buildAchievementTotals(input.logs);

  return ACHIEVEMENTS.map((def) => {
    const raw = def.measure(totals, input);
    const progress = Math.min(Math.max(raw / def.target, 0), 1);
    const value = def.unit === "t" ? Math.round(raw * 10) / 10 : Math.round(raw);

    return {
      def,
      value,
      unlocked: raw >= def.target,
      progress,
    };
  });
}

/** Solo gli id sbloccati, per il diff con localStorage lato UI. */
export function unlockedIds(list: AchievementStatus[]): string[] {
  return list.filter((s) => s.unlocked).map((s) => s.def.id);
}
