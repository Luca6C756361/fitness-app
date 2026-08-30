"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppearanceSection from "./_components/AppearanceSection";
import UnitsSection from "./_components/UnitsSection";
import LanguageSection from "./_components/LanguageSection";
import NotificationsSection from "./_components/NotificationsSection";
import ResetSection from "./_components/ResetSection";

/** Pagina /impostazioni — preferenze utente. */
export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-[var(--kh-canvas)] px-4 py-6 pb-24 md:px-8 md:py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/today"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] shadow-[var(--kh-card-shadow)] transition hover:border-[var(--kh-primary)] hover:text-[var(--kh-primary)]"
            aria-label="Torna alla dashboard"
          >
            <ArrowLeft className="h-4 w-4 text-[var(--kh-ink)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--kh-ink)]">
              Impostazioni
            </h1>
            <p className="text-sm font-medium text-[var(--kh-ink-muted)]">
              Personalizza la tua esperienza
            </p>
          </div>
        </div>

        <AppearanceSection />
        <UnitsSection />
        <LanguageSection />
        <NotificationsSection />
        <ResetSection />
      </div>
    </main>
  );
}