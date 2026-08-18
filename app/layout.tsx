import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "./today/_lib/UserContext";
import { SettingsProvider } from "./today/_lib/SettingsContext";
import { DiaryProvider } from "./today/_lib/DiaryContext";
import { WeightProvider } from "./today/_lib/WeightContext";
import { PlanProvider } from "./today/_lib/PlanContext";
import { WorkoutSessionProvider } from "./today/_lib/WorkoutSessionContext";
import { AuthProvider } from "./_lib/AuthContext";  
import BottomNav from "./_components/BottomNav";
import Sidebar from "./_components/Sidebar";

export const metadata: Metadata = {
  title: "Fitness App",
  description: "Dashboard fitness e nutrizionale",
};

/**
 * Provider annidati. Ordine:
 * - Settings → tutti
 * - User → tutti
 * - Weight → header, profilo
 * - Diary → today, nutrition, stats
 * - Plan → today, allenamento, scheda editor
 * - WorkoutSession → today, allenamento in corso, stats
 *
 * NOTA: il vecchio WorkoutProvider è stato sostituito da WorkoutSessionProvider.
 * Se qualche componente ancora usa useWorkout(), va aggiornato a useWorkoutSession().
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <AuthProvider>    
          <SettingsProvider>
            <UserProvider>
              <WeightProvider>
                <DiaryProvider>
                  <PlanProvider>
                    <WorkoutSessionProvider>
                      <Sidebar />
                      <div className="md:pl-56">{children}</div>
                      <BottomNav />
                    </WorkoutSessionProvider>
                  </PlanProvider>
                </DiaryProvider>
              </WeightProvider>
            </UserProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
