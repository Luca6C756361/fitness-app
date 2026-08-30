"use client";

import { Timer } from "lucide-react";
import { REST_PRESETS } from "./RestTimer";

interface RestPresetPickerProps {
  value: number;
  onChange: (seconds: number) => void;
}

/** Selettore preset recupero. */
export default function RestPresetPicker({
  value,
  onChange,
}: RestPresetPickerProps) {
  return (
    <div className="rounded-2xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] p-4 shadow-[var(--kh-card-shadow)]">
      <div className="mb-2 flex items-center gap-2">
        <Timer className="h-4 w-4 text-[var(--kh-primary)]" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--kh-ink-muted)]">
          Recupero tra serie
        </p>
      </div>
      <div className="flex gap-1 rounded-full bg-[var(--kh-surface-2)] p-1">
        {REST_PRESETS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={`flex-1 rounded-full px-2 py-1 text-[11px] font-bold uppercase tracking-wide transition ${
              value === s
                ? "bg-[var(--kh-surface-1)] text-[var(--kh-ink)] shadow-sm"
                : "text-[var(--kh-ink-subtle)] hover:text-[var(--kh-ink)]"
            }`}
          >
            {s < 60 ? `${s}s` : `${s / 60}m${s % 60 ? `${s % 60}s` : ""}`}
          </button>
        ))}
      </div>
    </div>
  );
}