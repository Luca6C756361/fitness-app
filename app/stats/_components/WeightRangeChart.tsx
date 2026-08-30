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
    <section className="rounded-2xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] p-6 shadow-[var(--kh-card-shadow)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-[var(--kh-primary)]" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--kh-ink-muted)]">
            Storico peso
          </h2>
        </div>

        <div className="flex gap-1 rounded-full bg-[var(--kh-surface-2)] p-1">
          {(["3m", "6m", "12m"] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide transition ${
                range === r
                  ? "bg-[var(--kh-surface-1)] text-[var(--kh-ink)] shadow-sm"
                  : "text-[var(--kh-ink-subtle)] hover:text-[var(--kh-ink)]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-[var(--kh-ink-subtle)]">
            Nessun dato in questo range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--kh-primary)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--kh-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--kh-hairline)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--kh-ink-subtle)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[minY, maxY]}
                tick={{ fontSize: 11, fill: "var(--kh-ink-subtle)" }}
                axisLine={false}
                tickLine={false}
                unit=" kg"
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid var(--kh-hairline)",
                  backgroundColor: "var(--kh-surface-1)",
                  color: "var(--kh-ink)",
                  fontSize: "0.8rem",
                }}
                formatter={(v) => [`${Number(v)} kg`, "Peso"]}
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
                stroke="var(--kh-primary)"
                strokeWidth={2.5}
                fill="url(#weightGrad)"
                dot={{ r: 4, fill: "var(--kh-primary)" }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}