import { exerciseDatabase, muscleGroupLabels } from "./exerciseData";
import type { CompletedSet, DetailedWorkoutLog, MuscleGroup } from "./types";

/** Periodo di analisi per le statistiche di volume. */
export type VolumePeriod = "week" | "month";

export const periodDays: Record<VolumePeriod, number> = { week: 7, month: 30 };

const muscleByExerciseId = new Map<string, MuscleGroup>(
  exerciseDatabase.map((e) => [e.id, e.primaryMuscle])
);

/** Data ISO locale di N giorni fa (no UTC shift). */
function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Volume di un set = somma dei pesi di ogni ripetizione (kg). */
export function setVolume(set: CompletedSet): number {
  return set.weights.reduce((s, w) => s + (w || 0), 0);
}

/** Volume totale di una sessione completata (kg). */
export function logVolume(log: DetailedWorkoutLog): number {
  return log.exercises.reduce(
    (tot, ex) => tot + ex.sets.reduce((s, set) => s + setVolume(set), 0),
    0
  );
}

export function totalVolume(logs: DetailedWorkoutLog[]): number {
  return logs.reduce((s, l) => s + logVolume(l), 0);
}

/**
 * Filtra i log in una finestra temporale.
 * offset = 0 → periodo corrente, 1 → periodo precedente (per il confronto %).
 */
export function logsInPeriod(
  logs: DetailedWorkoutLog[],
  days: number,
  offset = 0
): DetailedWorkoutLog[] {
  const end = isoDaysAgo(offset * days);
  const start = isoDaysAgo(offset * days + days - 1);
  return logs.filter((l) => l.date >= start && l.date <= end);
}

export interface MuscleVolume {
  muscle: string;
  label: string;
  kg: number;
}

/** Volume aggregato per gruppo muscolare primario, ordinato desc. */
export function volumeByMuscle(logs: DetailedWorkoutLog[]): MuscleVolume[] {
  const acc = new Map<string, number>();

  for (const log of logs) {
    for (const ex of log.exercises) {
      const muscle = muscleByExerciseId.get(ex.exerciseId) ?? "altro";
      const kg = ex.sets.reduce((s, set) => s + setVolume(set), 0);
      if (kg > 0) acc.set(muscle, (acc.get(muscle) ?? 0) + kg);
    }
  }

  return [...acc.entries()]
    .map(([muscle, kg]) => ({
      muscle,
      label: muscleGroupLabels[muscle] ?? "Altro",
      kg: Math.round(kg),
    }))
    .sort((a, b) => b.kg - a.kg);
}