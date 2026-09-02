"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, Plus, Check, ScanLine, Loader2, AlertTriangle } from "lucide-react";
import { foodDatabase } from "../../today/_lib/data";
import type { Food } from "../../today/_lib/types";
import BarcodeScanner from "./BarcodeScanner";

const categoryLabels: Record<Food["category"], string> = {
  colazione: "Colazione",
  proteine: "Proteine",
  carboidrati: "Carboidrati",
  verdure: "Verdure",
  frutta: "Frutta",
  snack: "Snack",
  bevande: "Bevande",
};

const macroLabels = { kcal: "Kcal", carbs: "Carbo", protein: "Prot", fat: "Grassi" } as const;

interface FoodPickerProps {
  onAdd: (food: Food, quantity: number) => void;
  /** Sollevato in app/nutrition/page.tsx: serve a FoodDiary per aprire lo scanner dalla sua CTA. */
  scannerOpen: boolean;
  onScannerOpenChange: (open: boolean) => void;
}

interface LookupState {
  status: "idle" | "loading" | "error";
  message?: string;
  barcode?: string;
}

/**
 * Selettore alimenti con:
 * - ricerca testuale
 * - filtro per categoria
 * - selezione porzione (grammi o pezzi)
 * - anteprima kcal calcolate
 */
