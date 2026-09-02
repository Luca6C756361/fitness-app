"use client";

import { activityLabels } from "../../today/_lib/data";
import type { ActivityLevel, Sex } from "../../today/_lib/types";

export interface ProfileDraft {
  name: string;
  sex: Sex;
  age: string;
  height: string;
  weight: string;
  activity: ActivityLevel | null;
}

export const emptyProfileDraft: ProfileDraft = {
  name: "",
  sex: "M",
  age: "",
  height: "",
  weight: "",
  activity: null,
};

interface StepProfileProps {
  draft: ProfileDraft;
  onChange: (patch: Partial<ProfileDraft>) => void;
}

const inputClass =
  "w-full rounded-xl border border-emerald-900/10 bg-white px-4 py-2.5 text-sm text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-300";
const labelClass =
  "mb-1.5 block text-xs font-bold uppercase tracking-wide text-emerald-800/70";

/** Step 1 — dati biometrici. Stesso stile di ProfileForm.tsx. */
export default function StepProfile({ draft, onChange }: StepProfileProps) {
  const ageNum = Number(draft.age);
  const ageError = draft.age !== "" && (!Number.isFinite(ageNum) || ageNum < 16 || ageNum > 100);

  const heightNum = Number(draft.height);
  const heightError =
    draft.height !== "" && (!Number.isFinite(heightNum) || heightNum < 120 || heightNum > 230);

  const weightNum = Number(draft.weight);
  const weightError =
    draft.weight !== "" && (!Number.isFinite(weightNum) || weightNum < 30 || weightNum > 300);

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-emerald-950">Iniziamo dai dati di base</h2>
      <p className="mb-5 text-xs text-emerald-800/60">
        Servono per calcolare il tuo fabbisogno calorico in modo accurato.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Nome</label>
          <input
            type="text"
            value={draft.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className={inputClass}
            placeholder="Come ti chiami?"
          />
        </div>

        <div>
          <label className={labelClass}>Sesso biologico</label>
          <div className="flex gap-2">
            {(["M", "F"] as Sex[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ sex: s })}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-bold transition ${
                  draft.sex === s
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-emerald-900/10 bg-white text-emerald-800/60 hover:bg-emerald-50/50"
                }`}
              >
                {s === "M" ? "Uomo" : "Donna"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>Età</label>
          <input
            type="number"
            value={draft.age}
            onChange={(e) => onChange({ age: e.target.value })}
            className={inputClass}
          />
          {ageError && <p className="mt-1 text-[11px] text-red-600">Età tra 16 e 100 anni.</p>}
        </div>

        <div>
          <label className={labelClass}>Altezza (cm)</label>
          <input
            type="number"
            value={draft.height}
            onChange={(e) => onChange({ height: e.target.value })}
            className={inputClass}
          />
          {heightError && (
            <p className="mt-1 text-[11px] text-red-600">Altezza tra 120 e 230 cm.</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Peso (kg)</label>
          <input
            type="number"
            step="0.1"
            value={draft.weight}
            onChange={(e) => onChange({ weight: e.target.value })}
            className={inputClass}
          />
          {weightError && <p className="mt-1 text-[11px] text-red-600">Peso tra 30 e 300 kg.</p>}
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Livello di attività</label>
          <div className="space-y-2">
            {(Object.keys(activityLabels) as ActivityLevel[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onChange({ activity: key })}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left transition ${
                  draft.activity === key
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-emerald-900/10 bg-white hover:bg-emerald-50/50"
                }`}
              >
                <span>
                  <span className="block text-sm font-bold text-emerald-950">
                    {activityLabels[key].label}
                  </span>
                  <span className="block text-xs text-emerald-800/60">
                    {activityLabels[key].description}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
