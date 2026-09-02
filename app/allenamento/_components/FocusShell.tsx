"use client";

import { useEffect } from "react";
import { Minimize2, Sun } from "lucide-react";
import { useHoldToConfirm } from "../_lib/useHoldToConfirm";

/**
 * Contenitore della modalità Focus. NON usare Modal: Modal chiude al click
 * sullo sfondo, e in palestra un tocco fuori bersaglio con le mani sudate
 * chiuderebbe la modalità a metà serie.
 *
 * Colori: SOLO classi arbitrarie esplicite. globals.css riscrive bg-white /
 * text-emerald-950 / border-emerald-900\/10 in dark mode — se il Focus le
 * usasse, cambierebbe aspetto tra i due temi. Qui deve essere identico.
 */

interface FocusShellProps {
  open: boolean;
  label: string;
  onExit: () => void;
  accent?: "teal" | "amber";
  wakeLockActive?: boolean;
  children: React.ReactNode;
}

const EXIT_RING_RADIUS = 26;
const EXIT_RING_CIRCUMFERENCE = 2 * Math.PI * EXIT_RING_RADIUS;

export default function FocusShell({
  open,
  label,
  onExit,
  accent = "teal",
  wakeLockActive = false,
  children,
}: FocusShellProps) {
  const { onHoldStart, onHoldEnd, progress } = useHoldToConfirm(onExit, 600);

  // Scroll lock del body finché il Focus è aperto: ripristina il valore
  // precedente nel cleanup, non forza sempre "".
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  const accentColor = accent === "amber" ? "#FFB020" : "#12D6A0";

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-[#04140D] text-white"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        minHeight: "100dvh",
      }}
    >
      <div className="flex items-center justify-between px-4 pt-4">
        {wakeLockActive ? (
          <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">
            <Sun className="h-3 w-3" />
            Schermo attivo
          </span>
        ) : (
          <span />
        )}

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
          {label}
        </p>

        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onPointerDown={onHoldStart}
            onPointerUp={onHoldEnd}
            onPointerCancel={onHoldEnd}
            onPointerLeave={onHoldEnd}
            aria-label="Tieni premuto per uscire dalla modalità Focus"
            className="relative flex h-16 w-16 items-center justify-center rounded-full text-white/70 transition select-none touch-manipulation active:text-white"
          >
            <svg
              className="absolute inset-0 h-16 w-16 -rotate-90"
              viewBox="0 0 64 64"
              aria-hidden="true"
            >
              <circle
                cx="32"
                cy="32"
                r={EXIT_RING_RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="3"
              />
              <circle
                cx="32"
                cy="32"
                r={EXIT_RING_RADIUS}
                fill="none"
                stroke={accentColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={EXIT_RING_CIRCUMFERENCE}
                strokeDashoffset={EXIT_RING_CIRCUMFERENCE * (1 - progress)}
                style={{ transition: progress === 0 ? "stroke-dashoffset 0.15s ease-out" : "none" }}
              />
            </svg>
            <Minimize2 className="h-5 w-5" />
          </button>
          <span className="text-[10px] text-white/40">Tieni premuto</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
        {children}
      </div>
    </div>
  );
}
