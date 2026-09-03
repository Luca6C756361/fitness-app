"use client";

import Modal from "./Modal";
import MuscleMapSvg from "./MuscleMapSvg";
import ExerciseMediaSlot from "./ExerciseMediaSlot";
import { muscleGroupLabels, equipmentLabels } from "../_lib/exerciseData";
import { resolveMuscleMap } from "../_lib/muscleAnatomy";
import type { ExerciseDefinition } from "../_lib/types";

/**
 * Scheda di dettaglio di un esercizio: demo video, mappa anatomica fake-3D
 * (primario/secondario) + istruzioni tecniche. Riusa <Modal> (stesso
 * pattern di CustomExerciseForm/ExercisePicker), mai un <dialog> nuovo.
 *
 * Layout a 2 colonne su desktop per evitare che l'intero modal debba
 * scrollare in verticale: colonna sinistra (video + mappa, con scroll
 * proprio se il contenuto eccede l'altezza), colonna destra (istruzioni,
 * scroll dedicato). Su mobile le due colonne collassano nell'ordine
 * Top (video) → Middle (mappa + legenda) → Bottom (istruzioni).
 *
 * Funziona SEMPRE, anche sui custom senza instructions/muscleMap/media:
 * resolveMuscleMap() deriva un fallback da primaryMuscle/secondaryMuscles,
 * ExerciseMediaSlot mostra un placeholder "Demo in arrivo" quando media è
 * assente, e la sezione istruzioni mostra un messaggio discreto invece di
 * restare vuota quando instructions è assente.
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

  // muscleMap esplicito se presente sull'esercizio, altrimenti fallback
  // derivato da primaryMuscle/secondaryMuscles (sempre presenti).
  const muscleMap = resolveMuscleMap(exercise);

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

        {/* 2 colonne su desktop: video + mappa con scroll proprio a sx, istruzioni con scroll proprio a dx. */}
        <div className="grid gap-5 md:h-[65vh] md:grid-cols-[280px_1fr]">
          {/* Top: demo video. Middle: mappa anatomica fake-3D + legenda. */}
          <div className="flex flex-col gap-4 md:h-full md:overflow-y-auto md:pr-1">
            <ExerciseMediaSlot media={exercise.media} name={exercise.name} />

            {/*
              bg-surface (bianco/quasi-bianco anche in dark mode), NON lo sfondo
              scuro usato da BodyRecoveryMap: --anatomy-primary/secondary sono
              contrastati contro bianco (vedi globals.css), e mix-blend-multiply
              su MuscleMapSvg richiede un fondo chiaro dietro l'SVG — su un fondo
              scuro il multiply annullerebbe i colori invece di evidenziarli.
            */}
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border-subtle bg-surface p-4">
              <MuscleMapSvg primary={muscleMap.primary} secondary={muscleMap.secondary} />
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-fg-secondary">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: "var(--anatomy-primary)" }}
                    aria-hidden="true"
                  />
                  Primario
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-fg-secondary">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: "var(--anatomy-secondary)" }}
                    aria-hidden="true"
                  />
                  Secondario
                </span>
              </div>
            </div>
          </div>

          {/* Bottom: istruzioni step-by-step. */}
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
