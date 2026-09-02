/**
 * Template di scheda proposti allo step 4 del wizard. File puro: nessun
 * import di React/next/supabase/lucide-react. Ogni exerciseId deve
 * esistere in exerciseDatabase (verificato dallo script di controllo,
 * non a runtime: un typo qui non darebbe errore TS).
 */

import { defaultWeeklyPlan } from "../../today/_lib/exerciseData";
import type { WeeklyPlan } from "../../today/_lib/types";
import type { ExperienceLevel } from "./tdee";

export interface PlanTemplate {
  id: ExperienceLevel | "vuoto";
  name: string;
  description: string; // una riga, max 80 caratteri
  daysPerWeek: number;
  plan: WeeklyPlan;
}

const fullBodyA: WeeklyPlan["sessions"][number] = {
  id: "fb-a",
  name: "Full Body A",
  focus: "Corpo intero",
  estimatedMinutes: 50,
  exercises: [
    { id: "fba1", exerciseId: "squat", sets: 4, reps: 8 },
    { id: "fba2", exerciseId: "panca-piana", sets: 4, reps: 8 },
    { id: "fba3", exerciseId: "rematore-bilanciere", sets: 4, reps: 8 },
    { id: "fba4", exerciseId: "military-press", sets: 4, reps: 8 },
    { id: "fba5", exerciseId: "plank", sets: 3, reps: 12 },
  ],
};

const fullBodyB: WeeklyPlan["sessions"][number] = {
  id: "fb-b",
  name: "Full Body B",
  focus: "Corpo intero",
  estimatedMinutes: 50,
  exercises: [
    { id: "fbb1", exerciseId: "stacchi-rumeni", sets: 4, reps: 8 },
    { id: "fbb2", exerciseId: "lat-machine", sets: 3, reps: 12 },
    { id: "fbb3", exerciseId: "panca-inclinata", sets: 3, reps: 12 },
    { id: "fbb4", exerciseId: "affondi", sets: 3, reps: 12 },
    { id: "fbb5", exerciseId: "crunch", sets: 3, reps: 12 },
  ],
};

const upperSession: WeeklyPlan["sessions"][number] = {
  id: "upper",
  name: "Upper",
  focus: "Petto · Schiena · Spalle · Braccia",
  estimatedMinutes: 60,
  exercises: [
    { id: "up1", exerciseId: "panca-piana", sets: 4, reps: 8 },
    { id: "up2", exerciseId: "trazioni", sets: 4, reps: 8 },
    { id: "up3", exerciseId: "military-press", sets: 3, reps: 10 },
    { id: "up4", exerciseId: "rematore-bilanciere", sets: 3, reps: 10 },
    { id: "up5", exerciseId: "curl-bilanciere", sets: 3, reps: 12 },
    { id: "up6", exerciseId: "pushdown-cavo", sets: 3, reps: 12 },
  ],
};

const lowerSession: WeeklyPlan["sessions"][number] = {
  id: "lower",
  name: "Lower",
  focus: "Quadricipiti · Femorali · Polpacci",
  estimatedMinutes: 50,
  exercises: [
    { id: "lo1", exerciseId: "squat", sets: 4, reps: 8 },
    { id: "lo2", exerciseId: "stacchi-rumeni", sets: 4, reps: 8 },
    { id: "lo3", exerciseId: "leg-press", sets: 3, reps: 12 },
    { id: "lo4", exerciseId: "leg-curl", sets: 3, reps: 12 },
    { id: "lo5", exerciseId: "calf-raise", sets: 4, reps: 15 },
  ],
};

export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: "principiante",
    name: "Full Body 3x",
    description: "Due sessioni A/B alternate, tutto il corpo ogni volta.",
    daysPerWeek: 3,
    plan: {
      sessions: [fullBodyA, fullBodyB],
      weekMap: [null, "fb-a", null, "fb-b", null, "fb-a", null],
    },
  },
  {
    id: "intermedio",
    name: "Upper / Lower 4x",
    description: "Due giorni di parte superiore, due di gambe.",
    daysPerWeek: 4,
    plan: {
      sessions: [upperSession, lowerSession],
      weekMap: [null, "upper", "lower", null, "upper", "lower", null],
    },
  },
  {
    id: "avanzato",
    name: "Push / Pull / Legs",
    description: "Split classico su 3 giorni, un focus per sessione.",
    daysPerWeek: 3,
    // Importato, non ricopiato a mano.
    plan: { ...defaultWeeklyPlan },
  },
  {
    id: "vuoto",
    name: "Parto da zero",
    description: "Nessuna sessione precompilata: costruisci tu la scheda.",
    daysPerWeek: 0,
    plan: {
      sessions: [],
      weekMap: [null, null, null, null, null, null, null],
    },
  },
];
