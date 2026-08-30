"use client";

import { useState } from "react";
import { Save, Check } from "lucide-react";
import { useUser } from "../../today/_lib/UserContext";
import { useWeight } from "../../today/_lib/WeightContext";
import { activityLabels } from "../../today/_lib/data";
import type { ActivityLevel, Sex } from "../../today/_lib/types";

/**
 * Form dati anagrafici. Il peso salvato qui:
 * 1. Aggiorna il profilo (per calcoli BMI/TDEE)
 * 2. Registra una misurazione con data di oggi nel WeightContext
 */
export default function ProfileForm() {
  const { profile, updateProfile } = useUser();
  const { addEntry } = useWeight();

  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age.toString());
  const [sex, setSex] = useState<Sex>(profile.sex);
  const [height, setHeight] = useState(profile.height.toString());
  const [weight, setWeight] = useState(profile.weight.toString());
  const [activity, setActivity] = useState<ActivityLevel>(profile.activity);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const newWeight = parseFloat(weight) || profile.weight;

    updateProfile({
      name: name.trim() || profile.name,
      age: parseInt(age, 10) || profile.age,
      sex,
      height: parseFloat(height) || profile.height,
      weight: newWeight,
      activity,
    });

    // Se il peso è cambiato rispetto al valore precedente, registra la misurazione
    if (newWeight !== profile.weight) {
      const today = new Date().toISOString().slice(0, 10);
      addEntry(today, newWeight);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <section className="rounded-2xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] p-6 shadow-[var(--kh-card-shadow)]">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--kh-ink-muted)]">
        Dati anagrafici
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--kh-ink-muted)]">
            Nome
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] px-4 py-2.5 text-sm text-[var(--kh-ink)] outline-none transition focus:border-[var(--kh-primary)] focus:ring-2 focus:ring-[var(--kh-primary)]/30"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--kh-ink-muted)]">
            Età
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full rounded-xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] px-4 py-2.5 text-sm text-[var(--kh-ink)] outline-none transition focus:border-[var(--kh-primary)] focus:ring-2 focus:ring-[var(--kh-primary)]/30"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--kh-ink-muted)]">
            Sesso
          </label>
          <div className="flex gap-2">
            {(["M", "F"] as Sex[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSex(s)}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-bold transition ${
                  sex === s
                    ? "border-[var(--kh-primary)] bg-[var(--kh-primary)]/10 text-[var(--kh-primary)]"
                    : "border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] text-[var(--kh-ink-muted)] hover:border-[var(--kh-primary)]/40"
                }`}
              >
                {s === "M" ? "Uomo" : "Donna"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--kh-ink-muted)]">
            Altezza (cm)
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full rounded-xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] px-4 py-2.5 text-sm text-[var(--kh-ink)] outline-none transition focus:border-[var(--kh-primary)] focus:ring-2 focus:ring-[var(--kh-primary)]/30"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--kh-ink-muted)]">
            Peso (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full rounded-xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] px-4 py-2.5 text-sm text-[var(--kh-ink)] outline-none transition focus:border-[var(--kh-primary)] focus:ring-2 focus:ring-[var(--kh-primary)]/30"
          />
          <p className="mt-1 text-[10px] font-medium text-[var(--kh-ink-subtle)]">
            Salvando registri una nuova misurazione di oggi.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--kh-ink-muted)]">
            Livello di attività
          </label>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value as ActivityLevel)}
            className="w-full rounded-xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] px-4 py-2.5 text-sm text-[var(--kh-ink)] outline-none transition focus:border-[var(--kh-primary)] focus:ring-2 focus:ring-[var(--kh-primary)]/30"
          >
            {(Object.keys(activityLabels) as ActivityLevel[]).map((key) => (
              <option key={key} value={key}>
                {activityLabels[key].label} — {activityLabels[key].description}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition ${
          saved
            ? "bg-[var(--kh-secondary)] shadow-[var(--kh-glow-secondary)]"
            : "bg-[var(--kh-primary)] shadow-[var(--kh-glow-primary)] hover:bg-[var(--kh-primary-hover)]"
        }`}
      >
        {saved ? (
          <>
            <Check className="h-4 w-4" />
            Salvato!
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Salva modifiche
          </>
        )}
      </button>
    </section>
  );
}