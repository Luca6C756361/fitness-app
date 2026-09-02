"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardList,
  BarChart3,
  Apple,
  Settings,
} from "lucide-react";

/**
 * BottomNav mobile.
 * Nota: con 6 sezioni totali abbiamo dovuto scegliere quali 5 mettere in barra.
 * "Profilo" resta accessibile via tap sull'avatar nell'header (che apre il menu
 * a tendina).
 */
const items = [
  { href: "/today", label: "Home", icon: Home },
  { href: "/scheda", label: "Scheda", icon: ClipboardList },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/nutrition", label: "Cibo", icon: Apple },
  { href: "/impostazioni", label: "Opzioni", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/login") || pathname.startsWith("/onboarding")) return null;   // <-- NUOVO
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-emerald-900/10 bg-white/95 backdrop-blur-sm md:hidden">
      <div className="mx-auto flex max-w-5xl items-center justify-around px-1 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 transition ${
                active ? "text-emerald-700" : "text-emerald-800/50 hover:text-emerald-700"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-tight">
                {item.label}
              </span>
              {active && (
                <span className="mt-0.5 h-1 w-1 rounded-full bg-emerald-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
