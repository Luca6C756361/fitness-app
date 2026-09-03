import { exerciseDatabase, muscleGroupLabels } from "./exerciseData";
import type { CompletedSet, DetailedWorkoutLog, MuscleGroup } from "./types";

/**
 * Recupero muscolare stile Fitbod: per ciascun gruppo muscolare, quanto è
 * "fresco" rispetto ai set svolti negli ultimi RECOVERY_WINDOW_DAYS giorni.
 * Stesso pattern di volumeStats.ts (funzioni pure, isoDaysAgo locale, mappa
 * exerciseId → muscoli costruita una volta da exerciseDatabase) per restare
 * coerente col resto di app/today/_lib.
 */

/** Finestra di recupero: un set di oggi pesa 100%, uno di 3 giorni fa 25%; oltre, 0%. */
export const RECOVERY_WINDOW_DAYS = 4;

/** "cardio" non è un gruppo muscolare vero: escluso dal recupero (come da Fitbod). */
const TRACKED_MUSCLES: MuscleGroup[] = [
  "petto",
  "schiena",
  "spalle",
  "bicipiti",
  "tricipiti",
  "quadricipiti",
  "femorali",
  "glutei",
  "polpacci",
  "core",
];

export type RecoveryStatus = "ready" | "recovering" | "rest";

/** Colori di stato (spec): 90-100 verde, 60-89 giallo, 0-59 rosso. */
export const RECOVERY_COLORS: Record<RecoveryStatus, string> = {
  ready: "#22C55E",
  recovering: "#EAB308",
  rest: "#EF4444",
};

export const RECOVERY_STATUS_LABELS: Record<RecoveryStatus, string> = {
  ready: "Ready",
  recovering: "Recovering",
  rest: "Rest",
};

export interface MuscleRecovery {
  muscle: MuscleGroup;
  label: string;
  /** 0-100, arrotondata. */
  percent: number;
  status: RecoveryStatus;
  color: string;
}

interface ExerciseMuscles {
  primary: MuscleGroup;
  secondary: MuscleGroup[];
}

const musclesByExerciseId = new Map<string, ExerciseMuscles>(
  exerciseDatabase.map((e) => [
    e.id,
    { primary: e.primaryMuscle, secondary: e.secondaryMuscles },
  ])
);

/** Data ISO locale di N giorni fa (no UTC shift) — stessa impl. di volumeStats.ts. */
function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Giorni trascorsi tra due date ISO "YYYY-MM-DD" (locale, no ora). */
function daysBetween(fromISO: string, toISO: string): number {
  const [fy, fm, fd] = fromISO.split("-").map(Number);
  const [ty, tm, td] = toISO.split("-").map(Number);
  const from = Date.UTC(fy, fm - 1, fd);
  const to = Date.UTC(ty, tm - 1, td);
  return Math.round((to - from) / 86_400_000);
}

/** Numero di ripetizioni "piene" di un set = quante ripetizioni con peso > 0. Un set a corpo libero (weights tutti 0) conta comunque come 1. */
function setIntensity(set: CompletedSet): number {
  return set.weights.length > 0 ? 1 : 0;
}

function statusForPercent(percent: number): RecoveryStatus {
  if (percent >= 90) return "ready";
  if (percent >= 60) return "recovering";
  return "rest";
}

/**
 * Calcola il recupero (0-100%) di ogni gruppo muscolare a partire dai set
 * svolti negli ultimi RECOVERY_WINDOW_DAYS giorni (oggi incluso).
 *
 * Modello: ogni set aggiunge "fatica" al gruppo primario (peso pieno) e a
 * ogni gruppo secondario (peso dimezzato, come nei compound lift reali —
 * es. la panca piana affatica anche tricipiti/spalle). La fatica di un set
 * decade linearmente con l'età: un set di oggi pesa 100%, uno di
 * (RECOVERY_WINDOW_DAYS - 1) giorni fa pesa 25%, oltre la finestra 0%.
 * recovery% = 100 - fatica accumulata (clampata 0-100).
 *
 * @param logs Log completati (DetailedWorkoutLog[], da useWorkoutSession().logs).
 * @param referenceDateISO Data di riferimento per "oggi" (default: oggi reale).
 *   Parametro esposto per testabilità, mai passato dalla UI.
 */
export function calculateMuscleRecovery(
  logs: DetailedWorkoutLog[],
  referenceDateISO: string = isoDaysAgo(0)
): MuscleRecovery[] {
  const fatigue = new Map<MuscleGroup, number>();

  const FATIGUE_PRIMARY_PER_SET = 14;
  const FATIGUE_SECONDARY_PER_SET = 7;

  for (const log of logs) {
    const daysAgo = daysBetween(log.date, referenceDateISO);
    if (daysAgo < 0 || daysAgo >= RECOVERY_WINDOW_DAYS) continue; // fuori finestra (anche log futuri, difensivo)

    const decay = (RECOVERY_WINDOW_DAYS - daysAgo) / RECOVERY_WINDOW_DAYS;

    for (const ex of log.exercises) {
      const muscles = musclesByExerciseId.get(ex.exerciseId);
      if (!muscles) continue; // esercizio custom cancellato/non risolvibile: ignorato, mai un crash

      const sets = ex.sets.reduce((n, s) => n + setIntensity(s), 0);
      if (sets === 0) continue;

      const primaryAdd = FATIGUE_PRIMARY_PER_SET * sets * decay;
      fatigue.set(muscles.primary, (fatigue.get(muscles.primary) ?? 0) + primaryAdd);

      for (const sec of muscles.secondary) {
        const secAdd = FATIGUE_SECONDARY_PER_SET * sets * decay;
        fatigue.set(sec, (fatigue.get(sec) ?? 0) + secAdd);
      }
    }
  }

  return TRACKED_MUSCLES.map((muscle) => {
    const totalFatigue = Math.min(100, fatigue.get(muscle) ?? 0);
    const percent = Math.round(Math.max(0, 100 - totalFatigue));
    return {
      muscle,
      label: muscleGroupLabels[muscle] ?? muscle,
      percent,
      status: statusForPercent(percent),
      color: RECOVERY_COLORS[statusForPercent(percent)],
    };
  });
}

/** Raggruppamento per la lista compatta (UPPER BODY / LOWER BODY / CORE). */
export const RECOVERY_MACRO_GROUPS: { label: string; muscles: MuscleGroup[] }[] = [
  { label: "Upper Body", muscles: ["petto", "schiena", "spalle", "bicipiti", "tricipiti"] },
  { label: "Lower Body", muscles: ["quadricipiti", "femorali", "glutei", "polpacci"] },
  { label: "Core", muscles: ["core"] },
];

/** Conteggio per stato, per l'header ("5 recovering" ecc.). */
export function countByStatus(
  recovery: MuscleRecovery[]
): Record<RecoveryStatus, number> {
  const counts: Record<RecoveryStatus, number> = { ready: 0, recovering: 0, rest: 0 };
  for (const r of recovery) counts[r.status]++;
  return counts;
}
