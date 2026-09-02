/**
 * Livello dati degli esercizi custom: validazione pura, mapping DB↔dominio,
 * fusione con il catalogo statico, funzioni di rete verso Supabase.
 * Nessun import React: consumato da PlanContext (stato) e dai form (validazione).
 */

import { supabase } from "../../_lib/supabase/client";
import { muscleGroupLabels, equipmentLabels } from "./exerciseData";
import type { ExerciseDefinition, MuscleGroup, Equipment } from "./types";

export const CUSTOM_CACHE_KEY = "fitness-app:customExercises";

/** Chiave di confronto: trim, lowercase, spazi collassati, diacritici rimossi. */
export function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export interface CustomExerciseInput {
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment;
}

export type ValidationError =
  | "name_too_short"
  | "name_too_long"
  | "duplicate"
  | "invalid_muscle"
  | "invalid_equipment";

export const validationMessages: Record<ValidationError, string> = {
  name_too_short: "Il nome deve avere almeno 2 caratteri.",
  name_too_long: "Il nome non può superare 60 caratteri.",
  duplicate: "Esiste già un esercizio con questo nome.",
  invalid_muscle: "Gruppo muscolare non valido.",
  invalid_equipment: "Attrezzatura non valida.",
};

/**
 * Validazione pura, usata dal form PRIMA di chiamare la rete.
 * `existing` = lista FUSA (statici + custom): copre anche i 36 statici, che il DB non conosce.
 */
export function validateExercise(
  input: CustomExerciseInput,
  existing: ExerciseDefinition[]
): ValidationError | null {
  const normalized = normalizeName(input.name);

  if (normalized.length < 2) return "name_too_short";
  if (normalized.length > 60) return "name_too_long";

  const isDuplicate = existing.some((e) => normalizeName(e.name) === normalized);
  if (isDuplicate) return "duplicate";

  if (!(input.primaryMuscle in muscleGroupLabels)) return "invalid_muscle";
  if (!(input.equipment in equipmentLabels)) return "invalid_equipment";

  // Gruppi secondari: dedup + rimozione dell'eventuale primario. Non è un errore.
  input.secondaryMuscles = Array.from(new Set(input.secondaryMuscles)).filter(
    (m) => m !== input.primaryMuscle
  );

  return null;
}

/** Riga grezza restituita da Supabase (snake_case). */
interface CustomExerciseRow {
  id: string;
  user_id: string | null;
  name: string;
  primary_muscle: string;
  secondary_muscles: string[];
  equipment: string;
  created_at: string;
}

const CUSTOM_EXERCISE_COLUMNS =
  "id, user_id, name, primary_muscle, secondary_muscles, equipment, created_at";

/** Riga DB → ExerciseDefinition. snake_case → camelCase, source sempre "custom". */
export function rowToExercise(row: CustomExerciseRow): ExerciseDefinition {
  return {
    id: row.id,
    name: row.name,
    primaryMuscle: row.primary_muscle as MuscleGroup,
    secondaryMuscles: (row.secondary_muscles ?? []) as MuscleGroup[],
    equipment: row.equipment as Equipment,
    source: "custom",
    createdAt: row.created_at,
  };
}

/** Fusione: statici + custom, dedup per id, ordinati per nome (localeCompare "it"). */
export function mergeExercises(
  base: ExerciseDefinition[],
  custom: ExerciseDefinition[]
): ExerciseDefinition[] {
  const seen = new Set<string>();
  const merged: ExerciseDefinition[] = [];
  for (const ex of [...base, ...custom]) {
    if (seen.has(ex.id)) continue;
    seen.add(ex.id);
    merged.push(ex);
  }
  return merged.sort((a, b) => a.name.localeCompare(b.name, "it"));
}

/** I miei esercizi custom + quelli globali (user_id IS NULL). Non lancia mai: la UI non deve rompersi. */
export async function fetchCustomExercises(userId: string): Promise<ExerciseDefinition[]> {
  const { data, error } = await supabase
    .from("custom_exercises")
    .select(CUSTOM_EXERCISE_COLUMNS)
    .or(`user_id.eq.${userId},user_id.is.null`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[exercises]", error.message);
    return [];
  }

  return ((data ?? []) as unknown as CustomExerciseRow[]).map(rowToExercise);
}

export async function insertCustomExercise(
  userId: string,
  input: CustomExerciseInput
): Promise<{ exercise?: ExerciseDefinition; error?: "duplicate" | "network" }> {
  const { data, error } = await supabase
    .from("custom_exercises")
    .insert({
      user_id: userId,
      name: input.name.trim(),
      primary_muscle: input.primaryMuscle,
      secondary_muscles: input.secondaryMuscles,
      equipment: input.equipment,
    })
    .select(CUSTOM_EXERCISE_COLUMNS)
    .single();

  if (error) {
    // Race tra due tab: il vincolo DB è l'ultima difesa contro un duplicato.
    if (error.code === "23505") return { error: "duplicate" };
    console.error("[exercises]", error.message);
    return { error: "network" };
  }

  return { exercise: rowToExercise(data as unknown as CustomExerciseRow) };
}

/** Il doppio filtro (id + user_id) è obbligatorio: PostgREST rifiuta le DELETE senza filtro. */
export async function deleteCustomExercise(userId: string, id: string): Promise<boolean> {
  const { error } = await supabase
    .from("custom_exercises")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("[exercises]", error.message);
    return false;
  }

  return true;
}
