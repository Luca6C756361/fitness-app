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
    <section className="rounded-2xl border border-emerald-900/5 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Bell className="h-4 w-4 text-amber-600" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#111111]/70">
          Notifiche
        </h2>
      </div>

      {/* Stato permessi + bottone attivazione */}
      {!granted && (
        <div className="mb-4 rounded-xl bg-emerald-50 p-4">
          <p className="mb-3 text-sm font-medium text-[#111111]">
            {denied
              ? "Le notifiche sono bloccate. Sblocca dalle impostazioni del browser."
              : "Attiva i permessi del browser per ricevere i promemoria."}
          </p>
          <button
            type="button"
            onClick={requestPermission}
            disabled={denied}
            className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {denied ? "Bloccate dal browser" : "Attiva notifiche"}
          </button>
        </div>
      )}

      {/* Toggles per tipo */}
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-[#FAF7F0] px-4 py-3">
          <span className="flex items-center gap-2.5">
            <Droplet className="h-4 w-4 text-sky-600" />
            <span className="text-sm font-medium text-[#111111]">Acqua</span>
          </span>
          <Toggle
            checked={settings.notifications.water}
            onChange={(v) => setSubPref("water", v)}
            disabled={!granted}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl bg-[#FAF7F0] px-4 py-3">
          <span className="flex items-center gap-2.5">
            <Dumbbell className="h-4 w-4 text-[#111111]" />
            <span className="text-sm font-medium text-[#111111]">Allenamento</span>
          </span>
          <Toggle
            checked={settings.notifications.workout}
            onChange={(v) => setSubPref("workout", v)}
            disabled={!granted}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl bg-[#FAF7F0] px-4 py-3">
          <span className="flex items-center gap-2.5">
            <Apple className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-[#111111]">Pasti</span>
          </span>
          <Toggle
            checked={settings.notifications.meals}
            onChange={(v) => setSubPref("meals", v)}
            disabled={!granted}
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-[#111111]/50">
        I promemoria funzionano quando l'app è aperta nel browser.
      </p>
    </section>
  );
}
