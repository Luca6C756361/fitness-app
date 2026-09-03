/** Tipi condivisi della dashboard TODAY */

/* --- Utente & profilo (invariati) --- */

export type Sex = "M" | "F";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "veryActive";

export interface UserProfile {
  name: string;
  avatar: string;
  age: number;
  sex: Sex;
  height: number;
  weight: number;
  activity: ActivityLevel;
}

export interface UserGoals {
  weightTarget: number;
  kcalTarget: number;
  carbsTarget: number;
  proteinTarget: number;
  fatTarget: number;
}

export interface WeightEntry {
  date: string;
  weight: number;
}

/* --- Nutrizione (invariata) --- */

export interface Macro {
  key: "carbs" | "protein" | "fat";
  label: string;
  current: number;
  goal: number;
  kcalPerGram: number;
  color: string;
}

export interface Food {
  id: string;
  name: string;
  category:
    | "colazione"
    | "proteine"
    | "carboidrati"
    | "verdure"
    | "frutta"
    | "snack"
    | "bevande";
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
  unit: "100g" | "pz";
  /* --- Scanner nutrizionale (Open Food Facts) — campi opzionali, retrocompatibili --- */
  brand?: string;
  barcode?: string;
  imageUrl?: string;
  source?: "local" | "off";
  /** Grammi di una porzione suggerita, ricavati da serving_size. */
  servingHint?: number;
  /** true se mancano macro e l'utente deve completarle a mano. */
  incomplete?: boolean;
}

export interface DailyKcal {
  date: string;
  kcal: number;
}

/* --- ALLENAMENTO (nuovo) --- */

/** Gruppo muscolare primario di un esercizio. */
export type MuscleGroup =
  | "petto"
  | "schiena"
  | "spalle"
  | "bicipiti"
  | "tricipiti"
  | "quadricipiti"
  | "femorali"
  | "glutei"
  | "polpacci"
  | "core"
  | "cardio";

/** Tipo di attrezzatura richiesta. */
export type Equipment =
  | "bilanciere"
  | "manubri"
  | "cavi"
  | "macchina"
  | "corpo-libero"
  | "kettlebell"
  | "elastici";

/**
 * Tassonomia anatomica fine, distinta da MuscleGroup (che resta la tassonomia
 * coarse per filtri/chip in tutta l'app — non va sostituita né estesa).
 */
export type MuscleAnatomyId =
  | "pettorale-superiore" | "pettorale-medio" | "pettorale-inferiore"
  | "gran-dorsale" | "trapezio-medio" | "trapezio-inferiore" | "romboidi" | "lombari"
  | "deltoide-anteriore" | "deltoide-laterale" | "deltoide-posteriore"
  | "bicipite-brachiale" | "brachiale" | "avambraccio"
  | "tricipite-capo-lungo" | "tricipite-capo-laterale" | "tricipite-capo-mediale"
  | "quadricipite-retto-femorale" | "quadricipite-vasti"
  | "femorale-bicipite" | "femorale-semitendinoso"
  | "gluteo-massimo" | "gluteo-medio"
  | "gastrocnemio" | "soleo"
  | "retto-addominale" | "obliqui" | "core-profondo";

/** Istruzioni tecniche di esecuzione di un esercizio (opzionali: i custom non le hanno). */
export interface ExerciseInstructions {
  setup: string[];
  concentric: string[];
  eccentric: string[];
  commonMistakes: string[];
}

/** Mappa dei fasci muscolari da evidenziare in MuscleMapSvg. */
export interface MuscleMap {
  primary: MuscleAnatomyId[];
  secondary: MuscleAnatomyId[];
}

/**
 * Esercizio nel database.
 * NON contiene set/reps: quelli vivono nella scheda (PlannedExercise).
 */
export interface ExerciseDefinition {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment;
  /** Demo di esecuzione. Opzionale: oggi nessun esercizio la valorizza. */
  media?: { kind: "video" | "lottie" | "image"; src: string; poster?: string };
  /* --- Atlante esercizi esteso — campi opzionali, retrocompatibili --- */
  instructions?: ExerciseInstructions;
  /** Se assente, resolveMuscleMap() deriva un fallback da primaryMuscle/secondaryMuscles. */
  muscleMap?: MuscleMap;
  /** Se assente, la UI mostra "intermedio" come fallback implicito. */
  level?: "principiante" | "intermedio" | "avanzato";
  /* --- Esercizi custom — campi opzionali, retrocompatibili --- */
  source?: "default" | "custom";
  /** ISO, solo per i custom. */
  createdAt?: string;
}

/** Un esercizio all'interno di una sessione (con set e reps di default). */
export interface PlannedExercise {
  id: string; // id univoco all'interno della scheda
  exerciseId: string; // riferimento a ExerciseDefinition
  sets: number;
  reps: number;
  /** Peso suggerito (opzionale). L'utente lo modifica durante il workout. */
  suggestedWeight?: number;
  /**
   * Recupero pianificato per questo esercizio, in secondi.
   * undefined = usa il default globale (settings.restDefaultSeconds).
   * NON confondere con CompletedSet.restSeconds, che è il recupero
   * effettivamente osservato dopo un set.
   */
  restSeconds?: number;
  notes?: string;
}

/** Una sessione di allenamento (es. "Push", "Sessione A"). */
export interface WorkoutSession {
  id: string;
  name: string;
  focus: string;
  exercises: PlannedExercise[];
  estimatedMinutes: number;
}

/**
 * Piano settimanale: per ogni giorno (0=domenica, 1=lunedì, ..., 6=sabato)
 * un id di sessione o null (giorno di riposo).
 */
export interface WeeklyPlan {
  sessions: WorkoutSession[];
  /** Assegnazione giorni della settimana → id sessione (o null per riposo). */
  weekMap: (string | null)[]; // length 7, index 0=domenica
}

/**
 * Modifica temporanea per una settimana specifica.
 * Chiave: "YYYY-WW" (settimana ISO). Sovrascrive weekMap per quella settimana.
 */
export interface WeeklyOverride {
  weekKey: string; // "2026-31"
  weekMap: (string | null)[];
}

/**
 * Log dettagliato di una sessione completata.
 * Sostituisce il WorkoutLog semplice, mantenendone i campi principali per
 * la retrocompatibilità con le statistiche.
 */
export interface CompletedSet {
  reps: number;
  weights: number[]; // peso per ogni ripetizione (length = reps)
  restSeconds?: number;
}

export interface CompletedExercise {
  exerciseId: string; // riferimento al database
  name: string; // salvato inline per storico stabile anche se rinomini
  sets: CompletedSet[];
}

export interface DetailedWorkoutLog {
  id: string;   // <-- MODIFICATA (era number) — uuid generato dal DB
  date: string;
  sessionName: string;
  durationSeconds: number;
  exercises: CompletedExercise[];
}
