"use client";

import { useEffect, useState } from "react";
import { Bell, Droplet, Dumbbell, Apple } from "lucide-react";
import { useSettings } from "../../today/_lib/SettingsContext";
import Toggle from "./Toggle";

/**
 * Sezione notifiche.
 * - Richiede permessi al browser (Notification API)
 * - Salva preferenze per tipo di promemoria
 * - Le notifiche funzionano solo se l'app è aperta (senza Service Worker)
 */
export default function NotificationsSection() {
  const { settings, updateSettings } = useSettings();
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (typeof Notification === "undefined") {
      alert("Il tuo browser non supporta le notifiche.");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      updateSettings({
        notifications: { ...settings.notifications, enabled: true },
      });
      // Notifica di conferma
      new Notification("Notifiche attive!", {
        body: "Riceverai promemoria per acqua, allenamento e pasti.",
      });
    }
  };

  const setSubPref = (key: "water" | "workout" | "meals", value: boolean) => {
    updateSettings({
      notifications: { ...settings.notifications, [key]: value },
    });
  };

  const denied = permission === "denied";
  const granted = permission === "granted";

  return (
    <section className="rounded-2xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-1)] p-6 shadow-[var(--kh-card-shadow)]">
      <div className="mb-4 flex items-center gap-2">
        <Bell className="h-4 w-4 text-amber-600" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--kh-ink-muted)]">
          Notifiche
        </h2>
      </div>

      {/* Stato permessi + bottone attivazione */}
      {!granted && (
        <div className="mb-4 rounded-xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] p-4">
          <p className="mb-3 text-sm font-medium text-[var(--kh-ink)]">
            {denied
              ? "Le notifiche sono bloccate. Sblocca dalle impostazioni del browser."
              : "Attiva i permessi del browser per ricevere i promemoria."}
          </p>
          <button
            type="button"
            onClick={requestPermission}
            disabled={denied}
            className="w-full rounded-xl bg-[var(--kh-primary)] py-2.5 text-sm font-bold text-white shadow-[var(--kh-glow-primary)] transition hover:bg-[var(--kh-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {denied ? "Bloccate dal browser" : "Attiva notifiche"}
          </button>
        </div>
      )}

      {/* Toggles per tipo */}
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] px-4 py-3">
          <span className="flex items-center gap-2.5">
            <Droplet className="h-4 w-4 text-sky-600" />
            <span className="text-sm font-medium text-[var(--kh-ink)]">Acqua</span>
          </span>
          <Toggle
            checked={settings.notifications.water}
            onChange={(v) => setSubPref("water", v)}
            disabled={!granted}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] px-4 py-3">
          <span className="flex items-center gap-2.5">
            <Dumbbell className="h-4 w-4 text-[var(--kh-primary)]" />
            <span className="text-sm font-medium text-[var(--kh-ink)]">Allenamento</span>
          </span>
          <Toggle
            checked={settings.notifications.workout}
            onChange={(v) => setSubPref("workout", v)}
            disabled={!granted}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[var(--kh-hairline)] bg-[var(--kh-surface-2)] px-4 py-3">
          <span className="flex items-center gap-2.5">
            <Apple className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-[var(--kh-ink)]">Pasti</span>
          </span>
          <Toggle
            checked={settings.notifications.meals}
            onChange={(v) => setSubPref("meals", v)}
            disabled={!granted}
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-[var(--kh-ink-subtle)]">
        I promemoria funzionano quando l'app è aperta nel browser.
      </p>
    </section>
  );
}