/**
 * Calcolo TDEE/macro per il wizard di onboarding. File puro e testabile:
 * nessun import di React, next/*, supabase, lucide-react. Le formule
 * di base (Mifflin-St Jeor, TDEE) esistono già in ../../today/_lib/utils:
 * qui si IMPORTANO, non si riscrivono.
 */

import { calcBMR, calcTDEE } from "../../today/_lib/utils";
import type { UserGoals, UserProfile } from "../../today/_lib/types";

export type FitnessGoal = "definizione" | "mantenimento" | "massa";
export type ExperienceLevel = "principiante" | "intermedio" | "avanzato";

export interface MacroSplit {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number; // g, interi
}

export interface TdeeBreakdown {
  bmr: number;
  tdee: number;
  split: MacroSplit;
  goalFactor: number; // esposto per mostrarlo nella UI
  proteinPerKg: number; // esposto per mostrarlo nella UI
}

export const goalLabels: Record<
  FitnessGoal,
  { label: string; description: string; factor: number }
> = {
  definizione: {
    label: "Definizione",
    description: "Perdere grasso mantenendo la massa",
    factor: 0.8,
  },
  mantenimento: {
    label: "Mantenimento",
    description: "Restare al peso attuale",
    factor: 1.0,
  },
  massa: {
    label: "Massa",
    description: "Aumentare peso e forza",
    factor: 1.1,
  },
};

export const experienceLabels: Record<
  ExperienceLevel,
  { label: string; description: string }
> = {
  principiante: { label: "Principiante", description: "Meno di 6 mesi di palestra" },
  intermedio: { label: "Intermedio", description: "6 mesi - 2 anni, tecnica solida" },
  avanzato: { label: "Avanzato", description: "Oltre 2 anni, alleni per obiettivi" },
};

/** g di proteine per kg di peso corporeo, per obiettivo (range di consenso 1.6-2.2). */
const PROTEIN_PER_KG: Record<FitnessGoal, number> = {
  definizione: 2.0,
  mantenimento: 1.8,
  massa: 1.8,
};

/** Pavimento grassi: g per kg di peso corporeo, indipendente dalle kcal. */
const FAT_FLOOR_PER_KG = 0.8;

function round5(n: number): number {
  return Math.round(n / 5) * 5;
}

function round10(n: number): number {
  return Math.round(n / 10) * 10;
}

/** Split macro a partire da kcal/proteine già decisi, con la guardia sui carbo. */
function computeSplit(kcal: number, proteinG: number, weight: number): MacroSplit {
  const proteinKcal = proteinG * 4;

  let fatG = Math.max((kcal * 0.25) / 9, weight * FAT_FLOOR_PER_KG);
  let carbsG = (kcal - proteinKcal - fatG * 9) / 4;

  // GUARDIA: deficit aggressivi su soggetti leggeri possono spingere i
  // carbo sotto 50g. Si riducono i grassi al 20% (stesso pavimento) e si
  // ricalcola; se restano negativi si clampano a 0. Il risultato non deve
  // MAI contenere valori negativi o NaN.
  if (carbsG < 50) {
    fatG = Math.max((kcal * 0.2) / 9, weight * FAT_FLOOR_PER_KG);
    carbsG = (kcal - proteinKcal - fatG * 9) / 4;
  }
  if (carbsG < 0) carbsG = 0;

  return {
    kcal: round10(kcal),
    protein: round5(Math.max(0, proteinG)),
    carbs: round5(carbsG),
    fat: round5(Math.max(0, fatG)),
  };
}

/**
 * BMR/TDEE dalle formule esistenti + split macro per l'obiettivo scelto.
 * Non modifica `profile`.
 */
export function buildMacroSplit(
  profile: UserProfile,
  goal: FitnessGoal
): TdeeBreakdown {
  const bmr = Math.round(calcBMR(profile));
  const tdee = calcTDEE(profile);
  const goalFactor = goalLabels[goal].factor;
  const proteinPerKg = PROTEIN_PER_KG[goal];

  const kcalTarget = round10(tdee * goalFactor);
  const proteinG = proteinPerKg * profile.weight;
  const split = computeSplit(kcalTarget, proteinG, profile.weight);

  return { bmr, tdee, split, goalFactor, proteinPerKg };
}

/** Peso obiettivo suggerito, arrotondato ai 0.5 kg. */
export function suggestWeightTarget(weight: number, goal: FitnessGoal): number {
  const factor = goal === "definizione" ? 0.95 : goal === "massa" ? 1.05 : 1;
  return Math.round((weight * factor) / 0.5) * 0.5;
}

/** Mappa il breakdown calcolato sul tipo UserGoals esistente. */
export function toUserGoals(b: TdeeBreakdown, weightTarget: number): UserGoals {
  return {
    weightTarget,
    kcalTarget: b.split.kcal,
    carbsTarget: b.split.carbs,
    proteinTarget: b.split.protein,
    fatTarget: b.split.fat,
  };
}

/** Validazione dello step 1 del wizard. Non lancia mai: ritorna false. */
export function isProfileStepValid(p: Partial<UserProfile>): boolean {
  if (!p.name || p.name.trim().length === 0) return false;
  if (typeof p.age !== "number" || p.age < 16 || p.age > 100) return false;
  if (typeof p.height !== "number" || p.height < 120 || p.height > 230) return false;
  if (typeof p.weight !== "number" || p.weight < 30 || p.weight > 300) return false;
  if (p.sex !== "M" && p.sex !== "F") return false;
  if (
    p.activity !== "sedentary" &&
    p.activity !== "light" &&
    p.activity !== "moderate" &&
    p.activity !== "active" &&
    p.activity !== "veryActive"
  ) {
    return false;
  }
  return true;
}
