"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FoodPicker from "./_components/FoodPicker";
import FoodDiary from "./_components/FoodDiary";
import { useDiary } from "../today/_lib/DiaryContext";

export default function NutritionPage() {
  const { addEntry, todayEntries, removeEntry, todayTotals } = useDiary();
  // Sollevato da FoodPicker: serve a FoodDiary per aprire lo scanner dalla
  // sua CTA dell'empty state (decisione 5, ONBOARDING_TASK.md).
  const [scannerOpen, setScannerOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#FAF7F0] px-4 py-6 pb-24 md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl space-y-6">
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
              Nutrizione
            </h1>
            <p className="text-sm font-medium text-emerald-800/60">
              Database alimenti e diario giornaliero
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <FoodPicker
            onAdd={addEntry}
            scannerOpen={scannerOpen}
            onScannerOpenChange={setScannerOpen}
          />
          <FoodDiary
            entries={todayEntries}
            totals={todayTotals}
            onRemove={removeEntry}
            onStartScan={() => setScannerOpen(true)}
          />
        </div>
      </div>
    </main>
  );
}
