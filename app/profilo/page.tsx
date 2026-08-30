"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useUser } from "../today/_lib/UserContext";
import ProfileForm from "./_components/ProfileForm";
import GoalsForm from "./_components/GoalsForm";
import StatsCard from "./_components/StatsCard";
import WeightHistoryChart from "./_components/WeightHistoryChart";

export default function ProfilePage() {
  const { profile } = useUser();

  return (
    <main className="min-h-screen bg-[var(--kh-canvas)] px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Back link */}
        <Link
          href="/today"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] shadow-[var(--kh-card-shadow)] transition hover:border-[var(--kh-primary)] hover:text-[var(--kh-primary)]"
          aria-label="Torna alla dashboard"
        >
          <ArrowLeft className="h-4 w-4 text-[var(--kh-ink)]" />
        </Link>

        {/* Intestazione centrata con avatar grande */}
        <div className="flex flex-col items-center text-center">
          <img
            src={profile.avatar}
            alt={`Foto profilo di ${profile.name}`}
            className="h-24 w-24 rounded-full border-4 border-[var(--kh-surface-1)] object-cover shadow-[var(--kh-card-shadow)]"
          />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[var(--kh-ink)]">
            {profile.name}
          </h1>
          <p className="text-sm font-medium text-[var(--kh-ink-subtle)]">
            Membro dal 2026 · {profile.age} anni
          </p>
        </div>

        <StatsCard />
        <WeightHistoryChart />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ProfileForm />
          <GoalsForm />
        </div>
      </div>
    </main>
  );
}