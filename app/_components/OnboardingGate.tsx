"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../_lib/AuthContext";
import { useUser } from "../today/_lib/UserContext";

/**
 * Fonte di verità dell'onboarding (ONBOARDING_TASK.md, decisione 3).
 * Il middleware fa solo il fast-path sul cookie `fitapp_onboarded`. Qui, con
 * `onboardingCompleted` già in RAM da UserContext (la query su profiles la fa
 * comunque una volta sola), si decide davvero e si ripara il cookie quando è
 * disallineato — il cookie è cache, non verità.
 *
 * Le tre regole anti-loop:
 * - mentre `loading` è true: niente redirect, niente children (scheletro neutro).
 * - il redirect inverso (/onboarding -> /today) vive SOLO qui, mai nel middleware.
 * - se il flag è true ma il cookie manca, si riscrive senza redirect: l'utente
 *   che pulisce i cookie finisce su /onboarding, che al mount si auto-ripara.
 */
export default function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { onboardingCompleted, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  const isLogin = pathname.startsWith("/login");
  const isOnboarding = pathname.startsWith("/onboarding");

  useEffect(() => {
    if (loading || !user || isLogin) return;

    if (!onboardingCompleted) {
      if (!isOnboarding) router.replace("/onboarding");
      return;
    }

    // Da qui: onboardingCompleted === true.
    if (typeof document !== "undefined" && !document.cookie.includes("fitapp_onboarded=1")) {
      document.cookie = "fitapp_onboarded=1; path=/; max-age=31536000; samesite=lax";
    }
    if (isOnboarding) router.replace("/today");
  }, [loading, user, onboardingCompleted, isLogin, isOnboarding, router]);

  if (loading) return <Skeleton />;
  if (!user || isLogin || isOnboarding) return <>{children}</>;
  if (!onboardingCompleted) return <Skeleton />;

  return <>{children}</>;
}

/** Scheletro neutro: niente logo/testo, per non lampeggiare contenuto vero durante il redirect. */
function Skeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF7F0]">
      <div className="h-8 w-8 animate-pulse rounded-full bg-emerald-200" />
    </div>
  );
}
