"use client";

import Link from "next/link";
import { Apple, Plus, ListChecks } from "lucide-react";
import MacroDonut from "./MacroDonut";
import { useDiary } from "../_lib/DiaryContext";
import { useUser } from "../_lib/UserContext";

/**
 * NutritionCard collegata al DiaryContext:
 * - i macro/kcal mostrati sono calcolati dai pasti reali del giorno
 * - i bottoni rimandano a /nutrition (dove si aggiungono/dettagliano i pasti)
 */
export default function NutritionCard() {
  const { todayTotals } = useDiary();
  const { goals } = useUser();

  // Barre progressive con colori coordinati al donut
  const macroRows = [
    {
      key: "carbs",
      label: "Carbo",
      current: Math.round(todayTotals.carbs),
      goal: goals.carbsTarget,
      color: "#E8B04B",
    },
    {
      key: "protein",
      label: "Prot",
      current: Math.round(todayTotals.protein),
      goal: goals.proteinTarget,
      color: "#3F9B95",
    },
    {
      key: "fat",
      label: "Grassi",
      current: Math.round(todayTotals.fat),
      goal: goals.fatTarget,
      color: "#C08497",
    },
  ];

  return (
    <section className="flex flex-col rounded-none bg-[#f5f5f5] p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#111111]">
          <Apple className="h-5 w-5" />
        </span>
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#707072]">
          Obiettivo calorico
        </h2>
      </div>

      <MacroDonut />

      {/* Barre di progresso macro */}
      <div className="mt-5 space-y-3">
        {macroRows.map((m) => {
          const pct = m.goal > 0 ? Math.min((m.current / m.goal) * 100, 100) : 0;
          return (
            <div key={m.key} className="rounded-none bg-white p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                    <span className="text-[11px] font-bold uppercase tracking-wide text-[#707072]">
                      {m.label}
                    </span>
                  </span>
                  <span className="text-xs font-bold text-[#111111] tabular-nums">
                    {m.current}
                    <span className="font-medium text-[#707072]"> / {m.goal}g</span>
                  </span>
                </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#e5e5e5]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: m.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* I bottoni ora sono link a /nutrition invece di modali locali */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link
            href="/nutrition"
            className="flex items-center justify-center gap-2 rounded-full bg-[#111111] py-3 text-sm font-bold text-white transition hover:bg-[#2c2c2c]"
          >
            <Plus className="h-4 w-4" />
            Aggiungi pasto
          </Link>
          <Link
            href="/nutrition"
            className="flex items-center justify-center gap-2 rounded-full border border-[#111111] bg-transparent py-3 text-sm font-bold text-[#111111] transition hover:bg-[#f5f5f5]"
          >
            <ListChecks className="h-4 w-4" />
            Dettagli pasti
        </Link>
      </div>
    </section>
  );
}
