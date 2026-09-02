"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Wake Lock best-effort per la modalità Focus: impedisce allo schermo di
 * spegnersi mentre `enabled` è true. Nessun throw, nessun log rumoroso:
 * se l'API manca o il browser rifiuta la richiesta, supported/active
 * restano semplicemente false.
 *
 * Il browser rilascia da solo la sentinel quando la tab perde visibilità:
 * il listener su "visibilitychange" la riacquisisce al rientro, se
 * `enabled` è ancora true.
 */
export function useWakeLock(enabled: boolean): { supported: boolean; active: boolean } {
  const [supported, setSupported] = useState(false);
  const [active, setActive] = useState(false);
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  // Calcolato in effetto (in render girerebbe anche in SSR, dove navigator
  // non esiste) e rimandato a un timer 0ms: setState non sincrono nel
  // corpo dell'effetto (stesso pattern già usato in BarcodeScanner.tsx).
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSupported(typeof navigator !== "undefined" && "wakeLock" in navigator);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!supported) return;

    let cancelled = false;

    const release = async () => {
      const sentinel = sentinelRef.current;
      sentinelRef.current = null;
      if (sentinel) {
        try {
          await sentinel.release();
        } catch {
          /* best-effort */
        }
      }
    };

    const acquire = async () => {
      try {
        const sentinel = await navigator.wakeLock.request("screen");
        if (cancelled) {
          // enabled è già tornato false (o il componente si è smontato)
          // nel frattempo: rilascia subito quanto appena ottenuto.
          try {
            await sentinel.release();
          } catch {
            /* best-effort */
          }
          return;
        }
        sentinelRef.current = sentinel;
        setActive(true);
        sentinel.addEventListener("release", () => {
          setActive(false);
        });
      } catch {
        // API presente ma richiesta rifiutata (permessi, contesto non sicuro, ecc.)
        setActive(false);
      }
    };

    if (enabled) {
      void acquire();
    } else {
      void release();
    }

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && enabled && !sentinelRef.current) {
        void acquire();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      void release();
      setActive(false);
    };
  }, [enabled, supported]);

  return { supported, active };
}
