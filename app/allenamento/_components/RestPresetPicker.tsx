"use client";

import { Timer } from "lucide-react";
import { REST_PRESETS } from "./RestTimer";
import { formatRestLabel } from "../_lib/restPresets";

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
    <div className="rounded-2xl border border-emerald-900/5 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <Timer className="h-4 w-4 text-teal-600" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-800/60">
          Recupero tra serie
        </p>
      </div>
      <div className="flex gap-1 rounded-full bg-emerald-50 p-1">
        {REST_PRESETS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={`flex-1 rounded-full px-2 py-1 text-[11px] font-bold uppercase tracking-wide transition ${
              value === s
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-emerald-800/50 hover:text-emerald-800"
            }`}
          >
            {formatRestLabel(s)}
          </button>
        ))}
      </div>
    </div>
  );
}
