"use client";

import { Trash2, UtensilsCrossed } from "lucide-react";
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
  onRemove: (id: string) => void | Promise<void>;
}

/** Diario alimentare del giorno. */
export default function FoodDiary({ entries, totals, onRemove }: FoodDiaryProps) {
  return (
    <section className="rounded-2xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] p-6 shadow-[var(--kh-card-shadow)]">
      <div className="mb-4 flex items-center gap-2">
        <UtensilsCrossed className="h-4 w-4 text-[var(--kh-primary)]" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--kh-ink-subtle)]">
          Diario di oggi
        </h2>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-2 rounded-xl bg-[var(--kh-surface-2)] p-3 text-center">
        <div>
          <p className="text-[10px] font-bold uppercase text-[var(--kh-ink-muted)]">Kcal</p>
          <p className="font-mono text-base font-bold text-[var(--kh-ink)] tabular-nums">
            {Math.round(totals.kcal)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-[var(--kh-ink-muted)]">Carbo</p>
          <p className="font-mono text-base font-bold text-[var(--kh-ink)] tabular-nums">
            {Math.round(totals.carbs)}g
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-[var(--kh-ink-muted)]">Prot</p>
          <p className="font-mono text-base font-bold text-[var(--kh-ink)] tabular-nums">
            {Math.round(totals.protein)}g
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-[var(--kh-ink-muted)]">Grassi</p>
          <p className="font-mono text-base font-bold text-[var(--kh-ink)] tabular-nums">
            {Math.round(totals.fat)}g
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--kh-ink-subtle)]">
          Nessun alimento aggiunto oggi.
          <br />
          Cerca qualcosa e clicca &quot;Aggiungi al diario&quot;.
        </p>
      ) : (
        <ul className="space-y-2">
          {entries.map((e) => {
            const factor = e.food.unit === "100g" ? e.quantity / 100 : e.quantity;
            const kcal = Math.round(e.food.kcal * factor);
            return (
              <li
                key={e.id}
                className="flex items-center justify-between rounded-xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--kh-ink)]">
                    {e.food.name}
                  </p>
                  <p className="font-mono text-xs font-medium text-[var(--kh-ink-subtle)] tabular-nums">
                    {e.time} · {e.quantity}
                    {e.food.unit === "100g" ? "g" : " pz"} · {kcal} kcal
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(e.id)}
                  className="ml-2 rounded-lg p-2 text-[var(--kh-ink-subtle)] transition hover:bg-red-500/10 hover:text-red-600"
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