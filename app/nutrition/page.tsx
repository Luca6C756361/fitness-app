"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FoodPicker from "./_components/FoodPicker";
import FoodDiary from "./_components/FoodDiary";
import { useDiary } from "../today/_lib/DiaryContext";

export default function NutritionPage() {
  const { addEntry, todayEntries, removeEntry, todayTotals } = useDiary();

  return (
    <main className="min-h-screen bg-[var(--kh-canvas)] px-4 py-6 pb-24 md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/today"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] transition hover:bg-[var(--kh-surface-2)]"
            aria-label="Torna alla dashboard"
          >
            <ArrowLeft className="h-4 w-4 text-[var(--kh-ink)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--kh-ink)]">
              Nutrizione
            </h1>
            <p className="text-sm font-medium text-[var(--kh-ink-muted)]">
              Database alimenti e diario giornaliero
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <FoodPicker onAdd={addEntry} />
          <FoodDiary
            entries={todayEntries}
            totals={todayTotals}
            onRemove={removeEntry}
          />
        </div>
      </div>
    </main>
  );
}