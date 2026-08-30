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
    <section className="rounded-2xl border border-emerald-900/5 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#111111]/70">
        Dati anagrafici
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#111111]/70">
            Nome
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-emerald-900/10 bg-white px-4 py-2.5 text-sm text-[#111111] outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#111111]/70">
            Età
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full rounded-xl border border-emerald-900/10 bg-white px-4 py-2.5 text-sm text-[#111111] outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#111111]/70">
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
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-emerald-900/10 bg-white text-[#111111]/60 hover:bg-emerald-50/50"
                }`}
              >
                {s === "M" ? "Uomo" : "Donna"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#111111]/70">
            Altezza (cm)
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full rounded-xl border border-emerald-900/10 bg-white px-4 py-2.5 text-sm text-[#111111] outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#111111]/70">
            Peso (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full rounded-xl border border-emerald-900/10 bg-white px-4 py-2.5 text-sm text-[#111111] outline-none focus:ring-2 focus:ring-emerald-300"
          />
          <p className="mt-1 text-[10px] font-medium text-[#111111]/50">
            Salvando registri una nuova misurazione di oggi.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#111111]/70">
            Livello di attività
          </label>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value as ActivityLevel)}
            className="w-full rounded-xl border border-emerald-900/10 bg-white px-4 py-2.5 text-sm text-[#111111] outline-none focus:ring-2 focus:ring-emerald-300"
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
        className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-sm transition ${
          saved ? "bg-teal-600" : "bg-emerald-600 hover:bg-emerald-700"
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
