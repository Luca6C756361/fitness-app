import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

   const { data: { user } } = await supabase.auth.getUser();

  const isLogin = request.nextUrl.pathname.startsWith("/login");

  /** I cookie rinnovati vivono su `response`: un redirect li perderebbe. */
  const redirectTo = (path: string) => {
    const redirect = NextResponse.redirect(new URL(path, request.url));
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));   // <-- LA CHIAVE
    return redirect;
  };

  if (!user && !isLogin) return redirectTo("/login");
  if (user && isLogin) return redirectTo("/today");

  // Fast path onboarding: legge solo il cookie, MAI il DB (costerebbe un
  // round-trip a ogni click, dato che il matcher intercetta ogni navigazione).
  // Fonte di verità vera = OnboardingGate (client, dentro UserProvider).
  if (user) {
    const onboarded = request.cookies.get("fitapp_onboarded")?.value === "1";
    const isOnboarding = request.nextUrl.pathname.startsWith("/onboarding");
    if (!onboarded && !isOnboarding && !isLogin) return redirectTo("/onboarding");
    // NIENTE redirect inverso qui (/onboarding -> /today): è compito esclusivo
    // del gate client, e solo lui sa distinguere "non ancora caricato" da
    // "caricato e completato".
  }

  return response;

}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|sw.js|offline.html|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};