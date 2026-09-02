"use client";

import Image from "next/image";
import { ScanLine, Trash2, UtensilsCrossed } from "lucide-react";
import type { DiaryEntry } from "../../today/_lib/DiaryContext";

interface Totals {
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
}

interface FoodDiaryProps {
  entries: DiaryEntry[];
  totals: Totals;
  onRemove: (id: string) => void | Promise<void>;   // <-- MODIFICATA (era: (id: number) => void)
}
/** Diario alimentare del giorno. */
export default function FoodDiary({ entries, totals, onRemove }: FoodDiaryProps) {
  return (
    <section className="rounded-2xl border border-emerald-900/5 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <UtensilsCrossed className="h-4 w-4 text-emerald-700" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-800/70">
          Diario di oggi
        </h2>
      </div>

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

      {entries.length === 0 ? (
        <p className="py-8 text-center text-sm text-emerald-800/50">
          Nessun alimento aggiunto oggi.
          <br />
          Cerca qualcosa e clicca &quot;Aggiungi al diario&quot;.
        </p>
      ) : (
        <ul className="space-y-2">
          {entries.map((e) => {
            const factor = e.food.unit === "100g" ? e.quantity / 100 : e.quantity;
            // Difesa dai NaN: le voci OFF possono avere macro mancanti nelle righe già salvate.
            const rawKcal = e.food.kcal * factor;
            const kcal = Number.isFinite(rawKcal) ? Math.round(rawKcal) : 0;
            return (
              <li
                key={e.id}
                className="flex items-center justify-between rounded-xl border border-emerald-900/10 bg-white px-4 py-3"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {e.food.imageUrl && (
                    <Image
                      src={e.food.imageUrl}
                      alt=""
                      width={32}
                      height={32}
                      className="h-8 w-8 shrink-0 rounded-lg object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-emerald-950">
                        {e.food.name}
                      </span>
                      {e.food.source === "off" && (
                        <ScanLine className="h-3 w-3 shrink-0 text-teal-600" />
                      )}
                    </span>
                    {e.food.brand && (
                      <p className="truncate text-xs text-emerald-800/40">{e.food.brand}</p>
                    )}
                    <p className="text-xs font-medium text-emerald-800/50 tabular-nums">
                      {e.time} · {e.quantity}
                      {e.food.unit === "100g" ? "g" : " pz"} · {kcal} kcal
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(e.id)}
                  className="ml-2 shrink-0 rounded-lg p-2 text-emerald-800/40 transition hover:bg-red-50 hover:text-red-600"
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
