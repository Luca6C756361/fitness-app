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
    <main className="min-h-screen bg-[#FAF7F0] px-4 py-6 pb-24 md:px-8 md:py-10">
      <div className="mx-auto max-w-3xl space-y-6">
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
              Impostazioni
            </h1>
            <p className="text-sm font-medium text-emerald-800/60">
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
