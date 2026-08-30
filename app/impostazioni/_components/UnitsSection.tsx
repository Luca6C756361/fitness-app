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
              ? "border-[var(--kh-primary)] bg-[var(--kh-primary)]/10 text-[var(--kh-primary)]"
              : "border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] text-[var(--kh-ink-subtle)] hover:border-[var(--kh-primary)]/40 hover:text-[var(--kh-ink)]"
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
    <section className="rounded-2xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] p-6 shadow-[var(--kh-card-shadow)]">
      <div className="mb-4 flex items-center gap-2">
        <Ruler className="h-4 w-4 text-[var(--kh-primary)]" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--kh-ink-muted)]">
          Unità di misura
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--kh-ink-muted)]">Peso</p>
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
          <p className="mb-2 text-sm font-medium text-[var(--kh-ink-muted)]">Altezza</p>
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
          <p className="mb-2 text-sm font-medium text-[var(--kh-ink-muted)]">Energia</p>
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