export default function FoodPicker({ onAdd, scannerOpen, onScannerOpenChange }: FoodPickerProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Food["category"] | "all">("all");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState<string>("100");
  const [justAdded, setJustAdded] = useState(false);

  // Scanner nutrizionale (Open Food Facts) — stato sollevato al genitore
  const [scanned, setScanned] = useState<Food[]>([]); // prodotti OFF di questa sessione
  const [lookup, setLookup] = useState<LookupState>({ status: "idle" });

  // Filtro combinato: categoria + query — i prodotti scansionati vanno in cima
  const filtered = useMemo(() => {
    return [...scanned, ...foodDatabase].filter((f) => {
      const matchCategory =
        selectedCategory === "all" || f.category === selectedCategory;
      const matchQuery =
        query.trim() === "" ||
        f.name.toLowerCase().includes(query.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [query, selectedCategory, scanned]);

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

  const canAdd =
    !!selectedFood &&
    qNum > 0 &&
    (!selectedFood.incomplete || selectedFood.name.trim().length > 0);

  const handleAdd = () => {
    if (!canAdd || !selectedFood) return;
    const foodToAdd: Food = selectedFood.incomplete
      ? { ...selectedFood, incomplete: false }
      : selectedFood;
    onAdd(foodToAdd, qNum);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
    setSelectedFood(null);
    setQuantity("100");
  };

  /** Riusa un prodotto già scansionato in questa sessione senza richiamare l'API (risparmia rate limit). */
  const selectFood = (food: Food) => {
    setSelectedFood(food);
    setQuantity(String(food.servingHint ?? 100));
  };

  const handleDetected = async (barcode: string) => {
    onScannerOpenChange(false);
    setLookup({ status: "loading", barcode });

    const cached = scanned.find((f) => f.barcode === barcode);
    if (cached) {
      selectFood(cached);
      setLookup({ status: "idle" });
      return;
    }

    try {
      const res = await fetch(`/api/off/${barcode}`);
      if (res.status === 200) {
        const { food } = (await res.json()) as { food: Food };
        setScanned((prev) => [food, ...prev.filter((f) => f.barcode !== food.barcode)]);
        selectFood(food);
        setLookup({ status: "idle" });
      } else if (res.status === 404) {
        setLookup({ status: "error", barcode, message: "Prodotto non trovato su Open Food Facts." });
      } else if (res.status === 429) {
        setLookup({ status: "error", barcode, message: "Troppe richieste, riprova tra un minuto." });
      } else if (res.status === 504) {
        setLookup({ status: "error", barcode, message: "Timeout: connessione lenta." });
      } else {
        setLookup({ status: "error", barcode, message: "Errore nel recupero dei dati." });
      }
    } catch (err) {
      console.error("[nutrition]", err);
      setLookup({ status: "error", barcode, message: "Errore nel recupero dei dati." });
    }
  };

  const openManualEntry = () => {
    setSelectedFood({
      id: `manual:${Date.now()}`,
      name: "",
      category: "snack",
      kcal: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
      unit: "100g",
      incomplete: true,
    });
    setQuantity("100");
    setLookup({ status: "idle" });
  };

  return (
    <section className="rounded-2xl border border-emerald-900/5 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-emerald-800/70">
        Cerca alimento
      </h2>

      {/* Barra di ricerca + scanner */}
      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-800/40" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca (es. pollo, avena, mela)…"
            className="w-full rounded-xl border border-emerald-900/10 bg-white py-2.5 pl-10 pr-4 text-sm text-emerald-950 placeholder:text-emerald-800/40 outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>
        <button
          type="button"
          onClick={() => onScannerOpenChange(true)}
          aria-label="Scansiona codice a barre"
          className="flex shrink-0 items-center justify-center rounded-xl bg-emerald-600 px-3 py-2.5 text-white transition hover:bg-emerald-700"
        >
          <ScanLine className="h-4 w-4" />
        </button>
      </div>

      {/* Stato ricerca prodotto scansionato */}
      {lookup.status === "loading" && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-800">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Ricerca prodotto {lookup.barcode}…
        </div>
      )}
      {lookup.status === "error" && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-900">
          <p className="mb-2 font-medium">{lookup.message}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => lookup.barcode && handleDetected(lookup.barcode)}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-amber-700"
            >
              Riprova
            </button>
            <button
              type="button"
              onClick={openManualEntry}
              className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-[11px] font-bold text-amber-800 transition hover:bg-amber-100"
            >
              Inserisci a mano
            </button>
          </div>
        </div>
      )}

      {/* Chip categorie */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`rounded-full px-3 py-1 text-xs font-bold transition ${
            selectedCategory === "all"
              ? "bg-emerald-600 text-white"
              : "bg-emerald-50 text-emerald-800/70 hover:bg-emerald-100"
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
                : "bg-emerald-50 text-emerald-800/70 hover:bg-emerald-100"
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Lista alimenti */}
      <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-emerald-800/50">
            Nessun alimento trovato.
          </p>
        ) : (
          filtered.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => selectFood(f)}
              className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition ${
                selectedFood?.id === f.id
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-emerald-900/10 bg-white hover:bg-emerald-50/50"
              }`}
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium text-emerald-950">{f.name}</span>
                  {f.source === "off" && (
                    <span className="shrink-0 rounded-full bg-teal-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-teal-700">
                      Scansionato
                    </span>
                  )}
                </span>
                {f.brand && (
                  <span className="block truncate text-[11px] text-emerald-800/50">{f.brand}</span>
                )}
              </span>
              <span className="shrink-0 text-xs font-bold text-emerald-800/60 tabular-nums">
                {f.kcal} kcal / {f.unit}
              </span>
            </button>
          ))
        )}
      </div>

      {/* Pannello porzione + preview + aggiungi */}
      {selectedFood && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="mb-3 flex items-center gap-3">
            {selectedFood.imageUrl && (
              <Image
                src={selectedFood.imageUrl}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-emerald-950">
                {selectedFood.name || "Alimento senza nome"}
              </p>
              {selectedFood.brand && (
                <p className="truncate text-xs text-emerald-800/50">{selectedFood.brand}</p>
              )}
            </div>
          </div>

          {selectedFood.incomplete && (
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <AlertTriangle className="h-3.5 w-3.5" />
                Dati nutrizionali incompleti
              </p>
              <div className="mb-2">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-amber-800/70">
                  Nome
                </label>
                <input
                  type="text"
                  value={selectedFood.name}
                  onChange={(e) => setSelectedFood({ ...selectedFood, name: e.target.value })}
                  placeholder="Nome alimento"
                  className="w-full rounded-lg border border-amber-200 bg-white px-2 py-1.5 text-sm text-emerald-950 outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(macroLabels) as (keyof typeof macroLabels)[]).map((key) => (
                  <div key={key}>
                    <label className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-amber-800/70">
                      {macroLabels[key]}
                    </label>
                    <input
                      type="number"
                      value={selectedFood[key]}
                      onChange={(e) =>
                        setSelectedFood({ ...selectedFood, [key]: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full rounded-lg border border-amber-200 bg-white px-2 py-1.5 text-sm text-emerald-950 tabular-nums outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-3 flex items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wide text-emerald-800/70">
              Quantità
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-24 rounded-lg border border-emerald-900/10 bg-white px-2 py-1 text-sm tabular-nums outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <span className="text-sm font-medium text-emerald-800/70">
              {selectedFood.unit === "100g" ? "grammi" : "pezzi"}
            </span>
          </div>

          {preview && (
            <div className="mb-3 grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-[10px] font-bold uppercase text-emerald-800/60">Kcal</p>
                <p className="text-sm font-bold text-emerald-950 tabular-nums">
                  {preview.kcal}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-emerald-800/60">Carbo</p>
                <p className="text-sm font-bold text-emerald-950 tabular-nums">
                  {preview.carbs}g
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-emerald-800/60">Prot</p>
                <p className="text-sm font-bold text-emerald-950 tabular-nums">
                  {preview.protein}g
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-emerald-800/60">Grassi</p>
                <p className="text-sm font-bold text-emerald-950 tabular-nums">
                  {preview.fat}g
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
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

      <BarcodeScanner
        open={scannerOpen}
        onClose={() => onScannerOpenChange(false)}
        onDetected={handleDetected}
      />
    </section>
  );
}
