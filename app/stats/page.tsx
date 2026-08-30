"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import KcalWeekChart from "./_components/KcalWeekChart";
import WeightRangeChart from "./_components/WeightRangeChart";
import WorkoutStreakCard from "./_components/WorkoutStreakCard";
import VolumeChart from "./_components/VolumeChart";
import PersonalRecordsCard from "./_components/PersonalRecordsCard";

export default function StatsPage() {
  return (
    <main className="min-h-screen bg-[var(--kh-canvas)] px-4 py-6 pb-24 md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/today"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] shadow-[var(--kh-card-shadow)] transition hover:bg-[var(--kh-surface-2)]"
            aria-label="Torna alla dashboard"
          >
            <ArrowLeft className="h-4 w-4 text-[var(--kh-ink)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--kh-ink)]">
              Statistiche
            </h1>
            <p className="text-sm font-medium text-[var(--kh-ink-muted)]">
              L&apos;andamento nel tempo
            </p>
          </div>
        </div>

        <WorkoutStreakCard />
        <KcalWeekChart />
        <WeightRangeChart />
        <VolumeChart />
        <PersonalRecordsCard />
      </div>
    </main>
  );
}