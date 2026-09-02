"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ArrowLeft, X } from "lucide-react";

interface FirstRunHintProps {
  id: string; // chiave localStorage
  text: string;
  /** "up": ArrowUp su mobile, ArrowLeft da lg in su, con bounce. "left": sempre ArrowLeft, senza bounce. */
  arrow?: "up" | "left" | "none";
  children?: React.ReactNode; // slot per una CTA
}

const STORAGE_KEY = "fitapp:hints:seen";

function readSeen(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return []; // modalità privata o storage inaccessibile: nessun hint segnato come visto
  }
}

function writeSeen(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* non grave: l'hint tornerà a mostrarsi al prossimo giro */
  }
}

/** Hint dismissibile per la prima interazione. Riusabile, persistenza in localStorage. */
export default function FirstRunHint({ id, text, arrow = "none", children }: FirstRunHintProps) {
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Leggere localStorage nel corpo del componente causerebbe hydration
    // mismatch (il server non ce l'ha): si legge SOLO qui, mai durante il render.
    window.setTimeout(() => {
      setDismissed(readSeen().includes(id));
      setReady(true);
    }, 0);
  }, [id]);

  const handleDismiss = () => {
    setDismissed(true);
    const seen = readSeen();
    if (!seen.includes(id)) writeSeen([...seen, id]);
  };

  // Finché non abbiamo letto localStorage, niente: evita il flash del box.
  if (!ready || dismissed) return null;

  return (
    <div className="relative rounded-xl border border-teal-200 bg-teal-50 p-3 text-xs text-teal-900">
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Nascondi suggerimento"
        className="absolute right-2 top-2 rounded-lg p-1 text-teal-700/60 transition hover:bg-teal-100 hover:text-teal-900"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-start gap-2 pr-6">
        {arrow === "up" && (
          <>
            <ArrowUp className="mt-0.5 block h-4 w-4 shrink-0 animate-bounce lg:hidden" />
            <ArrowLeft className="mt-0.5 hidden h-4 w-4 shrink-0 lg:block" />
          </>
        )}
        {arrow === "left" && <ArrowLeft className="mt-0.5 h-4 w-4 shrink-0" />}

        <div>
          <p>{text}</p>
          {children && <div className="mt-2">{children}</div>}
        </div>
      </div>
    </div>
  );
}
