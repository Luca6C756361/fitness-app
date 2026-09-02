import { setMaxWeight, setE1RM } from "./prStats";
import { setVolume } from "./volumeStats";
import type { CompletedSet, DetailedWorkoutLog, Equipment } from "./types";

/*
 * progressionStats: motore di sovraccarico progressivo.
 * File puro (nessun import React/Next/Supabase), stesso stile di prStats.ts
 * e volumeStats.ts: riusa setMaxWeight/setE1RM/setVolume, non li duplica.
 */

export const MAX_SESSIONS_ANALYZED = 4; // ultime N prestazioni dell'esercizio
export const MAX_HISTORY_DAYS = 120; // oltre questa età il dato è considerato stale
export const STALL_SESSIONS = 3; // sessioni consecutive senza progresso = stallo
export const REP_RANGE_TOP = 2; // reps target + 2 = tetto prima di alzare il carico
export const DELOAD_FACTOR = 0.9; // -10% in caso di stallo

/** Incremento minimo realistico in palestra, per attrezzo (kg). */
export const WEIGHT_STEP: Record<Equipment, number> = {
  bilanciere: 2.5, // coppia di dischi da 1.25
  manubri: 2, // salto tipico della rastrelliera
  macchina: 2.5,
  cavi: 2.5,
  kettlebell: 4, // taglie discrete: 16 → 20 → 24
  "corpo-libero": 0, // 0 = progressione SOLO a ripetizioni
  elastici: 0,
};

export interface ExercisePerformance {
  date: string; // ISO YYYY-MM-DD, dal log
  sets: number; // numero di set eseguiti quel giorno
  workWeight: number; // carico di lavoro del giorno (vedi workWeightOf)
  topWeight: number; // max(setMaxWeight) del giorno
  minReps: number; // reps del set peggiore (il collo di bottiglia)
  totalVolume: number; // somma di setVolume sui set del giorno
  e1rm: number; // max(setE1RM) del giorno
}

export type SuggestionKind = "weight" | "reps" | "hold" | "deload" | "none";

export interface ProgressionSuggestion {
  exerciseId: string;
  kind: SuggestionKind;
  /** Carico consigliato per il prossimo allenamento (kg). undefined se kind è "reps"/"none". */
  nextWeight?: number;
  /** Ripetizioni consigliate. undefined se il suggerimento non tocca le reps. */
  nextReps?: number;
  /** Delta rispetto all'ultima prestazione, per la label ("+2.5", "+1"). */
  delta: number;
  /** Frase pronta per la UI, in italiano, max ~90 caratteri. */
  reason: string;
  confidence: "alta" | "media" | "bassa";
  /** Ultima prestazione usata per il calcolo (null se assente). */
  last: ExercisePerformance | null;
  sessionsAnalyzed: number;
}

