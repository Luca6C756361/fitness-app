"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../_lib/supabase/client";   // <-- NUOVO
import { useAuth } from "../../_lib/AuthContext";        // <-- NUOVO
import { REST_DEFAULT_SECONDS } from "../../allenamento/_lib/restPresets";

export type Theme = "light" | "dark";
export type WeightUnit = "kg" | "lb";
export type HeightUnit = "cm" | "in";
export type EnergyUnit = "kcal" | "kJ";
export type Language = "it" | "en";

export interface Settings {
  theme: Theme;
  weightUnit: WeightUnit;
  heightUnit: HeightUnit;
  energyUnit: EnergyUnit;
  language: Language;
  notifications: {
    enabled: boolean;
    water: boolean;
    workout: boolean;
    meals: boolean;
  };
  /** Preset globale di recupero tra serie, in secondi. Fallback quando un
   *  esercizio non ha un recupero personalizzato. */
  restDefaultSeconds: number;
}

const defaultSettings: Settings = {
  theme: "light",
  weightUnit: "kg",
  heightUnit: "cm",
  energyUnit: "kcal",
  language: "it",
  notifications: { enabled: false, water: true, workout: true, meals: true },
  restDefaultSeconds: REST_DEFAULT_SECONDS,
};

interface SettingsContextValue {
  settings: Settings;
  loading: boolean;                                        // <-- NUOVO
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  resetAll: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);
// const STORAGE_KEY = "fitness-app:settings";   ← CANCELLA

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Carica settings dal profilo
  useEffect(() => {
    if (!user) {
      setSettings(defaultSettings);
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("settings")
        .eq("id", user.id)
        .single();

      if (error) console.error("[settings]", error.message);
      // merge coi default: gestisce chiavi nuove aggiunte dopo il primo salvataggio.
      // Nessuna migrazione necessaria per restDefaultSeconds: i profili salvati
      // prima di oggi non hanno la chiave e la ereditano da defaultSettings qui.
      if (data?.settings) setSettings({ ...defaultSettings, ...data.settings });
      setLoading(false);
    })();
  }, [user]);

  // Applica il tema al DOM (nessuna scrittura: sicuro in useEffect)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  /** Scrive l'intero oggetto settings (JSONB non supporta patch parziali lato PostgREST). */
  const persist = async (next: Settings) => {
    if (!user) return;
    const previous = settings;
    setSettings(next);                                   // ottimistico

    const { error } = await supabase
      .from("profiles")
      .update({ settings: next })
      .eq("id", user.id);

    if (error) {
      console.error("[settings]", error.message);
      setSettings(previous);                             // rollback
    }
  };

  const updateSettings = async (patch: Partial<Settings>) => {
    await persist({ ...settings, ...patch });
  };

  const resetSettings = async () => {
    await persist(defaultSettings);
  };

  /** Reset TOTALE: svuota le tabelle dell'utente e azzera i JSONB del profilo. */
  const resetAll = async () => {
    if (!user) return;

    // PostgREST rifiuta le DELETE senza filtro: .eq() è obbligatorio anche con RLS attiva
    await Promise.all([
      supabase.from("diary_entries").delete().eq("user_id", user.id),
      supabase.from("weight_entries").delete().eq("user_id", user.id),
      supabase.from("workout_logs").delete().eq("user_id", user.id),
      supabase.from("active_sessions").delete().eq("user_id", user.id),
      supabase.from("custom_exercises").delete().eq("user_id", user.id),
    ]);

    await supabase
      .from("profiles")
      .update({
        name: null, avatar: null, age: null, sex: null,
        height: null, weight: null, activity: null,
        goals: null, plan: null,
        settings: defaultSettings,
      })
      .eq("id", user.id);

    localStorage.removeItem("fitness-app:todayOverride");
    localStorage.removeItem("fitness-app:customExercises");

    window.location.href = "/today";   // reload completo: ricarica tutti i Context
  };

  return (
    <SettingsContext.Provider
      value={{ settings, loading, updateSettings, resetSettings, resetAll }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings deve essere usato dentro <SettingsProvider>");
  return ctx;
}

export function convertWeight(kg: number, unit: WeightUnit): number {
  return unit === "lb" ? kg * 2.20462 : kg;
}
export function convertHeight(cm: number, unit: HeightUnit): number {
  return unit === "in" ? cm / 2.54 : cm;
}
export function convertEnergy(kcal: number, unit: EnergyUnit): number {
  return unit === "kJ" ? kcal * 4.184 : kcal;
}
