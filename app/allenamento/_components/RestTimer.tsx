"use client";

import { useEffect, useState } from "react";
import { Timer, X, Plus } from "lucide-react";
import { formatTime } from "./SessionTimer";

/**
 * Timer di recupero tra serie.
 * - Preset: 60, 90, 120, 180 secondi
 * - Compare quando la pagina genitore chiama startRest()
 * - Fa un beep alla fine (Web Audio API, senza file esterni)
 */

interface RestTimerProps {
  /** Se > 0, il timer parte con questo valore. */
  active: number | null;
  onCancel: () => void;
  onEnd: () => void;
  /** Aggiunge secondi al timer in corso. */
  onExtend?: (extraSec: number) => void;
}

const PRESETS = [60, 90, 120, 180];

export default function RestTimer({
  active,
  onCancel,
  onEnd,
  onExtend,
}: RestTimerProps) {
  const [remaining, setRemaining] = useState<number>(active ?? 0);

  // Ogni volta che active cambia (nuovo timer avviato), resetta il conteggio
  useEffect(() => {
    if (active !== null) setRemaining(active);
  }, [active]);

  useEffect(() => {
    if (active === null || remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(interval);
          playBeep();
          onEnd();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [active, remaining, onEnd]);

  if (active === null) return null;

  const progress = active > 0 ? ((active - remaining) / active) * 100 : 0;

    return (
    <div className="fixed inset-x-4 bottom-20 z-40 mx-auto max-w-md rounded-2xl border-2 border-[var(--kh-primary)] bg-[var(--kh-canvas)] p-4 shadow-[var(--kh-glow-primary)] md:bottom-6 md:left-64">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-[var(--kh-primary)]" />
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--kh-ink)]">
            Recupero
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-1 text-[var(--kh-ink-subtle)] transition hover:bg-[var(--kh-surface-2)] hover:text-[var(--kh-ink)]"
          aria-label="Annulla recupero"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mb-2 text-center font-mono text-3xl font-bold text-[var(--kh-ink)] tabular-nums">
        {formatTime(remaining)}
      </p>

      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[var(--kh-surface-2)]">
        <div
          className="h-full rounded-full bg-[var(--kh-primary)] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {onExtend && (
        <button
          type="button"
          onClick={() => onExtend(15)}
          className="w-full rounded-xl bg-[var(--kh-surface-2)] py-2 text-xs font-bold text-[var(--kh-ink)] transition hover:bg-[var(--kh-hairline)]"
        >
          <Plus className="mr-1 inline h-3.5 w-3.5" />
          Aggiungi 15s
        </button>
      )}
    </div>
  );
}

/** Suona un breve beep senza file audio (Web Audio API). */
function playBeep() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    /* silenzio se audio bloccato */
  }
}

/** Preset esportati per uso nel selettore. */
export { PRESETS as REST_PRESETS };
