"use client";

import { useAchievements } from "../../../today/_lib/useAchievements";
import AchievementBadge from "./AchievementBadge";
import type { AchievementCategory, AchievementStatus } from "../../../today/_lib/achievements";

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  forza: "Forza",
  costanza: "Costanza",
  volume: "Volume",
  nutrizione: "Nutrizione",
  traguardi: "Traguardi",
};

/** Raggruppa preservando l'ordine di prima apparizione (quello di ACHIEVEMENTS). */
function groupByCategory(
  list: AchievementStatus[]
): { category: AchievementCategory; items: AchievementStatus[] }[] {
  const order: AchievementCategory[] = [];
  const map = new Map<AchievementCategory, AchievementStatus[]>();

  for (const item of list) {
    const cat = item.def.category;
    const arr = map.get(cat);
    if (arr) {
      arr.push(item);
    } else {
      map.set(cat, [item]);
      order.push(cat);
    }
  }

  return order.map((category) => ({ category, items: map.get(category)! }));
}

export default function AchievementGrid() {
  const { list, unlockedCount, total } = useAchievements();
  const groups = groupByCategory(list);
  const overallProgress = total > 0 ? unlockedCount / total : 0;

  return (
    <div className="space-y-6">
      {/* Riepilogo */}
      <div className="rounded-2xl border border-emerald-900/5 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-sm font-bold text-emerald-950">
            {unlockedCount} di {total} sbloccati
          </p>
          <p className="text-xs font-medium tabular-nums text-emerald-800/50">
            {Math.round(overallProgress * 100)}%
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-emerald-900/5">
          <div
            className="h-full rounded-full bg-teal-500 transition-all duration-500"
            style={{ width: `${overallProgress * 100}%` }}
          />
        </div>
      </div>

      {/* Griglia per categoria */}
      {groups.map(({ category, items }) => {
        // sort stabile: sbloccati prima, senza mutare `list`/`items`
        const sorted = [...items].sort(
          (a, b) => Number(b.unlocked) - Number(a.unlocked)
        );
        return (
          <section key={category}>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-800/70">
              {CATEGORY_LABELS[category]}
            </h2>
            <div role="list" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {sorted.map((status) => (
                <AchievementBadge key={status.def.id} status={status} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
