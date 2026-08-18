"use client";

import { Trash2, UtensilsCrossed } from "lucide-react";
import type { Food } from "../../today/_lib/types";

export interface DiaryEntry {
  id: number;
  food: Food;
  quantity: number;
  time: string;
}

interface FoodDiaryProps {
  entries: DiaryEntry[];
  onRemove: (id: number) => void;
}

/** Diario alimentare del giorno: mostra i cibi aggiunti + totali. */
export default function FoodDiary({ entries, onRemove }: FoodDiaryProps) {
  // Calcolo totali sommando tutte le voci del diario
  const totals = entries.reduce(
    (acc, e) => {
      const factor = e.food.unit === "100g" ? e.quantity / 100 : e.quantity;
      acc.kcal += e.food.kcal * factor;
      acc.carbs += e.food.carbs * factor;
      acc.protein += e.food.protein * factor;
      acc.fat += e.food.fat * factor;
      return acc;
    },
    { kcal: 0, carbs: 0, protein: 0, fat: 0 }
  );

  return (
    <section className="rounded-2xl border border-emerald-900/5 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <UtensilsCrossed className="h-4 w-4 text-emerald-700" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-800/70">
          Diario di oggi
        </h2>
      </div>

      {/* Totali */}
      <div className="mb-4 grid grid-cols-4 gap-2 rounded-xl bg-emerald-50 p-3 text-center">
        <div>
          <p className="text-[10px] font-bold uppercase text-emerald-800/60">Kcal</p>
          <p className="text-base font-bold text-emerald-950 tabular-nums">
            {Math.round(totals.kcal)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-emerald-800/60">Carbo</p>
          <p className="text-base font-bold text-emerald-950 tabular-nums">
            {Math.round(totals.carbs)}g
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-emerald-800/60">Prot</p>
          <p className="text-base font-bold text-emerald-950 tabular-nums">
            {Math.round(totals.protein)}g
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-emerald-800/60">Grassi</p>
          <p className="text-base font-bold text-emerald-950 tabular-nums">
            {Math.round(totals.fat)}g
          </p>
        </div>
      </div>

      {/* Lista voci */}
      {entries.length === 0 ? (
        <p className="py-8 text-center text-sm text-emerald-800/50">
          Nessun alimento aggiunto oggi.
          <br />
          Cerca qualcosa e clicca "Aggiungi al diario".
        </p>
      ) : (
        <ul className="space-y-2">
          {entries.map((e) => {
            const factor = e.food.unit === "100g" ? e.quantity / 100 : e.quantity;
            const kcal = Math.round(e.food.kcal * factor);
            return (
              <li
                key={e.id}
                className="flex items-center justify-between rounded-xl border border-emerald-900/10 bg-white px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-emerald-950">
                    {e.food.name}
                  </p>
                  <p className="text-xs font-medium text-emerald-800/50 tabular-nums">
                    {e.time} · {e.quantity}
                    {e.food.unit === "100g" ? "g" : " pz"} · {kcal} kcal
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(e.id)}
                  className="ml-2 rounded-lg p-2 text-emerald-800/40 transition hover:bg-red-50 hover:text-red-600"
                  aria-label="Rimuovi"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
