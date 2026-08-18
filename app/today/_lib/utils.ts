/** Utility della dashboard TODAY */

import { activityLabels } from "./data";
import type { UserProfile } from "./types";

export function formatToday(date: Date = new Date()): string {
  const s = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Body Mass Index — indicatore standard peso/altezza.
 * Formula: peso (kg) / altezza (m)²
 */
export function calcBMI(weight: number, height: number): number {
  const heightM = height / 100;
  return weight / (heightM * heightM);
}

/** Classificazione BMI secondo OMS. */
export function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Sottopeso", color: "text-sky-600" };
  if (bmi < 25) return { label: "Normopeso", color: "text-emerald-600" };
  if (bmi < 30) return { label: "Sovrappeso", color: "text-amber-600" };
  return { label: "Obesità", color: "text-red-600" };
}

/**
 * Metabolismo basale (BMR) — formula di Mifflin-St Jeor.
 * È la stima delle kcal che il corpo brucia a riposo in 24h.
 */
export function calcBMR(profile: UserProfile): number {
  const { weight, height, age, sex } = profile;
  const base = 10 * weight + 6.25 * height - 5 * age;
  return sex === "M" ? base + 5 : base - 161;
}

/**
 * Fabbisogno calorico giornaliero totale (TDEE) — BMR × moltiplicatore attività.
 */
export function calcTDEE(profile: UserProfile): number {
  const bmr = calcBMR(profile);
  const multiplier = activityLabels[profile.activity].multiplier;
  return Math.round(bmr * multiplier);
}

/** Formatta una data ISO come "1 ago". */
export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}
