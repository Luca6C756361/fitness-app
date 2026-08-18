"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Square, RotateCcw } from "lucide-react";

/**
 * Timer di sessione con pause/resume/stop/reset.
 *
 * FIX: onTick viene chiamato in un useEffect separato che reagisce al cambio
 * di `seconds`. Prima era chiamato dentro il setState updater, ma questo
 * causava un aggiornamento del padre "durante" il render del timer,
 * che React vieta (errore "Cannot update a component while rendering").
 */

interface SessionTimerProps {
  onTick?: (seconds: number) => void;
  onStop?: (seconds: number) => void;
  startImmediately?: boolean;
}

export function formatTime(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${String(h)}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function SessionTimer({
  onTick,
  onStop,
  startImmediately = true,
}: SessionTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(startImmediately);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const onTickRef = useRef(onTick);
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  // Timer: fa avanzare solo `seconds`. Nessuna chiamata al padre qui.
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  // Notifica il padre quando `seconds` cambia — fuori dal render, dopo commit.
  useEffect(() => {
    onTickRef.current?.(seconds);
  }, [seconds]);

  const handleStop = () => {
    setRunning(false);
    onStop?.(seconds);
  };

  const handleReset = () => {
    setSeconds(0);
    setShowResetConfirm(false);
    setRunning(true);
  };

  return (
    <div className="rounded-2xl border border-emerald-900/5 bg-white p-5 shadow-sm">
      <div className="mb-3 text-center">
        <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-800/60">
          Durata sessione
        </p>
        <p className="mt-1 font-mono text-4xl font-bold text-emerald-950 tabular-nums">
          {formatTime(seconds)}
        </p>
        <p className="mt-1 text-xs font-medium text-emerald-800/50">
          {running ? "In corso" : "In pausa"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold transition ${
            running
              ? "bg-amber-500 text-white hover:bg-amber-600"
              : "bg-teal-600 text-white hover:bg-teal-700"
          }`}
        >
          {running ? (
            <>
              <Pause className="h-4 w-4" /> Pausa
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Riprendi
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleStop}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-900/10 bg-white py-2.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
        >
          <Square className="h-4 w-4" /> Stop
        </button>

        {!showResetConfirm ? (
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-900/10 bg-white py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        ) : (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="flex-1 rounded-xl border border-emerald-900/10 bg-white py-2.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50"
            >
              No
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white transition hover:bg-red-700"
            >
              Sì
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
