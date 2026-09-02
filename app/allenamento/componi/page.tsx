"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { usePlan } from "../../today/_lib/PlanContext";
import type { ExerciseDefinition } from "../../today/_lib/types";
import ExerciseBrowser from "./_components/ExerciseBrowser";
import CompositionCart from "./_components/CompositionCart";

/**
 * Pagina composizione allenamento.
 * L'utente pesca esercizi dal DB (a sinistra) e li mette nel carrello (a destra).
 * Al salvataggio: composeToday() sostituisce la proposta della scheda per oggi
 * e reindirizza al workout.
 */

interface CartItem {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
}

export default function ComponiPage() {
  const { exercises, composeToday, deleteExercise } = usePlan();
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [sessionName, setSessionName] = useState("Sessione personalizzata");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);

  const handleDeleteExercise = async (id: string) => {
    setDeletingId(id);
    setDeleteWarning(null);
    const result = await deleteExercise(id);
    setDeletingId(null);
    if (!result.ok && result.usedIn) {
      setDeleteWarning(
        `Usato in: ${result.usedIn.join(", ")}. Rimuovilo da quelle sessioni prima di eliminarlo.`
      );
    }
  };

  const addExercise = (ex: ExerciseDefinition) => {
    // Evita duplicati: se già presente, non aggiunge
    if (items.some((i) => i.exerciseId === ex.id)) return;
    setItems((prev) => [
      ...prev,
      {
        id: `ce-${Date.now()}-${ex.id}`,
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: 3,
        reps: 10,
      },
    ]);
  };

  const updateItem = (id: string, patch: Partial<CartItem>) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...patch } : i))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const save = (name: string) => {
    if (items.length === 0) return;
    // Converto CartItem → PlannedExercise (senza exerciseName, che è solo cache UI)
    const planned = items.map((i) => ({
      id: i.id,
      exerciseId: i.exerciseId,
      sets: i.sets,
      reps: i.reps,
    }));
    composeToday(planned, name.trim() || "Sessione personalizzata");
    router.push("/today");
  };

  return (
    <main className="min-h-screen bg-[#FAF7F0] px-4 py-6 pb-24 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/today"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-900/10 bg-white shadow-sm transition hover:bg-emerald-50"
            aria-label="Torna alla dashboard"
          >
            <ArrowLeft className="h-4 w-4 text-emerald-800" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-emerald-950">
              Componi allenamento
            </h1>
            <p className="text-sm font-medium text-emerald-800/60">
              Costruisci la sessione di oggi dal database esercizi
            </p>
          </div>
        </div>

        {deleteWarning && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs font-medium text-amber-900">{deleteWarning}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ExerciseBrowser
            exercises={exercises}
            onAdd={addExercise}
            addedIds={items.map((i) => i.exerciseId)}
            onDelete={handleDeleteExercise}
            deletingId={deletingId}
          />
          <CompositionCart
            items={items}
            onUpdate={updateItem}
            onRemove={removeItem}
            onSave={save}
            sessionName={sessionName}
            onSessionNameChange={setSessionName}
          />
        </div>
      </div>
    </main>
  );
}
