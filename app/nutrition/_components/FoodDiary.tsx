"use client";

import Image from "next/image";
import { ScanLine, Trash2, UtensilsCrossed } from "lucide-react";
import type { DiaryEntry } from "../../today/_lib/DiaryContext";
import FirstRunHint from "../../_components/FirstRunHint";

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
  /** Apre lo scanner (stato vive in app/nutrition/page.tsx). Senza prop, il bottone non si renderizza. */
  onStartScan?: () => void;
}
/** Diario alimentare del giorno. */
export default function FoodDiary({ entries, totals, onRemove, onStartScan }: FoodDiaryProps) {
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
        <div className="py-4 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
            <UtensilsCrossed className="h-5 w-5 text-emerald-600" />
          </span>
          <p className="mb-1 text-sm font-bold text-emerald-950">Il diario di oggi è vuoto</p>
          <p className="mx-auto mb-4 max-w-xs text-xs text-emerald-800/60">
            Scansiona un codice a barre o cerca un alimento per iniziare.
          </p>
          {onStartScan && (
            <button
              type="button"
              onClick={onStartScan}
              className="mx-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              <ScanLine className="h-4 w-4" />
              Scansiona un prodotto
            </button>
          )}
          <div className="mx-auto mt-4 max-w-xs text-left">
            <FirstRunHint
              id="nutrition-picker"
              arrow="up"
              text="Puoi anche cercare tra gli alimenti qui sopra."
            />
          </div>
        </div>
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
