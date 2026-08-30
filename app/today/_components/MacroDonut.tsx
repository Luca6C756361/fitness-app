"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useDiary } from "../_lib/DiaryContext";
import { useUser } from "../_lib/UserContext";

/**
 * MacroDonut: legge i totali dal DiaryContext (pasti reali di oggi).
 * kcal per macro: carbo × 4, prot × 4, grassi × 9.
 */
export default function MacroDonut() {
  const { todayTotals } = useDiary();
  const { goals } = useUser();

  const carbsKcal = todayTotals.carbs * 4;
  const proteinKcal = todayTotals.protein * 4;
  const fatKcal = todayTotals.fat * 9;

  const consumed = carbsKcal + proteinKcal + fatKcal;
  const remaining = Math.max(goals.kcalTarget - consumed, 0);

  const data = [
    { name: "Carbo", value: carbsKcal, color: "var(--kh-primary)" },
    { name: "Prot", value: proteinKcal, color: "var(--kh-secondary)" },
    { name: "Grassi", value: fatKcal, color: "#CCFF00" },
    { name: "Mancanti", value: remaining, color: "var(--kh-hairline)" },
  ];

  // Se non ha ancora mangiato niente, mostra tutto come "mancante"
  const isEmpty = consumed === 0;
  const displayData = isEmpty
    ? [{ name: "Vuoto", value: 1, color: "var(--kh-hairline)" }]
    : data;

  return (
    <div className="relative mx-auto h-56 w-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={displayData}
            dataKey="value"
            innerRadius="72%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            paddingAngle={isEmpty ? 0 : 2}
            stroke="none"
            cornerRadius={0}
          >
            {displayData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--kh-ink-subtle)]">
          Kcal mancanti
        </span>
        <span className="mt-1 font-mono text-3xl font-bold text-[var(--kh-ink)] tabular-nums">
          {Math.round(remaining)}
        </span>
        <span className="text-sm font-medium text-[var(--kh-ink-muted)] tabular-nums">
          / {goals.kcalTarget}
        </span>
      </div>
    </div>
  );
}