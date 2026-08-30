"use client";

import { useState } from "react";
import { RotateCcw, AlertTriangle } from "lucide-react";
import { useSettings } from "../../today/_lib/SettingsContext";

/** Sezione reset con conferma esplicita. */
export default function ResetSection() {
  const { resetAll } = useSettings();
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);

  return (
    <section className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 shadow-[var(--kh-card-shadow)]">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-red-500">
          Zona pericolosa
        </h2>
      </div>

      <p className="mb-4 text-sm text-[var(--kh-ink-muted)]">
        Il reset cancella <strong className="text-[var(--kh-ink)]">profilo, obiettivi, diario, peso e allenamenti</strong>{" "}
        dal server. L'operazione è irreversibile.
      </p>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-[var(--kh-surface-1)] py-3 text-sm font-bold text-red-500 transition hover:bg-red-500/10"
        >
          <RotateCcw className="h-4 w-4" />
          Reset app
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-bold text-red-500">Sei sicuro?</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] py-3 text-sm font-bold text-[var(--kh-ink-muted)] transition hover:text-[var(--kh-ink)]"
            >
              Annulla
            </button>
            <button
              type="button"
              disabled={resetting}
              onClick={async () => {
                setResetting(true);
                await resetAll();
              }}
              className="rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {resetting ? "Reset in corso…" : "Sì, resetta"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}