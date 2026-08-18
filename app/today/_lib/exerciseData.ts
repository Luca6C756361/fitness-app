import type {
  ExerciseDefinition,
  WeeklyPlan,
  WorkoutSession,
} from "./types";

/**
 * Database esercizi. 36 esercizi di base con gruppo primario, secondari e attrezzatura.
 * Estendibile: aggiungi qui e diventano disponibili nell'editor scheda / composizione.
 */
export const exerciseDatabase: ExerciseDefinition[] = [
  // PETTO
  { id: "panca-piana", name: "Panca piana con bilanciere", primaryMuscle: "petto", secondaryMuscles: ["tricipiti", "spalle"], equipment: "bilanciere" },
  { id: "panca-inclinata", name: "Panca inclinata con manubri", primaryMuscle: "petto", secondaryMuscles: ["spalle", "tricipiti"], equipment: "manubri" },
  { id: "croci-cavi", name: "Croci ai cavi", primaryMuscle: "petto", secondaryMuscles: [], equipment: "cavi" },
  { id: "dip-parallele", name: "Dip alle parallele", primaryMuscle: "petto", secondaryMuscles: ["tricipiti", "spalle"], equipment: "corpo-libero" },
  { id: "push-up", name: "Piegamenti (Push-up)", primaryMuscle: "petto", secondaryMuscles: ["tricipiti", "core"], equipment: "corpo-libero" },

  // SCHIENA
  { id: "trazioni", name: "Trazioni alla sbarra", primaryMuscle: "schiena", secondaryMuscles: ["bicipiti"], equipment: "corpo-libero" },
  { id: "stacchi", name: "Stacchi da terra", primaryMuscle: "schiena", secondaryMuscles: ["femorali", "glutei"], equipment: "bilanciere" },
  { id: "rematore-bilanciere", name: "Rematore con bilanciere", primaryMuscle: "schiena", secondaryMuscles: ["bicipiti"], equipment: "bilanciere" },
  { id: "lat-machine", name: "Lat machine", primaryMuscle: "schiena", secondaryMuscles: ["bicipiti"], equipment: "macchina" },
  { id: "pulley-basso", name: "Pulley basso", primaryMuscle: "schiena", secondaryMuscles: ["bicipiti"], equipment: "cavi" },

  // SPALLE
  { id: "military-press", name: "Military press", primaryMuscle: "spalle", secondaryMuscles: ["tricipiti"], equipment: "bilanciere" },
  { id: "arnold-press", name: "Arnold press", primaryMuscle: "spalle", secondaryMuscles: ["tricipiti"], equipment: "manubri" },
  { id: "alzate-laterali", name: "Alzate laterali", primaryMuscle: "spalle", secondaryMuscles: [], equipment: "manubri" },
  { id: "alzate-frontali", name: "Alzate frontali", primaryMuscle: "spalle", secondaryMuscles: [], equipment: "manubri" },
  { id: "face-pull", name: "Face pull ai cavi", primaryMuscle: "spalle", secondaryMuscles: ["schiena"], equipment: "cavi" },

  // BICIPITI
  { id: "curl-bilanciere", name: "Curl con bilanciere", primaryMuscle: "bicipiti", secondaryMuscles: [], equipment: "bilanciere" },
  { id: "curl-manubri", name: "Curl alternato con manubri", primaryMuscle: "bicipiti", secondaryMuscles: [], equipment: "manubri" },
  { id: "hammer-curl", name: "Hammer curl", primaryMuscle: "bicipiti", secondaryMuscles: [], equipment: "manubri" },
  { id: "curl-cavo", name: "Curl al cavo basso", primaryMuscle: "bicipiti", secondaryMuscles: [], equipment: "cavi" },

  // TRICIPITI
  { id: "french-press", name: "French press", primaryMuscle: "tricipiti", secondaryMuscles: [], equipment: "bilanciere" },
  { id: "pushdown-cavo", name: "Pushdown ai cavi", primaryMuscle: "tricipiti", secondaryMuscles: [], equipment: "cavi" },
  { id: "estensioni-manubrio", name: "Estensioni sopra la testa con manubrio", primaryMuscle: "tricipiti", secondaryMuscles: [], equipment: "manubri" },

  // QUADRICIPITI
  { id: "squat", name: "Squat con bilanciere", primaryMuscle: "quadricipiti", secondaryMuscles: ["glutei", "femorali", "core"], equipment: "bilanciere" },
  { id: "leg-press", name: "Leg press", primaryMuscle: "quadricipiti", secondaryMuscles: ["glutei"], equipment: "macchina" },
  { id: "affondi", name: "Affondi con manubri", primaryMuscle: "quadricipiti", secondaryMuscles: ["glutei"], equipment: "manubri" },
  { id: "leg-extension", name: "Leg extension", primaryMuscle: "quadricipiti", secondaryMuscles: [], equipment: "macchina" },
  { id: "front-squat", name: "Front squat", primaryMuscle: "quadricipiti", secondaryMuscles: ["core", "glutei"], equipment: "bilanciere" },

  // FEMORALI
  { id: "stacchi-rumeni", name: "Stacchi rumeni", primaryMuscle: "femorali", secondaryMuscles: ["glutei", "schiena"], equipment: "bilanciere" },
  { id: "leg-curl", name: "Leg curl", primaryMuscle: "femorali", secondaryMuscles: [], equipment: "macchina" },
  { id: "good-morning", name: "Good morning", primaryMuscle: "femorali", secondaryMuscles: ["schiena", "glutei"], equipment: "bilanciere" },

  // GLUTEI
  { id: "hip-thrust", name: "Hip thrust", primaryMuscle: "glutei", secondaryMuscles: ["femorali"], equipment: "bilanciere" },
  { id: "glute-bridge", name: "Glute bridge", primaryMuscle: "glutei", secondaryMuscles: ["femorali"], equipment: "corpo-libero" },

  // POLPACCI
  { id: "calf-raise", name: "Calf raise in piedi", primaryMuscle: "polpacci", secondaryMuscles: [], equipment: "macchina" },

  // CORE
  { id: "plank", name: "Plank", primaryMuscle: "core", secondaryMuscles: [], equipment: "corpo-libero" },
  { id: "crunch", name: "Crunch a terra", primaryMuscle: "core", secondaryMuscles: [], equipment: "corpo-libero" },
  { id: "hanging-leg-raise", name: "Sollevamento gambe alla sbarra", primaryMuscle: "core", secondaryMuscles: [], equipment: "corpo-libero" },
];

