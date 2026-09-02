"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Timer, X, Plus, Maximize2, SkipForward } from "lucide-react";
import { formatTime } from "./SessionTimer";
import { useCountdown } from "../_lib/useDeadline";
import { useWakeLock } from "../_lib/useWakeLock";
import FocusShell from "./FocusShell";
import FocusButton from "./FocusButton";

/**
 * Timer di recupero tra serie.
 * - Preset: 60, 90, 120, 180 secondi
 * - Compare quando la pagina genitore chiama startRest()
 * - Fa un beep + vibrazione alla fine
 *
 * FOCUS: il countdown non è più `remaining - 1` per tick (throttlato in
 * background: è proprio il countdown che deve suonare puntuale), ma una
 * scadenza assoluta `endAt` gestita da useCountdown.
 */

interface RestTimerProps {
  /** Se > 0, il timer parte con questo valore. */
  active: number | null;
  onCancel: () => void;
  onEnd: () => void;
  /** Aggiunge secondi al timer in corso. */
  onExtend?: (extraSec: number) => void;
  /** Apre automaticamente il Focus quando parte un nuovo recupero. */
  focusByDefault?: boolean;
}

const PRESETS = [60, 90, 120, 180];

export default function RestTimer({
  active,
  onCancel,
  onEnd,
  onExtend,
  focusByDefault = false,
}: RestTimerProps) {
  const [endAt, setEndAt] = useState<number | null>(null);
  const [focus, setFocus] = useState(false);
  const prevActiveRef = useRef<number | null>(null);

  // Nuovo `active`: nuova scadenza assoluta. setState rimandato a un timer
  // 0ms (setState non sincrono nel corpo dell'effetto).
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setEndAt(active === null ? null : Date.now() + active * 1000);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [active]);

  // Apertura automatica del Focus quando un nuovo recupero parte
  // (active passa da null a un numero), solo se richiesto dal chiamante.
  useEffect(() => {
    const isNewStart = focusByDefault && prevActiveRef.current === null && active !== null;
    prevActiveRef.current = active;
    if (!isNewStart) return;
    const timer = window.setTimeout(() => setFocus(true), 0);
    return () => window.clearTimeout(timer);
  }, [active, focusByDefault]);

  const handleEnd = useCallback(() => {
    playBeep();
    vibrate();
    onEnd();
  }, [onEnd]);

  const { remaining } = useCountdown(endAt, handleEnd);
  const { active: wakeActive } = useWakeLock(focus);

  if (active === null) return null;

  const progress = active > 0 ? ((active - remaining) / active) * 100 : 0;

  return (
    <>
      <div className="fixed inset-x-4 bottom-20 z-40 mx-auto max-w-md rounded-2xl border border-teal-200 bg-white p-4 shadow-lg md:bottom-6 md:left-64">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-teal-600" />
            <p className="text-xs font-bold uppercase tracking-widest text-teal-700">
              Recupero
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFocus(true)}
              className="rounded-lg p-1 text-emerald-800/50 transition hover:bg-emerald-50 hover:text-emerald-800"
              aria-label="Modalità Focus recupero"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg p-1 text-emerald-800/50 transition hover:bg-emerald-50 hover:text-emerald-800"
              aria-label="Annulla recupero"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="mb-2 text-center font-mono text-3xl font-bold text-emerald-950 tabular-nums">
          {formatTime(remaining)}
        </p>

        {/* Barra progresso */}
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-teal-100">
          <div
            className="h-full rounded-full bg-teal-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Bottone +15s per estendere */}
        {onExtend && (
          <button
            type="button"
            onClick={() => onExtend(15)}
            className="w-full rounded-xl bg-teal-50 py-2 text-xs font-bold text-teal-700 transition hover:bg-teal-100"
          >
            <Plus className="mr-1 inline h-3.5 w-3.5" />
            Aggiungi 15s
          </button>
        )}
      </div>

      <FocusShell
        open={focus}
        label="Recupero"
        onExit={() => setFocus(false)}
        accent="amber"
        wakeLockActive={wakeActive}
      >
        <RestRing progress={progress} remaining={remaining} />
        <div className="flex w-full max-w-sm gap-3">
          <FocusButton
            onClick={() => onExtend?.(15)}
            icon={<Plus className="h-6 w-6" />}
            label="+15s"
            variant="primary"
          />
          <FocusButton
            onClick={() => {
              setFocus(false);
              onEnd();
            }}
            icon={<SkipForward className="h-6 w-6" />}
            label="Salta"
            variant="ghost"
          />
        </div>
      </FocusShell>
    </>
  );
}

const RING_RADIUS = 120;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Anello di progresso + countdown gigante del Focus recupero. */
function RestRing({ progress, remaining }: { progress: number; remaining: number }) {
  const urgent = remaining > 0 && remaining <= 5;
  return (
    <div className="relative flex items-center justify-center">
      <svg
        className="h-64 w-64 -rotate-90 md:h-72 md:w-72"
        viewBox="0 0 260 260"
        aria-hidden="true"
      >
        <circle cx="130" cy="130" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
        <circle
          cx="130"
          cy="130"
          r={RING_RADIUS}
          fill="none"
          stroke="#FFB020"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress / 100)}
          style={{ transition: "stroke-dashoffset 0.25s linear" }}
        />
      </svg>
      <p
        className={`absolute font-mono text-[clamp(4rem,22vw,9rem)] font-bold leading-none tabular-nums ${
          urgent ? "animate-pulse text-[#FFB020]" : "text-white"
        }`}
      >
        {formatTime(remaining)}
      </p>
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

/** Vibrazione best-effort a fine recupero: silenziosa se non supportata. */
function vibrate() {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  } catch {
    /* best-effort */
  }
}

/** Preset esportati per uso nel selettore. */
export { PRESETS as REST_PRESETS };
