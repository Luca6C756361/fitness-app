"use client";

import { useState, useMemo } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { TrendingDown } from "lucide-react";
import { useWeight } from "../../today/_lib/WeightContext";
import { useUser } from "../../today/_lib/UserContext";
import { formatShortDate } from "../../today/_lib/utils";

type Range = "3m" | "6m" | "12m";

export default function WeightRangeChart() {
  const { entries } = useWeight();
  const { goals } = useUser();
  const [range, setRange] = useState<Range>("3m");

  const monthsBack = { "3m": 3, "6m": 6, "12m": 12 }[range];

  const data = useMemo(() => {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - monthsBack);
    return entries
      .filter((e) => new Date(e.date) >= cutoff)
      .map((e) => ({ ...e, label: formatShortDate(e.date) }));
  }, [entries, monthsBack]);

  const weights = data.map((d) => d.weight);
  const minY =
    weights.length > 0
      ? Math.floor(Math.min(...weights, goals.weightTarget) - 1)
      : 70;
  const maxY =
    weights.length > 0
      ? Math.ceil(Math.max(...weights, goals.weightTarget) + 1)
      : 80;

  return (
    <section className="rounded-2xl border border-emerald-900/5 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-emerald-700" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-800/70">
            Storico peso
          </h2>
        </div>

        <div className="flex gap-1 rounded-full bg-emerald-50 p-1">
          {(["3m", "6m", "12m"] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide transition ${
                range === r
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-emerald-800/50 hover:text-emerald-800"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-emerald-800/50">
            Nessun dato in questo range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#065F46" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#065F46" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[minY, maxY]}
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                unit=" kg"
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid #E5E7EB",
                  fontSize: "0.8rem",
                }}
                formatter={(v: number) => [`${v} kg`, "Peso"]}
              />
              <ReferenceLine
                y={goals.weightTarget}
                stroke="#3F9B95"
                strokeDasharray="4 4"
                label={{
                  value: `Target ${goals.weightTarget}kg`,
                  fontSize: 10,
                  fill: "#3F9B95",
                  position: "insideBottomRight",
                }}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#065F46"
                strokeWidth={2.5}
                fill="url(#weightGrad)"
                dot={{ r: 4, fill: "#065F46" }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