/** Etichette leggibili per i gruppi muscolari. */
export const muscleGroupLabels: Record<string, string> = {
  petto: "Petto",
  schiena: "Schiena",
  spalle: "Spalle",
  bicipiti: "Bicipiti",
  tricipiti: "Tricipiti",
  quadricipiti: "Quadricipiti",
  femorali: "Femorali",
  glutei: "Glutei",
  polpacci: "Polpacci",
  core: "Core",
  cardio: "Cardio",
};

export const equipmentLabels: Record<string, string> = {
  bilanciere: "Bilanciere",
  manubri: "Manubri",
  cavi: "Cavi",
  macchina: "Macchina",
  "corpo-libero": "Corpo libero",
  kettlebell: "Kettlebell",
  elastici: "Elastici",
};

/** Sessioni di default: classico Push / Pull / Legs. */
const defaultSessions: WorkoutSession[] = [
  {
    id: "sess-push",
    name: "Push — Petto, Spalle, Tricipiti",
    focus: "Petto · Spalle · Tricipiti",
    estimatedMinutes: 55,
    exercises: [
      { id: "pe1", exerciseId: "panca-piana", sets: 4, reps: 8 },
      { id: "pe2", exerciseId: "panca-inclinata", sets: 3, reps: 10 },
      { id: "pe3", exerciseId: "military-press", sets: 3, reps: 8 },
      { id: "pe4", exerciseId: "alzate-laterali", sets: 3, reps: 12 },
      { id: "pe5", exerciseId: "pushdown-cavo", sets: 3, reps: 12 },
    ],
  },
  {
    id: "sess-pull",
    name: "Pull — Schiena, Bicipiti",
    focus: "Schiena · Bicipiti",
    estimatedMinutes: 55,
    exercises: [
      { id: "pu1", exerciseId: "trazioni", sets: 4, reps: 8 },
      { id: "pu2", exerciseId: "rematore-bilanciere", sets: 4, reps: 8 },
      { id: "pu3", exerciseId: "lat-machine", sets: 3, reps: 10 },
      { id: "pu4", exerciseId: "curl-bilanciere", sets: 3, reps: 10 },
      { id: "pu5", exerciseId: "hammer-curl", sets: 3, reps: 12 },
    ],
  },
  {
    id: "sess-legs",
    name: "Legs — Gambe, Glutei",
    focus: "Quadricipiti · Femorali · Glutei",
    estimatedMinutes: 60,
    exercises: [
      { id: "le1", exerciseId: "squat", sets: 4, reps: 8 },
      { id: "le2", exerciseId: "stacchi-rumeni", sets: 4, reps: 10 },
      { id: "le3", exerciseId: "leg-press", sets: 3, reps: 12 },
      { id: "le4", exerciseId: "leg-curl", sets: 3, reps: 12 },
      { id: "le5", exerciseId: "calf-raise", sets: 4, reps: 15 },
    ],
  },
];

/**
 * Piano di default: Lun=Push, Mar=riposo, Mer=Pull, Gio=riposo,
 * Ven=Legs, Sab=riposo, Dom=riposo.
 * Indici: 0=domenica, 1=lunedì, ..., 6=sabato
 */
export const defaultWeeklyPlan: WeeklyPlan = {
  sessions: defaultSessions,
  weekMap: [
    null, // domenica
    "sess-push", // lunedì
    null, // martedì
    "sess-pull", // mercoledì
    null, // giovedì
    "sess-legs", // venerdì
    null, // sabato
  ],
};

/** Etichette giorni. */
export const dayLabels = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
export const dayLabelsShort = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
