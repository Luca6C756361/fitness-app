"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Dumbbell, TrendingUp, TrendingDown } from "lucide-react";
import { useWorkoutSession } from "../../today/_lib/WorkoutSessionContext";
import {
  logsInPeriod,
  periodDays,
  totalVolume,
  volumeByMuscle,
  type VolumePeriod,
} from "../../today/_lib/volumeStats";

const periodLabels: Record<VolumePeriod, string> = {
  week: "7 giorni",
  month: "30 giorni",
};

const muscleColors: Record<string, string> = {
  petto: "#3F9B95",
  schiena: "#2F7A75",
  spalle: "#E8B04B",
  bicipiti: "#C98A3C",
  tricipiti: "#D9A05B",
  quadricipiti: "#5B8C5A",
  femorali: "#7BA97A",
  glutei: "#A3C4A2",
  polpacci: "#B5A26A",
  core: "#8C7B9E",
  cardio: "#C97B7B",
  altro: "#BAB0AC",
};

export default function VolumeChart() {
  const { logs } = useWorkoutSession();
  const [period, setPeriod] = useState<VolumePeriod>("week");
  const days = periodDays[period];

  const { data, total, delta } = useMemo(() => {
    const current = logsInPeriod(logs, days);
    const previous = logsInPeriod(logs, days, 1);
    const tot = totalVolume(current);
    const prev = totalVolume(previous);
    return {
      data: volumeByMuscle(current),
      total: Math.round(tot),
      delta: prev > 0 ? Math.round(((tot - prev) / prev) * 100) : null,
    };
  }, [logs, days]);

  const chartHeight = Math.max(160, data.length * 38);

  return (
    <section className="rounded-2xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] p-6 shadow-[var(--kh-card-shadow)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-[var(--kh-primary)]" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--kh-ink-muted)]">
            Volume per gruppo muscolare
          </h2>
        </div>

        <div className="flex gap-1 rounded-full bg-[var(--kh-surface-2)] p-1">
          {(["week", "month"] as VolumePeriod[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide transition ${
                period === p
                  ? "bg-[var(--kh-surface-1)] text-[var(--kh-ink)] shadow-sm"
                  : "text-[var(--kh-ink-subtle)] hover:text-[var(--kh-ink)]"
              }`}
            >
              {p === "week" ? "Sett." : "Mese"}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 flex items-center gap-2 text-sm font-medium text-[var(--kh-ink-muted)]">
        <span>
          Totale ultimi {periodLabels[period]}:{" "}
          <span className="font-mono font-bold text-[var(--kh-ink)] tabular-nums">
            {total.toLocaleString("it-IT")} kg
          </span>
        </span>
        {delta !== null && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
              delta >= 0
                ? "bg-[var(--kh-primary)]/15 text-[var(--kh-primary)]"
                : "bg-amber-500/15 text-amber-600"
            }`}
          >
            {delta >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {delta > 0 ? "+" : ""}
            {delta}%
          </span>
        )}
      </p>

      {data.length === 0 ? (
        <div className="rounded-xl bg-[var(--kh-surface-2)] p-6 text-center">
          <p className="text-sm font-medium text-[var(--kh-ink-muted)]">
            Nessun carico registrato negli ultimi {periodLabels[period]}.
          </p>
          <p className="mt-1 text-xs text-[var(--kh-ink-subtle)]">
            Completa un allenamento per vedere qui il volume.
          </p>
        </div>
      ) : (
        <div style={{ height: chartHeight }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "var(--kh-ink-subtle)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={92}
                tick={{ fontSize: 11, fill: "var(--kh-ink-subtle)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "var(--kh-surface-2)" }}
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid var(--kh-hairline)",
                  backgroundColor: "var(--kh-surface-1)",
                  color: "var(--kh-ink)",
                  fontSize: "0.8rem",
                }}
                formatter={(v) => [
                  `${Number(v).toLocaleString("it-IT")} kg`,
                  "Volume",
                ]}
              />
              <Bar dataKey="kg" radius={[0, 8, 8, 0]} barSize={20}>
                {data.map((d) => (
                  <Cell
                    key={d.muscle}
                    fill={muscleColors[d.muscle] ?? muscleColors.altro}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}