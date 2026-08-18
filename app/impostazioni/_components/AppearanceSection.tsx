"use client";

import { Sun, Moon, Palette } from "lucide-react";
import { useSettings } from "../../today/_lib/SettingsContext";

/** Sezione tema chiaro/scuro. */
export default function AppearanceSection() {
  const { settings, updateSettings } = useSettings();

  return (
    <section className="rounded-2xl border border-emerald-900/5 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Palette className="h-4 w-4 text-emerald-700" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-800/70">
          Aspetto
        </h2>
      </div>

      <p className="mb-3 text-sm font-medium text-emerald-800/60">Tema</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => updateSettings({ theme: "light" })}
          className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition ${
            settings.theme === "light"
              ? "border-emerald-600 bg-emerald-50 text-emerald-700"
              : "border-emerald-900/10 bg-white text-emerald-800/60 hover:bg-emerald-50/50"
          }`}
        >
          <Sun className="h-4 w-4" />
          Chiaro
        </button>
        <button
          type="button"
          onClick={() => updateSettings({ theme: "dark" })}
          className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition ${
            settings.theme === "dark"
              ? "border-emerald-600 bg-emerald-50 text-emerald-700"
              : "border-emerald-900/10 bg-white text-emerald-800/60 hover:bg-emerald-50/50"
          }`}
        >
          <Moon className="h-4 w-4" />
          Scuro
        </button>
      </div>
    </section>
  );
}
