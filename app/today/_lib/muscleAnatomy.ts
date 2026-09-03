/**
 * Tassonomia anatomica fine (MuscleAnatomyId) e relativi helper.
 * Nessun import React: modulo puro, riusabile sia da componenti client
 * (MuscleMapSvg, ExerciseDetailModal) sia da script di verifica.
 */
import type { ExerciseDefinition, MuscleAnatomyId, MuscleGroup, MuscleMap } from "./types";

/** Label leggibili, stesso pattern di muscleGroupLabels in exerciseData.ts. */
export const muscleAnatomyLabels: Record<MuscleAnatomyId, string> = {
  "pettorale-superiore": "Pettorale (fascio superiore)",
  "pettorale-medio": "Pettorale (fascio medio)",
  "pettorale-inferiore": "Pettorale (fascio inferiore)",

  "gran-dorsale": "Gran dorsale",
  "trapezio-medio": "Trapezio (fascio medio)",
  "trapezio-inferiore": "Trapezio (fascio inferiore)",
  romboidi: "Romboidi",
  lombari: "Lombari",

  "deltoide-anteriore": "Deltoide anteriore",
  "deltoide-laterale": "Deltoide laterale",
  "deltoide-posteriore": "Deltoide posteriore",

  "bicipite-brachiale": "Bicipite brachiale",
  brachiale: "Brachiale",
  avambraccio: "Avambraccio",

  "tricipite-capo-lungo": "Tricipite (capo lungo)",
  "tricipite-capo-laterale": "Tricipite (capo laterale)",
  "tricipite-capo-mediale": "Tricipite (capo mediale)",

  "quadricipite-retto-femorale": "Quadricipite (retto femorale)",
  "quadricipite-vasti": "Quadricipite (vasti)",

  "femorale-bicipite": "Bicipite femorale",
  "femorale-semitendinoso": "Semitendinoso",

  "gluteo-massimo": "Gluteo massimo",
  "gluteo-medio": "Gluteo medio",

  gastrocnemio: "Gastrocnemio",
  soleo: "Soleo",

  "retto-addominale": "Retto addominale",
  obliqui: "Obliqui",
  "core-profondo": "Core profondo (trasverso dell'addome)",
};

/**
 * Fallback: ogni MuscleGroup coarse mappa su 1-3 MuscleAnatomyId rappresentativi.
 * Usato quando un esercizio (specialmente custom) non ha muscleMap esplicito.
 *
 * "cardio" non ha un fascio muscolare specifico: mappa sui grandi motori
 * primari coinvolti nei gesti cardio più comuni (corsa, bici, salto), non è
 * un'approssimazione anatomica precisa ma garantisce comunque un'evidenziazione
 * minima invece di una mappa vuota.
 */
export const muscleGroupToAnatomyFallback: Record<MuscleGroup, MuscleAnatomyId[]> = {
  petto: ["pettorale-medio"],
  schiena: ["gran-dorsale", "trapezio-medio"],
  spalle: ["deltoide-laterale", "deltoide-anteriore"],
  bicipiti: ["bicipite-brachiale"],
  tricipiti: ["tricipite-capo-lungo"],
  quadricipiti: ["quadricipite-retto-femorale", "quadricipite-vasti"],
  femorali: ["femorale-bicipite"],
  glutei: ["gluteo-massimo"],
  polpacci: ["gastrocnemio"],
  core: ["retto-addominale"],
  cardio: ["quadricipite-retto-femorale", "gastrocnemio"],
};

/**
 * Risolve la mappa da evidenziare per un esercizio: usa muscleMap se presente,
 * altrimenti deriva dal fallback su primaryMuscle/secondaryMuscles.
 */
export function resolveMuscleMap(ex: ExerciseDefinition): MuscleMap {
  if (ex.muscleMap) return ex.muscleMap;
  return {
    primary: muscleGroupToAnatomyFallback[ex.primaryMuscle] ?? [],
    secondary: ex.secondaryMuscles.flatMap((m) => muscleGroupToAnatomyFallback[m] ?? []),
  };
}
