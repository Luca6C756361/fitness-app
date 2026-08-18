"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../_lib/supabase/client";
import { useAuth } from "../../_lib/AuthContext";
import { defaultGoals, defaultProfile } from "./data";
import type { UserGoals, UserProfile } from "./types";

/**
 * Profilo utente e obiettivi.
 * Persistenza: tabella `profiles` su Supabase (una riga per utente).
 * `goals` è una colonna JSONB: la leggiamo/scriviamo sempre in blocco.
 */

interface UserContextValue {
  profile: UserProfile;
  goals: UserGoals;
  loading: boolean;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  updateGoals: (patch: Partial<UserGoals>) => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [goals, setGoals] = useState<UserGoals>(defaultGoals);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, avatar, age, sex, height, weight, activity, goals")
        .eq("id", user.id)
        .single();

      if (error) console.error("[profiles]", error.message);

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

  return (
    <UserContext.Provider value={{ profile, goals, loading, updateProfile, updateGoals }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser deve essere usato dentro <UserProvider>");
  return ctx;
}