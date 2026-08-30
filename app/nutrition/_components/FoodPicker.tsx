"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Check } from "lucide-react";
import { foodDatabase } from "../../today/_lib/data";
import type { Food } from "../../today/_lib/types";

const categoryLabels: Record<Food["category"], string> = {
  colazione: "Colazione",
  proteine: "Proteine",
  carboidrati: "Carboidrati",
  verdure: "Verdure",
  frutta: "Frutta",
  snack: "Snack",
  bevande: "Bevande",
};

interface FoodPickerProps {
  onAdd: (food: Food, quantity: number) => void;
}

/**
 * Selettore alimenti con:
 * - ricerca testuale
 * - filtro per categoria
 * - selezione porzione (grammi o pezzi)
 * - anteprima kcal calcolate
 */
export default function FoodPicker({ onAdd }: FoodPickerProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Food["category"] | "all">("all");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState<string>("100");
  const [justAdded, setJustAdded] = useState(false);

  // Filtro combinato: categoria + query
  const filtered = useMemo(() => {
    return foodDatabase.filter((f) => {
      const matchCategory =
        selectedCategory === "all" || f.category === selectedCategory;
      const matchQuery =
        query.trim() === "" ||
        f.name.toLowerCase().includes(query.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [query, selectedCategory]);

  // Calcolo nutrienti per la porzione scelta
  const qNum = parseFloat(quantity) || 0;
  const factor = selectedFood?.unit === "100g" ? qNum / 100 : qNum;
  const preview = selectedFood
    ? {
        kcal: Math.round(selectedFood.kcal * factor),
        carbs: Math.round(selectedFood.carbs * factor * 10) / 10,
        protein: Math.round(selectedFood.protein * factor * 10) / 10,
        fat: Math.round(selectedFood.fat * factor * 10) / 10,
      }
    : null;

  const handleAdd = () => {
    if (!selectedFood || qNum <= 0) return;
    onAdd(selectedFood, qNum);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
    setSelectedFood(null);
    setQuantity("100");
  };

  return (
    <section className="rounded-2xl border border-emerald-900/5 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#111111]/70">
        Cerca alimento
      </h2>

      {/* Barra di ricerca */}
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#111111]/40" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca (es. pollo, avena, mela)…"
          className="w-full rounded-xl border border-emerald-900/10 bg-white py-2.5 pl-10 pr-4 text-sm text-[#111111] placeholder:text-[#111111]/40 outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>

      {/* Chip categorie */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`rounded-full px-3 py-1 text-xs font-bold transition ${
            selectedCategory === "all"
              ? "bg-emerald-600 text-white"
              : "bg-emerald-50 text-[#111111]/70 hover:bg-emerald-100"
          }`}
        >
          Tutti
        </button>
        {(Object.keys(categoryLabels) as Food["category"][]).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-3 py-1 text-xs font-bold transition ${
              selectedCategory === cat
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-[#111111]/70 hover:bg-emerald-100"
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Lista alimenti */}
      <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#111111]/50">
            Nessun alimento trovato.
          </p>
        ) : (
          filtered.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFood(f)}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${
                selectedFood?.id === f.id
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-emerald-900/10 bg-white hover:bg-emerald-50/50"
              }`}
            >
              <span className="text-sm font-medium text-[#111111]">{f.name}</span>
              <span className="text-xs font-bold text-[#111111]/60 tabular-nums">
                {f.kcal} kcal / {f.unit}
              </span>
            </button>
          ))
        )}
      </div>

      {/* Pannello porzione + preview + aggiungi */}
      {selectedFood && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <p className="mb-3 text-sm font-bold text-[#111111]">
            {selectedFood.name}
          </p>

          <div className="mb-3 flex items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wide text-[#111111]/70">
              Quantità
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-24 rounded-lg border border-emerald-900/10 bg-white px-2 py-1 text-sm tabular-nums outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <span className="text-sm font-medium text-[#111111]/70">
              {selectedFood.unit === "100g" ? "grammi" : "pezzi"}
            </span>
          </div>

          {preview && (
            <div className="mb-3 grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-[10px] font-bold uppercase text-[#111111]/60">Kcal</p>
                <p className="text-sm font-bold text-[#111111] tabular-nums">
                  {preview.kcal}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-[#111111]/60">Carbo</p>
                <p className="text-sm font-bold text-[#111111] tabular-nums">
                  {preview.carbs}g
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-[#111111]/60">Prot</p>
                <p className="text-sm font-bold text-[#111111] tabular-nums">
                  {preview.protein}g
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-[#111111]/60">Grassi</p>
                <p className="text-sm font-bold text-[#111111] tabular-nums">
                  {preview.fat}g
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleAdd}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white shadow-sm transition ${
              justAdded ? "bg-teal-600" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4" /> Aggiunto!
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Aggiungi al diario
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
