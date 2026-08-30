"use client";

import { Trash2, ListChecks, Minus, Plus } from "lucide-react";
import type { PlannedExercise } from "../../../today/_lib/types";

interface CartItem extends PlannedExercise {
  exerciseName: string; // per mostrarlo senza dover fare lookup ogni volta
}

interface CompositionCartProps {
  items: CartItem[];
  onUpdate: (id: string, patch: Partial<CartItem>) => void;
  onRemove: (id: string) => void;
  onSave: (name: string) => void;
  sessionName: string;
  onSessionNameChange: (name: string) => void;
}

/** Piccolo stepper numerico (min/plus). */
function Stepper({
  value,
  onChange,
  min = 1,
  max = 20,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="rounded-md bg-emerald-50 p-1 text-emerald-700 transition hover:bg-emerald-100"
        aria-label="Diminuisci"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="min-w-[2ch] text-center text-sm font-bold text-[#111111] tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="rounded-md bg-emerald-50 p-1 text-emerald-700 transition hover:bg-emerald-100"
        aria-label="Aumenta"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}

export default function CompositionCart({
  items,
  onUpdate,
  onRemove,
  onSave,
  sessionName,
  onSessionNameChange,
}: CompositionCartProps) {
  const totalSets = items.reduce((s, i) => s + i.sets, 0);
  const estimatedMinutes = Math.max(5, totalSets * 2);

  return (
    <section className="rounded-2xl border border-emerald-900/5 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <ListChecks className="h-4 w-4 text-emerald-700" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#111111]/70">
          La tua composizione
        </h2>
      </div>

      {/* Nome sessione */}
      <div className="mb-4">
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#111111]/60">
          Nome sessione
        </label>
        <input
          type="text"
          value={sessionName}
          onChange={(e) => onSessionNameChange(e.target.value)}
          placeholder="Es. Allenamento veloce"
          className="w-full rounded-xl border border-emerald-900/10 bg-white px-4 py-2 text-sm text-[#111111] outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>

      {/* Riepilogo compatto */}
      {items.length > 0 && (
        <div className="mb-4 flex gap-2 rounded-xl bg-emerald-50 p-3 text-center">
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase text-[#111111]/60">
              Esercizi
            </p>
            <p className="text-sm font-bold text-[#111111] tabular-nums">
              {items.length}
            </p>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase text-[#111111]/60">
              Set totali
            </p>
            <p className="text-sm font-bold text-[#111111] tabular-nums">
              {totalSets}
            </p>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase text-[#111111]/60">
              Stima
            </p>
            <p className="text-sm font-bold text-[#111111] tabular-nums">
              ~{estimatedMinutes}′
            </p>
          </div>
        </div>
      )}

      {/* Lista */}
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#111111]/50">
          Aggiungi esercizi dalla lista a fianco per iniziare a comporre.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-emerald-900/10 bg-white p-3"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-[#111111]">
                  {item.exerciseName}
                </p>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="rounded-lg p-1 text-[#111111]/40 transition hover:bg-red-50 hover:text-red-600"
                  aria-label="Rimuovi"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Controlli set/reps */}
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-[#111111]/60">
                    Set
                  </span>
                  <Stepper
                    value={item.sets}
                    onChange={(v) => onUpdate(item.id, { sets: v })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-[#111111]/60">
                    Reps
                  </span>
                  <Stepper
                    value={item.reps}
                    onChange={(v) => onUpdate(item.id, { reps: v })}
                    max={50}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Bottone salva */}
      <button
        type="button"
        onClick={() => onSave(sessionName)}
        disabled={items.length === 0}
        className="mt-6 w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Salva composizione e vai
      </button>
    </section>
  );
}
