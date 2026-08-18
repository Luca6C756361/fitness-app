import { setVolume } from "./volumeStats";
import type { CompletedSet, DetailedWorkoutLog } from "./types";

export type PRType = "weight" | "volume" | "e1rm";

export const prTypeLabels: Record<PRType, string> = {
  weight: "Peso max",
  volume: "Volume set",
  e1rm: "1RM stimato",
};

export interface ExerciseRecord {
  exerciseId: string;
  name: string;
  /** Peso massimo mai sollevato su una singola ripetizione (kg). */
  maxWeight: number;
  /** Volume massimo di un singolo set (kg). */
  bestSetVolume: number;
  /** 1RM stimato migliore (kg). */
  e1rm: number;
  /** Data dell'ultimo miglioramento. */
  date: string;
}

export interface PRHit {
  exerciseId: string;
  name: string;
  types: PRType[];
  maxWeight: number;
  volume: number;
  e1rm: number;
  previous: Pick<ExerciseRecord, "maxWeight" | "bestSetVolume" | "e1rm"> | null;
}

/** Tolleranza per evitare falsi PR da arrotondamenti float. */
const EPS = 0.01;

export function setMaxWeight(set: CompletedSet): number {
  const valid = set.weights.filter((w) => w > 0);
  return valid.length > 0 ? Math.max(...valid) : 0;
}

/**
 * 1RM stimato del set (Epley: w × (1 + reps/30)).
 * Generalizzato ai set piramidali: prende il massimo su tutte le
 * sotto-serie "i ripetizioni al peso i-esimo più alto".
 */
export function setE1RM(set: CompletedSet): number {
  const sorted = set.weights.filter((w) => w > 0).sort((a, b) => b - a);
  let best = 0;
  sorted.forEach((w, i) => {
    best = Math.max(best, w * (1 + (i + 1) / 30));
  });
  return Math.round(best * 10) / 10;
}

function applySet(rec: ExerciseRecord, set: CompletedSet, date: string): void {
  const w = setMaxWeight(set);
  const v = setVolume(set);
  const e = setE1RM(set);
  let improved = false;
  if (w > rec.maxWeight + EPS) { rec.maxWeight = w; improved = true; }
  if (v > rec.bestSetVolume + EPS) { rec.bestSetVolume = v; improved = true; }
  if (e > rec.e1rm + EPS) { rec.e1rm = e; improved = true; }
  if (improved && date > rec.date) rec.date = date;
}

/**
 * Record storico di un esercizio.
 * `extraSets` = set già registrati nella sessione in corso (non ancora nei log).
 */
export function recordForExercise(
  logs: DetailedWorkoutLog[],
  exerciseId: string,
  extraSets: CompletedSet[] = [],
  name = ""
): ExerciseRecord | null {
  const rec: ExerciseRecord = {
    exerciseId,
    name,
    maxWeight: 0,
    bestSetVolume: 0,
    e1rm: 0,
    date: "",
  };
  let found = false;

  for (const log of logs) {
    for (const ex of log.exercises) {
      if (ex.exerciseId !== exerciseId) continue;
      found = true;
      if (!rec.name) rec.name = ex.name;
      for (const set of ex.sets) applySet(rec, set, log.date);
    }
  }

  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  for (const set of extraSets) {
    found = true;
    applySet(rec, set, todayIso);
  }

  return found ? rec : null;
}

/** Tutti i record, ordinati per 1RM stimato decrescente. */
export function buildAllRecords(logs: DetailedWorkoutLog[]): ExerciseRecord[] {
  const map = new Map<string, ExerciseRecord>();

  for (const log of logs) {
    for (const ex of log.exercises) {
      let rec = map.get(ex.exerciseId);
      if (!rec) {
        rec = {
          exerciseId: ex.exerciseId,
          name: ex.name,
          maxWeight: 0,
          bestSetVolume: 0,
          e1rm: 0,
          date: log.date,
        };
        map.set(ex.exerciseId, rec);
      }
      rec.name = ex.name; // il nome più recente vince
      for (const set of ex.sets) applySet(rec, set, log.date);
    }
  }

  return [...map.values()]
    .filter((r) => r.e1rm > 0)
    .sort((a, b) => b.e1rm - a.e1rm);
}

/**
 * Confronta un set appena completato con il record precedente.
 * Ritorna null se non c'è storico (primo set assoluto → nessuna notifica,
 * per evitare rumore) o se nessuna soglia è stata superata.
 */
export function detectPR(
  base: ExerciseRecord | null,
  exerciseId: string,
  name: string,
  set: CompletedSet
): PRHit | null {
  if (!base) return null;

  const maxWeight = setMaxWeight(set);
  const volume = setVolume(set);
  const e1rm = setE1RM(set);
  if (maxWeight <= 0) return null; // set a corpo libero: niente PR di carico

  const types: PRType[] = [];
  if (maxWeight > base.maxWeight + EPS) types.push("weight");
  if (volume > base.bestSetVolume + EPS) types.push("volume");
  if (e1rm > base.e1rm + EPS) types.push("e1rm");
  if (types.length === 0) return null;

  return {
    exerciseId,
    name,
    types,
    maxWeight,
    volume: Math.round(volume),
    e1rm,
    previous: {
      maxWeight: base.maxWeight,
      bestSetVolume: base.bestSetVolume,
      e1rm: base.e1rm,
    },
  };
}