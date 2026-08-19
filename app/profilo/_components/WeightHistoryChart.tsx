"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { TrendingDown, Plus, Trash2 } from "lucide-react";
import { useWeight } from "../../today/_lib/WeightContext";
import { useUser } from "../../today/_lib/UserContext";
import { formatShortDate } from "../../today/_lib/utils";
import Modal from "../../today/_components/Modal";

/**
 * Grafico storico peso con lista misurazioni sotto.
 * Nuova misurazione tramite modale (data + peso).
 */
export default function WeightHistoryChart() {
  const { entries, addEntry, removeEntry } = useWeight();
  const { goals } = useUser();

  const [addOpen, setAddOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [weight, setWeight] = useState("");

  const chartData = entries.map((e) => ({
    ...e,
    label: formatShortDate(e.date),
  }));

  const weights = entries.map((e) => e.weight);
  const minY =
    weights.length > 0
      ? Math.floor(Math.min(...weights, goals.weightTarget) - 1)
      : 70;
  const maxY =
    weights.length > 0
      ? Math.ceil(Math.max(...weights, goals.weightTarget) + 1)
      : 80;

  const handleAdd = () => {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return;
    addEntry(date, w);
    setWeight("");
    setDate(new Date().toISOString().slice(0, 10));
    setAddOpen(false);
  };

  // Ordina misurazioni dalla più recente per la lista
  const sortedForList = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <section className="rounded-2xl border border-emerald-900/5 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-emerald-700" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-800/70">
              Storico peso
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Aggiungi
          </button>
        </div>

        {/* Grafico */}
        <div className="h-56 w-full">
          {entries.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-emerald-800/50">
              Nessuna misurazione ancora. Aggiungine una!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
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
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#065F46"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#065F46" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Lista misurazioni (max 5 più recenti) */}
        {sortedForList.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-emerald-800/60">
              Misurazioni recenti
            </p>
            <ul className="space-y-1.5">
              {sortedForList.slice(0, 5).map((e) => (
                <li
                  key={e.date}
                  className="flex items-center justify-between rounded-lg border border-emerald-900/10 bg-white px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-emerald-800/60 tabular-nums">
                      {formatShortDate(e.date)}
                    </span>
                    <span className="text-sm font-bold text-emerald-950 tabular-nums">
                      {e.weight.toFixed(1)} kg
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEntry(e.date)}
                    className="rounded-lg p-1.5 text-emerald-800/40 transition hover:bg-red-50 hover:text-red-600"
                    aria-label="Elimina misurazione"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Modale aggiungi */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Nuova misurazione">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-emerald-800/70">
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="w-full rounded-xl border border-emerald-900/10 bg-white px-4 py-2.5 text-sm text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-emerald-800/70">
              Peso (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="75.4"
              className="w-full rounded-xl border border-emerald-900/10 bg-white px-4 py-2.5 text-sm text-emerald-950 placeholder:text-emerald-800/30 outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <p className="mt-1 text-[10px] font-medium text-emerald-800/50">
              Se esiste già una misurazione per questa data, verrà aggiornata.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Salva misurazione
          </button>
        </div>
      </Modal>
    </>
  );
}
