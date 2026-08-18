"use client";

import { Ruler } from "lucide-react";
import { useSettings } from "../../today/_lib/SettingsContext";
import type {
  EnergyUnit,
  HeightUnit,
  WeightUnit,
} from "../../today/_lib/SettingsContext";

/** Selettore riutilizzabile a chip. */
function ChipGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 rounded-lg border py-2 text-xs font-bold uppercase tracking-wide transition ${
            value === opt.value
              ? "border-emerald-600 bg-emerald-50 text-emerald-700"
              : "border-emerald-900/10 bg-white text-emerald-800/50 hover:bg-emerald-50/50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function UnitsSection() {
  const { settings, updateSettings } = useSettings();

  return (
    <section className="rounded-2xl border border-emerald-900/5 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Ruler className="h-4 w-4 text-teal-700" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-800/70">
          Unità di misura
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-emerald-800/60">Peso</p>
          <ChipGroup<WeightUnit>
            options={[
              { value: "kg", label: "Kilogrammi (kg)" },
              { value: "lb", label: "Libbre (lb)" },
            ]}
            value={settings.weightUnit}
            onChange={(v) => updateSettings({ weightUnit: v })}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-emerald-800/60">Altezza</p>
          <ChipGroup<HeightUnit>
            options={[
              { value: "cm", label: "Centimetri (cm)" },
              { value: "in", label: "Pollici (in)" },
            ]}
            value={settings.heightUnit}
            onChange={(v) => updateSettings({ heightUnit: v })}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-emerald-800/60">Energia</p>
          <ChipGroup<EnergyUnit>
            options={[
              { value: "kcal", label: "Kilocalorie (kcal)" },
              { value: "kJ", label: "Kilojoule (kJ)" },
            ]}
            value={settings.energyUnit}
            onChange={(v) => updateSettings({ energyUnit: v })}
          />
        </div>
      </div>
    </section>
  );
}
