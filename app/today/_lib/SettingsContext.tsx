"use client";

import { createContext, useContext, useEffect, useState } from "react";

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
}

const defaultSettings: Settings = {
  theme: "light",
  weightUnit: "kg",
  heightUnit: "cm",
  energyUnit: "kcal",
  language: "it",
  notifications: { enabled: false, water: true, workout: true, meals: true },
};

interface SettingsContextValue {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  resetSettings: () => void;
  resetAll: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);
const STORAGE_KEY = "fitness-app:settings";

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setSettings({ ...defaultSettings, ...JSON.parse(saved) });
    } catch {
      /* fallback */
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  const updateSettings = (patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
  };

  /** Reset TOTALE: cancella tutti i dati locali. */
  const resetAll = () => {
    localStorage.removeItem("fitness-app:profile");
    localStorage.removeItem("fitness-app:goals");
    localStorage.removeItem("fitness-app:diary");
    localStorage.removeItem("fitness-app:workoutLogs");
    localStorage.removeItem("fitness-app:weight");
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = "/today";
  };

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, resetSettings, resetAll }}
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
