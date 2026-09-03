"use client";

import Modal from "./Modal";
import ExerciseMediaSlot from "./ExerciseMediaSlot";
import MuscleMapSvg from "./MuscleMapSvg";
import { resolveMuscleMap } from "../_lib/muscleAnatomy";
import { muscleGroupLabels, equipmentLabels } from "../_lib/exerciseData";
import type { ExerciseDefinition } from "../_lib/types";

/**
 * Scheda di dettaglio di un esercizio: mappa anatomica + istruzioni tecniche
 * + demo (se presente). Riusa <Modal> (stesso pattern di CustomExerciseForm/
 * ExercisePicker), mai un <dialog> nuovo.
 *
 * Funziona SEMPRE, anche sui custom senza instructions/muscleMap: resolveMuscleMap()
 * garantisce una mappa via fallback, e la sezione istruzioni si nasconde con
 * garbo (mai vuota/rotta) quando instructions è assente.
 */

interface ExerciseDetailModalProps {
  open: boolean;
  onClose: () => void;
  /** undefined = non renderizzare nulla (nessun modal vuoto). */
  exercise: ExerciseDefinition | undefined;
}

const LEVEL_LABELS: Record<NonNullable<ExerciseDefinition["level"]>, string> = {
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzato: "Avanzato",
};

function InstructionSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="mb-1.5 text-xs font-bold uppercase tracking-widest text-fg-secondary">
        {title}
      </h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-fg-primary">
            <span aria-hidden="true" className="text-fg-muted">
              &middot;
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ExerciseDetailModal({
  open,
  onClose,
  exercise,
}: ExerciseDetailModalProps) {
  if (!exercise) return null;

  const { primary, secondary } = resolveMuscleMap(exercise);
  const instructions = exercise.instructions;
  // Fallback implicito "intermedio" quando level è assente (esercizi custom
  // e vecchi esercizi del catalogo che non lo valorizzano).
  const levelLabel = LEVEL_LABELS[exercise.level ?? "intermedio"];

  return (
    <Modal open={open} onClose={onClose} title={exercise.name} size="lg">
      <div className="space-y-5">
        {/* Pill gruppo muscolare / attrezzatura / livello — stesso stile delle chip esistenti */}
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-fg-secondary">
            {muscleGroupLabels[exercise.primaryMuscle] ?? exercise.primaryMuscle}
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-fg-secondary">
            {equipmentLabels[exercise.equipment] ?? exercise.equipment}
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-fg-secondary">
            {levelLabel}
          </span>
          {exercise.source === "custom" && (
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase text-teal-700">
              Custom
            </span>
          )}
        </div>

        {/* Mappa anatomica: funziona sempre, anche sui custom (fallback) */}
        <MuscleMapSvg primary={primary} secondary={secondary} className="py-2" />

        {/* Demo esecuzione: lazy per costruzione — <Modal> non monta i children
            quando open === false, quindi ExerciseMediaSlot (e il suo <video
            preload="none">) non esiste nel DOM finché il modal non è aperto. */}
        <ExerciseMediaSlot media={exercise.media} name={exercise.name} />

        {/* Istruzioni tecniche: assenti sui custom → sezione nascosta, mai vuota/rotta */}
        {instructions && (
          <div className="space-y-4 border-t border-border-subtle pt-4">
            <InstructionSection title="Setup" items={instructions.setup} />
            <InstructionSection title="Fase concentrica" items={instructions.concentric} />
            <InstructionSection title="Fase eccentrica" items={instructions.eccentric} />
            <InstructionSection title="Errori comuni" items={instructions.commonMistakes} />
          </div>
        )}
      </div>
    </Modal>
  );
}
