"use client";

import { useMemo } from "react";
import { useWorkoutSession } from "./WorkoutSessionContext";
import { useDiary } from "./DiaryContext";
import { useUser } from "./UserContext";
import { evaluateAchievements, type AchievementStatus } from "./achievements";

/**
 * Espone gli achievement alla UI. Derivazione pura: nessuno useState,
 * nessun useEffect, nessuna fetch. evaluateAchievements gira UNA sola
 * volta per cambio di deps (niente dati nuovi: tutto è già in RAM nei
 * context esistenti).
 */
export function useAchievements(): {
  list: AchievementStatus[];
  unlockedCount: number;
  total: number;
} {
  const { logs, records, stats } = useWorkoutSession();
  const { dailyKcalHistory } = useDiary();
  const { goals } = useUser();

  return useMemo(() => {
    const list = evaluateAchievements({
      logs,
      records,
      streak: stats.streak,
      dailyKcal: dailyKcalHistory,
      kcalTarget: goals.kcalTarget,
    });
    return {
      list,
      unlockedCount: list.filter((a) => a.unlocked).length,
      total: list.length,
    };
  }, [logs, records, stats.streak, dailyKcalHistory, goals.kcalTarget]);
}
