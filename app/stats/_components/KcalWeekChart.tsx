"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { Flame } from "lucide-react";
import { useDiary } from "../../today/_lib/DiaryContext";
import { useUser } from "../../today/_lib/UserContext";
import { formatShortDate } from "../../today/_lib/utils";

/** Grafico barre kcal ultimi 7 giorni: dati reali dal diario. */
export default function KcalWeekChart() {
  const { dailyKcalHistory } = useDiary();
  const { goals } = useUser();

  const data = dailyKcalHistory.map((d) => ({
    ...d,
    label: formatShortDate(d.date),
  }));

  const daysWithData = data.filter((d) => d.kcal > 0);
  const avg =
    daysWithData.length > 0
      ? Math.round(daysWithData.reduce((s, d) => s + d.kcal, 0) / daysWithData.length)
      : 0;

  return (
    <section className="rounded-2xl border border-emerald-900/5 bg-white p-6 shadow-sm">
      <div className="mb-1 flex items-center gap-2">
        <Flame className="h-4 w-4 text-amber-600" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#111111]/70">
          Calorie ultimi 7 giorni
        </h2>
      </div>
      <p className="mb-4 text-sm font-medium text-[#111111]/60">
        Media (giorni con pasti registrati):{" "}
        <span className="font-bold text-[#111111] tabular-nums">{avg} kcal</span>{" "}
        · Target{" "}
        <span className="font-bold text-[#111111] tabular-nums">
          {goals.kcalTarget} kcal
        </span>
      </p>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid #E5E7EB",
                fontSize: "0.8rem",
              }}
              formatter={(v) => [`${Number(v)} kcal`, "Consumate"]}
            />
            <ReferenceLine
              y={goals.kcalTarget}
              stroke="#3F9B95"
              strokeDasharray="4 4"
            />
            <Bar dataKey="kcal" radius={[8, 8, 0, 0]}>
              {data.map((d) => (
                <Cell
                  key={d.date}
                  fill={
                    d.kcal === 0
                      ? "#EAE6DC"
                      : d.kcal >= goals.kcalTarget
                      ? "#3F9B95"
                      : "#E8B04B"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
