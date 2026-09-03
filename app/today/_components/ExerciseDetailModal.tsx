"use client";

import Modal from "./Modal";
import BodyRecoveryMap from "./BodyRecoveryMap";
import { muscleGroupLabels, equipmentLabels } from "../_lib/exerciseData";
import type { ExerciseDefinition, MuscleGroup } from "../_lib/types";

/**
 * Scheda di dettaglio di un esercizio: silhouette anatomica (primario/
 * secondario) + istruzioni tecniche. Riusa <Modal> (stesso pattern di
 * CustomExerciseForm/ExercisePicker), mai un <dialog> nuovo.
 *
 * Layout a 2 colonne su desktop (silhouette centrata a sinistra, istruzioni
 * con scroll dedicato a destra) per evitare che l'intero modal debba
 * scrollare in verticale — solo la colonna istruzioni scrolla al suo interno.
 *
 * Funziona SEMPRE, anche sui custom senza instructions: la silhouette usa
 * direttamente primaryMuscle/secondaryMuscles (sempre presenti su
 * ExerciseDefinition), e la sezione istruzioni mostra un messaggio
 * discreto invece di restare vuota quando instructions è assente.
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

const PRIMARY_COLOR = "#EF4444"; // rosso pieno: muscolo primario
const SECONDARY_COLOR = "#F59E0B"; // ambra: muscoli secondari

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

  // Colore per gruppo: il primario sovrascrive un eventuale duplicato nei
  // secondari (mai il contrario), così un muscolo non finisce mai in ambra
  // quando è anche il primario.
  const colorByMuscle: Partial<Record<MuscleGroup, string>> = {};
  for (const m of exercise.secondaryMuscles) colorByMuscle[m] = SECONDARY_COLOR;
  colorByMuscle[exercise.primaryMuscle] = PRIMARY_COLOR;

  const instructions = exercise.instructions;
  // Fallback implicito "intermedio" quando level è assente (esercizi custom
  // e vecchi esercizi del catalogo che non lo valorizzano).
  const levelLabel = LEVEL_LABELS[exercise.level ?? "intermedio"];

  return (
    <Modal open={open} onClose={onClose} title={exercise.name} size="xl">
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

        {/* 2 colonne su desktop: sagoma centrata a sx, istruzioni con scroll proprio a dx. */}
        <div className="grid gap-5 md:h-[65vh] md:grid-cols-[260px_1fr]">
          <div className="flex flex-col items-center justify-center gap-3 md:h-full">
            <div className="rounded-2xl bg-[#0F172A] p-4">
              <BodyRecoveryMap
                colorByMuscle={colorByMuscle}
                srLabel={`Sagoma del corpo con i muscoli coinvolti in ${exercise.name}: primario in rosso, secondari in ambra.`}
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-fg-secondary">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                  aria-hidden="true"
                />
                Primario
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-fg-secondary">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: SECONDARY_COLOR }}
                  aria-hidden="true"
                />
                Secondario
              </span>
            </div>
          </div>

          <div className="space-y-4 border-t border-border-subtle pt-4 md:h-full md:overflow-y-auto md:border-t-0 md:pt-0 md:pl-1">
            {instructions ? (
              <>
                <InstructionSection title="Setup" items={instructions.setup} />
                <InstructionSection title="Fase concentrica" items={instructions.concentric} />
                <InstructionSection title="Fase eccentrica" items={instructions.eccentric} />
                <InstructionSection title="Errori comuni" items={instructions.commonMistakes} />
              </>
            ) : (
              <p className="text-sm text-fg-secondary/60">
                Istruzioni tecniche non disponibili per questo esercizio.
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
