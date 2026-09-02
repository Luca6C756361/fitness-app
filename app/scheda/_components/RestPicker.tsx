"use client";

import { useState } from "react";
import { REST_PRESETS, formatRestLabel, normalizeRest } from "../../allenamento/_lib/restPresets";

interface RestPickerProps {
  /** undefined = eredita il globale. */
  value?: number;
  /** Solo per l'etichetta "Globale (Xs)". */
  globalDefault: number;
  onChange: (seconds: number | undefined) => void;
}

const CHIP_BASE = "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase transition";
const CHIP_ACTIVE = "bg-teal-600 text-white";
const CHIP_INACTIVE = "bg-emerald-50 text-emerald-800/60 hover:bg-emerald-100";

/** Picker inline compatto del recupero: componente controllato, nessuno stato
 * interno oltre alla stringa dell'input libero. */
export default function RestPicker({ value, globalDefault, onChange }: RestPickerProps) {
  const [customInput, setCustomInput] = useState("");

  const isPreset = value !== undefined && (REST_PRESETS as readonly number[]).includes(value);

  const commitCustom = (raw: string) => {
    const normalized = normalizeRest(raw);
    if (normalized !== null) onChange(normalized);
  };

  return (
    <div
      style={{ touchAction: "manipulation" }}
      className="flex flex-wrap items-center gap-1 rounded-lg bg-[#FAF7F0] p-2"
    >
      <button
        type="button"
        onClick={() => onChange(undefined)}
        className={`${CHIP_BASE} ${value === undefined ? CHIP_ACTIVE : CHIP_INACTIVE}`}
      >
        Globale ({formatRestLabel(globalDefault)})
      </button>

      {REST_PRESETS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`${CHIP_BASE} ${value === s ? CHIP_ACTIVE : CHIP_INACTIVE}`}
        >
          {formatRestLabel(s)}
        </button>
      ))}

      <input
        type="number"
        inputMode="numeric"
        step={15}
        value={customInput}
        placeholder={!isPreset && value !== undefined ? String(value) : "…"}
        onChange={(e) => setCustomInput(e.target.value)}
        onBlur={() => {
          if (customInput.trim() !== "") commitCustom(customInput);
          setCustomInput("");
        }}
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          e.preventDefault();
          if (customInput.trim() !== "") commitCustom(customInput);
          setCustomInput("");
        }}
        className="w-16 rounded-full border border-emerald-900/10 bg-white px-2 py-0.5 text-[10px] font-bold text-emerald-950 outline-none focus:ring-2 focus:ring-teal-300"
        aria-label="Recupero personalizzato in secondi"
      />
    </div>
  );
}
