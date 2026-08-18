"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Food } from "./types";
import { supabase } from "../../_lib/supabase/client";       // <-- NUOVO
import { useAuth } from "../../_lib/AuthContext";            // <-- NUOVO

/**
 * DiaryContext: gestione centralizzata del diario alimentare.
 * Ogni voce ha una data (ISO YYYY-MM-DD). Salva in localStorage.
 *
 * Espone:
 * - addEntry / removeEntry
 * - todayEntries: voci di oggi
 * - todayTotals: totali kcal/carbo/prot/grassi di oggi
 * - dailyKcalHistory: kcal per gli ultimi 7 giorni (per grafico stats)
 */

export interface DiaryEntry {
  id: string;                    // era number: ora è l'uuid generato da Postgres
  date: string;
  time: string;
  food: Food;
  quantity: number;
}

interface Totals {
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
}

interface DailyKcal {
  date: string;
  kcal: number;
}

interface DiaryContextValue {
  entries: DiaryEntry[];
  loading: boolean;                                          // <-- NUOVO
  addEntry: (food: Food, quantity: number) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  todayEntries: DiaryEntry[];
  todayTotals: Totals;
  dailyKcalHistory: DailyKcal[];
}

const DiaryContext = createContext<DiaryContextValue | null>(null);


/** Data di oggi in formato YYYY-MM-DD */
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Calcola macro/kcal per una voce, tenendo conto dell'unità (100g o pz). */
function calcNutrients(entry: DiaryEntry): Totals {
  const f = entry.quantity;
  const factor = entry.food.unit === "100g" ? f / 100 : f;
  return {
    kcal: entry.food.kcal * factor,
    carbs: entry.food.carbs * factor,
    protein: entry.food.protein * factor,
    fat: entry.food.fat * factor,
  };
}

export function DiaryProvider({ children }: { children: React.ReactNode }) {
  /*const [entries, setEntries] = useState<DiaryEntry[]>([]);

  // Carica da localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setEntries(JSON.parse(saved));
    } catch {
      fallback: array vuoto
    }
  }, []);

  const persist = (next: DiaryEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setEntries(next);
  };

  const addEntry = (food: Food, quantity: number) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
    const newEntry: DiaryEntry = {
      id: Date.now(),
      date: todayISO(),
      time,
      food,
      quantity,
    };
    persist([...entries, newEntry]);
  };

  const removeEntry = (id: number) => {
    persist(entries.filter((e) => e.id !== id));
  };*/
export function DiaryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      // Solo ultimi 30 giorni: basta per i totali di oggi e il grafico a 7 giorni.
      const from = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("diary_entries")
        .select("id, date, time, food, quantity")
        .gte("date", from);
      if (error) console.error("[diary]", error.message);
      if (data) {
        setEntries(
          data.map((e) => ({ ...e, quantity: Number(e.quantity) })) as DiaryEntry[]
        );
      }
      setLoading(false);
    })();
  }, [user]);

  const addEntry = async (food: Food, quantity: number) => {
    if (!user) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    // .select().single() è obbligatorio: senza, non riceviamo l'id generato dal DB
    const { data, error } = await supabase
      .from("diary_entries")
      .insert({ user_id: user.id, date: todayISO(), time, food, quantity })
      .select()
      .single();

    if (error) return console.error("[diary]", error.message);
    if (data) {
      setEntries((prev) => [...prev, { ...data, quantity: Number(data.quantity) } as DiaryEntry]);
    }
  };

  const removeEntry = async (id: string) => {
    const previous = entries;
    setEntries((prev) => prev.filter((e) => e.id !== id));
    const { error } = await supabase.from("diary_entries").delete().eq("id", id);
    if (error) {
      console.error("[diary]", error.message);
      setEntries(previous);
    }
  };

  // ... todayEntries, todayTotals, dailyKcalHistory invariati ...
  // Voci di oggi
  const todayEntries = useMemo(
    () => entries.filter((e) => e.date === todayISO()),
    [entries]
  );

  // Totali di oggi
  const todayTotals = useMemo(() => {
    return todayEntries.reduce<Totals>(
      (acc, e) => {
        const n = calcNutrients(e);
        acc.kcal += n.kcal;
        acc.carbs += n.carbs;
        acc.protein += n.protein;
        acc.fat += n.fat;
        return acc;
      },
      { kcal: 0, carbs: 0, protein: 0, fat: 0 }
    );
  }, [todayEntries]);

  // Kcal ultimi 7 giorni (per grafico stats)
  const dailyKcalHistory = useMemo(() => {
    const result: DailyKcal[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const dayKcal = entries
        .filter((e) => e.date === iso)
        .reduce((sum, e) => sum + calcNutrients(e).kcal, 0);
      result.push({ date: iso, kcal: Math.round(dayKcal) });
    }
    return result;
  }, [entries]);

  return (
    <DiaryContext.Provider
      value={{ entries, loading, addEntry, removeEntry, todayEntries, todayTotals, dailyKcalHistory }}
    >
      {children}
    </DiaryContext.Provider>
  );
}

export function useDiary() {
  const ctx = useContext(DiaryContext);
  if (!ctx) throw new Error("useDiary deve essere usato dentro <DiaryProvider>");
  return ctx;
}
