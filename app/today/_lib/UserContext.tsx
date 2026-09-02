"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../_lib/supabase/client";
import { useAuth } from "../../_lib/AuthContext";
import { defaultGoals, defaultProfile } from "./data";
import type { UserGoals, UserProfile, WeeklyPlan } from "./types";

/**
 * Profilo utente e obiettivi.
 * Persistenza: tabella `profiles` su Supabase (una riga per utente).
 * `goals` è una colonna JSONB: la leggiamo/scriviamo sempre in blocco.
 *
 * `onboardingCompleted` (colonna `onboarding_completed`, migrazione 0001):
 * flag esplicito, non un'euristica sui valori del profilo — vedi
 * app/onboarding/_lib/tdee.ts e ONBOARDING_TASK.md decisione 1.
 */

interface UserContextValue {
  profile: UserProfile;
  goals: UserGoals;
  loading: boolean;
  onboardingCompleted: boolean;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  updateGoals: (patch: Partial<UserGoals>) => Promise<void>;
  /**
   * Salvataggio di fine onboarding: UNA sola UPDATE (profilo + goals + plan +
   * flag), il flag scritto per ultimo. Niente update ottimistico: lo state si
   * aggiorna solo dopo il successo, così il chiamante può mostrare l'errore e
   * lasciare l'utente sul wizard con i dati ancora in RAM.
   */
  completeOnboarding: (payload: {
    profile: UserProfile;
    goals: UserGoals;
    plan: WeeklyPlan;
  }) => Promise<{ ok: boolean; error?: string }>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [goals, setGoals] = useState<UserGoals>(defaultGoals);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setOnboardingCompleted(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, avatar, age, sex, height, weight, activity, goals, onboarding_completed")
        .eq("id", user.id)
        .single();

      if (error) {
        // Sintomo tipico "vedo Luca 21 anni": la colonna onboarding_completed
        // non esiste ancora perché la migrazione 0001 non è stata lanciata.
        console.error("[profiles] lettura fallita (migrazione 0001 applicata?)", error.message);
      }

      if (data) {
        setProfile({
          name: data.name,
          avatar: data.avatar || defaultProfile.avatar,
          age: data.age,
          sex: data.sex as UserProfile["sex"],
          height: Number(data.height),   // numeric → arriva come stringa
          weight: Number(data.weight),
          activity: data.activity as UserProfile["activity"],
        });
        setGoals({ ...defaultGoals, ...(data.goals ?? {}) });
        setOnboardingCompleted(Boolean(data.onboarding_completed));
      }
      setLoading(false);
    })();
  }, [user]);

  const updateProfile = async (patch: Partial<UserProfile>) => {
    if (!user) return;
    const previous = profile;
    setProfile({ ...profile, ...patch });          // ottimistico
    const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
    if (error) {
      console.error("[profiles]", error.message);
      setProfile(previous);                        // rollback
    }
  };

  const updateGoals = async (patch: Partial<UserGoals>) => {
    if (!user) return;
    const previous = goals;
    const next = { ...goals, ...patch };
    setGoals(next);
    const { error } = await supabase.from("profiles").update({ goals: next }).eq("id", user.id);
    if (error) {
      console.error("[profiles]", error.message);
      setGoals(previous);
    }
  };

  const completeOnboarding = async (payload: {
    profile: UserProfile;
    goals: UserGoals;
    plan: WeeklyPlan;
  }): Promise<{ ok: boolean; error?: string }> => {
    if (!user) return { ok: false, error: "Utente non autenticato." };

    const patch = {
      name: payload.profile.name,
      avatar: payload.profile.avatar,
      age: payload.profile.age,
      sex: payload.profile.sex,
      height: payload.profile.height,
      weight: payload.profile.weight,
      activity: payload.profile.activity,
      goals: payload.goals,
      plan: payload.plan,
      onboarding_completed: true,
    };

    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", user.id)
      .select("id");

    if (error) return { ok: false, error: error.message };

    if (!data || data.length === 0) {
      // Nessuna riga aggiornata: l'utente non ha ancora una riga in profiles.
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({ id: user.id, ...patch });
      if (upsertError) return { ok: false, error: upsertError.message };
    }

    // Stato aggiornato SOLO dopo il successo (niente ottimismo qui).
    setProfile(payload.profile);
    setGoals(payload.goals);
    setOnboardingCompleted(true);
    return { ok: true };
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        goals,
        loading,
        onboardingCompleted,
        updateProfile,
        updateGoals,
        completeOnboarding,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser deve essere usato dentro <UserProvider>");
  return ctx;
}