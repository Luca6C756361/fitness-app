/**
 * Livello dati per l'integrazione Open Food Facts (OFF).
 * File puro, nessuna dipendenza React: testabile in isolamento.
 */

import type { Food } from "../../today/_lib/types";

/** Shape minima della risposta prodotto OFF che ci serve. */
export interface OffProduct {
  code: string;
  product_name?: string;
  product_name_it?: string;
  brands?: string;
  quantity?: string;
  serving_size?: string;
  image_front_small_url?: string;
  categories_tags?: string[];
  nutriments?: {
    "energy-kcal_100g"?: number;
    "energy_100g"?: number;
    carbohydrates_100g?: number;
    proteins_100g?: number;
    fat_100g?: number;
  };
}

/** Valida il check digit di un codice EAN-13 (algoritmo standard GS1). */
function isValidEan13(digits: string): boolean {
  const nums = digits.split("").map(Number);
  const sum = nums
    .slice(0, 12)
    .reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === nums[12];
}

/** Valida il check digit di un codice EAN-8 (algoritmo standard GS1). */
function isValidEan8(digits: string): boolean {
  const nums = digits.split("").map(Number);
  const sum = nums
    .slice(0, 7)
    .reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 3 : 1), 0);
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === nums[7];
}

/**
 * Valida un barcode: 8-14 cifre, con verifica del check digit per EAN-13/EAN-8.
 * Rifiuta codici con checksum sbagliato per evitare richieste inutili
 * (il rate limit OFF è di 15 req/min).
 */
export function isValidBarcode(code: string): boolean {
  if (!/^\d{8,14}$/.test(code)) return false;
  if (code.length === 13) return isValidEan13(code);
  if (code.length === 8) return isValidEan8(code);
  return true;
}

/** Mappa una categoria OFF (categories_tags) verso l'union `Food["category"]`. */
function mapCategory(tags: string[] | undefined): Food["category"] {
  if (!tags || tags.length === 0) return "snack";
  const set = new Set(tags);
  if (set.has("en:beverages")) return "bevande";
  if (set.has("en:fruits")) return "frutta";
  if (set.has("en:vegetables")) return "verdure";
  if (set.has("en:meats") || set.has("en:fishes") || set.has("en:cheeses") || set.has("en:eggs")) {
    return "proteine";
  }
  if (set.has("en:breakfasts") || set.has("en:cereals") || set.has("en:breads")) {
    return "colazione";
  }
  if (set.has("en:pastas") || set.has("en:rice") || set.has("en:legumes")) {
    return "carboidrati";
  }
  return "snack";
}

/** Estrae i grammi da una stringa serving_size (es. "30 g" → 30, "1 barretta (21 g)" → 21). */
function parseServingHint(servingSize: string | undefined): number | undefined {
  if (!servingSize) return undefined;
  const match = servingSize.match(/(\d+(?:[.,]\d+)?)\s*g\b/i);
  if (!match) return undefined;
  const value = parseFloat(match[1].replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Converte un prodotto OFF nel tipo `Food` interno dell'app. */
export function mapOffToFood(p: OffProduct): Food {
  const n = p.nutriments ?? {};

  let kcal: number;
  const kcal100g = n["energy-kcal_100g"];
  const kj100g = n["energy_100g"];
  if (typeof kcal100g === "number") {
    kcal = kcal100g;
  } else if (typeof kj100g === "number") {
    kcal = kj100g / 4.184;
  } else {
    kcal = 0;
  }

  const carbs = n.carbohydrates_100g ?? 0;
  const protein = n.proteins_100g ?? 0;
  const fat = n.fat_100g ?? 0;

  const incomplete =
    typeof kcal100g !== "number" && typeof kj100g !== "number"
      ? true
      : n.carbohydrates_100g === undefined ||
        n.proteins_100g === undefined ||
        n.fat_100g === undefined;

  const brand = p.brands?.split(",")[0]?.trim() || undefined;

  return {
    id: `off:${p.code}`,
    name: p.product_name_it || p.product_name || `Prodotto ${p.code}`,
    category: mapCategory(p.categories_tags),
    kcal: Math.round(kcal),
    carbs: round1(carbs),
    protein: round1(protein),
    fat: round1(fat),
    unit: "100g",
    barcode: p.code,
    brand,
    imageUrl: p.image_front_small_url,
    source: "off",
    servingHint: parseServingHint(p.serving_size),
    incomplete,
  };
}
