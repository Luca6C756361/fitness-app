"use client";

import { Sun, Moon, Palette } from "lucide-react";
import { useSettings } from "../../today/_lib/SettingsContext";

/** Sezione tema chiaro/scuro. */
export default function AppearanceSection() {
  const { settings, updateSettings } = useSettings();

  return (
    <section className="rounded-2xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] p-6 shadow-[var(--kh-card-shadow)]">
      <div className="mb-4 flex items-center gap-2">
        <Palette className="h-4 w-4 text-[var(--kh-primary)]" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--kh-ink-muted)]">
          Aspetto
        </h2>
      </div>

      <p className="mb-3 text-sm font-medium text-[var(--kh-ink-muted)]">Tema</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => updateSettings({ theme: "light" })}
          className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition ${
            settings.theme === "light"
              ? "border-2 border-[var(--kh-primary)] bg-[var(--kh-canvas)] text-[var(--kh-primary)] shadow-[var(--kh-glow-primary)]"
              : "border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] text-[var(--kh-ink-muted)] hover:border-[var(--kh-primary)]/40 hover:text-[var(--kh-ink)]"
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
              ? "border-2 border-[var(--kh-primary)] bg-[var(--kh-canvas)] text-[var(--kh-primary)] shadow-[var(--kh-glow-primary)]"
              : "border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] text-[var(--kh-ink-muted)] hover:border-[var(--kh-primary)]/40 hover:text-[var(--kh-ink)]"
          }`}
        >
          <Moon className="h-4 w-4" />
          Scuro
        </button>
      </div>
    </section>
  );
}