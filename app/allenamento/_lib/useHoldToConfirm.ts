"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Press-and-hold di conferma (anti-tocco-accidentale): 600 ms di pressione
 * continua prima che l'azione scatti. Condiviso da FocusShell (uscita) e
 * FocusButton (holdToConfirm), un solo posto per i timer.
 */
export function useHoldToConfirm(onConfirm: () => void, durationMs = 600) {
  const [progress, setProgress] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const onConfirmRef = useRef(onConfirm);

  useEffect(() => {
    onConfirmRef.current = onConfirm;
  }, [onConfirm]);

  const clear = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startedAtRef.current = null;
    setProgress(0);
  }, []);

  // Named function expression: l'auto-riferimento usa il proprio nome
  // (tickFn), non la const esterna — evita "accessed before declared"
  // sulla variabile `tick` non ancora assegnata al momento della prima
  // chiamata ricorsiva pianificata.
  const tick = useCallback(function tickFn() {
    const startedAt = startedAtRef.current;
    if (startedAt === null) return;
    const elapsed = Date.now() - startedAt;
    setProgress(Math.min(1, elapsed / durationMs));
    if (elapsed < durationMs) {
      rafRef.current = window.requestAnimationFrame(tickFn);
    }
  }, [durationMs]);

  const onHoldStart = useCallback(() => {
    startedAtRef.current = Date.now();
    rafRef.current = window.requestAnimationFrame(tick);
    timeoutRef.current = window.setTimeout(() => {
      clear();
      onConfirmRef.current();
    }, durationMs);
  }, [tick, durationMs, clear]);

  const onHoldEnd = useCallback(() => {
    clear();
  }, [clear]);

  // Cleanup allo smontaggio: nessun timer orfano se il componente sparisce
  // a metà pressione.
  useEffect(() => clear, [clear]);

  return { onHoldStart, onHoldEnd, progress };
}