/** Data ISO di `days` giorni prima di `from` (locale, no UTC shift). */
function isoOffset(from: Date, days: number): string {
  const d = new Date(from);
  d.setDate(d.getDate() - days);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * "Carico di lavoro" = il peso su cui l'utente ha davvero lavorato, robusto
 * ai set di riscaldamento e ai piramidali: la MODA dei setMaxWeight > 0
 * (a parità di frequenza vince il peso più alto). NON la media: un set di
 * riscaldamento a 20 kg dopo tre set a 60 kg falserebbe tutto.
 */
export function workWeightOf(sets: CompletedSet[]): number {
  const weights = sets.map(setMaxWeight).filter((w) => w > 0);
  if (weights.length === 0) return 0;

  const freq = new Map<number, number>();
  for (const w of weights) freq.set(w, (freq.get(w) ?? 0) + 1);

  let best = 0;
  let bestCount = 0;
  for (const [w, count] of freq) {
    if (count > bestCount || (count === bestCount && w > best)) {
      best = w;
      bestCount = count;
    }
  }
  return best;
}

function toPerformance(date: string, sets: CompletedSet[]): ExercisePerformance {
  return {
    date,
    sets: sets.length,
    workWeight: workWeightOf(sets),
    topWeight: Math.max(0, ...sets.map(setMaxWeight)),
    minReps: Math.min(...sets.map((s) => s.reps)),
    totalVolume: sets.reduce((sum, s) => sum + setVolume(s), 0),
    e1rm: Math.max(0, ...sets.map(setE1RM)),
  };
}

/**
 * Costruisce l'indice esercizio → ultime prestazioni, in un solo passaggio
 * su logs → exercises → sets. `today` è parametrizzabile per i test
 * deterministici: non chiamare mai `new Date()` dentro il loop.
 */
export function buildPerformanceIndex(
  logs: DetailedWorkoutLog[],
  today: Date = new Date()
): Map<string, ExercisePerformance[]> {
  const cutoff = isoOffset(today, MAX_HISTORY_DAYS);

  // Passaggio unico: accumula i set per (exerciseId, date).
  const bucketsByExercise = new Map<string, Map<string, CompletedSet[]>>();

  for (const log of logs) {
    if (log.date < cutoff) continue;
    for (const ex of log.exercises) {
      if (ex.sets.length === 0) continue;
      let byDate = bucketsByExercise.get(ex.exerciseId);
      if (!byDate) {
        byDate = new Map<string, CompletedSet[]>();
        bucketsByExercise.set(ex.exerciseId, byDate);
      }
      const bucket = byDate.get(log.date);
      if (bucket) bucket.push(...ex.sets);
      else byDate.set(log.date, [...ex.sets]);
    }
  }

  // Finalizzazione: un ExercisePerformance per (exerciseId, date), più
  // recente in testa, troncato a MAX_SESSIONS_ANALYZED.
  const index = new Map<string, ExercisePerformance[]>();
  for (const [exerciseId, byDate] of bucketsByExercise) {
    const performances = [...byDate.entries()]
      .map(([date, sets]) => toPerformance(date, sets))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
      .slice(0, MAX_SESSIONS_ANALYZED);
    index.set(exerciseId, performances);
  }

  return index;
}

/** Arrotonda al multiplo di step più vicino, minimo `step` (mai 0 o negativo), 1 decimale max. */
export function roundToStep(value: number, step: number): number {
  if (step === 0) return Math.round(value * 10) / 10;
  const rounded = Math.round(value / step) * step;
  const clamped = Math.max(rounded, step);
  return Math.round(clamped * 10) / 10;
}

/** Tolleranza per considerare due carichi "uguali" (arrotondamenti float). */
const WEIGHT_EPS = 0.01;

export function suggestProgression(
  history: ExercisePerformance[] | undefined,
  opts: { exerciseId: string; equipment: Equipment; targetSets: number; targetReps: number }
): ProgressionSuggestion {
  const { exerciseId, equipment, targetSets, targetReps } = opts;
  const step = WEIGHT_STEP[equipment];

  // a) Nessuno storico.
  if (!history || history.length === 0) {
    return {
      exerciseId,
      kind: "none",
      delta: 0,
      reason: "Nessuno storico: completa un allenamento per ricevere un suggerimento.",
      confidence: "bassa",
      last: null,
      sessionsAnalyzed: 0,
    };
  }

  const last = history[0];
  const confidence: ProgressionSuggestion["confidence"] =
    history.length >= 3 ? "alta" : history.length === 2 ? "media" : "bassa";
  const sessionsAnalyzed = history.length;

  // b) Esercizio senza carico (corpo libero/elastici, o ultima volta a peso 0).
  if (step === 0 || last.workWeight === 0) {
    if (last.minReps >= targetReps) {
      return {
        exerciseId,
        kind: "reps",
        nextReps: targetReps + 1,
        delta: 1,
        reason: `Ultima volta ${last.sets}×${last.minReps} completate: prova ${targetReps + 1} ripetizioni.`,
        confidence,
        last,
        sessionsAnalyzed,
      };
    }
    return {
      exerciseId,
      kind: "hold",
      nextReps: targetReps,
      delta: 0,
      reason: "Consolida: chiudi tutti i set al target prima di aumentare.",
      confidence,
      last,
      sessionsAnalyzed,
    };
  }

  // c) Stallo: ultime STALL_SESSIONS prestazioni allo stesso workWeight e
  // minReps non crescente nel tempo (nessun progresso recente).
  if (history.length >= STALL_SESSIONS) {
    const recent = history.slice(0, STALL_SESSIONS); // più recente in testa
    const sameWeight = recent.every(
      (p) => Math.abs(p.workWeight - last.workWeight) <= WEIGHT_EPS
    );
    let nonIncreasingOverTime = true;
    for (let i = 0; i < recent.length - 1; i++) {
      // recent[i] è più recente di recent[i + 1]: se ha PIÙ reps, c'è stato
      // un progresso di recente → non è uno stallo.
      if (recent[i].minReps > recent[i + 1].minReps) {
        nonIncreasingOverTime = false;
        break;
      }
    }
    if (sameWeight && nonIncreasingOverTime) {
      const nextWeight = roundToStep(last.workWeight * DELOAD_FACTOR, step);
      return {
        exerciseId,
        kind: "deload",
        nextWeight,
        delta: nextWeight - last.workWeight,
        reason: `Fermo a ${last.workWeight} kg da ${STALL_SESSIONS} sessioni: scarica a ${nextWeight} kg e risali.`,
        confidence: "alta",
        last,
        sessionsAnalyzed,
      };
    }
  }

  // d) Progressione di carico: set target raggiunti e reps ben oltre il target.
  if (last.sets >= targetSets && last.minReps >= targetReps + REP_RANGE_TOP) {
    const nextWeight = last.workWeight + step;
    return {
      exerciseId,
      kind: "weight",
      nextWeight,
      nextReps: targetReps,
      delta: step,
      reason: `${last.sets}×${last.minReps} a ${last.workWeight} kg: sali a ${nextWeight} kg tornando a ${targetReps} reps.`,
      confidence,
      last,
      sessionsAnalyzed,
    };
  }

  // e) Progressione di ripetizioni: set target raggiunti, reps al target.
  if (last.sets >= targetSets && last.minReps >= targetReps) {
    return {
      exerciseId,
      kind: "reps",
      nextReps: last.minReps + 1,
      nextWeight: last.workWeight,
      delta: 1,
      reason: `Tutti i set chiusi a ${last.workWeight} kg: aggiungi 1 ripetizione (${last.minReps + 1}).`,
      confidence,
      last,
      sessionsAnalyzed,
    };
  }

  // f) Obiettivo non ancora chiuso: consolida.
  return {
    exerciseId,
    kind: "hold",
    nextWeight: last.workWeight,
    nextReps: targetReps,
    delta: 0,
    reason: `Ripeti ${targetSets}×${targetReps} a ${last.workWeight} kg: obiettivo non ancora chiuso.`,
    confidence,
    last,
    sessionsAnalyzed,
  };
}

/**
 * Helper di comodo per UN singolo esercizio: costruisce l'indice e applica
 * suggestProgression. Per una LISTA di esercizi (es. l'editor scheda) NON
 * chiamare questa funzione in loop: costruire l'indice con
 * buildPerformanceIndex UNA sola volta e poi chiamare suggestProgression
 * per ciascun esercizio, altrimenti si riscorrono i log n volte.
 */
export function suggestFromLogs(
  logs: DetailedWorkoutLog[],
  opts: { exerciseId: string; equipment: Equipment; targetSets: number; targetReps: number }
): ProgressionSuggestion {
  const index = buildPerformanceIndex(logs);
  return suggestProgression(index.get(opts.exerciseId), opts);
}
