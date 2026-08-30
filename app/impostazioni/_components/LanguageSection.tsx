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
    <section className="rounded-2xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] p-6 shadow-[var(--kh-card-shadow)]">
      <div className="mb-4 flex items-center gap-2">
        <Languages className="h-4 w-4 text-[var(--kh-primary)]" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--kh-ink-muted)]">
          Lingua
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => updateSettings({ language: "it" })}
          className={`rounded-xl border py-3 text-sm font-bold transition ${
            settings.language === "it"
              ? "border-[var(--kh-primary)] bg-[var(--kh-primary)]/10 text-[var(--kh-primary)]"
              : "border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] text-[var(--kh-ink-muted)] hover:border-[var(--kh-primary)]/40 hover:text-[var(--kh-ink)]"
          }`}
        >
          🇮🇹 Italiano
        </button>
        <button
          type="button"
          onClick={() => updateSettings({ language: "en" })}
          className={`rounded-xl border py-3 text-sm font-bold transition ${
            settings.language === "en"
              ? "border-[var(--kh-primary)] bg-[var(--kh-primary)]/10 text-[var(--kh-primary)]"
              : "border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] text-[var(--kh-ink-muted)] hover:border-[var(--kh-primary)]/40 hover:text-[var(--kh-ink)]"
          }`}
        >
          🇬🇧 English
        </button>
      </div>

      {/* Avviso trasparente sullo stato reale della feature */}
      <div className="mt-4 flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-xs text-[var(--kh-ink-muted)]">
          La preferenza viene salvata, ma i testi dell'app non sono ancora
          tradotti. Traduzione completa in arrivo.
        </p>
      </div>
    </section>
  );
}