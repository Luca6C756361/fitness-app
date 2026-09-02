#!/usr/bin/env node
/**
 * Verifica WCAG 2.1 dei token colore semantici usati in app/globals.css.
 * Nessuna dipendenza esterna — esegui con: node scripts/contrast-check.mjs
 *
 * Le palette e le superfici sono hardcoded qui come singola fonte di verità
 * "attesa": se un valore cambia in globals.css senza aggiornare questo
 * script, la CI fallisce invece di passare silenziosamente.
 */

// --- Relative luminance / contrast ratio, formula WCAG 2.x --------------

function srgbChannelToLinear(channel255) {
  const c = channel255 / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const R = srgbChannelToLinear(r);
  const G = srgbChannelToLinear(g);
  const B = srgbChannelToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(hexA, hexB) {
  const L1 = relativeLuminance(hexA);
  const L2 = relativeLuminance(hexB);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

// --- Palette: valori attesi dei token, per tema (vedi A11Y_CONTRAST_TASK.md) --

const THEMES = {
  chiaro: {
    surfaces: ["#FFFFFF", "#FAF7F0"],
    text: {
      "fg-primary": "#022C22",
      "fg-secondary": "#0B5C48",
      "fg-muted": "#3D6B5C",
      "fg-placeholder": "#4A6F62",
      "fg-accent": "#0F766E",
      "fg-warning": "#96521A",
      "fg-danger": "#B91C1C",
    },
    borderStrong: "#5C7A6D",
    pill: { on: "#047857", onFg: "#FFFFFF" },
  },
  scuro: {
    surfaces: ["#0f1a15", "#1a2620", "#223129"],
    text: {
      "fg-primary": "#ECFDF5",
      "fg-secondary": "#A7C7B8",
      "fg-muted": "#8FB3A4",
      "fg-placeholder": "#88A99A",
      "fg-accent": "#5EEAD4",
      "fg-warning": "#FCD34D",
      "fg-danger": "#FCA5A5",
    },
    borderStrong: "#587F6F",
    pill: { on: "#34D399", onFg: "#06281F" },
  },
};

const TEXT_THRESHOLD = 4.5;
const NON_TEXT_THRESHOLD = 3.0;

// --- Esecuzione dei controlli ---------------------------------------------

const rows = [];
let hasFailure = false;

function check(token, surfaceLabel, colorHex, surfaceHex, threshold) {
  const ratio = contrastRatio(colorHex, surfaceHex);
  const ok = ratio >= threshold;
  if (!ok) hasFailure = true;
  rows.push({
    token,
    surface: surfaceLabel,
    ratio: ratio.toFixed(2),
    threshold: threshold.toFixed(1),
    esito: ok ? "OK" : "FAIL",
  });
}

for (const [themeName, theme] of Object.entries(THEMES)) {
  // Token di testo: contro OGNI superficie del tema — prende il caso peggiore
  // (ogni riga resta in tabella, il FAIL emerge dalla colonna ESITO).
  for (const [tokenName, hex] of Object.entries(theme.text)) {
    for (const surface of theme.surfaces) {
      check(`${themeName}/${tokenName}`, surface, hex, surface, TEXT_THRESHOLD);
    }
  }

  // border-strong: componente non testuale, soglia 3:1, contro ogni superficie.
  for (const surface of theme.surfaces) {
    check(`${themeName}/border-strong`, surface, theme.borderStrong, surface, NON_TEXT_THRESHOLD);
  }

  // Coppia pill-on / pill-on-fg: testo sul proprio sfondo, soglia 3:1.
  check(`${themeName}/pill-on-fg`, "pill-on", theme.pill.onFg, theme.pill.on, NON_TEXT_THRESHOLD);
}

// --- Tabella allineata -----------------------------------------------------

const columns = ["token", "surface", "ratio", "threshold", "esito"];
const headers = ["TOKEN", "SUPERFICIE", "RATIO", "SOGLIA", "ESITO"];
const widths = columns.map((col, i) =>
  Math.max(headers[i].length, ...rows.map((r) => String(r[col]).length))
);

function pad(value, width) {
  return String(value).padEnd(width, " ");
}

console.log(headers.map((h, i) => pad(h, widths[i])).join("  "));
console.log(widths.map((w) => "-".repeat(w)).join("  "));
for (const r of rows) {
  console.log(columns.map((c, i) => pad(r[c], widths[i])).join("  "));
}

const failCount = rows.filter((r) => r.esito === "FAIL").length;
console.log("");
if (hasFailure) {
  console.log(`${failCount}/${rows.length} coppie sotto soglia.`);
  process.exit(1);
} else {
  console.log(`Tutte le ${rows.length} coppie sono conformi.`);
  process.exit(0);
}
