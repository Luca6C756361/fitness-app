"use client";

import { useCallback, useMemo } from "react";
import { useWorkoutSession } from "./WorkoutSessionContext";
import { usePlan } from "./PlanContext";
import { buildPerformanceIndex, suggestProgression, type ProgressionSuggestion } from "./progressionStats";

/**
 * Espone il motore di sovraccarico progressivo alla UI.
 * Derivazione pura: nessuno useState/useEffect/fetch qui dentro. L'indice
 * si costruisce UNA sola volta per cambio di `logs` (useMemo): suggestFor
 * è O(1) per ogni esercizio, sicuro da chiamare dentro un .map().
 */
export function useProgression() {
  const { logs, loading } = useWorkoutSession();
  const { getExerciseDef } = usePlan();

  const index = useMemo(() => buildPerformanceIndex(logs), [logs]);

  const suggestFor = useCallback(
    (exerciseId: string, targetSets: number, targetReps: number): ProgressionSuggestion => {
      // Storico non ancora caricato: la UI non deve gestire undefined, quindi
      // torniamo comunque un oggetto valido con kind "none".
      if (loading) {
        return {
          exerciseId,
          kind: "none",
          delta: 0,
          reason: "Caricamento storico…",
          confidence: "bassa",
          last: null,
          sessionsAnalyzed: 0,
        };
      }
      // Default prudente: incremento 2.5 kg se l'esercizio non è (più) nel database.
      const equipment = getExerciseDef(exerciseId)?.equipment ?? "macchina";
      return suggestProgression(index.get(exerciseId), {
        exerciseId,
        equipment,
        targetSets,
        targetReps,
      });
    },
    [index, getExerciseDef, loading]
  );

  return { suggestFor, loading, hasHistory: index.size > 0 };
}
