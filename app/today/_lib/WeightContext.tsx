"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../../_lib/supabase/client";
import { useAuth } from "../../_lib/AuthContext";
import { useUser } from "./UserContext";
import type { WeightEntry } from "./types";

/**
 * Storico misurazioni peso — fonte di verità sul peso corporeo.
 * Tabella `weight_entries`, chiave primaria (user_id, date): una sola
 * misurazione per giorno, quindi upsert invece di if/else.
 *
 * `profiles.weight` è una copia denormalizzata dell'ultima misurazione
 * (serve a BMI/TDEE senza caricare tutto lo storico): la teniamo allineata qui.
 */

interface WeightContextValue {
  entries: WeightEntry[];
  loading: boolean;
  addEntry: (date: string, weight: number) => Promise<void>;
  removeEntry: (date: string) => Promise<void>;
  currentWeight: number | null;
  previousWeight: number | null;
}

const WeightContext = createContext<WeightContextValue | null>(null);

export function WeightProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { updateProfile } = useUser();
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("weight_entries")
        .select("date, weight")
        .order("date");
      if (error) console.error("[weight]", error.message);
      if (data) setEntries(data.map((e) => ({ date: e.date, weight: Number(e.weight) })));
      setLoading(false);
    })();
  }, [user]);

  /** Ultima misurazione in ordine di data (non di inserimento). */
  const latestOf = (list: WeightEntry[]) =>
    list.length ? [...list].sort((a, b) => a.date.localeCompare(b.date)).at(-1)!.weight : null;

  const addEntry = async (date: string, weight: number) => {
    if (!user) return;
    const previous = entries;
    const next = [...entries.filter((e) => e.date !== date), { date, weight }]
      .sort((a, b) => a.date.localeCompare(b.date));
    setEntries(next);

    const { error } = await supabase
      .from("weight_entries")
      .upsert({ user_id: user.id, date, weight });   // PK composta → insert o update

    if (error) {
      console.error("[weight]", error.message);
      setEntries(previous);
      return;
    }

    // Allinea profiles.weight se questa è diventata la misurazione più recente
    const latest = latestOf(next);
    if (latest !== null) await updateProfile({ weight: latest });
  };

  const removeEntry = async (date: string) => {
    if (!user) return;
    const previous = entries;
    const next = entries.filter((e) => e.date !== date);
    setEntries(next);

    const { error } = await supabase.from("weight_entries").delete().eq("date", date);
    if (error) {
      console.error("[weight]", error.message);
      setEntries(previous);
      return;
    }

    const latest = latestOf(next);
    if (latest !== null) await updateProfile({ weight: latest });
  };

  const { currentWeight, previousWeight } = useMemo(() => {
    if (entries.length === 0) return { currentWeight: null, previousWeight: null };
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    return {
      currentWeight: sorted[sorted.length - 1].weight,
      previousWeight: sorted.length >= 2 ? sorted[sorted.length - 2].weight : null,
    };
  }, [entries]);

  return (
    <WeightContext.Provider
      value={{ entries, loading, addEntry, removeEntry, currentWeight, previousWeight }}
    >
      {children}
    </WeightContext.Provider>
  );
}

export function useWeight() {
  const ctx = useContext(WeightContext);
  if (!ctx) throw new Error("useWeight deve essere usato dentro <WeightProvider>");
  return ctx;
}










/* Vecchio codice :"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { WeightEntry } from "./types";

/**
 * WeightContext: storico misurazioni peso.
 * Ogni voce ha data (ISO YYYY-MM-DD) e peso (kg).
 *
 * Espone:
 * - entries: storico completo ordinato per data
 * - addEntry(date, weight): aggiungi/aggiorna misurazione di una data
 * - removeEntry(date): rimuovi una misurazione
 * - currentWeight: peso più recente
 * - previousWeight: penultima misurazione (per delta nell'header)


interface WeightContextValue {
  entries: WeightEntry[];
  addEntry: (date: string, weight: number) => void;
  removeEntry: (date: string) => void;
  currentWeight: number | null;
  previousWeight: number | null;
}

const WeightContext = createContext<WeightContextValue | null>(null);
const STORAGE_KEY = "fitness-app:weight";

/** Seed iniziale: qualche misurazione degli ultimi mesi. 
const initialEntries: WeightEntry[] = [
  { date: "2026-06-01", weight: 79.2 },
  { date: "2026-06-15", weight: 78.5 },
  { date: "2026-07-01", weight: 77.8 },
  { date: "2026-07-15", weight: 76.6 },
  { date: "2026-08-01", weight: 75.4 },
];

export function WeightProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<WeightEntry[]>(initialEntries);

  // Carica da localStorage al primo render
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setEntries(JSON.parse(saved));
    } catch {
      /* usa seed 
    }
  }, []);

  const persist = (next: WeightEntry[]) => {
    // Ordina sempre per data crescente per rendere prevedibili i grafici
    const sorted = [...next].sort((a, b) => a.date.localeCompare(b.date));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
    setEntries(sorted);
  };

  
   * Aggiungi o aggiorna la misurazione di una data specifica.
   * Se già esiste una voce con quella data, la sovrascrive (non duplica).
   
  const addEntry = (date: string, weight: number) => {
    const existing = entries.find((e) => e.date === date);
    if (existing) {
      persist(entries.map((e) => (e.date === date ? { ...e, weight } : e)));
    } else {
      persist([...entries, { date, weight }]);
    }
  };

  const removeEntry = (date: string) => {
    persist(entries.filter((e) => e.date !== date));
  };

  // Peso più recente e penultimo
  const { currentWeight, previousWeight } = useMemo(() => {
    if (entries.length === 0) return { currentWeight: null, previousWeight: null };
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    return {
      currentWeight: sorted[sorted.length - 1].weight,
      previousWeight:
        sorted.length >= 2 ? sorted[sorted.length - 2].weight : null,
    };
  }, [entries]);

  return (
    <WeightContext.Provider
      value={{ entries, addEntry, removeEntry, currentWeight, previousWeight }}
    >
      {children}
    </WeightContext.Provider>
  );
}

export function useWeight() {
  const ctx = useContext(WeightContext);
  if (!ctx) throw new Error("useWeight deve essere usato dentro <WeightProvider>");
  return ctx;
}
*/