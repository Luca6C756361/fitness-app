"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import Modal from "../../today/_components/Modal";
import { usePlan } from "../../today/_lib/PlanContext";
import { muscleGroupLabels, equipmentLabels } from "../../today/_lib/exerciseData";
import {
  validateExercise,
  validationMessages,
  normalizeName,
  type CustomExerciseInput,
  type ValidationError,
} from "../../today/_lib/customExercises";
import type { ExerciseDefinition, MuscleGroup, Equipment } from "../../today/_lib/types";

/** Le opzioni si generano da exerciseData.ts: nessuna lista hardcodata qui. */
const MUSCLE_OPTIONS = Object.keys(muscleGroupLabels) as MuscleGroup[];
const EQUIPMENT_OPTIONS = Object.keys(equipmentLabels) as Equipment[];

interface CustomExerciseFormProps {
  open: boolean;
  onClose: () => void;
  /** Per selezionarlo subito dopo la creazione. */
  onCreated?: (ex: ExerciseDefinition) => void;
}

export default function CustomExerciseForm({
  open,
  onClose,
  onCreated,
}: CustomExerciseFormProps) {
  const { exercises, createExercise } = usePlan();

  const [name, setName] = useState("");
  const [primaryMuscle, setPrimaryMuscle] = useState<MuscleGroup | null>(null);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [secondaryMuscles, setSecondaryMuscles] = useState<MuscleGroup[]>([]);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<ValidationError | "network" | null>(null);

  useEffect(() => {
    if (!open) return;
    setName("");
    setPrimaryMuscle(null);
    setEquipment(null);
    setSecondaryMuscles([]);
    setSaving(false);
    setSubmitError(null);
  }, [open]);

  const toggleSecondary = (m: MuscleGroup) => {
    setSecondaryMuscles((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  // Validazione live: solo quando i due campi obbligatori a chip sono scelti
  // (senza di essi CustomExerciseInput non è ancora costruibile).
  const liveError: ValidationError | null =
    primaryMuscle && equipment
      ? validateExercise(
          { name, primaryMuscle, equipment, secondaryMuscles: [...secondaryMuscles] },
          exercises
        )
      : null;

  const displayError = submitError ?? liveError;

  const duplicateMatch =
    displayError === "duplicate"
      ? exercises.find((e) => normalizeName(e.name) === normalizeName(name))
      : undefined;

  const errorMessage =
    displayError === "duplicate"
      ? duplicateMatch
        ? `Esiste già "${duplicateMatch.name}".`
        : validationMessages.duplicate
      : displayError === "network"
        ? "Esercizio non salvato: controlla la connessione."
        : displayError
          ? validationMessages[displayError]
          : null;

  const canSubmit = !saving && !!primaryMuscle && !!equipment && !liveError;

  const handleSubmit = async () => {
    if (!primaryMuscle || !equipment) return;

    setSaving(true);
    setSubmitError(null);

    const input: CustomExerciseInput = {
      name: name.trim(),
      primaryMuscle,
      equipment,
      secondaryMuscles,
    };
    const result = await createExercise(input);

    setSaving(false);

    if (result.ok && result.exercise) {
      onCreated?.(result.exercise);
      onClose();
      return;
    }

    setSubmitError(result.error ?? "network");
  };

  return (
    <Modal open={open} onClose={onClose} title="Crea esercizio">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-emerald-800/70">
            Nome
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="Es. Panca Scott"
            className="w-full rounded-xl border border-emerald-900/10 bg-white px-3 py-2 text-sm text-emerald-950 placeholder:text-emerald-800/30 outline-none focus:ring-2 focus:ring-emerald-300"
          />
          {errorMessage && (
            <p className="mt-1 text-xs font-medium text-red-600">{errorMessage}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-emerald-800/70">
            Gruppo primario
          </label>
          <div className="flex flex-wrap gap-2">
            {MUSCLE_OPTIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setPrimaryMuscle(m)}
                className={`rounded-full px-3 py-2 text-[11px] font-bold transition ${
                  primaryMuscle === m
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-800/70 hover:bg-emerald-100"
                }`}
              >
                {muscleGroupLabels[m]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-emerald-800/70">
            Attrezzatura
          </label>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map((eq) => (
              <button
                key={eq}
                type="button"
                onClick={() => setEquipment(eq)}
                className={`rounded-full px-3 py-2 text-[11px] font-bold transition ${
                  equipment === eq
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-800/70 hover:bg-emerald-100"
                }`}
              >
                {equipmentLabels[eq]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-emerald-800/70">
            Gruppi secondari (opzionale)
          </label>
          <div className="flex flex-wrap gap-2">
            {MUSCLE_OPTIONS.filter((m) => m !== primaryMuscle).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => toggleSecondary(m)}
                className={`rounded-full px-3 py-2 text-[11px] font-bold transition ${
                  secondaryMuscles.includes(m)
                    ? "bg-teal-600 text-white"
                    : "bg-emerald-50 text-emerald-800/70 hover:bg-emerald-100"
                }`}
              >
                {muscleGroupLabels[m]}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {submitError === "network" ? "Riprova" : "Crea esercizio"}
        </button>
      </div>
    </Modal>
  );
}
