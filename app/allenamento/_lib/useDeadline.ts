"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Cronometro e countdown per scadenza assoluta (Date.now()), non per
 * accumulo di tick: setInterval viene throttlato a ~1/minuto in tab
 * background o a schermo spento, quindi un contatore che fa `s + 1` ogni
 * secondo sottostima il tempo reale trascorso. Qui l'interval serve solo
 * da repaint; il valore vero si ricalcola sempre da un timestamp, ma
 * SOLO dentro effetti/callback — mai in fase di render (Date.now() e la
 * lettura di ref.current durante il render sono vietati dalle regole
 * react-hooks/purity e react-hooks/refs: il valore esposto è sempre lo
 * stato "seconds"/"remaining", mai calcolato al volo nel return).
 */

/** Cronometro che avanza/pausa senza perdere tempo a schermo spento. */
export function useElapsed(
  running: boolean,
  initialSeconds = 0
): { seconds: number; reset: () => void } {
  const baseSecondsRef = useRef(initialSeconds);
  const startedAtRef = useRef<number | null>(null);
  const [seconds, setSeconds] = useState(initialSeconds);

  const recompute = useCallback(() => {
    const started = startedAtRef.current;
    setSeconds(
      baseSecondsRef.current +
        (started !== null ? Math.floor((Date.now() - started) / 1000) : 0)
    );
  }, []);

  // running passa da pausa a marcia: nuovo startedAt. Da marcia a pausa:
  // congela il tempo trascorso in baseSeconds. Il recompute è rimandato a
  // un timer 0ms (setState non sincrono nel corpo dell'effetto, stesso
  // pattern già usato in BarcodeScanner.tsx).
  useEffect(() => {
    if (running) {
      startedAtRef.current = Date.now();
    } else {
      const started = startedAtRef.current;
      if (started !== null) {
        baseSecondsRef.current += Math.floor((Date.now() - started) / 1000);
      }
      startedAtRef.current = null;
    }
    const timer = window.setTimeout(recompute, 0);
    return () => window.clearTimeout(timer);
  }, [running, recompute]);

  // Repaint periodico: la callback dell'interval non è "corpo dell'effetto"
  // in senso stretto (gira più tardi, in modo asincrono), quindi il
  // setState al suo interno non ricade sotto set-state-in-effect.
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(recompute, 1000);
    return () => clearInterval(interval);
  }, [running, recompute]);

  // Risincronizza al rientro dal background: senza questo, il repaint
  // resterebbe fermo al valore dell'ultimo tick prima del throttling.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") recompute();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [recompute]);

  const reset = useCallback(() => {
    baseSecondsRef.current = 0;
    startedAtRef.current = running ? Date.now() : null;
    recompute();
  }, [running, recompute]);

  return { seconds, reset };
}

/** Countdown verso `endAt` (epoch ms), onEnd chiamato una sola volta. */
export function useCountdown(
  endAt: number | null,
  onEnd: () => void
): { remaining: number } {
  const [remaining, setRemaining] = useState(0);
  const onEndRef = useRef(onEnd);
  const firedForRef = useRef<number | null>(null);

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  const recompute = useCallback(() => {
    if (endAt === null) {
      setRemaining(0);
      return;
    }
    const value = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    setRemaining(value);
    if (value <= 0 && firedForRef.current !== endAt) {
      firedForRef.current = endAt;
      onEndRef.current();
    }
  }, [endAt]);

  // Primo check + polling: il primo è rimandato a un timer 0ms (setState
  // non sincrono nel corpo dell'effetto); il polling a 250ms gira
  // nell'interval, che non è soggetto alla stessa regola.
  useEffect(() => {
    const initial = window.setTimeout(recompute, 0);
    if (endAt === null) return () => window.clearTimeout(initial);
    const interval = setInterval(recompute, 250);
    return () => {
      window.clearTimeout(initial);
      clearInterval(interval);
    };
  }, [endAt, recompute]);

  // Al rientro dal background, se il tempo è già scaduto, notifica subito
  // invece di aspettare il prossimo tick da 250ms.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") recompute();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [recompute]);

  return { remaining };
}
