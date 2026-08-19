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
    <section className="rounded-2xl border border-red-200/50 bg-red-50/30 p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-red-700/80">
          Zona pericolosa
        </h2>
      </div>

      <p className="mb-4 text-sm text-red-900/70">
        Il reset cancella <strong>profilo, obiettivi, diario, peso e allenamenti</strong>{" "}
        dal server. L'operazione è irreversibile.
      </p>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-white py-3 text-sm font-bold text-red-700 transition hover:bg-red-50"
        >
          <RotateCcw className="h-4 w-4" />
          Reset app
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-bold text-red-800">Sei sicuro?</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-xl border border-emerald-900/10 bg-white py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
            >
              Annulla
            </button>
            <button
              type="button"
              disabled={resetting}                                   // <-- NUOVO
              onClick={async () => {                                 // <-- MODIFICATO
                setResetting(true);
                await resetAll();
              }}
              className="rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
            >
              {resetting ? "Reset in corso…" : "Sì, resetta"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
