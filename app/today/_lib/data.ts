import type {
  DailyKcal,
  Food,
  Macro,
  UserGoals,
  UserProfile,
  WeightEntry,
} from "./types";

/* Dati mock: sostituiscili con le chiamate al DB/API. */

export const defaultProfile: UserProfile = {
  name: "Luca",
  avatar: "https://i.pravatar.cc/120?img=12",
  age: 21,
  sex: "M",
  height: 178,
  weight: 75.4,
  activity: "moderate",
};

export const defaultGoals: UserGoals = {
  weightTarget: 72,
  kcalTarget: 2200,
  carbsTarget: 250,
  proteinTarget: 180,
  fatTarget: 85,
};

export const weightHistory: WeightEntry[] = [
  { date: "2026-06-01", weight: 79.2 },
  { date: "2026-06-15", weight: 78.5 },
  { date: "2026-07-01", weight: 77.8 },
  { date: "2026-07-15", weight: 76.6 },
  { date: "2026-08-01", weight: 75.4 },
];


export const macros: Macro[] = [
  { key: "carbs", label: "Carbo", current: 120, goal: 250, kcalPerGram: 4, color: "#E8B04B" },
  { key: "protein", label: "Prot", current: 80, goal: 180, kcalPerGram: 4, color: "#3F9B95" },
  { key: "fat", label: "Grassi", current: 45, goal: 85, kcalPerGram: 9, color: "#C08497" },
];

export const kcalGoal = 2200;

export const activityLabels: Record<
  UserProfile["activity"],
  { label: string; description: string; multiplier: number }
> = {
  sedentary: { label: "Sedentario", description: "Poco o nessun esercizio", multiplier: 1.2 },
  light: { label: "Leggero", description: "1–3 allenamenti/settimana", multiplier: 1.375 },
  moderate: { label: "Moderato", description: "3–5 allenamenti/settimana", multiplier: 1.55 },
  active: { label: "Attivo", description: "6–7 allenamenti/settimana", multiplier: 1.725 },
  veryActive: { label: "Molto attivo", description: "Atleta / lavoro fisico", multiplier: 1.9 },
};

/** Kcal degli ultimi 7 giorni (per grafico stats). */
export const dailyKcalHistory: DailyKcal[] = [
  { date: "2026-07-26", kcal: 2150 },
  { date: "2026-07-27", kcal: 2340 },
  { date: "2026-07-28", kcal: 1980 },
  { date: "2026-07-29", kcal: 2210 },
  { date: "2026-07-30", kcal: 2050 },
  { date: "2026-07-31", kcal: 2380 },
  { date: "2026-08-01", kcal: 1350 },
];

/** Database alimenti — valori nutrizionali per 100g o per pezzo. */
export const foodDatabase: Food[] = [
  // Colazione
  { id: "avena", name: "Fiocchi d'avena", category: "colazione", kcal: 379, carbs: 67, protein: 13, fat: 7, unit: "100g" },
  { id: "yogurt-greco", name: "Yogurt greco 0%", category: "colazione", kcal: 59, carbs: 4, protein: 10, fat: 0.4, unit: "100g" },
  { id: "miele", name: "Miele", category: "colazione", kcal: 304, carbs: 82, protein: 0.3, fat: 0, unit: "100g" },
  { id: "pane-integrale", name: "Pane integrale", category: "colazione", kcal: 259, carbs: 41, protein: 13, fat: 3.4, unit: "100g" },
  // Proteine
  { id: "petto-pollo", name: "Petto di pollo", category: "proteine", kcal: 165, carbs: 0, protein: 31, fat: 3.6, unit: "100g" },
  { id: "salmone", name: "Salmone", category: "proteine", kcal: 208, carbs: 0, protein: 20, fat: 13, unit: "100g" },
  { id: "uovo", name: "Uovo intero (grande)", category: "proteine", kcal: 72, carbs: 0.4, protein: 6.3, fat: 5, unit: "pz" },
  { id: "tonno-scatoletta", name: "Tonno al naturale", category: "proteine", kcal: 116, carbs: 0, protein: 26, fat: 1, unit: "100g" },
  { id: "manzo-magro", name: "Manzo magro", category: "proteine", kcal: 158, carbs: 0, protein: 26, fat: 5, unit: "100g" },
  // Carboidrati
  { id: "riso-basmati", name: "Riso basmati", category: "carboidrati", kcal: 349, carbs: 78, protein: 8, fat: 0.9, unit: "100g" },
  { id: "pasta", name: "Pasta di semola", category: "carboidrati", kcal: 353, carbs: 72, protein: 12, fat: 1.5, unit: "100g" },
  { id: "patate", name: "Patate", category: "carboidrati", kcal: 77, carbs: 17, protein: 2, fat: 0.1, unit: "100g" },
  { id: "quinoa", name: "Quinoa", category: "carboidrati", kcal: 368, carbs: 64, protein: 14, fat: 6, unit: "100g" },
  // Verdure
  { id: "spinaci", name: "Spinaci", category: "verdure", kcal: 23, carbs: 3.6, protein: 2.9, fat: 0.4, unit: "100g" },
  { id: "broccoli", name: "Broccoli", category: "verdure", kcal: 34, carbs: 7, protein: 2.8, fat: 0.4, unit: "100g" },
  { id: "insalata", name: "Insalata mista", category: "verdure", kcal: 15, carbs: 2.9, protein: 1.4, fat: 0.2, unit: "100g" },
  { id: "zucchine", name: "Zucchine", category: "verdure", kcal: 17, carbs: 3.1, protein: 1.2, fat: 0.3, unit: "100g" },
  // Frutta
  { id: "mela", name: "Mela (media)", category: "frutta", kcal: 95, carbs: 25, protein: 0.5, fat: 0.3, unit: "pz" },
  { id: "banana", name: "Banana (media)", category: "frutta", kcal: 105, carbs: 27, protein: 1.3, fat: 0.4, unit: "pz" },
  { id: "frutti-bosco", name: "Frutti di bosco", category: "frutta", kcal: 57, carbs: 14, protein: 0.7, fat: 0.3, unit: "100g" },
  // Snack
  { id: "mandorle", name: "Mandorle", category: "snack", kcal: 579, carbs: 22, protein: 21, fat: 50, unit: "100g" },
  { id: "cioccolato-fondente", name: "Cioccolato fondente 85%", category: "snack", kcal: 598, carbs: 14, protein: 8, fat: 51, unit: "100g" },
  { id: "proteine-whey", name: "Whey protein (1 misurino)", category: "snack", kcal: 120, carbs: 3, protein: 24, fat: 1.5, unit: "pz" },
  // Bevande
  { id: "latte", name: "Latte parzialmente scremato", category: "bevande", kcal: 46, carbs: 4.8, protein: 3.3, fat: 1.5, unit: "100g" },
  { id: "caffe", name: "Caffè espresso", category: "bevande", kcal: 2, carbs: 0, protein: 0.1, fat: 0, unit: "pz" },
];
