"use client";

import { useEffect, useState } from "react";
import { Trophy, X } from "lucide-react";
import { useWorkoutSession } from "../../today/_lib/WorkoutSessionContext";
import { prTypeLabels, type PRType } from "../../today/_lib/prStats";

const AUTO_DISMISS_MS = 6000;

export default function PRToast() {
  const { lastPR, dismissPR } = useWorkoutSession();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!lastPR) {
      setShown(false);
      return;
    }
    const raf = requestAnimationFrame(() => setShown(true));
    const timer = setTimeout(dismissPR, AUTO_DISMISS_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [lastPR, dismissPR]);

  if (!lastPR) return null;

  const value = (t: PRType) =>
    t === "weight"
      ? `${lastPR.maxWeight} kg`
      : t === "volume"
      ? `${lastPR.volume.toLocaleString("it-IT")} kg`
      : `${lastPR.e1rm} kg`;

  const previous = (t: PRType) => {
    const p = lastPR.previous;
    if (!p) return null;
    const old =
      t === "weight" ? p.maxWeight : t === "volume" ? p.bestSetVolume : p.e1rm;
    return old > 0 ? `prima ${Math.round(old)} kg` : null;
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md transition-all duration-300 sm:bottom-8 ${
        shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <div className="flex items-start gap-3 rounded-2xl border-2 border-[var(--kh-secondary)] bg-[var(--kh-surface-1)] p-4 shadow-[var(--kh-glow-secondary)]">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--kh-secondary)]/15 text-[var(--kh-secondary)]">
          <Trophy className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--kh-secondary)]">
            Record personale!
          </p>
          <p className="truncate text-sm font-bold text-[var(--kh-ink)]">
            {lastPR.name}
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {lastPR.types.map((t) => (
              <span
                key={t}
                className="rounded-full bg-[var(--kh-surface-2)] px-2 py-0.5 font-mono text-[11px] font-bold text-[var(--kh-ink)] tabular-nums"
              >
                {prTypeLabels[t]}: {value(t)}
                {previous(t) && (
                  <span className="ml-1 font-medium text-[var(--kh-ink-subtle)]">
                    ({previous(t)})
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={dismissPR}
          aria-label="Chiudi"
          className="rounded-full p-1 text-[var(--kh-ink-subtle)] transition hover:bg-[var(--kh-surface-2)] hover:text-[var(--kh-ink)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}