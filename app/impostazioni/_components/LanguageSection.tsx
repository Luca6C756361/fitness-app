"use client";

import { Languages, Info } from "lucide-react";
import { useSettings } from "../../today/_lib/SettingsContext";

/**
 * Sezione lingua. La preferenza viene salvata, ma i testi dell'app non sono
 * ancora tradotti. L'internazionalizzazione completa (i18n) è un progetto a sé.
 */
export default function LanguageSection() {
  const { settings, updateSettings } = useSettings();

  return (
    <section className="rounded-2xl border border-emerald-900/5 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Languages className="h-4 w-4 text-emerald-700" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-800/70">
          Lingua
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => updateSettings({ language: "it" })}
          className={`rounded-xl border py-3 text-sm font-bold transition ${
            settings.language === "it"
              ? "border-emerald-600 bg-emerald-50 text-emerald-700"
              : "border-emerald-900/10 bg-white text-emerald-800/60 hover:bg-emerald-50/50"
          }`}
        >
          🇮🇹 Italiano
        </button>
        <button
          type="button"
          onClick={() => updateSettings({ language: "en" })}
          className={`rounded-xl border py-3 text-sm font-bold transition ${
            settings.language === "en"
              ? "border-emerald-600 bg-emerald-50 text-emerald-700"
              : "border-emerald-900/10 bg-white text-emerald-800/60 hover:bg-emerald-50/50"
          }`}
        >
          🇬🇧 English
        </button>
      </div>

      {/* Avviso trasparente sullo stato reale della feature */}
      <div className="mt-4 flex gap-2 rounded-xl bg-amber-50 p-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-xs text-amber-900/80">
          La preferenza viene salvata, ma i testi dell'app non sono ancora
          tradotti. Traduzione completa in arrivo.
        </p>
      </div>
    </section>
  );
}
