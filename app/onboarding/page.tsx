"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useUser } from "../today/_lib/UserContext";
import { useWeight } from "../today/_lib/WeightContext";
import type { UserGoals, UserProfile } from "../today/_lib/types";
import ProgressBar from "./_components/ProgressBar";
import StepProfile, { emptyProfileDraft, type ProfileDraft } from "./_components/StepProfile";
import StepGoalExperience from "./_components/StepGoalExperience";
import StepReview from "./_components/StepReview";
import StepPlan from "./_components/StepPlan";
import {
  buildMacroSplit,
  suggestWeightTarget,
  isProfileStepValid,
  type FitnessGoal,
  type ExperienceLevel,
  type MacroSplit,
} from "./_lib/tdee";
import { PLAN_TEMPLATES, type PlanTemplate } from "./_lib/planTemplates";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

const navButtonClass =
  "ml-auto flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40";

/**
 * Wizard di onboarding, 4 step. Stato SOLO in RAM: niente localStorage, niente
 * scritture parziali su Supabase. Finché "Inizia" non viene premuto con
 * successo, l'onboarding non esiste sul server (ONBOARDING_TASK.md, decisione 2).
 */
export default function OnboardingPage() {
  const { profile: currentProfile, completeOnboarding } = useUser();
  const { addEntry } = useWeight();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [profileDraft, setProfileDraft] = useState<ProfileDraft>(emptyProfileDraft);
  const [goal, setGoal] = useState<FitnessGoal | null>(null);
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);
  const [macros, setMacros] = useState<MacroSplit | null>(null);
  const [weightTarget, setWeightTarget] = useState("");
  const [templateId, setTemplateId] = useState<PlanTemplate["id"] | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const profileCandidate: Partial<UserProfile> = {
    name: profileDraft.name,
    sex: profileDraft.sex,
    age: profileDraft.age === "" ? undefined : Number(profileDraft.age),
    height: profileDraft.height === "" ? undefined : Number(profileDraft.height),
    weight: profileDraft.weight === "" ? undefined : Number(profileDraft.weight),
    activity: profileDraft.activity ?? undefined,
  };
  const step1Valid = isProfileStepValid(profileCandidate);

  /** Profilo "vero" ricavato dal draft. Va chiamata solo quando step1Valid è true. */
  function buildProfileForCalc(): UserProfile {
    return {
      name: profileDraft.name.trim(),
      avatar: currentProfile.avatar,
      age: Number(profileDraft.age),
      sex: profileDraft.sex,
      height: Number(profileDraft.height),
      weight: Number(profileDraft.weight),
      activity: profileDraft.activity ?? "moderate",
    };
  }

  const goBack = () => {
    if (confirming) return;
    setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : s));
  };

  const goToStep2 = () => {
    if (step1Valid) setStep(2);
  };

  const recomputeReview = () => {
    if (!goal) return;
    const profileForCalc = buildProfileForCalc();
    const breakdown = buildMacroSplit(profileForCalc, goal);
    setMacros(breakdown.split);
    setWeightTarget(String(suggestWeightTarget(profileForCalc.weight, goal)));
  };

  const goToStep3 = () => {
    if (!goal || !experience) return;
    recomputeReview();
    // Preselezione del template in base all'esperienza, solo alla prima visita.
    setTemplateId((current) => current ?? experience);
    setStep(3);
  };

  const goToStep4 = () => setStep(4);

  const displayBreakdown =
    step === 3 && goal ? buildMacroSplit(buildProfileForCalc(), goal) : null;

  const handleConfirm = async () => {
    if (confirming || !templateId || !macros) return;
    const template = PLAN_TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      setConfirmError("Template non trovato. Torna indietro e riprova.");
      return;
    }

    setConfirming(true);
    setConfirmError(null);

    const profile = buildProfileForCalc();
    const goalsPayload: UserGoals = {
      weightTarget: Number(weightTarget) || profile.weight,
      kcalTarget: macros.kcal,
      carbsTarget: macros.carbs,
      proteinTarget: macros.protein,
      fatTarget: macros.fat,
    };

    // Upsert idempotente, fallimento tollerabile: non blocca il salvataggio del profilo.
    await addEntry(todayISO(), profile.weight);

    const res = await completeOnboarding({ profile, goals: goalsPayload, plan: template.plan });

    if (!res.ok) {
      setConfirmError(res.error ?? "Salvataggio non riuscito. Riprova.");
      setConfirming(false);
      return;
    }

    // Navigazione hard, non router.push: serve a far rileggere Supabase a
    // tutti i provider (stesso pattern di login/page.tsx).
    document.cookie = "fitapp_onboarded=1; path=/; max-age=31536000; samesite=lax";
    window.location.assign("/today");
    // niente setConfirming(false): la pagina sta per essere sostituita
  };

  return (
    <main className="min-h-screen bg-[#FAF7F0] px-4 py-8">
      <div className="mx-auto max-w-xl">
        <ProgressBar step={step} />

        <div className="rounded-2xl border border-emerald-900/5 bg-white p-6 shadow-sm">
          {step === 1 && (
            <StepProfile
              draft={profileDraft}
              onChange={(patch) => setProfileDraft((d) => ({ ...d, ...patch }))}
            />
          )}

          {step === 2 && (
            <StepGoalExperience
              goal={goal}
              experience={experience}
              onGoalChange={setGoal}
              onExperienceChange={setExperience}
            />
          )}

          {step === 3 && macros && displayBreakdown && (
            <StepReview
              breakdown={displayBreakdown}
              macros={macros}
              weightTarget={weightTarget}
              onMacrosChange={(patch) => setMacros((m) => (m ? { ...m, ...patch } : m))}
              onWeightTargetChange={setWeightTarget}
              onReset={recomputeReview}
            />
          )}

          {step === 4 && <StepPlan selectedId={templateId} onSelect={setTemplateId} />}

          {confirmError && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700">
              {confirmError}
            </p>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                disabled={confirming}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-900/10 bg-white px-4 py-2.5 text-sm font-bold text-emerald-800/70 transition hover:bg-emerald-50 disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Indietro
              </button>
            ) : (
              <span />
            )}

            {step === 1 && (
              <button type="button" onClick={goToStep2} disabled={!step1Valid} className={navButtonClass}>
                Avanti
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={goToStep3}
                disabled={!goal || !experience}
                className={navButtonClass}
              >
                Avanti
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {step === 3 && (
              <button type="button" onClick={goToStep4} className={navButtonClass}>
                Avanti
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={confirming || !templateId}
                className={navButtonClass}
              >
                {confirming ? (
                  "Salvataggio…"
                ) : (
                  <>
                    Inizia
                    <Check className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
