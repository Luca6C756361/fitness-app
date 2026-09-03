import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import WeekView from "./_components/WeekView";
import SessionList from "./_components/SessionList";

/** Pagina /scheda — editor completo del piano allenamento. */
export default function SchedaPage() {
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
            <h1 className="text-2xl font-bold tracking-tight text-fg-primary">
              Scheda
            </h1>
            <p className="text-sm font-medium text-fg-secondary">
              Gestisci sessioni e piano settimanale
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <WeekView />
          <SessionList />
        </div>
      </div>
    </main>
  );
}
