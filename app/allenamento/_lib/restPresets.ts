/**
 * Costanti e helper del recupero tra serie. Modulo neutro: nessun "use client",
 * nessun import — così `SessionEditor` (e chiunque altro) può importarlo senza
 * trascinarsi dietro RestTimer/FocusShell/useWakeLock/AudioContext.
 */

/** Preset di recupero, in secondi. */
export const REST_PRESETS = [60, 90, 120, 180] as const;

/** Default globale di fabbrica, usato da defaultSettings. */
export const REST_DEFAULT_SECONDS = 90;

/** Limiti di un valore di recupero personalizzato. */
export const REST_MIN_SECONDS = 15;
export const REST_MAX_SECONDS = 600;

/**
 * "45s", "1m30s", "2m" — etichetta compatta per chip e pill.
 * NOTA: usa Math.floor per i minuti (non la divisione diretta): la formula
 * inline che questa funzione sostituisce (RestPresetPicker.tsx, oggi) produce
 * per i valori non multipli di 60 minuti come "1.5m" invece di "1m30s" — bug
 * pre-esistente che questa estrazione corregge, come richiesto dagli esempi
 * del task (105 -> "1m45s", non "1.75m45s").
 */
export function formatRestLabel(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}m${rest ? `${rest}s` : ""}`;
}

/** Clampa e arrotonda ai 5s; ritorna null per input non validi o <= 0. */
export function normalizeRest(input: number | string): number | null {
  const n = typeof input === "string" ? Number(input) : input;
  if (!Number.isFinite(n) || n <= 0) return null;

  const rounded = Math.round(n / 5) * 5;
  return Math.min(REST_MAX_SECONDS, Math.max(REST_MIN_SECONDS, rounded));
}
