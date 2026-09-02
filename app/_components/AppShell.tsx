"use client";

import { usePathname } from "next/navigation";

/** Applica l'offset della Sidebar solo dove la Sidebar esiste davvero. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/onboarding");

  return <div className={isAuthPage ? "" : "md:pl-56"}>{children}</div>;
}